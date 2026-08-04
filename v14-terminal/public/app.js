'use strict';

const $ = (s) => document.querySelector(s);

const fmt = (n, d = 2) => (n === null || n === undefined || isNaN(n) ? '--' : Number(n).toFixed(d));
const sign = (n) => (n > 0 ? '+' : '');
const cls = (n) => (n > 0 ? 'up' : n < 0 ? 'dn' : '');
const pct = (n) => (n === null || n === undefined || isNaN(n) ? '--' : (n * 100).toFixed(4) + '%');

let S = null;
let prevPrice = null;
let ws = null;
let wsReconnect = 0;

// ---------------- websocket ----------------
function connect() {
  const proto = location.protocol === 'https:' ? 'wss' : 'ws';
  ws = new WebSocket(proto + '://' + location.host);
  ws.onopen = () => {
    setStatus('LIVE', 'live');
    wsReconnect = 0;
  };
  ws.onclose = () => {
    setStatus('DISCONNECTED', 'halted');
    setTimeout(connect, Math.min(1000 * Math.pow(2, wsReconnect++), 10000));
  };
  ws.onerror = () => { try { ws.close(); } catch { /* noop */ } };
  ws.onmessage = (ev) => {
    let m;
    try { m = JSON.parse(ev.data); } catch { return; }
    if (m.type === 'state') { S = m; render(); }
    else if (m.type === 'boot') {
      if (!S) {
        $('#logBox').innerHTML = (m.log || []).map((e) => `<div class="${e.level}">${new Date(e.t).toISOString().slice(11, 19)} [${e.level}] ${e.msg}</div>`).join('');
      }
    }
  };
}

function setStatus(label, css) {
  const el = $('#status');
  el.textContent = label;
  el.className = 'status ' + css;
}

// ---------------- ticker ----------------
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

// ---------------- signal ----------------
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
  const names = [['gate1', 'DATA FRESHNESS <60s'], ['gate2', 'VOLATILITY REGIME ATR%'], ['gate3', 'EDGE ≥251 VOTES ≥55%'], ['gate4', 'RISK SANITY SL/RR/LEV'], ['gate5', 'MICROSTRUCTURE OB'], ['gate6', 'MACRO COMPATIBILITY']];
  if (g && g.gates) {
    $('#gates').innerHTML = names.map(([k, name]) => {
      const on = !!g.gates[k];
      return `<div class="gate ${on ? 'pass' : 'fail'}"><span class="tick">${on ? '✓' : '✗'}</span><span>${name}</span></div>`;
    }).join('');
  }
}

// ---------------- histogram + dashboard ----------------
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

// ---------------- indicators ----------------
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

// ---------------- market / derivatives ----------------
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

// ---------------- macro ----------------
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

// ---------------- order book + tape ----------------
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

// ---------------- log ----------------
let stickBottom = true;
function renderLog(s) {
  const box = $('#logBox');
  if (!s.log || !s.log.length) return;
  const wasBottom = box.scrollHeight - box.scrollTop - box.clientHeight < 40;
  box.innerHTML = s.log.map((e) =>
    `<div class="${e.level}"><b>${new Date(e.t).toISOString().slice(11, 19)}</b> [${e.level}] ${e.msg}</div>`).join('');
  if (wasBottom) box.scrollTop = box.scrollHeight;
  box.addEventListener('scroll', () => {
    stickBottom = box.scrollHeight - box.scrollTop - box.clientHeight < 40;
  });
}

// ---------------- signal validity countdown ----------------
setInterval(() => {
  const sig = S && S.signal;
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

setInterval(() => {
  $('#clock').textContent = new Date().toISOString().slice(11, 19) + ' UTC';
}, 1000);

// ---------------- chart (15m candles + EMA 8/21/50 + volume, 10s refresh) ----------------
function emaSeries(arr, p) {
  const k = 2 / (p + 1);
  let prev = arr[0];
  const out = [prev];
  for (let i = 1; i < arr.length; i++) { prev = arr[i] * k + prev * (1 - k); out.push(prev); }
  return out;
}

async function loadChart() {
  try {
    const r = await fetch('/api/candles?tf=15m');
    const j = await r.json();
    drawChart(j.candles || []);
    $('#chartNote').textContent = j.candles.length + ' bars · 15m';
  } catch { /* keep last frame */ }
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

// ---------------- fullscreen / sound / screenshot / help ----------------
let soundOn = false;
function toggleFullscreen() {
  if (!document.fullscreenElement) { (document.documentElement.requestFullscreen || (() => {})).call(document.documentElement); }
  else { (document.exitFullscreen || (() => {})).call(document); }
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
  } catch { /* noop */ }
}

let lastSignalTs = 0;
function checkSignalSound(s) {
  if (s.signal && s.signal.ts !== lastSignalTs) {
    if (lastSignalTs !== 0) beep();
    lastSignalTs = s.signal.ts;
  }
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
  } catch { /* noop */ }
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
  else if (ws && ws.readyState === 1) {
    ws.send(JSON.stringify({ type: 'key', key: k }));
  }
});

// ---------------- main ----------------
function render() {
  if (!S) return;
  renderTicker(S);
  renderSignal(S);
  renderHistogram(S);
  renderIndicators(S);
  renderMarket(S);
  renderMacro(S);
  renderDepth(S);
  renderLog(S);
  checkSignalSound(S);
}

connect();
loadChart();
setInterval(loadChart, 10000);
