'use strict';

// ============================================================================
// XAU/USDT TERMINAL WATCHDOG — keeps the terminal alive 24/7
// - Starts automatically at Windows login (via HKCU Run key)
// - Checks the terminal every 15s; restarts it if it dies or crashes
// - Frees the port from stale/zombie processes before restarting
// ============================================================================

const http = require('http');
const { spawn, execSync } = require('child_process');
const path = require('path');

const SERVER = path.join(__dirname, 'server.js');
const PORT = 8787;
const CHECK_MS = 15000;
let logBuf = [];

function log(msg) {
  logBuf.push('[' + new Date().toLocaleTimeString() + '] ' + msg);
  if (logBuf.length > 200) logBuf.shift();
  try { require('fs').appendFileSync(path.join(__dirname, 'watchdog.log'), '[' + new Date().toISOString() + '] ' + msg + '\n'); } catch (e) {}
}

function isUp() {
  return new Promise((resolve) => {
    const req = http.get({ host: '127.0.0.1', port: PORT, path: '/', timeout: 3000 }, (res) => { res.resume(); resolve(true); });
    req.on('error', () => resolve(false));
    req.on('timeout', () => { req.destroy(); resolve(false); });
  });
}

function freePort() {
  try {
    const out = execSync('netstat -ano', { encoding: 'utf8', windowsHide: true, timeout: 8000 });
    const pids = new Set();
    const re = new RegExp('[.:]' + PORT + '\\s+[^\\s]+\\s+LISTENING\\s+(\\d+)\\s*$');
    for (const line of out.split(/\r?\n/)) {
      const m = line.match(re);
      if (m) pids.add(m[1]);
    }
    for (const pid of pids) {
      try { process.kill(+pid); log('killed stale process ' + pid + ' on port ' + PORT); } catch (e) {}
    }
  } catch (e) { log('freePort: ' + e.message); }
}

function startServer() {
  freePort();
  const child = spawn(process.execPath, [SERVER], { cwd: __dirname, detached: true, stdio: 'ignore', windowsHide: true });
  child.unref();
  child.on('error', (e) => log('spawn error: ' + e.message));
  log('starting XAU/USDT terminal (pid ' + child.pid + ')');
}

(async function loop() {
  log('watchdog online — monitoring http://localhost:' + PORT);
  for (;;) {
    try {
      const up = await isUp();
      if (!up) startServer();
    } catch (e) { log('loop error: ' + e.message); }
    await new Promise((r) => setTimeout(r, CHECK_MS));
  }
})();
