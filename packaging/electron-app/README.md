AI Prompt Firewall — Electron Desktop (scaffold)
------------------------------------------------

This folder contains a minimal Electron scaffold that loads the frontend dev server during development.

Dev:

1. From the repository root, ensure frontend dev server is running:
   - `cd frontend && npm install && npm run dev`
2. Start Electron:
   - `cd packaging/electron-app && npm install && npm start`

Packaging:
- Use `electron-builder` or similar to create platform installers. Configure accordingly.

Packaging (Windows example):

1. Install dev deps in the electron app folder:

```bash
cd packaging/electron-app
npm install --production=false
```

2. Make sure you have a Windows Python distribution to include:
   - Option A (recommended): use the official Python embeddable zip for Windows and include it in your installer assets.
   - Option B: ship an installer that downloads Python at install time (requires network access).

3. Run electron-builder to create an installer:

```bash
npm run dist
```

Notes:
- The `backend_launcher.js` attempts to use a local `backend/.venv` or repo `.venv` Python. For a distributable app, include a bundled Python runtime and configure the launcher to point to the embedded interpreter.
- Packaging a portable Python runtime into your installer makes the app self-contained and avoids requiring users to install Python separately.
 
Embedding Python into the installer (recommended for Windows):

1. Run the helper to download/extract the embeddable Windows Python into the electron app folder:

```powershell
cd packaging/electron-app
./bundle_python.ps1 -Version "3.12.0"
```

2. Ensure `package.json` `build.files` includes the `python-embed` folder (it does by default in this scaffold). When you run `npm run dist`, the `python-embed` directory will be included in the installer.

3. Update `backend_launcher.js` if you change the embedded folder name or Python executable location.
