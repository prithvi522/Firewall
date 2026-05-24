Place extension icon files here before packaging:
- `icon16.png`  (16x16)
- `icon48.png`  (48x48)
- `icon128.png` (128x128)

Use PNGs with transparent background. For Chrome Web Store use 128x128 as the primary listed icon.

If you don't have icons, run `create_polished_icons.ps1` from the `packaging/browser-extension` folder to generate simple polished PNGs:

```powershell
cd packaging/browser-extension
./create_polished_icons.ps1
```

Replace the generated files with branded PNGs before publishing.
