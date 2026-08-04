'use strict';

// ============================================================================
// PART B — MATHEMATICAL INDICATOR ENGINE — XAUUSDT OMNISCIENT SCALPER v14.0
// Every value derived from raw live OHLCV / payloads. Index len-1 = latest.
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

function wma(arr, p) {
  const out = new Array(arr.length).fill(null);
  const denom = (p * (p + 1)) / 2;
  for (let i = p - 1; i < arr.length; i++) {
    let s = 0;
    for (let j = 0; j < p; j++) s += arr[i - j] * (p - j);
    out[i] = s / denom;
  }
  return out;
}

// ---------- Hull MA (period n, sqrt smoothing) ----------
function hull(arr, n = 21) {
  const n2 = Math.max(2, Math.floor(n / 2));
  const sq = Math.max(1, Math.floor(Math.sqrt(n)));
  const w1 = wma(arr, n), w2 = wma(arr, n2);
  const raw = arr.map((_, i) => (w1[i] !== null && w2[i] !== null ? 2 * w2[i] - w1[i] : null));
  return wma(raw.map((x) => (x === null ? 0 : x)), sq);
}

// ---------- Kaufman Adaptive MA (10, fast 2, slow 30) ----------
function kama(arr, p = 10, fast = 2, slow = 30) {
  const out = new Array(arr.length).fill(null);
  const fc = 2 / (fast + 1), sc = 2 / (slow + 1);
  let prev = null;
  for (let i = 0; i < arr.length; i++) {
    if (i < p) { out[i] = arr[i]; prev = arr[i]; continue; }
    const change = Math.abs(arr[i] - arr[i - p]);
    let volatility = 0;
    for (let j = 0; j < p; j++) volatility += Math.abs(arr[i - j] - arr[i - j - 1]);
    let er = volatility > 0 ? change / volatility : 0;
    const k = (er * (fc - sc) + sc) ** 2;
    prev = arr[i] * k + prev * (1 - k);
    out[i] = prev;
  }
  return out;
}

function rma(arr, p) {
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

const last = (arr) => arr[arr.length - 1];

// ---------- ATR ----------
function trueRange(cs) {
  const tr = [];
  for (let i = 0; i < cs.length; i++) {
    if (i === 0) { tr.push(cs[i].h - cs[i].l); continue; }
    tr.push(Math.max(cs[i].h - cs[i].l, Math.abs(cs[i].h - cs[i - 1].c), Math.abs(cs[i].l - cs[i - 1].c)));
  }
  return tr;
}
function atr(cs, p = 14) { return rma(trueRange(cs), p); }

function rsi(closes, p = 14) {
  const out = new Array(closes.length).fill(null);
  const gains = new Array(closes.length).fill(0), losses = new Array(closes.length).fill(0);
  for (let i = 1; i < closes.length; i++) {
    const d = closes[i] - closes[i - 1];
    gains[i] = Math.max(0, d); losses[i] = Math.max(0, -d);
  }
  const ag = rma(gains, p), al = rma(losses, p);
  for (let i = p; i < closes.length; i++) {
    if (al[i] === 0) { out[i] = 100; continue; }
    out[i] = 100 - 100 / (1 + ag[i] / al[i]);
  }
  return out;
}

function macd(closes) {
  const e12 = ema(closes, 12), e26 = ema(closes, 26);
  const line = closes.map((_, i) => (e12[i] !== null && e26[i] !== null ? e12[i] - e26[i] : null));
  const sig = ema(line.map((x) => (x === null ? 0 : x)), 9);
  const hist = line.map((x, i) => (x !== null && sig[i] !== null ? x - sig[i] : null));
  return { line, sig, hist };
}

function bollinger(closes, p = 20, mult = 2) {
  const mid = sma(closes, p), sd = stdDev(closes, p);
  return {
    mid,
    up: closes.map((_, i) => (mid[i] !== null ? mid[i] + mult * sd[i] : null)),
    lo: closes.map((_, i) => (mid[i] !== null ? mid[i] - mult * sd[i] : null))
  };
}

function keltner(cs, p = 20, mult = 1.5) {
  const mid = ema(cs.map((c) => c.c), p);
  const a = atr(cs, 14);
  return {
    mid,
    up: mid.map((m, i) => (m !== null && a[i] !== null ? m + mult * a[i] : null)),
    lo: mid.map((m, i) => (m !== null && a[i] !== null ? m - mult * a[i] : null))
  };
}

function stochastic(cs, kp = 14, ksm = 3, dsm = 3) {
  const hh = rollingMax(cs.map((c) => c.h), kp), ll = rollingMin(cs.map((c) => c.l), kp);
  const rawK = cs.map((c, i) => (hh[i] !== null && hh[i] !== ll[i] ? ((c.c - ll[i]) / (hh[i] - ll[i])) * 100 : null));
  const k = sma(rawK.map((x) => (x === null ? 50 : x)), ksm);
  const d = sma(k.map((x) => (x === null ? 50 : x)), dsm);
  return { k, d };
}

function cci(cs, p = 20) {
  const tp = cs.map((c) => (c.h + c.l + c.c) / 3);
  const tpSma = sma(tp, p);
  const out = new Array(cs.length).fill(null);
  for (let i = 0; i < cs.length; i++) {
    if (tpSma[i] === null) continue;
    let md = 0;
    for (let j = i - p + 1; j <= i; j++) md += Math.abs(tp[j] - tpSma[i]);
    md /= p;
    out[i] = md === 0 ? 0 : (tp[i] - tpSma[i]) / (0.015 * md);
  }
  return out;
}

function williamsR(cs, p = 14) {
  const hh = rollingMax(cs.map((c) => c.h), p), ll = rollingMin(cs.map((c) => c.l), p);
  return cs.map((c, i) => (hh[i] !== null && hh[i] !== ll[i] ? ((hh[i] - c.c) / (hh[i] - ll[i])) * -100 : null));
}

function roc(closes, p = 9) {
  return closes.map((c, i) => (i >= p ? ((c - closes[i - p]) / closes[i - p]) * 100 : null));
}

function adx(cs, p = 14) {
  const n = cs.length;
  const up = new Array(n).fill(0), dn = new Array(n).fill(0), tr = new Array(n).fill(0);
  for (let i = 1; i < n; i++) {
    const upM = cs[i].h - cs[i - 1].h, dnM = cs[i - 1].l - cs[i].l;
    up[i] = (upM > dnM && upM > 0) ? upM : 0;
    dn[i] = (dnM > upM && dnM > 0) ? dnM : 0;
    tr[i] = Math.max(cs[i].h - cs[i].l, Math.abs(cs[i].h - cs[i - 1].c), Math.abs(cs[i].l - cs[i - 1].c));
  }
  const trS = rma(tr, p), upS = rma(up, p), dnS = rma(dn, p);
  const diP = trS.map((x, i) => (x ? (upS[i] / x) * 100 : 0));
  const diM = trS.map((x, i) => (x ? (dnS[i] / x) * 100 : 0));
  const dx = diP.map((x, i) => (x + diM[i] ? (Math.abs(x - diM[i]) / (x + diM[i])) * 100 : 0));
  return { adx: rma(dx, p), diPlus: diP, diMinus: diM };
}

function supertrend(cs, p = 10, mult = 3.0) {
  const n = cs.length, a = atr(cs, p);
  const hl2 = cs.map((c) => (c.h + c.l) / 2);
  const st = new Array(n).fill(null), dir = new Array(n).fill(1);
  const fup = new Array(n).fill(null), fdn = new Array(n).fill(null);
  for (let i = 0; i < n; i++) {
    if (a[i] === null) continue;
    const bu = hl2[i] + mult * a[i], bl = hl2[i] - mult * a[i];
    if (i === 0) { fup[i] = bu; fdn[i] = bl; st[i] = bl; dir[i] = 1; continue; }
    fup[i] = (bu < fup[i - 1] || cs[i - 1].c > fup[i - 1]) ? bu : fup[i - 1];
    fdn[i] = (bl > fdn[i - 1] || cs[i - 1].c < fdn[i - 1]) ? bl : fdn[i - 1];
    if (st[i - 1] === fup[i - 1]) dir[i] = (cs[i].c > fup[i]) ? 1 : -1;
    else dir[i] = (cs[i].c < fdn[i]) ? -1 : 1;
    st[i] = dir[i] === 1 ? fdn[i] : fup[i];
  }
  return { st, dir };
}

function vwapBands(cs) {
  const n = cs.length;
  const v = new Array(n).fill(null), sd = new Array(n).fill(null);
  let cv = 0, vv = 0, sv = 0;
  for (let i = 0; i < n; i++) {
    const tp = (cs[i].h + cs[i].l + cs[i].c) / 3;
    cv += tp * cs[i].v; vv += cs[i].v; sv += tp * tp * cs[i].v;
    if (vv > 0) {
      v[i] = cv / vv;
      const mean = v[i], variance = Math.max(0, sv / vv - mean * mean);
      sd[i] = Math.sqrt(variance);
    }
  }
  return { v, sd };
}

function obv(cs) {
  const out = new Array(cs.length).fill(0);
  for (let i = 1; i < cs.length; i++) {
    if (cs[i].c > cs[i - 1].c) out[i] = out[i - 1] + cs[i].v;
    else if (cs[i].c < cs[i - 1].c) out[i] = out[i - 1] - cs[i].v;
    else out[i] = out[i - 1];
  }
  return out;
}

function mfi(cs, p = 14) {
  const n = cs.length, tp = cs.map((c) => (c.h + c.l + c.c) / 3);
  const rf = tp.map((x, i) => x * cs[i].v);
  const out = new Array(n).fill(null);
  for (let i = p; i < n; i++) {
    let pos = 0, neg = 0;
    for (let j = i - p + 1; j <= i; j++) {
      if (tp[j] > tp[j - 1]) pos += rf[j];
      else if (tp[j] < tp[j - 1]) neg += rf[j];
    }
    out[i] = neg === 0 ? (pos === 0 ? 50 : 100) : 100 - 100 / (1 + pos / neg);
  }
  return out;
}

function donchian(cs, p = 20) {
  const up = rollingMax(cs.map((c) => c.h), p), lo = rollingMin(cs.map((c) => c.l), p);
  return { up, lo, mid: up.map((u, i) => (u !== null && lo[i] !== null ? (u + lo[i]) / 2 : null)) };
}

function rvol(cs, p = 20) {
  const v = cs.map((c) => c.v), m = sma(v, p);
  return v.map((x, i) => (m[i] ? x / m[i] : null));
}

// ---------- volume profile (POC / VAH / VAL) ----------
function volumeProfile(cs, bins = 40) {
  if (!cs || cs.length < 30) return null;
  const seg = cs.slice(-100);
  let hi = -Infinity, lo = Infinity;
  for (const c of seg) { if (c.h > hi) hi = c.h; if (c.l < lo) lo = c.l; }
  if (hi === lo) return null;
  const step = (hi - lo) / bins;
  const vol = new Array(bins).fill(0);
  for (const c of seg) {
    const mid = (c.h + c.l) / 2;
    let b = Math.floor((mid - lo) / step);
    if (b >= bins) b = bins - 1; if (b < 0) b = 0;
    vol[b] += c.v;
  }
  let pocIdx = 0, tot = 0;
  for (let i = 0; i < bins; i++) { tot += vol[i]; if (vol[i] > vol[pocIdx]) pocIdx = i; }
  const target = tot * 0.7;
  let acc = 0, loIdx = pocIdx, hiIdx = pocIdx;
  while (acc < target && (loIdx > 0 || hiIdx < bins - 1)) {
    const below = loIdx > 0 ? vol[loIdx - 1] : 0, above = hiIdx < bins - 1 ? vol[hiIdx + 1] : 0;
    if (below >= above) { loIdx--; acc += vol[loIdx]; } else { hiIdx++; acc += vol[hiIdx]; }
  }
  return {
    poc: lo + (pocIdx + 0.5) * step,
    vah: lo + (hiIdx + 0.5) * step,
    val: lo + (loIdx + 0.5) * step,
    range: hi - lo,
    profile: vol.map((v, i) => ({ price: lo + (i + 0.5) * step, vol: v, isPoc: i === pocIdx }))
  };
}

// ---------- pivots ----------
function pivots(dayCs) {
  if (!dayCs || dayCs.length === 0) return null;
  const prev = dayCs[dayCs.length - 2] || dayCs[dayCs.length - 1];
  const H = prev.h, L = prev.l, C = prev.c, O = prev.o;
  const p = (H + L + C) / 3;
  const r1 = 2 * p - L, s1 = 2 * p - H;
  const r2 = p + (H - L), s2 = p - (H - L);
  const r3 = H + 2 * (p - L), s3 = L - 2 * (H - p);
  const mid = (r1 + s1) / 2, cpr = (H + L + O + C) / 4;
  return { P: p, R1: r1, S1: s1, R2: r2, S2: s2, R3: r3, S3: s3, mid, cpr, prevH: H, prevL: L, prevC: C };
}

// ---------- fibonacci ----------
function fibonacci(hi, lo) {
  const range = hi - lo;
  return {
    L0: lo, L236: lo + 0.236 * range, L382: lo + 0.382 * range, L50: lo + 0.5 * range,
    L618: lo + 0.618 * range, L786: lo + 0.786 * range, L100: hi,
    X1272: lo + 1.272 * range, X1618: lo + 1.618 * range, X200: lo + 2.0 * range, X2618: lo + 2.618 * range
  };
}

// ---------- market structure ----------
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
    const prevH = highs[highs.length - 2], prevL = lows[lows.length - 2];
    const hh = lastH.p > prevH.p, hl = lastL.p > prevL.p;
    const lh = lastH.p < prevH.p, ll = lastL.p < prevL.p;
    if (hh && hl) structure = 'HH+HL UPTREND';
    else if (lh && ll) structure = 'LH+LL DOWNTREND';
    else if (hh && ll) structure = 'MIXED';
  }
  return { highs, lows, structure, lastH, lastL };
}

function bos(cs, swing) {
  const c = last(cs).c;
  const lastSH = swing.lastH, lastSL = swing.lastL;
  let bosUp = false, bosDn = false, choch = null;
  if (lastSH) {
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

// ---------- FVG (last unfilled) ----------
function fvg(cs) {
  const n = cs.length;
  for (let i = n - 3; i >= 2; i--) {
    const c3 = cs[i], c1 = cs[i - 2];
    if (c3.l > c1.h) return { type: 'BULLISH', top: c3.l, bottom: c1.h, mid: (c3.l + c1.h) / 2, idx: i, size: c3.l - c1.h };
    if (c3.h < c1.l) return { type: 'BEARISH', top: c1.l, bottom: c3.h, mid: (c1.l + c3.h) / 2, idx: i, size: c1.l - c3.h };
  }
  return null;
}

// ---------- liquidity voids (large body candles = air pockets) ----------
function liquidityVoids(cs, minBodyAtr = 1.5) {
  const n = cs.length;
  const a = atr(cs, 14);
  const voids = [];
  for (let i = Math.max(1, n - 60); i < n; i++) {
    const body = Math.abs(cs[i].c - cs[i].o);
    if (a[i] && body > minBodyAtr * a[i]) {
      voids.push({ type: cs[i].c > cs[i].o ? 'BULLISH' : 'BEARISH', top: Math.max(cs[i].c, cs[i].o), bottom: Math.min(cs[i].c, cs[i].o), idx: i, body });
    }
  }
  return voids;
}

// ---------- order blocks ----------
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

// ---------- breaker blocks (last OB swept then price re-enters) ----------
function breakerBlocks(cs, swing) {
  const n = cs.length;
  const blocks = [];
  if (swing.lows.length >= 2) {
    const lastL = swing.lows[swing.lows.length - 1];
    const prevH = swing.highs.length >= 2 ? swing.highs[swing.highs.length - 2] : null;
    if (prevH && lastL.p < prevH.p && last(cs).c > prevH.p) {
      blocks.push({ type: 'BULLISH', top: prevH.p, bottom: prevH.p - atr(cs, 14)[n - 1] * 0.5, idx: lastL.i });
    }
  }
  if (swing.highs.length >= 2) {
    const lastH = swing.highs[swing.highs.length - 1];
    const prevL = swing.lows.length >= 2 ? swing.lows[swing.lows.length - 2] : null;
    if (prevL && lastH.p > prevL.p && last(cs).c < prevL.p) {
      blocks.push({ type: 'BEARISH', bottom: prevL.p, top: prevL.p + atr(cs, 14)[n - 1] * 0.5, idx: lastH.i });
    }
  }
  return blocks;
}

// ---------- inducement (false range break then reclaim) ----------
function inducement(cs) {
  const n = cs.length;
  if (n < 30) return null;
  const seg = cs.slice(-30);
  const range = {
    hi: Math.max(...seg.map((x) => x.h)),
    lo: Math.min(...seg.map((x) => x.l)),
    mid: (Math.max(...seg.map((x) => x.h)) + Math.min(...seg.map((x) => x.l))) / 2
  };
  const c = last(cs).c;
  const a = atr(cs, 14);
  let fakeUp = false, fakeDn = false;
  for (let i = n - 25; i < n - 2; i++) {
    if (cs[i].h > range.hi && cs[i].c < range.hi) fakeUp = true;
    if (cs[i].l < range.lo && cs[i].c > range.lo) fakeDn = true;
  }
  const recent = cs.slice(-3);
  if (fakeUp && recent.every((x) => x.c > range.mid)) return { type: 'BULLISH', range, note: 'false breakdown swept lows, price reclaimed mid' };
  if (fakeDn && recent.every((x) => x.c < range.mid)) return { type: 'BEARISH', range, note: 'false breakout above highs, price reclaimed mid' };
  return null;
}

// ---------- dynamic S/R (cluster of swing + round levels) ----------
function dynamicSR(cs, swing) {
  const n = cs.length;
  const c = last(cs).c;
  const a = atr(cs, 14)[n - 1] || 1;
  const levels = [];
  for (const s of swing.highs) levels.push({ price: s.p, type: 'RESISTANCE', strength: 1, src: 'SWING' });
  for (const s of swing.lows) levels.push({ price: s.p, type: 'SUPPORT', strength: 1, src: 'SWING' });
  const round = Math.round(c / 10) * 10;
  for (const r of [round, round + 10, round - 10, round + 20, round - 20]) {
    if (Math.abs(r - c) < a * 12) levels.push({ price: r, type: r >= c ? 'RESISTANCE' : 'SUPPORT', strength: 2, src: 'ROUND' });
  }
  // cluster merge within 0.25 ATR
  levels.sort((x, y) => x.price - y.price);
  const merged = [];
  for (const l of levels) {
    const lastM = merged[merged.length - 1];
    if (lastM && Math.abs(lastM.price - l.price) <= a * 0.25) {
      lastM.strength += l.strength;
      lastM.price = (lastM.price + l.price) / 2;
    } else merged.push({ ...l });
  }
  const res = merged.filter((l) => l.type === 'RESISTANCE' && l.price > c).sort((x, y) => x.price - y.price);
  const sup = merged.filter((l) => l.type === 'SUPPORT' && l.price < c).sort((x, y) => y.price - x.price);
  return {
    nearestResistance: res[0] ? res[0].price : null,
    nearestSupport: sup[0] ? sup[0].price : null,
    resistance: res.slice(0, 3).map((x) => x.price),
    support: sup.slice(0, 3).map((x) => x.price),
    all: merged
  };
}

// ---------- range / consolidation detection ----------
function rangeDetect(cs, lookback = 30) {
  const n = cs.length;
  if (n < lookback + 3) return { hi: null, lo: null, mid: null, width: null, active: false };
  const seg = cs.slice(n - lookback, n - 1);
  const hi = Math.max(...seg.map((x) => x.h));
  const lo = Math.min(...seg.map((x) => x.l));
  const a = atr(cs, 14)[n - 1] || 1;
  const width = hi - lo;
  const active = width < a * 3.5;
  const mid = (hi + lo) / 2;
  const tol = a * 0.35;
  const c = last(cs).c;
  return {
    hi, lo, mid, width, active,
    atHigh: Math.abs(c - hi) <= tol,
    atLow: Math.abs(c - lo) <= tol,
    atMid: Math.abs(c - mid) <= tol,
    breakUp: c > hi + tol,
    breakDn: c < lo - tol,
    fakeUp: last(cs).h > hi && c < hi,
    fakeDn: last(cs).l < lo && c > lo
  };
}

// ---------- liquidity pools (equal highs/lows = buy/sell-side liquidity) ----------
function liquidity(cs, swing) {
  const lastSH = swing.lastH ? swing.lastH.p : null;
  const lastSL = swing.lastL ? swing.lastL.p : null;
  const eqH = [], eqL = [];
  const H = cs.map((c) => c.h), L = cs.map((c) => c.l);
  const scale = Math.max(1, (H[H.length - 1] || 1) * 0.00025);
  for (let i = 0; i < cs.length - 1; i++) {
    for (let j = i + 1; j < cs.length && j <= i + 40; j++) {
      if (Math.abs(H[i] - H[j]) < scale && Math.abs(cs[i].t - cs[j].t) > 3 * 60000) eqH.push((H[i] + H[j]) / 2);
      if (Math.abs(L[i] - L[j]) < scale && Math.abs(cs[i].t - cs[j].t) > 3 * 60000) eqL.push((L[i] + L[j]) / 2);
    }
  }
  return { bsl: eqH.length ? eqH[eqH.length - 1] : lastSH, ssl: eqL.length ? eqL[eqL.length - 1] : lastSL, eqHighs: eqH.slice(-3), eqLows: eqL.slice(-3) };
}

// ---------- trendlines (least-squares fit through recent swings) ----------
function trendLines(cs, swing, lookback = 6) {
  const n = cs.length;
  const a = atr(cs, 14);
  const out = { upValue: null, dnValue: null, upSlope: null, dnSlope: null, upTouches: 0, dnTouches: 0, upActive: false, dnActive: false, upRecent: false, dnRecent: false };
  const fit = (pts) => {
    if (!pts || pts.length < 2) return null;
    const x = pts.map((p) => p.i), y = pts.map((p) => p.p);
    const mx = x.reduce((s, v) => s + v, 0) / x.length;
    const my = y.reduce((s, v) => s + v, 0) / y.length;
    let num = 0, den = 0;
    for (let k = 0; k < x.length; k++) { num += (x[k] - mx) * (y[k] - my); den += (x[k] - mx) ** 2; }
    const slope = den ? num / den : 0;
    const intercept = my - slope * mx;
    return { slope, valueAt: (i) => intercept + slope * i };
  };
  const lows = swing.lows.slice(-lookback);
  const highs = swing.highs.slice(-lookback);
  if (lows.length >= 2) {
    const f = fit(lows);
    if (f && f.slope > 0.000001) {
      out.upValue = f.valueAt(n - 1);
      out.upSlope = f.slope;
      out.upActive = true;
      out.upTouches = lows.length;
      const lastLow = lows[lows.length - 1];
      out.upRecent = n - 1 - lastLow.i <= 12;
    }
  }
  if (highs.length >= 2) {
    const f = fit(highs);
    if (f && f.slope < -0.000001) {
      out.dnValue = f.valueAt(n - 1);
      out.dnSlope = f.slope;
      out.dnActive = true;
      out.dnTouches = highs.length;
      const lastHigh = highs[highs.length - 1];
      out.dnRecent = n - 1 - lastHigh.i <= 12;
    }
  }
  const tol = a[n - 1] * 0.35;
  out.upTouch = out.upValue !== null && Math.abs(last(cs).c - out.upValue) <= tol;
  out.dnTouch = out.dnValue !== null && Math.abs(last(cs).c - out.dnValue) <= tol;
  out.upBreak = out.upValue !== null && last(cs).c > out.upValue + tol;
  out.dnBreak = out.dnValue !== null && last(cs).c < out.dnValue - tol;
  out.upFake = out.upValue !== null && last(cs).h > out.upValue && last(cs).c < out.upValue;
  out.dnFake = out.dnValue !== null && last(cs).l < out.dnValue && last(cs).c > out.dnValue;
  return out;
}

// ---------- channels (trendline + parallel) ----------
function channels(cs, swing, tl) {
  const n = cs.length;
  const a = atr(cs, 14);
  const out = { upLow: null, upHigh: null, dnLow: null, dnHigh: null, width: null, state: 'NONE' };
  const tol = a[n - 1] * 0.35;
  if (tl.upActive && tl.upValue !== null) {
    let maxDev = 0, minDev = Infinity;
    for (const l of swing.lows.slice(-6)) {
      const v = tl.upSlope !== null ? tl.upValue - tl.upSlope * (n - 1 - l.i) : l.p;
      maxDev = Math.max(maxDev, Math.abs(l.p - v));
    }
    for (const h of swing.highs.slice(-6)) {
      const v = tl.upSlope !== null ? tl.upValue - tl.upSlope * (n - 1 - h.i) : h.p;
      minDev = Math.min(minDev, Math.abs(h.p - v));
    }
    out.upLow = tl.upValue;
    out.upHigh = tl.upValue + maxDev * 1.4 + tol;
    out.width = out.upHigh - out.upLow;
    out.state = 'UP';
    out.upLowTouch = Math.abs(last(cs).c - out.upLow) <= tol;
    out.upHighTouch = Math.abs(last(cs).c - out.upHigh) <= tol;
    out.upBreak = last(cs).c > out.upHigh + tol;
    out.upFake = last(cs).h > out.upHigh && last(cs).c < out.upHigh;
  }
  if (tl.dnActive && tl.dnValue !== null) {
    let maxDev = 0, minDev = Infinity;
    for (const h of swing.highs.slice(-6)) {
      const v = tl.dnValue - tl.dnSlope * (n - 1 - h.i);
      maxDev = Math.max(maxDev, Math.abs(h.p - v));
    }
    for (const l of swing.lows.slice(-6)) {
      const v = tl.dnValue - tl.dnSlope * (n - 1 - l.i);
      minDev = Math.min(minDev, Math.abs(l.p - v));
    }
    out.dnHigh = tl.dnValue;
    out.dnLow = tl.dnValue - maxDev * 1.4 - tol;
    out.width = out.width === null ? out.dnHigh - out.dnLow : Math.max(out.width, out.dnHigh - out.dnLow);
    out.state = out.state === 'UP' ? 'BOTH' : 'DOWN';
    out.dnHighTouch = Math.abs(last(cs).c - out.dnHigh) <= tol;
    out.dnLowTouch = Math.abs(last(cs).c - out.dnLow) <= tol;
    out.dnBreak = last(cs).c < out.dnLow - tol;
    out.dnFake = last(cs).l < out.dnLow && last(cs).c > out.dnLow;
  }
  if (out.width !== null) {
    out.tight = out.width < a[n - 1] * 1.5;
    out.wide = out.width > a[n - 1] * 4;
    const mid = out.state === 'UP' ? (out.upLow + out.upHigh) / 2 : (out.dnLow + out.dnHigh) / 2;
    out.midTouch = Math.abs(last(cs).c - mid) <= tol;
  }
  return out;
}

// ---------- MA ribbon 8/13/21/34/55 ----------
function maRibbon(closes) {
  const ribbon = { 8: ema(closes, 8), 13: ema(closes, 13), 21: ema(closes, 21), 34: ema(closes, 34), 55: ema(closes, 55) };
  const i = closes.length - 1;
  const vals = Object.keys(ribbon).map((k) => ({ k, v: ribbon[k][i] }));
  let spread = null;
  if (vals.every((x) => x.v !== null)) spread = Math.max(...vals.map((x) => x.v)) - Math.min(...vals.map((x) => x.v));
  let state = 'MIXED';
  const asc = vals.every((x, idx, arr) => idx === 0 || arr[idx - 1].v < x.v);
  const desc = vals.every((x, idx, arr) => idx === 0 || arr[idx - 1].v > x.v);
  if (asc) state = 'BULLISH';
  else if (desc) state = 'BEARISH';
  return { ribbon, state, spread, vals: vals.map((x) => ({ p: x.k, v: x.v })) };
}

// ---------- session detection (UTC) ----------
function session(ts) {
  const d = new Date(ts || Date.now());
  const h = d.getUTCHours() + d.getUTCMinutes() / 60;
  let name, openMins;
  if (h >= 0 && h < 7) { name = 'ASIA'; openMins = h * 60; }
  else if (h >= 7 && h < 12) { name = 'LONDON'; openMins = (h - 7) * 60; }
  else if (h >= 12 && h < 21) { name = 'NEWYORK'; openMins = (h - 12) * 60; }
  else { name = 'ASIA'; openMins = h < 24 ? (h - 21) * 60 : 0; }
  return { name, openMins, hour: h, utc: d.toISOString() };
}

// ---------- funding trend helpers ----------
function fundingTrend(fundingHistory) {
  if (!fundingHistory || fundingHistory.length < 3) return null;
  const rates = fundingHistory.map((x) => +x.fundingRate);
  const lastRate = rates[rates.length - 1];
  const prevRate = rates[rates.length - 2];
  const avg8 = rates.slice(-8).reduce((s, x) => s + x, 0) / Math.min(8, rates.length);
  const avg24 = rates.slice(-24).reduce((s, x) => s + x, 0) / Math.min(24, rates.length);
  const slope = lastRate - avg8;
  let extreme = 'NONE';
  if (lastRate > 0.0005) extreme = 'POSITIVE';
  else if (lastRate < -0.0005) extreme = 'NEGATIVE';
  const flip = (prevRate < 0 && lastRate >= 0) ? 'UP' : (prevRate > 0 && lastRate <= 0) ? 'DOWN' : 'NONE';
  return { lastRate, prevRate, avg8, avg24, slope, extreme, flip };
}

// ---------- full computation for a timeframe ----------
function computeIndicators(cs) {
  if (!cs || cs.length < 60) return null;
  const closes = cs.map((c) => c.c);
  const a14 = atr(cs, 14), a10 = atr(cs, 10);
  const r = rsi(closes, 14);
  const m = macd(closes);
  const bb = bollinger(closes, 20, 2);
  const kc = keltner(cs, 20, 1.5);
  const stoch = stochastic(cs, 14, 3, 3);
  const cciA = cci(cs, 20);
  const wr = williamsR(cs, 14);
  const rocA = roc(closes, 9);
  const e8 = ema(closes, 8), e21 = ema(closes, 21), e50 = ema(closes, 50), e100 = ema(closes, 100), e200 = ema(closes, 200);
  const hullA = hull(closes, 21);
  const kamaA = kama(closes, 10);
  const adxA = adx(cs, 14);
  const st = supertrend(cs, 10, 3);
  const vb = vwapBands(cs);
  const obvA = obv(cs);
  const mfiA = mfi(cs, 14);
  const dc = donchian(cs, 20);
  const rv = rvol(cs, 20);
  const sw = swings(cs);
  const bo = bos(cs, sw);
  const fvgA = fvg(cs);
  const obA = orderBlocks(cs, sw);
  const brk = breakerBlocks(cs, sw);
  const voids = liquidityVoids(cs);
  const ind = inducement(cs);
  const dSR = dynamicSR(cs, sw);
  const tl = trendLines(cs, sw);
  const ch = channels(cs, sw, tl);
  const liq = liquidity(cs, sw);
  const rng = rangeDetect(cs);
  const ribbon = maRibbon(closes);
  const vp = volumeProfile(cs);

  const i = closes.length - 1;
  const bbWidthPct = bb.mid[i] ? ((bb.up[i] - bb.lo[i]) / bb.mid[i]) * 100 : null;
  const pctB = bb.up[i] !== bb.lo[i] ? (closes[i] - bb.lo[i]) / (bb.up[i] - bb.lo[i]) : 0.5;
  const atrPct = (a14[i] / closes[i]) * 100;

  let alignment;
  if (closes[i] > e8[i] && e8[i] > e21[i] && e21[i] > e50[i]) alignment = 'BULLISH';
  else if (closes[i] < e8[i] && e8[i] < e21[i] && e21[i] < e50[i]) alignment = 'BEARISH';
  else alignment = 'MIXED';

  const momParts = [];
  if (r[i] !== null) momParts.push(r[i] >= 55 ? 1 : r[i] <= 45 ? -1 : 0);
  if (m.hist[i] !== null) momParts.push(m.hist[i] > 0 && m.hist[i] > (m.hist[i - 1] || 0) ? 1 : m.hist[i] < 0 && m.hist[i] < (m.hist[i - 1] || 0) ? -1 : 0);
  if (stoch.k[i] !== null) momParts.push(stoch.k[i] > 50 ? 1 : -1);
  if (cciA[i] !== null) momParts.push(cciA[i] > 100 ? 1 : cciA[i] < -100 ? -1 : 0);
  if (wr[i] !== null) momParts.push(wr[i] > -50 ? 1 : -1);
  const momentumScore = ((momParts[0] || 0) * 0.3 + (momParts[1] || 0) * 0.25 + (momParts[2] || 0) * 0.2 + (momParts[3] || 0) * 0.15 + (momParts[4] || 0) * 0.1 + 1) / 2 * 10;

  let rsiDiv = null;
  for (let k = 3; k <= 12; k++) {
    if (closes[i] < closes[i - k] && r[i] > r[i - k]) { rsiDiv = 'BULLISH'; break; }
    if (closes[i] > closes[i - k] && r[i] < r[i - k]) { rsiDiv = 'BEARISH'; break; }
  }

  // candle patterns
  const body = Math.abs(closes[i] - cs[i].o);
  const range = cs[i].h - cs[i].l;
  const upBody = cs[i].c > cs[i].o;
  const upperWick = cs[i].h - Math.max(cs[i].c, cs[i].o);
  const lowerWick = Math.min(cs[i].c, cs[i].o) - cs[i].l;
  const pinBull = range > 0 && lowerWick >= 2 * body && upperWick <= 0.5 * body && lowerWick > a14[i] * 0.5;
  const pinBear = range > 0 && upperWick >= 2 * body && lowerWick <= 0.5 * body && upperWick > a14[i] * 0.5;
  const hammer = range > 0 && lowerWick >= 2 * body && upBody && lowerWick > a14[i] * 0.6;
  const shootingStar = range > 0 && upperWick >= 2 * body && !upBody && upperWick > a14[i] * 0.6;
  const doji = range > 0 && body <= a14[i] * 0.1;
  const prevBody = Math.abs(cs[i - 1].c - cs[i - 1].o);
  const engulfBull = upBody && !(cs[i - 1].c > cs[i - 1].o) && cs[i].c >= cs[i - 1].o && cs[i].o <= cs[i - 1].c && body > prevBody;
  const engulfBear = !upBody && cs[i - 1].c > cs[i - 1].o && cs[i].c <= cs[i - 1].o && cs[i].o >= cs[i - 1].c && body > prevBody;
  const threeWhite = cs.length > 4 && cs[i - 2].c > cs[i - 2].o && cs[i - 1].c > cs[i - 1].o && upBody && cs[i - 1].c > cs[i - 2].c && cs[i].c > cs[i - 1].c;
  const threeBlack = cs.length > 4 && !(cs[i - 2].c > cs[i - 2].o) && !(cs[i - 1].c > cs[i - 1].o) && !upBody && cs[i - 1].c < cs[i - 2].c && cs[i].c < cs[i - 1].c;
  const marubozu = range > 0 && body > a14[i] * 0.8 && upperWick < a14[i] * 0.15 && lowerWick < a14[i] * 0.15;

  const cur = {
    price: closes[i], atr14: a14[i], atr10: a10[i], atrPct,
    rsi: r[i], macdLine: m.line[i], macdSig: m.sig[i], macdHist: m.hist[i],
    macdHistPrev: m.hist[i - 1] || null, macdHist2: m.hist[i - 2] || null,
    bbUp: bb.up[i], bbLo: bb.lo[i], bbMid: bb.mid[i], bbWidthPct, pctB,
    kcUp: kc.up[i], kcLo: kc.lo[i],
    squeeze: bb.up[i] < kc.up[i] && bb.lo[i] > kc.lo[i],
    stK: stoch.k[i], stD: stoch.d[i],
    cci: cciA[i], wr: wr[i], roc: rocA[i],
    ema8: e8[i], ema21: e21[i], ema50: e50[i], ema100: e100[i], ema200: e200[i],
    hull: hullA[i], kama: kamaA[i],
    ema8Slope: (e8[i] - e8[i - 3]) / 3, ema21Slope: (e21[i] - e21[i - 3]) / 3,
    adx: adxA.adx[i], diPlus: adxA.diPlus[i], diMinus: adxA.diMinus[i],
    supertrend: st.st[i], supertrendDir: st.dir[i],
    vwap: vb.v[i], vwapSd: vb.sd[i],
    obv: obvA[i], obvSlope: obvA[i] - obvA[i - 5],
    mfi: mfiA[i],
    dcUp: dc.up[i], dcLo: dc.lo[i], dcMid: dc.mid[i],
    rvol: rv[i],
    delta: cs[i].tb - cs[i].ts,
    cvd: cs.reduce((s, x, idx) => s + (idx === 0 ? 0 : (x.tb - x.ts)), 0) + (cs[i].tb - cs[i].ts),
    alignment, momentumScore, rsiDiv,
    struct: sw.structure, lastH: sw.lastH ? sw.lastH.p : null, lastL: sw.lastL ? sw.lastL.p : null,
    swingHighs: sw.highs.slice(-6).map((x) => x.p),
    swingLows: sw.lows.slice(-6).map((x) => x.p),
    bosUp: bo.bosUp, bosDn: bo.bosDn, choch: bo.choch,
    fvg: fvgA, orderBlocks: obA, breakerBlocks: brk, voids, inducement: ind,
    dynamicSR: dSR, ribbon, volumeProfile: vp, tl, channel: ch,
    bsl: liq.bsl, ssl: liq.ssl, eqHighs: liq.eqHighs, eqLows: liq.eqLows,
    range: rng,
    patterns: { pinBull, pinBear, hammer, shootingStar, doji, engulfBull, engulfBear, threeWhite, threeBlack, marubozu, body, range, upBody, upperWick, lowerWick },
    close: closes[i], high: cs[i].h, low: cs[i].l, open: cs[i].o, vol: cs[i].v
  };
  return { series: { a14, a10, r, m, bb, kc, stoch, cciA, wr, rocA, e8, e21, e50, e100, e200, hullA, kamaA, adxA, st, vb, obvA, mfiA, dc, rv, closes, cs }, cur };
}

module.exports = {
  prepCandles, sma, ema, wma, hull, kama, rma, atr, rsi, macd, bollinger, keltner,
  stochastic, cci, williamsR, roc, adx, supertrend, vwapBands, obv, mfi, donchian,
  rvol, volumeProfile, pivots, fibonacci, swings, bos, fvg, liquidityVoids, orderBlocks,
  breakerBlocks, inducement, dynamicSR, liquidity, rangeDetect, trendLines, channels, maRibbon, session, fundingTrend, computeIndicators,
  rollingMax, rollingMin, last
};
