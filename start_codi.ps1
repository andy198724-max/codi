#Requires -Version 5.1
Write-Host "=== Starting CODI Stack ===" -ForegroundColor Cyan

$CodiDir = Split-Path -Parent $PSScriptRoot
$CoreDir = Join-Path $CodiDir "codi-core"
$StudioDir = Join-Path $CodiDir "codi-studio"

Write-Host "[1/2] Starting API server..." -ForegroundColor Yellow
$env:PYTHONPATH = $CoreDir
Start-Process -NoNewWindow -FilePath "python" -ArgumentList "-u $CoreDir\start_api_server.py"

Start-Sleep 8

Write-Host "[2/2] Starting CODI Studio..." -ForegroundColor Yellow
Start-Process -NoNewWindow -FilePath "npm" -ArgumentList "run tauri dev" -WorkingDirectory $StudioDir

Write-Host "=== CODI Stack Started ===" -ForegroundColor Green
Write-Host "API: http://127.0.0.1:11435" -ForegroundColor Green
Write-Host "Studio: http://localhost:1420" -ForegroundColor Green
