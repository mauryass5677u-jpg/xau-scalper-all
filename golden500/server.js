'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.G500_PORT || 8797;
const ROOT = __dirname;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml'
};

http.createServer((req, res) => {
  const u = new URL(req.url, 'http://localhost');
  if (u.pathname === '/api/proxy') {
    const target = u.searchParams.get('u') || '';
    const ok = target.startsWith('https://fapi.binance.com/') || target.startsWith('https://query1.finance.yahoo.com/') || target.startsWith('https://api.gold-api.com/');
    if (!ok) { res.writeHead(403); res.end('403'); return; }
    fetch(target, { headers: { 'User-Agent': 'Mozilla/5.0' } })
      .then(async r => {
        res.writeHead(r.status, { 'Content-Type': r.headers.get('content-type') || 'application/json', 'Cache-Control': 'no-store', 'Access-Control-Allow-Origin': '*' });
        res.end(await r.text());
      })
      .catch(() => { res.writeHead(502); res.end('502'); });
    return;
  }
  let p = decodeURIComponent(u.pathname);
  if (p === '/' || p === '') p = '/terminal.html';
  const f = path.normalize(path.join(ROOT, p));
  if (!f.startsWith(ROOT)) { res.writeHead(403); res.end('403'); return; }
  fs.readFile(f, (err, data) => {
    if (err) { res.writeHead(404); res.end('404 not found'); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(f).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(data);
  });
}).listen(PORT, '0.0.0.0', () => {
  console.log('GOLDEN-500 COUNCIL TERMINAL  ->  http://localhost:' + PORT);
});
