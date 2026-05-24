# Publisher Handoff

Use this page when you are ready to upload the extensions to the stores.

## Ready Assets

- VS Code package: [packaging/vscode-extension/ai-prompt-firewall-vscode-0.1.0.vsix](../packaging/vscode-extension/ai-prompt-firewall-vscode-0.1.0.vsix)
- Browser package: latest zip in [packaging/browser-extension/dist](../packaging/browser-extension/dist)
- Listing copy: [docs/store-listings.md](store-listings.md)
- Release checklist: [docs/release-checklist.md](release-checklist.md)
- Privacy policy: [packaging/browser-extension/privacy-policy.md](../packaging/browser-extension/privacy-policy.md)

## VS Code Marketplace

- **Title:** AI Prompt Firewall
- **Short description:** Scan the active editor, selected text, or pasted content locally for prompt injection signals.
- **Long description:** Use the VS Code section in [docs/store-listings.md](store-listings.md).
- **Publisher:** `Ps2`
- **Package:** `packaging/vscode-extension/ai-prompt-firewall-vscode-0.1.0.vsix`

## Chrome Web Store / Edge Add-ons

- **Title:** AI Prompt Firewall
- **Short description:** Scan the current page, pasted text, or uploaded files locally for prompt injection signals.
- **Long description:** Use the browser section in [docs/store-listings.md](store-listings.md).
- **Name:** `Ps2 Prompt Firewall`
- **Package:** `packaging/browser-extension/dist/`
- **Permissions:** `activeTab`, `scripting`

## Required Store Fields

- Screenshots from `docs/screenshots/`
- Extension icons from `packaging/browser-extension/icons/`
- Public privacy policy URL: `https://raw.githubusercontent.com/Ps2/ai-prompt-firewall/main/docs/privacy.html` once the repository is public, or your hosted equivalent
- Support/contact email

## Final Checks

1. Confirm the listing copy matches the installed behavior.
2. Confirm screenshots show the current UI.
3. Confirm the privacy policy page is publicly reachable.
4. Upload the packages to the relevant stores.
5. Test the installed extensions in a clean profile.