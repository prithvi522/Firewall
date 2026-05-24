const vscode = require('vscode');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const { localScanText } = require('./scanner_fallback');
const { ensureBackendReady, stopBackend } = require('./backend_launcher');

const DEFAULT_BACKEND_URL = 'http://127.0.0.1:5000/api/scan/upload';

function getBackendUrl() {
  return vscode.workspace.getConfiguration('aiPromptFirewall').get('backendUrl', DEFAULT_BACKEND_URL);
}

function getNonce() {
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}

function getFormPayload(text, fileName, mode) {
  const formData = new FormData();
  const buffer = Buffer.from(text, 'utf8');
  formData.append('file', buffer, {
    filename: fileName,
    contentType: 'text/plain',
  });
  formData.append('mode', mode || 'standard');
  return formData;
}

async function scanText(text, fileName, mode, backendUrlOverride) {
  if (!text || !text.trim()) {
    throw new Error('Nothing to scan.');
  }

  const backendUrl = backendUrlOverride || getBackendUrl();
  const formData = getFormPayload(text, fileName, mode);

  try {
    const response = await axios.post(backendUrl, formData, {
      headers: formData.getHeaders(),
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      timeout: 30000,
      validateStatus: () => true,
    });

    if (response.status < 200 || response.status >= 300) {
      const body = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
      console.warn(`Backend returned ${response.status}: ${body}`);
      return localScanText(text, { fileName, mode });
    }

    return response.data;
  } catch (error) {
    if (error.response) {
      const body = typeof error.response.data === 'string' ? error.response.data : JSON.stringify(error.response.data);
      console.warn(`Backend returned ${error.response.status}: ${body}`);
    } else {
      console.warn(`Backend scan unavailable, using local fallback: ${error.message || error}`);
    }

    return localScanText(text, { fileName, mode });
  }
}

function getActiveEditorPayload() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return null;
  }

  const text = editor.document.getText(editor.selection.isEmpty ? undefined : editor.selection);
  return {
    text,
    fileName: path.basename(editor.document.fileName || 'active-document.txt'),
  };
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function escapeText(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function renderPanelHtml(webview, context) {
  const nonce = getNonce();
  const backendUrl = getBackendUrl();
  const initialText = context.initialText || '';
  const initialFileName = context.initialFileName || 'active-document.txt';

  return `<!doctype html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AI Prompt Firewall</title>
    <style>
      :root {
        color-scheme: dark;
        --bg: #07111f;
        --text: #e5eefb;
        --muted: #8fa4c2;
        --line: rgba(138, 164, 192, 0.18);
        --accent: #56d7ff;
        --accent-strong: #8ae3ff;
      }
      body {
        margin: 0;
        background: radial-gradient(circle at top left, rgba(86, 215, 255, 0.12), transparent 35%), var(--bg);
        color: var(--text);
        font-family: Inter, "Segoe UI", sans-serif;
      }
      .shell { padding: 18px; }
      .hero {
        border: 1px solid var(--line);
        border-radius: 18px;
        background: linear-gradient(180deg, rgba(19, 34, 56, 0.98), rgba(13, 23, 41, 0.98));
        padding: 18px;
        box-shadow: 0 24px 60px rgba(0, 0, 0, 0.32);
      }
      h1 { margin: 0 0 8px; font-size: 24px; line-height: 1.1; }
      p { margin: 0 0 14px; color: var(--muted); font-size: 12px; line-height: 1.6; }
      label {
        display: block;
        margin: 12px 0 6px;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--muted);
      }
      textarea, input, select {
        width: 100%;
        box-sizing: border-box;
        border-radius: 12px;
        border: 1px solid var(--line);
        background: #08111d;
        color: var(--text);
        padding: 10px 12px;
        font: inherit;
      }
      textarea { min-height: 160px; resize: vertical; }
      .row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
      .actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 14px; }
      button {
        border: 0;
        border-radius: 999px;
        padding: 10px 14px;
        color: #07111f;
        background: var(--accent);
        font-weight: 700;
        cursor: pointer;
      }
      button.secondary {
        background: transparent;
        color: var(--text);
        border: 1px solid var(--line);
      }
      .output {
        margin-top: 16px;
        border: 1px solid var(--line);
        border-radius: 14px;
        background: rgba(7, 17, 31, 0.72);
        padding: 12px;
      }
      pre {
        margin: 0;
        white-space: pre-wrap;
        word-break: break-word;
        font-size: 12px;
        line-height: 1.5;
      }
      .status { margin-top: 8px; font-size: 12px; color: var(--muted); }
      .pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        border: 1px solid var(--line);
        border-radius: 999px;
        padding: 6px 10px;
        color: var(--muted);
        font-size: 11px;
        margin-bottom: 12px;
      }
      .pill strong { color: var(--accent-strong); }
    </style>
  </head>
  <body>
    <div class="shell">
      <section class="hero">
        <div class="pill">Backend: <strong>${escapeHtml(backendUrl)}</strong></div>
        <h1>AI Prompt Firewall</h1>
        <p>Scan the active file, selected text, or pasted content for prompt injection, encoded payloads, and unsafe instructions.</p>

        <label for="backendUrl">Backend URL</label>
        <input id="backendUrl" type="url" value="${escapeHtml(backendUrl)}" />

        <div class="row">
          <div>
            <label for="mode">Scan mode</label>
            <select id="mode">
              <option value="standard" selected>Standard</option>
              <option value="dual_intent">Dual-intent</option>
            </select>
          </div>
          <div>
            <label for="fileName">File name</label>
            <input id="fileName" type="text" value="${escapeHtml(initialFileName)}" />
          </div>
        </div>

        <label for="textInput">Text to scan</label>
        <textarea id="textInput" placeholder="Paste text here or use the buttons below to load the active editor.">${escapeText(initialText)}</textarea>

        <div class="actions">
          <button id="scanText">Scan pasted text</button>
          <button id="scanActive" class="secondary">Scan active file</button>
          <button id="scanSelection" class="secondary">Scan selection</button>
        </div>

        <div class="status" id="status">Ready.</div>

        <div class="output">
          <pre id="output">No scan run yet.</pre>
        </div>
      </section>
    </div>

    <script nonce="${nonce}">
      const vscode = acquireVsCodeApi();
      const output = document.getElementById('output');
      const status = document.getElementById('status');
      const textInput = document.getElementById('textInput');
      const fileNameInput = document.getElementById('fileName');
      const backendUrlInput = document.getElementById('backendUrl');
      const modeInput = document.getElementById('mode');

      function setStatus(message) {
        status.textContent = message;
      }

      function setOutput(value) {
        output.textContent = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
      }

      function scanFromText(text, fileName) {
        setStatus('Scanning...');
        vscode.postMessage({
          type: 'scan-text',
          text,
          fileName,
          mode: modeInput.value,
          backendUrl: backendUrlInput.value.trim(),
        });
      }

      document.getElementById('scanText').addEventListener('click', () => {
        scanFromText(textInput.value, fileNameInput.value || 'pasted-text.txt');
      });

      document.getElementById('scanActive').addEventListener('click', () => {
        setStatus('Loading active file...');
        vscode.postMessage({ type: 'scan-active', mode: modeInput.value, backendUrl: backendUrlInput.value.trim() });
      });

      document.getElementById('scanSelection').addEventListener('click', () => {
        setStatus('Loading selection...');
        vscode.postMessage({ type: 'scan-selection', mode: modeInput.value, backendUrl: backendUrlInput.value.trim() });
      });

      window.addEventListener('message', (event) => {
        const message = event.data || {};
        if (message.type === 'result') {
          setOutput(message.payload);
          setStatus('Completed. Risk score: ' + (message.payload?.risk_score ?? 'n/a'));
        }
        if (message.type === 'error') {
          setOutput(message.message);
          setStatus('Scan failed.');
        }
        if (message.type === 'prefill') {
          textInput.value = message.text || textInput.value;
          fileNameInput.value = message.fileName || fileNameInput.value;
          setStatus('Loaded active editor text.');
        }
      });

      setOutput({ backendUrl: backendUrlInput.value.trim(), initialFileName: fileNameInput.value, note: 'Use the buttons to run a scan.' });
    </script>
  </body>
  </html>`;
}

function showScannerPanel(context, prefill) {
  const panel = vscode.window.createWebviewPanel(
    'aiPromptFirewallScanner',
    'AI Prompt Firewall',
    vscode.ViewColumn.Beside,
    {
      enableScripts: true,
      retainContextWhenHidden: true,
    }
  );

  panel.webview.html = renderPanelHtml(panel.webview, prefill || {});

  panel.webview.onDidReceiveMessage(async (message) => {
    try {
      if (message.type === 'scan-text') {
        const result = await scanText(message.text || '', message.fileName || 'pasted-text.txt', message.mode, message.backendUrl);
        panel.webview.postMessage({ type: 'result', payload: result });
        return;
      }

      const payload = getActiveEditorPayload();
      if (!payload) {
        throw new Error('Open a file first.');
      }

      panel.webview.postMessage({
        type: 'prefill',
        text: payload.text,
        fileName: payload.fileName,
      });

      if (message.type === 'scan-active' || message.type === 'scan-selection') {
        const result = await scanText(payload.text, payload.fileName, message.mode, message.backendUrl);
        panel.webview.postMessage({ type: 'result', payload: result });
      }
    } catch (error) {
      panel.webview.postMessage({ type: 'error', message: error.message || String(error) });
      vscode.window.showErrorMessage(`AI Prompt Firewall: ${error.message || error}`);
    }
  });

  const payload = getActiveEditorPayload();
  if (payload) {
    panel.webview.postMessage({ type: 'prefill', text: payload.text, fileName: payload.fileName });
  }

  context.subscriptions.push(panel);
}

async function activate(context) {
  ensureBackendReady().catch((error) => {
    console.warn(`AI Prompt Firewall backend bootstrap skipped: ${error.message || error}`);
  });

  const openScanner = vscode.commands.registerCommand('ai-prompt-firewall.openScanner', () => {
    showScannerPanel(context, getActiveEditorPayload() || {});
  });

  const scanFile = vscode.commands.registerCommand('ai-prompt-firewall.scanFile', async () => {
    const payload = getActiveEditorPayload();
    if (!payload) {
      vscode.window.showInformationMessage('Open a file first to scan.');
      return;
    }

    try {
      const result = await scanText(payload.text, payload.fileName, 'standard');
      const level = result.risk_level || 'UNKNOWN';
      const score = typeof result.risk_score === 'number' ? result.risk_score : 'n/a';
      vscode.window.showInformationMessage(`AI Prompt Firewall scan completed: ${level} (${score})`);
      showScannerPanel(context, payload);
      context.globalState.update('aiPromptFirewall.lastScan', result);
    } catch (error) {
      vscode.window.showErrorMessage(`AI Prompt Firewall scan failed: ${error.message || error}`);
    }
  });

  context.subscriptions.push(openScanner, scanFile);
}

function deactivate() {
  stopBackend();
}

module.exports = { activate, deactivate };


