'use strict';

// ============================================================================
// PART A — REAL-TIME DATA ACQUISITION — XAUUSDT OMNISCIENT SCALPER v14.0
// Binance Futures public REST + WebSocket. Zero fabrication: every field the
// agents read originates in a live API payload. Freshness stamped on everything.
// ============================================================================

const B = 'https://fapi.binance.com';
const FD = B + '/futures/data';
const WS_BASE = 'wss://fstream.binance.com/ws';
const TFS = ['1m', '3m', '5m', '15m', '1h', '4h', '1d'];
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';

const now = () => Date.now();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let onCooldown = null;

// ---------- tiny latency/weight tracking ----------
const apiHealth = { lastPing: 0, lastLatency: null, weightUsed: 0, weightWindowStart: 0, errors: [], ok: 0, fail: 0 };
function markWeight(w) {
  if (now() - apiHealth.weightWindowStart > 60000) { apiHealth.weightWindowStart = now(); apiHealth.weightUsed = 0; }
  apiHealth.weightUsed += w || 0;
}

async function getJson(url, opts = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), opts.timeoutMs || 12000);
  const start = now();
  try {
    const r = await fetch(url, {
      headers: { 'User-Agent': UA, 'Accept': 'application/json', ...(opts.headers || {}) },
      signal: ctrl.signal
    });
    apiHealth.lastLatency = now() - start;
    if (r.status === 429 || r.status === 418) {
      apiHealth.fail++; apiHealth.errors.push({ t: now(), url, status: r.status });
      if (onCooldown) onCooldown('HTTP ' + r.status + ' (rate limit)');
      await sleep(10000);
      throw new Error('HTTP ' + r.status);
    }
    if (r.status >= 500) { apiHealth.fail++; apiHealth.errors.push({ t: now(), url, status: r.status }); throw new Error('HTTP ' + r.status); }
    if (!r.ok) { apiHealth.fail++; throw new Error('HTTP ' + r.status); }
    apiHealth.ok++;
    markWeight(opts.weight || 1);
    const j = await r.json();
    return { data: j, age: now(), latency: apiHealth.lastLatency };
  } catch (e) {
    if (e.name === 'AbortError') { apiHealth.fail++; apiHealth.errors.push({ t: now(), url, err: 'timeout' }); }
    throw e;
  } finally { clearTimeout(t); }
}

// ---------------- klines ----------------
async function fetchKlines(symbol, interval, limit = 200) {
  const { data, age } = await getJson(`${B}/fapi/v1/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`, { weight: interval === '15m' ? 10 : 2 });
  if (!Array.isArray(data)) throw new Error('klines not array');
  return { klines: data, age };
}

async function fetchAllKlines(symbol) {
  const out = {};
  const results = await Promise.allSettled(TFS.map((tf) => fetchKlines(symbol, tf, 200).then((r) => ({ tf, ...r }))));
  for (const r of results) {
    if (r.status === 'fulfilled' && r.value.klines) out[r.value.tf] = r.value;
    else out[r.value && r.value.tf ? r.value.tf : '?'] = { klines: null, age: now() };
  }
  return out;
}

// ---------------- core market snapshot ----------------
async function fetchMarket(symbol) {
  const [
    price, stats, book, premium, funding, oi, oiHist, globalLS, topLS, topPos, taker, basis, aggTrades
  ] = await Promise.allSettled([
    getJson(`${B}/fapi/v1/ticker/price?symbol=${symbol}`, { weight: 1 }),
    getJson(`${B}/fapi/v1/ticker/24hr?symbol=${symbol}`, { weight: 1 }),
    getJson(`${B}/fapi/v1/ticker/bookTicker?symbol=${symbol}`, { weight: 1 }),
    getJson(`${B}/fapi/v1/premiumIndex?symbol=${symbol}`, { weight: 1 }),
    getJson(`${B}/fapi/v1/fundingRate?symbol=${symbol}&limit=120`, { weight: 1 }),
    getJson(`${B}/fapi/v1/openInterest?symbol=${symbol}`, { weight: 1 }),
    getJson(`${FD}/openInterestHist?symbol=${symbol}&period=5m&limit=96`, { weight: 1 }),
    getJson(`${FD}/globalLongShortAccountRatio?symbol=${symbol}&period=5m&limit=30`, { weight: 1 }),
    getJson(`${FD}/topLongShortAccountRatio?symbol=${symbol}&period=5m&limit=30`, { weight: 1 }),
    getJson(`${FD}/topLongShortPositionRatio?symbol=${symbol}&period=5m&limit=30`, { weight: 1 }),
    getJson(`${FD}/takerlongshortRatio?symbol=${symbol}&period=5m&limit=30`, { weight: 1 }),
    getJson(`${FD}/basis?symbol=${symbol}&period=5m&limit=30`, { weight: 1 }),
    getJson(`${B}/fapi/v1/aggTrades?symbol=${symbol}&limit=1000`, { weight: 20 })
  ]);
  const v = (r) => (r.status === 'fulfilled' ? r.value : null);
  const age = now();
  return {
    price: v(price), stats: v(stats), book: v(book), premium: v(premium), funding: v(funding),
    oi: v(oi), oiHist: v(oiHist), globalLS: v(globalLS), topLS: v(topLS), topPos: v(topPos),
    taker: v(taker), basis: v(basis), aggTrades: v(aggTrades), fetchedAt: age
  };
}

// ---------------- depth (top 50) ----------------
async function fetchDepth(symbol, limit = 50) {
  const { data, age } = await getJson(`${B}/fapi/v1/depth?symbol=${symbol}&limit=${limit}`, { weight: 10 });
  return { data, age };
}

// ---------------- derived metrics ----------------
function depthMetrics(depth, n = 12) {
  if (!depth || !depth.bids || !depth.asks || !depth.bids.length || !depth.asks.length) return null;
  let bidSum = 0, askSum = 0;
  for (let i = 0; i < n && i < depth.bids.length; i++) bidSum += +depth.bids[i][1];
  for (let i = 0; i < n && i < depth.asks.length; i++) askSum += +depth.asks[i][1];
  const tot = bidSum + askSum;
  const imbalance = tot > 0 ? ((bidSum - askSum) / tot) * 100 : 0;
  const bestBid = +depth.bids[0][0], bestAsk = +depth.asks[0][0];
  const qty = depth.bids.map((x) => +x[1]).concat(depth.asks.map((x) => +x[1]));
  const mean = qty.reduce((s, x) => s + x, 0) / qty.length || 1;
  const walls = [];
  for (let i = 0; i < depth.bids.length; i++) if (+depth.bids[i][1] > 5 * mean) walls.push({ side: 'BID', price: +depth.bids[i][0], qty: +depth.bids[i][1] });
  for (let i = 0; i < depth.asks.length; i++) if (+depth.asks[i][1] > 5 * mean) walls.push({ side: 'ASK', price: +depth.asks[i][0], qty: +depth.asks[i][1] });
  const levels = {
    bids: depth.bids.slice(0, n).map((x) => ({ p: +x[0], q: +x[1] })),
    asks: depth.asks.slice(0, n).map((x) => ({ p: +x[0], q: +x[1] }))
  };
  return { bidSum, askSum, imbalance, spread: bestAsk - bestBid, bid: bestBid, ask: bestAsk, walls, levels };
}

function aggregateTradesMetrics(trades) {
  if (!trades || !trades.length) return null;
  let buyVol = 0, sellVol = 0, buyNotional = 0, sellNotional = 0, bigBuys = 0, bigSells = 0, tradesN = trades.length;
  const vols = trades.map((t) => +t.q).sort((a, b) => b - a);
  const big = vols.length > 20 ? vols[Math.floor(vols.length * 0.05)] : (vols[0] || 0);
  for (const t of trades) {
    const q = +t.q;
    if (t.m === false) { buyVol += q; buyNotional += q * +t.p; if (q >= big) bigBuys++; }
    else { sellVol += q; sellNotional += q * +t.p; if (q >= big) bigSells++; }
  }
  return { buyVol, sellVol, ratio: sellVol > 0 ? buyVol / sellVol : null, buyNotional, sellNotional, bigBuys, bigSells, tradesN, aggression: sellVol > 0 ? (buyVol - sellVol) / (buyVol + sellVol) : 0 };
}

// ---------------- WebSocket live streams (native WS client) ----------------
function openStreams(symbol, handlers) {
  const streams = [
    `${symbol.toLowerCase()}@aggTrade`,
    `${symbol.toLowerCase()}@bookTicker`,
    `${symbol.toLowerCase()}@markPrice@1s`,
    `${symbol.toLowerCase()}@kline_15m`
  ];
  const url = `${WS_BASE}/${streams.join('/')}`;
  let ws = null, closed = false, retries = 0;

  function connect() {
    if (closed) return;
    try { ws = new WebSocket(url); } catch (e) { scheduleReconnect(); return; }

    ws.onopen = () => { retries = 0; handlers.onOpen && handlers.onOpen(); };
    ws.onmessage = (ev) => {
      try {
        const j = JSON.parse(ev.data);
        handlers.onMessage && handlers.onMessage(j, now());
      } catch { /* ignore malformed */ }
    };
    ws.onclose = () => { handlers.onClose && handlers.onClose(); scheduleReconnect(); };
    ws.onerror = () => { /* handled by onclose */ };
  }

  function scheduleReconnect() {
    if (closed) return;
    const delay = Math.min(1000 * Math.pow(2, retries), 15000);
    retries++;
    setTimeout(connect, delay);
  }

  connect();
  return {
    close() { closed = true; try { ws && ws.close(); } catch { /* noop */ } },
    isOpen: () => ws && ws.readyState === 1
  };
}

// ---------------- live cache of WS state ----------------
const liveCache = { price: null, bid: null, ask: null, bidQty: null, askQty: null, mark: null, index: null, funding: null, fundingTime: null, lastTradeQ: null, lastTradeP: null, age: now(), wsConnected: false };

function onWsMessage(j) {
  liveCache.age = now();
  if (j.e === 'aggTrade') {
    liveCache.price = +j.p;
    liveCache.lastTradeQ = +j.q;
    liveCache.lastTradeP = +j.p;
  } else if (j.e === 'bookTicker') {
    liveCache.bid = +j.b; liveCache.ask = +j.a;
    liveCache.bidQty = +j.B; liveCache.askQty = +j.A;
    if (liveCache.price == null) liveCache.price = (+j.b + +j.a) / 2;
  } else if (j.e === 'markPriceUpdate') {
    liveCache.mark = +j.p;
    liveCache.index = +j.i;
    liveCache.funding = +j.r;
    liveCache.fundingTime = j.T;
    if (liveCache.price == null) liveCache.price = +j.p;
  }
  // kline_15m pushes the latest 15m candle — store for the chart
  else if (j.e === 'kline' && j.k) {
    const k = j.k;
    liveCache.lastKline15m = { t: k.t, o: +k.o, h: +k.h, l: +k.l, c: +k.c, v: +k.v, closed: k.x, ts: +k.v, tb: k.t ? k.v : 0 };
  }
}

// ---------------- spot gold (reference for premium check) ----------------
async function fetchSpotGold() {
  try {
    const { data } = await getJson('https://api.gold-api.com/price/XAU', {}, 8000);
    return { price: data && data.price, age: now() };
  } catch { return null; }
}

// ---------------- macro (Yahoo) ----------------
async function fetchYahoo(sym) {
  try {
    const { data } = await getJson(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?interval=5m&range=1d`, {}, 10000);
    const res = data && data.chart && data.chart.result && data.chart.result[0];
    if (!res) return null;
    const q = res.indicators.quote[0];
    const closes = q.close;
    let chg = null;
    for (let i = closes.length - 1; i > 0; i--) {
      const a = closes[i], b = closes[i - 1];
      if (a != null && b != null && b !== 0) { chg = ((a - b) / b) * 100; break; }
    }
    let val = null;
    for (let i = closes.length - 1; i >= 0; i--) if (closes[i] != null) { val = closes[i]; break; }
    return { value: val, changePct: chg, time: res.meta.regularMarketTime ? res.meta.regularMarketTime * 1000 : null };
  } catch { return null; }
}

async function fetchMacro() {
  const [dxy, tnx, twoY, vix, spx, usdjpy, eurusd, silver, oil] = await Promise.allSettled([
    fetchYahoo('DX-Y.NYB'), fetchYahoo('^TNX'), fetchYahoo('^TWO'),
    fetchYahoo('^VIX'), fetchYahoo('^GSPC'), fetchYahoo('USDJPY=X'),
    fetchYahoo('EURUSD=X'), fetchYahoo('SI=F'), fetchYahoo('CL=F')
  ]);
  const v = (r) => (r.status === 'fulfilled' ? r.value : null);
  return { dxy: v(dxy), tnx: v(tnx), twoY: v(twoY), vix: v(vix), spx: v(spx), usdjpy: v(usdjpy), eurusd: v(eurusd), silver: v(silver), oil: v(oil) };
}

// ---------------- gold news (RSS, server-side) ----------------
async function fetchNews() {
  const feeds = [
    'https://feeds.finance.yahoo.com/rss/2.0/headline?s=GC%3DF&region=US&lang=en-US',
    'https://feeds.finance.yahoo.com/rss/2.0/headline?s=XAUUSD%3DX&region=US&lang=en-US'
  ];
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 10000);
  try {
    for (const url of feeds) {
      const r = await fetch(url, { headers: { 'User-Agent': UA }, signal: ctrl.signal });
      if (!r.ok) continue;
      const txt = await r.text();
      const items = [...txt.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0, 7).map((m) => {
        const body = m[1];
        const g = (tag) => {
          const mm = body.match(new RegExp('<' + tag + '>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?</' + tag + '>'));
          return mm ? mm[1].trim() : null;
        };
        return { title: g('title') || 'Gold headline', link: g('link') || '#', pubDate: g('pubDate') || null };
      }).filter((x) => x.title && x.title.toLowerCase() !== 'yahoo finance gold futures');
      if (items.length) return items;
    }
    return [];
  } catch { return []; }
  finally { clearTimeout(t); }
}

module.exports = {
  TFS, getJson, fetchKlines, fetchAllKlines, fetchMarket, fetchDepth,
  depthMetrics, aggregateTradesMetrics, openStreams, onWsMessage, liveCache,
  fetchSpotGold, fetchMacro, fetchNews, apiHealth, now, set onCooldown(fn) { onCooldown = fn; }
};
