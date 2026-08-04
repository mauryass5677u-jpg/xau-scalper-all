$ErrorActionPreference='SilentlyContinue'
$port=8000
$listening = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
if(-not $listening){
  $args = '-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "C:\Users\vm587\Documents\Default Project\serve.ps1"'
  Start-Process -FilePath 'powershell' -ArgumentList $args -WindowStyle Hidden
}
