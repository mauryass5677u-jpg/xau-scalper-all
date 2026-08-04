$ErrorActionPreference='SilentlyContinue'
$dir='C:\Users\vm587\Documents\Default Project'
$port=8000
$log='C:\Users\vm587\AppData\Local\Temp\opencode\serve_watch.log'
$node=(Get-Command node -ErrorAction SilentlyContinue).Source
if(-not $node){ $node='node' }
Add-Content -LiteralPath $log -Value ('['+(Get-Date -Format 'HH:mm:ss')+'] watchdog started')
$loop=0
while($true){
  $loop++
  $listening = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
  if(-not $listening){
    Add-Content -LiteralPath $log -Value ('['+(Get-Date -Format 'HH:mm:ss')+'] port down, starting node (loop '+$loop+')')
    Start-Process -FilePath $node -ArgumentList 'static-server.js' -WorkingDirectory $dir -WindowStyle Hidden
    Start-Sleep -Seconds 4
  }
  Start-Sleep -Seconds 20
}
