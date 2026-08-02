@echo off
title ITOS GOLD TERMINAL - XAU/USDT
cd /d "%~dp0"
start "" cmd /k "node server.js"
timeout /t 2 >nul
start "" "http://localhost:8791"
echo.
echo   ITOS GOLD TERMINAL running at:  http://localhost:8791
echo   (Server window shows live requests. Close it to stop.)
pause >nul
