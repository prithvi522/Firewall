Browser extension
-----------------

This popup scans the current page, pasted text, or an uploaded file locally with no backend setup.

Packaging and publishing
1. Keep the icons in `icons/` up to date.
2. Update `manifest.json` if you change the extension name or permissions.
3. Build the zip package on Windows with:

```powershell
cd packaging/browser-extension
.\package_extension.ps1
```

4. Submit the resulting zip to Chrome Web Store or Edge Add-ons, and include a public privacy policy URL.

Security
- The popup only scans content when you click a scan button.
- No network backend is required for normal use.
