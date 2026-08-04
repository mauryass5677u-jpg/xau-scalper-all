@echo off
title GOLDEN-500 XAU/USDT Council Terminal - NEW LINK
echo.
echo  ============================================================
echo   GOLDEN-500 COUNCIL TERMINAL  (brand-new, from scratch)
echo   LOCAL LINK:  http://localhost:8797
echo   Keeps running hidden - close nothing, just use the link.
echo  ============================================================
echo.
netstat -ano | findstr ":8797" | findstr "LISTENING" >nul
if %errorlevel% neq 0 (
  cd /d "C:\Users\vm587\Documents\Default Project"
  start "" /b node golden500\server.js
  timeout /t 2 /nobreak >nul
)
start "" http://localhost:8797
echo  Opened http://localhost:8797 in your browser.
timeout /t 60 /nobreak >nul
