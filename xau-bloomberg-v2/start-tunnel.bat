@echo off
REM ============================================================
REM  XAU/USDT OMNISCIENT SCALPER TERMINAL v12.0
REM  Starts local server + Cloudflare tunnel -> UNIVERSAL LINK
REM  Open the printed https:// URL on ANY device in the world.
REM ============================================================
title XAU/USDT SCALPER TERMINAL v12.0
cd /d "%~dp0"

echo.
echo  [1/2] Starting local server on port 8080 ...
start "XAU-SCALP-SERVER" /min cmd /c "node serve.js 8080"
timeout /t 2 /nobreak >nul

echo  [2/2] Connecting to Cloudflare (universal link) ...
echo  NOTE: Keep this window OPEN. Searching for your universal URL below...
echo.

cloudflared.exe tunnel --no-autoupdate --url http://localhost:8080 2>&1 | findstr /i "trycloudflare.com"

echo.
echo  -------------------------------------------------------------------
echo   ^>>> OPEN THIS URL ON ANY DEVICE:  (scroll up if not shown)
echo       https://xxxx.trycloudflare.com
echo   (if blank above, close this window and run start-tunnel.bat again)
echo  -------------------------------------------------------------------
pause
