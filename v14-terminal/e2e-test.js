'use strict';
const http = require('http');
const crypto = require('crypto');

const HOST = '127.0.0.1', PORT = 8080;

function get(path) {
  return new Promise((resolve, reject) => {
    http.get({ host: HOST, port: PORT, path }, (res) => {
      let body = '';
      res.on('data', (d) => body += d);
      res.on('end', () => resolve({ status: res.statusCode, ct: res.headers['content-type'], len: body.length }));
    }).on('error', reject);
  });
}

function wsConnect() {
  return new Promise((resolve, reject) => {
    const key = crypto.randomBytes(16).toString('base64');
    const req = http.request({ host: HOST, port: PORT, path: '/', headers: {
      Connection: 'Upgrade', Upgrade: 'websocket',
      'Sec-WebSocket-Key': key, 'Sec-WebSocket-Version': '13'
    }});
    req.on('upgrade', (res, socket) => resolve(socket));
    req.on('error', reject);
    req.end();
  });
}

function decode(buf) {
  const msgs = [];
  let off = 0;
  while (off + 2 <= buf.length) {
    const b0 = buf[off], b1 = buf[off + 1];
    const op = b0 & 0x0f;
    let len = b1 & 0x7f, o = off + 2;
    if (len === 126) { len = buf.readUInt16BE(o); o += 2; }
    else if (len === 127) { len = Number(buf.readBigUInt64BE(o)); o += 8; }
    if (o + len > buf.length) break;
    if (op === 1) msgs.push(buf.slice(o, o + len).toString('utf8'));
    off = o + len;
  }
  return { msgs, rest: buf.slice(off) };
}

function encodeFrame(payload) {
  const buf = Buffer.from(payload);
  const mask = crypto.randomBytes(4);
  const masked = Buffer.from(buf);
  for (let i = 0; i < masked.length; i++) masked[i] ^= mask[i % 4];
  const header = Buffer.alloc(2);
  header[0] = 0x81;
  header[1] = 0x80 | masked.length;
  return Buffer.concat([header, mask, masked]);
}

(async () => {
  const files = ['/', '/style.css', '/app.js'];
  for (const f of files) {
    const r = await get(f);
    console.log('GET ' + f + ' -> ' + r.status + ' ' + r.ct + ' (' + r.len + ' bytes)');
  }
  const c = await get('/api/candles?tf=15m');
  const body = await new Promise((resolve, reject) => {
    http.get({ host: HOST, port: PORT, path: '/api/candles?tf=15m' }, (res) => {
      let b = '';
      res.on('data', (d) => b += d);
      res.on('end', () => resolve(b));
    }).on('error', reject);
  });
  let n = 0;
  try { n = (JSON.parse(body).candles || []).length; } catch { /* noop */ }
  console.log('GET /api/candles -> ' + c.status + ' candles=' + n);
  const sock = await wsConnect();
  console.log('WS upgrade: OK');
  let buffer = Buffer.alloc(0);
  let gotState = false, sentR = false, sentC = false, stateCount = 0, maxCycle = 0;
  sock.on('data', (chunk) => {
    buffer = Buffer.concat([buffer, chunk]);
    for (;;) {
      const d = decode(buffer);
      buffer = d.rest;
      if (!d.msgs.length) break;
      for (const m of d.msgs) {
        const j = JSON.parse(m);
        if (j.type === 'hello') { console.log('hello: bootDone=' + j.boot.length + ' lines'); }
        else if (j.type === 'state') {
          stateCount++;
          if (j.cycles > maxCycle) maxCycle = j.cycles;
          if (!gotState) {
            gotState = true;
            console.log('state#1: price=' + j.price + ' cycles=' + j.cycles + ' tally=' + JSON.stringify(j.tally && { l: j.tally.long, s: j.tally.short, n: j.tally.neutral, d: j.tally.d }) + ' gates=' + JSON.stringify(j.gates && j.gates.gates));
          }
          if (j.cycles >= 1 && !sentR) {
            sentR = true;
            sock.write(encodeFrame(JSON.stringify({ type: 'key', key: 'R' })));
            console.log('sent key R');
          }
          if (j.cycles >= 3 && !sentC) {
            sentC = true;
            sock.write(encodeFrame(JSON.stringify({ type: 'key', key: 'C' })));
            console.log('sent key C');
          }
        }
      }
    }
  });
  setTimeout(() => { console.log('done: gotState=' + gotState + ' states=' + stateCount + ' maxCycle=' + maxCycle); sock.destroy(); process.exit(0); }, 16000);
})();
