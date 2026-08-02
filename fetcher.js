'use strict';

// ============================================================================
// REAL-TIME DATA ACQUISITION — Binance Futures (XAUUSDT) + Yahoo Finance macro
// Every fetch wrapped in try/catch; failures return null (pipeline continues).
// ============================================================================

const B = 'https://fapi.binance.com';
const FD = B + '/futures/data';
const YF = 'https://query1.finance.yahoo.com/v8/finance/chart';
const TFS = ['1m', '3m', '5m', '15m', '1h', '4h', '1d'];

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';

async function getJson(url, headers = {}, timeoutMs = 12000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const r = await fetch(url, { headers: { 'User-Agent': UA, 'Accept': 'application/json', ...headers }, signal: ctrl.signal });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return await r.json();
  } finally { clearTimeout(t); }
}

async function fetchKlines(symbol, interval, limit = 200) {
  const url = `${B}/fapi/v1/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
  const j = await getJson(url);
  if (!Array.isArray(j)) throw new Error('klines not array');
  return j;
}

async function fetchAllKlines(symbol) {
  const out = {};
  const results = await Promise.allSettled(TFS.map((tf) =>
    fetchKlines(symbol, tf, 200).then((k) => ({ tf, k }))
  ));
  for (const r of results) {
    if (r.status === 'fulfilled') out[r.value.tf] = r.value.k;
    else out[r.value ? r.value.tf : '?'] = null;
  }
  return out;
}

async function fetchBinance(symbol) {
  const [
    price, stats, depth, aggTrades, premium, funding, oi,
    oiHist, globalLS, topLS, topPos, taker
  ] = await Promise.allSettled([
    getJson(`${B}/fapi/v1/ticker/price?symbol=${symbol}`),
    getJson(`${B}/fapi/v1/ticker/24hr?symbol=${symbol}`),
    getJson(`${B}/fapi/v1/depth?symbol=${symbol}&limit=50`),
    getJson(`${B}/fapi/v1/aggTrades?symbol=${symbol}&limit=1000`),
    getJson(`${B}/fapi/v1/premiumIndex?symbol=${symbol}`),
    getJson(`${B}/fapi/v1/fundingRate?symbol=${symbol}&limit=100`),
    getJson(`${B}/fapi/v1/openInterest?symbol=${symbol}`),
    getJson(`${FD}/openInterestHist?symbol=${symbol}&period=5m&limit=96`),
    getJson(`${FD}/globalLongShortAccountRatio?symbol=${symbol}&period=5m&limit=12`),
    getJson(`${FD}/topLongShortAccountRatio?symbol=${symbol}&period=5m&limit=12`),
    getJson(`${FD}/topLongShortPositionRatio?symbol=${symbol}&period=5m&limit=12`),
    getJson(`${FD}/takerlongshortRatio?symbol=${symbol}&period=5m&limit=12`)
  ]);
  const v = (r) => (r.status === 'fulfilled' ? r.value : null);
  return { price: v(price), stats: v(stats), depth: v(depth), aggTrades: v(aggTrades), premium: v(premium), funding: v(funding), oi: v(oi), oiHist: v(oiHist), globalLS: v(globalLS), topLS: v(topLS), topPos: v(topPos), taker: v(taker) };
}

async function fetchSpotGold() {
  try { return await getJson('https://api.gold-api.com/price/XAU', {}, 8000); }
  catch { return null; }
}

async function fetchYahoo(sym) {
  try {
    const j = await getJson(`${YF}/${encodeURIComponent(sym)}?interval=5m&range=1d`, {}, 10000);
    const res = j && j.chart && j.chart.result && j.chart.result[0];
    if (!res) return null;
    const q = res.indicators.quote[0];
    const closes = q.close;
    const lastIdx = closes.length - 1;
    let chg = null;
    for (let i = closes.length - 1; i > 0; i--) {
      const a = closes[i], b = closes[i - 1];
      if (a != null && b != null && b !== 0) { chg = ((a - b) / b) * 100; break; }
    }
    let val = null;
    for (let i = lastIdx; i >= 0; i--) if (closes[i] != null) { val = closes[i]; break; }
    return { value: val, changePct: chg, time: res.meta.regularMarketTime * 1000 || null };
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

// ---------- gold news feed (Yahoo GC=F RSS, server-side so no CORS) ----------
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

// order book derived metrics
function depthMetrics(depth, n = 10) {
  if (!depth || !depth.bids || !depth.asks) return null;
  let bidSum = 0, askSum = 0;
  for (let i = 0; i < n && i < depth.bids.length; i++) bidSum += +depth.bids[i][1];
  for (let i = 0; i < n && i < depth.asks.length; i++) askSum += +depth.asks[i][1];
  const tot = bidSum + askSum;
  const imbalance = tot > 0 ? ((bidSum - askSum) / tot) * 100 : 0;
  const bestBid = +depth.bids[0][0], bestAsk = +depth.asks[0][0];
  const qty = depth.bids.map((x) => +x[1]).concat(depth.asks.map((x) => +x[1]));
  const mean = qty.reduce((s, x) => s + x, 0) / qty.length;
  const walls = [];
  for (let i = 0; i < depth.bids.length; i++) if (+depth.bids[i][1] > 5 * mean) walls.push({ side: 'BID', price: +depth.bids[i][0], qty: +depth.bids[i][1] });
  for (let i = 0; i < depth.asks.length; i++) if (+depth.asks[i][1] > 5 * mean) walls.push({ side: 'ASK', price: +depth.asks[i][0], qty: +depth.asks[i][1] });
  return { bidSum, askSum, imbalance, spread: bestAsk - bestBid, bid: bestBid, ask: bestAsk, walls };
}

function aggregateTradesMetrics(trades) {
  if (!trades || !trades.length) return null;
  let buyVol = 0, sellVol = 0, buyNotional = 0, sellNotional = 0;
  for (const t of trades) {
    const q = +t.q;
    if (t.m === false) { buyVol += q; buyNotional += q * +t.p; }
    else { sellVol += q; sellNotional += q * +t.p; }
  }
  return { buyVol, sellVol, ratio: sellVol > 0 ? buyVol / sellVol : null, buyNotional, sellNotional };
}

module.exports = { TFS, fetchKlines, fetchAllKlines, fetchBinance, fetchSpotGold, fetchMacro, fetchNews, depthMetrics, aggregateTradesMetrics };
