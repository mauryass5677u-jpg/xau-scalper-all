'use strict';

// XAU/USDT OMNISCIENT SCALPER — fully client-side edition (GitHub Pages capable).
// Runs the entire engine (indicators + 50 agents + aggregation + gates) in the browser,
// fetching live data directly from Binance Futures (CORS-enabled) and gold-api.com.
// Yahoo macro (DXY/yields/VIX) is best-effort via a CORS proxy chain.

const IS_NODE = typeof module !== 'undefined' && typeof module.exports !== 'undefined';

const $ = (s) => (typeof document !== 'undefined' ? document.querySelector(s) : null);
const $$ = (s) => (typeof document !== 'undefined' ? document.querySelectorAll(s) : []);
const TFS = ['1m', '3m', '5m', '15m', '1h', '4h', '1d'];
let S = null;
let prevPrice = null;
let tf = '15m';

const fmt = (n, d = 2) => (n === null || n === undefined || isNaN(n) ? '--' : Number(n).toFixed(d));
const sign = (n) => (n > 0 ? '+' : '');
const cls = (n) => (n > 0 ? 'up' : n < 0 ? 'dn' : '');

// ============================================================================
// DATA LAYER (browser)
// ============================================================================
const B = 'https://fapi.binance.com';
const FD = B + '/futures/data';
const SYM = 'XAUUSDT';

async function j(url, ms = 12000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const r = await fetch(url, { signal: ctrl.signal, headers: { 'Accept': 'application/json' } });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return await r.json();
  } finally { clearTimeout(t); }
}

async function jx(url) {
  try { return await j(url, 6000); } catch (e) { /* fall through to proxies */ }
  const proxies = [
    (u) => 'https://api.allorigins.win/raw?url=' + encodeURIComponent(u),
    (u) => 'https://corsproxy.io/?url=' + encodeURIComponent(u),
    (u) => 'https://api.codetabs.com/v1/proxy?quest=' + encodeURIComponent(u)
  ];
  for (const p of proxies) {
    try { return await j(p(url), 9000); } catch (e) { /* next */ }
  }
  throw new Error('unreachable: ' + url.slice(0, 60));
}

async function fetchAllKlines() {
  const out = {};
  const results = await Promise.allSettled(TFS.map((t) => j(`${B}/fapi/v1/klines?symbol=${SYM}&interval=${t}&limit=200`).then((k) => ({ t, k }))));
  for (const r of results) if (r.status === 'fulfilled') out[r.value.t] = r.value.k;
  return out;
}

async function fetchBinance() {
  const [price, stats, depth, aggTrades, premium, funding, oi, oiHist, globalLS, topLS, topPos, taker] = await Promise.allSettled([
    j(`${B}/fapi/v1/ticker/price?symbol=${SYM}`),
    j(`${B}/fapi/v1/ticker/24hr?symbol=${SYM}`),
    j(`${B}/fapi/v1/depth?symbol=${SYM}&limit=50`),
    j(`${B}/fapi/v1/aggTrades?symbol=${SYM}&limit=1000`),
    j(`${B}/fapi/v1/premiumIndex?symbol=${SYM}`),
    j(`${B}/fapi/v1/fundingRate?symbol=${SYM}&limit=100`),
    j(`${B}/fapi/v1/openInterest?symbol=${SYM}`),
    j(`${FD}/openInterestHist?symbol=${SYM}&period=5m&limit=96`),
    j(`${FD}/globalLongShortAccountRatio?symbol=${SYM}&period=5m&limit=12`),
    j(`${FD}/topLongShortAccountRatio?symbol=${SYM}&period=5m&limit=12`),
    j(`${FD}/topLongShortPositionRatio?symbol=${SYM}&period=5m&limit=12`),
    j(`${FD}/takerlongshortRatio?symbol=${SYM}&period=5m&limit=12`)
  ]);
  const v = (r) => (r.status === 'fulfilled' ? r.value : null);
  return { price: v(price), stats: v(stats), depth: v(depth), aggTrades: v(aggTrades), premium: v(premium), funding: v(funding), oi: v(oi), oiHist: v(oiHist), globalLS: v(globalLS), topLS: v(topLS), topPos: v(topPos), taker: v(taker) };
}

async function fetchSpot() {
  try { return await j('https://api.gold-api.com/price/XAU', 8000); } catch (e) {
    try { return await jx('https://api.gold-api.com/price/XAU'); } catch (e2) { return null; }
  }
}

async function fetchYahoo(sym) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?interval=5m&range=1d`;
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
  return { value: val, changePct: chg, time: res.meta.regularMarketTime * 1000 || null };
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
// DERIVED METRICS (mirrors server fetcher.js)
// ============================================================================
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

// ============================================================================
// COMPUTE STATE (mirrors server refreshCore)
// ============================================================================
function computeAll(allK) {
  const indLib = (typeof window !== 'undefined') ? window.TerminalIndicators : globalThis.TerminalIndicators;
  const inds = {}, prevInds = {};
  for (const t of TFS) {
    const raw = allK[t];
    if (!raw || raw.length < 80) continue;
    const cs = indLib.prepCandles(raw);
    const full = indLib.computeIndicators(cs);
    if (full) inds[t] = full.cur;
    const prev = indLib.computeIndicators(cs.slice(0, -1));
    if (prev) prevInds[t] = prev.cur;
  }
  return { inds, prevInds };
}

async function computeState() {
  const eng = (typeof window !== 'undefined') ? window.TerminalEngine : globalThis.TerminalEngine;
  const indLib = (typeof window !== 'undefined') ? window.TerminalIndicators : globalThis.TerminalIndicators;
  const t0 = Date.now();
  const [kRes, bRes, sRes, mRes, nRes] = await Promise.allSettled([
    fetchAllKlines(), fetchBinance(), fetchSpot(), fetchMacro(), fetchNews()
  ]);
  const allK = kRes.status === 'fulfilled' ? kRes.value : {};
  const bin = bRes.status === 'fulfilled' ? bRes.value : null;
  const spot = sRes.status === 'fulfilled' ? sRes.value : null;
  const macro = mRes.status === 'fulfilled' ? mRes.value : {};
  const news = nRes.status === 'fulfilled' ? nRes.value : [];
  if (!Object.keys(allK).length) throw new Error('no klines');

  const { inds, prevInds } = computeAll(allK);
  const depthHist = bin && bin.depth ? [depthMetrics(bin.depth)] : null;
  const trades = bin && bin.aggTrades ? aggregateTradesMetrics(bin.aggTrades) : null;

  const ctx = eng.buildContext({ tf, allK, inds, prevInds, funds: bin, depth: depthHist, trades, macro, spot });
  const votes = eng.runAgents(ctx);
  const signal = eng.buildSignal(ctx, votes);
  const layers = eng.layers(ctx, votes);
  const gates = eng.checkGates(ctx, signal, ctx.depth, Date.now() - t0);

  const targetCs = indLib.prepCandles(allK[tf] || []);
  const candles = targetCs.slice(-160).map((c) => ({ t: c.t, o: c.o, h: c.h, l: c.l, c: c.c, v: c.v }));

  return {
    ts: new Date(t0).toISOString(), fetchedAt: t0, tf,
    price: bin && bin.price ? +bin.price.price : null,
    markPrice: ctx.funds.markPrice,
    stats: bin && bin.stats ? {
      priceChangePct: +bin.stats.priceChangePercent, high: +bin.stats.highPrice,
      low: +bin.stats.lowPrice, open: +bin.stats.openPrice, quoteVol: +bin.stats.quoteVolume,
      bid: +bin.stats.bidPrice, ask: +bin.stats.askPrice
    } : null,
    spot, macro, news,
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
    priceAge: Date.now() - t0,
    stale: false,
    errors: []
  };
}

// ============================================================================
// RENDER (same as Node-served terminal)
// ============================================================================
function renderTfBar() {
  const bar = $('#tfBar');
  if (!bar) return;
  bar.innerHTML = TFS.map((t) => `<button data-tf="${t}" class="${t === tf ? 'active' : ''}">${t}</button>`).join('');
  bar.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => { tf = b.dataset.tf; refresh(); }));
}

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
    $('#chg').textContent = sign(s.stats.priceChangePct) + fmt(s.stats.priceChangePct) + '%';
    $('#chg').className = 'chg ' + cls(s.stats.priceChangePct);
    $('#h24').textContent = fmt(s.stats.high);
    $('#l24').textContent = fmt(s.stats.low);
    $('#vol24').textContent = (s.stats.quoteVol / 1e6).toFixed(1) + 'M';
  }
  if (s.depth) {
    $('#bid').textContent = fmt(s.depth.bid);
    $('#ask').textContent = fmt(s.depth.ask);
    $('#spread').textContent = fmt(s.depth.spread);
  }
  $('#mark').textContent = fmt(s.markPrice);
  $('#spot').textContent = s.spot ? fmt(s.spot.price) : '--';
  $('#stale').textContent = s.stale ? 'STALE' : 'LIVE';
  $('#stale').className = 'stale' + (s.stale ? ' off' : '');
}

function renderSignal(s) {
  const sig = s.signal;
  const dirBox = $('#dirBox');
  dirBox.className = 'dir ' + (sig.d === 1 ? 'long' : sig.d === -1 ? 'short' : 'neutral');
  $('#dirBox .dirlabel').textContent = sig.direction;
  $('#confPct').textContent = sig.d === 0 ? 'AWAITING ≥5 VOTES' : 'CONFIDENCE ' + sig.confPct + '% · TCS ' + fmt(sig.tcs, 0) + '/100';

  const e = (id, val, css = '') => { const el = $(id); el.textContent = val; el.className = 'v ' + css; };
  e('#sEntry', sig.entry ? `$${fmt(sig.entryLo)} — $${fmt(sig.entryHi)}` : '--');
  e('#sEntryExact', sig.entry ? `$${fmt(sig.entry)}` : '--', 'hot');
  e('#sSl', sig.sl ? `$${fmt(sig.sl)}` : '--', 'dn');
  e('#sTp1', sig.tp1 ? `$${fmt(sig.tp1)}` : '--', 'up');
  e('#sTp2', sig.tp2 ? `$${fmt(sig.tp2)}` : '--', 'up');
  e('#sTp3', sig.tp3 ? `$${fmt(sig.tp3)}` : '--', 'up');
  e('#sWarning', sig.warning ? `$${fmt(sig.warning)}` : '--', 'warn');
  e('#sDanger', sig.danger ? `$${fmt(sig.danger)}` : '--', 'warn');
  e('#sTrigger', sig.trigger || '--', 'trig');

  $('#sRationale').innerHTML = sig.rationale ? `<span class="rlabel">RATIONALE</span> ${sig.rationale}` : '';
  $('#sRationale').className = 'rationale' + (sig.d === 0 ? ' muted' : '');

  $('#voteRow').innerHTML = `
    <div class="lg"><b>${sig.longVotes}</b>LONG</div>
    <div class="sg"><b>${sig.shortVotes}</b>SHORT</div>
    <div class="nt"><b>${sig.neutralVotes}</b>NEUTRAL</div>
    <div class="nt"><b>${sig.entryVotes || 0}</b>ENTRY VOTES</div>
  `;

  $('#szRisk').textContent = '$' + fmt(sig.riskAmt, 0);
  $('#szOz').textContent = fmt(sig.sizeOz, 2) + ' oz';
  $('#szUsd').textContent = '$' + fmt(sig.posUsd, 0);
  $('#szLev').textContent = fmt(sig.leverage, 1) + '×';
  $('#szRR').textContent = fmt(sig.rr1, 1) + ':1';
  $('#szEv').textContent = sign(sig.evPct) + fmt(sig.evPct) + '%';
  $('#szPw').textContent = sig.pWin + '%';

  const g = s.gates.gates, n = s.gates.notes;
  const names = [['gate1', 'DATA FRESHNESS'], ['gate2', 'VOLATILITY REGIME'], ['gate3', 'EDGE VERIFICATION'], ['gate4', 'RISK SANITY'], ['gate5', 'MICROSTRUCTURE'], ['gate6', 'MACRO COMPATIBILITY']];
  $('#gates').innerHTML = names.map(([k, name]) => {
    const note = n[k] || '';
    return `<div class="gate ${g[k] ? 'pass' : 'fail'}"><span class="tick">${g[k] ? '✓' : '✗'}</span><span>${name} <em style="color:var(--dim)">${note}</em></span></div>`;
  }).join('');

  $('#footData').textContent = `DATA FETCHED ${s.ts ? new Date(s.ts).toUTCString().slice(17, 25) : ''} UTC · TF ${s.tf} · 50 AGENTS · MODE CLUSTER AGGREGATION`;
  $('#tfNote').textContent = s.tf;
  $('#chartTf').textContent = s.tf;
}

function emaSeries(arr, p) {
  const k = 2 / (p + 1);
  let prev = arr[0];
  const out = [prev];
  for (let i = 1; i < arr.length; i++) { prev = arr[i] * k + prev * (1 - k); out.push(prev); }
  return out;
}

function drawChart(s) {
  const canvas = $('#chart');
  if (!canvas) return;
  const wrap = canvas.parentElement;
  const W = wrap.clientWidth, H = 420;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = W * dpr; canvas.height = H * dpr;
  canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const candles = s.candles || [];
  if (candles.length < 5) return;
  const closes = candles.map((c) => c.c);
  const ema21 = emaSeries(closes, 21);
  const ema8 = emaSeries(closes, 8);

  const priceH = Math.floor(H * 0.72);
  const padR = 64, padL = 6, padT = 8, padB = 20;
  const plotW = W - padL - padR;
  const min = Math.min(...candles.map((c) => c.l)), max = Math.max(...candles.map((c) => c.h));
  const lo = min - (max - min) * 0.05, hi = max + (max - min) * 0.05;
  const y = (p) => padT + (hi - p) / (hi - lo) * priceH;
  const x = (i) => padL + (i / (candles.length - 1)) * plotW;
  const volMax = Math.max(...candles.map((c) => c.v), 1);
  const bw = Math.max(1, plotW / candles.length * 0.62);

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

  candles.forEach((c, i) => {
    const xx = x(i);
    const vh = (c.v / volMax) * (H - priceH - 6 - padB - 4);
    ctx.fillStyle = c.c >= c.o ? 'rgba(0,230,118,.22)' : 'rgba(255,77,94,.22)';
    ctx.fillRect(xx - bw / 2, H - padB - vh, bw, vh);
  });

  candles.forEach((c, i) => {
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
    ctx.strokeStyle = color; ctx.lineWidth = 1.4;
    ctx.beginPath();
    let started = false;
    arr.forEach((v, i) => {
      if (v === undefined || v === null) return;
      const yy = y(v);
      if (!started) { ctx.moveTo(x(i), yy); started = true; } else ctx.lineTo(x(i), yy);
    });
    ctx.stroke();
  };
  drawLine(ema21, '#f5c542');
  drawLine(ema8, '#4dd0e1');

  let cv = 0, vv = 0;
  const vwapArr = candles.map((c) => {
    const tp = (c.h + c.l + c.c) / 3;
    cv += tp * c.v; vv += c.v;
    return vv > 0 ? cv / vv : null;
  });
  drawLine(vwapArr, '#b388ff');

  const last = candles[candles.length - 1].c;
  const ly = y(last);
  ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.setLineDash([4, 4]); ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(padL, ly); ctx.lineTo(W - padR, ly); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = '#fff';
  ctx.fillText('$' + fmt(last), padL + 4, ly - 4);

  ctx.fillStyle = '#5b6b87'; ctx.textAlign = 'center';
  const step = Math.max(1, Math.floor(candles.length / 6));
  for (let i = 0; i < candles.length; i += step) {
    const d = new Date(candles[i].t);
    ctx.fillText(String(d.getUTCHours()).padStart(2, '0') + ':' + String(d.getUTCMinutes()).padStart(2, '0'), x(i), H - 4);
  }

  $('#chartLegend').innerHTML = `
    <span>EMA21 <b style="color:var(--gold)">$${fmt(ema21[ema21.length - 1])}</b></span>
    <span>EMA8 <b style="color:#4dd0e1">$${fmt(ema8[ema8.length - 1])}</b></span>
    <span>VWAP <b style="color:#b388ff">$${fmt(vwapArr[vwapArr.length - 1])}</b></span>
    <span>LAST <b>$${fmt(last)}</b></span>
    <span>BARS <b>${candles.length}</b></span>
  `;
}

function renderIndicators(s) {
  const i = s.ind;
  if (!i) { $('#indTable').innerHTML = '<tr><td>no data</td></tr>'; return; }
  const rows = [
    ['RSI(14)', fmt(i.rsi) + (i.rsiDiv ? ' · ' + i.rsiDiv + ' DIV' : ''), i.rsi > 70 || i.rsi < 30 ? 'warn' : ''],
    ['MACD', `L ${fmt(i.macdLine, 3)} H ${fmt(i.macdHist, 3)}`, i.macdHist > 0 ? 'up' : 'dn'],
    ['EMA 8/21/50', `${fmt(i.ema8)} / ${fmt(i.ema21)} / ${fmt(i.ema50)}`, i.alignment === 'BULLISH' ? 'up' : i.alignment === 'BEARISH' ? 'dn' : ''],
    ['EMA 100/200', `${fmt(i.ema100)} / ${fmt(i.ema200)}`, ''],
    ['ADX / ±DI', `${fmt(i.adx)} / ${fmt(i.diPlus)} / ${fmt(i.diMinus)}`, i.adx > 25 ? 'info' : ''],
    ['STOCH %K/%D', `${fmt(i.stK)} / ${fmt(i.stD)}`, i.stK > 80 ? 'warn' : i.stK < 20 ? 'info' : ''],
    ['CCI(20)', fmt(i.cci, 0), i.cci > 200 || i.cci < -200 ? 'warn' : ''],
    ['ATR(14)', `$${fmt(i.atr14)} (${fmt(i.atrPct)}%)`, i.atrPct > 0.7 ? 'warn' : ''],
    ['BOLL %B', fmt(i.pctB, 2) + ' · W ' + fmt(i.bbWidthPct, 2) + '%', i.squeeze ? 'info' : ''],
    ['SUPERTREND', i.supertrendDir === 1 ? 'BULL $' + fmt(i.supertrend) : 'BEAR $' + fmt(i.supertrend), i.supertrendDir === 1 ? 'up' : 'dn'],
    ['VWAP / σ', `$${fmt(i.vwap)} / $${fmt(i.vwapSd)}`, ''],
    ['RVOL', fmt(i.rvol, 2) + '×', i.rvol > 2 ? 'info' : ''],
    ['DELTA', fmt(i.delta, 2), i.delta > 0 ? 'up' : 'dn'],
    ['MFI(14)', fmt(i.mfi), i.mfi > 80 || i.mfi < 20 ? 'warn' : ''],
    ['STRUCTURE', i.struct, i.struct.includes('UP') ? 'up' : i.struct.includes('DOWN') ? 'dn' : ''],
    ['BOS/CHoCH', `${i.bosUp ? 'BULL BOS' : i.bosDn ? 'BEAR BOS' : '—'}${i.choch ? ' · ' + i.choch : ''}`, i.choch ? 'warn' : ''],
    ['FVG', i.fvg ? i.fvg.type + ' [' + fmt(i.fvg.bottom) + '..' + fmt(i.fvg.top) + ']' : '—', i.fvg ? 'info' : ''],
    ['LIQUIDITY', `BSL $${fmt(i.bsl)} SSL $${fmt(i.ssl)}`, ''],
    ['PIVOT P/R1/S1', `$${fmt(s.pivots ? s.pivots.P : '')} / $${fmt(s.pivots ? s.pivots.R1 : '')} / $${fmt(s.pivots ? s.pivots.S1 : '')}`, ''],
    ['MOMENTUM SCORE', fmt(i.momentumScore, 1) + '/10', i.momentumScore > 7 ? 'up' : i.momentumScore < 3 ? 'dn' : '']
  ];
  $('#indTable').innerHTML = rows.map(([k, v, c]) => `<tr><td>${k}</td><td class="${c}">${v}</td></tr>`).join('');
}

function renderMarket(s) {
  const f = s.funds || {};
  const rows = [
    ['MARK PRICE', `$${fmt(f.markPrice)}`, ''],
    ['FUNDING (8h)', f.funding !== null && f.funding !== undefined ? (f.funding * 100).toFixed(4) + '% · ann ' + fmt(f.fundingAnnual, 1) + '%' : '--', f.fundingAnnual > 5 ? 'warn' : f.fundingAnnual < -5 ? 'info' : ''],
    ['OPEN INTEREST', f.oi !== null ? fmt(f.oi) + ' oz' : '--', ''],
    ['OI Δ (5m)', fmt(f.oiChange) + '%', cls(f.oiChange)],
    ['GLOBAL L/S', f.globalLS !== null ? fmt(f.globalLS, 2) + ' (' + fmt(f.globalLongPct, 0) + '% long)' : '--', f.globalLS > 2 ? 'warn' : f.globalLS < 0.8 ? 'info' : ''],
    ['TOP TRADER L/S', fmt(f.topLS, 2), ''],
    ['TAKER B/S', f.takerRatio !== null ? fmt(f.takerRatio, 2) + ' (B ' + fmt(f.takerBuy, 1) + '/S ' + fmt(f.takerSell, 1) + ')' : '--', f.takerRatio > 1.5 ? 'up' : f.takerRatio < 0.7 ? 'dn' : ''],
    ['ORDERBOOK IMB', s.depth ? sign(s.depth.imbalance) + fmt(s.depth.imbalance, 1) + '%' : '--', s.depth && s.depth.imbalance > 0 ? 'up' : 'dn'],
    ['BID WALLS', s.depth && s.depth.walls ? s.depth.walls.filter((w) => w.side === 'BID').length : '--', ''],
    ['ASK WALLS', s.depth && s.depth.walls ? s.depth.walls.filter((w) => w.side === 'ASK').length : '--', ''],
    ['AGGR BUY/SELL', s.trades ? fmt(s.trades.buyVol, 1) + ' / ' + fmt(s.trades.sellVol, 1) : '--', '']
  ];
  $('#mktTable').innerHTML = rows.map(([k, v, c]) => `<tr><td>${k}</td><td class="${c}">${v}</td></tr>`).join('');
}

function renderMacro(s) {
  const m = s.macro || {};
  const cell = (obj) => {
    if (!obj || obj.value === null) return '--';
    return `${fmt(obj.value)} <span class="${cls(obj.changePct)}">${sign(obj.changePct)}${fmt(obj.changePct)}%</span>`;
  };
  const rows = [
    ['DXY (5m)', cell(m.dxy), m.dxy && m.dxy.changePct < -0.1 ? 'up' : m.dxy && m.dxy.changePct > 0.1 ? 'dn' : ''],
    ['US 10Y (5m)', cell(m.tnx), m.tnx && m.tnx.changePct > 0.05 ? 'dn' : m.tnx && m.tnx.changePct < -0.05 ? 'up' : ''],
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

function renderLayers(s) {
  const l = s.layers || {};
  const rows = [
    ['1 · MACRO ENV', fmt(l.L1, 1) + '/10', l.L1 >= 6 ? 'up' : l.L1 <= 4 ? 'dn' : ''],
    ['2 · FLOWS/SENTIMENT', fmt(l.L2, 1) + '/10', l.L2 >= 6 ? 'up' : l.L2 <= 4 ? 'dn' : ''],
    ['3 · DERIVATIVES', fmt(l.L3, 1) + '/10', l.L3 >= 6 ? 'up' : l.L3 <= 4 ? 'dn' : ''],
    ['4 · TECHNICAL', fmt(l.L4, 1) + '/10', l.L4 >= 6 ? 'up' : l.L4 <= 4 ? 'dn' : ''],
    ['5 · CORRELATION', fmt(l.L5, 1) + '/10', l.L5 >= 6 ? 'up' : l.L5 <= 4 ? 'dn' : ''],
    ['TOTAL CONFLUENCE', fmt(l.tcs100, 0) + '/100 · ' + (l.bias || ''), l.tcs100 > 60 ? 'up' : l.tcs100 < 40 ? 'dn' : 'warn'],
    ['MTF CONFLUENCE', fmt(l.confluence * 100, 1) + '%', l.confluence > 0.2 ? 'up' : l.confluence < -0.2 ? 'dn' : '']
  ];
  $('#layersTable').innerHTML = rows.map(([k, v, c]) => `<tr><td>${k}</td><td class="${c}">${v}</td></tr>`).join('');
  $('#tcsLbl').textContent = 'TCS ' + fmt(l.tcs100, 0) + '/100';
  const ts = l.tfScores || {};
  $('#mtfRow').innerHTML = TFS.map((t) => {
    const sc = ts[t] !== undefined ? ts[t] : 0;
    const c = sc > 0.2 ? 'var(--up)' : sc < -0.2 ? 'var(--dn)' : 'var(--dim)';
    return `<div class="m" style="border-color:${c}"><b>${sc.toFixed(2)}</b>${t}</div>`;
  }).join('');
}

function renderAgents(s) {
  const votes = s.votes || [];
  const g = $('#agentGrid');
  g.innerHTML = votes.map((v) => {
    const dir = v.d === 1 ? 'long' : v.d === -1 ? 'short' : 'neutral';
    const lbl = v.d === 1 ? 'LONG' : v.d === -1 ? 'SHORT' : '—';
    return `<div class="ag ${dir}" title="${v.name}">
      <span class="agid">#${String(v.id).padStart(2, '0')}</span>
      <span class="agname">${v.name}</span>
      <span class="agconf">${lbl} · ${Math.round(v.conf)}%</span>
      <span class="agconfbar"><i style="width:${v.conf}%"></i></span>
      <span class="agreason"><b>${v.name}</b> — ${v.reason}</span>
    </div>`;
  }).join('');
  const sig = s.signal;
  $('#voteSummary').textContent = sig ? `LONG ${sig.longVotes} · SHORT ${sig.shortVotes} · NEUTRAL ${sig.neutralVotes} → ${sig.direction} (${sig.confPct}%)` : '';
}

function renderNews(s) {
  const grid = $('#newsGrid');
  if (!grid) return;
  const items = s.news || [];
  if (!items.length) { grid.innerHTML = '<span class="dim">NO LIVE HEADLINES (FEED OFFLINE)</span>'; return; }
  grid.innerHTML = items.map((n) => {
    const when = n.pubDate ? n.pubDate.replace(/^\w+, /, '').replace(/ GMT$/, '') : '';
    return `<a class="newsitem" href="${n.link}" target="_blank" rel="noopener"><b>${n.title}</b><span>${when}</span></a>`;
  }).join('');
}

// ---------------- clock & countdown ----------------
const TF_SECS = { '1m': 60, '3m': 180, '5m': 300, '15m': 900, '1h': 3600, '4h': 14400, '1d': 86400 };
let lastCdClose = 0;

function tickClock() {
  const now = new Date();
  const el = $('#clock');
  if (el) el.textContent = now.toISOString().slice(11, 19) + ' UTC';
}

function tickCountdown() {
  const secs = TF_SECS[tf] || 900;
  const nowMs = Date.now();
  const close = (Math.floor(nowMs / 1000 / secs) + 1) * secs * 1000;
  const remain = Math.max(0, close - nowMs);
  const cdTf = $('#cdTf'), cd = $('#countdown');
  if (cdTf) cdTf.textContent = tf;
  if (cd) cd.textContent = String(Math.floor(remain / 60000)).padStart(2, '0') + ':' + String(Math.floor((remain % 60000) / 1000)).padStart(2, '0');
  if (lastCdClose && lastCdClose !== close && remain < 1500) refresh();
  lastCdClose = close;
}

// ---------------- main loop ----------------
let firstLoad = true;
async function refresh() {
  try {
    const s = await computeState();
    S = s;
    renderTicker(s);
    renderSignal(s);
    drawChart(s);
    renderIndicators(s);
    renderMarket(s);
    renderMacro(s);
    renderLayers(s);
    renderAgents(s);
    renderNews(s);
    if (firstLoad) { const sb = $('#signalBox'); if (sb) sb.classList.remove('loading'); firstLoad = false; }
  } catch (e) {
    const fd = $('#footData');
    if (fd) fd.textContent = 'DATA ERROR — ' + e.message;
  }
}

if (typeof document !== 'undefined') {
  renderTfBar();
  tickClock();
  tickCountdown();
  refresh();
  setInterval(refresh, 8000);
  setInterval(tickClock, 1000);
  setInterval(tickCountdown, 1000);
}

if (IS_NODE) module.exports = { computeState, TFS, depthMetrics, aggregateTradesMetrics };
