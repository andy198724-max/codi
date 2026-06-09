# Unified CODI start script (PowerShell)
# Starts codi-core API server, optionally codi-studio

$CodiRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$StudioDir = Join-Path (Split-Path -Parent $CodiRoot) "codi-studio"

Write-Host "=== CODI Launcher ==="
Write-Host "Core:   $CodiRoot"
Write-Host "Studio: $(if (Test-Path $StudioDir) { $StudioDir } else { 'not found' })"
Write-Host ""

Write-Host "[*] Starting CODI Core API server..."
$coreJob = Start-Job -ScriptBlock {
    param($dir)
    Set-Location $dir
    python inference/server.py
} -ArgumentList $CodiRoot

Write-Host "[*] Core PID: $($coreJob.Id) (port 11435)"

if (Test-Path $StudioDir) {
    Write-Host "[*] Starting CODI Studio..."
    $studioJob = Start-Job -ScriptBlock {
        param($dir)
        Set-Location $dir
        npm run tauri dev
    } -ArgumentList $StudioDir
    Write-Host "[*] Studio started"
}

Write-Host ""
Write-Host "[✓] CODI is running"
Write-Host "    API:  http://localhost:11435"
Write-Host "    Docs: http://localhost:11435/docs"
Write-Host ""
Write-Host "Press any key to stop all services."
Write-Host ""

$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Stop-Job $coreJob
Remove-Job $coreJob
if (Test-Path $StudioDir) {
    Stop-Job $studioJob
    Remove-Job $studioJob
}
Write-Host "[*] All services stopped."
