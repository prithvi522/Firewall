VS Code extension
-----------------

This package exposes two commands:

- `AI Prompt Firewall: Open Scanner` opens a webview where you can scan pasted text, the active file, or the current selection.
- `AI Prompt Firewall: Scan Active File` runs a direct scan and opens the scanner with the result.

The extension automatically creates a local Python virtual environment, installs backend dependencies, and starts the bundled FastAPI service on first run.

To use it locally:

1. Open this folder in VS Code as an extension workspace.
2. Run `AI Prompt Firewall: Open Scanner` from the command palette.

The extension uploads text directly from the editor or webview, so it does not need a temp-file roundtrip.

Packaging:

```powershell
cd packaging/vscode-extension
npm install
npm run package
```

That produces a `.vsix` file you can upload to the VS Code Marketplace once you replace the placeholder publisher with your own account.
