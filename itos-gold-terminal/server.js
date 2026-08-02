/* =====================================================================
   ITOS GOLD TERMINAL - Static server + CORS proxy
   Institutional AI Trading Operating System for XAU/USDT (Binance Futures)
   Port: 8791 (fresh, no conflict with existing 8787)
   ===================================================================== */
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8791;
const ROOT = __dirname;

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

function proxyRequest(urlStr, res, redirects) {
  let u;
  try { u = new URL(urlStr); } catch (e) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'bad url' }));
    return;
  }
  const lib = u.protocol === 'https:' ? https : http;
  const req = lib.get(u, { headers: { 'User-Agent': UA, 'Accept': 'application/json,text/plain,*/*', 'Referer': u.origin } }, (up) => {
    if ([301, 302, 303, 307, 308].includes(up.statusCode) && up.headers.location && redirects < 5) {
      up.resume();
      proxyRequest(new URL(up.headers.location, u).toString(), res, redirects + 1);
      return;
    }
    res.writeHead(up.statusCode, {
      'Content-Type': (up.headers['content-type'] || 'application/json').split(';')[0] + '; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-store',
    });
    up.pipe(res);
  });
  req.on('error', (e) => {
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: e.message }));
  });
  req.setTimeout(15000, () => req.destroy(new Error('timeout')));
}

const server = http.createServer((req, res) => {
  let url;
  try { url = new URL(req.url, `http://${req.headers.host || 'localhost'}`); } catch (e) { res.writeHead(400); res.end(); return; }

  if (url.pathname === '/api/proxy') {
    const target = url.searchParams.get('url');
    if (!target) { res.writeHead(400, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ error: 'no url' })); return; }
    proxyRequest(target, res, 0);
    return;
  }
  if (url.pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, service: 'ITOS GOLD TERMINAL', port: PORT, time: new Date().toISOString() }));
    return;
  }

  let p = url.pathname;
  if (p === '/' || p === '') p = '/index.html';
  const file = path.normalize(path.join(ROOT, decodeURIComponent(p)));
  if (!file.startsWith(ROOT)) { res.writeHead(403); res.end('Forbidden'); return; }
  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found: ' + p);
      return;
    }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log('');
  console.log('  ===================================================');
  console.log('   ITOS GOLD TERMINAL  (Institutional AI Trading OS)');
  console.log('   XAU/USDT Binance Perpetual Futures');
  console.log(`   OPEN:  http://localhost:${PORT}`);
  console.log('  ===================================================');
  console.log('');
});
