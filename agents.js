'use strict';

// ============================================================================
// 50 LLM SCALPER AGENTS — each an independent expert brain that votes
// LONG / SHORT / NEUTRAL with a confidence, an entry method, and rationale.
// Majority vote (weighted) decides the final signal.
// ============================================================================

const safe = (x) => (x === undefined || x === null || Number.isNaN(x) ? null : x);
const N = () => ({ d: 0, conf: 0, reason: 'insufficient data', method: 'price' });

function makeAgents() {
  const AG = [];
  const add = (id, name, cat, fn) => AG.push({ id, name, cat, fn });

  // =====================================================================
  // TREND (12)
  // =====================================================================
  add(1, 'EMA Trend Rider', 'TREND', (c) => {
    const i = c.ind; if (!i) return N();
    const d = i.price > i.ema8 && i.ema8 > i.ema21 ? 1 : i.price < i.ema8 && i.ema8 < i.ema21 ? -1 : 0;
    const conf = Math.min(90, 40 + Math.abs(i.ema21Slope) * 80);
    return { d, conf: d === 0 ? 0 : conf, reason: `Price ${i.price.toFixed(2)} vs EMA8 ${i.ema8.toFixed(2)} / EMA21 ${i.ema21.toFixed(2)}`, method: 'ema21' };
  });
  add(2, 'EMA Stack 21/50/200', 'TREND', (c) => {
    const i = c.ind; if (!i) return N();
    const bull = i.price > i.ema21 && i.ema21 > i.ema50 && i.ema50 > i.ema200;
    const bear = i.price < i.ema21 && i.ema21 < i.ema50 && i.ema50 < i.ema200;
    return { d: bull ? 1 : bear ? -1 : 0, conf: bull || bear ? 82 : 0, reason: `Full-stack ${bull ? 'bullish' : bear ? 'bearish' : 'mixed'} (21>50>200)`, method: 'ema21' };
  });
  add(3, 'MACD Momentum Cross', 'TREND', (c) => {
    const i = c.ind; if (!i) return N();
    const rising = i.macdHist > 0 && i.macdHist > i.macdHistPrev;
    const falling = i.macdHist < 0 && i.macdHist < i.macdHistPrev;
    const d = rising ? 1 : falling ? -1 : 0;
    return { d, conf: d === 0 ? 0 : 70 + Math.min(25, Math.abs(i.macdHist) / (i.atr14 * 0.3) * 10), reason: `MACD hist ${i.macdHist.toFixed(3)} ${rising ? 'rising' : falling ? 'falling' : 'flat'}`, method: 'price' };
  });
  add(4, 'ADX Trend Strength', 'TREND', (c) => {
    const i = c.ind; if (!i) return N();
    if (i.adx < 20) return { d: 0, conf: 0, reason: `ADX ${i.adx.toFixed(1)} < 20 — no trend`, method: 'price' };
    const d = i.diPlus > i.diMinus ? 1 : -1;
    const conf = Math.min(92, 40 + (i.adx - 20) * 2.2);
    return { d, conf, reason: `ADX ${i.adx.toFixed(1)} ${d === 1 ? '+DI' : '-DI'} dominant`, method: 'ema21' };
  });
  add(5, 'Supertrend Follower', 'TREND', (c) => {
    const i = c.ind; if (!i) return N();
    const d = i.supertrendDir === 1 ? 1 : -1;
    return { d, conf: i.supertrendDir === 1 ? 72 : 72, reason: `Supertrend ${d === 1 ? 'BULL' : 'BEAR'} @ $${i.supertrend.toFixed(2)}`, method: 'price' };
  });
  add(6, 'Ichimoku Cloud Trend', 'TREND', (c) => {
    const i = c.ind; if (!i || i.ichi.cloudUp === null) return N();
    const up = i.price > i.ichi.cloudUp;
    const dn = i.price < i.ichi.cloudDn;
    return { d: up ? 1 : dn ? -1 : 0, conf: up || dn ? 75 : 0, reason: `Price ${up ? 'above' : dn ? 'below' : 'inside'} cloud [${i.ichi.cloudDn.toFixed(1)},${i.ichi.cloudUp.toFixed(1)}]`, method: 'ema21' };
  });
  add(7, 'Parabolic SAR Trail', 'TREND', (c) => {
    const i = c.ind; if (!i) return N();
    const d = i.psar < i.price ? 1 : -1;
    return { d, conf: Math.abs(i.price - i.psar) > i.atr14 * 0.8 ? 68 : 45, reason: `PSAR ${d === 1 ? 'below (bull trail)' : 'above (bear trail)'}`, method: 'price' };
  });
  add(8, 'Donchian Breakout', 'TREND', (c) => {
    const i = c.ind; if (!i) return N();
    if (i.price > i.dcUp) return { d: 1, conf: 78, reason: `Breakout ABOVE 20-bar high $${i.dcUp.toFixed(2)}`, method: 'dc' };
    if (i.price < i.dcLo) return { d: -1, conf: 78, reason: `Breakout BELOW 20-bar low $${i.dcLo.toFixed(2)}`, method: 'dc' };
    return { d: 0, conf: 0, reason: `Inside Donchian [${i.dcLo.toFixed(2)}..${i.dcUp.toFixed(2)}]`, method: 'dc' };
  });
  add(9, 'Moving Ribbon Drift', 'TREND', (c) => {
    const i = c.ind; if (!i) return N();
    const d = i.ema8Slope > 0 && i.ema21Slope > 0 ? 1 : i.ema8Slope < 0 && i.ema21Slope < 0 ? -1 : 0;
    const conf = d === 0 ? 0 : 55 + Math.min(40, Math.abs(i.ema8Slope) * 120);
    return { d, conf, reason: `EMA8 slope ${i.ema8Slope.toFixed(3)} / EMA21 slope ${i.ema21Slope.toFixed(3)}`, method: 'ema21' };
  });
  add(10, 'Golden Cross Hunter', 'TREND', (c) => {
    const h = c.inds['4h']; const i = c.ind; if (!h || !i) return N();
    const gc = h.ema50 > h.ema200 && i.ema50 > i.ema200 && i.ema21 > i.ema50;
    const dc = h.ema50 < h.ema200 && i.ema50 < i.ema200 && i.ema21 < i.ema50;
    return { d: gc ? 1 : dc ? -1 : 0, conf: gc || dc ? 80 : 0, reason: gc ? '4H golden-cross regime' : dc ? '4H death-cross regime' : 'cross unclear', method: 'ema21' };
  });
  add(11, 'Higher-TF Trend (4H/1D)', 'TREND', (c) => {
    const h = c.inds['4h'], dd = c.inds['1d']; if (!h || !dd) return N();
    let score = 0;
    if (h.alignment === 'BULLISH') score += 1; if (h.alignment === 'BEARISH') score -= 1;
    if (dd.alignment === 'BULLISH') score += 1; if (dd.alignment === 'BEARISH') score -= 1;
    if (h.supertrendDir === 1) score += 1; if (h.supertrendDir === -1) score -= 1;
    const d = score >= 2 ? 1 : score <= -2 ? -1 : 0;
    return { d, conf: d === 0 ? 0 : 60 + Math.abs(score) * 10, reason: `4H+1D trend score ${score}`, method: 'ema21' };
  });
  add(12, 'Trend Continuation Filter', 'TREND', (c) => {
    const h = c.inds['1h']; const i = c.ind; if (!h || !i) return N();
    const htf = h.alignment === 'BULLISH' ? 1 : h.alignment === 'BEARISH' ? -1 : 0;
    if (htf === 0) return { d: 0, conf: 0, reason: 'HTF neutral', method: 'ema21' };
    const pullback = htf === 1 ? i.price < i.ema21 && i.price > i.ema21 - i.atr14 : i.price > i.ema21 && i.price < i.ema21 + i.atr14;
    if (pullback) return { d: htf, conf: 76, reason: `${htf === 1 ? 'Bull' : 'Bear'} HTF, price pulled back to EMA21`, method: 'ema21' };
    return { d: htf, conf: 50, reason: `HTF ${htf === 1 ? 'bullish' : 'bearish'}`, method: 'ema21' };
  });

  // =====================================================================
  // MOMENTUM (10)
  // =====================================================================
  add(13, 'RSI Momentum', 'MOMENTUM', (c) => {
    const i = c.ind; if (!i || i.rsi === null) return N();
    const d = i.rsi > 55 ? 1 : i.rsi < 45 ? -1 : 0;
    return { d, conf: Math.min(85, Math.abs(i.rsi - 50) * 1.6), reason: `RSI ${i.rsi.toFixed(1)}`, method: 'price' };
  });
  add(14, 'RSI Divergence Hunter', 'MOMENTUM', (c) => {
    const i = c.ind; if (!i || !i.rsiDiv) return N();
    const d = i.rsiDiv === 'BULLISH' ? 1 : -1;
    return { d, conf: 85, reason: `RSI ${i.rsiDiv} divergence (price/RSI)` , method: 'fib' };
  });
  add(15, 'Stochastic Cross', 'MOMENTUM', (c) => {
    const i = c.ind; if (!i || i.stK === null || i.stD === null) return N();
    const prevK = c.indPrev ? c.indPrev.stK : null;
    if (prevK === null) return N();
    if (i.stK > i.stD && prevK <= prevKD(c) && i.stK > 20) return { d: 1, conf: i.stK < 40 ? 80 : 62, reason: `%K cross above %D @ ${i.stK.toFixed(1)}`, method: 'price' };
    if (i.stK < i.stD && prevK >= prevKD(c) && i.stK < 80) return { d: -1, conf: i.stK > 60 ? 80 : 62, reason: `%K cross below %D @ ${i.stK.toFixed(1)}`, method: 'price' };
    return { d: i.stK > 50 ? 1 : -1, conf: 35, reason: `Stoch %K ${i.stK.toFixed(1)} / %D ${i.stD.toFixed(1)}`, method: 'price' };
    function prevKD(cc) { return cc.indPrev ? cc.indPrev.stD : null; }
  });
  add(16, 'CCI Commodity Flow', 'MOMENTUM', (c) => {
    const i = c.ind; if (!i || i.cci === null) return N();
    const d = i.cci > 100 ? 1 : i.cci < -100 ? -1 : 0;
    return { d, conf: Math.min(85, Math.abs(i.cci) / 200 * 100), reason: `CCI ${i.cci.toFixed(1)}`, method: 'price' };
  });
  add(17, 'Williams %R Osc', 'MOMENTUM', (c) => {
    const i = c.ind; if (!i || i.wr === null) return N();
    const d = i.wr < -80 ? 1 : i.wr > -20 ? -1 : 0;
    return { d, conf: Math.abs(i.wr) > 80 ? 75 : Math.abs(i.wr) < 20 ? 75 : 0, reason: `%R ${i.wr.toFixed(1)}`, method: 'bb' };
  });
  add(18, 'ROC Velocity', 'MOMENTUM', (c) => {
    const i = c.ind; if (!i || i.roc === null) return N();
    const d = i.roc > 0.06 ? 1 : i.roc < -0.06 ? -1 : 0;
    return { d, conf: Math.min(80, Math.abs(i.roc) * 60), reason: `ROC ${i.roc.toFixed(3)}%`, method: 'price' };
  });
  add(19, 'Momentum Composite', 'MOMENTUM', (c) => {
    const i = c.ind; if (!i || i.momentumScore === null) return N();
    const s = i.momentumScore;
    const d = s >= 7 ? 1 : s <= 3 ? -1 : 0;
    return { d, conf: (Math.abs(s - 5) / 5) * 100, reason: `Composite momentum ${s.toFixed(1)}/10`, method: 'price' };
  });
  add(20, 'RSI Bullish-Zone Pullback', 'MOMENTUM', (c) => {
    const i = c.ind; if (!i || i.rsi === null) return N();
    if (i.alignment === 'BULLISH' && i.rsi > 40 && i.rsi < 60) return { d: 1, conf: 74, reason: `Bull trend, RSI ${i.rsi.toFixed(1)} in healthy 40-60 zone`, method: 'ema21' };
    if (i.alignment === 'BEARISH' && i.rsi > 40 && i.rsi < 60) return { d: -1, conf: 74, reason: `Bear trend, RSI ${i.rsi.toFixed(1)} in 40-60 zone`, method: 'ema21' };
    return { d: 0, conf: 0, reason: `RSI ${i.rsi.toFixed(1)} outside pullback zone`, method: 'price' };
  });
  add(21, 'MACD Histogram Surge', 'MOMENTUM', (c) => {
    const i = c.ind; if (!i || i.macdHist === null) return N();
    const accel = i.macdHist - i.macdHistPrev;
    const d = accel > 0 && i.macdHist > 0 ? 1 : accel < 0 && i.macdHist < 0 ? -1 : 0;
    return { d, conf: Math.min(85, Math.abs(accel) / (i.atr14 * 0.05) * 30), reason: `Hist accel ${accel.toFixed(4)}`, method: 'price' };
  });
  add(22, 'Price vs Momentum Confirm', 'MOMENTUM', (c) => {
    const i = c.ind; if (!i || i.roc === null) return N();
    const up = i.close > i.ema8 && i.roc > 0;
    const dn = i.close < i.ema8 && i.roc < 0;
    return { d: up ? 1 : dn ? -1 : 0, conf: up || dn ? 70 : 0, reason: `Price${up ? '↑' : dn ? '↓' : '—'} with ROC ${i.roc.toFixed(2)}%`, method: 'price' };
  });

  // =====================================================================
  // MEAN REVERSION (8)
  // =====================================================================
  add(23, 'Bollinger Reversion', 'MEANREV', (c) => {
    const i = c.ind; if (!i || i.bbUp === null) return N();
    if (i.close < i.bbLo) return { d: 1, conf: 78, reason: `Close below BB lower $${i.bbLo.toFixed(2)} (pctB ${i.pctB.toFixed(2)})`, method: 'bb' };
    if (i.close > i.bbUp) return { d: -1, conf: 78, reason: `Close above BB upper $${i.bbUp.toFixed(2)} (pctB ${i.pctB.toFixed(2)})`, method: 'bb' };
    return { d: 0, conf: 0, reason: `Inside bands (pctB ${i.pctB.toFixed(2)})`, method: 'bb' };
  });
  add(24, 'VWAP Mean Reversion', 'MEANREV', (c) => {
    const i = c.ind; if (!i || i.vwap === null || i.vwapSd === null) return N();
    const d2 = i.vwap + 2 * i.vwapSd, d1 = i.vwap + i.vwapSd;
    const u2 = i.vwap - 2 * i.vwapSd, u1 = i.vwap - i.vwapSd;
    if (i.close > d2) return { d: -1, conf: 84, reason: `Extended +2σ above VWAP $${i.vwap.toFixed(2)}`, method: 'vwap' };
    if (i.close < u2) return { d: 1, conf: 84, reason: `Extended -2σ below VWAP $${i.vwap.toFixed(2)}`, method: 'vwap' };
    if (i.close > d1 && i.close < d2) return { d: -1, conf: 55, reason: `+1σ extension`, method: 'vwap' };
    if (i.close < u1 && i.close > u2) return { d: 1, conf: 55, reason: `-1σ extension`, method: 'vwap' };
    return { d: 0, conf: 0, reason: `Near VWAP $${i.vwap.toFixed(2)}`, method: 'vwap' };
  });
  add(25, 'Keltner Channel Mean', 'MEANREV', (c) => {
    const i = c.ind; if (!i || i.kcUp === null) return N();
    if (i.close > i.kcUp) return { d: -1, conf: 68, reason: `Close above KC upper $${i.kcUp.toFixed(2)}`, method: 'kc' };
    if (i.close < i.kcLo) return { d: 1, conf: 68, reason: `Close below KC lower $${i.kcLo.toFixed(2)}`, method: 'kc' };
    return { d: 0, conf: 0, reason: 'Inside KC', method: 'kc' };
  });
  add(26, 'BB Squeeze Breakout', 'MEANREV', (c) => {
    const i = c.ind; if (!i) return N();
    if (i.squeeze) {
      const d = i.close > i.dcMid ? 1 : i.close < i.dcMid ? -1 : 0;
      return { d, conf: 72, reason: `BB/KC squeeze — coiled toward ${d === 1 ? 'upside' : 'downside'} (Donchian mid $${i.dcMid.toFixed(2)})`, method: 'dc' };
    }
    return { d: 0, conf: 0, reason: 'No squeeze (BB wider than KC)', method: 'dc' };
  });
  add(27, 'Extreme RSI Reversion', 'MEANREV', (c) => {
    const i = c.ind; if (!i || i.rsi === null) return N();
    if (i.rsi < 20) return { d: 1, conf: 88, reason: `RSI ${i.rsi.toFixed(1)} EXTREME OVERSOLD`, method: 'bb' };
    if (i.rsi > 80) return { d: -1, conf: 88, reason: `RSI ${i.rsi.toFixed(1)} EXTREME OVERBOUGHT`, method: 'bb' };
    return { d: 0, conf: 0, reason: `RSI ${i.rsi.toFixed(1)} not extreme`, method: 'bb' };
  });
  add(28, 'Bollinger %B Sniper', 'MEANREV', (c) => {
    const i = c.ind; if (!i || i.pctB === null) return N();
    if (i.pctB < 0.05) return { d: 1, conf: 76, reason: `%B ${i.pctB.toFixed(2)} near lower band`, method: 'bb' };
    if (i.pctB > 0.95) return { d: -1, conf: 76, reason: `%B ${i.pctB.toFixed(2)} near upper band`, method: 'bb' };
    return { d: 0, conf: 0, reason: `%B ${i.pctB.toFixed(2)}`, method: 'bb' };
  });
  add(29, 'Donchian Range Mean', 'MEANREV', (c) => {
    const i = c.ind; if (!i) return N();
    const range = i.dcUp - i.dcLo;
    if (range > 0 && i.atr14 > 0 && range / i.atr14 < 1.8 && i.adx < 25) {
      const d = i.close < i.dcMid - range * 0.15 ? 1 : i.close > i.dcMid + range * 0.15 ? -1 : 0;
      return { d, conf: d === 0 ? 0 : 65, reason: `Range mean-reversion, range ${range.toFixed(2)} vs ATR ${i.atr14.toFixed(2)}`, method: 'swing' };
    }
    return { d: 0, conf: 0, reason: 'Range too wide / trending', method: 'swing' };
  });
  add(30, 'FVG Gap Filler', 'MEANREV', (c) => {
    const i = c.ind; if (!i || !i.fvg) return N();
    const gap = i.fvg.top - i.fvg.bottom;
    const price = i.close;
    const d = i.fvg.type === 'BULLISH' && price < i.fvg.mid ? 1 : i.fvg.type === 'BEARISH' && price > i.fvg.mid ? -1 : 0;
    return { d, conf: d === 0 ? 0 : 66, reason: `${i.fvg.type} FVG [${i.fvg.bottom.toFixed(2)}..${i.fvg.top.toFixed(2)}] — fill to mid $${i.fvg.mid.toFixed(2)}`, method: 'price' };
  });

  // =====================================================================
  // VOLUME & ORDER FLOW (8)
  // =====================================================================
  add(31, 'OBV Trend Confirmation', 'FLOW', (c) => {
    const i = c.ind; if (!i || i.obvSlope === undefined) return N();
    const d = i.obvSlope > 0 && i.close > i.ema21 ? 1 : i.obvSlope < 0 && i.close < i.ema21 ? -1 : 0;
    return { d, conf: d === 0 ? 0 : 64, reason: `OBV slope ${i.obvSlope.toFixed(1)} ${d === 1 ? 'confirming buyers' : 'confirming sellers'}`, method: 'price' };
  });
  add(32, 'MFI Money Flow', 'FLOW', (c) => {
    const i = c.ind; if (!i || i.mfi === null) return N();
    const d = i.mfi > 80 ? -1 : i.mfi < 20 ? 1 : 0;
    return { d, conf: d === 0 ? 0 : 72, reason: `MFI ${i.mfi.toFixed(1)} ${d === 1 ? 'oversold w/ volume' : 'overbought w/ volume'}`, method: 'price' };
  });
  add(33, 'RVOL Volume Surge', 'FLOW', (c) => {
    const i = c.ind; if (!i || i.rvol === null) return N();
    if (i.rvol > 2) {
      const d = i.close > i.open ? 1 : -1;
      return { d, conf: 70, reason: `RVOL ${i.rvol.toFixed(2)}× ${d === 1 ? 'bullish' : 'bearish'} bar`, method: 'price' };
    }
    return { d: 0, conf: 0, reason: `RVOL ${i.rvol.toFixed(2)}× — no surge`, method: 'price' };
  });
  add(34, 'Order Book Imbalance', 'FLOW', (c) => {
    const dm = c.depth; if (!dm) return N();
    if (dm.imbalance > 20) return { d: 1, conf: Math.min(90, dm.imbalance * 1.2), reason: `Orderbook +${dm.imbalance.toFixed(1)}% bid-heavy (${dm.bidSum.toFixed(1)} vs ${dm.askSum.toFixed(1)})`, method: 'price' };
    if (dm.imbalance < -20) return { d: -1, conf: Math.min(90, Math.abs(dm.imbalance) * 1.2), reason: `Orderbook ${dm.imbalance.toFixed(1)}% ask-heavy`, method: 'price' };
    return { d: 0, conf: 0, reason: `Orderbook balanced (${dm.imbalance.toFixed(1)}%)`, method: 'price' };
  });
  add(35, 'Taker Buy/Sell Flow', 'FLOW', (c) => {
    const t = c.trades; if (!t) return N();
    const ratio = t.ratio;
    if (ratio !== null && ratio > 1.5) return { d: 1, conf: Math.min(85, ratio * 15), reason: `Aggressive buying ${ratio.toFixed(2)}:1 (taker)`, method: 'price' };
    if (ratio !== null && ratio < 0.7) return { d: -1, conf: Math.min(85, (1 / ratio) * 10), reason: `Aggressive selling ${(1 / ratio).toFixed(2)}:1 (taker)`, method: 'price' };
    return { d: 0, conf: 0, reason: `Taker B/S ${ratio !== null ? ratio.toFixed(2) : 'n/a'}`, method: 'price' };
  });
  add(36, 'Delta Aggressor', 'FLOW', (c) => {
    const i = c.ind; if (!i) return N();
    const d = i.delta > 0 ? 1 : i.delta < 0 ? -1 : 0;
    const scale = Math.abs(i.delta) / Math.max(1, i.vol);
    return { d, conf: Math.min(80, 30 + scale * 60), reason: `Bar delta ${i.delta.toFixed(2)} (taker buy − sell)`, method: 'price' };
  });
  add(37, 'CVD Momentum', 'FLOW', (c) => {
    const i = c.ind; if (!i) return N();
    const ser = c.seriesCvd; if (!ser || ser.length < 21) return N();
    const cvdNow = ser[ser.length - 1], cvdPrev = ser[ser.length - 21];
    const d = cvdNow > cvdPrev ? 1 : cvdNow < cvdPrev ? -1 : 0;
    return { d, conf: d === 0 ? 0 : 62, reason: `CVD 20-bar slope ${d === 1 ? 'accumulating longs' : 'accumulating shorts'}`, method: 'price' };
  });
  add(38, 'Volume-Price Divergence', 'FLOW', (c) => {
    const i = c.ind; if (!i || i.rvol === null) return N();
    const upMove = i.close > i.ema8 && i.rvol < 0.85;
    const dnMove = i.close < i.ema8 && i.rvol < 0.85;
    if (upMove) return { d: -1, conf: 58, reason: `Rally on weak volume ${i.rvol.toFixed(2)}× — suspect`, method: 'price' };
    if (dnMove) return { d: 1, conf: 58, reason: `Sell-off on weak volume ${i.rvol.toFixed(2)}× — capitulation risk`, method: 'price' };
    return { d: 0, conf: 0, reason: `Volume confirms price (RVOL ${i.rvol.toFixed(2)}×)`, method: 'price' };
  });

  // =====================================================================
  // STRUCTURE / SMC (7)
  // =====================================================================
  add(39, 'BOS Break Hunter', 'SMC', (c) => {
    const i = c.ind; if (!i) return N();
    if (i.bosUp) return { d: 1, conf: 82, reason: `BOS: closed above last swing high $${i.lastH !== null ? i.lastH.toFixed(2) : 'n/a'}`, method: 'swing' };
    if (i.bosDn) return { d: -1, conf: 82, reason: `BOS: closed below last swing low $${i.lastL !== null ? i.lastL.toFixed(2) : 'n/a'}`, method: 'swing' };
    return { d: 0, conf: 0, reason: 'No BOS', method: 'swing' };
  });
  add(40, 'FVG Imbalance Retest', 'SMC', (c) => {
    const i = c.ind; if (!i || !i.fvg) return N();
    const d = i.fvg.type === 'BULLISH' ? 1 : -1;
    return { d, conf: 70, reason: `${i.fvg.type} imbalance zone, price retracing toward $${i.fvg.mid.toFixed(2)}`, method: 'price' };
  });
  add(41, 'Order Block Sniper', 'SMC', (c) => {
    const i = c.ind; if (!i || !i.orderBlocks || !i.orderBlocks.length) return N();
    const recent = i.orderBlocks[i.orderBlocks.length - 1];
    if (recent.type === 'BULLISH' && i.close < recent.top) return { d: 1, conf: 72, reason: `Bullish OB [${recent.bottom.toFixed(2)}..${recent.top.toFixed(2)}] above price`, method: 'ob' };
    if (recent.type === 'BEARISH' && i.close > recent.bottom) return { d: -1, conf: 72, reason: `Bearish OB [${recent.bottom.toFixed(2)}..${recent.top.toFixed(2)}] below price`, method: 'ob' };
    return { d: 0, conf: 0, reason: 'No actionable order block', method: 'ob' };
  });
  add(42, 'Liquidity Sweep Hunter', 'SMC', (c) => {
    const i = c.ind; if (!i) return N();
    const atr = i.atr14;
    if (i.ssl !== null && Math.abs(i.close - i.ssl) < atr * 0.35) return { d: 1, conf: 80, reason: `Price at sell-side liquidity $${i.ssl.toFixed(2)} — sweep long`, method: 'liq' };
    if (i.bsl !== null && Math.abs(i.bsl - i.close) < atr * 0.35) return { d: -1, conf: 80, reason: `Price at buy-side liquidity $${i.bsl.toFixed(2)} — sweep short`, method: 'liq' };
    return { d: 0, conf: 0, reason: `No liquidity proximity (BSL ${i.bsl !== null ? '$' + i.bsl.toFixed(2) : 'n/a'})`, method: 'liq' };
  });
  add(43, 'Market Structure Trend', 'SMC', (c) => {
    const i = c.ind; if (!i) return N();
    const d = i.struct.includes('UP') ? 1 : i.struct.includes('DOWN') ? -1 : 0;
    return { d, conf: d === 0 ? 0 : 70, reason: `Structure: ${i.struct}`, method: 'swing' };
  });
  add(44, 'Equal Highs/Lows Trap', 'SMC', (c) => {
    const i = c.ind; if (!i) return N();
    const atr = i.atr14;
    if (i.ssl !== null && Math.abs(i.close - i.ssl) < atr * 0.6) return { d: 1, conf: 74, reason: `Near equal-lows SSL $${i.ssl.toFixed(2)} — stop-hunt long`, method: 'liq' };
    if (i.bsl !== null && Math.abs(i.bsl - i.close) < atr * 0.6) return { d: -1, conf: 74, reason: `Near equal-highs BSL $${i.bsl.toFixed(2)} — stop-hunt short`, method: 'liq' };
    return { d: 0, conf: 0, reason: 'No EQH/EQL proximity', method: 'liq' };
  });
  add(45, 'ICT Killzone Radar', 'SMC', (c) => {
    const h = new Date().getUTCHours(), m = new Date().getUTCMinutes();
    const t = h + m / 60;
    let zone = null;
    if (t >= 13.5 && t < 21) zone = 'NEW YORK AM';
    else if (t >= 8 && t < 13.5) zone = 'LONDON';
    else if (t >= 0 && t < 8) zone = 'ASIA';
    else zone = 'CLOSE';
    const vol = c.ind ? c.ind.atrPct : null;
    const active = zone === 'NEW YORK AM' || zone === 'LONDON';
    const d = active ? (c.ind && c.ind.rsi !== null ? (c.ind.rsi > 50 ? 1 : -1) : 0) : 0;
    return { d, conf: active ? 55 : 0, reason: `ICT killzone: ${zone}${active && vol !== null ? `, ATR% ${vol.toFixed(2)}` : ''}`, method: 'price' };
  });

  // =====================================================================
  // DERIVATIVES & MACRO (7)
  // =====================================================================
  add(46, 'Funding Contrarian', 'DERIV', (c) => {
    const f = c.funds; if (!f || f.fundingAnnual === null) return N();
    if (f.fundingAnnual > 5) return { d: -1, conf: 78, reason: `Funding annualized ${f.fundingAnnual.toFixed(1)}% — crowded longs`, method: 'price' };
    if (f.fundingAnnual < -5) return { d: 1, conf: 78, reason: `Funding annualized ${f.fundingAnnual.toFixed(1)}% — crowded shorts`, method: 'price' };
    return { d: 0, conf: 0, reason: `Funding ${f.fundingAnnual.toFixed(1)}% ann — neutral`, method: 'price' };
  });
  add(47, 'Open Interest Signal', 'DERIV', (c) => {
    const f = c.funds; const i = c.ind; if (!f || !i || f.oiChange === null) return N();
    const up = i.price > i.ema21, oiUp = f.oiChange > 1, oiDn = f.oiChange < -1;
    if (up && oiUp) return { d: 1, conf: 74, reason: `Price↑ + OI↑ (${f.oiChange.toFixed(1)}%) — new longs`, method: 'price' };
    if (!up && oiUp) return { d: -1, conf: 74, reason: `Price↓ + OI↑ — new shorts`, method: 'price' };
    if (up && oiDn) return { d: -1, conf: 60, reason: `Price↑ + OI↓ — short covering, weak rally`, method: 'price' };
    if (!up && oiDn) return { d: 1, conf: 60, reason: `Price↓ + OI↓ — long liquidation, capitulation`, method: 'price' };
    return { d: 0, conf: 0, reason: `OI change ${f.oiChange.toFixed(1)}% — neutral`, method: 'price' };
  });
  add(48, 'L/S Ratio Contrarian', 'DERIV', (c) => {
    const f = c.funds; if (!f || f.globalLS === null) return N();
    if (f.globalLS > 2) return { d: -1, conf: 80, reason: `Global L/S ${f.globalLS.toFixed(2)} — crowded retail longs`, method: 'price' };
    if (f.globalLS < 0.8) return { d: 1, conf: 80, reason: `Global L/S ${f.globalLS.toFixed(2)} — retail heavy short`, method: 'price' };
    return { d: 0, conf: 0, reason: `Global L/S ${f.globalLS.toFixed(2)} — neutral`, method: 'price' };
  });
  add(49, 'DXY Macro Algo', 'MACRO', (c) => {
    const m = c.macro; if (!m || !m.dxy || m.dxy.changePct === null) return N();
    if (m.dxy.changePct < -0.12) return { d: 1, conf: Math.min(90, Math.abs(m.dxy.changePct) * 90), reason: `DXY ${m.dxy.value.toFixed(2)} ${m.dxy.changePct.toFixed(2)}% — gold tailwind`, method: 'price' };
    if (m.dxy.changePct > 0.12) return { d: -1, conf: Math.min(90, m.dxy.changePct * 90), reason: `DXY ${m.dxy.value.toFixed(2)} ${m.dxy.changePct.toFixed(2)}% — gold headwind`, method: 'price' };
    return { d: 0, conf: 0, reason: `DXY ${m.dxy.value !== null ? m.dxy.value.toFixed(2) : 'n/a'} ${m.dxy.changePct.toFixed(2)}% — neutral`, method: 'price' };
  });
  add(50, 'Yield Macro Algo', 'MACRO', (c) => {
    const m = c.macro; if (!m || !m.tnx || m.tnx.changePct === null) return N();
    if (m.tnx.changePct < -0.05) return { d: 1, conf: 72, reason: `US10Y ${m.tnx.value !== null ? m.tnx.value.toFixed(3) + '%' : 'n/a'} falling — lower opp cost`, method: 'price' };
    if (m.tnx.changePct > 0.05) return { d: -1, conf: 72, reason: `US10Y rising ${m.tnx.changePct.toFixed(2)}% — headwind`, method: 'price' };
    return { d: 0, conf: 0, reason: `US10Y stable (${m.tnx.changePct.toFixed(2)}%)`, method: 'price' };
  });

  return AG;
}

module.exports = { makeAgents };
