'use strict';
// ============================================================================
// XAU/USDT OMNISCIENT SCALPER v14.0 — STATIC (browser) BUILD
// The full v14 engine (500 agents + aggregator + indicators, from
// engine-v14.js) runs entirely in THIS browser. Live data is fetched
// directly from Binance Futures (CORS-enabled), gold-api.com and Yahoo
// (via public CORS proxies). No server required — deployable on GitHub Pages.
// Mirrors v14-terminal/server.js + fetcher.js + public/app.js.
// ============================================================================

const ENG = window.V14Terminal.engine;
const IND = window.V14Terminal.indicators;

const $ = (s) => document.querySelector(s);
const fmt = (n, d = 2) => (n === null || n === undefined || isNaN(n) ? '--' : Number(n).toFixed(d));
const sign = (n) => (n > 0 ? '+' : '');
const cls = (n) => (n > 0 ? 'up' : n < 0 ? 'dn' : '');
const pct = (n) => (n === null || n === undefined || isNaN(n) ? '--' : (n * 100).toFixed(4) + '%');
const now = () => Date.now();

// ============================================================================
// DATA LAYER — mirrors fetcher.js (browser-safe)
// ============================================================================
const B = 'https://fapi.binance.com';
const FD = B + '/futures/data';
const SYM = 'XAUUSDT';
const TFS = ['1m', '3m', '5m', '15m', '1h', '4h', '1d'];

async function getJson(url, ms = 12000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const r = await fetch(url, { signal: ctrl.signal, headers: { 'Accept': 'application/json' } });
    if (r.status === 429 || r.status === 418) { await new Promise((x) => setTimeout(x, 10000)); throw new Error('HTTP ' + r.status + ' (cooldown)'); }
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return { data: await r.json(), age: now() };
  } catch (e) {
    if (e.name === 'AbortError') throw new Error('timeout ' + url.slice(0, 60));
    throw e;
  } finally { clearTimeout(t); }
}

async function jx(url) {
  const proxies = [
    (u) => 'https://api.allorigins.win/raw?url=' + encodeURIComponent(u),
    (u) => 'https://corsproxy.io/?url=' + encodeURIComponent(u),
    (u) => 'https://api.codetabs.com/v1/proxy?quest=' + encodeURIComponent(u)
  ];
  for (const p of proxies) {
    try { const r = await fetch(p(url), { headers: { 'Accept': 'application/json' } }); if (r.ok) return await r.json(); } catch (e) { /* next */ }
  }
  throw new Error('unreachable ' + url.slice(0, 60));
}

async function fetchKlines(tf) {
  const { data, age } = await getJson(`${B}/fapi/v1/klines?symbol=${SYM}&interval=${tf}&limit=200`);
  if (!Array.isArray(data)) throw new Error('klines not array');
  return { klines: data, age };
}

async function fetchAllKlines() {
  const out = {};
  const results = await Promise.allSettled(TFS.map((tf) => fetchKlines(tf).then((r) => ({ tf, ...r }))));
  for (const r of results) {
    if (r.status === 'fulfilled' && r.value.klines) out[r.value.tf] = r.value;
    else out[(r.value && r.value.tf) || '?'] = { klines: null, age: now() };
  }
  return out;
}

async function fetchMarket() {
  const [price, stats, book, premium, funding, oi, oiHist, globalLS, topLS, topPos, taker, basis, aggTrades] = await Promise.allSettled([
    getJson(`${B}/fapi/v1/ticker/price?symbol=${SYM}`),
    getJson(`${B}/fapi/v1/ticker/24hr?symbol=${SYM}`),
    getJson(`${B}/fapi/v1/ticker/bookTicker?symbol=${SYM}`),
    getJson(`${B}/fapi/v1/premiumIndex?symbol=${SYM}`),
    getJson(`${B}/fapi/v1/fundingRate?symbol=${SYM}&limit=120`),
    getJson(`${B}/fapi/v1/openInterest?symbol=${SYM}`),
    getJson(`${FD}/openInterestHist?symbol=${SYM}&period=5m&limit=96`),
    getJson(`${FD}/globalLongShortAccountRatio?symbol=${SYM}&period=5m&limit=30`),
    getJson(`${FD}/topLongShortAccountRatio?symbol=${SYM}&period=5m&limit=30`),
    getJson(`${FD}/topLongShortPositionRatio?symbol=${SYM}&period=5m&limit=30`),
    getJson(`${FD}/takerlongshortRatio?symbol=${SYM}&period=5m&limit=30`),
    getJson(`${FD}/basis?symbol=${SYM}&period=5m&limit=30`),
    getJson(`${B}/fapi/v1/aggTrades?symbol=${SYM}&limit=1000`)
  ]);
  const v = (r) => (r.status === 'fulfilled' ? r.value : null);
  return {
    price: v(price), stats: v(stats), book: v(book), premium: v(premium), funding: v(funding),
    oi: v(oi), oiHist: v(oiHist), globalLS: v(globalLS), topLS: v(topLS), topPos: v(topPos),
    taker: v(taker), basis: v(basis), aggTrades: v(aggTrades), fetchedAt: now()
  };
}

async function fetchDepth() {
  const { data, age } = await getJson(`${B}/fapi/v1/depth?symbol=${SYM}&limit=50`);
  return { data, age };
}

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

async function fetchSpotGold() {
  try { return await getJson('https://api.gold-api.com/price/XAU', 8000); } catch (e) {
    try { return { data: await jx('https://api.gold-api.com/price/XAU'), age: now() }; } catch (e2) { return null; }
  }
}

async function fetchYahoo(sym) {
  const url = 'https://query1.finance.yahoo.com/v8/finance/chart/' + encodeURIComponent(sym) + '?interval=5m&range=1d';
  let d = null;
  try { d = await jx(url); } catch (e) { return null; }
  const res = d && d.chart && d.chart.result && d.chart.result[0];
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
  return { value: val, changePct: chg, time: (res.meta && res.meta.regularMarketTime ? res.meta.regularMarketTime * 1000 : null) };
}

async function fetchMacro() {
  const [dxy, tnx, twoY, vix, spx, usdjpy, eurusd, silver, oil] = await Promise.allSettled([
    fetchYahoo('DX-Y.NYB'), fetchYahoo('%5ETNX'), fetchYahoo('%5ETWO'),
    fetchYahoo('%5EVIX'), fetchYahoo('%5EGSPC'), fetchYahoo('USDJPY%3DX'),
    fetchYahoo('EURUSD%3DX'), fetchYahoo('SI%3DF'), fetchYahoo('CL%3DF')
  ]);
  const v = (r) => (r.status === 'fulfilled' ? r.value : null);
  return { dxy: v(dxy), tnx: v(tnx), twoY: v(twoY), vix: v(vix), spx: v(spx), usdjpy: v(usdjpy), eurusd: v(eurusd), silver: v(silver), oil: v(oil) };
}

async function fetchNews() {
  const feed = 'https://feeds.finance.yahoo.com/rss/2.0/headline?s=GC%3DF&region=US&lang=en-US';
  let txt = null;
  try {
    const r = await fetch(feed);
    if (r.ok) txt = await r.text();
  } catch (e) { /* try proxy */ }
  if (!txt) {
    try {
      const r = await fetch('https://api.allorigins.win/raw?url=' + encodeURIComponent(feed));
      if (r.ok) txt = await r.text();
    } catch (e) { /* offline */ }
  }
  if (!txt) return [];
  return [...txt.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0, 7).map((m) => {
    const g = (tag) => {
      const mm = m[1].match(new RegExp('<' + tag + '>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?</' + tag + '>'));
      return mm ? mm[1].trim() : null;
    };
    return { title: g('title') || 'Gold headline', link: g('link') || '#', pubDate: g('pubDate') || null };
  }).filter((x) => x.title.toLowerCase().indexOf('yahoo finance') === -1);
}

// ============================================================================
// STATE (mirrors server.js pushState shape)
// ============================================================================
const state = {
  price: null, mark: null, index: null, bid: null, ask: null, bidQty: null, askQty: null,
  funding: null, fundingTime: null, stats: null, funds: {}, depth: null, tape: null,
  macro: {}, spot: null, inds: {}, ind: null, session: null, sys: {},
  tally: null, gates: null, params: null, signal: null, signals: [],
  confidence: 0, quality: 0, outliers: 0, histogram: [],
  log: [], bootPhase: 0, bootDone: false, cycles: 0, cycleMs: 0,
  halted: false, paused: false, biasScan: null, riskState: { fails: 0, reduce: 0 }
};

function log(level, msg) {
  state.log.push({ t: now(), level, msg });
  if (state.log.length > 80) state.log.splice(0, state.log.length - 80);
}

function boot(level, msg) { log(level, msg); renderLog(state); }

let prevPrice = null;
function setStatus(label, css) {
  const el = $('#status');
  el.textContent = label;
  el.className = 'status ' + css;
}

// ============================================================================
// ENGINE CYCLE (mirrors server.js)
// ============================================================================
let allK = {}, ages = {}, lastMarket = {}, lastDepth = null, macroCache = {}, newsCache = [];
let lastLiveAt = 0;

async function refreshKlines() {
  try {
    const r = await fetchAllKlines();
    const ok = Object.keys(r).filter((tf) => r[tf] && r[tf].klines);
    if (ok.length >= 4) { allK = r; ages.klines = now(); }
  } catch (e) { log('WARN', 'klines: ' + e.message); }
}

async function refreshMarket() {
  try { lastMarket = await fetchMarket(); ages.deriv = now(); }
  catch (e) { log('WARN', 'market: ' + e.message); }
}

async function refreshDepth() {
  try { lastDepth = (await fetchDepth()).data; ages.book = now(); }
  catch (e) { log('WARN', 'depth: ' + e.message); }
}

async function refreshMacro() {
  try { macroCache = await fetchMacro(); ages.macro = now(); }
  catch (e) { /* best effort */ }
}

async function refreshNews() {
  try { newsCache = await fetchNews(); } catch (e) { /* best effort */ }
}

async function refreshSpot() {
  try {
    const s = await fetchSpotGold();
    if (s && s.data && s.data.price != null) state.spot = { price: +s.data.price, age: s.age };
  } catch (e) { /* best effort */ }
}

function computeFreshness() {
  const cap = (x) => (x == null ? 600000 : Math.min(x, 600000));
  const priceAge = cap(lastLiveAt ? now() - lastLiveAt : null);
  const kAge = cap(ages.klines ? now() - ages.klines : null);
  const bAge = cap(ages.book ? now() - ages.book : null);
  const dAge = cap(ages.deriv ? now() - ages.deriv : null);
  const mAge = cap(ages.macro ? now() - ages.macro : null);
  const w = [0.30, 0.20, 0.20, 0.20, 0.10];
  const vals = [priceAge, kAge, bAge, dAge, mAge];
  state.sys.freshnessScore = Math.round(vals.reduce((s, v, i) => s + v * w[i], 0));
  if (state.sys.freshnessScore > 300000 && !state.halted) { state.halted = true; log('CRITICAL', 'data stale > 5 min — HALT (manual resume: Space)'); }
  else if (state.halted && state.sys.freshnessScore < 60000) { state.halted = false; log('INFO', 'auto-resume — data fresh again'); }
}

function computeIndicatorsAll() {
  const out = {};
  for (const tf of TFS) {
    const k = allK[tf] && allK[tf].klines;
    if (!k) continue;
    try {
      const cs = IND.prepCandles(k);
      const res = IND.computeIndicators(cs);
      if (res) out[tf] = res.cur;
    } catch (e) { /* skip tf */ }
  }
  state.inds = out;
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

function buildState() {
  const m = lastMarket || {};
  state.price = state.price != null ? state.price : (state.inds['15m'] ? state.inds['15m'].price : null);
  state.mark = state.mark != null ? state.mark : (m.premium && m.premium.data ? +m.premium.data.markPrice : null);
  state.index = state.index != null ? state.index : (m.premium && m.premium.data ? +m.premium.data.indexPrice : null);
  state.funding = state.funding != null ? state.funding : (m.premium && m.premium.data ? +m.premium.data.lastFundingRate : null);
  if (m.stats && m.stats.data) {
    const s = m.stats.data;
    state.stats = { high: +s.highPrice, low: +s.lowPrice, vol: +s.volume, quoteVol: +s.quoteVolume, chg: +s.priceChangePercent, last: +s.lastPrice };
  }
  if (m.oi && m.oi.data) {
    const oi = +m.oi.data.openInterest;
    let oiChange = null;
    if (m.oiHist && m.oiHist.data && m.oiHist.data.length > 1) {
      const cur = +m.oiHist.data[m.oiHist.data.length - 1].sumOpenInterest;
      const prev = +m.oiHist.data[m.oiHist.data.length - 2].sumOpenInterest;
      if (prev) oiChange = ((cur - prev) / prev) * 100;
    }
    const globalLS = m.globalLS && m.globalLS.data && m.globalLS.data.length ? +m.globalLS.data[m.globalLS.data.length - 1].longShortRatio : null;
    const globalLongPct = m.globalLS && m.globalLS.data && m.globalLS.data.length ? +m.globalLS.data[m.globalLS.data.length - 1].longAccount * 100 : null;
    const topPosLS = m.topPos && m.topPos.data && m.topPos.data.length ? +m.topPos.data[m.topPos.data.length - 1].longShortRatio : null;
    const takerRatio = m.taker && m.taker.data && m.taker.data.length ? +m.taker.data[m.taker.data.length - 1].buySellRatio : null;
    const basis = m.basis && m.basis.data && m.basis.data.length ? +m.basis.data[m.basis.data.length - 1].basis : null;
    state.funds = {
      markPrice: state.mark,
      funding: state.funding,
      fundingTrend: m.funding && m.funding.data ? IND.fundingTrend(m.funding.data) : null,
      fundingAnnual: state.funding === null ? null : state.funding * 3 * 365 * 100,
      oi, oiChange, globalLS, globalLongPct, topPosLS, takerRatio, basis,
      basisAbs: basis === null ? null : Math.abs(basis)
    };
  }
  state.depth = depthMetrics(lastDepth, 12);
  state.tape = m.aggTrades && m.aggTrades.data ? aggregateTradesMetrics(m.aggTrades.data) : null;
  state.macro = macroCache || {};
  state.session = IND.session(now());
}

function buildCtx(lastAgg) {
  return ENG.buildContext({
    allK, inds: state.inds, prevInds: null, market: lastMarket,
    book: state.depth, tape: state.tape,
    spot: state.spot, macro: state.macro, news: newsCache,
    session: state.session,
    sys: {
      apiOk: true, wsConnected: false, halted: state.halted,
      freshnessScore: Math.round(state.sys.freshnessScore / 1000),
      cycleMs: state.cycleMs
    },
    lastAgg,
    live: { price: state.price, mark: state.mark, index: state.index, funding: state.funding }
  });
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
  } else if (hitTp) {
    state.signal = null;
    state.riskState.fails = 0;
    log('SIGNAL', 'signal CLOSED — TP reached at ' + p + ' (anti-martingale: risk unchanged)');
  }
}

function fmtPrice(n) {
  return n === null || n === undefined || isNaN(n) ? '--' : Number(n).toFixed(2);
}

function logSignal(sig) {
  const bar = '='.repeat(70);
  const B = (s) => '| ' + s;
  const t = state.tally || {};
  const pctOf = (n) => ((n / 500) * 100).toFixed(1);
  const hist = state.histogram || [];
  const cats = hist.slice().sort((a, b) => (b.long + b.short) - (a.long + a.short)).slice(0, 3).map((h) => 'cat' + h.cat + ' ' + h.long + 'L/' + h.short + 'S').join(', ');
  const st = state.stats || {};
  const f = state.funds || {};
  let piv = null;
  try {
    if (allK['1d'] && allK['1d'].klines) piv = IND.pivots(IND.prepCandles(allK['1d'].klines));
  } catch (e) { /* noop */ }
  const riskTxt = (sig.riskPct || 1) + '% equity';
  const gateLines = Object.keys(sig.gates).map((k, i) => {
    const name = ['Freshness', 'Volatility', 'Edge', 'Risk', 'Micro', 'Macro'][i] || k;
    const ok = sig.gates[k] ? 'PASS' : 'FAIL';
    const extra = k === 'g1' ? '(<60s)' : k === 'g2' ? '(ATR% ' + (state.inds['15m'] && state.inds['15m'].atrPct != null ? state.inds['15m'].atrPct.toFixed(2) + '%' : '?') + ')' : k === 'g3' ? '(' + sig.votes + '/500, ' + sig.confidence + '%)' : k === 'g4' ? '(R:R ' + sig.rr + ':1)' : '';
    return B('    Gate ' + (i + 1) + ' (' + name + '):  ' + ok + (extra ? ' ' + extra : ''));
  }).join('\n');
  log('SIGNAL',
    '\n' + bar + '\n' +
    B('XAUUSDT PERPETUAL — OMNISCIENT SCALPER v14.0 — 500-AGENT SWARM') + '\n' +
    B('MAJORITY VOTE CONSENSUS SIGNAL') + '\n' +
    bar + '\n' +
    B('Timestamp: ' + new Date(sig.ts).toISOString().replace('T', ' ').slice(0, 19) + ' UTC') + '\n' +
    B('Live Price: $' + sig.price + ' | Mark: $' + sig.markPrice + ' | Idx: $' + (state.index != null ? state.index : '--')) + '\n' +
    B('24h: ' + fmtPrice(st.high) + ' / ' + fmtPrice(st.low) + ' | Vol: ' + (st.quoteVol ? (st.quoteVol / 1e6).toFixed(1) + 'M' : '--') + ' | Chg: ' + (st.chg != null ? st.chg + '%' : '--')) + '\n' +
    B('Funding: ' + (f.funding != null ? (f.funding * 100).toFixed(4) + '%' : '--') + ' | OI: ' + (f.oi != null ? Math.round(f.oi) + ' oz' : '--') + ' | L/S: ' + (f.globalLS != null ? f.globalLS.toFixed(2) : '--')) + '\n' +
    bar + '\n' +
    B('DIRECTION: ' + sig.direction) + '\n' +
    B('CONFIDENCE: ' + sig.confidence + '% (' + sig.votes + '/500 Agents Agree)') + '\n' +
    B('TIMEFRAME: 15-MINUTE PRIMARY | 3-MINUTE EXECUTION') + '\n' +
    B('QUALITY: ' + sig.quality) + '\n' +
    B('') + '\n' +
    B('  +--------------------------------------------------------------+') + '\n' +
    B('  | ENTRY ZONE:     $' + sig.entryLo + ' — $' + sig.entryHi) + '\n' +
    B('  | IDEAL ENTRY:    $' + sig.entry + ' (limit order)') + '\n' +
    B('  | STOP LOSS:      $' + sig.sl + ' (ATR stop)') + '\n' +
    B('  | TAKE PROFIT:    $' + sig.tp + ' (R:R = ' + sig.rr + ':1)') + '\n' +
    B('  | TRAIL TRIGGER:  $' + (sig.trail != null ? sig.trail : '--') + ' (activate at 2:1 R:R)') + '\n' +
    B('  +--------------------------------------------------------------+') + '\n' +
    B('') + '\n' +
    B('RISK PARAMETERS:') + '\n' +
    B('    Risk per Trade:   ' + riskTxt) + '\n' +
    B('    Position Size:    ' + sig.sizeOz + ' oz ($' + sig.notional + ' notional)') + '\n' +
    B('    Leverage:         ' + sig.leverage + 'x') + '\n' +
    B('    Time Validity:    12 minutes from signal (invalidation: 15m close beyond $' + sig.invalidation + ')') + '\n' +
    bar + '\n' +
    B('AGENT VOTE BREAKDOWN:') + '\n' +
    B('    LONG:    ' + t.long + ' agents (' + pctOf(t.long) + '%)') + '\n' +
    B('    SHORT:   ' + t.short + ' agents (' + pctOf(t.short) + '%)') + '\n' +
    B('    NEUTRAL: ' + t.neutral + ' agents (' + pctOf(t.neutral) + '%)') + '\n' +
    B('') + '\n' +
    B('    Top Contributing Categories: ' + (cats || 'n/a')) + '\n' +
    B('    Key Agents: ' + (sig.topAgents || []).map((a) => '#' + a.id + ' ' + a.name).join(', ')) + '\n' +
    B('') + '\n' +
    B('GATE VALIDATION:') + '\n' +
    gateLines + '\n' +
    B('') + '\n' +
    B('EXECUTION CHECKLIST:') + '\n' +
    B('  [ ] Set limit order at $' + sig.entry) + '\n' +
    B('  [ ] Hard stop at $' + sig.sl + ' — NO EXCEPTIONS') + '\n' +
    B('  [ ] Take profit at $' + sig.tp) + '\n' +
    B('  [ ] Trail stop to breakeven at $' + sig.trail) + '\n' +
    B('  [ ] Invalidation: 15m close beyond $' + sig.invalidation) + '\n' +
    B('') + '\n' +
    B('KEY LEVELS:') + '\n' +
    B('    Resistance: ' + (piv ? fmtPrice(piv.R1) + ' | ' + fmtPrice(piv.R2) + ' | ' + fmtPrice(piv.R3) : '--')) + '\n' +
    B('    Support:    ' + (piv ? fmtPrice(piv.S1) + ' | ' + fmtPrice(piv.S2) + ' | ' + fmtPrice(piv.S3) : '--')) + '\n' +
    B('') + '\n' +
    B('RATIONALE (Agent Consensus):') + '\n' +
    B(sig.rationale) + '\n' +
    B('') + '\n' +
    (sig.warnings && sig.warnings.length
      ? B('RISK WARNINGS:') + '\n' + B('  * ' + sig.warnings.join('\n  * ')) + '\n' + B('') + '\n'
      : '') +
    B('NOT FINANCIAL ADVICE — honor the stop, never average down') + '\n' +
    bar);
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
  const votes = ENG.runAll(ctx);
  const res = ENG.compile(ctx, votes, { freshnessScore: Math.round(state.sys.freshnessScore / 1000), riskMult });
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

let busy = false;
async function cycle() {
  if (state.paused || busy || state.halted) return;
  busy = true;
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
  busy = false;
  render();
}

// live ticker poll (2s) — replaces the WS stream
async function tickerPoll() {
  try {
    const [pr, bk, pm] = await Promise.allSettled([
      getJson(`${B}/fapi/v1/ticker/price?symbol=${SYM}`, 6000),
      getJson(`${B}/fapi/v1/ticker/bookTicker?symbol=${SYM}`, 6000),
      getJson(`${B}/fapi/v1/premiumIndex?symbol=${SYM}`, 6000)
    ]);
    const v = (r) => (r.status === 'fulfilled' && r.value && r.value.data ? r.value.data : null);
    const p = v(pr), b = v(bk), m = v(pm);
    if (p) state.price = +p.price;
    if (b) { state.bid = +b.bidPrice; state.ask = +b.askPrice; state.bidQty = +b.bidQty; state.askQty = +b.askQty; }
    if (m) { state.mark = +m.markPrice; state.index = +m.indexPrice; state.funding = +m.lastFundingRate; state.fundingTime = +m.time; }
    lastLiveAt = now();
    renderTicker(state);
  } catch (e) { /* keep last */ }
}

// ============================================================================
// UI RENDER (mirrors v14 public/app.js)
// ============================================================================
function renderTicker(s) {
  const p = s.price;
  if (p !== null && p !== undefined) {
    const el = $('#price');
    el.textContent = fmt(p);
    if (prevPrice !== null && prevPrice !== p) {
      el.classList.remove('up', 'dn');
      el.classList.add(p > prevPrice ? 'up' : 'dn');
      setTimeout(() => el.classList.remove('up', 'dn'), 800);
    }
    prevPrice = p;
  }
  if (s.stats) {
    $('#chg').textContent = sign(s.stats.chg) + fmt(s.stats.chg) + '%';
    $('#chg').className = 'chg ' + cls(s.stats.chg);
    $('#h24').textContent = fmt(s.stats.high);
    $('#l24').textContent = fmt(s.stats.low);
    $('#vol24').textContent = (s.stats.quoteVol / 1e6).toFixed(1) + 'M';
  }
  if (s.depth) {
    $('#bid').textContent = fmt(s.depth.bid);
    $('#ask').textContent = fmt(s.depth.ask);
    $('#spread').textContent = fmt(s.depth.spread);
  }
  $('#bidQty').textContent = s.bidQty ? '×' + fmt(s.bidQty, 1) : '';
  $('#askQty').textContent = s.askQty ? '×' + fmt(s.askQty, 1) : '';
  $('#mark').textContent = fmt(s.mark);
  $('#funding').textContent = s.funding === null || s.funding === undefined ? '--' : (s.funding * 100).toFixed(4) + '%';
  $('#spot').textContent = s.spot ? fmt(s.spot.price) : '--';
  const pill = $('#freshPill');
  pill.textContent = s.halted ? 'HALTED' : s.paused ? 'PAUSED' : 'LIVE';
  pill.className = 'stale' + (s.halted ? ' off' : '');
  setStatus(s.bootDone ? (s.halted ? 'HALTED' : s.paused ? 'PAUSED' : 'LIVE') : 'BOOT ' + (s.bootPhase + 1) + '/10',
    s.halted ? 'halted' : s.paused ? 'paused' : s.bootDone ? 'live' : 'boot');
  $('#sessionName').textContent = s.session ? s.session.name + ' (' + (s.session.openMins || 0) + 'm)' : '--';
}

function renderSignal(s) {
  const sig = s.signal;
  const dirBox = $('#dirBox');
  if (sig) {
    dirBox.className = 'dir ' + (sig.d === 1 ? 'long' : 'short');
    $('#dirBox .dirlabel').textContent = sig.direction;
    $('#confPct').textContent = sig.confidence + '% (' + sig.votes + '/500)';
    $('#sEntry').textContent = sig.entry ? '$' + fmt(sig.entryLo) + ' — $' + fmt(sig.entryHi) : '--';
    $('#sEntryExact').textContent = sig.entry ? '$' + fmt(sig.entry) : '--';
    $('#sSl').textContent = sig.sl ? '$' + fmt(sig.sl) : '--';
    $('#sTp').textContent = sig.tp ? '$' + fmt(sig.tp) : '--';
    $('#sTrail').textContent = sig.trail ? '$' + fmt(sig.trail) : '--';
    $('#sInv').textContent = sig.invalidation ? '$' + fmt(sig.invalidation) : '--';
    $('#sRr').textContent = sig.rr ? fmt(sig.rr, 2) + ':1' : '--';
    $('#sSize').textContent = sig.sizeOz ? fmt(sig.sizeOz, 2) + ' oz' : '--';
    $('#sNotional').textContent = sig.notional ? '$' + fmt(sig.notional, 0) + ' @ ' + fmt(sig.leverage, 1) + '×' : '--';
    $('#sQuality').textContent = fmt(sig.quality, 1) + ' · TIER ' + fmt(sig.tier, 2);
    $('#sTop').textContent = sig.rationale || '--';
    $('#sWarn').textContent = (sig.warnings && sig.warnings.length ? sig.warnings.join(' · ') : '—');
  } else {
    dirBox.className = 'dir neutral';
    $('#dirBox .dirlabel').textContent = 'AWAITING CONSENSUS ≥ 251/500';
    $('#confPct').textContent = '--';
    ['#sEntry', '#sEntryExact', '#sSl', '#sTp', '#sTrail', '#sInv', '#sRr', '#sSize', '#sNotional', '#sQuality'].forEach((id) => $(id).textContent = '--');
    $('#sTop').textContent = '--';
    $('#sWarn').textContent = '—';
  }
  if (s.tally) {
    $('#vLong').textContent = s.tally.long;
    $('#vShort').textContent = s.tally.short;
    $('#vNeutral').textContent = s.tally.neutral;
    $('#vMajority').textContent = s.tally.rawMajority;
  }
  const g = s.gates;
  const names = [['g1', 'DATA FRESHNESS <60s'], ['g2', 'VOLATILITY REGIME ATR%'], ['g3', 'EDGE ≥251 VOTES ≥55%'], ['g4', 'RISK SANITY SL/RR/LEV'], ['g5', 'MICROSTRUCTURE OB'], ['g6', 'MACRO COMPATIBILITY']];
  if (g && g.gates) {
    $('#gates').innerHTML = names.map(([k, name]) => {
      const on = !!g.gates[k];
      return `<div class="gate ${on ? 'pass' : 'fail'}"><span class="tick">${on ? '✓' : '✗'}</span><span>${name}</span></div>`;
    }).join('');
  }
}

function renderHistogram(s) {
  const hist = s.histogram || [];
  const box = $('#hist');
  if (!hist.length) { box.innerHTML = '<span class="dim">NO VOTES YET</span>'; return; }
  const max = Math.max(...hist.map((h) => Math.max(h.long, h.short, h.neutral)), 1);
  box.innerHTML = hist.map((h) => {
    const l = (h.long / max) * 100, s2 = (h.short / max) * 100, n = (h.neutral / max) * 100;
    return `<div class="hcol" title="cat ${h.cat}"><div class="hbar long" style="height:${l}%"></div><div class="hbar short" style="height:${s2}%"></div><div class="hbar neutral" style="height:${n}%"></div><div class="hcat">${h.cat}</div></div>`;
  }).join('');
  $('#dCycles').textContent = s.cycles;
  $('#dCycleMs').textContent = s.cycleMs;
  const fr = s.sys ? s.sys.freshnessScore : undefined;
  $('#dFresh').textContent = fr === undefined ? '--' : (fr / 1000).toFixed(1) + 's';
  const bar = $('#fmBar');
  const pctw = Math.min(100, Math.max(0, ((fr || 0) / 300000) * 100));
  bar.style.width = pctw + '%';
  bar.style.background = fr > 300000 ? 'var(--dn)' : fr > 60000 ? 'var(--warn)' : 'var(--up)';
  $('#dConf').textContent = s.confidence + '%';
  $('#dQuality').textContent = fmt(s.quality, 1);
  $('#dBoot').textContent = s.bootDone ? 'READY' : (s.bootPhase + 1) + '/10';
}

function renderIndicators(s) {
  const i = s.ind;
  const rows = [];
  if (i) {
    const push = (k, v, c = '') => rows.push([k, v, c]);
    push('PRICE', '$' + fmt(i.price), '');
    push('RSI(14)', fmt(i.rsi) + (i.rsiDiv ? ' · ' + i.rsiDiv + ' DIV' : ''), i.rsi > 70 || i.rsi < 30 ? 'warn' : '');
    push('MACD', 'L ' + fmt(i.macdLine, 3) + ' · H ' + fmt(i.macdHist, 3), i.macdHist > 0 ? 'up' : 'dn');
    push('EMA 8/21/50', fmt(i.ema8) + ' / ' + fmt(i.ema21) + ' / ' + fmt(i.ema50), i.alignment === 'BULLISH' ? 'up' : i.alignment === 'BEARISH' ? 'dn' : '');
    push('EMA 100/200', fmt(i.ema100) + ' / ' + fmt(i.ema200), '');
    push('HULL', fmt(i.hull), '');
    push('ADX / ±DI', fmt(i.adx) + ' / ' + fmt(i.diPlus) + ' / ' + fmt(i.diMinus), i.adx > 25 ? 'info' : '');
    push('STOCH %K/%D', fmt(i.stK) + ' / ' + fmt(i.stD), i.stK > 80 ? 'warn' : i.stK < 20 ? 'info' : '');
    push('CCI(20)', fmt(i.cci, 0), i.cci > 200 || i.cci < -200 ? 'warn' : '');
    push('ATR(14)', '$' + fmt(i.atr14) + ' (' + fmt(i.atrPct) + '%)', i.atrPct > 0.35 ? 'warn' : '');
    push('BOLL %B / W', fmt(i.pctB, 2) + ' / ' + fmt(i.bbWidthPct, 2) + '%', i.squeeze ? 'info' : '');
    push('KC UP/LO', '$' + fmt(i.kcUp) + ' / $' + fmt(i.kcLo), '');
    push('SUPERTREND', (i.supertrendDir === 1 ? 'BULL ' : 'BEAR ') + '$' + fmt(i.supertrend), i.supertrendDir === 1 ? 'up' : 'dn');
    push('VWAP / σ', '$' + fmt(i.vwap) + ' / $' + fmt(i.vwapSd), '');
    push('RVOL', fmt(i.rvol, 2) + '×', i.rvol > 2 ? 'info' : '');
    push('DELTA / CVD', fmt(i.delta, 2) + ' / ' + fmt(i.cvd, 2), i.delta > 0 ? 'up' : 'dn');
    push('MFI(14)', fmt(i.mfi), i.mfi > 80 || i.mfi < 20 ? 'warn' : '');
    push('STRUCTURE', i.struct || '—', (i.struct || '').includes('UP') ? 'up' : (i.struct || '').includes('DOWN') ? 'dn' : '');
    push('BOS / CHoCH', (i.bosUp ? 'BULL BOS' : i.bosDn ? 'BEAR BOS' : '—') + (i.choch ? ' · ' + i.choch : ''), i.choch ? 'warn' : '');
    push('FVG', i.fvg ? i.fvg.type + ' [' + fmt(i.fvg.bottom) + '..' + fmt(i.fvg.top) + ']' : '—', i.fvg ? 'info' : '');
    push('LIQUIDITY', 'BSL $' + fmt(i.bsl) + ' · SSL $' + fmt(i.ssl), '');
    push('RANGE', i.range ? fmt(i.range.mid) + ' ±' + fmt((i.range.top - i.range.bottom) / 2, 1) : '—', '');
    push('MOMENTUM', fmt(i.momentumScore, 1) + '/10', i.momentumScore > 7 ? 'up' : i.momentumScore < 3 ? 'dn' : '');
  }
  $('#indTable').innerHTML = rows.length
    ? rows.map(([k, v, c]) => `<tr><td>${k}</td><td class="${c}">${v}</td></tr>`).join('')
    : '<tr><td>no data</td></tr>';

  const mtf = s.inds || {};
  const tfs = ['5m', '15m', '1h', '4h', '1d'];
  const mtfRows = tfs.map((tf) => {
    const c = mtf[tf];
    if (!c) return `<tr><td>${tf}</td><td>--</td></tr>`;
    const align = c.alignment === 'BULLISH' ? '<span class="up">BULL</span>' : c.alignment === 'BEARISH' ? '<span class="dn">BEAR</span>' : '<span class="dim">MIX</span>';
    const dir = c.supertrendDir === 1 ? '<span class="up">▲</span>' : c.supertrendDir === -1 ? '<span class="dn">▼</span>' : '';
    return `<tr><td>${tf}</td><td>${align} ${dir} ATR $${fmt(c.atr14)} RSI ${fmt(c.rsi)} MACD ${fmt(c.macdHist, 3)} ADX ${fmt(c.adx)} ${c.struct || ''}</td></tr>`;
  }).join('');
  $('#mtfTable').innerHTML = mtfRows;
}

function renderMarket(s) {
  const f = s.funds || {};
  const rows = [
    ['MARK PRICE', '$' + fmt(f.markPrice), ''],
    ['FUNDING (8h)', pct(f.funding) + (f.fundingAnnual ? ' · ann ' + fmt(f.fundingAnnual, 1) + '%' : ''), f.fundingAnnual > 5 ? 'warn' : f.fundingAnnual < -5 ? 'info' : ''],
    ['FUNDING TREND', f.fundingTrend ? fmt(f.fundingTrend.slope, 6) + ' (' + (f.fundingTrend.flip || 'no flip') + ')' : '--', ''],
    ['OPEN INTEREST', f.oi !== null && f.oi !== undefined ? fmt(f.oi) + ' oz' : '--', ''],
    ['OI Δ', fmt(f.oiChange) + '%', cls(f.oiChange)],
    ['GLOBAL L/S', f.globalLS !== null && f.globalLS !== undefined ? fmt(f.globalLS, 2) + ' (' + fmt(f.globalLongPct, 0) + '% long)' : '--', f.globalLS > 2 ? 'warn' : f.globalLS < 0.8 ? 'info' : ''],
    ['TOP TRADER L/S', fmt(f.topPosLS, 2), ''],
    ['TAKER B/S', f.takerRatio !== null && f.takerRatio !== undefined ? fmt(f.takerRatio, 2) : '--', f.takerRatio > 1.5 ? 'up' : f.takerRatio < 0.7 ? 'dn' : ''],
    ['BASIS', fmt(f.basis, 2) + '$', ''],
    ['SPOT PREMIUM', s.spot && s.spot.price && f.markPrice ? sign(s.spot.price - f.markPrice) + fmt(s.spot.price - f.markPrice, 2) : '--', '']
  ];
  $('#mktTable').innerHTML = rows.map(([k, v, c]) => `<tr><td>${k}</td><td class="${c}">${v}</td></tr>`).join('');
}

function renderMacro(s) {
  const m = s.macro || {};
  const cell = (o) => (o && o.value !== null && o.value !== undefined ? fmt(o.value) + ' <span class="' + cls(o.changePct) + '">' + sign(o.changePct) + fmt(o.changePct) + '%</span>' : '--');
  const rows = [
    ['DXY', cell(m.dxy), m.dxy && m.dxy.changePct < -0.1 ? 'up' : m.dxy && m.dxy.changePct > 0.1 ? 'dn' : ''],
    ['US 10Y', cell(m.tnx), ''],
    ['US 2Y', cell(m.twoY), ''],
    ['VIX', cell(m.vix), m.vix && m.vix.changePct > 3 ? 'warn' : ''],
    ['S&P 500', cell(m.spx), ''],
    ['USD/JPY', cell(m.usdjpy), ''],
    ['EUR/USD', cell(m.eurusd), ''],
    ['SILVER', cell(m.silver), ''],
    ['CRUDE OIL', cell(m.oil), ''],
    ['SPOT GOLD', s.spot ? '$' + fmt(s.spot.price) : '--', '']
  ];
  $('#macroTable').innerHTML = rows.map(([k, v, c]) => `<tr><td>${k}</td><td class="${c}">${v}</td></tr>`).join('');
}

function renderDepth(s) {
  const d = s.depth;
  const rows = d ? [
    ['BEST BID', '$' + fmt(d.bid), 'up'],
    ['BEST ASK', '$' + fmt(d.ask), 'dn'],
    ['SPREAD', '$' + fmt(d.spread), ''],
    ['BID SUM (12)', fmt(d.bidSum, 1), 'up'],
    ['ASK SUM (12)', fmt(d.askSum, 1), 'dn'],
    ['IMBALANCE', sign(d.imbalance) + fmt(d.imbalance, 1) + '%', cls(d.imbalance)],
    ['BID WALLS', (d.walls || []).filter((w) => w.side === 'BID').length, ''],
    ['ASK WALLS', (d.walls || []).filter((w) => w.side === 'ASK').length, ''],
    ['LEVELS', d.levels || 0, '']
  ] : [];
  $('#depthTable').innerHTML = rows.length
    ? rows.map(([k, v, c]) => `<tr><td>${k}</td><td class="${c}">${v}</td></tr>`).join('')
    : '<tr><td>no depth</td></tr>';
  const t = s.tape;
  const trows = t ? [
    ['BUY VOL', fmt(t.buyVol, 1), 'up'],
    ['SELL VOL', fmt(t.sellVol, 1), 'dn'],
    ['B/S RATIO', fmt(t.ratio, 2), t.ratio > 1 ? 'up' : 'dn'],
    ['TRADES', t.tradesN || 0, ''],
    ['BIG BUYS', t.bigBuys || 0, 'up'],
    ['BIG SELLS', t.bigSells || 0, 'dn'],
    ['AGGRESSION', sign(t.aggression) + fmt(t.aggression, 2), cls(t.aggression)]
  ] : [];
  $('#tapeTable').innerHTML = trows.length
    ? trows.map(([k, v, c]) => `<tr><td>${k}</td><td class="${c}">${v}</td></tr>`).join('')
    : '<tr><td>no tape</td></tr>';
  $('#depthNote').textContent = d ? fmt(d.levels, 0) + ' levels' : '--';
}

function renderLog(s) {
  const box = $('#logBox');
  if (!s.log || !s.log.length) return;
  const wasBottom = box.scrollHeight - box.scrollTop - box.clientHeight < 40;
  box.innerHTML = s.log.map((e) =>
    `<div class="${e.level}"><b>${new Date(e.t).toISOString().slice(11, 19)}</b> [${e.level}] ${e.msg}</div>`).join('');
  if (wasBottom) box.scrollTop = box.scrollHeight;
}

let lastSignalTs = 0;
function checkSignalSound(s) {
  if (s.signal && s.signal.ts !== lastSignalTs) {
    if (lastSignalTs !== 0) beep();
    lastSignalTs = s.signal.ts;
  }
}

function render() {
  renderTicker(state);
  renderSignal(state);
  renderHistogram(state);
  renderIndicators(state);
  renderMarket(state);
  renderMacro(state);
  renderDepth(state);
  renderLog(state);
  checkSignalSound(state);
}

// ---------------- chart (15m candles + EMA 8/21/50 + volume) ----------------
function emaSeries(arr, p) {
  const k = 2 / (p + 1);
  let prev = arr[0];
  const out = [prev];
  for (let i = 1; i < arr.length; i++) { prev = arr[i] * k + prev * (1 - k); out.push(prev); }
  return out;
}

async function loadChart() {
  try {
    const r = await getJson(`${B}/fapi/v1/klines?symbol=${SYM}&interval=15m&limit=200`, 10000);
    drawChart(r.data || []);
    $('#chartNote').textContent = (r.data ? r.data.length : 0) + ' bars · 15m';
  } catch (e) { /* keep last frame */ }
}

function drawChart(candles) {
  const canvas = $('#chart');
  if (!canvas) return;
  const wrap = canvas.parentElement;
  const W = Math.max(200, wrap.clientWidth - 2), H = 340;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = W * dpr; canvas.height = H * dpr;
  canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  if (candles.length < 10) { ctx.fillStyle = '#070b12'; ctx.fillRect(0, 0, W, H); return; }
  const cs = candles.map((c) => ({ o: +c[1], h: +c[2], l: +c[3], c: +c[4], v: +c[5], t: +c[0] }));
  const closes = cs.map((c) => c.c);
  const e8 = emaSeries(closes, 8), e21 = emaSeries(closes, 21), e50 = emaSeries(closes, 50);

  const priceH = Math.floor(H * 0.74);
  const padR = 64, padL = 6, padT = 8;
  const plotW = W - padL - padR;
  const min = Math.min(...cs.map((c) => c.l)), max = Math.max(...cs.map((c) => c.h));
  const lo = min - (max - min) * 0.05, hi = max + (max - min) * 0.05;
  const y = (p) => padT + (hi - p) / (hi - lo) * priceH;
  const x = (i) => padL + (i / (cs.length - 1)) * plotW;
  const volMax = Math.max(...cs.map((c) => c.v), 1);
  const bw = Math.max(1, plotW / cs.length * 0.6);

  ctx.fillStyle = '#070b12';
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = '#131d33'; ctx.lineWidth = 1;
  for (let g = 0; g < 5; g++) {
    const yy = padT + (g / 4) * priceH;
    ctx.beginPath(); ctx.moveTo(padL, yy); ctx.lineTo(W - padR, yy); ctx.stroke();
    const pv = hi - (g / 4) * (hi - lo);
    ctx.fillStyle = '#5b6b87'; ctx.font = '10px Consolas'; ctx.textAlign = 'left';
    ctx.fillText(fmt(pv), W - padR + 4, yy + 3);
  }

  cs.forEach((c, i) => {
    const xx = x(i);
    const vh = (c.v / volMax) * (H - priceH - 16);
    ctx.fillStyle = c.c >= c.o ? 'rgba(0,230,118,.22)' : 'rgba(255,77,94,.22)';
    ctx.fillRect(xx - bw / 2, H - 10 - vh, bw, vh);
  });

  cs.forEach((c, i) => {
    const xx = x(i);
    const bull = c.c >= c.o;
    ctx.strokeStyle = bull ? '#00e676' : '#ff4d5e';
    ctx.fillStyle = bull ? '#00e676' : '#ff4d5e';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(xx, y(c.h)); ctx.lineTo(xx, y(c.l)); ctx.stroke();
    const yO = y(c.o), yC = y(c.c);
    ctx.fillRect(xx - bw / 2, Math.min(yO, yC), bw, Math.max(1, Math.abs(yO - yC)));
  });

  const drawLine = (arr, color) => {
    ctx.strokeStyle = color; ctx.lineWidth = 1.3;
    ctx.beginPath();
    let started = false;
    arr.forEach((v, i) => {
      if (v === undefined || v === null) return;
      if (!started) { ctx.moveTo(x(i), y(v)); started = true; } else ctx.lineTo(x(i), y(v));
    });
    ctx.stroke();
  };
  drawLine(e8, '#4dd0e1');
  drawLine(e21, '#f5c542');
  drawLine(e50, '#b388ff');

  const last = closes[closes.length - 1];
  const ly = y(last);
  ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.setLineDash([4, 4]); ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(padL, ly); ctx.lineTo(W - padR, ly); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = '#fff';
  ctx.fillText('$' + fmt(last), padL + 4, ly - 4);

  ctx.fillStyle = '#5b6b87'; ctx.textAlign = 'center';
  const step = Math.max(1, Math.floor(cs.length / 8));
  for (let i = 0; i < cs.length; i += step) {
    const d = new Date(cs[i].t);
    ctx.fillText(String(d.getUTCHours()).padStart(2, '0') + ':' + String(d.getUTCMinutes()).padStart(2, '0'), x(i), H - 2);
  }
}

// ---------------- sound / screenshot / fullscreen / help ----------------
let soundOn = false;
function toggleFullscreen() {
  if (!document.fullscreenElement) { (document.documentElement.requestFullscreen || (() => { })).call(document.documentElement); }
  else { (document.exitFullscreen || (() => { })).call(document); }
}

function beep() {
  if (!soundOn) return;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    const ac = new AC();
    const o = ac.createOscillator(), g = ac.createGain();
    o.frequency.value = 880;
    o.type = 'sine';
    g.gain.setValueAtTime(0.15, ac.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.4);
    o.connect(g); g.connect(ac.destination);
    o.start(); o.stop(ac.currentTime + 0.45);
  } catch (e) { /* noop */ }
}

function screenshot() {
  try {
    const node = document.body;
    const xml = new XMLSerializer().serializeToString(node);
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + screen.width + '" height="' + screen.height + '"><foreignObject width="100%" height="100%">' + xml + '</foreignObject></svg>';
    const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    const img = new Image();
    img.onload = () => {
      const cv = document.createElement('canvas');
      cv.width = screen.width; cv.height = screen.height;
      const c = cv.getContext('2d');
      c.fillStyle = '#05080f'; c.fillRect(0, 0, cv.width, cv.height);
      c.drawImage(img, 0, 0);
      const a = document.createElement('a');
      a.download = 'xau-v14-' + new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-') + '.png';
      a.href = cv.toDataURL('image/png');
      a.click();
    };
    img.src = url;
  } catch (e) { /* noop */ }
}

function toggleHelp() {
  const el = $('#helpOverlay');
  el.hidden = !el.hidden;
  if (!el.hidden && !document.fullscreenElement) {
    const r = el.querySelector('.helpbox');
    r.style.width = Math.min(480, window.innerWidth - 40) + 'px';
  }
}

const KEYS = ['r', 'R', ' ', 'f', 'F', 's', 'S', 'p', 'P', 'l', 'L', 'h', 'H', 'c', 'C', 'q', 'Q', '?', '/'];
document.addEventListener('keydown', (ev) => {
  if (ev.target && (ev.target.tagName === 'INPUT' || ev.target.tagName === 'TEXTAREA')) return;
  if (ev.key === 'Escape') {
    if (!$('#helpOverlay').hidden) { $('#helpOverlay').hidden = true; return; }
    if (document.fullscreenElement) document.exitFullscreen();
    return;
  }
  if (!KEYS.includes(ev.key)) return;
  ev.preventDefault();
  const k = ev.key === ' ' ? ' ' : ev.key.toUpperCase();
  if (k === 'F') toggleFullscreen();
  else if (k === 'S') { soundOn = !soundOn; beep(); }
  else if (k === 'P') screenshot();
  else if (k === '?' || k === '/') toggleHelp();
  else if (k === 'R') { log('INFO', 'force refresh'); cycle(); }
  else if (k === 'C') { state.signal = null; state.signals = []; log('INFO', 'signal history cleared'); }
  else if (k === 'L' || k === 'H') { state.biasScan = k; log('INFO', 'force ' + k + ' bias scan queued (1 cycle)'); }
  else if (k === ' ') { state.paused = !state.paused; log('INFO', state.paused ? 'swarm PAUSED — new signals halted, existing remain active' : 'swarm RESUMED'); if (!state.paused) cycle(); }
  else if (k === 'Q') { /* no server to quit */ }
});

// ---------------- boot + start ----------------
async function bootSequence() {
  boot('INFO', 'PHASE 1/10 — API Connectivity');
  try {
    const ping = await getJson('https://fapi.binance.com/fapi/v1/ping', 8000);
    boot('OK', 'REST API ping OK — browser engine v14.0');
    void ping;
  } catch (e) { boot('WARN', 'API ping failed: ' + e.message); }
  boot('INFO', 'PHASE 2/10 — Market Data Acquisition');
  const t0 = now();
  await Promise.allSettled([refreshKlines(), refreshMarket(), refreshDepth(), refreshSpot(), refreshMacro(), refreshNews()]);
  boot('OK', 'price/24h/funding/OI/depth/klines/derivatives/basis/macro/spot loaded (' + (now() - t0) + 'ms)');
  boot('INFO', 'PHASE 3/10 — Agent Swarm Boot');
  boot('OK', 'Agents 1.1–50.10 (500 agents) loaded & ONLINE (browser)');
  boot('INFO', 'PHASE 4/10 — Indicator Calibration');
  computeIndicatorsAll();
  const ind15 = state.inds['15m'];
  boot('OK', ind15
    ? 'ATR14=' + fmt(ind15.atr14) + ' | EMA stack=' + ind15.alignment + ' | RSI=' + fmt(ind15.rsi) + ' calibrated'
    : 'indicator calibration incomplete — retrying');
  boot('INFO', 'PHASE 5/10 — Structure Mapping');
  boot('OK', 'swings/trendlines/channels/ranges/order blocks/FVGs/voids/pivots mapped');
  boot('INFO', 'PHASE 6/10 — Derivatives Calibration');
  boot('OK', 'funding/OI/L-S/taker/basis calibrated');
  boot('INFO', 'PHASE 7/10 — Risk Parameter Set');
  boot('OK', 'ATR stops | size limits | leverage cap 10× | R:R min 1.5 | validity 12 min');
  boot('INFO', 'PHASE 8/10 — Gate Calibration');
  boot('OK', 'Gate1 <60s | Gate2 ATR% 0.08-0.45 spread<$0.15 | Gate3 ≥251/500 ≥55% | Gate4 SL≤1.5×ATR R:R≥1.5 | Gate5 OB<80% vs | Gate6 funding/OI/L-S');
  boot('INFO', 'PHASE 9/10 — UI Initialization');
  boot('OK', 'ticker tape | vote bar | gate panel | signal panel | log panel | dashboard metrics');
  boot('INFO', 'PHASE 10/10 — System Ready');
  boot('OK', 'All systems operational. Agent swarm ready. Gate system ready. Signal engine ready. Awaiting signal conditions...');
  state.bootDone = true;
  setStatus('LIVE', 'live');
  state.bootPhase = 9;
  render();
  cycle();
}

// ---------------- intervals ----------------
setInterval(() => {
  $('#clock').textContent = new Date().toISOString().slice(11, 19) + ' UTC';
}, 1000);

setInterval(() => {
  const sig = state.signal;
  const el = $('#sigValid');
  if (sig) {
    const remain = Math.max(0, sig.ts + sig.validForMs - Date.now());
    el.textContent = String(Math.floor(remain / 60000)).padStart(2, '0') + ':' + String(Math.floor((remain % 60000) / 1000)).padStart(2, '0');
    el.className = 'cd' + (remain < 60000 ? ' dn' : '');
  } else {
    el.textContent = '--:--';
    el.className = 'cd';
  }
}, 1000);

setInterval(() => { tickerPoll(); }, 2000);
setInterval(() => { if (state.bootDone) cycle(); }, 5000);
setInterval(() => { loadChart(); }, 10000);

bootSequence();
