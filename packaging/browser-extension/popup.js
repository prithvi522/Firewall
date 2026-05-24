const output = document.getElementById('output');
const textInput = document.getElementById('textInput');
const fileInput = document.getElementById('file');

function localScanText(text, options = {}) {
  return window.AiPromptFirewallFallback?.localScanText(text, options);
}

function setOutput(value) {
  output.textContent = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
}

async function scanBlob(blob, fileName) {
  const text = await blob.text();
  return localScanText(text, { fileName });
}

async function scanPageText() {
  setOutput('Scanning active page...');
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab?.id) {
    throw new Error('No active tab found.');
  }

  const injected = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => document.body?.innerText || document.documentElement?.innerText || '',
  });

  const text = injected?.[0]?.result || '';
  return scanBlob(new Blob([text], { type: 'text/plain' }), 'page.txt');
}

document.getElementById('scanPage').addEventListener('click', async () => {
  try {
    const result = await scanPageText();
    setOutput(result);
  } catch (error) {
    setOutput(`Error: ${error.message}\nNote: the current page must allow script injection.`);
  }
});

document.getElementById('scanText').addEventListener('click', async () => {
  const text = textInput.value || '';
  if (!text.trim()) {
    setOutput('Paste some text first.');
    return;
  }

  setOutput('Scanning pasted text...');
  try {
    const result = await scanBlob(new Blob([text], { type: 'text/plain' }), 'pasted-text.txt');
    setOutput(result);
  } catch (error) {
    setOutput(`Error: ${error.message}`);
  }
});

document.getElementById('scanFile').addEventListener('click', async () => {
  const file = fileInput.files?.[0];
  if (!file) {
    setOutput('Choose a file first.');
    return;
  }

  setOutput('Uploading file...');
  try {
    const result = await scanBlob(file, file.name || 'upload.txt');
    setOutput(result);
  } catch (error) {
    setOutput(`Error: ${error.message}`);
  }
});

document.getElementById('clearOutput').addEventListener('click', () => {
  textInput.value = '';
  fileInput.value = '';
  setOutput('Ready to scan.');
});
