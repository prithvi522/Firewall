<#
Simple packager for the browser extension folder.
Usage: run from the `packaging/browser-extension` folder in PowerShell:
  ./package_extension.ps1
Outputs: ./dist/ai-prompt-firewall-extension.zip
#>

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $root
$dist = Join-Path $root 'dist'
if (-Not (Test-Path $dist)) { New-Item -ItemType Directory -Path $dist | Out-Null }
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$zipName = "ai-prompt-firewall-extension-$timestamp.zip"
$zipPath = Join-Path $dist $zipName

Write-Host "Packaging extension into $zipPath"

# Remove any existing zip with same name
if (Test-Path $zipPath) { Remove-Item $zipPath }

# Use Compress-Archive to package all visible files and folders
Get-ChildItem -Path $root -Exclude dist | 
    Where-Object { $_.Name -ne '.git' } | 
    ForEach-Object { $_.FullName } |
    Compress-Archive -DestinationPath $zipPath -Update

Write-Host "Done. Package created: $zipPath"
