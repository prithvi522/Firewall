# Release Checklist

Use this checklist to prepare the browser extension and VS Code extension for public download.

## Current Asset Status

- Browser icons exist in `packaging/browser-extension/icons/`.
- Browser screenshots folder `docs/screenshots/` is currently empty.
- VS Code Marketplace publisher is set to `Ps2` in `packaging/vscode-extension/package.json`.
- Browser extension name is set to `Ps2 Prompt Firewall` in `packaging/browser-extension/manifest.json`.
- Browser privacy contact is set to `Ps2domain@gmail.com` in `packaging/browser-extension/privacy-policy.md`.

## Files to Produce

### VS Code extension

- `.vsix` package from `packaging/vscode-extension/`

### Browser extension

- Zip package from `packaging/browser-extension/dist/`

## Required Store Assets

### Screenshots

Create and save these screenshots in `docs/screenshots/`:

- `vscode-home.png`
- `vscode-scan-result.png`
- `browser-popup.png`
- `browser-page-scan.png`
- `browser-file-scan.png`

### Quick Screenshot Plan

Capture each image at a consistent popup size and save it with the exact filename above.

- `vscode-home.png`: show the VS Code scanner before any scan starts.
- `vscode-scan-result.png`: show a completed VS Code scan result.
- `browser-popup.png`: show the browser popup landing state.
- `browser-page-scan.png`: show a browser page scan result.
- `browser-file-scan.png`: show a browser file scan result.

### Icons

- Use `packaging/browser-extension/icons/icon16.png`
- Use `packaging/browser-extension/icons/icon48.png`
- Use `packaging/browser-extension/icons/icon128.png`

If you want matching VS Code branding, reuse the same icon set for the Marketplace listing.

## Build Steps

### VS Code Marketplace package

```powershell
cd packaging/vscode-extension
npm install
npm run package
```

### Browser store package

```powershell
cd packaging/browser-extension
.\package_extension.ps1
```

## Submission Checklist

### VS Code Marketplace

- Confirm the publisher name is correct.
- Upload the generated `.vsix`.
- Add the title, short description, long description, screenshots, and icon.
- Verify the extension command name is clear in the listing.

### Chrome Web Store / Edge Add-ons

- Confirm the extension name, description, and privacy policy URL.
- Upload the generated zip file.
- Add the screenshots and icons.
- Verify the permissions match the local-only experience described in the listing.

## Final Release Order

1. Capture screenshots.
2. Build the VS Code package.
3. Build the browser zip.
4. Upload both packages to their stores.
5. Publish the privacy policy page.
6. Verify the installed extensions work with a clean user account.

## Quick Upload Checklist

### Before upload

- Confirm the VS Code publisher name is correct in `packaging/vscode-extension/package.json`.
- Confirm the browser name, description, and privacy policy text match the local-only flow.
- Confirm `docs/screenshots/` contains all five required images.

### Upload order

1. Upload the VS Code `.vsix` to Marketplace.
2. Upload the browser zip to Chrome Web Store or Edge Add-ons.
3. Add screenshots, icons, and privacy policy links.
4. Publish the privacy policy page.
5. Install both extensions in a clean profile and verify startup behavior.
