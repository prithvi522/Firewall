const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Try to start the Python backend from the repository backend directory.
const repoRoot = path.resolve(__dirname, '..', '..');
const backendDir = path.join(repoRoot, 'backend');

function findPython() {
  // Prefer a venv inside backend/.venv or ../.venv, fallback to 'python'
  const candidates = [
    path.join(backendDir, '.venv', 'Scripts', 'python.exe'),
    path.join(repoRoot, '.venv', 'Scripts', 'python.exe'),
    // Embedded python (when packaged) — look in app resources or next to this script
    path.join(__dirname, 'python-embed', 'python.exe'),
    path.join(process.resourcesPath || repoRoot, 'python-embed', 'python.exe'),
    'python',
    'python3'
  ];

  for (const p of candidates) {
    try {
      if (p === 'python' || p === 'python3') return p;
      if (fs.existsSync(p)) return p;
    } catch (e) {
      continue;
    }
  }

  return 'python';
}

function startBackend() {
  const python = findPython();
  const args = ['-m', 'uvicorn', 'app.main:app', '--host', '127.0.0.1', '--port', '5000'];

  console.log('Starting backend with', python, args.join(' '));

  const proc = spawn(python, args, {
    cwd: backendDir,
    stdio: 'inherit',
    shell: false,
  });

  proc.on('error', (err) => console.error('Backend process error:', err));
  proc.on('exit', (code, signal) => console.log('Backend exited', code, signal));

  // store on global to keep process alive in renderer lifecycle
  global.__ai_pf_backend_proc = proc;
}

startBackend();
