'use strict';

const { agents, runAgent, clamp } = require('./agents/engine.js');
const indLib = require('./indicators.js');

const CATEGORY_WEIGHTS = { 1: 1.0, 2: 1.0, 3: 1.1, 4: 1.1, 5: 1.2, 6: 1.1, 7: 1.0, 8: 1.0, 9: 1.2, 10: 1.3 };
const now = () => Date.now();
const r2 = (x) => (x === null || x === undefined ? null : Math.round(x * 100) / 100);
const round = (x) => (x === null || x === undefined ? null : Math.round(x * 1000) / 1000);

function median(arr) {
  if (!arr || !arr.length) return null;
  const s = arr.slice().sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

function weightFor(vote) {
  if (CATEGORY_WEIGHTS[vote.cat] !== undefined) return CATEGORY_WEIGHTS[vote.cat];
  return vote.catWeight || 1.0;
}

// ---------------------------------------------------------------------------
// context assembly from live fetcher + indicator payloads
// ---------------------------------------------------------------------------
function buildContext({ allK, inds, prevInds, market, book, tape, spot, macro, news, session, sys, lastAgg, live }) {
  const target = inds && inds['15m'] ? inds['15m'] : null;
  const price = live && live.price != null ? live.price : (target ? target.price : null);
  const markPrice = (market && market.premium && market.premium.data && market.premium.data.markPrice != null)
    ? +market.premium.data.markPrice : (live && live.mark != null ? live.mark : null);
  let funding = null;
  if (market && market.funding && market.funding.data && market.funding.data.length) funding = +market.funding.data[market.funding.data.length - 1].fundingRate;
  if (funding === null && live && live.funding != null) funding = +live.funding;

  let piv = null;
  if (allK && allK['1d'] && allK['1d'].klines && allK['1d'].klines.length) piv = indLib.pivots(indLib.prepCandles(allK['1d'].klines));

  let fib = null;
  if (allK && allK['15m'] && allK['15m'].klines && allK['15m'].klines.length >= 20) {
    const seg = indLib.prepCandles(allK['15m'].klines).slice(-20);
    const hi = Math.max(...seg.map((x) => x.h));
    const lo = Math.min(...seg.map((x) => x.l));
    fib = indLib.fibonacci(hi, lo);
  }

  const f = {};
  if (market) {
    const m = market;
    f.markPrice = markPrice;
    f.funding = funding;
    f.fundingTrend = m.funding && m.funding.data ? indLib.fundingTrend(m.funding.data) : null;
    f.fundingAnnual = funding === null ? null : funding * 3 * 365 * 100;
    f.oi = m.oi && m.oi.data ? +m.oi.data.openInterest : null;
    let oiChange = null;
    if (m.oiHist && m.oiHist.data && m.oiHist.data.length > 1) {
      const cur = +m.oiHist.data[m.oiHist.data.length - 1].sumOpenInterest;
      const prev = +m.oiHist.data[m.oiHist.data.length - 2].sumOpenInterest;
      if (prev) oiChange = ((cur - prev) / prev) * 100;
    }
    f.oiChange = oiChange;
    f.globalLS = m.globalLS && m.globalLS.data && m.globalLS.data.length ? +m.globalLS.data[m.globalLS.data.length - 1].longShortRatio : null;
    f.globalLongPct = m.globalLS && m.globalLS.data && m.globalLS.data.length ? +m.globalLS.data[m.globalLS.data.length - 1].longAccount * 100 : null;
    f.lsSeries = m.globalLS && m.globalLS.data ? m.globalLS.data.map((x) => +x.longShortRatio) : null;
    f.topPosLS = m.topPos && m.topPos.data && m.topPos.data.length ? +m.topPos.data[m.topPos.data.length - 1].longShortRatio : null;
    f.takerRatio = m.taker && m.taker.data && m.taker.data.length ? +m.taker.data[m.taker.data.length - 1].buySellRatio : null;
    f.basis = m.basis && m.basis.data && m.basis.data.length ? +m.basis.data[m.basis.data.length - 1].basis : null;
    f.basisAbs = f.basis === null ? null : Math.abs(f.basis);
  }

  return {
    tf: '15m',
    price,
    ind: target,
    indPrev: prevInds && prevInds['15m'] ? prevInds['15m'] : null,
    inds: inds || {},
    fib,
    pivots: piv,
    funds: f,
    tape: tape || null,
    book: book || null,
    macro: macro || {},
    spot: spot || null,
    news: news || [],
    session: session || indLib.session(now()),
    sys: sys || { apiOk: true, wsConnected: true, halted: false, freshnessScore: 0, cycleMs: 1500 },
    lastAgg: lastAgg || { d: 0, confidence: 0, gatesPass: false, gatesFail: false, bias: 'NEUTRAL', outliers: 0 }
  };
}

// ---------------------------------------------------------------------------
// run all 500 agents — exactly one vote each
// ---------------------------------------------------------------------------
function runAll(ctx) {
  const votes = [];
  for (const a of agents) {
    let v;
    try { v = runAgent(ctx, a); } catch (e) { v = { d: 0, conf: 0, err: e.message }; }
    if (!v || v.d === undefined) v = { d: 0, conf: 0 };
    v.w = weightFor(v);
    votes.push(v);
  }
  return votes;
}

// ---------------------------------------------------------------------------
// tally — raw majority (Gate 3) + weighted check (46.5)
// ---------------------------------------------------------------------------
function tally(votes) {
  let long = 0, short = 0, neutral = 0, wLong = 0, wShort = 0, wNeutral = 0;
  for (const v of votes) {
    if (v.d === 1) { long++; wLong += v.w; }
    else if (v.d === -1) { short++; wShort += v.w; }
    else { neutral++; wNeutral += v.w; }
  }
  const rawMajority = Math.max(long, short);
  const rawDir = long > short ? 1 : short > long ? -1 : 0;
  const wDir = wLong > wShort ? 1 : wShort > wLong ? -1 : 0;
  let d = 0, inconsistency = false;
  if (rawMajority >= 251 && rawDir !== 0) {
    if (rawDir === wDir) d = wDir;
    else inconsistency = true;
  }
  const confidence = Math.round((rawMajority / 500) * 1000) / 10;
  return { long, short, neutral, wLong: round(wLong), wShort: round(wShort), wNeutral: round(wNeutral), wTotal: round(wLong + wShort + wNeutral), rawMajority, d, inconsistency, confidence };
}

// ---------------------------------------------------------------------------
// outlier rejection — 2×/3× ATR median filters + 10% trims + p95 winsorize
// ---------------------------------------------------------------------------
function outlierTrim(values, atr, mult) {
  if (!values || !values.length) return { kept: [], rejected: 0, median: null };
  const med = median(values);
  const near = values.filter((x) => Math.abs(x - med) <= mult * atr);
  const rejected = values.length - near.length;
  const sorted = near.slice().sort((a, b) => a - b);
  const cut = Math.max(1, Math.floor(sorted.length * 0.05));
  const trimmed = sorted.slice(cut, sorted.length - cut);
  const arr = trimmed.length ? trimmed : sorted;
  const p95 = arr[Math.min(arr.length - 1, Math.floor((arr.length - 1) * 0.95))];
  const winsor = arr.map((x) => Math.min(x, p95));
  return { kept: winsor, rejected, median: median(winsor) };
}

// ---------------------------------------------------------------------------
// per-agent position proposal (entry / sl / tp) from method + stopMult + rr
// ---------------------------------------------------------------------------
function buildPos(ctx, vote, d) {
  const i = ctx.ind;
  if (!i) return null;
  const atr = i.atr14;
  const price = ctx.price;
  const fib = ctx.fib;
  const lastOB = i.orderBlocks && i.orderBlocks.length ? i.orderBlocks[i.orderBlocks.length - 1] : null;
  const lastBRK = i.breakerBlocks && i.breakerBlocks.length ? i.breakerBlocks[i.breakerBlocks.length - 1] : null;
  const fvg = i.fvg;
  const voids = i.voids || [];
  const voidA = voids.length ? voids[voids.length - 1] : null;
  const ind = i.inducement;
  const dSR = i.dynamicSR || {};
  let entry = price;
  switch (vote.method) {
    case 'ema21': case 'mtf': case 'mtf-ema': case 'rsi': case 'macd': case 'stoch': case 'cci':
    case 'wr': case 'momentum': case 'ema': case 'ribbon': case 'hull': case 'kama':
      if (i.ema21 != null) entry = i.ema21;
      break;
    case 'swing': case 'session':
      entry = d === 1 ? (i.lastL != null ? i.lastL + 0.25 * atr : price) : (i.lastH != null ? i.lastH - 0.25 * atr : price);
      break;
    case 'liq':
      entry = d === 1 ? (i.ssl != null ? i.ssl + 0.15 * atr : price) : (i.bsl != null ? i.bsl - 0.15 * atr : price);
      break;
    case 'ob':
      if (lastOB && ((lastOB.type === 'BULLISH' && d === 1) || (lastOB.type === 'BEARISH' && d === -1))) entry = (lastOB.top + lastOB.bottom) / 2;
      break;
    case 'breaker':
      if (lastBRK && ((lastBRK.type === 'BULLISH' && d === 1) || (lastBRK.type === 'BEARISH' && d === -1))) entry = (lastBRK.top + lastBRK.bottom) / 2;
      break;
    case 'fvg':
      if (fvg && ((fvg.type === 'BULLISH' && d === 1) || (fvg.type === 'BEARISH' && d === -1))) entry = fvg.mid;
      break;
    case 'void':
      if (voidA && ((voidA.type === 'BULLISH' && d === 1) || (voidA.type === 'BEARISH' && d === -1))) entry = (voidA.top + voidA.bottom) / 2;
      break;
    case 'induce':
      if (ind && ind.range && ((ind.type === 'BULLISH' && d === 1) || (ind.type === 'BEARISH' && d === -1))) entry = ind.range.mid;
      break;
    case 'pivot':
      if (ctx.pivots && ctx.pivots.P != null) entry = ctx.pivots.P;
      break;
    case 'vp':
      if (i.vwap != null) entry = i.vwap;
      break;
    case 'bollinger':
      entry = d === 1 ? (i.bbLo != null ? i.bbLo : price) : (i.bbUp != null ? i.bbUp : price);
      break;
    case 'keltner':
      entry = d === 1 ? (i.kcLo != null ? i.kcLo : price) : (i.kcUp != null ? i.kcUp : price);
      break;
    case 's/r':
      entry = d === 1 ? (dSR.nearestSupport != null ? dSR.nearestSupport : price) : (dSR.nearestResistance != null ? dSR.nearestResistance : price);
      break;
    case 'compiler':
      entry = fib ? (d === 1 ? fib.L618 : fib.L382) : price;
      break;
    default:
      entry = price;
  }
  const maxDist = atr * 2;
  if (Math.abs(entry - price) > maxDist) entry = d === 1 ? Math.max(price - maxDist, entry) : Math.min(price + maxDist, entry);
  const risk = clamp(vote.stopMult || 1.1, 0.5, 1.5) * atr;
  const sl = d === 1 ? entry - risk : entry + risk;
  const rr = vote.rr && vote.rr >= 1.5 ? vote.rr : 2.0;
  const tp = d === 1 ? entry + rr * risk : entry - rr * risk;
  return { entry: r2(entry), sl: r2(sl), tp: r2(tp), risk: r2(risk), rr };
}

// ---------------------------------------------------------------------------
// 6-gate validation protocol (Section 3)
// ---------------------------------------------------------------------------
function checkGates(ctx, t, sig, data) {
  const i = ctx.ind;
  const book = ctx.book;
  const f = ctx.funds || {};
  const atrPct = i ? i.atrPct : null;
  const spread = book ? book.spread : null;
  const g1 = (data && data.freshnessScore != null ? data.freshnessScore : 0) < 60;
  const g2 = atrPct !== null && atrPct >= 0.08 && atrPct <= 0.45 && spread !== null && spread < 0.15;
  const g3 = t.rawMajority >= 251 && t.confidence >= 55;
  let g4 = true, g5 = true;
  if (sig && i) {
    const slDist = Math.abs(sig.entry - sig.sl);
    g4 = slDist <= 1.5 * i.atr14 && sig.rr >= 1.5 && sig.leverage <= 10;
  } else if (!sig) g4 = false;
  if (book && book.imbalance != null) {
    if (t.d === 1 && book.imbalance > 80) g5 = false;
    if (t.d === -1 && book.imbalance < -80) g5 = false;
  }
  // Gate 6 = informational only (user policy): crowding (funding/L-S/OI) is
  // surfaced as a signal warning but no longer blocks consensus signals.
  const g6 = true;
  const gates = { gate1: g1, gate2: g2, gate3: g3, gate4: g4, gate5: g5, gate6: g6 };
  return { gates, pass: Object.values(gates).every(Boolean) };
}

// ---------------------------------------------------------------------------
// full cycle: votes -> tally -> params -> gates -> confidence -> sizing -> signal
// ---------------------------------------------------------------------------
function compile(ctx, votes, data) {
  const t = tally(votes);
  const i = ctx.ind;
  const ts = now();
  const atr = i ? i.atr14 : null;
  let winning = [];
  let entry = null, entryLo = null, entryHi = null, sl = null, tp = null, rr = null;
  let outliers = 0;
  if (t.d !== 0 && i) {
    winning = votes.filter((v) => v.d === t.d);
    const withPos = winning.map((v) => ({ v, pos: buildPos(ctx, v, t.d) })).filter((x) => x.pos);
    const eT = outlierTrim(withPos.map((x) => x.pos.entry), atr, 2);
    const sT = outlierTrim(withPos.map((x) => x.pos.sl), atr, 2);
    const pT = outlierTrim(withPos.map((x) => x.pos.tp), atr, 3);
    outliers = eT.rejected + sT.rejected + pT.rejected;
    if (eT.kept.length && sT.kept.length && pT.kept.length) {
      entry = r2(eT.median);
      sl = r2(sT.median);
      tp = r2(pT.median);
      const risk = Math.abs(entry - sl);
      rr = risk > 0 ? Math.abs(tp - entry) / risk : null;
      if (t.d === 1 && !(sl < entry && entry < tp)) { entry = sl = tp = rr = null; }
      if (t.d === -1 && !(tp < entry && entry < sl)) { entry = sl = tp = rr = null; }
    }
    if (outliers > 50) { entry = sl = tp = rr = null; }
    if (entry != null) { entryLo = r2(entry - atr * 0.3); entryHi = r2(entry + atr * 0.3); }
  }

  const equity = 10000;
  const baseConf = t.d !== 0 ? t.confidence : 0;
  let tier = 0;
  if (baseConf >= 55 && baseConf < 65) tier = 0.25;
  else if (baseConf < 75) tier = 0.5;
  else if (baseConf < 85) tier = 1.0;
  else if (baseConf < 95) tier = 1.2;
  else tier = 1.5;
  if (rr && rr > 3) tier *= 1.2;
  if (i) {
    if (i.atrPct != null && i.atrPct < 0.15) tier *= 1.1;
    else if (i.atrPct != null && i.atrPct > 0.35) tier *= 0.8;
  }
  const riskMult = data && data.riskMult != null ? data.riskMult : 1;
  const warnings = [];
  const fundingRate = ctx.funds && ctx.funds.funding;
  if (fundingRate != null && Math.abs(fundingRate) > 0.0005) {
    warnings.push('EXTREME FUNDING ' + (fundingRate * 100).toFixed(4) + '%');
  }
  const globalLS = ctx.funds && ctx.funds.globalLS;
  const oiChange = ctx.funds && ctx.funds.oiChange;
  if (t.d === 1 && globalLS != null && globalLS > 2.5) warnings.push('CROWDED LONG — L/S ' + globalLS.toFixed(2) + ' (info)');
  if (t.d === -1 && globalLS != null && globalLS < 0.5) warnings.push('CROWDED SHORT — L/S ' + globalLS.toFixed(2) + ' (info)');
  if (t.d === 1 && oiChange != null && oiChange < -3) warnings.push('OI CONTRACTION ' + oiChange.toFixed(1) + '% (info)');
  const spread = ctx.book && ctx.book.spread;
  const riskAmt = equity * 0.01 * tier * riskMult;
  const risk = entry != null && sl != null ? Math.abs(entry - sl) : 0;
  let sizeOz = risk > 0 ? riskAmt / risk : 0;
  const notional = sizeOz * (entry || 0);
  let leverage = equity > 0 ? notional / equity : 0;
  if (leverage > 10 && sizeOz > 0) { sizeOz *= 10 / leverage; leverage = 10; }
  if (spread != null && spread > 0.5) {
    sizeOz *= 0.5;
    warnings.push('WIDE SPREAD $' + spread.toFixed(2) + ' — SIZE HALVED');
  }

  const params = entry != null ? { entry, entryLo, entryHi, sl, tp, rr: round(rr) } : null;
  const g = checkGates(ctx, t, params ? { ...params, leverage } : null, data);
  const finalConf = t.d !== 0 && g.pass ? clamp(baseConf + 5 * Object.values(g.gates).filter(Boolean).length, 0, 100) : baseConf;
  const quality = params && finalConf > 0 && rr ? Math.round(finalConf * rr * (Object.values(g.gates).filter(Boolean).length / 6) * 10) / 10 : 0;
  const bias = t.d === 1 ? 'BULLISH' : t.d === -1 ? 'BEARISH' : 'NEUTRAL';
  const lastAgg = { d: t.d, confidence: finalConf, gatesPass: g.pass, gatesFail: !g.pass, bias, outliers };
  const usable = params && finalConf >= 55 && rr >= 1.5 && g.pass && quality >= 50 && outliers <= 50;
  const topAgents = winning.slice().sort((a, b) => b.conf - a.conf).slice(0, 3);
  const trail = entry != null && sl != null
    ? (t.d === 1 ? r2(entry + 2 * Math.abs(entry - sl)) : r2(entry - 2 * Math.abs(entry - sl))) : null;

  const signal = usable ? {
    ts, d: t.d, direction: t.d === 1 ? 'LONG' : 'SHORT',
    price: r2(ctx.price), markPrice: r2((ctx.funds && ctx.funds.markPrice) || null),
    confidence: finalConf, votes: t.rawMajority, total: 500,
    quality, tier, equity, riskAmt: r2(riskAmt), sizeOz: r2(sizeOz), notional: Math.round(notional),
    leverage: Math.round(leverage * 10) / 10,
    riskPct: riskMult < 1 ? 0.5 : 1, warnings,
    entry, entryLo, entryHi, sl, tp, rr: round(rr), trail,
    invalidation: sl,
    validForMs: 12 * 60000,
    gates: g.gates, gateNotes: {},
    topAgents: topAgents.map((v) => ({ id: v.id, name: v.name, conf: v.conf })),
    rationale: rationaleText(ctx, t)
  } : null;

  return { ts, tally: t, params, gates: g, confidence: finalConf, quality, outliers, lastAgg, signal };
}

// 2-3 sentence rationale: why the majority of 500 agents voted this way
function rationaleText(ctx, t) {
  const i = ctx.ind;
  const parts = [];
  if (i) {
    parts.push((i.alignment === 'BULLISH' ? '15m trend is BULLISH' : i.alignment === 'BEARISH' ? '15m trend is BEARISH' : '15m trend is MIXED') +
      ' (EMA stack) with ATR $' + r2(i.atr14) + ' (' + (i.atrPct != null ? i.atrPct.toFixed(2) : '?') + '%), RSI ' + (i.rsi != null ? i.rsi.toFixed(1) : '?') +
      (i.struct ? ' and ' + i.struct.toLowerCase() + ' structure' : ''));
  }
  const f = ctx.funds;
  if (f) {
    const bits = [];
    if (f.funding != null) bits.push('funding ' + (f.funding * 100).toFixed(4) + '%');
    if (f.oiChange != null) bits.push('OI ' + (f.oiChange > 0 ? '+' : '') + f.oiChange.toFixed(2) + '%');
    if (f.globalLS != null) bits.push('L/S ' + f.globalLS.toFixed(2));
    if (f.takerRatio != null) bits.push('taker B/S ' + f.takerRatio.toFixed(2));
    if (bits.length) parts.push('derivatives show ' + bits.join(', '));
  }
  const b = ctx.book;
  if (b && b.imbalance != null) {
    parts.push('order book is ' + (b.imbalance > 0 ? 'BID' : 'ASK') + '-weighted by ' + Math.abs(b.imbalance).toFixed(1) + '%');
  }
  if (parts.length < 1) parts.push('no strong context — majority vote based on raw count');
  parts.push((t.d === 1 ? 'long' : 'short') + ' consensus reached ' + t.rawMajority + '/500 (' + t.confidence.toFixed(0) + '%)');
  return parts.join('. ') + '.';
}

function confDecayed(conf, ageMs) {
  return Math.max(0, conf - 2 * (ageMs / 60000));
}

function refreshNeeded(prev, cur) {
  if (!prev || !cur) return true;
  if (cur.tally.rawMajority - prev.tally.rawMajority > 25) return true;
  if (prev.gates.pass !== cur.gates.pass) return true;
  if ((prev.signal ? 1 : 0) !== (cur.signal ? 1 : 0)) return true;
  return false;
}

const BOOT_PHASES = [
  '50.1 Boot Sequence Validator',
  '50.2 Boot Data Preloader',
  '50.3 Boot Connection Checker',
  '50.4 Boot Indicator Warmup Checker',
  '50.5 Boot Time Sync Checker',
  '50.6 Boot Env Validator',
  '50.7 Boot Config Loader',
  '50.8 Boot Health Report',
  '50.9 Boot Rollback Manager',
  '50.10 System Ready'
];

module.exports = { CATEGORY_WEIGHTS, buildContext, runAll, tally, outlierTrim, buildPos, checkGates, compile, confDecayed, refreshNeeded, BOOT_PHASES, median, now, r2 };
