<#
Generates placeholder PNG icons from embedded base64 strings.
Run this in PowerShell from the `packaging/browser-extension` folder:

  ./generate_icons.ps1

This will write `icons/icon16.png`, `icons/icon48.png`, and `icons/icon128.png`.
#>

$icons = @{
  'icons\\icon16.png'  = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII='
  'icons\\icon48.png'  = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII='
  'icons\\icon128.png' = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII='
}

Write-Host "Generating placeholder PNG icons..."
foreach ($path in $icons.Keys) {
  $b64 = $icons[$path]
  $bytes = [System.Convert]::FromBase64String($b64)
  $full = Join-Path (Split-Path -Parent $MyInvocation.MyCommand.Definition) $path
  $dir = Split-Path -Parent $full
  if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir | Out-Null }
  [System.IO.File]::WriteAllBytes($full, $bytes)
  Write-Host "Wrote $path"
}
Write-Host "Done. Replace these with your polished PNGs before publishing."
