<#
Create polished PNG icons using System.Drawing.
Generates icons/icon16.png, icon48.png, icon128.png with a colored background and white 'AF' initials.
Run from the repo root or the packaging/browser-extension folder:

  cd packaging/browser-extension
  ./create_polished_icons.ps1

Requires PowerShell on Windows with .NET available (Windows PowerShell or PowerShell Core on Windows).
#>

[void][System.Reflection.Assembly]::LoadWithPartialName('System.Drawing')

$sizes = @(16,48,128)
foreach ($size in $sizes) {
  $bmp = New-Object System.Drawing.Bitmap $size, $size
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

  # Draw gradient rounded background
  $rect = New-Object System.Drawing.RectangleF(0,0,$size,$size)
  $g.Clear([System.Drawing.Color]::Transparent)
  $lgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, ([System.Drawing.Color]::FromArgb(3,105,161)), ([System.Drawing.Color]::FromArgb(14,165,233)), 45)
  $radius = [int]($size * 0.18)
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $path.AddArc(0,0,$radius*2,$radius*2,180,90)
  $path.AddArc($size-$radius*2,0,$radius*2,$radius*2,270,90)
  $path.AddArc($size-$radius*2,$size-$radius*2,$radius*2,$radius*2,0,90)
  $path.AddArc(0,$size-$radius*2,$radius*2,$radius*2,90,90)
  $path.CloseFigure()
  $g.FillPath($lgBrush, $path)

  # Draw shield emblem (simple polygon)
  $shieldBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255,255,255))
  $pen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255,255,255))
  $cx = $size/2
  $cy = $size/2
  $w = $size * 0.5
  $h = $size * 0.55
  $left = $cx - $w/2
  $top = $cy - $h/2
  $points = @()
  $points += New-Object System.Drawing.PointF -ArgumentList ([float]$cx), ([float]$top)
  $points += New-Object System.Drawing.PointF -ArgumentList ([float]($left + $w)), ([float]($top + ($h*0.25)))
  $points += New-Object System.Drawing.PointF -ArgumentList ([float]($left + $w*0.85)), ([float]($top + $h))
  $points += New-Object System.Drawing.PointF -ArgumentList ([float]($left + $w*0.15)), ([float]($top + $h))
  $points += New-Object System.Drawing.PointF -ArgumentList ([float]$left), ([float]($top + ($h*0.25)))
  # Draw white shield with slight transparency for larger sizes
  $alpha = if ($size -ge 48) { 230 } else { 255 }
  $shieldBrush.Color = [System.Drawing.Color]::FromArgb($alpha, 255,255,255)
  $g.FillPolygon($shieldBrush, $points)

  # Draw AF initials centered, use bold font
  $fontSize = switch ($size) { 16 {9} 48 {20} 128 {46} Default {24} }
  $font = New-Object System.Drawing.Font('Segoe UI', $fontSize, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
  $textBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(3,105,161))
  $sf = New-Object System.Drawing.StringFormat
  $sf.Alignment = [System.Drawing.StringAlignment]::Center
  $sf.LineAlignment = [System.Drawing.StringAlignment]::Center
  $textRect = New-Object System.Drawing.RectangleF -ArgumentList ([float]0), ([float]($size*0.1)), ([float]$size), ([float]$size)
  $g.DrawString('AF', $font, $textBrush, $textRect, $sf)

  $outPath = Join-Path (Split-Path -Parent $MyInvocation.MyCommand.Definition) "icons\icon$size.png"
  $dir = Split-Path -Parent $outPath
  if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir | Out-Null }
  $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)

  $lgBrush.Dispose()
  $shieldBrush.Dispose()
  $pen.Dispose()
  $g.Dispose()
  $bmp.Dispose()
  Write-Host "Wrote $outPath"
}

Write-Host "Polished icons created. Replace with your branded icons if desired."
