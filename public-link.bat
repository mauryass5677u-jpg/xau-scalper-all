@echo off
title XAU/USDT Public Link (Cloudflare Tunnel)
echo Starting XAU/USDT terminal if not running...
tasklist /FI "IMAGENAME eq node.exe" | find /I "node.exe" >nul
if %errorlevel% neq 0 (
  start "" /b "C:\Users\vm587\Documents\Default Project\start.bat"
)
echo.
echo ============================================================
echo  Your PUBLIC link appears in the yellow URL below.
echo  Keep this window OPEN - close it = link stops.
echo  This works only while this PC is ON.
echo ============================================================
echo.
cd /d "C:\Users\vm587\Documents\Default Project"
cloudflared.exe tunnel --url http://localhost:8787
pause
