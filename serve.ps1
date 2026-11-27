# weshoot - local development server
# Starts app_v1\server.py at http://localhost:8000
# Keep this window open; Ctrl+C or close it to stop.
# This launcher is local convenience only - it is never deployed.

Set-Location (Join-Path $PSScriptRoot 'app_v1')

# One-time check: the image libraries must exist before the server can start.
python -c "import PIL, pillow_heif, rawpy" 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "  Installing server requirements (one time)..."
    python -m pip install -r requirements.txt
}

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

python server.py
