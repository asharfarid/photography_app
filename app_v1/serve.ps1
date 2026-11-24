# weshoot - local development server
# Serves app_v1\main at http://localhost:8000
# Keep this window open; Ctrl+C or close it to stop.

Set-Location (Join-Path $PSScriptRoot 'main')

Write-Host ""
Write-Host "  weshoot  ->  http://localhost:8000"
Write-Host "  Ctrl+C to stop"
Write-Host ""

# opens the browser once the server has had a moment to start
Start-Process powershell -WindowStyle Hidden -ArgumentList @(
    '-NoProfile',
    '-Command',
    'Start-Sleep -Seconds 2; Start-Process "http://localhost:8000"'
)

python -m http.server 8000
