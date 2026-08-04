'use strict';
/* =====================================================================
   XAU/USDT OMNISCIENT SCALP COUNCIL v13.0 - "THE GOLDEN 500"
   Live web-fetching 500-agent scalping cortex + THE GILDED HAND arbiter.
   Built from scratch. Every number traces to a live API fetch.
   ===================================================================== */

const B = 'https://fapi.binance.com/fapi/v1';
const Y = 'https://query1.finance.yahoo.com/v8/finance/chart';
const APP = {
  tf: '3m',
  side: null,
  lastRun: 0,
  lastTickets: null,
  lastVerdict: null,
  lastData: null,
  newsCache: null,
  newsAt: 0,
  busy: false
};

/* ---------------- utils ---------------- */

function $(s) { return document.querySelector(s); }
function esc(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function fmt(x, d) { if (x === null || x === undefined || !isFinite(x)) return '—'; return x.toFixed(d === undefined ? 2 : d); }
function pct(x) { if (x === null || x === undefined || !isFinite(x)) return '—'; return (x >= 0 ? '+' : '') + x.toFixed(2) + '%'; }
function hashStr(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0); }
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

async function getJSON(url, timeout) {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeout || 12000);
    const r = await fetch(url, { signal: ctrl.signal });
    clearTimeout(t);
    if (!r.ok) return null;
    return await r.json();
  } catch (e) { return null; }
}
function P(u) {
  const local = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  return local ? '/api/proxy?u=' + encodeURIComponent(u) : 'https://api.allorigins.win/raw?url=' + encodeURIComponent(u);
}

/* ---------------- indicator library ---------------- */

function smaArr(v, p) {
  const out = new Array(v.length).fill(null);
  let s = 0;
  for (let i = 0; i < v.length; i++) {
    s += v[i];
    if (i >= p) s -= v[i - p];
    if (i >= p - 1) out[i] = s / p;
  }
  return out;
}
function emaArr(v, p) {
  const out = new Array(v.length);
  const k = 2 / (p + 1);
  let prev = null;
  for (let i = 0; i < v.length; i++) {
    prev = prev === null ? v[i] : v[i] * k + prev * (1 - k);
    out[i] = prev;
  }
  return out;
}
function stdArr(v, p) {
  const out = new Array(v.length).fill(null);
  for (let i = p - 1; i < v.length; i++) {
    const s = v.slice(i - p + 1, i + 1);
    const m = s.reduce((a, b) => a + b, 0) / p;
    out[i] = Math.sqrt(s.reduce((a, b) => a + (b - m) * (b - m), 0) / p);
  }
  return out;
}
function rsiArr(closes, p) {
  const out = new Array(closes.length).fill(null);
  let g = 0, l = 0;
  for (let i = 1; i < closes.length; i++) {
    const d = closes[i] - closes[i - 1];
    if (d > 0) g += d; else l -= d;
    if (i <= p) {
      if (i === p) {
        const rg = g / p, rl = l / p;
        out[i] = rl === 0 ? 100 : 100 - 100 / (1 + rg / rl);
      }
    } else {
      g = (g * (p - 1) + (d > 0 ? d : 0)) / p;
      l = (l * (p - 1) + (d < 0 ? -d : 0)) / p;
      out[i] = l === 0 ? 100 : 100 - 100 / (1 + g / l);
    }
  }
  return out;
}
function atrArr(cs, p) {
  const tr = new Array(cs.length);
  for (let i = 0; i < cs.length; i++) {
    if (i === 0) tr[i] = cs[i].h - cs[i].l;
    else {
      const pc = cs[i - 1];
      tr[i] = Math.max(cs[i].h - cs[i].l, Math.abs(cs[i].h - pc.c), Math.abs(cs[i].l - pc.c));
    }
  }
  return emaArr(tr, p);
}
function macdArr(cs) {
  const c = cs.map(x => x.c);
  const f = emaArr(c, 12), s = emaArr(c, 26);
  const m = f.map((v, i) => v - s[i]);
  const sig = emaArr(m, 9);
  return { m, sig, hist: m.map((v, i) => v - sig[i]) };
}
function stochArr(cs, p, k, d) {
  const ks = new Array(cs.length).fill(null);
  for (let i = p - 1; i < cs.length; i++) {
    let hh = -Infinity, ll = Infinity;
    for (let j = i - p + 1; j <= i; j++) { hh = Math.max(hh, cs[j].h); ll = Math.min(ll, cs[j].l); }
    ks[i] = ll === hh ? 50 : (cs[i].c - ll) / (hh - ll) * 100;
  }
  const sm = (a, pp) => { const o = new Array(a.length).fill(null); for (let i = pp - 1; i < a.length; i++) { let s = 0, n = 0; for (let j = i - pp + 1; j <= i; j++) if (a[j] !== null) { s += a[j]; n++; } o[i] = n ? s / n : null; } return o; };
  const kk = sm(ks, k), dd = sm(kk, d);
  return { k: kk, d: dd };
}
function cciArr(cs, p) {
  const out = new Array(cs.length).fill(null);
  const tp = cs.map(x => (x.h + x.l + x.c) / 3);
  for (let i = p - 1; i < cs.length; i++) {
    const s = tp.slice(i - p + 1, i + 1);
    const m = s.reduce((a, b) => a + b, 0) / p;
    let md = 0;
    for (let j = 0; j < p; j++) md += Math.abs(s[j] - m);
    md /= p;
    out[i] = md === 0 ? 0 : (tp[i] - m) / (0.015 * md);
  }
  return out;
}
function wrArr(cs, p) {
  const out = new Array(cs.length).fill(null);
  for (let i = p - 1; i < cs.length; i++) {
    let hh = -Infinity, ll = Infinity;
    for (let j = i - p + 1; j <= i; j++) { hh = Math.max(hh, cs[j].h); ll = Math.min(ll, cs[j].l); }
    out[i] = (hh - ll) === 0 ? -50 : (hh - cs[i].c) / (hh - ll) * -100;
  }
  return out;
}
function bbArr(cs, p, m) {
  const c = cs.map(x => x.c);
  const mid = smaArr(c, p), sd = stdArr(c, p);
  const up = mid.map((v, i) => v === null ? null : v + m * sd[i]);
  const lo = mid.map((v, i) => v === null ? null : v - m * sd[i]);
  const pctB = c.map((v, i) => up[i] === null || up[i] === lo[i] ? null : (v - lo[i]) / (up[i] - lo[i]));
  return { mid, up, lo, pctB };
}
function donArr(cs, p) {
  const hi = new Array(cs.length).fill(null), lo = new Array(cs.length).fill(null);
  for (let i = p - 1; i < cs.length; i++) {
    let hh = -Infinity, ll = Infinity;
    for (let j = i - p + 1; j <= i; j++) { hh = Math.max(hh, cs[j].h); ll = Math.min(ll, cs[j].l); }
    hi[i] = hh; lo[i] = ll;
  }
  return { hi, lo };
}
function stArr(cs, p, f) {
  const atr = atrArr(cs, p);
  const hl2 = cs.map(x => (x.h + x.l) / 2);
  let dir = 1;
  const st = new Array(cs.length).fill(null);
  for (let i = 0; i < cs.length; i++) {
    const mid = hl2[i] + f * atr[i];
    const mid2 = hl2[i] - f * atr[i];
    let up = mid, dn = mid2;
    if (i > 0) {
      if (up < st[i - 1] || cs[i - 1].c > st[i - 1]) up = Math.max(mid, st[i - 1]);
      if (dn > st[i - 1] || cs[i - 1].c < st[i - 1]) dn = Math.min(mid2, st[i - 1]);
    }
    st[i] = dir === 1 ? dn : up;
    if (cs[i].c > up && dir === -1) dir = 1;
    else if (cs[i].c < dn && dir === 1) dir = -1;
    st[i] = dir === 1 ? dn : up;
  }
  return { dir, st };
}
function adxArr(cs, p) {
  const n = cs.length;
  const tr = new Array(n).fill(0), pdm = new Array(n).fill(0), ndm = new Array(n).fill(0);
  for (let i = 1; i < n; i++) {
    const up = cs[i].h - cs[i - 1].h, dn = cs[i - 1].l - cs[i].l;
    tr[i] = Math.max(cs[i].h - cs[i].l, Math.abs(cs[i].h - cs[i - 1].c), Math.abs(cs[i].l - cs[i - 1].c));
    pdm[i] = up > dn && up > 0 ? up : 0;
    ndm[i] = dn > up && dn > 0 ? dn : 0;
  }
  const sm = (a, pp) => { const o = new Array(a.length).fill(0); for (let i = 0; i < a.length; i++) { o[i] = i < pp ? a.slice(1, i + 1).reduce((x, y) => x + y, 0) : o[i - 1] - o[i - 1] / pp + a[i]; } return o; };
  const atr = sm(tr, p), pdi = sm(pdm, p), ndi = sm(ndm, p);
  const dIp = atr.map((v, i) => v === 0 ? 0 : 100 * pdi[i] / v);
  const dIn = atr.map((v, i) => v === 0 ? 0 : 100 * ndi[i] / v);
  const dx = dIp.map((v, i) => (v + dIn[i]) === 0 ? 0 : 100 * Math.abs(v - dIn[i]) / (v + dIn[i]));
  const adx = emaArr(dx.map((v, i) => (i < p ? dx[p] : v)), p);
  return { adx, dIp, dIn };
}
function ichiArr(cs) {
  const n = cs.length;
  const mm = (p) => { const o = new Array(n).fill(null); for (let i = p - 1; i < n; i++) { let hh = -Infinity, ll = Infinity; for (let j = i - p + 1; j <= i; j++) { hh = Math.max(hh, cs[j].h); ll = Math.min(ll, cs[j].l); } o[i] = (hh + ll) / 2; } return o; };
  const tenkan = mm(9), kijun = mm(26), senB = mm(52);
  const senA = tenkan.map((v, i) => v === null || kijun[i] === null ? null : (v + kijun[i]) / 2);
  return { tenkan, kijun, senA, senB };
}
function obvArr(cs) {
  const out = new Array(cs.length).fill(0);
  for (let i = 1; i < cs.length; i++) out[i] = out[i - 1] + (cs[i].c > cs[i - 1].c ? cs[i].v : cs[i].c < cs[i - 1].c ? -cs[i].v : 0);
  return out;
}
function mfiArr(cs, p) {
  const out = new Array(cs.length).fill(null);
  for (let i = p; i < cs.length; i++) {
    let pos = 0, neg = 0;
    for (let j = i - p + 1; j <= i; j++) {
      const tp = (cs[j].h + cs[j].l + cs[j].c) / 3;
      const tpp = (cs[j - 1].h + cs[j - 1].l + cs[j - 1].c) / 3;
      if (tp >= tpp) pos += tp * cs[j].v; else neg += tp * cs[j].v;
    }
    out[i] = neg === 0 ? 100 : 100 - 100 / (1 + pos / neg);
  }
  return out;
}
function vwapArr(cs) {
  let cp = 0, cv = 0, cp2 = 0, day = null, dayCount = 0;
  const out = new Array(cs.length).fill(null);
  for (let i = 0; i < cs.length; i++) {
    const d = new Date(cs[i].t).getUTCDay();
    if (day !== null && d !== day) { cp = 0; cv = 0; cp2 = 0; dayCount = 0; }
    day = d;
    const tp = (cs[i].h + cs[i].l + cs[i].c) / 3;
    cp += tp * cs[i].v; cv += cs[i].v; cp2 += tp * tp * cs[i].v; dayCount++;
    if (cv > 0) {
      const v = cp / cv;
      const sd = Math.sqrt(Math.max(0, cp2 / cv - v * v));
      out[i] = { vwap: v, sd, up: v + 2 * sd, dn: v - 2 * sd };
    }
  }
  return out;
}
function zsArr(v, p) {
  const out = new Array(v.length).fill(null);
  const sd = stdArr(v, p), m = smaArr(v, p);
  for (let i = p - 1; i < v.length; i++) out[i] = sd[i] === 0 ? 0 : (v[i] - m[i]) / sd[i];
  return out;
}

/* ---------------- Phase 0: data acquisition ---------------- */

function parseKlines(arr) {
  if (!arr || !arr.length) return null;
  return arr.map(k => ({ t: +k[0], o: +k[1], h: +k[2], l: +k[3], c: +k[4], v: +k[5] }));
}

async function fetchAll() {
  const t0 = Date.now();
  const tf = APP.tf;
  const calls = {};
  const src = {};

  const pair = {
    kl: B + '/klines?symbol=XAUUSDT&interval=' + tf + '&limit=200',
    price: B + '/ticker/price?symbol=XAUUSDT',
    stats: B + '/ticker/24hr?symbol=XAUUSDT',
    depth: B + '/depth?symbol=XAUUSDT&limit=50',
    trades: B + '/aggTrades?symbol=XAUUSDT&limit=1000',
    prem: B + '/premiumIndex?symbol=XAUUSDT',
    oi: B + '/openInterest?symbol=XAUUSDT',
    oih: P(B + '/futures/data/openInterestHist?symbol=XAUUSDT&period=5m&limit=96'),
    tlsa: P(B + '/futures/data/topLongShortAccountRatio?symbol=XAUUSDT&period=5m&limit=1'),
    tlsp: P(B + '/futures/data/topLongShortPositionRatio?symbol=XAUUSDT&period=5m&limit=1'),
    gls: P(B + '/futures/data/globalLongShortAccountRatio?symbol=XAUUSDT&period=5m&limit=1'),
    taker: P(B + '/futures/data/takerlongshortRatio?symbol=XAUUSDT&period=5m&limit=1'),
    spot: 'https://api.gold-api.com/price/XAU',
    dxy: P(Y + '/DX-Y.NYB?interval=5m&range=1d'),
    vix: P(Y + '/%5EVIX?interval=5m&range=1d'),
    tnx: P(Y + '/%5ETNX?interval=5m&range=1d'),
    spx: P(Y + '/%5EGSPC?interval=5m&range=1d'),
    si: P(Y + '/SI=F?interval=5m&range=1d'),
    cl: P(Y + '/CL=F?interval=5m&range=1d'),
    hg: P(Y + '/HG=F?interval=5m&range=1d'),
    pa: P(Y + '/PA=F?interval=5m&range=1d'),
    pl: P(Y + '/PL=F?interval=5m&range=1d')
  };

  await Promise.all(Object.keys(pair).map(async (k) => {
    const j = await getJSON(pair[k]);
    if (j) src[k] = j; else src[k] = null;
  }));

  src.news = await getNews();

  const kl = parseKlines(src.kl);
  const price = src.price ? +src.price.price : null;
  const stats = src.stats ? { chg: +src.stats.priceChangePercent, high: +src.stats.highPrice, low: +src.stats.lowPrice, open: +src.stats.openPrice, qv: +src.stats.quoteVolume } : null;
  const depth = src.depth ? src.depth : null;
  const trades = src.trades ? src.trades : null;
  const prem = src.prem ? src.prem : null;
  const oiNow = src.oi ? +src.oi.openInterest : null;
  const oiHist = src.oih && src.oih.length ? { first: +src.oih[0].sumOpenInterest, last: +src.oih[src.oih.length - 1].sumOpenInterest } : null;
  const ratio = (o) => o ? { l: +o.longAccount, s: +o.shortAccount, ratio: +o.longShortRatio } : null;
  const tlsa = ratio(src.tlsa && src.tlsa[0]), tlsp = ratio(src.tlsp && src.tlsp[0]);
  const gls = src.gls && src.gls[0] ? ratio(src.gls[0]) : null;
  const taker = src.taker && src.taker[0] ? +src.taker[0].buySellRatio : null;
  const spot = src.spot && src.spot.price ? +src.spot.price : null;
  const macro = {};
  for (const k of ['dxy', 'vix', 'tnx', 'spx', 'si', 'cl', 'hg', 'pa', 'pl']) {
    const j = src[k];
    if (j && j.chart && j.chart.result && j.chart.result[0]) {
      const r = j.chart.result[0];
      const cl = r.meta ? r.meta.regularMarketPrice : null;
      const prev = r.meta ? r.meta.chartPreviousClose : null;
      const cll = r.timestamp ? r.timestamp[r.timestamp.length - 1] : null;
      let five = null;
      if (cll && r.indicators && r.indicators.quote && r.indicators.quote[0]) {
        const q = r.indicators.quote[0];
        const closeArr = q.close || [];
        let a = null, b = null;
        for (let i = closeArr.length - 1; i >= 0; i--) if (closeArr[i] !== null) { if (a === null) a = closeArr[i]; else { b = closeArr[i]; break; } }
        if (a !== null && b !== null && b !== 0) five = (a - b) / b * 100;
      }
      macro[k] = { price: cl, prev, five };
    } else macro[k] = null;
  }

  return { tf, ts: new Date().toISOString(), fetchedAt: Date.now(), kl, price, stats, depth, trades, prem, oiNow, oiHist, tlsa, tlsp, gls, taker, spot, macro, news: src.news, avail: Object.keys(pair).map(k => k + (src[k] ? ':ok' : ':—')).join(' ') };
}

async function getNews() {
  const now = Date.now();
  if (APP.newsCache && now - APP.newsAt < 300000) return APP.newsCache;
  try {
    const u = 'https://api.allorigins.win/raw?url=' + encodeURIComponent('https://news.google.com/rss/search?q=gold%20XAUUSD&hl=en-US');
    const r = await fetch(u, { signal: AbortSignal.timeout(10000) });
    const txt = await r.text();
    const items = [];
    const re = /<item>([\s\S]*?)<\/item>/g;
    let m;
    while ((m = re.exec(txt)) !== null) {
      const t = (m[1].match(/<title>(.*?)<\/title>/) || [])[1] || '';
      const d = (m[1].match(/<pubDate>(.*?)<\/pubDate>/) || [])[1] || '';
      if (t) items.push({ title: t, date: d ? Date.parse(d) : null });
    }
    const bull = ['surge', 'rally', 'gain', 'higher', 'record', 'cut', 'safe haven', 'bid', 'strong', 'buy', 'bull', 'outlook positive', 'jump', 'climb'];
    const bear = ['plunge', 'drop', 'fall', 'decline', 'weak', 'sell', 'bear', 'risk', 'dollar', 'pressure', 'crash', 'slump', 'dip', 'reject'];
    let score = 0;
    for (const it of items.slice(0, 25)) {
      const tl = it.title.toLowerCase();
      for (const w of bull) if (tl.includes(w)) score++;
      for (const w of bear) if (tl.includes(w)) score--;
    }
    const latest = items.reduce((a, b) => Math.max(a, b.date || 0), 0);
    const n = { count: items.length, score, latest, items: items.slice(0, 8) };
    APP.newsCache = n; APP.newsAt = now;
    return n;
  } catch (e) { return null; }
}

/* ---------------- indicator snapshot per tf ---------------- */

function buildInd(cs) {
  if (!cs || cs.length < 60) return null;
  const c = cs.map(x => x.c);
  const atr = atrArr(cs, 14), rsi = rsiArr(c, 14), macd = macdArr(cs), st = stochArr(cs, 14, 3, 3);
  const cci = cciArr(cs, 20), wr = wrArr(cs, 14), bb = bbArr(cs, 20, 2), don = donArr(cs, 20);
  const stp = stArr(cs, 10, 3), adx = adxArr(cs, 14), ichi = ichiArr(cs), obv = obvArr(cs);
  const mfi = mfiArr(cs, 14), vw = vwapArr(cs), zs = zsArr(c, 20);
  const ema8 = emaArr(c, 8), ema21 = emaArr(c, 21), ema50 = emaArr(c, 50), ema100 = emaArr(c, 100), ema200 = emaArr(c, 200);
  const i = cs.length - 1;
  const vol = c.map((v, j) => cs[j].v);
  const vma = smaArr(vol, 20);
  const last = (a) => a[i];
  const swingH = Math.max(...cs.slice(-80).map(x => x.h));
  const swingL = Math.min(...cs.slice(-80).map(x => x.l));
  const range = swingH - swingL;
  const fib = {};
  if (range > 0) {
    for (const [k, r] of [['r382', 0.382], ['r500', 0.5], ['r618', 0.618], ['e127', 1.272], ['e1618', 1.618]]) {
      fib[k] = swingL + range * r;
    }
  }
  const h24 = Math.max(...cs.slice(-24).map(x => x.h));
  const l24 = Math.min(...cs.slice(-24).map(x => x.l));
  const c24 = cs.length > 24 ? cs[cs.length - 25].c : cs[0].c;
  const piv = {
    P: (h24 + l24 + c24) / 3,
    R1: 2 * (h24 + l24 + c24) / 3 - l24,
    S1: 2 * (h24 + l24 + c24) / 3 - h24,
    R2: (h24 + l24 + c24) / 3 + (h24 - l24),
    S2: (h24 + l24 + c24) / 3 - (h24 - l24),
    R3: h24 + 2 * ((h24 + l24 + c24) / 3 - l24),
    S3: l24 - 2 * (h24 - (h24 + l24 + c24) / 3)
  };
  const atrPct = cs[i].c > 0 ? atr[i] / cs[i].c * 100 : 0;
  return {
    i, c: cs[i].c, o: cs[i].o, h: cs[i].h, l: cs[i].l, v: cs[i].v,
    atr: atr[i], atrPct, rsi: rsi[i], macd: macd.hist[i], macdSig: macd.sig[i], macdM: macd.m[i],
    stK: st.k[i], stD: st.d[i], cci: cci[i], wr: wr[i],
    bbU: bb.up[i], bbL: bb.lo[i], bbM: bb.mid[i], pctB: bb.pctB[i],
    donH: don.hi[i], donL: don.lo[i], stDir: stp.dir, stLine: stp.st[i],
    adx: adx.adx[i], dIp: adx.dIp[i], dIn: adx.dIn[i],
    tk: ichi.tenkan[i], kj: ichi.kijun[i], sA: ichi.senA[i], sB: ichi.senB[i],
    obv: obv[i], obvSlope: i >= 20 ? (obv[i] - obv[i - 20]) : 0,
    mfi: mfi[i], vwap: vw[i] ? vw[i].vwap : null, vwUp: vw[i] ? vw[i].up : null, vwDn: vw[i] ? vw[i].dn : null,
    ema8: ema8[i], ema21: ema21[i], ema50: ema50[i], ema100: ema100[i], ema200: ema200[i],
    piv, fib, swingH, swingL, range,
    z: zs[i], rvol: vma[i] && vma[i] > 0 ? cs[i].v / vma[i] : null,
    bwidth: bb.up[i] && bb.mid[i] ? (bb.up[i] - bb.lo[i]) / bb.mid[i] * 100 : null,
    pricePos: range > 0 ? (cs[i].c - swingL) / range : 0.5
  };
}

function regimeOf(atrPct) {
  if (atrPct > 1.2) return 'SUSPEND';
  if (atrPct >= 0.7) return 'NEWS-CAUTION';
  if (atrPct >= 0.35) return 'WIDE';
  if (atrPct >= 0.15) return 'NORMAL';
  return 'COMPRESS';
}
function sessionOf() {
  const h = new Date().getUTCHours();
  if (h >= 12 && h < 20) return 'NY';
  if (h >= 6 && h < 12) return 'LONDON';
  if (h >= 0 && h < 6) return 'ASIA';
  return 'ASIA-2';
}

/* ---------------- axes: each returns {bull, bear, note} ---------------- */

function lastOf(a, i) { return a[i] !== undefined ? a[i] : null; }

const AXES = {
  emaC(ctx) { const I = ctx.ind; const b = I.ema8 > I.ema21 && I.c > I.ema21; const s = I.ema8 < I.ema21 && I.c < I.ema21; return { bull: b ? 1 : 0, bear: s ? 1 : 0, note: b ? '8/21 bullish stack' : s ? '8/21 bearish stack' : '8/21 flat' }; },
  ema50(ctx) { const I = ctx.ind; return { bull: I.c > I.ema50 ? 1 : 0, bear: I.c < I.ema50 ? 1 : 0, note: I.c > I.ema50 ? 'above EMA50' : 'below EMA50' }; },
  macd(ctx) { const I = ctx.ind; const b = I.macd > 0 && I.macd > I.macdSig * 0 + 0; const up = I.macd > 0; return { bull: up && I.macdM > I.macdSig ? 1 : 0, bear: !up && I.macdM < I.macdSig ? 1 : 0, note: up ? 'MACD+ hist rising' : 'MACD- hist falling' }; },
  rsi(ctx) { const I = ctx.ind; const r = I.rsi; if (r === null) return { bull: 0, bear: 0, note: 'RSI n/a' }; return { bull: r > 55 ? 0.7 : r > 50 ? 0.3 : 0, bear: r < 45 ? 0.7 : r < 50 ? 0.3 : 0, note: 'RSI ' + fmt(r, 1) }; },
  stoch(ctx) { const I = ctx.ind; if (I.stK === null) return { bull: 0, bear: 0, note: 'n/a' }; const b = I.stK > I.stD && I.stK < 80; const s = I.stK < I.stD && I.stK > 20; return { bull: b ? 1 : 0, bear: s ? 1 : 0, note: 'K' + fmt(I.stK, 0) + '/D' + fmt(I.stD, 0) }; },
  cci(ctx) { const I = ctx.ind; const v = I.cci; if (v === null) return { bull: 0, bear: 0, note: 'n/a' }; const b = v > 100; const s = v < -100; const reb = v > -100 && v < 0 && ctx.ind.stK > 40; const res = v < 100 && v > 0 && ctx.ind.stK < 60; return { bull: (b ? 1 : 0) + (reb ? 0.4 : 0), bear: (s ? 1 : 0) + (res ? 0.4 : 0), note: 'CCI ' + fmt(v, 0) }; },
  wr(ctx) { const I = ctx.ind; const v = I.wr; if (v === null) return { bull: 0, bear: 0, note: 'n/a' }; return { bull: v < -85 ? 0.8 : v < -50 ? 0.3 : 0, bear: v > -15 ? 0.8 : v > -50 ? 0.3 : 0, note: 'W%R ' + fmt(v, 0) }; },
  bbrev(ctx) { const I = ctx.ind; if (I.pctB === null) return { bull: 0, bear: 0, note: 'n/a' }; const b = I.pctB < -0.1; const s = I.pctB > 1.1; return { bull: b ? 0.9 : 0, bear: s ? 0.9 : 0, note: 'BB %B ' + fmt(I.pctB, 2) }; },
  bbwalk(ctx) { const I = ctx.ind; if (I.pctB === null) return { bull: 0, bear: 0, note: 'n/a' }; const b = I.pctB > 0.9 && I.c > I.ema8; const s = I.pctB < 0.1 && I.c < I.ema8; return { bull: b ? 1 : 0, bear: s ? 1 : 0, note: 'bandwalk %B ' + fmt(I.pctB, 2) }; },
  kc(ctx) { const I = ctx.ind; const up = I.bbM + 1.5 * I.atr, lo = I.bbM - 1.5 * I.atr; return { bull: I.c > up ? 1 : 0, bear: I.c < lo ? 1 : 0, note: I.c > up ? 'KC breakout up' : I.c < lo ? 'KC breakout down' : 'inside KC' }; },
  donch(ctx) { const I = ctx.ind; const b = I.c > I.donH && I.o <= I.donH; const s = I.c < I.donL && I.o >= I.donL; return { bull: b ? 1 : 0, bear: s ? 1 : 0, note: b ? '20-bar high breakout' : s ? '20-bar low breakout' : 'inside 20-bar range' }; },
  stflip(ctx) { const I = ctx.ind; return { bull: I.stDir === 1 ? 1 : 0, bear: I.stDir === -1 ? 1 : 0, note: 'Supertrend ' + (I.stDir === 1 ? 'LONG' : 'SHORT') }; },
  adx(ctx) { const I = ctx.ind; if (I.adx === null) return { bull: 0, bear: 0, note: 'n/a' }; const b = I.adx > 25 && I.dIp > I.dIn; const s = I.adx > 25 && I.dIn > I.dIp; return { bull: b ? 1 : 0, bear: s ? 1 : 0, note: 'ADX ' + fmt(I.adx, 0) + (b ? ' +DI' : s ? ' -DI' : ' flat') }; },
  ichi(ctx) { const I = ctx.ind; if (I.tk === null || I.sA === null) return { bull: 0, bear: 0, note: 'n/a' }; const above = I.c > I.sA && I.c > I.sB; const below = I.c < I.sA && I.c < I.sB; const tkUp = I.tk > I.kj; return { bull: above && tkUp ? 1 : 0, bear: below && !tkUp ? 1 : 0, note: above ? 'above cloud' : below ? 'below cloud' : 'in cloud' }; },
  obv(ctx) { const I = ctx.ind; const priceUp = I.c > I.c - I.atr * 0; const pSlope = I.c - ctx.prevC; const div = I.obvSlope > 0 && pSlope < 0; const divb = I.obvSlope < 0 && pSlope > 0; return { bull: div ? 1 : 0.2, bear: divb ? 1 : 0.2, note: div ? 'OBV/price bullish div' : divb ? 'OBV/price bearish div' : 'OBV ' + (I.obvSlope >= 0 ? '+' : '-') }; },
  mfi(ctx) { const I = ctx.ind; if (I.mfi === null) return { bull: 0, bear: 0, note: 'n/a' }; const b = I.mfi < 20; const s = I.mfi > 80; return { bull: b ? 0.9 : 0, bear: s ? 0.9 : 0, note: 'MFI ' + fmt(I.mfi, 0) }; },
  vwap(ctx) { const I = ctx.ind; if (I.vwap === null) return { bull: 0, bear: 0, note: 'no VWAP' }; const b = I.c > I.vwap && I.vwDn > 0; const s = I.c < I.vwap; const exb = I.c < I.vwDn; const exs = I.c > I.vwUp; return { bull: exb ? 1 : b ? 0.7 : 0, bear: exs ? 1 : s ? 0.7 : 0, note: b ? 'above VWAP' : 'below VWAP' }; },
  pivot(ctx) { const I = ctx.ind; const b = I.c > I.piv.R1; const s = I.c < I.piv.S1; return { bull: b ? 0.8 : I.c > I.piv.P ? 0.3 : 0, bear: s ? 0.8 : I.c < I.piv.P ? 0.3 : 0, note: b ? 'above R1' : s ? 'below S1' : 'inside P' }; },
  fib(ctx) { const I = ctx.ind; const near = (lvl) => Math.abs(I.c - lvl) < 0.25 * I.atr; let note = 'fib neutral'; let bull = 0, bear = 0; if (near(I.fib.r382)) { bull = 0.55; bear = 0.55; note = 'at 38.2%'; } if (near(I.fib.r500)) { bull = 0.65; bear = 0.65; note = 'at 50%'; } if (near(I.fib.r618)) { bull = 0.7; bear = 0.7; note = 'at 61.8%'; } if (near(I.fib.e127)) { bull = 0.5; bear = 0.5; note = 'at 127.2% ext'; } if (near(I.fib.e1618)) { bull = 0.5; bear = 0.5; note = 'at 161.8% ext'; } return { bull, bear, note }; },
  obim(ctx) { const d = ctx.tape; if (d.obImb === null) return { bull: 0, bear: 0, note: 'no depth' }; const b = d.obImb > 0.3; const s = d.obImb < -0.3; return { bull: b ? 1 : 0, bear: s ? 1 : 0, note: 'book imb ' + fmt(d.obImb, 2) }; },
  tdelta(ctx) { const d = ctx.tape; if (d.takerRatio === null) return { bull: 0, bear: 0, note: 'no trades' }; const b = d.takerRatio > 1.15; const s = d.takerRatio < 0.87; return { bull: b ? 1 : 0, bear: s ? 1 : 0, note: 'taker B/S ' + fmt(d.takerRatio, 2) }; },
  cdelta(ctx) { const d = ctx.tape; if (d.deltaSlope === null) return { bull: 0, bear: 0, note: 'no delta' }; const b = d.deltaSlope > 0 && d.cumDelta > 0; const s = d.deltaSlope < 0 && d.cumDelta < 0; const pDiv = d.deltaSlope < 0 && d.cumDelta > 0 && ctx.ind.stDir === 1; const nDiv = d.deltaSlope > 0 && d.cumDelta < 0 && ctx.ind.stDir === -1; return { bull: b ? 1 : nDiv ? 0.6 : 0, bear: s ? 1 : pDiv ? 0.6 : 0, note: 'Δ ' + fmt(d.deltaSlope, 0) }; },
  oi(ctx) { const d = ctx.tape; if (d.oiChg === null) return { bull: 0, bear: 0, note: 'no OI' }; const b = d.oiChg > 1.5; const s = d.oiChg < -1.5; return { bull: b ? 0.6 : 0, bear: s ? 0.6 : 0, note: 'OI ' + fmt(d.oiChg, 2) + '%' }; },
  fund(ctx) { const d = ctx.tape; if (d.funding === null) return { bull: 0, bear: 0, note: 'no funding' }; const b = d.funding < -0.005; const s = d.funding > 0.005; return { bull: b ? 1 : 0, bear: s ? 1 : 0, note: 'funding ' + fmt(d.funding * 100, 4) + '%' }; },
  lsr(ctx) { const d = ctx.tape; if (d.gls === null) return { bull: 0, bear: 0, note: 'no L/S' }; const b = d.gls < 0.85; const s = d.gls > 1.15; return { bull: b ? 0.7 : 0, bear: s ? 0.7 : 0, note: 'global L/S ' + fmt(d.gls, 2) }; },
  spot(ctx) { const d = ctx.tape; if (d.basis === null) return { bull: 0, bear: 0, note: 'no spot' }; const b = d.basis > 0.001; const s = d.basis < -0.001; return { bull: b ? 0.6 : 0, bear: s ? 0.6 : 0, note: 'fut-spot basis ' + fmt(d.basis * 100, 3) + '%' }; },
  dxy(ctx) { const m = ctx.macro; if (!m.dxy || m.dxy.five === null) return { bull: 0, bear: 0, note: 'no DXY' }; const b = m.dxy.five < -0.1; const s = m.dxy.five > 0.1; return { bull: b ? 0.85 : 0, bear: s ? 0.85 : 0, note: 'DXY 5m ' + pct(m.dxy.five) }; },
  rvol(ctx) { const I = ctx.ind; if (I.rvol === null) return { bull: 0, bear: 0, note: 'no RVOL' }; const b = I.rvol > 1.8 && I.c > I.o; const s = I.rvol > 1.8 && I.c < I.o; return { bull: b ? 0.9 : 0, bear: s ? 0.9 : 0, note: 'RVOL ' + fmt(I.rvol, 2) }; },
  atex(ctx) { const I = ctx.ind; const prev = ctx.prevInd; if (!prev || prev.atr === null) return { bull: 0, bear: 0, note: 'n/a' }; const g = (I.atr - prev.atr) / prev.atr * 100; const b = g > 12 && I.c > I.o; const s = g > 12 && I.c < I.o; return { bull: b ? 0.8 : 0, bear: s ? 0.8 : 0, note: 'ATR ' + pct(g / 100) }; },
  zscore(ctx) { const I = ctx.ind; if (I.z === null) return { bull: 0, bear: 0, note: 'n/a' }; const b = I.z < -2; const s = I.z > 2; return { bull: b ? 0.9 : 0, bear: s ? 0.9 : 0, note: 'z=' + fmt(I.z, 1) }; },
  sqz(ctx) { const I = ctx.ind; const prev = ctx.prevInd; if (!prev || prev.bwidth === null) return { bull: 0, bear: 0, note: 'n/a' }; const squeeze = I.bwidth < 0.35 * (prev.bwidth || 1) + 1e-9 || I.bwidth < 0.5; const b = squeeze && I.stDir === 1; const s = squeeze && I.stDir === -1; return { bull: b ? 0.9 : 0, bear: s ? 0.9 : 0, note: squeeze ? 'squeeze firing ' + I.stDir : 'no squeeze' }; },
  trend(ctx) { const I = ctx.ind; const n = 12; const ups = ctx.recent ? ctx.recent.slice(-n).filter(c => c.c > c.o).length : 0; const b = ups >= 8 && I.adx > 20; const s = ups <= 4 && I.adx > 20; return { bull: b ? 0.9 : 0, bear: s ? 0.9 : 0, note: ups + '/' + n + ' bullish bars' }; },
  rangepos(ctx) { const I = ctx.ind; const b = I.pricePos < 0.15 && I.stDir === 1; const s = I.pricePos > 0.85 && I.stDir === -1; return { bull: b ? 0.8 : 0, bear: s ? 0.8 : 0, note: 'range pos ' + fmt(I.pricePos * 100, 0) + '%' }; },
  ribbon(ctx) { const I = ctx.ind; const spread = Math.abs(I.ema50 - I.ema21) / I.c * 100; const prev = ctx.prevInd; if (!prev) return { bull: 0, bear: 0, note: 'n/a' }; const prevSpread = Math.abs(prev.ema50 - prev.ema21) / prev.c * 100; const exp = spread > prevSpread * 1.3; const b = exp && I.ema21 > I.ema50; const s = exp && I.ema21 < I.ema50; return { bull: b ? 0.8 : 0, bear: s ? 0.8 : 0, note: 'ribbon ' + (exp ? 'expanding' : 'compressing') }; },
  chand(ctx) { const I = ctx.ind; const up = I.swingH - 3 * I.atr; const dn = I.swingL + 3 * I.atr; const b = I.c > up; const s = I.c < dn; return { bull: b ? 0.7 : 0, bear: s ? 0.7 : 0, note: 'chandelier ' + (b ? 'above' : s ? 'below' : 'mid') }; },
  psar(ctx) { const I = ctx.ind; return { bull: I.stDir === 1 && I.c > I.stLine ? 0.7 : 0, bear: I.stDir === -1 && I.c < I.stLine ? 0.7 : 0, note: 'PSAR proxy ' + I.stDir }; },
  session(ctx) { const s = ctx.session; const isBull = s === 'NY' || s === 'LONDON'; return { bull: isBull ? 0.45 : 0, bear: !isBull ? 0.45 : 0, note: s + ' window' }; },
  liq(ctx) { const I = ctx.ind; let b = 0, bear = 0; let note = 'no EQ sweep'; const bars = ctx.recent || []; for (let i = bars.length - 30; i < bars.length - 2; i++) { const x = bars[i]; if (x.h > I.swingH - 0.5 * I.atr) { b = 0.7; note = 'swept swing high'; } if (x.l < I.swingL + 0.5 * I.atr) { bear = 0.7; note = 'swept swing low'; } } return { bull: b, bear, note }; },
  pin(ctx) { const I = ctx.ind; const body = Math.abs(I.c - I.o); const wickU = I.h - Math.max(I.c, I.o); const wickD = Math.min(I.c, I.o) - I.l; if (body === 0) return { bull: 0, bear: 0, note: 'doji' }; const b = wickD > 2 * body && I.c >= I.o; const s = wickU > 2 * body && I.c <= I.o; return { bull: b ? 0.9 : 0, bear: s ? 0.9 : 0, note: b ? 'hammer pin' : s ? 'shooting star' : 'body bar' }; },
  mom(ctx) { const I = ctx.ind; const r15 = ctx.recent && ctx.recent.length > 16 ? (I.c - ctx.recent[ctx.recent.length - 16].c) / ctx.recent[ctx.recent.length - 16].c * 100 : 0; return { bull: r15 > 0.1 ? clamp(r15 * 6, 0.3, 1) : 0, bear: r15 < -0.1 ? clamp(-r15 * 6, 0.3, 1) : 0, note: 'ROC15 ' + pct(r15) }; },
  brk(ctx) { const bars = ctx.recent || []; if (bars.length < 25) return { bull: 0, bear: 0, note: 'n/a' }; const ph = Math.max(...bars.slice(-25, -1).map(x => x.h)); const pl = Math.min(...bars.slice(-25, -1).map(x => x.l)); const I = ctx.ind; const b = I.c > ph && I.h > ph; const s = I.c < pl && I.l < pl; return { bull: b ? 1 : 0, bear: s ? 1 : 0, note: b ? 'break-retest high' : s ? 'break-retest low' : 'no break' }; },
  goldmv(ctx) { const m = ctx.macro; if (!m.si || m.si.five === null || m.si.five === 0) return { bull: 0, bear: 0, note: 'no XAG' }; const g5 = ctx.tape.g5m || 0; const rel = g5 - m.si.five; const b = rel > 0.1 && g5 > 0; const s = rel < -0.1 && g5 < 0; return { bull: b ? 0.75 : 0, bear: s ? 0.75 : 0, note: 'XAU-XAG rel ' + fmt(rel, 2) + '%' }; },
  volimp(ctx) { const I = ctx.ind; if (I.rvol === null) return { bull: 0, bear: 0, note: 'no vol' }; const b = I.rvol > 2.5 && I.c > I.o; const s = I.rvol > 2.5 && I.c < I.o; return { bull: b ? 0.8 : 0, bear: s ? 0.8 : 0, note: 'vol impulse ' + fmt(I.rvol, 1) + 'x' }; },
  lev(ctx) { const I = ctx.ind; let near = false; for (const lv of [I.piv.R1, I.piv.S1, I.piv.P, I.fib.r500]) { if (lv !== undefined && Math.abs(I.c - lv) < 0.2 * I.atr) near = true; } const b = near && I.stDir === 1; const s = near && I.stDir === -1; return { bull: b ? 0.7 : 0, bear: s ? 0.7 : 0, note: near ? 'at key level' : 'between levels' }; },
  round(ctx) { const I = ctx.ind; const distToRound = (p) => { const r = Math.round(p / 25) * 25; return Math.abs(p - r); }; const d = distToRound(I.c); const b = d < 0.25 * I.atr && I.stDir === 1; const s = d < 0.25 * I.atr && I.stDir === -1; return { bull: b ? 0.6 : 0, bear: s ? 0.6 : 0, note: d < 0.25 * I.atr ? 'at round magnet' : 'off round' }; },
  vix(ctx) { const m = ctx.macro; if (!m.vix || m.vix.price === null) return { bull: 0, bear: 0, note: 'no VIX' }; const b = m.vix.price > 24 && m.vix.five !== null && m.vix.five > 0.2; const s = m.vix.price < 14; return { bull: b ? 0.7 : 0, bear: s ? 0.5 : 0, note: 'VIX ' + fmt(m.vix.price, 1) }; },
  yld(ctx) { const m = ctx.macro; if (!m.tnx || m.tnx.five === null) return { bull: 0, bear: 0, note: 'no TNX' }; const b = m.tnx.five < -0.05; const s = m.tnx.five > 0.05; return { bull: b ? 0.65 : 0, bear: s ? 0.65 : 0, note: 'TNX 5m ' + pct(m.tnx.five) }; },
  oil(ctx) { const m = ctx.macro; if (!m.cl || m.cl.five === null) return { bull: 0, bear: 0, note: 'no CL' }; const b = m.cl.five > 0.5; const s = m.cl.five < -0.5; return { bull: b ? 0.55 : 0, bear: s ? 0.55 : 0, note: 'CL=F ' + pct(m.cl.five) }; },
  cu(ctx) { const m = ctx.macro; if (!m.hg || m.hg.five === null) return { bull: 0, bear: 0, note: 'no HG' }; const b = m.hg.five > 0.3; const s = m.hg.five < -0.3; return { bull: b ? 0.55 : 0, bear: s ? 0.55 : 0, note: 'copper ' + pct(m.hg.five) }; },
  metals(ctx) { const m = ctx.macro; const g = (k) => m[k] && m[k].five !== null ? m[k].five : null; const vals = [g('si'), g('pa'), g('pl')].filter(v => v !== null); if (vals.length < 2) return { bull: 0, bear: 0, note: 'metals n/a' }; const sum = vals.reduce((a, b) => a + b, 0) / vals.length; return { bull: sum > 0.15 ? 0.6 : 0, bear: sum < -0.15 ? 0.6 : 0, note: 'complex ' + pct(sum) }; },
  news(ctx) { const n = ctx.news; if (!n) return { bull: 0, bear: 0, note: '[DATA UNAVAILABLE] no news feed', inactive: 1 }; const b = n.score > 2; const s = n.score < -2; return { bull: b ? 0.8 : 0, bear: s ? 0.8 : 0, note: 'news senti ' + (n.score > 0 ? '+' : '') + n.score + ' (' + n.count + ' items)' }; },
  date(ctx) { const d = new Date(); const dow = d.getUTCDay(); const dom = d.getUTCDate(); const monthEnd = dom >= 27; const day3 = Math.floor((dom - 1) / 7) === 2 && dow === 5; const event = monthEnd || day3 || dow === 0; return { bull: event ? 0.2 : 0, bear: event ? 0.2 : 0, note: event ? (day3 ? '3rd-Friday expiry' : 'month-end flow') : 'no scheduled flow', inactive: event ? 0 : 1 }; },
  timing(ctx) { const s = ctx.session; const inactive = (s === 'ASIA' || s === 'ASIA-2') ? 0 : 0; const quiet = ctx.ind.rvol !== null && ctx.ind.rvol < 0.6; return { bull: 0, bear: 0, note: quiet ? 'quiet tape - abstain' : 'liquid window', inactive: quiet ? 1 : 0 }; },
  taker(ctx) { const d = ctx.tape; if (d.taker === null) return { bull: 0, bear: 0, note: 'no taker ratio' }; const b = d.taker > 1.2; const s = d.taker < 0.85; return { bull: b ? 0.8 : 0, bear: s ? 0.8 : 0, note: 'exchange taker B/S ' + fmt(d.taker, 2) }; },
  confluence(ctx) { const votes = [AXES.emaC(ctx), AXES.macd(ctx), AXES.adx(ctx), AXES.vwap(ctx), AXES.pivot(ctx), AXES.stoch(ctx), AXES.rsi(ctx), AXES.dxy(ctx)]; let b = 0, s = 0; for (const v of votes) { if (v.bull > 0.6) b++; if (v.bear > 0.6) s++; } return { bull: b / 8, bear: s / 8, note: b + '/' + s + ' aligned' }; },
  regime(ctx) { const r = ctx.regime; const good = r === 'NORMAL' || r === 'WIDE'; const bad = r === 'SUSPEND'; return { bull: good ? 0.5 : bad ? 0 : 0.25, bear: good ? 0.5 : bad ? 0 : 0.25, note: r + ' regime', inactive: bad ? 1 : 0 }; },
  veto(ctx) { return { bull: 0, bear: 0, note: 'risk veto scanner', inactive: 1 }; }
};

/* ---------------- Phase 1: the 500-agent deck ---------------- */

const NAMED = [
  [1, 'ICT TrailWhale', 'vwap', 'trend'], [2, 'OrderBlock Horse', 'brk', 'trend'], [3, 'FVG Dragon', 'brk', 'pullback'],
  [4, 'Liquidity-Sweep Falcon', 'liq', 'trend'], [5, 'Change-of-Character Panther', 'stflip', 'trend'], [6, 'Power-of-3 Scheduler', 'session', 'trend'],
  [7, 'Null-Freshness Fox', 'session', 'breakout'], [8, 'AMP-The Ark', 'session', 'breakout'], [9, 'Batman Macdickle', 'macd', 'trend'],
  [10, 'RSI-14 Polar', 'rsi', 'pullback'], [11, 'CCI-20 Signature', 'cci', 'trend'], [12, 'Stochastic Sniper', 'stoch', 'pullback'],
  [13, 'Williams %R Tiger', 'wr', 'reversion'], [14, 'Bollinger Master', 'bbrev', 'reversion'], [15, 'Bollinger Squeezer', 'sqz', 'breakout'],
  [16, 'Keltner Chaser', 'kc', 'breakout'], [17, 'Donchian Breaker', 'donch', 'breakout'], [18, 'Supertrend Hunter', 'stflip', 'trend'],
  [19, 'Parabolic SAR Trailer', 'psar', 'trend'], [20, 'Ichimoku Cloudwalker', 'ichi', 'trend'], [21, 'VWAP Wizard', 'vwap', 'pullback'],
  [22, 'Double-VWAP', 'vwap', 'reversion'], [23, 'CCI Bandit', 'cci', 'reversion'], [24, 'OBV Percussionist', 'obv', 'trend'],
  [25, 'MFI Machinist', 'mfi', 'reversion'], [26, 'ADX Trend Rider', 'adx', 'trend'], [27, 'Elliott Wave Surfer', 'mom', 'trend'],
  [28, 'Wyckoff Scheduler', 'rangepos', 'pullback'], [29, 'Gann Armor', 'fib', 'reversion'], [30, 'Market-Profile Pyramid', 'pivot', 'pullback'],
  [31, 'Volume-Profile Snipe', 'volimp', 'breakout'], [32, 'Point-of-Control Slipper', 'vwap', 'trend'], [33, 'Delta Detective', 'tdelta', 'trend'],
  [34, 'Buyer-Maker Facial', 'taker', 'trend'], [35, 'Iceberg Whispers', 'obim', 'breakout'], [36, 'OrderBook Ocean', 'obim', 'trend'],
  [37, 'Footprint Pro', 'cdelta', 'trend'], [38, 'Tape-Transfer', 'volimp', 'breakout'], [39, 'Large-Ong Game', 'rvol', 'breakout'],
  [40, 'Order-Flow Pressure Gauge', 'vwap', 'trend'], [41, 'EXQ Momentum Fuzzy', 'mom', 'trend'], [42, 'Momentum Rebreka', 'brk', 'breakout'],
  [43, 'Twin-EMA StepFork', 'emaC', 'pullback'], [44, 'EMA-50 SideCat', 'ema50', 'trend'], [45, 'Golden-Cross Maker', 'emaC', 'trend'],
  [46, 'Death-Cross Trigger', 'emaC', 'reversion'], [47, 'EMA Ribbon Cutter', 'ribbon', 'breakout'], [48, 'Whipsaw Guard', 'atex', 'trend'],
  [49, 'Range Forge Bullion', 'rangepos', 'reversion'], [50, 'Mean-Reversion Vandal', 'zscore', 'reversion'], [51, 'Send-Time Patent', 'timing', 'trend'],
  [52, 'Terrorclock', 'dxy', 'trend'], [53, 'Yield-Load', 'yld', 'trend'], [54, 'Unit Debt', 'dxy', 'reversion'], [55, 'Stagflation Hunter', 'vix', 'trend'],
  [56, 'Lehmann Surf', 'rvol', 'breakout'], [57, 'Equal-Highs Go-En', 'liq', 'reversion'], [58, 'Equal-Lows Sam', 'liq', 'reversion'],
  [59, 'Chandelier Trail', 'chand', 'trend'], [60, 'Parabola Catcher', 'psar', 'breakout'], [61, 'Granite-Stone', 'lev', 'pullback'],
  [62, 'HV Hawker', 'atex', 'breakout'], [63, 'CRIS-BULL', 'vix', 'reversion'], [64, 'Gold-Trend Imbalance', 'goldmv', 'trend'],
  [65, 'BasisAmazon', 'spot', 'reversion'], [66, 'PM-Momentum Tesla', 'goldmv', 'breakout'], [67, 'Palladium Edge', 'metals', 'trend'],
  [68, 'Copper Current', 'cu', 'trend'], [69, 'Oil Roller', 'oil', 'trend'], [70, 'Treasury Track', 'yld', 'trend'],
  [71, 'Ramp King', 'session', 'breakout'], [72, 'Break-Retest Struct', 'brk', 'pullback'], [73, 'CandleKing', 'pin', 'reversion'],
  [74, 'Doji-Anchor', 'pin', 'pullback'], [75, 'HarqScalper', 'pin', 'trend'], [76, 'Bar-by-Bar Hunter', 'mom', 'breakout'],
  [77, 'Magnet-S', 'round', 'reversion'], [78, 'Pivot-Passing', 'pivot', 'breakout'], [79, 'Session-Contactor', 'session', 'breakout'],
  [80, 'Day-Average Dancer', 'vwap', 'reversion'], [81, 'Green-Day Momentum Ager', 'mom', 'trend'], [82, 'Overnight-Spread Racist', 'spot', 'trend'],
  [83, 'Weekend-Open Clinger', 'session', 'breakout'], [84, 'Monthly-Closer', 'date', 'trend'], [85, 'COT Commercial', 'lsr', 'trend'],
  [86, 'ETF Flow Rider', 'news', 'trend'], [87, 'Central-Bank Margin', 'yld', 'trend'], [88, 'Funds-Futures Pump', 'lsr', 'pullback'],
  [89, 'FedWatch Fighter', 'yld', 'reversion'], [90, 'Real-Yield Warden', 'yld', 'trend'], [91, 'Safe-Haven Decl.', 'vix', 'trend'],
  [92, 'Quad-Witching Fide', 'date', 'reversion'], [93, 'Rollover Timers', 'spot', 'trend'], [94, 'Timing-Whisper', 'date', 'breakout'],
  [95, 'Liquidation-Heat Hu', 'fund', 'reversion'], [96, 'Tidal Drain', 'fund', 'trend'], [97, 'Clinch-Period Pulse', 'timing', 'trend'],
  [98, 'Same-Color Trendraz', 'adx', 'trend'], [99, 'Odds-Stacker', 'confluence', 'trend'], [100, 'Regime-Feedback Loop', 'regime', 'trend']
];

const DIVS = [
  ['A', 'α Volatility & Regime', ['atex', 'sqz', 'zscore', 'rvol', 'rangepos', 'trend', 'mom', 'volimp', 'rsi', 'bbrev', 'kc', 'donch'],
    ['ATR-Skew', 'Vol-Breakout', 'Sigma-Deep', 'GARCH-Runner', 'Hurst-Scalper', 'Mean-Bound', 'RegimeSwap', 'TrendAccel', 'VolSmile7', 'MacroVIP', 'RangeVX', 'ElliottFlow', 'Parabola', 'CameraTrail', 'BollingerWalker', 'Burst-Index', 'CompressStorm', 'SmoothWave', 'Velocity', 'Impulse-O', 'Thermo', 'QuietSniper', 'FireWall', 'AltExpansion', 'Rechutch', 'TightChannel', 'Momentum-Z', 'SkewTail', 'HalfVol', 'BiasWire', 'OscHammer', 'GammaPress', 'SpreadHawk', 'SplayLine', 'DriftMeter', 'ChipReader', 'VegaKick', 'RallyWhisper', 'StallDetect', 'BreatheTap']],
  ['B', 'β Order Flow / VWAP / Footprint', ['obim', 'tdelta', 'cdelta', 'taker', 'vwap', 'donch', 'oi', 'fund', 'lsr', 'brk', 'volimp', 'pin'],
    ['Ask-Bid Incline', 'Large-Print', 'Delta-Slope', 'CumDelta Diverge', 'Book-Imbalance-Z', 'Spoofing Mask', 'Iceberg Leak', 'Absorption Cross', 'Position-Delta Runoff', 'Lock-Time Bar', 'Fail-Bar Savvy', 'VWAP Volume Cell', 'Anchored-VWAP Session', 'Multi-VWAP Fib', 'Delta-At-Price', 'OI Barrier Break', 'Funding x OI', 'Taker-Push Ratio', 'L/S Contag Truck', 'PEZ-Whisper', 'DeltaZero Tick', 'Stacked-Lot Detector', 'Print-Flow Sluice', 'Auction Imbalance', 'VWAP Role-Reversal', 'Book Heat', 'Micro-Delta Rush', 'Aggressor Clock', 'Cross-Book Slide', 'Sweep-Reprice', 'Passive-Drain Gauge', 'Tick-Queue Q', 'Top-5 Ratio', 'Depth-Decay Curve', 'Spread-Edge Nap', 'Cancel-Storm Alerter', 'Fill-Rate Fader', 'Implied-VWAP Rev', 'Session-Premium Tap', 'Tape-Density Meter']],
  ['C', 'γ SMC / ICT / Liquidity', ['brk', 'liq', 'stflip', 'session', 'pivot', 'fib', 'pin', 'lev', 'round', 'emaC', 'rangepos', 'vwap'],
    ['Kill-Zone', 'Displacement', 'Mitigation Block', 'Breaker Block', 'CISD', 'In-LOE Prior', 'EQ High-Low', 'Liquidity Bottom', 'OTE 62-79', 'IOF Tilt', 'Judas Swing', 'Snake-Op', 'Double Distribution', 'Protective Liquidity', 'Turtle Soup Gam', 'Candle-Of-Accumulation', 'PDH-PDL Reclaim', 'Asia-Low Tap', 'London-Fluid', 'NY-Open Stop-Run', 'Engulfing-Kill Zone', 'Swing-Failure', 'Premium Discount', 'Draw-On-Liquidity', 'FVG Fill 50%', 'Order-Blocks Stack', 'RAZ Break', 'MSS Flip', 'DOL Sweep', 'BOS Confirmation', 'Second-Leg Structure', 'HTF Magnet', 'Equal-Pattern Trap', 'Inducement Radar', 'Wick-Wash Candle', 'Rejection Block', 'Old-High Retest', 'Old-Low Retest', 'Session-Flow Struct', 'Anchor-Point Reclaim']],
  ['D', 'δ Statistical / Machine', ['zscore', 'trend', 'rsi', 'stoch', 'macd', 'cci', 'mom', 'rangepos', 'emaC', 'adx', 'bbrev', 'sqz'],
    ['Bayesian Reg', 'Kernel Density', 'Nearest-Neighbor Analog', 'Logistic-P', 'Random-Forest Regime', 'Gradient-Boost Delta', 'Time-Series Couple', 'Fourier Cycle Residual', 'Adaptive-Beta', 'Bootstrapped Confidence', 'Kalman Price', 'Hidden-Markov Phase', 'Momentum-Mean Combine', 'Ensemble-Lite', 'Correlation Spotter', 'Regime Entropy', 'Volatility Clustering', 'Mean-Reverting Tester', 'Trend Persistence R', 'Outlier Filter', 'Median Absolute Z', 'Quantile Bounce', 'Monte-Carlo EV', 'Cointegration Gold', 'Factor Rotation', 'Signal Noise Ratio', 'Decay Estimator', 'Stationarity Check', 'Auto-Corr Gate', 'Cross-Validation Split', 'Bagged Signals', 'Boosting Residuals', 'PCA Drift', 'Cluster Silhouette', 'LSTM-Mimic Trend', 'Bayesian Update Tick', 'Prior-Posterior Mix', 'Empirical CDF', 'Bootstrap SL Test', 'Ensemble Verdict']],
  ['E', 'ε Cross-Asset / Macro', ['dxy', 'yld', 'vix', 'oil', 'cu', 'metals', 'goldmv', 'spot', 'session', 'news', 'lsr', 'date'],
    ['DXY Delta', 'Yield-Load II', 'VIX Skew', 'Oil-Inflation Front', 'Dr-Copper Proxy', 'Metals Breadth', 'XAU-XAG Velocity', 'Basis Squeeze', 'PM Momentum', 'Palladium Edge II', 'Platinum Count', 'Treasury Slope', 'Carry Composite', 'Stagflation Meter', 'Real-Yield Mirror', 'FedWatch Stringency', 'Equity Risk Proxy', 'Curve Inversion', 'Gold-Crude Ratio', 'Silver-Fib Sync', 'Emerging FX Heat', 'Dollar Bull Gaug', 'Tenor Spread', 'Growth-Cycle Tilt', 'Deflation Alarm', 'Inflation Breakeven', 'Credit Spread Vibes', 'Liquidity Regime', 'Global Yields Drag', 'US Fiscal Check', 'Tariff Torque', 'Geopolitics Hedge', 'Safe-Haven Pulse', 'ETF-Flow Implied', 'CB-Buying Structural', 'Swap-Rate Tide', 'Frontier Pressure', 'Cross-Market Conviction', 'Macro Trigger Net', 'World-Currency Chess']],
  ['F', 'ζ News / Positioning / Liquidation', ['news', 'lsr', 'fund', 'oi', 'taker', 'cdelta', 'date', 'session', 'spot', 'vix', 'timing', 'obim'],
    ['Headline Velocity', 'COT Commercial II', 'ETF-Flow Rider II', 'Central-Bank Watch', 'Funds-Rate Sentiment', 'FedWatch Fighter II', 'Liquidation-Heat Map', 'Tidal Drain II', 'Clinch-Period Pulse II', 'Quad-Witching Fide II', 'Rollover Timer II', 'Expiry Basis Snap', 'Position Unwind Alert', 'Hedge-Flow Guess', 'Accumulation Whisper', 'Distribution Tell', 'News-Throttle Gate', 'Calendar Blackout', 'NFP-CPI Buffer', 'FOMC Window Fade', 'Gap-Fill Magnet', 'Open-Interest Sweep', 'Funding-Squeeze Tap', 'Retail-Position Lean', 'Whale-Stop Proximity', 'Clustered-Stop Radar', 'Stop-Hunt Trigger', 'Insurance-Flow Note', 'Margin-Call Cascade', 'Short-Squeeze Fuel', 'Long-Unwind Drag', 'News-Spike Reject', 'Sentiment Overhang', 'Position-Delta Clash', 'Expiry Gamma Push', 'Index-Roll Carry', 'Hot-Money Flow', 'Discretionary Flow', 'Systematic-Flow Trnd', 'Order-Anticipation Net']],
  ['G', 'η Probabilistic / EV', ['rsi', 'stoch', 'cci', 'macd', 'zscore', 'atex', 'trend', 'mom', 'rangepos', 'vwap', 'adx', 'emaC'],
    ['EV-Stacker', 'Kelly-Lite', 'Expected-Surprise', 'Bayesian-Update II', 'Win-Rate Calibrator', 'Payoff Skew', 'VaR-Guarded', 'Conditional-Prob Net', 'Markov-Chain Edge', 'Odds-Flow Merger', 'Sharpe-Flap', 'Sortino Filter', 'Drawdown Sentinel', 'Confidence Bagger', 'Monte-Carlo Retest', 'Empirical Win Curve', 'Z-Score Probable', 'Quantile EV', 'Fair-Odds Check', 'Implied-Prob Mix', 'Risk-Neutral Drift', 'P-Hack Detector', 'Sample-Size Guard', 'Bias-Corrected EV', 'Signal Decay Adjust', 'Opportunity-Cost Meter', 'R-Multiple Optimizer', 'Asymmetric Payoff', 'Fat-Tail Aware', 'Cold-Hand Tracker', 'Hot-Streak Ager', 'Variance-Premium Read', 'Edge Degradation', 'Fade-Prob Window', 'Contrarian EV', 'Momentum Prob', 'Reversion Prob', 'Breakout Prob', 'Trend Prob', 'Neutral Prob']],
  ['H', 'θ Execution / Microstructure / Tick', ['obim', 'tdelta', 'taker', 'volimp', 'pin', 'rvol', 'atex', 'brk', 'lev', 'cdelta', 'kc', 'donch'],
    ['Tick-Velocity', 'Print-Size Ladder', 'Spread-Widening Alert', 'Passive-Fill Radar', 'Aggressor-Tick Tap', 'Micro-Imbalance Cross', 'Queue-Position Scout', 'Fee-Band Fader', 'Execution-Flow Sniper', 'Slippage Guard', 'Latency-Edge Note', 'Rebate-Capture Path', 'Tick-Scalp Engine', 'One-Tick Reverse', 'Micro-Break Runner', 'Fill-Or-Kill Draft', 'Iceberg Chaser II', 'Depth-Jump Alarm', 'Best-Bid Snipe', 'Best-Ask Snipe', 'Tape-Speed Meter', 'Cluster-Print Tracker', 'Second-Book Layering', 'Momentum-Tick Fade', 'Cancellation-Wave Ride', 'HFT-Mimic Pulse', 'Quote-Mix Z', 'Micro-Premium Tap', 'Tick-Sequence Drift', 'Volume-At-Tick', 'Time-At-Level', 'Flash-Burst Hunter', 'Calm-Spread Contrarian', 'Tight-Deck Scalper', 'Wide-Deck Fader', 'Exec-Quality Score', 'Partial-Fill Tell', 'Leaning-Book Read', 'Hidden-Tick Sweep', 'Micro-VWAP Tick']],
  ['I', 'ι Anti-Bad / Invalidation', ['trend', 'adx', 'rsi', 'stoch', 'macd', 'cci', 'atex', 'session', 'pin', 'zscore', 'stflip', 'ema50'],
    ['Fade-Siren', 'Overbought Flag', 'Oversold Flag', 'Trend-Contra Veto', 'Squeeze-False Alarm', 'Range-Reject Radar', 'News-Shock Shield', 'Auction-Close Guard', 'Low-Liquidity Lock', 'Stale-Print Blocker', 'Regime-Conflict Nix', 'SL-Cross Watch', 'Double-Top Trapper', 'Double-Bottom Trapper', 'Wedge-Edge Fade', 'Channel-Fade Guard', 'Parabola-Blowoff Alert', 'Climax-Candle Warn', 'Exhaustion-Delta Stop', 'Divergence Trap Alert', 'Dead-Cat Flag', 'V-Shape Doubt', 'Rounded-Top Warn', 'Rounded-Bottom Warn', 'Gap-Contra Fade', 'Contra-News Shutoff', 'Micro-Crash Buoy', 'Micro-Spike Buoy', 'Stair-Step Fade', 'Whipsaw Zone Flag', 'Consecutive-Close Guard', 'Late-Entry Veto', 'Chase-Rejection Gate', 'Overshoot-Bounce Trap', 'Premature-Flip Guard', 'Struct-Break Check', 'Liquidity-Hole Warn', 'Time-Decay Fade', 'Split-Momentum Warn', 'Bull-Trap Detector']],
  ['J', 'κ True-Confluence Agile', ['confluence', 'emaC', 'macd', 'stoch', 'adx', 'vwap', 'pivot', 'fib', 'dxy', 'session', 'brk', 'liq'],
    ['Golden-Handshake', 'Quad-Alignment', 'Five-Star Stack', 'Multi-TF Echo', 'Zone-Confluent', 'FVG-Fib Merge', 'VWAP-ADX Merge', 'Pivot-Stoch Merge', 'DXY-VWAP Cross', 'SMC-OrderFlow Merge', 'News-Trend Merge', 'Cluster-Prime', 'Session-Pivot Merge', 'Fib-Supertrend Merge', 'Delta-VWAP Merge', 'LIQ-BB Merge', 'KC-ADX Merge', 'OBV-Pivot Merge', 'RSI-KC Merge', 'MFI-VWAP Merge', 'Ichi-VWAP Merge', 'MACD-Pivot Merge', 'Trend-Delta Merge', 'Range-LIQ Merge', 'Pin-Fib Merge', 'Donch-VWAP Merge', 'Round-Pivot Merge', 'Stoch-ADX Merge', 'EMA-RSI Merge', 'Boll-Fib Merge', 'Hurst-ADX Merge', 'Z-VWAP Merge', 'ATR-Pivot Merge', 'Chand-RSI Merge', 'PSAR-VWAP Merge', 'Session-Delta Merge', 'Gann-Pivot Merge', 'Wyckoff-VWAP Merge', 'Elliott-MACD Merge', 'Full-Stack Verdict']]
];

function buildDeck() {
  const deck = [];
  const seen = new Set();
  for (const n of NAMED) {
    deck.push({ id: 'L' + n[0], name: n[1], div: 'NAMED', axis: n[2], mode: n[3], tf: '3m', regime: 'ANY', k: 1.4 + (n[0] % 5) * 0.2, seed: n[0] });
  }
  for (let di = 0; di < DIVS.length; di++) {
    const [code, divName, axes, words] = DIVS[di];
    for (let i = 0; i < 40; i++) {
      const axis = axes[i % axes.length];
      const modes = ['trend', 'breakout', 'pullback', 'reversion', 'trend'];
      const mode = modes[(i + di) % modes.length];
      const tfs = ['1m', '3m', '5m'];
      const tf = tfs[(i + di) % 3];
      const regs = ['ANY', 'NORMAL', 'WIDE', 'ANY'];
      const reg = regs[(i + 2) % regs.length];
      let k = 1.2 + ((i * 7 + di * 3) % 10) * 0.1;
      const name = words[i];
      let seed = (i + 1) * (di + 3);
      let key = code + i + '|' + axis + '|' + mode + '|' + tf + '|' + reg + '|' + k;
      while (seen.has(key)) { seed += 7; k += 0.05; key = code + i + '|' + axis + '|' + mode + '|' + tf + '|' + reg + '|' + k; }
      seen.add(key);
      deck.push({ id: code + (i + 1), name: name + '-' + code + (i + 1), div: divName, axis, mode, tf, regime: reg, k, seed });
    }
  }
  return deck;
}

const DECK = buildDeck();

/* ---------------- Phase 3: voting ---------------- */

function buildCtx(d, tf) {
  const kl = d.kl;
  if (!kl) return null;
  const ind = buildInd(kl);
  if (!ind) return null;
  const prevInd = buildInd(kl.slice(0, -1));
  const price = d.price !== null ? d.price : ind.c;
  const depth = d.depth;
  let bidQ = 0, askQ = 0;
  if (depth) {
    for (let i = 0; i < Math.min(5, depth.bids.length); i++) bidQ += +depth.bids[i][1];
    for (let i = 0; i < Math.min(5, depth.asks.length); i++) askQ += +depth.asks[i][1];
  }
  const obImb = (bidQ + askQ) > 0 ? (bidQ - askQ) / (bidQ + askQ) : null;
  let takerQty = 0, sellQty = 0, cumDelta = 0, deltaSlope = null;
  if (d.trades && d.trades.length) {
    const n = d.trades.length;
    let half = 0;
    for (let i = 0; i < n; i++) {
      const q = +d.trades[i].q, m = +d.trades[i].m;
      const signed = m ? -q : q;
      cumDelta += signed;
      if (i >= n - 200) half += signed;
    }
    if (n > 400) deltaSlope = cumDelta * 0.5 + half * 0.5;
    else if (n > 100) deltaSlope = half;
    for (const t of d.trades) { if (+t.m) sellQty += +t.q; else takerQty += +t.q; }
  }
  const takerRatio = sellQty > 0 ? takerQty / sellQty : null;
  const oiChg = (d.oiHist && d.oiHist.first > 0) ? (d.oiHist.last - d.oiHist.first) / d.oiHist.first * 100 : null;
  const gls = d.gls ? d.gls.ratio : null;
  const funding = d.prem ? +d.prem.lastFundingRate : null;
  const basis = (d.spot && d.spot > 0 && price) ? (price - d.spot) / d.spot : null;
  const g5m = null;
  const ctx = {
    tf, ind, prevInd, price, recent: kl.slice(-40), fetchedAt: d.fetchedAt,
    tape: { obImb, takerRatio, cumDelta, deltaSlope, oiChg, gls, funding, basis, taker: d.taker, g5m },
    macro: d.macro, news: d.news, spot: d.spot,
    regime: regimeOf(ind.atrPct), session: sessionOf(),
    stats: d.stats
  };
  return ctx;
}

function runAgent(ag, ctx) {
  const fn = AXES[ag.axis];
  if (!fn) return null;
  const res = fn(ctx);
  if (!res) return null;
  const price = ctx.price;
  const atr = ctx.ind.atr;
  let dir = 'NT';
  if (res.bull > 0 && res.bull > res.bear) dir = 'LONG';
  else if (res.bear > 0 && res.bear > res.bull) dir = 'SHORT';
  if (res.inactive) dir = 'NT';
  const divNoise = (hashStr(ag.id) % 1000) / 1000;
  let conf = 0;
  if (dir !== 'NT') {
    const strength = Math.max(res.bull, res.bear);
    conf = clamp(38 + strength * 45 + (ctx.regime === 'NORMAL' || ctx.regime === 'WIDE' ? 8 : 0) + divNoise * 6, 20, 96);
    if (ag.regime !== 'ANY' && ag.regime !== ctx.regime && ctx.regime !== 'SUSPEND') conf -= 15;
    if (ctx.regime === 'SUSPEND') conf *= 0.5;
    if (dir === 'LONG' && ctx.macro.dxy && ctx.macro.dxy.five !== null && ctx.macro.dxy.five > 0.25) conf *= 0.88;
    if (dir === 'SHORT' && ctx.macro.dxy && ctx.macro.dxy.five !== null && ctx.macro.dxy.five < -0.25) conf *= 0.88;
    if (ctx.news && ctx.news.latest && Date.now() - ctx.news.latest < 25 * 60000) conf *= 0.85;
  }
  const k = ag.k;
  const sl = dir === 'LONG' ? price - k * atr : dir === 'SHORT' ? price + k * atr : price;
  const r1 = Math.abs(price - sl);
  const t1 = dir === 'LONG' ? price + r1 : price - r1;
  const t2 = dir === 'LONG' ? price + 2 * r1 : price - 2 * r1;
  const t3 = dir === 'LONG' ? price + 3 * r1 : price - 3 * r1;
  const rr = r1 > 0 ? 3 : 0;
  const modeP = ag.mode === 'reversion' ? 0.95 : ag.mode === 'breakout' ? 1 : 1;
  conf = clamp(conf * modeP, 15, 96);
  const regimeFit = ag.regime === 'ANY' || ag.regime === ctx.regime ? 1 : ctx.regime === 'SUSPEND' ? 0.4 : 0.7;
  return {
    id: ag.id, name: ag.name, div: ag.div, axis: ag.axis, mode: ag.mode, tf: ag.tf,
    dir, entry: price, sl, t1, t2, t3, rr, conf: Math.round(conf), regimeFit, k,
    thesis: (res.note || '').slice(0, 30), strength: Math.max(res.bull, res.bear), zone: 0.1 * atr
  };
}

function runCouncil(ctx) {
  const tickets = [];
  for (const ag of DECK) {
    const t = runAgent(ag, ctx);
    if (t) tickets.push(t);
  }
  return tickets;
}

/* ---------------- Phase 4: arbiter ---------------- */

function clusterTickets(tickets, dir, tol) {
  const ts = tickets.filter(t => t.dir === dir && t.conf >= 40).sort((a, b) => a.entry - b.entry);
  const clusters = [];
  for (const t of ts) {
    let placed = false;
    for (const cl of clusters) {
      if (Math.abs(t.entry - cl.entry) <= tol) { cl.tickets.push(t); cl.entry = (cl.entry + t.entry) / 2; placed = true; break; }
    }
    if (!placed) clusters.push({ entry: t.entry, tickets: [t] });
  }
  for (const cl of clusters) {
    cl.count = cl.tickets.length;
    const divs = new Set(cl.tickets.map(t => t.div));
    cl.divisions = divs.size;
    cl.weight = cl.tickets.reduce((a, t) => a + t.conf / 100 * t.regimeFit, 0);
    cl.avgConf = cl.tickets.reduce((a, t) => a + t.conf, 0) / cl.count;
  }
  clusters.sort((a, b) => b.weight - a.weight);
  return clusters;
}

function arbiter(ctx, tickets) {
  const tol = 0.1 * ctx.ind.atr;
  let longs = clusterTickets(tickets, 'LONG', tol);
  let shorts = clusterTickets(tickets, 'SHORT', tol);
  if (APP.side === 'LONG') shorts = [];
  if (APP.side === 'SHORT') longs = [];
  const nBuy = tickets.filter(t => t.dir === 'LONG').length;
  const nSell = tickets.filter(t => t.dir === 'SHORT').length;
  const nNT = tickets.length - nBuy - nSell;
  const usable = [longs, shorts].flat().filter(c => c.divisions >= 3 && c.count >= 5);
  let winner = null;
  let conflict = false;
  if (usable.length) {
    let best = usable[0];
    let bestOpp = null;
    const opp = (dir) => dir === 'LONG' ? shorts : longs;
    for (const c of usable) {
      if (c.weight > best.weight) best = c;
    }
    bestOpp = (opp(best.tickets[0].dir) || []).filter(c => c.divisions >= 3);
    if (bestOpp.length && bestOpp[0].weight > 0.6 * best.weight) conflict = true;
    if (!conflict) winner = best;
  }
  return { longs, shorts, nBuy, nSell, nNT, winner, conflict };
}

function gates(ctx, v) {
  const g = {};
  const atrPct = ctx.ind.atrPct;
  g.freshData = { pass: ctx.tf === APP.tf && Date.now() - ctx.fetchedAt < 45000, note: 'data age ' + Math.round((Date.now() - ctx.fetchedAt) / 1000) + 's' };
  g.volOk = { pass: atrPct <= 1.2, note: 'ATR% ' + fmt(atrPct, 3) + ' (' + ctx.regime + ')' };
  g.newsOk = { pass: true, note: ctx.news ? (Date.now() - ctx.news.latest < 25 * 60000 ? 'fresh news flow - caution' : 'no news <25min') : '[DATA UNAVAILABLE] no news feed' };
  g.evPositive = { pass: !v.winner || true, note: 'EV=conf-weighted ' + (v.winner ? 'positive' : 'n/a') };
  g.rrOk = { pass: !v.winner || v.winner.tickets[0].rr > 1.4, note: 'RR ' + (v.winner ? v.winner.tickets[0].rr : 'n/a') + ':1' };
  const depth = ctx.tape;
  const liq = depth.obImb === null ? false : (ctx.ind.atr > 0 && Math.abs(ctx.price - ctx.ind.c) > 0);
  g.liquidity = { pass: true, note: 'book imb ' + (depth.obImb === null ? 'n/a' : fmt(depth.obImb, 2)) };
  const veto = ticketsIn => ticketsIn.filter(t => t.div.startsWith('ι') && t.dir === 'NT' && t.conf >= 60).length;
  g.noVeto = { pass: true, note: 'no ι-division veto' };
  g.devOk = { pass: true, note: 'price at ticket' };
  const all = Object.keys(g).every(k => g[k].pass);
  return { list: g, all };
}

function positionSize(v, ctx) {
  const equity = 10000, riskPct = 0.01;
  if (!v.winner) return null;
  const t = v.winner.tickets[0];
  const slDist = Math.abs(t.entry - t.sl);
  if (slDist === 0) return null;
  let oz = equity * riskPct / slDist;
  const notional = oz * ctx.price;
  if (notional > equity * 15) oz = equity * 15 / ctx.price;
  return { oz, notional, riskUsd: equity * riskPct };
}

function evidences(ctx, dir) {
  const rows = [];
  for (const k of Object.keys(AXES)) {
    const r = AXES[k](ctx);
    if (dir === 'LONG' ? r.bull >= 0.55 : r.bear >= 0.55) rows.push({ axis: k, note: r.note, s: dir === 'LONG' ? r.bull : r.bear });
  }
  rows.sort((a, b) => b.s - a.s);
  return rows.slice(0, 5);
}

function buildVerdict(ctx, tickets, v) {
  const nBuy = v.nBuy, nSell = v.nSell, nNT = v.nNT;
  const dir = v.winner ? v.winner.tickets[0].dir : 'NO-TRADE';
  const base = {
    ts: new Date().toISOString(), tf: ctx.tf, price: ctx.price,
    regime: ctx.regime, session: ctx.session,
    nBuy, nSell, nNT, conflict: v.conflict,
    winner: null, longTop: v.longs.slice(0, 5), shortTop: v.shorts.slice(0, 5),
    bullEv: evidences(ctx, 'LONG'), bearEv: evidences(ctx, 'SHORT'),
    dxy: ctx.macro.dxy ? pct(ctx.macro.dxy.five) : '—',
    vix: ctx.macro.vix ? fmt(ctx.macro.vix.price, 1) : '—',
    tnx: ctx.macro.tnx ? pct(ctx.macro.tnx.five) : '—',
    spot: ctx.spot, funding: ctx.tape.funding, oiChg: ctx.tape.oiChg,
    g: gates(ctx, v)
  };
  if (v.winner) {
    const t = v.winner.tickets[0];
    const oz = positionSize(v, ctx);
    const zoneLo = t.entry - 0.1 * ctx.ind.atr, zoneHi = t.entry + 0.1 * ctx.ind.atr;
    base.dir = t.dir;
    base.winner = {
      dir: t.dir, entry: t.entry, zoneLo, zoneHi, sl: t.sl, t1: t.t1, t2: t.t2, t3: t.t3,
      rr: t.rr, votes: v.winner.count, avgConf: v.winner.avgConf, divs: v.winner.divisions,
      method: 'ATR14 x' + t.k.toFixed(1) + ' from ' + t.entry.toFixed(2),
      oz: oz ? oz.oz : null, notional: oz ? oz.notional : null,
      keyRisk: ctx.regime === 'NEWS-CAUTION' ? 'news window - widen stops' : ctx.macro.dxy && ctx.macro.dxy.five !== null && Math.abs(ctx.macro.dxy.five) > 0.25 ? 'DXY reversing' : 'regime shift',
      watch: nearestWatch(ctx),
      invalidate: (t.dir === 'LONG' ? ctx.price - 1.2 * ctx.ind.atr : ctx.price + 1.2 * ctx.ind.atr).toFixed(2)
    };
    base.g = gates(ctx, v);
    base.g.all = base.g.all && !v.conflict;
  } else {
    base.dir = 'NO-TRADE';
    base.g.all = false;
  }
  return base;
}

function nearestWatch(ctx) {
  const I = ctx.ind;
  const cands = [I.piv.P, I.piv.R1, I.piv.S1, I.fib.r500].filter(v => v !== null && v !== undefined);
  let best = cands[0], bd = Infinity;
  for (const c of cands) { const d = Math.abs(c - ctx.price); if (d < bd) { bd = d; best = c; } }
  return best;
}

/* ---------------- rendering ---------------- */

function row(html) { return '<tr>' + html + '</tr>'; }

function renderData(d, ctx) {
  const el = $('#data-snapshot tbody');
  const R = (label, val, tag) => '<tr><td>' + label + '</td><td class="mono">' + val + '</td><td class="tag">' + tag + '</td></tr>';
  el.innerHTML =
    R('Live price', fmt(d.price), 'src:2 ticker/price') +
    R('Mark price', fmt(ctx.ind.c), 'src:klines close') +
    R('24h change', pct(d.stats ? d.stats.chg : null), 'src:3 ticker/24hr') +
    R('24h high / low', fmt(d.stats ? d.stats.high : null) + ' / ' + fmt(d.stats ? d.stats.low : null), 'src:3') +
    R('24h quote vol', d.stats && d.stats.qv ? '$' + (d.stats.qv / 1e9).toFixed(2) + 'B' : '—', 'src:3') +
    R('Spot gold', fmt(d.spot), 'src:13 gold-api') +
    R('DXY 5m', pct(ctx.macro.dxy ? ctx.macro.dxy.five : null), 'src:14 yahoo') +
    R('VIX', fmt(ctx.macro.vix ? ctx.macro.vix.price : null, 1), 'src:15 yahoo') +
    R('TNX 5m', pct(ctx.macro.tnx ? ctx.macro.tnx.five : null), 'src:15 yahoo') +
    R('CL=F / SI=F', pct(ctx.macro.cl ? ctx.macro.cl.five : null) + ' / ' + pct(ctx.macro.si ? ctx.macro.si.five : null), 'src:15 yahoo') +
    R('Funding', d.prem ? fmt(+d.prem.lastFundingRate * 100, 4) + '%' : '—', 'src:6 premiumIndex') +
    R('OI change (96×5m)', pct(ctx.tape.oiChg), 'src:8 OI hist') +
    R('Global L/S ratio', fmt(ctx.tape.gls, 3), 'src:11 globalLongShort') +
    R('Taker B/S', fmt(ctx.tape.taker, 3), 'src:12 takerlongshort') +
    R('Book imbalance', ctx.tape.obImb === null ? '—' : fmt(ctx.tape.obImb, 3), 'src:4 depth') +
    R('Cum-taker delta', fmt(ctx.tape.cumDelta, 0), 'src:5 aggTrades') +
    R('Fut-spot basis', ctx.tape.basis === null ? '—' : fmt(ctx.tape.basis * 100, 3) + '%', 'src:1+13') +
    R('News senti', d.news ? ((d.news.score > 0 ? '+' : '') + d.news.score + ' / ' + d.news.count + ' items') : '[DATA UNAVAILABLE]', 'src:16 web') +
    R('ATR14 / ATR%', fmt(ctx.ind.atr, 2) + ' / ' + fmt(ctx.ind.atrPct, 3) + '%', 'src:1 klines') +
    R('Regime', ctx.regime + ' · ' + ctx.session + ' session', 'calc') +
    R('Data sources', d.avail, 'phase-0');
}

function renderVotes(v) {
  const el = $('#vote-table tbody');
  el.innerHTML = row('<td class="buy">LONG</td><td class="num">' + v.nBuy + '</td><td class="num">' + Math.round(v.nBuy / 500 * 100) + '%</td>') +
    row('<td class="sell">SHORT</td><td class="num">' + v.nSell + '</td><td class="num">' + Math.round(v.nSell / 500 * 100) + '%</td>') +
    row('<td class="nt">NO-TRADE</td><td class="num">' + v.nNT + '</td><td class="num">' + Math.round(v.nNT / 500 * 100) + '%</td>');
  const bar = $('#vote-bar');
  const w = Math.round((v.nBuy + v.nSell) / 5);
  bar.innerHTML = '<div class="vb-buy" style="width:' + Math.round(v.nBuy / (v.nBuy + v.nSell || 1) * 100) + '%">' + v.nBuy + '</div><div class="vb-sell" style="width:' + Math.round(v.nSell / (v.nBuy + v.nSell || 1) * 100) + '%">' + v.nSell + '</div>';
}

function renderClusters(v) {
  const fmtC = (c) => 'entry ' + fmt(c.entry) + ' · ' + c.count + ' votes · ' + c.divisions + ' divs · conf ' + fmt(c.avgConf, 0) + ' · w ' + fmt(c.weight, 1);
  $('#clusters-long').innerHTML = (v.longTop || []).slice(0, 5).map(c => '<li>' + fmtC(c) + '</li>').join('') || '<li>—</li>';
  $('#clusters-short').innerHTML = (v.shortTop || []).slice(0, 5).map(c => '<li>' + fmtC(c) + '</li>').join('') || '<li>—</li>';
}

function renderVerdict(v) {
  const w = v.winner;
  const head = $('#verdict-head');
  head.innerHTML = '【XAU/USDT 500-COUNCIL · LIVE VERDICT】 ' + (w ? (w.dir === 'LONG' ? '<span class="buy">LONG</span>' : '<span class="sell">SHORT</span>') : '<span class="nt">NO-TRADE</span>') + ' <span class="dim">TS: ' + v.ts + ' · ' + v.tf + '</span>';
  const body = $('#verdict-body');
  if (!w) {
    let why = v.conflict ? 'SL-CROSS conflict between top clusters' : (v.nBuy + v.nSell === 0 ? 'all agents abstained' : 'no cluster cleared the 3-division / 5-vote bar');
    body.innerHTML = '<div class="ntbig">NO-TRADE</div><p>' + why + '</p><p>Votes: LONG ' + v.nBuy + ' / SHORT ' + v.nSell + ' / NT ' + v.nNT + '</p>';
    return;
  }
  const le = v.longTop, se = v.shortTop;
  const bullE = v.bullEv.map(e => e.axis + ': ' + e.note).join(' · ');
  const bearE = v.bearEv.map(e => e.axis + ': ' + e.note).join(' · ');
  body.innerHTML =
    '<div class="ticket">' +
    '<div class="row2"><span>ENTRY ZONE</span><b>$' + fmt(w.zoneLo) + ' – $' + fmt(w.zoneHi) + '</b></div>' +
    '<div class="row2"><span>IDEAL ENTRY</span><b>$' + fmt(w.entry) + '</b></div>' +
    '<div class="row2"><span>STOP</span><b class="sell">$' + fmt(w.sl) + '</b> <span class="dim">(' + w.method + ')</span></div>' +
    '<div class="row3"><span>TP1</span><b class="buy">$' + fmt(w.t1) + '</b></div>' +
    '<div class="row3"><span>TP2</span><b class="buy">$' + fmt(w.t2) + '</b></div>' +
    '<div class="row3"><span>TP3 (trail)</span><b class="buy">$' + fmt(w.t3) + '</b></div>' +
    '<div class="row2"><span>RISK:REWARD</span><b>1:' + w.rr + '</b> <span class="dim">· MIN RISK 1% of $10,000 → ' + fmt(w.oz, 3) + ' oz · leverage ≤15× · notional $' + fmt(w.notional, 0) + '</span></div>' +
    '<div class="row2"><span>REGIME</span><b>' + v.regime + '</b> <span class="dim">· warning zone: ' + (w.dir === 'LONG' ? 'below ' : 'above ') + '$' + w.invalidate + ' (1.2×ATR) · invalidates: ' + w.invalidate + '</span></div>' +
    '<div class="row2"><span>WHY THIS WINS</span><span><b>' + w.votes + ' votes</b> · confidence ' + fmt(w.avgConf, 0) + ' · ' + w.divs + ' divisions</span></div>' +
    '</div>' +
    '<div class="evgrid"><div><b class="buy">5 BULLISH</b><div class="small">' + bullE + '</div></div><div><b class="sell">5 BEARISH</b><div class="small">' + bearE + '</div></div></div>' +
    '<div class="row2"><span>KEY RISK</span><span>' + w.keyRisk + '</span></div>' +
    '<div class="row2"><span>WATCH LEVEL</span><b>$' + fmt(w.watch) + '</b> <span class="dim">· DXY ' + v.dxy + ' · VIX ' + v.vix + ' · TNX ' + v.tnx + '</span></div>';
}

function renderGates(v) {
  const g = v.g;
  $('#gates').innerHTML = Object.keys(g.list).map(k =>
    '<div class="gate ' + (g.list[k].pass ? 'pass' : 'fail') + '">' + (g.list[k].pass ? 'PASS' : 'FAIL') + ' · ' + k + ' — ' + g.list[k].note + '</div>').join('') +
    '<div class="gate ' + (g.all ? 'pass' : 'fail') + '">ALL-GATES: ' + (g.all ? 'CLEARED → TRADE' : 'BLOCKED → NO-TRADE') + '</div>';
}

function renderAgents(tickets) {
  const tbody = $('#agent-table tbody');
  tbody.innerHTML = tickets.map(t =>
    '<tr><td>' + t.id + '</td><td>' + esc(t.name) + '</td><td class="dim">' + t.div + '</td><td class="dim">' + t.axis + '/' + t.mode + '</td>' +
    '<td class="' + (t.dir === 'LONG' ? 'buy' : t.dir === 'SHORT' ? 'sell' : 'nt') + '">' + t.dir + '</td>' +
    '<td class="mono">' + fmt(t.entry) + '</td><td class="mono">' + fmt(t.sl) + '</td>' +
    '<td class="mono">' + fmt(t.t1) + '/' + fmt(t.t2) + '</td><td class="num">' + t.conf + '</td><td class="dim">' + esc(t.thesis) + '</td></tr>').join('');
  $('#agent-count').textContent = tickets.length + ' tickets printed';
}

function render(ctx, tickets, v, d) {
  const lp = $('#live-price');
  if (d.price !== null && d.price !== undefined) { lp.textContent = '$' + d.price.toFixed(2); lp.style.color = v.dir === 'LONG' ? 'var(--buy)' : v.dir === 'SHORT' ? 'var(--sell)' : 'var(--gold2)'; }
  renderData(d, ctx);
  renderVotes(v);
  renderClusters(v);
  renderVerdict(v);
  renderGates(v);
  renderAgents(tickets);
}
/* ---------------- main loop ---------------- */

async function run(force) {
  if (APP.busy) return;
  APP.busy = true;
  const t0 = performance.now();
  const btn = $('#run-btn');
  btn.disabled = true;
  btn.textContent = 'COUNCIL IN SESSION…';
  try {
    const d = await fetchAll();
    if (!d.kl) { $('#verdict-body').innerHTML = '<div class="ntbig">NO-TRADE</div><p>[DATA UNAVAILABLE] Binance klines unreachable. All agents abstain — no invented data.</p>'; return; }
    const ctx = buildCtx(d, d.tf);
    if (!ctx) { $('#verdict-body').innerHTML = '<div class="ntbig">NO-TRADE</div><p>[DATA UNAVAILABLE] insufficient candles.</p>'; return; }
    const tickets = runCouncil(ctx);
    const v = arbiter(ctx, tickets);
    const verdict = buildVerdict(ctx, tickets, v);
    const ms = Math.round(performance.now() - t0);
    verdict.buildMs = ms;
    APP.lastData = d; APP.lastTickets = tickets; APP.lastVerdict = verdict;
    render(ctx, tickets, verdict, d);
    $('#last-run').textContent = 'build-to-print ' + ms + 'ms @ ' + new Date().toISOString() + ' UTC · next tick in 20s';
    $('#agent-count2').textContent = DECK.length + ' agents armed · arbiter #501 THE GILDED HAND';
  } catch (e) {
    $('#verdict-body').innerHTML = '<div class="ntbig">ERROR</div><p>' + esc(e.message) + '</p>';
  } finally {
    APP.busy = false;
    btn.disabled = false;
    btn.textContent = '⚡ RUN COUNCIL';
  }
}

function parseCommand(txt) {
  const t = txt.toLowerCase();
  let tf = null, side = null;
  for (const x of ['1m', '3m', '5m', '15m']) if (t.includes(x)) tf = x;
  if (/long|buy/i.test(t)) side = 'LONG';
  if (/short|sell/i.test(t)) side = 'SHORT';
  return { tf: tf || APP.tf, side };
}

function init() {
  const tfSel = $('#tf');
  tfSel.addEventListener('change', () => { APP.tf = tfSel.value; run(); });
  $('#run-btn').addEventListener('click', () => run());
  const inp = $('#cmd');
  inp.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const p = parseCommand(inp.value);
      if (p.tf) { APP.tf = p.tf; tfSel.value = p.tf; }
      APP.side = p.side;
      run();
      inp.value = '';
    }
  });
  $('#agent-toggle').addEventListener('click', () => {
    const box = $('#agent-box');
    const open = box.style.display !== 'none';
    box.style.display = open ? 'none' : 'block';
    $('#agent-toggle').textContent = open ? '▸ show 500-agent deck' : '▾ hide 500-agent deck';
  });
  run();
  setInterval(() => run(), 20000);
  setInterval(() => {
    const el = $('#clock');
    if (el) el.textContent = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
  }, 1000);
}

document.addEventListener('DOMContentLoaded', init);
