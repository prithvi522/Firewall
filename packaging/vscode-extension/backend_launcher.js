const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

const repoRoot = path.resolve(__dirname, '..', '..');
const backendDir = path.join(repoRoot, 'backend');
const requirementsPath = path.join(backendDir, 'requirements.txt');
const venvDir = path.join(backendDir, '.venv');
const stampPath = path.join(venvDir, '.ai-prompt-firewall-deps.json');

let bootstrapPromise = null;
let backendProcess = null;

function venvPythonPath() {
  return os.platform() === 'win32'
    ? path.join(venvDir, 'Scripts', 'python.exe')
    : path.join(venvDir, 'bin', 'python');
}

function resolvePythonCandidates() {
  return [
    { command: venvPythonPath(), args: [] },
    { command: path.join(repoRoot, '.venv', 'Scripts', 'python.exe'), args: [] },
    { command: 'py', args: ['-3'] },
    { command: 'python', args: [] },
    { command: 'python3', args: [] },
  ];
}

function runProcess(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, { shell: false, ...options });
    let stdout = '';
    let stderr = '';

    proc.stdout?.on('data', (chunk) => { stdout += chunk.toString(); });
    proc.stderr?.on('data', (chunk) => { stderr += chunk.toString(); });
    proc.on('error', reject);
    proc.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        reject(new Error(stderr || stdout || `Command failed: ${command} ${args.join(' ')}`));
      }
    });
  });
}

async function resolvePython() {
  for (const candidate of resolvePythonCandidates()) {
    try {
      if (candidate.command === 'python' || candidate.command === 'python3') {
        await runProcess(candidate.command, [...candidate.args, '-c', 'import sys; print(sys.version)']);
        return candidate;
      }

      if (candidate.command === 'py') {
        await runProcess(candidate.command, [...candidate.args, '-c', 'import sys; print(sys.version)']);
        return candidate;
      }

      if (fs.existsSync(candidate.command)) {
        return candidate;
      }
    } catch {
      continue;
    }
  }

  return null;
}

function readStamp() {
  try {
    return JSON.parse(fs.readFileSync(stampPath, 'utf8'));
  } catch {
    return null;
  }
}

function writeStamp() {
  try {
    const payload = {
      requirementsMtimeMs: fs.statSync(requirementsPath).mtimeMs,
      updatedAt: new Date().toISOString(),
    };
    fs.writeFileSync(stampPath, JSON.stringify(payload, null, 2), 'utf8');
  } catch (error) {
    console.error('Failed to write dependency stamp', error);
  }
}

async function ensureDependencies(python) {
  const requirementsMtimeMs = fs.statSync(requirementsPath).mtimeMs;
  const stamp = readStamp();

  if (stamp && stamp.requirementsMtimeMs === requirementsMtimeMs && fs.existsSync(venvPythonPath())) {
    return venvPythonPath();
  }

  if (!fs.existsSync(venvDir)) {
    console.log('Creating backend virtual environment...');
    await runProcess(python.command, [...python.args, '-m', 'venv', venvDir], { cwd: backendDir });
  }

  const venvPython = venvPythonPath();
  if (!fs.existsSync(venvPython)) {
    throw new Error(`Virtual environment Python not found at ${venvPython}`);
  }

  console.log('Installing backend dependencies...');
  await runProcess(venvPython, ['-m', 'pip', 'install', '--upgrade', 'pip'], { cwd: backendDir });
  await runProcess(venvPython, ['-m', 'pip', 'install', '-r', requirementsPath], { cwd: backendDir });
  writeStamp();
  return venvPython;
}

function startBackend() {
  return resolvePython()
    .then((python) => {
      if (!python) {
        console.warn('No Python runtime found; offline fallback will stay active.');
        return null;
      }

      return ensureDependencies(python)
        .then((venvPython) => {
          const args = ['-m', 'uvicorn', 'app.main:app', '--host', '127.0.0.1', '--port', '5000'];
          console.log('VSCode extension starting backend with', venvPython, args.join(' '));
          backendProcess = spawn(venvPython, args, { cwd: backendDir, stdio: 'pipe', shell: false });

          backendProcess.stdout?.on('data', (d) => console.log(`[backend] ${d.toString()}`));
          backendProcess.stderr?.on('data', (d) => console.error(`[backend] ${d.toString()}`));
          backendProcess.on('exit', (code, signal) => console.log('Backend exited', code, signal));

          global.__ai_pf_vscode_backend = backendProcess;
          return backendProcess;
        })
        .catch((error) => {
          console.error('Backend bootstrap failed:', error);
          return null;
        });
    })
    .catch((error) => {
      console.error('Failed to resolve Python runtime:', error);
      return null;
    });
}

function ensureBackendReady() {
  if (!bootstrapPromise) {
    bootstrapPromise = startBackend();
  }

  return bootstrapPromise;
}

function stopBackend() {
  const p = backendProcess || global.__ai_pf_vscode_backend;
  if (p && !p.killed) {
    try { p.kill(); } catch (e) { console.error('Failed to stop backend', e); }
  }
}

module.exports = { ensureBackendReady, stopBackend };
