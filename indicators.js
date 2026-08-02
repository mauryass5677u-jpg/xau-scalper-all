'use strict';

// ============================================================================
// XAU/USDT OMNISCIENT SCALPER — MATHEMATICAL INDICATOR ENGINE
// All indicators computed from raw OHLCV with full formula precision.
// Arrays are aligned to input length; index len-1 is the latest value.
// ============================================================================

function prepCandles(k) {
  return k.map((x) => ({
    t: x[0],
    o: +x[1], h: +x[2], l: +x[3], c: +x[4], v: +x[5],
    qv: +x[7], tb: +x[9], ts: +x[5] - +x[9]
  }));
}

// ---------- core array math ----------
function sma(arr, p) {
  const out = new Array(arr.length).fill(null);
  let sum = 0;
  for (let i = 0; i < arr.length; i++) {
    sum += arr[i];
    if (i >= p) sum -= arr[i - p];
    if (i >= p - 1) out[i] = sum / p;
  }
  return out;
}

function ema(arr, p) {
  const out = new Array(arr.length).fill(null);
  const k = 2 / (p + 1);
  let prev = null;
  for (let i = 0; i < arr.length; i++) {
    if (prev === null) { prev = arr[i]; out[i] = arr[i]; }
    else { prev = arr[i] * k + prev * (1 - k); out[i] = prev; }
  }
  return out;
}

function rma(arr, p) { // Wilder smoothing
  const out = new Array(arr.length).fill(null);
  const k = 1 / p;
  let prev = null;
  for (let i = 0; i < arr.length; i++) {
    if (prev === null) { prev = arr[i]; out[i] = arr[i]; }
    else { prev = arr[i] * k + prev * (1 - k); out[i] = prev; }
  }
  return out;
}

function rollingMax(arr, p) {
  const out = new Array(arr.length).fill(null);
  const dq = [];
  for (let i = 0; i < arr.length; i++) {
    while (dq.length && arr[dq[dq.length - 1]] <= arr[i]) dq.pop();
    dq.push(i);
    if (dq[0] <= i - p) dq.shift();
    if (i >= p - 1) out[i] = arr[dq[0]];
  }
  return out;
}

function rollingMin(arr, p) {
  const out = new Array(arr.length).fill(null);
  const dq = [];
  for (let i = 0; i < arr.length; i++) {
    while (dq.length && arr[dq[dq.length - 1]] >= arr[i]) dq.pop();
    dq.push(i);
    if (dq[0] <= i - p) dq.shift();
    if (i >= p - 1) out[i] = arr[dq[0]];
  }
  return out;
}

function stdDev(arr, p) {
  const m = sma(arr, p);
  const out = new Array(arr.length).fill(null);
  for (let i = 0; i < arr.length; i++) {
    if (m[i] === null) continue;
    let s = 0;
    for (let j = i - p + 1; j <= i; j++) s += (arr[j] - m[i]) ** 2;
    out[i] = Math.sqrt(s / p);
  }
  return out;
}

function last(arr) { return arr[arr.length - 1]; }
function lastN(arr, n) { return arr[arr.length - n]; }

// ---------- ATR (Wilder, 14) ----------
function trueRange(cs) {
  const tr = [];
  for (let i = 0; i < cs.length; i++) {
    if (i === 0) { tr.push(cs[i].h - cs[i].l); continue; }
    tr.push(Math.max(cs[i].h - cs[i].l, Math.abs(cs[i].h - cs[i - 1].c), Math.abs(cs[i].l - cs[i - 1].c)));
  }
  return tr;
}

function atr(cs, p = 14) {
  return rma(trueRange(cs), p);
}

// ---------- RSI (Wilder, 14) ----------
function rsi(closes, p = 14) {
  const out = new Array(closes.length).fill(null);
  const gains = new Array(closes.length).fill(0);
  const losses = new Array(closes.length).fill(0);
  for (let i = 1; i < closes.length; i++) {
    const d = closes[i] - closes[i - 1];
    gains[i] = Math.max(0, d);
    losses[i] = Math.max(0, -d);
  }
  const ag = rma(gains, p);
  const al = rma(losses, p);
  for (let i = p; i < closes.length; i++) {
    if (al[i] === 0) { out[i] = 100; continue; }
    const rs = ag[i] / al[i];
    out[i] = 100 - 100 / (1 + rs);
  }
  return out;
}

// ---------- MACD 12,26,9 ----------
function macd(closes) {
  const e12 = ema(closes, 12);
  const e26 = ema(closes, 26);
  const line = closes.map((_, i) => (e12[i] !== null && e26[i] !== null ? e12[i] - e26[i] : null));
  const sig = ema(line.map((x) => (x === null ? 0 : x)), 9);
  const hist = line.map((x, i) => (x !== null && sig[i] !== null ? x - sig[i] : null));
  return { line, sig, hist };
}

// ---------- Bollinger Bands 20, 2 ----------
function bollinger(closes, p = 20, mult = 2) {
  const mid = sma(closes, p);
  const sd = stdDev(closes, p);
  const up = closes.map((_, i) => (mid[i] !== null ? mid[i] + mult * sd[i] : null));
  const lo = closes.map((_, i) => (mid[i] !== null ? mid[i] - mult * sd[i] : null));
  return { mid, up, lo };
}

// ---------- Keltner 20, 1.5*ATR ----------
function keltner(cs, p = 20, mult = 1.5) {
  const mid = ema(cs.map((c) => c.c), p);
  const a = atr(cs, 14);
  const up = mid.map((m, i) => (m !== null && a[i] !== null ? m + mult * a[i] : null));
  const lo = mid.map((m, i) => (m !== null && a[i] !== null ? m - mult * a[i] : null));
  return { mid, up, lo };
}

// ---------- Stochastic %K(14,3) %D(3) ----------
function stochastic(cs, kp = 14, ksm = 3, dsm = 3) {
  const hh = rollingMax(cs.map((c) => c.h), kp);
  const ll = rollingMin(cs.map((c) => c.l), kp);
  const rawK = cs.map((c, i) => (hh[i] !== null && hh[i] !== ll[i] ? ((c.c - ll[i]) / (hh[i] - ll[i])) * 100 : null));
  const k = sma(rawK.map((x) => (x === null ? 50 : x)), ksm);
  const d = sma(k.map((x) => (x === null ? 50 : x)), dsm);
  return { k, d };
}

// ---------- CCI 20 ----------
function cci(cs, p = 20) {
  const tp = cs.map((c) => (c.h + c.l + c.c) / 3);
  const tpSma = sma(tp, p);
  const out = new Array(cs.length).fill(null);
  for (let i = 0; i < cs.length; i++) {
    if (tpSma[i] === null) continue;
    let md = 0;
    for (let j = i - p + 1; j <= i; j++) md += Math.abs(tp[j] - tpSma[i]);
    md /= p;
    if (md === 0) { out[i] = 0; continue; }
    out[i] = (tp[i] - tpSma[i]) / (0.015 * md);
  }
  return out;
}

// ---------- Williams %R 14 ----------
function williamsR(cs, p = 14) {
  const hh = rollingMax(cs.map((c) => c.h), p);
  const ll = rollingMin(cs.map((c) => c.l), p);
  return cs.map((c, i) => (hh[i] !== null && hh[i] !== ll[i] ? ((hh[i] - c.c) / (hh[i] - ll[i])) * -100 : null));
}

// ---------- ROC 9 ----------
function roc(closes, p = 9) {
  return closes.map((c, i) => (i >= p ? ((c - closes[i - p]) / closes[i - p]) * 100 : null));
}

// ---------- ADX/DMI 14 ----------
function adx(cs, p = 14) {
  const n = cs.length;
  const up = new Array(n).fill(0), dn = new Array(n).fill(0), tr = new Array(n).fill(0);
  for (let i = 1; i < n; i++) {
    const upM = cs[i].h - cs[i - 1].h;
    const dnM = cs[i - 1].l - cs[i].l;
    up[i] = (upM > dnM && upM > 0) ? upM : 0;
    dn[i] = (dnM > upM && dnM > 0) ? dnM : 0;
    tr[i] = Math.max(cs[i].h - cs[i].l, Math.abs(cs[i].h - cs[i - 1].c), Math.abs(cs[i].l - cs[i - 1].c));
  }
  const trS = rma(tr, p);
  const upS = rma(up, p);
  const dnS = rma(dn, p);
  const diP = trS.map((x, i) => (x ? (upS[i] / x) * 100 : 0));
  const diM = trS.map((x, i) => (x ? (dnS[i] / x) * 100 : 0));
  const dx = diP.map((x, i) => (x + diM[i] ? (Math.abs(x - diM[i]) / (x + diM[i])) * 100 : 0));
  const ad = rma(dx, p);
  return { adx: ad, diPlus: diP, diMinus: diM };
}

// ---------- Supertrend 10, 3 ----------
function supertrend(cs, p = 10, mult = 3.0) {
  const n = cs.length;
  const a = atr(cs, p);
  const hl2 = cs.map((c) => (c.h + c.l) / 2);
  const st = new Array(n).fill(null);
  const dir = new Array(n).fill(1);
  let fup = new Array(n).fill(null), fdn = new Array(n).fill(null);
  for (let i = 0; i < n; i++) {
    if (a[i] === null) continue;
    const bu = hl2[i] + mult * a[i];
    const bl = hl2[i] - mult * a[i];
    if (i === 0) { fup[i] = bu; fdn[i] = bl; st[i] = bl; dir[i] = 1; continue; }
    fup[i] = (bu < fup[i - 1] || cs[i - 1].c > fup[i - 1]) ? bu : fup[i - 1];
    fdn[i] = (bl > fdn[i - 1] || cs[i - 1].c < fdn[i - 1]) ? bl : fdn[i - 1];
    if (st[i - 1] === fup[i - 1]) {
      dir[i] = (cs[i].c > fup[i]) ? 1 : -1;
    } else {
      dir[i] = (cs[i].c < fdn[i]) ? -1 : 1;
    }
    st[i] = dir[i] === 1 ? fdn[i] : fup[i];
  }
  return { st, dir };
}

// ---------- VWAP (rolling) ----------
function vwap(cs) {
  const n = cs.length;
  const out = new Array(n).fill(null);
  let cv = 0, vv = 0;
  for (let i = 0; i < n; i++) {
    const tp = (cs[i].h + cs[i].l + cs[i].c) / 3;
    cv += tp * cs[i].v; vv += cs[i].v;
    if (vv > 0) out[i] = cv / vv;
  }
  return out;
}

function vwapBands(cs) {
  const v = vwap(cs);
  const n = cs.length;
  const sd = new Array(n).fill(null);
  let cv = 0, vv = 0, sv = 0;
  for (let i = 0; i < n; i++) {
    const tp = (cs[i].h + cs[i].l + cs[i].c) / 3;
    cv += tp * cs[i].v; vv += cs[i].v; sv += tp * tp * cs[i].v;
    if (vv > 0) {
      const mean = cv / vv;
      const variance = Math.max(0, sv / vv - mean * mean);
      sd[i] = Math.sqrt(variance);
    }
  }
  return { v, sd };
}

// ---------- Ichimoku 9,26,52 ----------
function ichimoku(cs) {
  const n = cs.length;
  const h = cs.map((c) => c.h), l = cs.map((c) => c.l);
  const tenkan = [], kijun = [];
  for (let i = 0; i < n; i++) {
    const hh = Math.max(...h.slice(Math.max(0, i - 8), i + 1));
    const ll = Math.min(...l.slice(Math.max(0, i - 8), i + 1));
    tenkan.push((hh + ll) / 2);
    const hh2 = Math.max(...h.slice(Math.max(0, i - 25), i + 1));
    const ll2 = Math.min(...l.slice(Math.max(0, i - 25), i + 1));
    kijun.push((hh2 + ll2) / 2);
  }
  let senkouA = null, senkouB = null;
  const idx = n - 26;
  if (idx >= 0) {
    senkouA = (tenkan[idx] + kijun[idx]) / 2;
    const hh3 = Math.max(...h.slice(Math.max(0, idx - 51), idx + 1));
    const ll3 = Math.min(...l.slice(Math.max(0, idx - 51), idx + 1));
    senkouB = (hh3 + ll3) / 2;
  }
  return { tenkan: last(tenkan), kijun: last(kijun), senkouA, senkouB, cloudUp: Math.max(senkouA, senkouB), cloudDn: Math.min(senkouA, senkouB) };
}

// ---------- Parabolic SAR ----------
function psar(cs, afStep = 0.02, afMax = 0.2) {
  const n = cs.length;
  const out = new Array(n).fill(null);
  if (n === 0) return out;
  let af = afStep, isLong = true;
  let ep = cs[0].h, sar = cs[0].l;
  out[0] = sar;
  for (let i = 1; i < n; i++) {
    sar = sar + af * (ep - sar);
    if (isLong) {
      sar = Math.min(sar, cs[i - 1].l, i >= 2 ? cs[i - 2].l : cs[i - 1].l);
      if (cs[i].l < sar) { isLong = false; sar = ep; ep = cs[i].l; af = afStep; }
      else {
        if (cs[i].h > ep) { ep = cs[i].h; af = Math.min(af + afStep, afMax); }
      }
    } else {
      sar = Math.max(sar, cs[i - 1].h, i >= 2 ? cs[i - 2].h : cs[i - 1].h);
      if (cs[i].h > sar) { isLong = true; sar = ep; ep = cs[i].h; af = afStep; }
      else {
        if (cs[i].l < ep) { ep = cs[i].l; af = Math.min(af + afStep, afMax); }
      }
    }
    out[i] = sar;
  }
  return out;
}

// ---------- OBV ----------
function obv(cs) {
  const out = new Array(cs.length).fill(0);
  for (let i = 1; i < cs.length; i++) {
    if (cs[i].c > cs[i - 1].c) out[i] = out[i - 1] + cs[i].v;
    else if (cs[i].c < cs[i - 1].c) out[i] = out[i - 1] - cs[i].v;
    else out[i] = out[i - 1];
  }
  return out;
}

// ---------- MFI 14 ----------
function mfi(cs, p = 14) {
  const n = cs.length;
  const tp = cs.map((c) => (c.h + c.l + c.c) / 3);
  const rf = tp.map((x, i) => x * cs[i].v);
  const out = new Array(n).fill(null);
  for (let i = p; i < n; i++) {
    let pos = 0, neg = 0;
    for (let j = i - p + 1; j <= i; j++) {
      if (tp[j] > tp[j - 1]) pos += rf[j];
      else if (tp[j] < tp[j - 1]) neg += rf[j];
    }
    if (neg === 0) { out[i] = pos === 0 ? 50 : 100; continue; }
    out[i] = 100 - 100 / (1 + pos / neg);
  }
  return out;
}

// ---------- Donchian 20 ----------
function donchian(cs, p = 20) {
  const up = rollingMax(cs.map((c) => c.h), p);
  const lo = rollingMin(cs.map((c) => c.l), p);
  const mid = up.map((u, i) => (u !== null && lo[i] !== null ? (u + lo[i]) / 2 : null));
  return { up, lo, mid };
}

// ---------- RVOL ----------
function rvol(cs, p = 20) {
  const v = cs.map((c) => c.v);
  const m = sma(v, p);
  return v.map((x, i) => (m[i] ? x / m[i] : null));
}

// ---------- Pivots ----------
function pivots(dayCs) {
  if (!dayCs || dayCs.length === 0) return null;
  const prev = dayCs[dayCs.length - 2] || dayCs[dayCs.length - 1];
  const H = prev.h, L = prev.l, C = prev.c, O = prev.o;
  const p = (H + L + C) / 3;
  const r1 = 2 * p - L, s1 = 2 * p - H;
  const r2 = p + (H - L), s2 = p - (H - L);
  const r3 = H + 2 * (p - L), s3 = L - 2 * (H - p);
  const mid = (r1 + s1) / 2;
  const cpr = (H + L + O + C) / 4;
  return { P: p, R1: r1, S1: s1, R2: r2, S2: s2, R3: r3, S3: s3, mid, cpr, prevH: H, prevL: L, prevC: C };
}

// ---------- Fibonacci from a swing ----------
function fibonacci(hi, lo) {
  const range = hi - lo;
  return {
    L0: lo, L236: lo + 0.236 * range, L382: lo + 0.382 * range, L50: lo + 0.5 * range,
    L618: lo + 0.618 * range, L786: lo + 0.786 * range, L100: hi,
    X1272: lo + 1.272 * range, X1618: lo + 1.618 * range, X200: lo + 2.0 * range, X2618: lo + 2.618 * range
  };
}

// ---------- Market structure (3-bar pivots) ----------
function swings(cs, left = 2, right = 2) {
  const n = cs.length;
  const highs = [], lows = [];
  for (let i = left; i < n - right; i++) {
    let isHi = true, isLo = true;
    for (let j = i - left; j <= i + right; j++) {
      if (j === i) continue;
      if (cs[j].h >= cs[i].h) isHi = false;
      if (cs[j].l <= cs[i].l) isLo = false;
    }
    if (isHi) highs.push({ i, p: cs[i].h });
    if (isLo) lows.push({ i, p: cs[i].l });
  }
  let structure = 'NEUTRAL';
  let lastH = null, lastL = null;
  if (highs.length >= 2 && lows.length >= 2) {
    lastH = highs[highs.length - 1];
    lastL = lows[lows.length - 1];
    const prevH = highs[highs.length - 2];
    const prevL = lows[lows.length - 2];
    const hh = lastH.p > prevH.p, hl = lastL.p > prevL.p;
    const lh = lastH.p < prevH.p, ll = lastL.p < prevL.p;
    if (hh && hl) structure = 'HH+HL UPTREND';
    else if (lh && ll) structure = 'LH+LL DOWNTREND';
    else if (hh && ll) structure = 'MIXED';
  }
  return { highs, lows, structure, lastH, lastL };
}

// ---------- BOS / Choch ----------
function bos(cs, swing) {
  const c = last(cs).c;
  const lastSH = swing.lastH, lastSL = swing.lastL;
  let bosUp = false, bosDn = false, choch = null;
  if (lastSH) {
    const prevSH = swing.highs.length >= 2 ? swing.highs[swing.highs.length - 2] : null;
    const structDn = swing.structure.includes('DOWN');
    bosUp = c > lastSH.p;
    if (bosUp && structDn) choch = 'BULLISH_CHOCH';
  }
  if (lastSL) {
    const structUp = swing.structure.includes('UP');
    bosDn = c < lastSL.p;
    if (bosDn && structUp) choch = 'BEARISH_CHOCH';
  }
  return { bosUp, bosDn, choch, lastSH: lastSH ? lastSH.p : null, lastSL: lastSL ? lastSL.p : null };
}

// ---------- FVG (last unfilled gap) ----------
function fvg(cs) {
  const n = cs.length;
  for (let i = n - 3; i >= 2; i--) {
    const c3 = cs[i], c1 = cs[i - 2];
    if (c3.l > c1.h) return { type: 'BULLISH', top: c3.l, bottom: c1.h, mid: (c3.l + c1.h) / 2, idx: i };
    if (c3.h < c1.l) return { type: 'BEARISH', top: c1.l, bottom: c3.h, mid: (c1.l + c3.h) / 2, idx: i };
  }
  return null;
}

// ---------- Order blocks (simple heuristic) ----------
function orderBlocks(cs, swing) {
  const n = cs.length;
  const blocks = [];
  if (swing.highs.length >= 2) {
    const bh = swing.highs[swing.highs.length - 1];
    for (let j = Math.max(0, bh.i - 5); j < bh.i; j++) {
      if (cs[j].c < cs[j].o) blocks.push({ type: 'BEARISH', top: cs[j].h, bottom: cs[j].l, idx: j });
    }
  }
  if (swing.lows.length >= 2) {
    const bl = swing.lows[swing.lows.length - 1];
    for (let j = Math.max(0, bl.i - 5); j < bl.i; j++) {
      if (cs[j].c > cs[j].o) blocks.push({ type: 'BULLISH', top: cs[j].h, bottom: cs[j].l, idx: j });
    }
  }
  return blocks;
}

// ---------- Liquidity pools ----------
function liquidity(cs, swing) {
  const lastSH = swing.lastH ? swing.lastH.p : null;
  const lastSL = swing.lastL ? swing.lastL.p : null;
  const eqH = [], eqL = [];
  const H = cs.map((c) => c.h), L = cs.map((c) => c.l);
  for (let i = 0; i < cs.length - 1; i++) {
    for (let j = i + 1; j < cs.length && j <= i + 40; j++) {
      if (Math.abs(H[i] - H[j]) < 0.4 && Math.abs(cs[i].t - cs[j].t) > 3 * 60000) eqH.push((H[i] + H[j]) / 2);
      if (Math.abs(L[i] - L[j]) < 0.4 && Math.abs(cs[i].t - cs[j].t) > 3 * 60000) eqL.push((L[i] + L[j]) / 2);
    }
  }
  return { bsl: eqH.length ? eqH[eqH.length - 1] : lastSH, ssl: eqL.length ? eqL[eqL.length - 1] : lastSL };
}

// ---------- full computation for a timeframe ----------
function computeIndicators(cs) {
  if (!cs || cs.length < 60) return null;
  const closes = cs.map((c) => c.c);
  const a14 = atr(cs, 14);
  const a10 = atr(cs, 10);
  const r = rsi(closes, 14);
  const m = macd(closes);
  const bb = bollinger(closes, 20, 2);
  const kc = keltner(cs, 20, 1.5);
  const stoch = stochastic(cs, 14, 3, 3);
  const cciA = cci(cs, 20);
  const wr = williamsR(cs, 14);
  const rocA = roc(closes, 9);
  const e8 = ema(closes, 8), e21 = ema(closes, 21), e50 = ema(closes, 50), e100 = ema(closes, 100), e200 = ema(closes, 200);
  const adxA = adx(cs, 14);
  const st = supertrend(cs, 10, 3);
  const vb = vwapBands(cs);
  const ich = ichimoku(cs);
  const ps = psar(cs);
  const obvA = obv(cs);
  const mfiA = mfi(cs, 14);
  const dc = donchian(cs, 20);
  const rv = rvol(cs, 20);
  const sw = swings(cs);
  const bo = bos(cs, sw);
  const fvgA = fvg(cs);
  const obA = orderBlocks(cs, sw);
  const liq = liquidity(cs, sw);

  const i = closes.length - 1;
  const bbWidthPct = bb.mid[i] ? ((bb.up[i] - bb.lo[i]) / bb.mid[i]) * 100 : null;
  const pctB = bb.up[i] !== bb.lo[i] ? (closes[i] - bb.lo[i]) / (bb.up[i] - bb.lo[i]) : 0.5;
  const atrPct = (a14[i] / closes[i]) * 100;

  // EMA alignment
  let alignment;
  if (closes[i] > e8[i] && e8[i] > e21[i] && e21[i] > e50[i]) alignment = 'BULLISH';
  else if (closes[i] < e8[i] && e8[i] < e21[i] && e21[i] < e50[i]) alignment = 'BEARISH';
  else alignment = 'MIXED';

  // Momentum composite score 0-10
  const momParts = [];
  if (r[i] !== null) momParts.push(r[i] >= 55 ? 1 : r[i] <= 45 ? -1 : 0);          // 30%
  if (m.hist[i] !== null) momParts.push(m.hist[i] > 0 && m.hist[i] > (m.hist[i - 1] || 0) ? 1 : m.hist[i] < 0 && m.hist[i] < (m.hist[i - 1] || 0) ? -1 : 0); // 25%
  if (stoch.k[i] !== null) momParts.push(stoch.k[i] > 50 ? 1 : -1);                 // 20%
  if (cciA[i] !== null) momParts.push(cciA[i] > 100 ? 1 : cciA[i] < -100 ? -1 : 0); // 15%
  if (wr[i] !== null) momParts.push(wr[i] > -50 ? 1 : -1);                          // 10%
  const momentumScore = ((momParts[0] || 0) * 0.3 + (momParts[1] || 0) * 0.25 + (momParts[2] || 0) * 0.2 + (momParts[3] || 0) * 0.15 + (momParts[4] || 0) * 0.1 + 1) / 2 * 10;

  // RSI divergence (last 12 bars)
  let rsiDiv = null;
  for (let k = 3; k <= 12; k++) {
    if (closes[i] < closes[i - k] && r[i] > r[i - k]) { rsiDiv = 'BULLISH'; break; }
    if (closes[i] > closes[i - k] && r[i] < r[i - k]) { rsiDiv = 'BEARISH'; break; }
  }

  const cur = {
    price: closes[i], atr14: a14[i], atr10: a10[i], atrPct,
    rsi: r[i], macdLine: m.line[i], macdSig: m.sig[i], macdHist: m.hist[i],
    macdHistPrev: m.hist[i - 1] || null, macdHist2: m.hist[i - 2] || null,
    bbUp: bb.up[i], bbLo: bb.lo[i], bbMid: bb.mid[i], bbWidthPct, pctB, bbWidthHist: bbWidthPct,
    kcUp: kc.up[i], kcLo: kc.lo[i],
    squeeze: bb.up[i] < kc.up[i] && bb.lo[i] > kc.lo[i],
    stK: stoch.k[i], stD: stoch.d[i],
    cci: cciA[i], wr: wr[i], roc: rocA[i],
    ema8: e8[i], ema21: e21[i], ema50: e50[i], ema100: e100[i], ema200: e200[i],
    ema8Slope: (e8[i] - e8[i - 3]) / 3, ema21Slope: (e21[i] - e21[i - 3]) / 3,
    adx: adxA.adx[i], diPlus: adxA.diPlus[i], diMinus: adxA.diMinus[i],
    supertrend: st.st[i], supertrendDir: st.dir[i],
    vwap: vb.v[i], vwapSd: vb.sd[i],
    ichi: ich,
    psar: ps[i],
    obv: obvA[i], obvSlope: obvA[i] - obvA[i - 5],
    mfi: mfiA[i],
    dcUp: dc.up[i], dcLo: dc.lo[i], dcMid: dc.mid[i],
    rvol: rv[i],
    delta: cs[i].tb - cs[i].ts,
    cvd: cs.reduce((s, x, idx) => s + (idx === 0 ? 0 : (x.tb - x.ts)), 0) + (cs[i].tb - cs[i].ts),
    alignment, momentumScore, rsiDiv,
    struct: sw.structure, lastH: sw.lastH ? sw.lastH.p : null, lastL: sw.lastL ? sw.lastL.p : null,
    bosUp: bo.bosUp, bosDn: bo.bosDn, choch: bo.choch,
    fvg: fvgA, orderBlocks: obA,
    bsl: liq.bsl, ssl: liq.ssl,
    close: closes[i], high: cs[i].h, low: cs[i].l, open: cs[i].o, vol: cs[i].v
  };
  return { series: { a14, a10, r, m, bb, kc, stoch, cciA, wr, rocA, e8, e21, e50, e100, e200, adxA, st, vb, obvA, mfiA, dc, rv, closes, cs }, cur };
}

module.exports = {
  prepCandles, sma, ema, rma, atr, rsi, macd, bollinger, keltner, stochastic, cci,
  williamsR, roc, adx, supertrend, vwap, vwapBands, ichimoku, psar, obv, mfi, donchian,
  rvol, pivots, fibonacci, swings, bos, fvg, orderBlocks, liquidity, computeIndicators,
  rollingMax, rollingMin, last, lastN
};
