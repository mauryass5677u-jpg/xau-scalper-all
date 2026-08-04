// browser-probe.js — CDP-driven headless browser verification (no dump-dom, no virtual time)
// usage: node browser-probe.js [pageTitle] [waitSeconds]
const http = require('http');
const net = require('net');
const crypto = require('crypto');

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let body = '';
      res.on('data', (c) => (body += c));
      res.on('end', () => { try { resolve(JSON.parse(body)); } catch (e) { reject(e); } });
    }).on('error', reject);
  });
}

function wsConnect(wsUrl) {
  return new Promise((resolve, reject) => {
    const u = new URL(wsUrl);
    const sock = net.connect(Number(u.port) || 80, u.hostname, () => {
      const key = crypto.randomBytes(16).toString('base64');
      sock.write(
        'GET ' + u.pathname + ' HTTP/1.1\r\nHost: ' + u.host + '\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: ' + key + '\r\nSec-WebSocket-Version: 13\r\n\r\n'
      );
    });
    let buf = Buffer.alloc(0), opened = false, pending = new Map(), nextId = 1;
    const api = {
      send(method, params) {
        return new Promise((res, rej) => {
          const id = nextId++;
          pending.set(id, { res, rej });
          const payload = Buffer.from(JSON.stringify({ id, method, params: params || {} }));
          let h;
          if (payload.length < 126) h = Buffer.from([0x81, 0x80 | payload.length]);
          else { h = Buffer.alloc(4); h[0] = 0x81; h[1] = 0x80 | 126; h.writeUInt16BE(payload.length, 2); }
          const mask = crypto.randomBytes(4);
          const masked = Buffer.from(payload);
          for (let i = 0; i < masked.length; i++) masked[i] ^= mask[i % 4];
          sock.write(Buffer.concat([h, mask, masked]));
        });
      },
    };
    sock.on('data', (chunk) => {
      if (!opened) {
        buf = Buffer.concat([buf, chunk]);
        const idx = buf.indexOf('\r\n\r\n');
        if (idx < 0) return;
        const head = buf.slice(0, idx).toString('latin1');
        if (!/^HTTP\/1\.1 101/i.test(head)) { reject(new Error('bad handshake: ' + head.split('\r\n')[0])); return; }
        buf = buf.slice(idx + 4);
        opened = true;
        resolve(api);
      } else {
        buf = Buffer.concat([buf, chunk]);
      }
      for (;;) {
        if (buf.length < 2) return;
        const b1 = buf[1];
        let len = b1 & 0x7f, off = 2;
        if (len === 126) { if (buf.length < 4) return; len = buf.readUInt16BE(2); off = 4; }
        else if (len === 127) { if (buf.length < 10) return; len = Number(buf.readBigUInt64BE(2)); off = 10; }
        if (buf.length < off + len) return;
        let payload = buf.slice(off, off + len);
        buf = buf.slice(off + len);
        let msg;
        try { msg = JSON.parse(payload.toString('utf8')); } catch { continue; }
        if (msg.id && pending.has(msg.id)) { const p = pending.get(msg.id); pending.delete(msg.id); msg.error ? p.rej(new Error(JSON.stringify(msg.error))) : p.res(msg.result); }
      }
    });
    sock.on('error', (e) => { if (!opened) reject(e); });
  });
}

async function main() {
  const waitSec = +(process.argv[2] || 15);
  const targetUrl = process.argv[3] || 'http://127.0.0.1:8080/';
  const cdpPort = process.env.CDP_PORT || '9222';
  const targets = await getJson('http://127.0.0.1:' + cdpPort + '/json');
  const page = targets.find((t) => t.type === 'page');
  if (!page) { console.error('NO PAGE TARGET'); process.exit(1); }
  const ws = await wsConnect(page.webSocketDebuggerUrl);
  const probe = (msg) => ws.send('Runtime.evaluate', { expression: msg, returnByValue: true })
    .then((r) => (r.exceptionDetails ? { __exc: r.exceptionDetails.text || 'exception' } : r.result.value));
  const chk = await probe('({ready: document.readyState, url: location.href})');
  console.log('CHANNEL OK:', JSON.stringify(chk));
  await ws.send('Page.navigate', { url: targetUrl });
  await new Promise((r) => setTimeout(r, waitSec * 1000));
  const expr = `(() => {
    const t = (id) => { const el = document.getElementById(id); return el ? el.textContent : null; };
    return {
      url: location.href,
      title: document.title,
      status: t('status'),
      price: t('price'),
      bid: t('bid'), ask: t('ask'), spread: t('spread'),
      mark: t('mark'), funding: t('funding'),
      clock: t('clock'),
      dCycles: t('dCycles'), dCycleMs: t('dCycleMs'), dFresh: t('dFresh'), dConf: t('dConf'), dQuality: t('dQuality'),
      vLong: t('vLong'), vShort: t('vShort'), vNeutral: t('vNeutral'),
      gates: (() => { const g = document.getElementById('gates'); return g ? g.children.length : 0; })(),
      gateText: (() => { const g = document.getElementById('gates'); return g ? g.textContent.slice(0, 400) : null; })(),
      hist: (() => { const h = document.getElementById('hist'); return h ? h.children.length : 0; })(),
      histText: (() => { const h = document.getElementById('hist'); return h ? h.textContent.slice(0, 200) : null; })(),
      logLines: (() => { const b = document.getElementById('logBox'); return b ? b.children.length : 0; })(),
      logText: (() => { const b = document.getElementById('logBox'); return b ? b.textContent.slice(0, 300) : null; })(),
      signalText: (() => { const s = document.getElementById('signalBox'); return s ? s.textContent.slice(0, 300) : null; })(),
      canvas: (() => { const c = document.querySelector('canvas'); return c ? c.width + 'x' + c.height : null; })(),
      freshPill: t('freshPill')
    };
  })()`;
  const r = await probe(expr);
  if (r && r.__exc) { console.error('EXCEPTION ' + r.__exc); process.exit(1); }
  console.log(JSON.stringify(r, null, 1));
  process.exit(0);
}

async function keysMode() {
  const cdpPort = process.env.CDP_PORT || '9222';
  const base = process.argv[3] || 'http://127.0.0.1:8080';
  const targets = await getJson('http://127.0.0.1:' + cdpPort + '/json');
  const page = targets.find((t) => t.type === 'page' && t.url.startsWith(base));
  if (!page) { console.error('NO TERMINAL PAGE OPEN'); process.exit(1); }
  const ws = await wsConnect(page.webSocketDebuggerUrl);
  const press = (key, code, vk) =>
    ws.send('Input.dispatchKeyEvent', { type: 'keyDown', key, code, text: key, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk })
      .then(() => ws.send('Input.dispatchKeyEvent', { type: 'keyUp', key, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk }));
  for (const [key, code, vk] of [['r', 'KeyR', 82], ['c', 'KeyC', 67], ['l', 'KeyL', 76]]) {
    await press(key, code, vk);
    await new Promise((r) => setTimeout(r, 1500));
  }
  console.log('KEYS DISPATCHED: R C L');
  process.exit(0);
}

if (process.argv[2] === 'keys') keysMode().catch((e) => { console.error('KEYS FAIL ' + e.message); process.exit(1); });
else main().catch((e) => { console.error('PROBE FAIL ' + e.message); process.exit(1); });
