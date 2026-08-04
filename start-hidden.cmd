@echo off
rem Starts the XAU/USDT terminal silently at every logon.
rem Skips if the server is already listening on port 8787.
netstat -ano | findstr ":8787" | findstr "LISTENING" >nul
if %errorlevel%==0 exit /b 0
cd /d "C:\Users\vm587\Documents\Default Project"
node server.js
