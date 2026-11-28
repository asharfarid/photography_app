@echo off
rem weshoot - the one local launcher. Never deployed.
rem Starts app_v1\server.py at http://localhost:8000.
rem Keep this window open; Ctrl+C or close it to stop.

setlocal
title weshoot
cd /d "%~dp0app_v1"

rem One-time check: the image libraries must exist before the server starts.
python -c "import PIL, pillow_heif, rawpy" >nul 2>&1
if errorlevel 1 (
    echo.
    echo   Installing server requirements ^(one time^)...
    python -m pip install -r requirements.txt
)

echo.
echo   weshoot  -^>  http://localhost:8000
echo   Ctrl+C to stop
echo.

rem open the browser once the server has had a moment to start
start "" /min cmd /c "timeout /t 2 >nul & start http://localhost:8000"

python server.py

echo.
pause
