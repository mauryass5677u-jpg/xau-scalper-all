'use strict';

// ============================================================================
// XAU/USDT OMNISCIENT SCALPING TERMINAL — LIVE SERVER
// Fetches real Binance Futures + Yahoo macro data, runs 50 agents, votes, gates.
// Serves a Bloomberg-style terminal at http://localhost:8787
// ============================================================================

const http = require('http');
const fs = require('fs');
const path = require('path');
const indLib = require('./indicators.js');
const fetcher = require('./fetcher.js');
const agg = require('./aggregator.js');

const SYMBOL = 'XAUUSDT';
const PORT = process.env.PORT || 8787;
const CORE_MS = 8000;      // price/klines/fundamentals refresh
const MACRO_MS = 30000;    // Yahoo macro refresh

let state = null;
let tf = '15m';
let lastCore = 0;
let macroCache = null;
let lastMacro = 0;
let macroPending = false;
let newsCache = [];
let lastNews = 0;
let newsPending = false;
let errors = [];

function computeAll(allK, bin) {
  const inds = {}, prevInds = {};
  for (const t of fetcher.TFS) {
    const raw = allK[t];
    if (!raw || raw.length < 80) continue;
    const cs = indLib.prepCandles(raw);
    const full = indLib.computeIndicators(cs);
    if (full) inds[t] = full.cur;
    const prev = cs.length > 80 ? indLib.computeIndicators(cs.slice(0, -1)) : null;
    if (prev) prevInds[t] = prev.cur;
  }
  return { inds, prevInds };
}

async function refreshCore() {
  const now = Date.now();
  try {
    const [kRes, bRes, sRes] = await Promise.allSettled([
      fetcher.fetchAllKlines(SYMBOL),
      fetcher.fetchBinance(SYMBOL),
      fetcher.fetchSpotGold()
    ]);
    lastCore = now;
    const allK = kRes.status === 'fulfilled' ? kRes.value : {};
    const bin = bRes.status === 'fulfilled' ? bRes.value : null;
    const spot = sRes.status === 'fulfilled' ? sRes.value : null;

    if (Object.keys(allK).length === 0) throw new Error('no klines');

    const { inds, prevInds } = computeAll(allK, bin);
    const depthHist = bin && bin.depth ? [fetcher.depthMetrics(bin.depth)] : null;
    const trades = bin && bin.aggTrades ? fetcher.aggregateTradesMetrics(bin.aggTrades) : null;

    // macro (throttled)
    if (macroCache && now - lastMacro < MACRO_MS) { /* reuse */ }
    else if (!macroPending) {
      macroPending = true;
      fetcher.fetchMacro().then((m) => { macroCache = m; lastMacro = Date.now(); macroPending = false; })
        .catch(() => { macroPending = false; });
    }

    // news (throttled 60s)
    if (!newsPending && now - lastNews > 60000) {
      newsPending = true;
      fetcher.fetchNews().then((n) => { newsCache = n || []; lastNews = Date.now(); newsPending = false; })
        .catch(() => { newsPending = false; });
    }

    const ctx = agg.buildContext({ tf, allK, inds, prevInds, funds: bin, depth: depthHist, trades, macro: macroCache, spot });
    const votes = agg.runAgents(ctx);
    const signal = agg.buildSignal(ctx, votes);
    const layers = agg.layers(ctx, votes);
    const gates = agg.checkGates(ctx, signal, ctx.depth, now - lastCore);

    const targetCs = indLib.prepCandles(allK[tf] || []);
    const candles = targetCs.slice(-160).map((c) => ({ t: c.t, o: c.o, h: c.h, l: c.l, c: c.c, v: c.v }));

    const priceAge = now - lastCore;
    const status = {
      ts: new Date(now).toISOString(), fetchedAt: now, tf,
      price: bin && bin.price ? +bin.price.price : null,
      markPrice: ctx.funds.markPrice,
      stats: bin && bin.stats ? {
        priceChangePct: +bin.stats.priceChangePercent, high: +bin.stats.highPrice,
        low: +bin.stats.lowPrice, open: +bin.stats.openPrice, quoteVol: +bin.stats.quoteVolume,
        bid: +bin.stats.bidPrice, ask: +bin.stats.askPrice
      } : null,
      spot, macro: macroCache, news: newsCache,
      candles,
      pivots: ctx.pivots,
      ind: inds[tf] || null,
      inds,
      funds: ctx.funds,
      depth: ctx.depth,
      trades,
      votes,
      signal,
      layers,
      gates,
      priceAge,
      errors: errors.slice(-5)
    };
    state = status;
  } catch (e) {
    errors.push({ at: new Date().toISOString(), msg: e.message });
    if (state) { state.errors = errors.slice(-5); state.stale = true; }
  }
}

function serve(res, file, mime) {
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); res.end('not found'); return; }
    res.writeHead(200, { 'Content-Type': mime, 'Cache-Control': 'no-store' });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0];
  if (url === '/') { serve(res, path.join(__dirname, 'public', 'index.html'), 'text/html; charset=utf-8'); return; }
  if (url === '/app.js') { serve(res, path.join(__dirname, 'public', 'app.js'), 'application/javascript; charset=utf-8'); return; }
  if (url === '/style.css') { serve(res, path.join(__dirname, 'public', 'style.css'), 'text/css; charset=utf-8'); return; }
  if (url === '/api/state') {
    res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
    res.end(JSON.stringify(state || { error: 'warming up' }));
    return;
  }
  if (url === '/api/tf' && req.method === 'GET') {
    const q = new URL(req.url, 'http://x').searchParams.get('tf');
    if (fetcher.TFS.includes(q)) { tf = q; refreshCore(); }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ tf }));
    return;
  }
  if (url === '/api/refresh') { refreshCore(); res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ ok: true })); return; }
  res.writeHead(404); res.end('not found');
});

refreshCore();
setInterval(refreshCore, CORE_MS);

function listen(port) {
  server.on('error', (e) => {
    if (e.code === 'EADDRINUSE' && port !== 8787) { console.log(`port ${port} busy - falling back to 8787`); listen(8787); }
    else { console.error('XAU TERMINAL: ' + e.message); process.exit(1); }
  });
  server.listen(port, () => {
    console.log(`XAU/USDT OMNISCIENT SCALPING TERMINAL  →  http://localhost:${port}`);
    console.log(`symbol: ${SYMBOL} | default timeframe: ${tf} | agents: 50`);
  });
}
listen(PORT);
