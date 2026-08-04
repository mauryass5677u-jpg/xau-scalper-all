@echo off
title GOLDEN-500 XAU/USDT Council - PUBLIC LINK
echo.
echo  ============================================================
echo   Your PUBLIC link appears in the yellow URL below.
echo   Keep this window OPEN - closing it stops the link.
echo   Works only while this PC is ON.
echo  ============================================================
echo.
netstat -ano | findstr ":8797" | findstr "LISTENING" >nul
if %errorlevel% neq 0 (
  cd /d "C:\Users\vm587\Documents\Default Project"
  start "" /b node golden500\server.js
  timeout /t 2 /nobreak >nul
)
cd /d "C:\Users\vm587\Documents\Default Project"
cloudflared.exe tunnel --url http://localhost:8797
pause
