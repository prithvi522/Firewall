# Publishing Guide

This project can be distributed to two public extension stores:

- VS Code Marketplace for the VS Code extension.
- Chrome Web Store and Edge Add-ons for the browser extension.

## Prerequisites

- A real VS Code Marketplace publisher account.
- A Chrome Web Store developer account or Edge Add-ons publisher account.
- A public privacy policy URL.
- Final extension icons and screenshots.
- No backend URL is required for the browser extension because it scans locally.

## Build Commands

### VS Code extension

```powershell
cd packaging/vscode-extension
npm install
npm run package
```

This generates a `.vsix` file that you upload to the VS Code Marketplace.

### Browser extension

```powershell
cd packaging/browser-extension
.\package_extension.ps1
```

This generates a zip file in `packaging/browser-extension/dist/` that you upload to Chrome Web Store or Edge Add-ons.

## Submission Checklist

See [docs/release-checklist.md](docs/release-checklist.md) for the exact release files, screenshots, and package outputs.

### VS Code Marketplace

1. Replace the placeholder publisher in `packaging/vscode-extension/package.json` with your real Marketplace publisher.
2. Build the `.vsix` file.
3. Upload the `.vsix` to the VS Code Marketplace.
4. Add a listing description that explains the extension scans active files, selected text, or pasted text.
5. Include screenshots and the extension icon.
6. Use [docs/store-listings.md](docs/store-listings.md) for suggested listing copy.

### Chrome Web Store / Edge Add-ons

1. Confirm the browser extension name, description, icons, and privacy policy.
2. Build the browser zip package.
3. Upload the zip to Chrome Web Store or Edge Add-ons.
4. Provide the privacy policy URL and screenshots.
5. Confirm the browser extension description and permissions match the local-only experience.
6. Use [docs/store-listings.md](docs/store-listings.md) for suggested listing copy.

## Public Distribution Notes

- The extensions are ready to download once they are approved and published in the respective stores.
- Until then, users can still install them manually from the packaged outputs.
- If you want broader adoption, keep the browser extension local-only and publish a public privacy policy page.
