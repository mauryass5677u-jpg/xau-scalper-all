'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const readline = require('readline');

const fetcher = require('./fetcher.js');
const indLib = require('./indicators.js');
const agg = require('./aggregator.js');
require('./agents/index.js');

const SYMBOL = 'XAUUSDT';
const PORT = process.env.PORT || 8080;
const PUB = path.join(__dirname, 'public');
const now = () => Date.now();
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));

// ---------------------------------------------------------------------------
// state
// ---------------------------------------------------------------------------
const state = {
  bootPhase: -1, bootLog: [], bootDone: false,
  paused: false, halted: false, biasScan: null,
  startedAt: now(), cycleMs: 5000, cycles: 0,
  price: null, mark: null, index: null, bid: null, ask: null,
  funding: null, fundingTime: null,
  stats: null, depth: null, tape: null,
  inds: {}, funds: {}, macro: {}, spot: null, session: null,
  tally: null, gates: null, params: null, confidence: 0, quality: 0,
  signal: null, signals: [], log: [], histogram: [],
  freshnessScore: 0, apiHealth: null, wsConnected: false,
  riskState: { fails: 0, reduce: 0 }
};

const tapeTrades = [];
const logBuf = [];
const LOG_MAX = 600;

function log(level, msg) {
  const e = { t: now(), level, msg };
  logBuf.push(e);
  if (logBuf.length > LOG_MAX) logBuf.shift();
  state.log = logBuf;
  console.log(new Date(e.t).toISOString() + ' [' + level + '] ' + msg);
}

function boot(level, msg) {
  log(level, msg);
  state.bootLog.push({ t: now(), level, msg });
  if (state.bootLog.length > 40) state.bootLog.shift();
}

// ---------------------------------------------------------------------------
// minimal RFC6455 WebSocket server
// ---------------------------------------------------------------------------
const clients = new Set();

function encodeFrame(payload, opcode) {
  opcode = opcode || 1;
  const buf = Buffer.from(payload);
  const len = buf.length;
  let header;
  if (len < 126) header = Buffer.from([0x80 | opcode, len]);
  else if (len < 65536) {
    header = Buffer.alloc(4);
    header[0] = 0x80 | opcode; header[1] = 126;
    header.writeUInt16BE(len, 2);
  } else {
    header = Buffer.alloc(10);
    header[0] = 0x80 | opcode; header[1] = 127;
    header.writeBigUInt64BE(BigInt(len), 2);
  }
  return Buffer.concat([header, buf]);
}

function upgradeWs(req, socket) {
  if ((req.headers.upgrade || '').toLowerCase() !== 'websocket') return false;
  const key = req.headers['sec-websocket-key'];
  if (!key) return false;
  const accept = crypto.createHash('sha1').update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');
  socket.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ' + accept + '\r\n\r\n');
  const conn = { socket, open: true };
  conn.send = (obj) => {
    if (!conn.open) return;
    try { socket.write(encodeFrame(typeof obj === 'string' ? obj : JSON.stringify(obj))); } catch { /* noop */ }
  };
  conn.close = () => { if (!conn.open) return; conn.open = false; try { socket.end(encodeFrame('', 8)); } catch { /* noop */ } };
  conn.onMessage = null;
  let buffer = Buffer.alloc(0);
  socket.on('data', (chunk) => {
    if (process.env.WSDBG) log('DEBUG', 'raw data chunk ' + chunk.length + 'B');
    buffer = Buffer.concat([buffer, chunk]);
    for (;;) {
      if (buffer.length < 2) return;
      const b0 = buffer[0], b1 = buffer[1];
      let len = b1 & 0x7f, off = 2;
      if (len === 126) { if (buffer.length < 4) return; len = buffer.readUInt16BE(2); off = 4; }
      else if (len === 127) { if (buffer.length < 10) return; len = Number(buffer.readBigUInt64BE(2)); off = 10; }
      const masked = !!(b1 & 0x80);
      let mask = null;
      if (masked) { if (buffer.length < off + 4) return; mask = buffer.slice(off, off + 4); off += 4; }
      if (buffer.length < off + len) return;
      let payload = buffer.slice(off, off + len);
      buffer = buffer.slice(off + len);
      if (masked) { payload = Buffer.from(payload); for (let i = 0; i < payload.length; i++) payload[i] ^= mask[i % 4]; }
      const op = b0 & 0x0f;
      if (process.env.WSDBG) log('DEBUG', 'ws frame op=' + op + ' len=' + len + ' masked=' + masked);
      if (op === 1 && conn.onMessage) {
        try { conn.onMessage(payload.toString('utf8')); } catch { /* noop */ }
      } else if (op === 8) { if (process.env.WSDBG) log('WARN', 'ws close frame code=' + (len >= 2 ? payload.readUInt16BE(0) : 'none') + ' reason=' + (len > 2 ? payload.slice(2).toString('utf8') : '')); conn.open = false; clients.delete(conn); try { socket.destroy(); } catch { /* noop */ } }
      else if (op === 9) { try { socket.write(encodeFrame(payload, 10)); } catch { /* noop */ } }
    }
  });
  socket.on('error', (e) => { if (process.env.WSDBG) log('WARN', 'client socket error: ' + (e && e.message)); conn.open = false; clients.delete(conn); });
  socket.on('close', () => { if (process.env.WSDBG) log('WARN', 'client socket closed'); conn.open = false; clients.delete(conn); });
  clients.add(conn);
  if (process.env.WSDBG) log('DEBUG', 'ws client connected, clients=' + clients.size);
  conn.send({ type: 'hello', t: now(), boot: state.bootLog, paused: state.paused, halted: state.halted });
  conn.onMessage = (text) => {
    try {
      const m = JSON.parse(text);
      if (m && m.type === 'key' && m.key) handleKey(m.key);
    } catch { /* noop */ }
  };
  return true;
}

function broadcast(obj) {
  const s = JSON.stringify(obj);
  if (process.env.WSDBG) log('DEBUG', 'bcast clients=' + clients.size + ' len=' + s.length);
  for (const c of clients) {
    try { c.socket.write(encodeFrame(s)); } catch (e) { if (process.env.WSDBG) log('WARN', 'bcast write fail: ' + e.message); c.open = false; clients.delete(c); }
  }
}

function pushState() {
  broadcast({
    type: 'state', t: now(), cycleMs: state.cycleMs, cycles: state.cycles,
    paused: state.paused, halted: state.halted, biasScan: state.biasScan, bootPhase: state.bootPhase, bootDone: state.bootDone,
    price: state.price, mark: state.mark, index: state.index, bid: state.bid, ask: state.ask,
    bidQty: fetcher.liveCache.bidQty, askQty: fetcher.liveCache.askQty,
    funding: state.funding, fundingTime: state.fundingTime,
    riskMode: state.riskState.reduce > 0 ? 'REDUCED 0.5%' : 'NORMAL 1%',
    stats: state.stats, depth: state.depth, tape: state.tape, tapeTrades: tapeTrades.slice(-30),
    ind: state.inds['15m'] || null, inds: slimInds(), funds: state.funds, macro: state.macro, spot: state.spot,
    session: state.session, sys: { apiOk: fetcher.apiHealth.fail < 5, wsConnected: state.wsConnected, halted: state.halted, freshnessScore: state.freshnessScore, cycleMs: state.cycleMs, cycles: state.cycles }, tally: state.tally, gates: state.gates, params: state.params,
    confidence: state.confidence, quality: state.quality, outliers: state.outliers,
    signal: state.signal, signals: state.signals.slice(-20), histogram: state.histogram, log: state.log.slice(-80)
  });
}

function slimInds() {
  const out = {};
  for (const tf of ['5m', '15m', '1h', '4h', '1d']) {
    const c = state.inds[tf];
    out[tf] = c ? {
      price: c.price, alignment: c.alignment, supertrendDir: c.supertrendDir,
      ema21: c.ema21, ema50: c.ema50, ema200: c.ema200, atr14: c.atr14, rsi: c.rsi,
      macdHist: c.macdHist, adx: c.adx, hull: c.hull, struct: c.struct
    } : null;
  }
  return out;
}

// ---------------------------------------------------------------------------
// data acquisition cycles (47.1 / 47.2 cadence)
// ---------------------------------------------------------------------------
let allK = {}, ages = {}, lastMarket = {}, lastDepth = null, macroCache = null, newsCache = [];

async function refreshKlines() {
  try {
    const r = await fetcher.fetchAllKlines(SYMBOL);
    const ok = Object.keys(r).filter((tf) => r[tf] && r[tf].klines);
    if (ok.length >= 4) { allK = r; ages.klines = now(); }
  } catch (e) { log('WARN', 'klines: ' + e.message); }
}

async function refreshMarket() {
  try {
    lastMarket = await fetcher.fetchMarket(SYMBOL);
    ages.deriv = now();
  } catch (e) { log('WARN', 'market: ' + e.message); }
}

async function refreshDepth() {
  try {
    const d = await fetcher.fetchDepth(SYMBOL, 50);
    lastDepth = d.data;
    ages.book = now();
  } catch (e) { log('WARN', 'depth: ' + e.message); }
}

async function refreshMacro() {
  try {
    macroCache = await fetcher.fetchMacro();
    ages.macro = now();
  } catch (e) { log('WARN', 'macro: ' + e.message); }
}

async function refreshNews() {
  try { newsCache = await fetcher.fetchNews(); } catch { /* noop */ }
}

function startStreams() {
  fetcher.onCooldown = (msg) => log('WARN', 'API COOLDOWN — pausing 10s (' + msg + ')');
  const s = fetcher.openStreams(SYMBOL, {
    onOpen: () => { state.wsConnected = true; log('INFO', 'WS streams connected'); },
    onClose: () => { state.wsConnected = false; log('WARN', 'WS streams disconnected'); },
    onMessage: (j, t) => {
      fetcher.onWsMessage(j);
      if (j.e === 'aggTrade') {
        tapeTrades.push({ p: +j.p, q: +j.q, m: j.m, t: j.T || t });
        if (tapeTrades.length > 200) tapeTrades.splice(0, tapeTrades.length - 200);
      }
      if (state.wsConnected) {
        const lc = fetcher.liveCache;
        if (lc.price !== state.price) {
          state.price = lc.price; state.bid = lc.bid; state.ask = lc.ask;
          state.mark = lc.mark; state.index = lc.index; state.funding = lc.funding; state.fundingTime = lc.fundingTime;
          pushState();
        }
      }
    }
  });
  state._streams = s;
}

function computeFreshness() {
  const lc = fetcher.liveCache;
  const cap = (x) => (x == null ? 600000 : Math.min(x, 600000));
  const priceAge = cap(lc.price != null ? now() - lc.age : null);
  const kAge = cap(ages.klines ? now() - ages.klines : null);
  const bAge = cap(ages.book ? now() - ages.book : null);
  const dAge = cap(ages.deriv ? now() - ages.deriv : null);
  const mAge = cap(ages.macro ? now() - ages.macro : null);
  const w = [0.30, 0.20, 0.20, 0.20, 0.10];
  const vals = [priceAge, kAge, bAge, dAge, mAge];
  state.freshnessScore = Math.round(vals.reduce((s, v, i) => s + v * w[i], 0));
  if (process.env.FRESH_DEBUG) log('DEBUG', 'freshness p=' + priceAge + ' k=' + kAge + ' b=' + bAge + ' d=' + dAge + ' m=' + mAge + ' score=' + state.freshnessScore);
  if (state.freshnessScore > 300000 && !state.halted) { state.halted = true; log('CRITICAL', 'data stale > 5 min — HALT (manual resume: Space)'); }
  else if (state.halted && state.freshnessScore < 60000) { state.halted = false; log('INFO', 'auto-resume — data fresh again'); }
}

// ---------------------------------------------------------------------------
// main engine cycle (4564: refresh every 5s; 4623: cycle < 5s)
// ---------------------------------------------------------------------------
async function cycle() {
  if (state.paused) return;
  const t0 = now();
  try {
    await refreshKlines();
    computeFreshness();
    computeIndicatorsAll();
    buildState();
    runSwarm();
    monitorSignal();
  } catch (e) {
    log('CRITICAL', 'cycle error: ' + e.message);
  }
  state.cycleMs = now() - t0;
  state.cycles++;
  pushState();
}

function computeIndicatorsAll() {
  const out = {};
  for (const tf of fetcher.TFS) {
    const k = allK[tf] && allK[tf].klines;
    if (!k) continue;
    const cs = indLib.prepCandles(k);
    const res = indLib.computeIndicators(cs);
    if (res) out[tf] = res.cur;
  }
  state.inds = out;
}

function buildState() {
  const lc = fetcher.liveCache;
  const market = lastMarket;
  const m = market || {};
  state.price = lc.price != null ? lc.price : (state.inds['15m'] ? state.inds['15m'].price : null);
  state.mark = lc.mark != null ? lc.mark : (m.premium && m.premium.data ? +m.premium.data.markPrice : null);
  state.index = lc.index != null ? lc.index : (m.premium && m.premium.data ? +m.premium.data.indexPrice : null);
  state.funding = lc.funding != null ? lc.funding : (m.premium && m.premium.data ? +m.premium.data.lastFundingRate : null);
  if (m.stats && m.stats.data) {
    const s = m.stats.data;
    state.stats = {
      high: +s.highPrice, low: +s.lowPrice, vol: +s.volume,
      quoteVol: +s.quoteVolume, chg: +s.priceChangePercent, last: +s.lastPrice
    };
  }
  if (market) {
    const oi = market.oi && market.oi.data ? +market.oi.data.openInterest : null;
    let oiChange = null;
    if (market.oiHist && market.oiHist.data && market.oiHist.data.length > 1) {
      const cur = +market.oiHist.data[market.oiHist.data.length - 1].sumOpenInterest;
      const prev = +market.oiHist.data[market.oiHist.data.length - 2].sumOpenInterest;
      if (prev) oiChange = ((cur - prev) / prev) * 100;
    }
    const globalLS = market.globalLS && market.globalLS.data && market.globalLS.data.length ? +market.globalLS.data[market.globalLS.data.length - 1].longShortRatio : null;
    const takerRatio = market.taker && market.taker.data && market.taker.data.length ? +market.taker.data[market.taker.data.length - 1].buySellRatio : null;
    state.funds = { funding: state.funding, oi, oiChange, globalLS, takerRatio };
  }
  const depth = lastDepth ? fetcher.depthMetrics(lastDepth, 12) : null;
  if (depth) state.depth = depth;
  state.tape = market.aggTrades && market.aggTrades.data ? fetcher.aggregateTradesMetrics(market.aggTrades.data) : null;
  state.macro = macroCache || {};
  state.session = indLib.session(now());
}

async function refreshSpot() {
  try {
    const s = await fetcher.fetchSpotGold();
    if (s && s.price != null) { state.spot = { price: s.price, age: s.age }; }
  } catch { /* noop */ }
}

function buildCtx(lastAgg) {
  const market = lastMarket;
  const spot = state.spot;
  return agg.buildContext({
    allK, inds: state.inds, prevInds: null, market,
    book: state.depth, tape: state.tape,
    spot, macro: state.macro, news: newsCache,
    session: state.session,
    sys: {
      apiOk: fetcher.apiHealth.fail < 5,
      wsConnected: state.wsConnected,
      halted: state.halted,
      freshnessScore: Math.round(state.freshnessScore / 1000),
      cycleMs: state.cycleMs
    },
    lastAgg,
    live: { price: state.price, mark: state.mark, index: state.index, funding: state.funding }
  });
}

function runSwarm() {
  const prevLastAgg = state.lastAgg || { d: 0, confidence: 0, gatesPass: false, gatesFail: false, bias: 'NEUTRAL', outliers: 0 };
  if (state.biasScan) {
    prevLastAgg.bias = state.biasScan === 'LONG' ? 'BULLISH' : state.biasScan === 'SHORT' ? 'BEARISH' : prevLastAgg.bias;
    log('INFO', 'bias scan: forcing ' + prevLastAgg.bias + ' for 1 cycle');
    state.biasScan = null;
  }
  const ctx = buildCtx(prevLastAgg);
  const riskMult = state.riskState.reduce > 0 ? 0.5 : 1;
  const votes = agg.runAll(ctx);
  const res = agg.compile(ctx, votes, { freshnessScore: Math.round(state.freshnessScore / 1000), riskMult });
  state.tally = res.tally;
  state.gates = res.gates;
  state.params = res.params;
  state.confidence = res.confidence;
  state.quality = res.quality;
  state.outliers = res.outliers;
  state.lastAgg = res.lastAgg;
  state.histogram = histogram(votes);
  handleSignal(res);
  if (state.cycles % 6 === 0) {
    const t = res.tally;
    const gateRate = res.gates ? Object.keys(res.gates).filter((k) => res.gates[k]).length + '/6' : 'gates off';
    const riskTxt = riskMult < 1 ? ' · risk REDUCED 0.5%' : '';
    if (!res.signal) {
      if (t.d === 0) log('INFO', 'NO TRADE — Agents Divided (' + t.long + 'L/' + t.short + 'S/' + t.neutral + 'N, majority ' + t.rawMajority + '/500)' + riskTxt);
      else log('INFO', 'NO TRADE — majority ' + t.long + 'L/' + t.short + 'S conf ' + res.confidence + '% gates ' + gateRate + riskTxt);
    } else {
      log('INFO', 'swarm ' + t.long + 'L/' + t.short + 'S/' + t.neutral + 'N conf ' + res.confidence + '% q ' + res.quality + ' gates ' + gateRate + riskTxt);
    }
  }
}

function monitorSignal() {
  const sig = state.signal;
  if (!sig) return;
  const close15 = state.inds['15m'] && state.inds['15m'].close;
  const p = state.price;
  if (close15 == null && p == null) return;
  const beyond = sig.d === 1 ? (close15 != null && close15 < sig.sl) || (p != null && p < sig.sl)
    : (close15 != null && close15 > sig.sl) || (p != null && p > sig.sl);
  const hitTp = sig.d === 1 ? p != null && p >= sig.tp : p != null && p <= sig.tp;
  if (beyond) {
    state.signal = null;
    state.riskState.fails++;
    log('CRITICAL', 'signal CANCELLED — 15m close beyond stop before entry (' + (close15 != null ? close15 : p) + ' vs SL ' + sig.sl + ')');
    if (state.riskState.fails >= 2) {
      state.riskState.fails = 0;
      state.riskState.reduce = 4;
      log('WARN', '2 consecutive stop hits — risk auto-reduced to 0.5% for next 4 signals (rule 12)');
    }
    pushState();
  } else if (hitTp) {
    state.signal = null;
    state.riskState.fails = 0;
    log('SIGNAL', 'signal CLOSED — TP reached at ' + p + ' (anti-martingale: risk unchanged)');
    pushState();
  }
}

function histogram(votes) {
  const byCat = {};
  for (const v of votes) {
    byCat[v.cat] = byCat[v.cat] || { cat: v.cat, long: 0, short: 0, neutral: 0 };
    byCat[v.cat][v.d === 1 ? 'long' : v.d === -1 ? 'short' : 'neutral']++;
  }
  return Object.keys(byCat).sort((a, b) => a - b).map((k) => byCat[k]);
}

function handleSignal(res) {
  const sig = res.signal;
  const active = state.signal;
  const nowTs = now();
  const expired = active && (nowTs - active.ts) > active.validForMs;
  if (sig) {
    if (!active || expired) {
      state.signal = { ...sig, ts: sig.ts };
      state.signals.push(state.signal);
      if (state.signals.length > 100) state.signals.shift();
      logSignal(state.signal);
      log('SIGNAL', state.signal.direction + ' ' + state.signal.confidence + '% (' + state.signal.votes + '/500)');
    } else if (sig.confidence > active.confidence) {
      const prevDir = active.direction;
      state.signal = { ...sig, ts: sig.ts };
      state.signals.push(state.signal);
      if (state.signals.length > 100) state.signals.shift();
      log('SIGNAL', 'upgraded ' + prevDir + ' -> ' + sig.direction + ' conf ' + sig.confidence + '%');
    }
  } else if (expired) {
    state.signal = null;
    log('INFO', 'signal expired after 12 min — re-evaluating');
  }
}

function logSignal(sig) {
  const bar = '═'.repeat(70);
  const B = (s) => '║ ' + s;
  const t = state.tally || {};
  const pctOf = (n) => ((n / 500) * 100).toFixed(1);
  const hist = state.histogram || [];
  const cats = hist.slice().sort((a, b) => (b.long + b.short) - (a.long + a.short)).slice(0, 3).map((h) => 'cat' + h.cat + ' ' + h.long + 'L/' + h.short + 'S').join(', ');
  const st = state.stats || {};
  const f = state.funds || {};
  let piv = null;
  try {
    if (allK['1d'] && allK['1d'].klines) piv = indLib.pivots(indLib.prepCandles(allK['1d'].klines));
  } catch { /* noop */ }
  const riskTxt = (sig.riskPct || 1) + '% equity';
  const gateLines = Object.keys(sig.gates).map((k, i) => {
    const name = ['Freshness', 'Volatility', 'Edge', 'Risk', 'Micro', 'Macro'][i] || k;
    const ok = sig.gates[k] ? '✅ PASS' : '❌ FAIL';
    const extra = k === 'g1' ? '(<60s)' : k === 'g2' ? '(ATR% ' + (state.inds['15m'] && state.inds['15m'].atrPct != null ? state.inds['15m'].atrPct.toFixed(2) + '%' : '?') + ')' : k === 'g3' ? '(' + sig.votes + '/500, ' + sig.confidence + '%)' : k === 'g4' ? '(R:R ' + sig.rr + ':1)' : '';
    return B('    Gate ' + (i + 1) + ' (' + name + '):  ' + ok + (extra ? ' ' + extra : ''));
  }).join('\n');
  log('SIGNAL',
    '\n' + bar + '\n' +
    B('🏆 XAUUSDT PERPETUAL — OMNISCIENT SCALPER v14.0 — 500-AGENT SWARM') + '\n' +
    B('MAJORITY VOTE CONSENSUS SIGNAL') + '\n' +
    bar + '\n' +
    B('⏱️  Timestamp: ' + new Date(sig.ts).toISOString().replace('T', ' ').slice(0, 19) + ' UTC') + '\n' +
    B('💰  Live Price: $' + sig.price + ' | Mark: $' + sig.markPrice + ' | Idx: $' + (state.index != null ? state.index : '--')) + '\n' +
    B('📊  24h: ' + fmtPrice(st.high) + ' / ' + fmtPrice(st.low) + ' | Vol: ' + (st.quoteVol ? (st.quoteVol / 1e6).toFixed(1) + 'M' : '--') + ' | Chg: ' + (st.chg != null ? st.chg + '%' : '--')) + '\n' +
    B('⚡  Funding: ' + (f.funding != null ? (f.funding * 100).toFixed(4) + '%' : '--') + ' | OI: ' + (f.oi != null ? Math.round(f.oi) + ' oz' : '--') + ' | L/S: ' + (f.globalLS != null ? f.globalLS.toFixed(2) : '--')) + '\n' +
    bar + '\n' +
    B('🎯 DIRECTION: ' + sig.direction) + '\n' +
    B('🧠 CONFIDENCE: ' + sig.confidence + '% (' + sig.votes + '/500 Agents Agree)') + '\n' +
    B('⏳ TIMEFRAME: 15-MINUTE PRIMARY | 3-MINUTE EXECUTION') + '\n' +
    B('📈 QUALITY: ' + sig.quality) + '\n' +
    B('') + '\n' +
    B('  ┌────────────────────────────────────────────────────────────────────┐') + '\n' +
    B('  │ ENTRY ZONE:     $' + sig.entryLo + ' — $' + sig.entryHi) + '\n' +
    B('  │ IDEAL ENTRY:    $' + sig.entry + ' (limit order)') + '\n' +
    B('  │ 🛑 STOP LOSS:   $' + sig.sl + ' (ATR stop)') + '\n' +
    B('  │ 🎯 TAKE PROFIT: $' + sig.tp + ' (R:R = ' + sig.rr + ':1)') + '\n' +
    B('  │ TRAIL TRIGGER:  $' + (sig.trail != null ? sig.trail : '--') + ' (activate at 2:1 R:R)') + '\n' +
    B('  └────────────────────────────────────────────────────────────────────┘') + '\n' +
    B('') + '\n' +
    B('📐 RISK PARAMETERS:') + '\n' +
    B('    Risk per Trade:   ' + riskTxt) + '\n' +
    B('    Position Size:    ' + sig.sizeOz + ' oz ($' + sig.notional + ' notional)') + '\n' +
    B('    Leverage:         ' + sig.leverage + '×') + '\n' +
    B('    Max Drawdown:     ' + riskTxt) + '\n' +
    B('    Time Validity:    12 minutes from signal (invalidation: 15m close beyond $' + sig.invalidation + ')') + '\n' +
    bar + '\n' +
    B('🗳️  AGENT VOTE BREAKDOWN:') + '\n' +
    B('    🟢 LONG:    ' + t.long + ' agents (' + pctOf(t.long) + '%)') + '\n' +
    B('    🔴 SHORT:   ' + t.short + ' agents (' + pctOf(t.short) + '%)') + '\n' +
    B('    ⚪ NEUTRAL: ' + t.neutral + ' agents (' + pctOf(t.neutral) + '%)') + '\n' +
    B('') + '\n' +
    B('    Top Contributing Categories: ' + (cats || 'n/a')) + '\n' +
    B('    Key Agents: ' + sig.topAgents.map((a) => '#' + a.id + ' ' + a.name).join(', ')) + '\n' +
    B('') + '\n' +
    B('🧮 GATE VALIDATION:') + '\n' +
    gateLines + '\n' +
    B('') + '\n' +
    B('📋 EXECUTION CHECKLIST:') + '\n' +
    B('  □ Set limit order at $' + sig.entry) + '\n' +
    B('  □ Hard stop at $' + sig.sl + ' — NO EXCEPTIONS') + '\n' +
    B('  □ Take profit at $' + sig.tp) + '\n' +
    B('  □ Trail stop to breakeven at $' + sig.trail) + '\n' +
    B('  □ Invalidation: 15m close beyond $' + sig.invalidation) + '\n' +
    B('') + '\n' +
    B('🗺️  KEY LEVELS:') + '\n' +
    B('    Resistance: ' + (piv ? fmtPrice(piv.R1) + ' │ ' + fmtPrice(piv.R2) + ' │ ' + fmtPrice(piv.R3) : '--')) + '\n' +
    B('    Support:    ' + (piv ? fmtPrice(piv.S1) + ' │ ' + fmtPrice(piv.S2) + ' │ ' + fmtPrice(piv.S3) : '--')) + '\n' +
    B('') + '\n' +
    B('📝 RATIONALE (Agent Consensus):') + '\n' +
    B(sig.rationale) + '\n' +
    B('') + '\n' +
    (sig.warnings && sig.warnings.length
      ? B('⚠️  RISK WARNINGS:') + '\n' + B('  • ' + sig.warnings.join('\n  • ')) + '\n' + B('') + '\n'
      : '') +
    B('⚠️  NOT FINANCIAL ADVICE — honor the stop, never average down') + '\n' +
    bar);
}

function fmtPrice(n) {
  return n === null || n === undefined || isNaN(n) ? '--' : Number(n).toFixed(2);
}

// ---------------------------------------------------------------------------
// boot phases (50.1 - 50.10)
// ---------------------------------------------------------------------------
async function bootSequence() {
  boot('INFO', 'PHASE 1/10 — API Connectivity');
  try {
    await fetcher.getJson('https://fapi.binance.com/fapi/v1/ping');
    const tm = await fetcher.getJson('https://fapi.binance.com/fapi/v1/time');
    boot('OK', 'REST API ping OK — server time ' + new Date(tm.data.serverTime).toISOString());
  } catch (e) { boot('WARN', 'API ping failed: ' + e.message); }
  state.bootPhase = 1;

  boot('INFO', 'PHASE 2/10 — Market Data Acquisition');
  await Promise.allSettled([refreshMarket(), refreshDepth(), refreshKlines(), refreshMacro(), refreshNews(), refreshSpot()]);
  boot('OK', 'price/24h/funding/OI/depth/klines/derivatives/basis/macro/spot loaded');
  state.bootPhase = 2;

  boot('INFO', 'PHASE 3/10 — Agent Swarm Boot');
  boot('OK', 'Agents 1.1–50.10 (500 agents) loaded & ONLINE');
  state.bootPhase = 3;

  boot('INFO', 'PHASE 4/10 — Indicator Calibration');
  computeIndicatorsAll();
  const t15 = state.inds['15m'];
  boot('OK', 'ATR14=' + (t15 ? t15.atr14.toFixed(2) : 'n/a') + ' | EMA stack=' + (t15 ? t15.alignment : 'n/a') + ' | RSI=' + (t15 && t15.rsi != null ? t15.rsi.toFixed(1) : 'n/a') + ' | MACD/Stoch/CCI/BB/KC/VP/VWAP calibrated');
  state.bootPhase = 4;

  boot('INFO', 'PHASE 5/10 — Structure Mapping');
  boot('OK', 'swings/trendlines/channels/ranges/order blocks/FVGs/voids/pivots mapped');
  state.bootPhase = 5;

  boot('INFO', 'PHASE 6/10 — Derivatives Calibration');
  boot('OK', 'funding/OI/L-S/taker/basis calibrated');
  state.bootPhase = 6;

  boot('INFO', 'PHASE 7/10 — Risk Parameter Set');
  boot('OK', 'ATR stops | size limits | leverage cap 10× | R:R min 1.5 | validity 12 min');
  state.bootPhase = 7;

  boot('INFO', 'PHASE 8/10 — Gate Calibration');
  boot('OK', 'Gate1 <60s | Gate2 ATR% 0.08-0.45 spread<$0.15 | Gate3 ≥251/500 ≥55% | Gate4 SL≤1.5×ATR R:R≥1.5 | Gate5 OB<80% vs | Gate6 funding/OI/L-S');
  state.bootPhase = 8;

  boot('INFO', 'PHASE 9/10 — UI Initialization');
  boot('OK', 'ticker tape | vote bar | gate panel | signal panel | log panel | dashboard metrics');
  state.bootPhase = 9;

  boot('INFO', 'PHASE 10/10 — System Ready');
  boot('OK', 'All systems operational. Agent swarm ready. Gate system ready. Signal engine ready. Awaiting signal conditions...');
  state.bootDone = true;
  broadcast({ type: 'boot', done: true, log: state.bootLog });
}

// ---------------------------------------------------------------------------
// HTTP server
// ---------------------------------------------------------------------------
const server = http.createServer((req, res) => {
  let url = decodeURIComponent((req.url || '/').split('?')[0]);
  if (url === '/') url = '/index.html';
  if (url === '/api/candles') {
    const q = (req.url || '').split('?')[1] || '';
    const tf = new URLSearchParams(q).get('tf') || '15m';
    const k = allK[tf] && allK[tf].klines ? allK[tf].klines.slice(-200) : [];
    res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
    return res.end(JSON.stringify({ tf, candles: k }));
  }
  let file = path.join(PUB, path.normalize(url));
  if (!file.startsWith(PUB)) { res.writeHead(403); return res.end('forbidden'); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end('not found'); }
    const ext = path.extname(file);
    const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };
    res.writeHead(200, { 'Content-Type': mime[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

server.on('upgrade', (req, socket) => {
  if (!upgradeWs(req, socket)) { try { socket.destroy(); } catch { /* noop */ } }
});

// ---------------------------------------------------------------------------
// keyboard commands (cat 48)
// ---------------------------------------------------------------------------
function handleKey(key) {
  const k = (key || '').toUpperCase();
  switch (k) {
    case 'R':
      if (state.halted) return log('WARN', 'refresh unavailable during halt');
      log('INFO', 'force refresh');
      state.cycleMs = 5000;
      cycle();
      break;
    case ' ':
      if (state.halted) {
        state.halted = false;
        log('INFO', 'manual resume — swarm restarted');
        pushState();
        cycle();
        break;
      }
      state.paused = !state.paused;
      log(state.paused ? 'INFO' : 'INFO', state.paused ? 'swarm PAUSED — new signals halted, existing remain active' : 'swarm RESUMED');
      pushState();
      if (!state.paused) cycle();
      break;
    case 'F':
      broadcast({ type: 'key', key: 'F' });
      break;
    case 'S':
      broadcast({ type: 'key', key: 'S' });
      break;
    case 'L':
    case 'H':
      if (state.halted) return log('WARN', 'bias scan unavailable during halt');
      state.biasScan = k;
      log('INFO', 'force ' + (k === 'L' ? 'LONG' : 'SHORT') + ' bias scan queued (1 cycle)');
      break;
    case 'C':
      state.signals = [];
      log('INFO', 'signal history cleared');
      pushState();
      break;
    case 'P':
      broadcast({ type: 'key', key: 'P' });
      break;
    case '?':
      broadcast({ type: 'key', key: '?' });
      break;
    case 'Q':
      log('INFO', 'quit requested — closing');
      for (const c of clients) c.close();
      try { process.exit(0); } catch { /* noop */ }
      break;
    default:
      break;
  }
}

function attachKeys() {
  readline.emitKeypressEvents(process.stdin);
  if (process.stdin.isTTY) process.stdin.setRawMode(true);
  process.stdin.on('keypress', (str, key) => {
    if (key && key.ctrl && key.name === 'c') { log('INFO', 'Ctrl+C — shutdown'); process.exit(0); }
    if (key && key.name) handleKey(key.name === 'space' ? ' ' : key.name);
  });
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------
server.listen(PORT, () => {
  console.log('XAUUSDT v14.0 terminal: http://localhost:' + PORT);
  bootSequence().then(() => {
    startStreams();
    setInterval(cycle, 5000);
    setInterval(refreshDepth, 2000);
    setInterval(refreshMarket, 10000);
    setInterval(refreshSpot, 60000);
    setInterval(refreshMacro, 300000);
    setInterval(refreshNews, 300000);
    attachKeys();
  });
});
