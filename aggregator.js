'use strict';

const indLib = require('./indicators.js');
const { makeAgents } = require('./agents.js');

const AGENTS = makeAgents();
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));

// ---------- per-timeframe composite score (-1..1) ----------
function tfScore(cur) {
  if (!cur) return 0;
  let s = 0;
  if (cur.alignment === 'BULLISH') s += 0.25; if (cur.alignment === 'BEARISH') s -= 0.25;
  if (cur.adx > 20) s += cur.diPlus > cur.diMinus ? 0.15 : -0.15;
  if (cur.supertrendDir === 1) s += 0.10; else if (cur.supertrendDir === -1) s -= 0.10;
  if (cur.rsi !== null) s += cur.rsi > 55 ? 0.10 : cur.rsi < 45 ? -0.10 : 0;
  if (cur.macdHist !== null) s += cur.macdHist > 0 ? 0.10 : -0.10;
  if (cur.stK !== null) s += cur.stK > 50 ? 0.05 : -0.05;
  if (cur.cci !== null) s += cur.cci > 100 ? 0.05 : cur.cci < -100 ? -0.05 : 0;
  if (cur.pctB !== null) s += cur.pctB > 0.7 ? -0.05 : cur.pctB < 0.3 ? 0.05 : 0;
  if (cur.rvol !== null) s += cur.rvol > 1.5 && cur.close > cur.open ? 0.05 : cur.rvol > 1.5 && cur.close < cur.open ? -0.05 : 0;
  return clamp(s, -1, 1);
}

const TF_WEIGHTS = { '1m': 0.05, '3m': 0.15, '5m': 0.20, '15m': 0.25, '1h': 0.20, '4h': 0.10, '1d': 0.05 };

// ---------- build the context handed to all 50 agents ----------
function buildContext({ tf, allK, inds, prevInds, funds, depth, trades, macro, spot }) {
  const cs = indLib.prepCandles(allK[tf] || []);
  const target = inds[tf] || null;

  let seriesCvd = null;
  if (cs.length) {
    seriesCvd = [];
    let acc = 0;
    for (let i = 0; i < cs.length; i++) { acc += cs[i].tb - cs[i].ts; seriesCvd.push(acc); }
  }

  let fib = null;
  if (cs.length >= 20) {
    const seg = cs.slice(-20);
    const hi = Math.max(...seg.map((x) => x.h));
    const lo = Math.min(...seg.map((x) => x.l));
    fib = indLib.fibonacci(hi, lo);
  }

  const piv = indLib.pivots(indLib.prepCandles(allK['1d'] || []));

  const fundsAgg = {};
  if (funds) {
    const lastFR = funds.funding && funds.funding.length ? +funds.funding[funds.funding.length - 1].fundingRate : null;
    const oiCur = funds.oi ? +funds.oi.openInterest : null;
    const oiPrev = funds.oiHist && funds.oiHist.length > 1 ? +funds.oiHist[funds.oiHist.length - 2].sumOpenInterest : null;
    const oiChange = oiPrev ? ((oiCur - oiPrev) / oiPrev) * 100 : null;
    const gl = funds.globalLS && funds.globalLS.length ? funds.globalLS[funds.globalLS.length - 1] : null;
    const tl = funds.topLS && funds.topLS.length ? funds.topLS[funds.topLS.length - 1] : null;
    const tp = funds.topPos && funds.topPos.length ? funds.topPos[funds.topPos.length - 1] : null;
    const tk = funds.taker && funds.taker.length ? funds.taker[funds.taker.length - 1] : null;
    fundsAgg.markPrice = funds.premium ? +funds.premium.markPrice : null;
    fundsAgg.funding = lastFR;
    fundsAgg.fundingAnnual = lastFR === null ? null : lastFR * 3 * 365 * 100;
    fundsAgg.oi = oiCur;
    fundsAgg.oiUsd = oiCur && target ? oiCur * target.price : null;
    fundsAgg.oiChange = oiChange;
    fundsAgg.globalLS = gl ? +gl.longShortRatio : null;
    fundsAgg.globalLongPct = gl ? +gl.longAccount * 100 : null;
    fundsAgg.topLS = tl ? +tl.longShortRatio : null;
    fundsAgg.topPosLS = tp ? +tp.longShortRatio : null;
    fundsAgg.takerRatio = tk ? +tk.buySellRatio : null;
    fundsAgg.takerBuy = tk ? +tk.buyVol : null;
    fundsAgg.takerSell = tk ? +tk.sellVol : null;
    fundsAgg.nextFundingTime = funds.premium ? funds.premium.nextFundingTime : null;
    fundsAgg.oiSeries = funds.oiHist ? funds.oiHist.map((x) => +x.sumOpenInterest) : null;
  }

  return {
    tf,
    price: target ? target.price : null,
    ind: target,
    indPrev: prevInds[tf] || null,
    inds,
    fib,
    pivots: piv,
    funds: fundsAgg,
    depth: depth ? indLib.last(depth) : null,
    trades,
    macro: macro || {},
    spot,
    seriesCvd
  };
}

// ---------- entry / stop / targets ----------
function entryFor(ctx, method, d) {
  const i = ctx.ind;
  if (!i) return null;
  const price = i.price, atr = i.atr14;
  let e = price;
  const fib = ctx.fib;
  switch (method) {
    case 'ema21': e = i.ema21; break;
    case 'fib':
      if (fib) e = d === 1 ? fib.L618 : fib.L382;
      break;
    case 'ob': {
      const obs = i.orderBlocks || [];
      if (obs.length) {
        const ob = obs[obs.length - 1];
        if ((ob.type === 'BULLISH' && d === 1) || (ob.type === 'BEARISH' && d === -1)) e = (ob.top + ob.bottom) / 2;
      }
      break;
    }
    case 'vwap': e = i.vwap; break;
    case 'bb': e = d === 1 ? i.bbLo : i.bbUp; break;
    case 'kc': e = d === 1 ? i.kcLo : i.kcUp; break;
    case 'swing': {
      if (d === 1 && i.lastL !== null) e = i.lastL + 0.25 * atr;
      else if (d === -1 && i.lastH !== null) e = i.lastH - 0.25 * atr;
      break;
    }
    case 'liq':
      if (d === 1 && i.ssl !== null) e = i.ssl + 0.15 * atr;
      else if (d === -1 && i.bsl !== null) e = i.bsl - 0.15 * atr;
      break;
    case 'dc': case 'price': default: e = price; break;
  }
  const maxDist = atr * 3;
  if (Math.abs(e - price) > maxDist) e = d === 1 ? Math.max(price - maxDist, e) : Math.min(price + maxDist, e);
  return Math.round(e * 100) / 100;
}

function stopFor(ctx, entry, d) {
  const i = ctx.ind;
  if (!i) return null;
  const atr = i.atr14;
  const atrStop = d === 1 ? entry - 1.5 * atr : entry + 1.5 * atr;
  let structStop = null;
  if (d === 1) {
    if (i.lastL !== null) structStop = i.lastL - 0.5;
    if (ctx.pivots && ctx.pivots.S1 !== null) {
      const s1 = ctx.pivots.S1 - 0.75;
      structStop = structStop === null ? s1 : Math.min(structStop, s1);
    }
  } else {
    if (i.lastH !== null) structStop = i.lastH + 0.5;
    if (ctx.pivots && ctx.pivots.R1 !== null) {
      const r1 = ctx.pivots.R1 + 0.75;
      structStop = structStop === null ? r1 : Math.max(structStop, r1);
    }
  }
  let stop = atrStop;
  if (structStop !== null) stop = d === 1 ? Math.min(stop, structStop) : Math.max(stop, structStop);
  let dist = Math.abs(entry - stop);
  if (dist < atr * 0.7) stop = d === 1 ? entry - atr * 0.7 : entry + atr * 0.7;
  if (dist > 15) stop = d === 1 ? entry - 15 : entry + 15;
  return Math.round(stop * 100) / 100;
}

function buildPosition(ctx, method, d) {
  const i = ctx.ind;
  if (!i) return null;
  const atr = i.atr14;
  const entry = entryFor(ctx, method, d);
  const sl = stopFor(ctx, entry, d);
  const risk = Math.abs(entry - sl);
  const tp1 = entry + (d === 1 ? risk * 1.5 : -risk * 1.5);
  const tp2 = entry + (d === 1 ? risk * 2.5 : -risk * 2.5);
  const tp3 = entry + (d === 1 ? risk * 4.0 : -risk * 4.0);
  return {
    entry, sl, risk,
    tp1: Math.round(tp1 * 100) / 100,
    tp2: Math.round(tp2 * 100) / 100,
    tp3: Math.round(tp3 * 100) / 100,
    rr1: 1.5, rr2: 2.5, rr3: 4.0, atr
  };
}

// ---------- mode clustering ("most votes wins" for numeric values) ----------
function modeCluster(pairs, tol) {
  if (!pairs || pairs.length === 0) return null;
  const sorted = pairs.slice().sort((a, b) => a.v - b.v);
  let best = null, bestW = -1;
  for (let i = 0; i < sorted.length; i++) {
    let wSum = 0, sum = 0, cnt = 0, j = i;
    while (j < sorted.length && sorted[j].v - sorted[i].v <= tol) {
      sum += sorted[j].v * sorted[j].w;
      wSum += sorted[j].w;
      cnt++;
      j++;
    }
    if (wSum > bestW) {
      bestW = wSum;
      best = {
        val: wSum > 0 ? sum / wSum : sorted[i].v,
        wSum, cnt,
        spread: sorted[j - 1].v - sorted[i].v,
        lo: sorted[i].v, hi: sorted[j - 1].v
      };
    }
  }
  return best;
}

// ---------- run the 50 agents ----------
function runAgents(ctx) {
  return AGENTS.map((a) => {
    let v;
    try { v = a.fn(ctx); } catch (e) { v = { d: 0, conf: 0, reason: 'error: ' + e.message, method: 'price' }; }
    if (!v || v.d === undefined) v = { d: 0, conf: 0, reason: 'no vote', method: 'price' };
    let pos = null;
    if (v.d !== 0 && ctx.ind) pos = buildPosition(ctx, v.method || 'price', v.d);
    return { id: a.id, name: a.name, cat: a.cat, d: v.d, conf: clamp(v.conf || 0, 0, 100), reason: v.reason || '', method: v.method || 'price', pos };
  });
}

// ---------- MTF confluence + 5-layer score ----------
function layers(ctx, votes) {
  const inds = ctx.inds;
  let confluences = 0, wSum = 0;
  const tfScores = {};
  for (const tf of Object.keys(TF_WEIGHTS)) {
    const sc = tfScore(inds[tf]);
    tfScores[tf] = sc;
    confluences += sc * TF_WEIGHTS[tf];
    wSum += TF_WEIGHTS[tf];
  }
  confluences = wSum > 0 ? confluences / wSum : 0;

  const m = ctx.macro || {};
  const sig = (x) => (x === true ? 1 : x === false ? -1 : 0);

  // L1 macro
  let l1 = 0, l1n = 0;
  if (m.dxy && m.dxy.changePct !== null) { l1 += (m.dxy.changePct < -0.12 ? 1 : m.dxy.changePct > 0.12 ? -1 : 0); l1n++; }
  if (m.tnx && m.tnx.changePct !== null) { l1 += (m.tnx.changePct < -0.05 ? 1 : m.tnx.changePct > 0.05 ? -1 : 0); l1n++; }
  if (m.vix && m.vix.changePct !== null) { l1 += (m.vix.changePct > 3 ? 1 : m.vix.changePct < -3 ? -1 : 0); l1n++; }
  const L1 = l1n ? l1 / l1n : 0;

  // L2 flows/sentiment
  let l2 = 0, l2n = 0;
  if (ctx.funds.globalLongPct !== null) { l2 += (ctx.funds.globalLongPct > 70 ? -1 : ctx.funds.globalLongPct < 40 ? 1 : 0); l2n++; }
  if (ctx.spot && ctx.funds.markPrice) { const pct = ((ctx.spot.price - ctx.funds.markPrice) / ctx.funds.markPrice) * 100; l2 += sig(pct > 0.05 ? true : pct < -0.05 ? false : null); if (pct > 0.05 || pct < -0.05) l2n++; }
  const L2 = l2n ? l2 / l2n : 0;

  // L3 derivatives
  let l3 = 0, l3n = 0;
  if (ctx.funds.fundingAnnual !== null) { l3 += (ctx.funds.fundingAnnual < -5 ? 1 : ctx.funds.fundingAnnual > 5 ? -1 : 0); l3n++; }
  if (ctx.funds.oiChange !== null) { const up = ctx.ind && ctx.ind.price > ctx.ind.ema21; l3 += sig(up ? ctx.funds.oiChange > 1 : ctx.funds.oiChange < -1); l3n++; }
  if (ctx.funds.globalLS !== null) { l3 += (ctx.funds.globalLS < 0.8 ? 1 : ctx.funds.globalLS > 2 ? -1 : 0); l3n++; }
  if (ctx.trades && ctx.trades.ratio !== null) { l3 += sig(ctx.trades.ratio > 1.5 ? true : ctx.trades.ratio < 0.7 ? false : null); if (ctx.trades.ratio > 1.5 || ctx.trades.ratio < 0.7) l3n++; }
  const L3 = l3n ? l3 / l3n : 0;

  // L4 technical
  const L4 = clamp(confluences, -1, 1);

  // L5 correlation
  let l5 = 0, l5n = 0;
  if (m.dxy && m.dxy.changePct !== null) { l5 += (m.dxy.changePct < -0.12 ? 1 : m.dxy.changePct > 0.12 ? -1 : 0); l5n++; }
  if (m.tnx && m.tnx.changePct !== null) { l5 += (m.tnx.changePct < -0.05 ? 1 : m.tnx.changePct > 0.05 ? -1 : 0); l5n++; }
  if (m.vix && m.vix.changePct !== null) { l5 += (m.vix.changePct > 3 ? 1 : m.vix.changePct < -3 ? -1 : 0); l5n++; }
  const L5 = l5n ? l5 / l5n : 0;

  const total = L1 * 0.30 + L2 * 0.25 + L3 * 0.20 + L4 * 0.15 + L5 * 0.10;
  const tcs100 = clamp(((total + 1) / 2) * 100, 0, 100);

  return {
    tfScores, confluence: confluences,
    L1: (L1 + 1) / 2 * 10, L2: (L2 + 1) / 2 * 10, L3: (L3 + 1) / 2 * 10, L4: (L4 + 1) / 2 * 10, L5: (L5 + 1) / 2 * 10,
    total: clamp(total, -1, 1), tcs100,
    bias: tcs100 > 65 ? 'BULLISH' : tcs100 < 35 ? 'BEARISH' : 'NEUTRAL'
  };
}

// ---------- gates ----------
function checkGates(ctx, sig, depthNow, priceAgeMs) {
  const i = ctx.ind;
  const g = { gate1: priceAgeMs < 30000, gate2: true, gate3: true, gate4: true, gate5: true, gate6: true };
  const notes = {};
  if (i) {
    g.gate2 = i.atrPct < 1.2 && (!depthNow || depthNow.spread < 0.30) && i.rvol !== null && i.rvol >= 0.5;
    notes.g2 = `ATR% ${i.atrPct ? i.atrPct.toFixed(2) : 'n/a'} | spread $${depthNow ? depthNow.spread.toFixed(2) : 'n/a'} | RVOL ${i.rvol !== null ? i.rvol.toFixed(2) : 'n/a'}`;
  }
  if (sig) {
    const g3a = sig.rr1 >= 1.5;
    const g3b = sig.votesMax >= 5;
    const g3c = sig.evPct > 0.05;
    const g3d = sig.d === 1 ? sig.tcs >= 60 : sig.tcs <= 40;
    g.gate3 = g3a && g3b && g3c;
    notes.g3 = `RR ${sig.rr1.toFixed(1)} | votes ${sig.votesMax} | EV ${sig.evPct.toFixed(2)}% | TCS ${sig.tcs.toFixed(0)}`;
    g.gate4 = sig.riskPct <= 2 && sig.leverage <= 20 && sig.risk <= 15;
    notes.g4 = `risk ${sig.riskPct.toFixed(2)}% | lev ${sig.leverage.toFixed(1)}× | stop $${sig.risk.toFixed(2)}`;
  }
  const dm = depthNow;
  if (dm) {
    const against = sig && ((sig.d === 1 && dm.imbalance < -25) || (sig.d === -1 && dm.imbalance > 25));
    g.gate5 = !against;
    notes.g5 = `OB ${dm.imbalance.toFixed(1)}%`;
  }
  const m = ctx.macro || {};
  if (sig && m.dxy && m.dxy.changePct !== null) {
    const dxyAgainst = (sig.d === 1 && m.dxy.changePct > 0.3) || (sig.d === -1 && m.dxy.changePct < -0.3);
    const tnxAgainst = (sig.d === 1 && m.tnx && m.tnx.changePct !== null && m.tnx.changePct > 0.08) || (sig.d === -1 && m.tnx && m.tnx.changePct !== null && m.tnx.changePct < -0.08);
    g.gate6 = !dxyAgainst && !tnxAgainst;
    notes.g6 = `DXY ${m.dxy.changePct.toFixed(2)}% | 10Y ${m.tnx && m.tnx.changePct !== null ? m.tnx.changePct.toFixed(2) + '%' : 'n/a'}`;
  }
  return { gates: g, notes };
}

// ---------- build the final signal ----------
function buildSignal(ctx, votes) {
  const ind = ctx.ind;
  const lay = layers(ctx, votes);

  const longVotes = votes.filter((v) => v.d === 1);
  const shortVotes = votes.filter((v) => v.d === -1);
  const neutralVotes = votes.filter((v) => v.d === 0);
  const wLong = longVotes.reduce((s, v) => s + v.conf, 0);
  const wShort = shortVotes.reduce((s, v) => s + v.conf, 0);
  const directional = longVotes.length + shortVotes.length;
  const votesMax = Math.max(longVotes.length, shortVotes.length);
  const winner = wLong > wShort ? 1 : wShort > wLong ? -1 : (longVotes.length >= shortVotes.length ? 1 : -1);

  let d = 0;
  let winningVotes = [];
  if (votesMax >= 5 && directional > 0) {
    const byCount = longVotes.length >= shortVotes.length ? 1 : -1;
    d = wLong === wShort ? byCount : winner;
    winningVotes = d === 1 ? longVotes : shortVotes;
  }
  const confPct = directional > 0 ? (votesMax / directional) * 100 : 0;
  const winShare = directional > 0 ? votesMax / directional : 0;

  // mode-cluster entry / sl / tp from winning agents' positions
  let entryCl = null, slCl = null, tp1Cl = null, tp2Cl = null, tp3Cl = null;
  if (d !== 0 && ind) {
    const atr = ind.atr14;
    const posArr = winningVotes.filter((v) => v.pos).map((v) => ({ v: v.pos.entry, w: v.conf }));
    entryCl = modeCluster(posArr, Math.max(atr * 0.5, 0.5));
    const e = entryCl ? entryCl.val : winningVotes[0].pos.entry;
    slCl = modeCluster(winningVotes.filter((v) => v.pos).map((v) => ({ v: v.pos.sl, w: v.conf })), atr);
    tp1Cl = modeCluster(winningVotes.filter((v) => v.pos).map((v) => ({ v: v.pos.tp1, w: v.conf })), atr * 1.2);
    tp2Cl = modeCluster(winningVotes.filter((v) => v.pos).map((v) => ({ v: v.pos.tp2, w: v.conf })), atr * 1.5);
    tp3Cl = modeCluster(winningVotes.filter((v) => v.pos).map((v) => ({ v: v.pos.tp3, w: v.conf })), atr * 2);
  }

  const entry = entryCl ? Math.round(entryCl.val * 100) / 100 : null;
  const sl = slCl ? Math.round(slCl.val * 100) / 100 : null;
  const tp1 = tp1Cl ? Math.round(tp1Cl.val * 100) / 100 : null;
  const tp2 = tp2Cl ? Math.round(tp2Cl.val * 100) / 100 : null;
  const tp3 = tp3Cl ? Math.round(tp3Cl.val * 100) / 100 : null;

  // position sizing (defaults $10,000 equity, 1% risk)
  const equity = 10000, riskPct = 1.0;
  const risk = entry !== null && sl !== null ? Math.abs(entry - sl) : 0;
  const riskAmt = equity * (riskPct / 100);
  const sizeOz = risk > 0 ? riskAmt / risk : 0;
  const posUsd = sizeOz * entry;
  const leverage = equity > 0 ? posUsd / equity : 0;

  // EV
  const sigStrength = confPct;
  const pWin = Math.min(0.75, 0.45 + (sigStrength / 100) * 0.15 + winShare * 0.05);
  const avgProfitR = 0.5 * 1.5 + 0.3 * 2.5 + 0.2 * 4.0; // 2.3R
  const evPerOz = risk * (pWin * avgProfitR - (1 - pWin));
  const evPct = entry > 0 ? (evPerOz / entry) * 100 : 0;

  const rr1 = risk > 0 && entry !== null && tp1 !== null ? Math.abs(tp1 - entry) / risk : 0;
  const danger = entry !== null && sl !== null ? (d === 1 ? entry - risk * 0.75 : entry + risk * 0.75) : null;
  const warning = entry !== null && sl !== null ? (d === 1 ? entry - risk * 0.5 : entry + risk * 0.5) : null;

  const top3 = winningVotes.slice().sort((a, b) => b.conf - a.conf).slice(0, 3);
  const trigger = d === 0 ? 'NO TRADE — wait for ≥5 aligned agent votes' : (
    d === 1
      ? `Enter LONG on pullback toward $${Math.round(entry * 100) / 100} when 1m RSI bounces above 40 AND DXY not rising >0.3%`
      : `Enter SHORT on rally toward $${Math.round(entry * 100) / 100} when 1m RSI rejects below 60 AND DXY not falling >0.3%`
  );
  const rationale = top3.length ? top3.map((v) => `#${v.id} ${v.name} — ${v.reason}`).join(' | ') : 'Low-conviction conditions';

  const signal = {
    d, direction: d === 1 ? 'LONG' : d === -1 ? 'SHORT' : 'NO TRADE',
    status: d === 0 ? 'NO TRADE' : 'ACTIVE',
    entry, sl, tp1, tp2, tp3, risk, trigger, rationale,
    entryLo: entryCl ? Math.round((entryCl.val - Math.max(ind ? ind.atr14 * 0.25 : 0.5, 0.5)) * 100) / 100 : null,
    entryHi: entryCl ? Math.round((entryCl.val + Math.max(ind ? ind.atr14 * 0.25 : 0.5, 0.5)) * 100) / 100 : null,
    entryVotes: entryCl ? entryCl.cnt : 0, slVotes: slCl ? slCl.cnt : 0,
    tp1Votes: tp1Cl ? tp1Cl.cnt : 0, tp2Votes: tp2Cl ? tp2Cl.cnt : 0, tp3Votes: tp3Cl ? tp3Cl.cnt : 0,
    rr1, rr2: 2.5, rr3: 4.0,
    danger, warning,
    confPct: Math.round(confPct),
    votesMax, votesTotal: directional, longVotes: longVotes.length, shortVotes: shortVotes.length, neutralVotes: neutralVotes.length,
    wLong: Math.round(wLong), wShort: Math.round(wShort),
    tcs: lay.tcs100, confluence: lay.confluence, bias: lay.bias,
    L1: lay.L1.toFixed(1), L2: lay.L2.toFixed(1), L3: lay.L3.toFixed(1), L4: lay.L4.toFixed(1), L5: lay.L5.toFixed(1),
    equity, riskPct, riskAmt, sizeOz: Math.round(sizeOz * 100) / 100, posUsd: Math.round(posUsd), leverage: Math.round(leverage * 10) / 10,
    pWin: Math.round(pWin * 100), evPct, evUsd: evPerOz * sizeOz,
    topAgents: winningVotes.slice().sort((a, b) => b.conf - a.conf).slice(0, 3).map((v) => ({ id: v.id, name: v.name, conf: v.conf, reason: v.reason }))
  };
  return signal;
}

module.exports = { AGENTS, tfScore, TF_WEIGHTS, buildContext, buildPosition, modeCluster, runAgents, layers, buildSignal, checkGates };
