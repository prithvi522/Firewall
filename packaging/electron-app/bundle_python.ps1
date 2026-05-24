param(
    [string]$Version = "3.12.0",
    [string]$OutDir = "python-embed"
)

$base = "https://www.python.org/ftp/python/$Version"
$zipName = "python-$Version-embed-amd64.zip"
$url = "$base/$zipName"

Write-Host "Downloading $url ..."
$target = Join-Path $PSScriptRoot $zipName
Invoke-WebRequest -Uri $url -OutFile $target -UseBasicParsing

Write-Host "Extracting to $OutDir"
$dest = Join-Path $PSScriptRoot $OutDir
if (!(Test-Path $dest)) { New-Item -ItemType Directory -Path $dest | Out-Null }
Expand-Archive -Path $target -DestinationPath $dest -Force

Write-Host "Cleaning up"
Remove-Item $target

Write-Host "Python embeddable extracted to: $dest"
Write-Host "Include the '$OutDir' folder in your electron-builder 'files' list to bundle it into the installer."
