const http=require('http');
const fs=require('fs');
const path=require('path');
const root=__dirname;
const mime={'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.ico':'image/x-icon','.svg':'image/svg+xml'};
http.createServer((req,res)=>{
  let p=decodeURIComponent((req.url||'/').split('?')[0]);
  if(p==='/'||p==='')p='/xau-omniscient-scalper-v12.html';
  const f=path.join(root,path.normalize(p));
  if(!f.startsWith(root)){res.writeHead(403);res.end('403');return;}
  fs.readFile(f,(e,d)=>{
    if(e){res.writeHead(404);res.end('404 Not Found');return;}
    res.writeHead(200,{'Content-Type':mime[path.extname(f).toLowerCase()]||'application/octet-stream','Cache-Control':'no-store'});
    res.end(d);
  });
}).listen(8000,'0.0.0.0',()=>console.log('XAU terminal server on :8000'));
