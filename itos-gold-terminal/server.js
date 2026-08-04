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

const LOG = path.join(ROOT, 'server.log');
function logFile(msg) {
  try { fs.appendFileSync(LOG, new Date().toISOString() + '  ' + msg + '\n'); } catch (e) {}
}
logFile('--- server started (pid ' + process.pid + ') ---');

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

function safeRespond(res, status, body, headers) {
  try {
    if (res.writableEnded || res.destroyed) return;
    res.writeHead(status, headers || { 'Content-Type': 'application/json' });
    res.end(body);
  } catch (e) { /* client gone */ }
}

function proxyRequest(urlStr, res, redirects) {
  let u;
  try { u = new URL(urlStr); } catch (e) {
    safeRespond(res, 400, JSON.stringify({ error: 'bad url' }));
    return;
  }
  const lib = u.protocol === 'https:' ? https : http;
  let req;
  try {
    req = lib.get(u, { headers: { 'User-Agent': UA, 'Accept': 'application/json,text/plain,*/*', 'Referer': u.origin } }, (up) => {
      if ([301, 302, 303, 307, 308].includes(up.statusCode) && up.headers.location && redirects < 5) {
        up.resume();
        proxyRequest(new URL(up.headers.location, u).toString(), res, redirects + 1);
        return;
      }
      const ctype = (up.headers['content-type'] || 'application/json').split(';')[0] + '; charset=utf-8';
      up.on('error', () => {});
      try {
        if (res.writableEnded || res.destroyed) { up.resume(); return; }
        res.writeHead(up.statusCode, { 'Content-Type': ctype, 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store' });
        up.pipe(res);
      } catch (e) { up.resume(); }
    });
  } catch (e) {
    safeRespond(res, 502, JSON.stringify({ error: e.message }));
    return;
  }
  req.on('error', (e) => {
    safeRespond(res, 502, JSON.stringify({ error: e.message }));
  });
  res.on('close', () => { try { req.destroy(); } catch (e) {} });
  req.setTimeout(15000, () => { try { req.destroy(new Error('upstream timeout')); } catch (e) {} });
}

const server = http.createServer((req, res) => {
  try {
    let url;
    try { url = new URL(req.url, `http://${req.headers.host || 'localhost'}`); } catch (e) { safeRespond(res, 400, 'bad request'); return; }

    if (url.pathname === '/api/proxy') {
      const target = url.searchParams.get('url');
      if (!target) { safeRespond(res, 400, JSON.stringify({ error: 'no url' })); return; }
      proxyRequest(target, res, 0);
      return;
    }
    if (url.pathname === '/api/health') {
      safeRespond(res, 200, JSON.stringify({ ok: true, service: 'ITOS GOLD TERMINAL', port: PORT, time: new Date().toISOString() }), { 'Content-Type': 'application/json' });
      return;
    }

    let p = url.pathname;
    if (p === '/' || p === '') p = '/index.html';
    const file = path.normalize(path.join(ROOT, decodeURIComponent(p)));
    if (!file.startsWith(ROOT)) { safeRespond(res, 403, 'Forbidden', { 'Content-Type': 'text/plain' }); return; }
    fs.readFile(file, (err, data) => {
      if (err) { safeRespond(res, 404, 'Not found: ' + p, { 'Content-Type': 'text/plain' }); return; }
      try {
        if (res.writableEnded || res.destroyed) return;
        res.writeHead(200, { 'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
        res.end(data);
      } catch (e) {}
    });
  } catch (e) {
    safeRespond(res, 500, JSON.stringify({ error: e.message }));
  }
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
server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.log(`  Port ${PORT} already in use — terminal already running.`);
    console.log(`  OPEN:  http://localhost:${PORT}`);
    logFile('port in use, exiting');
    process.exit(0);
  }
  console.error('[server] listen error:', e.message);
  logFile('listen error: ' + e.message);
});

process.on('uncaughtException', (e) => {
  console.error('[server] uncaught:', (e && e.stack) || e);
  logFile('UNCAUGHT: ' + ((e && e.stack) || e));
});
process.on('unhandledRejection', (e) => {
  console.error('[server] unhandled:', (e && e.message) || e);
  logFile('UNHANDLED: ' + ((e && e.stack) || e));
});
process.on('exit', (code) => logFile('server exit code=' + code));
