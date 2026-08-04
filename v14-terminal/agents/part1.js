'use strict';

// ============================================================================
// PART C1 — AGENT SWARM: CATEGORIES 1–10 (Agents 1.1 – 10.10) = 100 agents
// Candlestick Masters (Cats 1-5) + S/R Masters (Cats 6-10)
// Each agent: 10 rules → 1 vote (LONG or SHORT — forced side, never NEUTRAL).
// ============================================================================

const { P, add } = require('./engine.js');

const price = (c) => c.price;
const atr = (c) => (c.ind ? c.ind.atr14 : null);

// ===================== CATEGORY 1: PIN BAR MASTERS =========================
add('1.1', 'Pin Bar Support Specialist', 1, { method: 'swing', stopMult: 1.3, rr: 2.5 }, [
  [(c) => P.pinBull(c) && c.ind && c.price <= c.ind.lastL + atr(c) * 0.4, 1, 3],
  [(c) => P.pinBull(c) && P.atSupport(c), 1, 2],
  [(c) => P.pinBull(c) && c.ind.low < (c.ind.dynamicSR ? c.ind.dynamicSR.nearestSupport : 1e9) && c.price > c.ind.dynamicSR.nearestSupport, 1, 2.5],
  [(c) => P.pinBull(c) && P.pinBull(c), 1, 1.5],
  [(c) => P.pinBull(c) && P.nearFib618(c), 1, 2],
  [(c) => P.pinBull(c) && P.nearEma50At(c, 'low'), 1, 2],
  [(c) => P.pinBull(c) && c.ind && c.ind.patterns.upperWick > 0 && c.ind.close < c.ind.open, 1, 1.5],
  [(c) => P.pinBull(c) && c.ind && c.ind.rvol < 0.8, 0, 2],
  [(c) => P.pinBull(c) && c.ind && c.ind.patterns.lowerWick > c.ind.patterns.body * 2 && c.ind.patterns.body > 0 && (c.ind.close - c.ind.low) / (c.ind.high - c.ind.low) > 0.75, 1, 2],
  [(c) => P.pinBull(c) && P.bidWallAbove(c), 1, 2]
]);

add('1.2', 'Pin Bar Resistance Specialist', 1, { method: 'swing', stopMult: 1.3, rr: 2.5 }, [
  [(c) => P.pinBear(c) && c.ind && c.price >= c.ind.lastH - atr(c) * 0.4, -1, 3],
  [(c) => P.pinBear(c) && P.atResistance(c), -1, 2],
  [(c) => P.pinBear(c) && c.ind.high > (c.ind.dynamicSR ? c.ind.dynamicSR.nearestResistance : 0) && c.price < c.ind.dynamicSR.nearestResistance, -1, 2.5],
  [(c) => P.pinBear(c), -1, 1.5],
  [(c) => P.pinBear(c) && P.nearFib382(c), -1, 2],
  [(c) => P.pinBear(c) && c.ind && c.price > c.ind.ema50, -1, 2],
  [(c) => P.pinBear(c) && c.ind && !c.ind.patterns.upBody && c.ind.patterns.body > 0 && (c.ind.high - c.ind.close) / (c.ind.high - c.ind.low) > 0.75, -1, 2],
  [(c) => P.pinBear(c) && c.ind && c.ind.rvol < 0.8, 0, 2],
  [(c) => P.pinBear(c) && P.askWallBelow(c), -1, 2],
  [(c) => P.pinBear(c) && c.ind && c.ind.rvol > 1.2, -1, 1.5]
]);

add('1.3', 'Pin Bar Volume Analyst', 1, { method: 'price', stopMult: 1.2, rr: 2.2 }, [
  [(c) => P.pinBull(c) && c.ind && c.ind.rvol > 2, 1, 3],
  [(c) => P.pinBear(c) && c.ind && c.ind.rvol > 2, -1, 3],
  [(c) => (P.pinBull(c) || P.pinBear(c)) && c.ind && c.ind.rvol < 0.5, 0, 3],
  [(c) => P.pinBull(c) && c.ind && c.ind.rvol > 1.5, 1, 2],
  [(c) => P.pinBear(c) && c.ind && c.ind.rvol > 1.5, -1, 2],
  [(c) => P.pinBull(c) && c.ind && P.volSpike(c), 1, 2.5],
  [(c) => P.pinBear(c) && c.ind && P.volSpike(c), -1, 2.5],
  [(c) => P.pinBull(c) && P.atPoc(c), 1, 1.5],
  [(c) => P.pinBear(c) && P.atPoc(c), -1, 1.5],
  [(c) => P.pinBull(c) && c.ind && c.ind.rvol < 1 && c.ind.rvol > 0.5, 0, 1]
]);

add('1.4', 'Pin Bar EMA Confluence', 1, { method: 'ema21', stopMult: 1.2, rr: 2.2 }, [
  [(c) => P.pinBull(c) && P.aboveEma8(c) && P.alignBull(c), 1, 3],
  [(c) => P.pinBear(c) && P.belowEma8(c) && P.alignBear(c), -1, 3],
  [(c) => (P.pinBull(c) || P.pinBear(c)) && c.ind && Math.abs(c.price - c.ind.ema21) < atr(c) * 0.3 && (P.pinBull(c) ? P.alignBull(c) : P.alignBear(c)), 1, 2],
  [(c) => P.pinBull(c) && P.atSupport(c) && c.ind.ema200 !== null, 1, 2.5],
  [(c) => P.pinBear(c) && P.atResistance(c) && c.ind.ema200 !== null, -1, 2.5],
  [(c) => P.pinBull(c) && P.ema8Above21(c) && P.aboveEma8(c), 1, 2.5],
  [(c) => P.pinBear(c) && P.ema8Below21(c) && P.belowEma8(c), -1, 2.5],
  [(c) => P.pinBull(c) && P.nearVwap(c), 1, 2],
  [(c) => P.pinBear(c) && P.nearVwap(c), -1, 2],
  [(c) => P.pinBull(c) && c.ind && c.price > c.ind.ema21 + atr(c) * 2, 0, 2]
]);

add('1.5', 'Multi-Timeframe Pin Analyst', 1, { method: 'swing', stopMult: 1.3, rr: 2.6 }, [
  [(c) => P.pinBull(c) && P.m5Bull(c) && P.structUp(c), 1, 3],
  [(c) => P.pinBear(c) && P.m5Bear(c) && P.structDn(c), -1, 3],
  [(c) => (P.pinBull(c) && P.h4Bull(c)) || (P.pinBear(c) && P.h4Bear(c)), 1, 2.5],
  [(c) => P.pinBull(c) && P.m5Bear(c), 0, 2],
  [(c) => P.pinBear(c) && P.m5Bull(c), 0, 2],
  [(c) => P.pinBull(c) && P.structUp(c), 1, 2],
  [(c) => P.pinBear(c) && P.structDn(c), -1, 2],
  [(c) => P.m5Bull(c) && P.pinBull(c), 1, 2],
  [(c) => P.m5Bear(c) && P.pinBear(c), -1, 2],
  [(c) => P.pinBull(c) && P.h4Bull(c), 1, 2]
]);

add('1.6', 'False Break Pin Hunter', 1, { method: 'swing', stopMult: 1.2, rr: 2.8 }, [
  [(c) => P.pinBear(c) && c.ind && c.ind.high > (c.ind.dynamicSR ? c.ind.dynamicSR.nearestResistance : 0) && c.price < c.ind.dynamicSR.nearestResistance, -1, 3],
  [(c) => P.pinBull(c) && c.ind && c.ind.low < (c.ind.dynamicSR ? c.ind.dynamicSR.nearestSupport : 1e9) && c.price > c.ind.dynamicSR.nearestSupport, 1, 3],
  [(c) => P.pinBear(c) && c.ind && c.ind.rvol > 3, -1, 3],
  [(c) => P.pinBull(c) && c.ind && c.ind.rvol > 3, 1, 3],
  [(c) => P.pinBear(c) && P.rsiDivBear(c), -1, 3],
  [(c) => P.pinBull(c) && P.rsiDivBull(c), 1, 3],
  [(c) => P.pinBear(c) && c.ind && c.ind.close < c.ind.ema8, -1, 2],
  [(c) => P.pinBull(c) && c.ind && c.ind.close > c.ind.ema8, 1, 2],
  [(c) => P.pinBear(c) && P.volSpike(c), -1, 2],
  [(c) => P.pinBull(c) && P.volSpike(c), 1, 2]
]);

add('1.7', 'Exhaustion Pin Specialist', 1, { method: 'price', stopMult: 1.2, rr: 2.4 }, [
  [(c) => P.pinBear(c) && P.rsiOB(c), -1, 3],
  [(c) => P.pinBull(c) && P.rsiOS(c), 1, 3],
  [(c) => P.pinBear(c) && c.ind && c.ind.macdHist < c.ind.macdHistPrev, -1, 2],
  [(c) => P.pinBull(c) && c.ind && c.ind.macdHist > c.ind.macdHistPrev, 1, 2],
  [(c) => P.pinBear(c) && P.aboveBBUp(c), -1, 2.5],
  [(c) => P.pinBull(c) && P.belowBBLo(c), 1, 2.5],
  [(c) => P.pinBear(c) && P.fundingHigh(c), -1, 2],
  [(c) => P.pinBull(c) && P.fundingLow(c), 1, 2],
  [(c) => P.pinBear(c) && P.atrVeryHigh(c), -1, 2],
  [(c) => P.pinBull(c) && P.atrVeryHigh(c), 1, 2]
]);

add('1.8', 'Squeeze Pin Specialist', 1, { method: 'price', stopMult: 1.3, rr: 2.5 }, [
  [(c) => P.pinBull(c) && P.squeezeOn(c), 1, 2],
  [(c) => P.pinBear(c) && P.squeezeOn(c), -1, 2],
  [(c) => P.pinBull(c) && P.atrLow(c), 1, 1.5],
  [(c) => P.pinBear(c) && P.atrLow(c), -1, 1.5],
  [(c) => P.pinBull(c) && P.adxStrong(c), 1, 2.5],
  [(c) => P.pinBear(c) && P.adxStrong(c), -1, 2.5],
  [(c) => P.pinBull(c) && P.atPoc(c), 1, 2],
  [(c) => P.pinBear(c) && P.atPoc(c), -1, 2],
  [(c) => P.pinBull(c) && P.fundingFlipDn(c), 1, 2],
  [(c) => P.pinBear(c) && P.fundingFlipUp(c), -1, 2]
]);

add('1.9', 'Wick Mathematics Specialist', 1, { method: 'price', stopMult: 1.1, rr: 2.2 }, [
  [(c) => P.pinBull(c) && c.ind.patterns.lowerWick > 3 * c.ind.patterns.body, 1, 3],
  [(c) => P.pinBear(c) && c.ind.patterns.upperWick > 3 * c.ind.patterns.body, -1, 3],
  [(c) => P.pinBull(c) && c.ind.patterns.lowerWick > 1.5 * c.ind.atr14, 1, 2.5],
  [(c) => P.pinBear(c) && c.ind.patterns.upperWick > 1.5 * c.ind.atr14, -1, 2.5],
  [(c) => (P.pinBull(c) || P.pinBear(c)) && c.ind.patterns.upperWick === c.ind.patterns.lowerWick, 0, 2],
  [(c) => P.pinBull(c) && P.nearVwap(c), 1, 2],
  [(c) => P.pinBear(c) && P.nearVwap(c), -1, 2],
  [(c) => P.pinBull(c) && c.ind.patterns.lowerWick > c.ind.patterns.body * 2, 1, 2],
  [(c) => P.pinBear(c) && c.ind.patterns.upperWick > c.ind.patterns.body * 2, -1, 2],
  [(c) => P.pinBull(c) && c.ind.patterns.lowerWick < c.ind.patterns.body, 0, 1]
]);

add('1.10', 'Rejection Speed Analyst', 1, { method: 'price', stopMult: 1.2, rr: 2.0 }, [
  [(c) => P.pinBull(c) && P.volSpike(c), 1, 2.5],
  [(c) => P.pinBear(c) && P.volSpike(c), -1, 2.5],
  [(c) => P.pinBull(c) && P.alignBull(c), 1, 2],
  [(c) => P.pinBear(c) && P.alignBear(c), -1, 2],
  [(c) => P.pinBull(c), 1, 1.5],
  [(c) => P.pinBear(c), -1, 1.5],
  [(c) => P.pinBull(c) && c.ind.rvol > 1.5, 1, 2],
  [(c) => P.pinBear(c) && c.ind.rvol > 1.5, -1, 2],
  [(c) => P.pinBull(c) && c.ind.rvol < 0.8, 0, 2],
  [(c) => P.pinBear(c) && c.ind.rvol < 0.8, 0, 2]
]);

// ===================== CATEGORY 2: ENGULFING MASTERS =======================
add('2.1', 'Bullish Engulfing Specialist', 2, { method: 'swing', stopMult: 1.2, rr: 2.5 }, [
  [(c) => P.engulfBull(c) && P.atSupport(c), 1, 3],
  [(c) => P.engulfBull(c) && P.aboveEma21(c), 1, 2],
  [(c) => P.engulfBull(c) && P.belowEma21(c) && P.alignBear(c), 1, 2.5],
  [(c) => P.engulfBull(c) && P.rsiOS(c), 1, 2.5],
  [(c) => P.engulfBull(c) && P.volSpike(c), 1, 2],
  [(c) => P.engulfBull(c) && P.atLastL(c), 1, 2.5],
  [(c) => P.engulfBull(c) && P.alignMixed(c), 1, 1.5],
  [(c) => P.engulfBull(c) && P.deltaPos(c), 1, 2],
  [(c) => P.engulfBull(c) && P.fvgUnfilled(c) && P.aboveFvg(c), 1, 1.5],
  [(c) => P.engulfBull(c) && c.ind.rvol < 0.7, 0, 2]
]);

add('2.2', 'Bearish Engulfing Specialist', 2, { method: 'swing', stopMult: 1.2, rr: 2.5 }, [
  [(c) => P.engulfBear(c) && P.atResistance(c), -1, 3],
  [(c) => P.engulfBear(c) && P.belowEma21(c), -1, 2],
  [(c) => P.engulfBear(c) && P.aboveEma21(c) && P.alignBull(c), -1, 2.5],
  [(c) => P.engulfBear(c) && P.rsiOB(c), -1, 2.5],
  [(c) => P.engulfBear(c) && P.volSpike(c), -1, 2],
  [(c) => P.engulfBear(c) && P.atLastH(c), -1, 2.5],
  [(c) => P.engulfBear(c) && P.alignMixed(c), -1, 1.5],
  [(c) => P.engulfBear(c) && P.deltaNeg(c), -1, 2],
  [(c) => P.engulfBear(c) && P.fvgUnfilled(c) && P.belowFvg(c), -1, 1.5],
  [(c) => P.engulfBear(c) && c.ind.rvol < 0.7, 0, 2]
]);

add('2.3', 'Engulfing Volume Validator', 2, { method: 'price', stopMult: 1.2, rr: 2.2 }, [
  [(c) => P.engulfBull(c) && P.volSpike(c), 1, 3],
  [(c) => P.engulfBear(c) && P.volSpike(c), -1, 3],
  [(c) => P.engulfBull(c) && c.ind.rvol > 1.5, 1, 2],
  [(c) => P.engulfBear(c) && c.ind.rvol > 1.5, -1, 2],
  [(c) => P.engulfBull(c) && c.ind.rvol < 0.5, 0, 2.5],
  [(c) => P.engulfBear(c) && c.ind.rvol < 0.5, 0, 2.5],
  [(c) => P.engulfBull(c) && P.deltaPos(c), 1, 2],
  [(c) => P.engulfBear(c) && P.deltaNeg(c), -1, 2],
  [(c) => P.engulfBull(c) && P.tapeBull(c), 1, 1.5],
  [(c) => P.engulfBear(c) && P.tapeBear(c), -1, 1.5]
]);

add('2.4', 'Engulfing EMA Confluence', 2, { method: 'ema21', stopMult: 1.2, rr: 2.2 }, [
  [(c) => P.engulfBull(c) && P.nearEma21At(c, 'low'), 1, 3],
  [(c) => P.engulfBear(c) && P.nearEma21At(c, 'high'), -1, 3],
  [(c) => P.engulfBull(c) && P.ema8Above21(c), 1, 2],
  [(c) => P.engulfBear(c) && P.ema8Below21(c), -1, 2],
  [(c) => P.engulfBull(c) && P.nearEma50At(c, 'low'), 1, 2],
  [(c) => P.engulfBear(c) && P.nearEma50At(c, 'high'), -1, 2],
  [(c) => P.engulfBull(c) && P.nearVwap(c), 1, 2],
  [(c) => P.engulfBear(c) && P.nearVwap(c), -1, 2],
  [(c) => P.engulfBull(c) && P.aboveEma200(c), 1, 2],
  [(c) => P.engulfBear(c) && P.belowEma200(c), -1, 2]
]);

add('2.5', 'Multi-Timeframe Engulfing', 2, { method: 'swing', stopMult: 1.3, rr: 2.6 }, [
  [(c) => P.engulfBull(c) && P.h4Bull(c), 1, 3],
  [(c) => P.engulfBear(c) && P.h4Bear(c), -1, 3],
  [(c) => P.engulfBull(c) && P.htfBull(c), 1, 2.5],
  [(c) => P.engulfBear(c) && P.htfBear(c), -1, 2.5],
  [(c) => P.engulfBull(c) && P.m5Bull(c), 1, 2],
  [(c) => P.engulfBear(c) && P.m5Bear(c), -1, 2],
  [(c) => P.engulfBull(c) && P.m5Bear(c), 0, 1.5],
  [(c) => P.engulfBear(c) && P.m5Bull(c), 0, 1.5],
  [(c) => P.engulfBull(c) && P.structUp(c), 1, 2],
  [(c) => P.engulfBear(c) && P.structDn(c), -1, 2]
]);

add('2.6', 'Engulfing Counter-Trend Hunter', 2, { method: 'price', stopMult: 1.2, rr: 2.8 }, [
  [(c) => P.engulfBull(c) && P.alignBear(c) && P.atSupport(c), 1, 3],
  [(c) => P.engulfBear(c) && P.alignBull(c) && P.atResistance(c), -1, 3],
  [(c) => P.engulfBull(c) && P.alignBear(c), 1, 2],
  [(c) => P.engulfBear(c) && P.alignBull(c), -1, 2],
  [(c) => P.engulfBull(c) && P.rsiDivBull(c), 1, 2.5],
  [(c) => P.engulfBear(c) && P.rsiDivBear(c), -1, 2.5],
  [(c) => P.engulfBull(c) && P.fundingLow(c), 1, 2],
  [(c) => P.engulfBear(c) && P.fundingHigh(c), -1, 2],
  [(c) => P.engulfBull(c) && P.atrVeryHigh(c), 1, 1.5],
  [(c) => P.engulfBear(c) && P.atrVeryHigh(c), -1, 1.5]
]);

add('2.7', 'Engulfing Fakeout Detector', 2, { method: 'swing', stopMult: 1.2, rr: 2.8 }, [
  [(c) => P.engulfBull(c) && c.ind && c.ind.low < (c.ind.dynamicSR ? c.ind.dynamicSR.nearestSupport : 1e9) && c.price > c.ind.dynamicSR.nearestSupport, 1, 3],
  [(c) => P.engulfBear(c) && c.ind && c.ind.high > (c.ind.dynamicSR ? c.ind.dynamicSR.nearestResistance : 0) && c.price < c.ind.dynamicSR.nearestResistance, -1, 3],
  [(c) => P.engulfBull(c) && P.belowEma21(c), 1, 2],
  [(c) => P.engulfBear(c) && P.aboveEma21(c), -1, 2],
  [(c) => P.engulfBull(c) && P.volClimax(c), 1, 2.5],
  [(c) => P.engulfBear(c) && P.volClimax(c), -1, 2.5],
  [(c) => P.engulfBull(c) && P.rsiDivBull(c), 1, 2],
  [(c) => P.engulfBear(c) && P.rsiDivBear(c), -1, 2],
  [(c) => P.engulfBull(c) && P.atSupport(c), 1, 2],
  [(c) => P.engulfBear(c) && P.atResistance(c), -1, 2]
]);

add('2.8', 'Engulfing Squeeze Breaker', 2, { method: 'price', stopMult: 1.3, rr: 2.5 }, [
  [(c) => P.engulfBull(c) && P.squeezeOn(c), 1, 2.5],
  [(c) => P.engulfBear(c) && P.squeezeOn(c), -1, 2.5],
  [(c) => P.engulfBull(c) && P.atrLow(c), 1, 2],
  [(c) => P.engulfBear(c) && P.atrLow(c), -1, 2],
  [(c) => P.engulfBull(c) && P.adxStrong(c), 1, 2],
  [(c) => P.engulfBear(c) && P.adxStrong(c), -1, 2],
  [(c) => P.engulfBull(c) && P.adxWeak(c), 0, 2],
  [(c) => P.engulfBear(c) && P.adxWeak(c), 0, 2],
  [(c) => P.engulfBull(c) && P.aboveVwap(c), 1, 1.5],
  [(c) => P.engulfBear(c) && P.belowVwap(c), -1, 1.5]
]);

add('2.9', 'Engulfing Risk Specialist', 2, { method: 'price', stopMult: 1.4, rr: 2.0 }, [
  [(c) => P.engulfBull(c) && P.atrHigh(c), 1, 1.5],
  [(c) => P.engulfBear(c) && P.atrHigh(c), -1, 1.5],
  [(c) => P.engulfBull(c) && P.spreadTight(c), 1, 2],
  [(c) => P.engulfBear(c) && P.spreadTight(c), -1, 2],
  [(c) => P.engulfBull(c) && P.spreadWide(c), 0, 2.5],
  [(c) => P.engulfBear(c) && P.spreadWide(c), 0, 2.5],
  [(c) => P.engulfBull(c) && P.atrNormal(c), 1, 2],
  [(c) => P.engulfBear(c) && P.atrNormal(c), -1, 2],
  [(c) => P.engulfBull(c) && P.atrLow(c), 1, 1.5],
  [(c) => P.engulfBear(c) && P.atrLow(c), -1, 1.5]
]);

add('2.10', 'Engulfing Confluence Compiler', 2, { method: 'ema21', stopMult: 1.2, rr: 2.4 }, [
  [(c) => P.engulfBull(c) && P.alignBull(c) && P.atSupport(c) && P.volSpike(c), 1, 4],
  [(c) => P.engulfBear(c) && P.alignBear(c) && P.atResistance(c) && P.volSpike(c), -1, 4],
  [(c) => P.engulfBull(c) && P.alignBull(c) && P.atSupport(c), 1, 3],
  [(c) => P.engulfBear(c) && P.alignBear(c) && P.atResistance(c), -1, 3],
  [(c) => P.engulfBull(c) && P.atSupport(c), 1, 2],
  [(c) => P.engulfBear(c) && P.atResistance(c), -1, 2],
  [(c) => P.engulfBull(c) && P.alignBull(c), 1, 2],
  [(c) => P.engulfBear(c) && P.alignBear(c), -1, 2],
  [(c) => P.engulfBull(c) && P.tapeBull(c), 1, 2],
  [(c) => P.engulfBear(c) && P.tapeBear(c), -1, 2]
]);

// ===================== CATEGORY 3: DOJI & INDECISION =======================
add('3.1', 'Doji Support Specialist', 3, { method: 'swing', stopMult: 1.2, rr: 2.2 }, [
  [(c) => P.doji(c) && P.atSupport(c), 1, 2],
  [(c) => P.doji(c) && P.atLastL(c), 1, 2],
  [(c) => P.doji(c) && P.rsiOS(c), 1, 2],
  [(c) => P.doji(c) && P.rsiDivBull(c), 1, 2.5],
  [(c) => P.doji(c) && P.atPoc(c), 1, 1.5],
  [(c) => P.doji(c) && P.nearFib618(c), 1, 2],
  [(c) => P.doji(c) && P.atrLow(c), 1, 1],
  [(c) => P.doji(c) && P.structUp(c), 1, 1.5],
  [(c) => P.doji(c) && P.fundingLow(c), 1, 1.5],
  [(c) => P.doji(c) && P.alignBear(c), 0, 1.5]
]);

add('3.2', 'Doji Resistance Specialist', 3, { method: 'swing', stopMult: 1.2, rr: 2.2 }, [
  [(c) => P.doji(c) && P.atResistance(c), -1, 2],
  [(c) => P.doji(c) && P.atLastH(c), -1, 2],
  [(c) => P.doji(c) && P.rsiOB(c), -1, 2],
  [(c) => P.doji(c) && P.rsiDivBear(c), -1, 2.5],
  [(c) => P.doji(c) && P.atPoc(c), -1, 1.5],
  [(c) => P.doji(c) && P.nearFib382(c), -1, 2],
  [(c) => P.doji(c) && P.atrLow(c), -1, 1],
  [(c) => P.doji(c) && P.structDn(c), -1, 1.5],
  [(c) => P.doji(c) && P.fundingHigh(c), -1, 1.5],
  [(c) => P.doji(c) && P.alignBull(c), 0, 1.5]
]);

add('3.3', 'Doji Trend Neutralizer', 3, { method: 'price', stopMult: 1.2, rr: 1.8 }, [
  [(c) => P.doji(c) && P.alignBull(c), 0, 2.5],
  [(c) => P.doji(c) && P.alignBear(c), 0, 2.5],
  [(c) => P.doji(c) && P.adxStrong(c), 0, 1.5],
  [(c) => P.doji(c) && P.alignMixed(c), 0, 2],
  [(c) => P.doji(c) && P.rvolLow(c), 0, 2],
  [(c) => P.doji(c) && P.aboveVwap(c), 1, 1],
  [(c) => P.doji(c) && P.belowVwap(c), -1, 1],
  [(c) => P.doji(c) && P.atPoc(c), 0, 2],
  [(c) => P.doji(c), 0, 1.5],
  [(c) => P.doji(c) && P.atrHigh(c), 0, 1.5]
]);

add('3.4', 'Doji Volume Analyst', 3, { method: 'price', stopMult: 1.2, rr: 2.0 }, [
  [(c) => P.doji(c) && P.volSpike(c), 0, 2.5],
  [(c) => P.doji(c) && P.volSpike(c) && P.atSupport(c), 1, 2],
  [(c) => P.doji(c) && P.volSpike(c) && P.atResistance(c), -1, 2],
  [(c) => P.doji(c) && P.rvolLow(c), 0, 2.5],
  [(c) => P.doji(c) && P.atPoc(c), 0, 1.5],
  [(c) => P.doji(c) && P.rsiDivBull(c), 1, 2],
  [(c) => P.doji(c) && P.rsiDivBear(c), -1, 2],
  [(c) => P.doji(c) && P.atLastL(c) && P.volSpike(c), 1, 2],
  [(c) => P.doji(c) && P.atLastH(c) && P.volSpike(c), -1, 2],
  [(c) => P.doji(c) && P.alignMixed(c), 0, 2]
]);

add('3.5', 'Multi-Timeframe Doji', 3, { method: 'swing', stopMult: 1.3, rr: 2.2 }, [
  [(c) => P.doji(c) && P.h4Bull(c), 1, 2],
  [(c) => P.doji(c) && P.h4Bear(c), -1, 2],
  [(c) => P.doji(c) && P.htfBull(c), 1, 2],
  [(c) => P.doji(c) && P.htfBear(c), -1, 2],
  [(c) => P.doji(c) && P.m5Bull(c), 1, 1.5],
  [(c) => P.doji(c) && P.m5Bear(c), -1, 1.5],
  [(c) => P.doji(c) && P.htfTrendUp(c), 1, 1.5],
  [(c) => P.doji(c) && P.htfTrendDn(c), -1, 1.5],
  [(c) => P.doji(c) && P.mtfMixed(c), 0, 2],
  [(c) => P.doji(c) && P.structNeutral(c), 0, 2]
]);

add('3.6', 'Doji Reversal Confirmer', 3, { method: 'price', stopMult: 1.2, rr: 2.5 }, [
  [(c) => P.doji(c) && P.rsiDivBull(c), 1, 3],
  [(c) => P.doji(c) && P.rsiDivBear(c), -1, 3],
  [(c) => P.doji(c) && P.rsiOS(c), 1, 2],
  [(c) => P.doji(c) && P.rsiOB(c), -1, 2],
  [(c) => P.doji(c) && P.alignBear(c) && P.atSupport(c), 1, 2.5],
  [(c) => P.doji(c) && P.alignBull(c) && P.atResistance(c), -1, 2.5],
  [(c) => P.doji(c) && P.fundingLow(c), 1, 1.5],
  [(c) => P.doji(c) && P.fundingHigh(c), -1, 1.5],
  [(c) => P.doji(c) && P.atrVeryHigh(c), 0, 2],
  [(c) => P.doji(c) && P.alignMixed(c), 0, 1.5]
]);

add('3.7', 'Doji Range Analyst', 3, { method: 'price', stopMult: 1.2, rr: 2.0 }, [
  [(c) => P.doji(c) && P.vpTight(c), 0, 2],
  [(c) => P.doji(c) && P.atPoc(c), 0, 2],
  [(c) => P.doji(c) && P.atVah(c), -1, 1.5],
  [(c) => P.doji(c) && P.atVal(c), 1, 1.5],
  [(c) => P.doji(c) && P.squeezeOn(c), 0, 2],
  [(c) => P.doji(c) && P.structNeutral(c), 0, 2],
  [(c) => P.doji(c) && P.aboveVah(c), -1, 1.5],
  [(c) => P.doji(c) && P.belowVal(c), 1, 1.5],
  [(c) => P.doji(c) && P.adxWeak(c), 0, 2],
  [(c) => P.doji(c) && P.rvolLow(c), 0, 1.5]
]);

add('3.8', 'Doji Squeeze Apex', 3, { method: 'price', stopMult: 1.3, rr: 2.5 }, [
  [(c) => P.doji(c) && P.squeezeOn(c) && P.atPoc(c), 0, 2.5],
  [(c) => P.doji(c) && P.squeezeOn(c) && P.adxStrong(c), 0, 2],
  [(c) => P.doji(c) && P.squeezeOn(c) && P.volSpike(c), 0, 2.5],
  [(c) => P.doji(c) && P.atrLow(c), 0, 2],
  [(c) => P.doji(c) && P.ribbonTight(c), 0, 2],
  [(c) => P.doji(c) && P.squeezeOn(c), 0, 1.5],
  [(c) => P.doji(c) && P.atPoc(c), 0, 1.5],
  [(c) => P.doji(c) && P.fundingFlipUp(c), 1, 1],
  [(c) => P.doji(c) && P.fundingFlipDn(c), -1, 1],
  [(c) => P.doji(c) && P.structNeutral(c), 0, 1.5]
]);

add('3.9', 'Doji Exhaustion Specialist', 3, { method: 'price', stopMult: 1.2, rr: 2.5 }, [
  [(c) => P.doji(c) && P.rsiExtremeOB(c), -1, 3],
  [(c) => P.doji(c) && P.rsiExtremeOS(c), 1, 3],
  [(c) => P.doji(c) && P.aboveBBUp(c), -1, 2.5],
  [(c) => P.doji(c) && P.belowBBLo(c), 1, 2.5],
  [(c) => P.doji(c) && P.atrVeryHigh(c), 0, 2],
  [(c) => P.doji(c) && P.macdHistFalling(c), -1, 1.5],
  [(c) => P.doji(c) && P.macdHistRising(c), 1, 1.5],
  [(c) => P.doji(c) && P.fundingExtremePos(c), -1, 2],
  [(c) => P.doji(c) && P.fundingExtremeNeg(c), 1, 2],
  [(c) => P.doji(c) && P.rsiOB(c), -1, 2]
]);

add('3.10', 'Doji Compiler', 3, { method: 'price', stopMult: 1.2, rr: 2.0 }, [
  [(c) => P.doji(c) && P.atSupport(c) && P.rsiDivBull(c), 1, 3],
  [(c) => P.doji(c) && P.atResistance(c) && P.rsiDivBear(c), -1, 3],
  [(c) => P.doji(c) && P.atSupport(c) && P.rsiOS(c), 1, 2.5],
  [(c) => P.doji(c) && P.atResistance(c) && P.rsiOB(c), -1, 2.5],
  [(c) => P.doji(c) && P.atSupport(c), 1, 1.5],
  [(c) => P.doji(c) && P.atResistance(c), -1, 1.5],
  [(c) => P.doji(c) && P.rsiOS(c), 1, 1.5],
  [(c) => P.doji(c) && P.rsiOB(c), -1, 1.5],
  [(c) => P.doji(c) && P.volSpike(c), 0, 2],
  [(c) => P.doji(c), 0, 1]
]);

// =================== CATEGORY 4: HAMMER & SHOOTING STAR ====================
add('4.1', 'Hammer Support Specialist', 4, { method: 'swing', stopMult: 1.2, rr: 2.5 }, [
  [(c) => P.hammer(c) && P.atSupport(c), 1, 3],
  [(c) => P.hammer(c) && P.atLastL(c), 1, 2.5],
  [(c) => P.hammer(c) && P.rsiOS(c), 1, 2.5],
  [(c) => P.hammer(c) && P.rsiDivBull(c), 1, 3],
  [(c) => P.hammer(c) && P.nearFib618(c), 1, 2],
  [(c) => P.hammer(c) && P.structUp(c), 1, 2],
  [(c) => P.hammer(c) && P.alignBear(c), 1, 2],
  [(c) => P.hammer(c) && P.atPoc(c), 1, 2],
  [(c) => P.hammer(c) && P.fundingLow(c), 1, 1.5],
  [(c) => P.hammer(c) && P.alignBull(c) && P.atSupport(c), 1, 3]
]);

add('4.2', 'Shooting Star Resistance Specialist', 4, { method: 'swing', stopMult: 1.2, rr: 2.5 }, [
  [(c) => P.shootingStar(c) && P.atResistance(c), -1, 3],
  [(c) => P.shootingStar(c) && P.atLastH(c), -1, 2.5],
  [(c) => P.shootingStar(c) && P.rsiOB(c), -1, 2.5],
  [(c) => P.shootingStar(c) && P.rsiDivBear(c), -1, 3],
  [(c) => P.shootingStar(c) && P.nearFib382(c), -1, 2],
  [(c) => P.shootingStar(c) && P.structDn(c), -1, 2],
  [(c) => P.shootingStar(c) && P.alignBull(c), -1, 2],
  [(c) => P.shootingStar(c) && P.atPoc(c), -1, 2],
  [(c) => P.shootingStar(c) && P.fundingHigh(c), -1, 1.5],
  [(c) => P.shootingStar(c) && P.alignBear(c) && P.atResistance(c), -1, 3]
]);

add('4.3', 'Hammer Volume Validator', 4, { method: 'price', stopMult: 1.2, rr: 2.2 }, [
  [(c) => P.hammer(c) && P.volSpike(c), 1, 3],
  [(c) => P.hammer(c) && P.volClimax(c), 1, 3],
  [(c) => P.hammer(c) && P.rvolLow(c), 0, 2.5],
  [(c) => P.hammer(c) && P.tapeBull(c), 1, 2],
  [(c) => P.hammer(c) && P.deltaPos(c), 1, 2],
  [(c) => P.hammer(c) && P.cvdRising(c), 1, 2],
  [(c) => P.hammer(c) && P.obvRising(c), 1, 1.5],
  [(c) => P.hammer(c) && P.mfiBull(c), 1, 1.5],
  [(c) => P.hammer(c) && P.volSpike(c) && P.atSupport(c), 1, 3.5],
  [(c) => P.hammer(c), 1, 1]
]);

add('4.4', 'Shooting Star Volume Validator', 4, { method: 'price', stopMult: 1.2, rr: 2.2 }, [
  [(c) => P.shootingStar(c) && P.volSpike(c), -1, 3],
  [(c) => P.shootingStar(c) && P.volClimax(c), -1, 3],
  [(c) => P.shootingStar(c) && P.rvolLow(c), 0, 2.5],
  [(c) => P.shootingStar(c) && P.tapeBear(c), -1, 2],
  [(c) => P.shootingStar(c) && P.deltaNeg(c), -1, 2],
  [(c) => P.shootingStar(c) && P.cvdFalling(c), -1, 2],
  [(c) => P.shootingStar(c) && P.obvFalling(c), -1, 1.5],
  [(c) => P.shootingStar(c) && P.mfiBear(c), -1, 1.5],
  [(c) => P.shootingStar(c) && P.volSpike(c) && P.atResistance(c), -1, 3.5],
  [(c) => P.shootingStar(c), -1, 1]
]);

add('4.5', 'Hammer EMA Confluence', 4, { method: 'ema21', stopMult: 1.2, rr: 2.2 }, [
  [(c) => P.hammer(c) && P.nearEma21At(c, 'low'), 1, 3],
  [(c) => P.hammer(c) && P.nearEma50At(c, 'low'), 1, 2.5],
  [(c) => P.hammer(c) && P.aboveEma200(c), 1, 2],
  [(c) => P.hammer(c) && P.ema8Above21(c), 1, 2],
  [(c) => P.hammer(c) && P.nearVwap(c), 1, 2],
  [(c) => P.hammer(c) && P.alignBull(c), 1, 2],
  [(c) => P.hammer(c) && P.htfBull(c), 1, 2],
  [(c) => P.hammer(c) && P.ribbonBull(c), 1, 1.5],
  [(c) => P.hammer(c) && P.aboveHull(c), 1, 1.5],
  [(c) => P.hammer(c) && P.htfPullbackBuy(c), 1, 2.5]
]);

add('4.6', 'Shooting Star EMA Confluence', 4, { method: 'ema21', stopMult: 1.2, rr: 2.2 }, [
  [(c) => P.shootingStar(c) && P.nearEma21At(c, 'high'), -1, 3],
  [(c) => P.shootingStar(c) && P.nearEma50At(c, 'high'), -1, 2.5],
  [(c) => P.shootingStar(c) && P.belowEma200(c), -1, 2],
  [(c) => P.shootingStar(c) && P.ema8Below21(c), -1, 2],
  [(c) => P.shootingStar(c) && P.nearVwap(c), -1, 2],
  [(c) => P.shootingStar(c) && P.alignBear(c), -1, 2],
  [(c) => P.shootingStar(c) && P.htfBear(c), -1, 2],
  [(c) => P.shootingStar(c) && P.ribbonBear(c), -1, 1.5],
  [(c) => P.shootingStar(c) && P.belowHull(c), -1, 1.5],
  [(c) => P.shootingStar(c) && P.htfPullbackSell(c), -1, 2.5]
]);

add('4.7', 'Multi-Timeframe Hammer', 4, { method: 'swing', stopMult: 1.3, rr: 2.6 }, [
  [(c) => P.hammer(c) && P.h4Bull(c), 1, 3],
  [(c) => P.hammer(c) && P.htfBull(c), 1, 2.5],
  [(c) => P.hammer(c) && P.m5Bull(c), 1, 2],
  [(c) => P.hammer(c) && P.structUp(c), 1, 2],
  [(c) => P.hammer(c) && P.allTfBull(c), 1, 3.5],
  [(c) => P.hammer(c) && P.m5Bear(c), 0, 1.5],
  [(c) => P.hammer(c) && P.htfTrendUp(c), 1, 2],
  [(c) => P.hammer(c) && P.d1Bull(c), 1, 2],
  [(c) => P.hammer(c) && P.alignBull(c), 1, 1.5],
  [(c) => P.hammer(c), 1, 1]
]);

add('4.8', 'Multi-Timeframe Shooting Star', 4, { method: 'swing', stopMult: 1.3, rr: 2.6 }, [
  [(c) => P.shootingStar(c) && P.h4Bear(c), -1, 3],
  [(c) => P.shootingStar(c) && P.htfBear(c), -1, 2.5],
  [(c) => P.shootingStar(c) && P.m5Bear(c), -1, 2],
  [(c) => P.shootingStar(c) && P.structDn(c), -1, 2],
  [(c) => P.shootingStar(c) && P.allTfBear(c), -1, 3.5],
  [(c) => P.shootingStar(c) && P.m5Bull(c), 0, 1.5],
  [(c) => P.shootingStar(c) && P.htfTrendDn(c), -1, 2],
  [(c) => P.shootingStar(c) && P.d1Bear(c), -1, 2],
  [(c) => P.shootingStar(c) && P.alignBear(c), -1, 1.5],
  [(c) => P.shootingStar(c), -1, 1]
]);

add('4.9', 'Hammer Risk Manager', 4, { method: 'swing', stopMult: 1.4, rr: 2.0 }, [
  [(c) => P.hammer(c) && P.atrNormal(c), 1, 2],
  [(c) => P.hammer(c) && P.atrHigh(c), 0, 2],
  [(c) => P.hammer(c) && P.spreadTight(c), 1, 2],
  [(c) => P.hammer(c) && P.spreadWide(c), 0, 2.5],
  [(c) => P.hammer(c) && P.volSpike(c) && P.atrHigh(c), 0, 2],
  [(c) => P.hammer(c) && P.fundingExtremePos(c), 0, 2],
  [(c) => P.hammer(c) && P.atrLow(c), 1, 1.5],
  [(c) => P.hammer(c) && P.structUp(c), 1, 2],
  [(c) => P.hammer(c) && P.alignMixed(c), 1, 1],
  [(c) => P.hammer(c) && P.rvolLow(c), 0, 2]
]);

add('4.10', 'Hammer-Star Compiler', 4, { method: 'price', stopMult: 1.2, rr: 2.4 }, [
  [(c) => P.hammer(c) && P.atSupport(c) && P.rsiDivBull(c) && P.volSpike(c), 1, 4],
  [(c) => P.shootingStar(c) && P.atResistance(c) && P.rsiDivBear(c) && P.volSpike(c), -1, 4],
  [(c) => P.hammer(c) && P.atSupport(c), 1, 2.5],
  [(c) => P.shootingStar(c) && P.atResistance(c), -1, 2.5],
  [(c) => P.hammer(c) && P.rsiDivBull(c), 1, 2.5],
  [(c) => P.shootingStar(c) && P.rsiDivBear(c), -1, 2.5],
  [(c) => P.hammer(c) && P.volSpike(c), 1, 2],
  [(c) => P.shootingStar(c) && P.volSpike(c), -1, 2],
  [(c) => P.hammer(c), 1, 1],
  [(c) => P.shootingStar(c), -1, 1]
]);

// =================== CATEGORY 5: CONTINUATION PATTERNS =====================
add('5.1', 'Three White Soldiers', 5, { method: 'price', stopMult: 1.3, rr: 2.4 }, [
  [(c) => P.threeWhite(c) && P.alignBull(c), 1, 3.5],
  [(c) => P.threeWhite(c) && P.structUp(c), 1, 3],
  [(c) => P.threeWhite(c) && P.aboveEma21(c), 1, 2.5],
  [(c) => P.threeWhite(c) && P.adxStrong(c), 1, 2.5],
  [(c) => P.threeWhite(c) && P.htfBull(c), 1, 2],
  [(c) => P.threeWhite(c) && P.volSpike(c), 1, 2],
  [(c) => P.threeWhite(c) && P.ema8Above21(c), 1, 2],
  [(c) => P.threeWhite(c) && P.belowEma21(c), 0, 2],
  [(c) => P.threeWhite(c) && P.rsiOB(c), 0, 2],
  [(c) => P.threeWhite(c), 1, 1.5]
]);

add('5.2', 'Three Black Crows', 5, { method: 'price', stopMult: 1.3, rr: 2.4 }, [
  [(c) => P.threeBlack(c) && P.alignBear(c), -1, 3.5],
  [(c) => P.threeBlack(c) && P.structDn(c), -1, 3],
  [(c) => P.threeBlack(c) && P.belowEma21(c), -1, 2.5],
  [(c) => P.threeBlack(c) && P.adxStrong(c), -1, 2.5],
  [(c) => P.threeBlack(c) && P.htfBear(c), -1, 2],
  [(c) => P.threeBlack(c) && P.volSpike(c), -1, 2],
  [(c) => P.threeBlack(c) && P.ema8Below21(c), -1, 2],
  [(c) => P.threeBlack(c) && P.aboveEma21(c), 0, 2],
  [(c) => P.threeBlack(c) && P.rsiOS(c), 0, 2],
  [(c) => P.threeBlack(c), -1, 1.5]
]);

add('5.3', 'Bullish Marubozu', 5, { method: 'price', stopMult: 1.2, rr: 2.2 }, [
  [(c) => P.marubozu(c) && P.upCandle(c) && P.alignBull(c), 1, 3],
  [(c) => P.marubozu(c) && P.upCandle(c) && P.volSpike(c), 1, 2.5],
  [(c) => P.marubozu(c) && P.upCandle(c) && P.aboveEma21(c), 1, 2],
  [(c) => P.marubozu(c) && P.upCandle(c) && P.structUp(c), 1, 2],
  [(c) => P.marubozu(c) && P.upCandle(c) && P.htfBull(c), 1, 2],
  [(c) => P.marubozu(c) && P.upCandle(c) && P.deltaPos(c), 1, 2],
  [(c) => P.marubozu(c) && P.upCandle(c) && P.aboveVwap(c), 1, 1.5],
  [(c) => P.marubozu(c) && P.upCandle(c), 1, 1.5],
  [(c) => P.marubozu(c) && P.upCandle(c) && P.rsiOB(c), 0, 1.5],
  [(c) => P.marubozu(c) && P.upCandle(c) && P.atrVeryHigh(c), 0, 1.5]
]);

add('5.4', 'Bearish Marubozu', 5, { method: 'price', stopMult: 1.2, rr: 2.2 }, [
  [(c) => P.marubozu(c) && P.downCandle(c) && P.alignBear(c), -1, 3],
  [(c) => P.marubozu(c) && P.downCandle(c) && P.volSpike(c), -1, 2.5],
  [(c) => P.marubozu(c) && P.downCandle(c) && P.belowEma21(c), -1, 2],
  [(c) => P.marubozu(c) && P.downCandle(c) && P.structDn(c), -1, 2],
  [(c) => P.marubozu(c) && P.downCandle(c) && P.htfBear(c), -1, 2],
  [(c) => P.marubozu(c) && P.downCandle(c) && P.deltaNeg(c), -1, 2],
  [(c) => P.marubozu(c) && P.downCandle(c) && P.belowVwap(c), -1, 1.5],
  [(c) => P.marubozu(c) && P.downCandle(c), -1, 1.5],
  [(c) => P.marubozu(c) && P.downCandle(c) && P.rsiOS(c), 0, 1.5],
  [(c) => P.marubozu(c) && P.downCandle(c) && P.atrVeryHigh(c), 0, 1.5]
]);

add('5.5', 'Bullish Flag Continuation', 5, { method: 'ema21', stopMult: 1.2, rr: 2.5 }, [
  [(c) => P.upCandle(c) && P.alignBull(c) && P.atrLow(c), 1, 2.5],
  [(c) => P.upCandle(c) && P.alignBull(c) && P.ribbonTight(c), 1, 2],
  [(c) => P.upCandle(c) && P.alignBull(c) && P.rvolLow(c), 1, 2],
  [(c) => P.upCandle(c) && P.alignBull(c) && P.aboveEma21(c), 1, 2],
  [(c) => P.upCandle(c) && P.alignBull(c) && P.adxStrong(c), 1, 2],
  [(c) => P.upCandle(c) && P.alignBull(c) && P.structUp(c), 1, 2],
  [(c) => P.upCandle(c) && P.alignBull(c) && P.macdHistRising(c), 1, 1.5],
  [(c) => P.upCandle(c) && P.alignBull(c), 1, 1.5],
  [(c) => P.upCandle(c) && P.alignBull(c) && P.rsiOB(c), 0, 2],
  [(c) => P.upCandle(c) && P.alignBull(c) && P.volClimax(c), 0, 1.5]
]);

add('5.6', 'Bearish Flag Continuation', 5, { method: 'ema21', stopMult: 1.2, rr: 2.5 }, [
  [(c) => P.downCandle(c) && P.alignBear(c) && P.atrLow(c), -1, 2.5],
  [(c) => P.downCandle(c) && P.alignBear(c) && P.ribbonTight(c), -1, 2],
  [(c) => P.downCandle(c) && P.alignBear(c) && P.rvolLow(c), -1, 2],
  [(c) => P.downCandle(c) && P.alignBear(c) && P.belowEma21(c), -1, 2],
  [(c) => P.downCandle(c) && P.alignBear(c) && P.adxStrong(c), -1, 2],
  [(c) => P.downCandle(c) && P.alignBear(c) && P.structDn(c), -1, 2],
  [(c) => P.downCandle(c) && P.alignBear(c) && P.macdHistFalling(c), -1, 1.5],
  [(c) => P.downCandle(c) && P.alignBear(c), -1, 1.5],
  [(c) => P.downCandle(c) && P.alignBear(c) && P.rsiOS(c), 0, 2],
  [(c) => P.downCandle(c) && P.alignBear(c) && P.volClimax(c), 0, 1.5]
]);

add('5.7', 'Continuation Volume Confirm', 5, { method: 'price', stopMult: 1.2, rr: 2.2 }, [
  [(c) => P.threeWhite(c) && P.volSpike(c), 1, 3],
  [(c) => P.threeBlack(c) && P.volSpike(c), -1, 3],
  [(c) => P.marubozu(c) && P.upCandle(c) && P.volSpike(c), 1, 2.5],
  [(c) => P.marubozu(c) && P.downCandle(c) && P.volSpike(c), -1, 2.5],
  [(c) => P.upCandle(c) && P.obvRising(c) && P.alignBull(c), 1, 2],
  [(c) => P.downCandle(c) && P.obvFalling(c) && P.alignBear(c), -1, 2],
  [(c) => P.upCandle(c) && P.tapeBull(c), 1, 1.5],
  [(c) => P.downCandle(c) && P.tapeBear(c), -1, 1.5],
  [(c) => P.upCandle(c) && P.rvolLow(c), 0, 1.5],
  [(c) => P.downCandle(c) && P.rvolLow(c), 0, 1.5]
]);

add('5.8', 'Continuation MTF', 5, { method: 'price', stopMult: 1.3, rr: 2.6 }, [
  [(c) => P.threeWhite(c) && P.htfBull(c), 1, 3],
  [(c) => P.threeBlack(c) && P.htfBear(c), -1, 3],
  [(c) => P.marubozu(c) && P.upCandle(c) && P.h4Bull(c), 1, 2.5],
  [(c) => P.marubozu(c) && P.downCandle(c) && P.h4Bear(c), -1, 2.5],
  [(c) => P.upCandle(c) && P.alignBull(c) && P.htfBull(c), 1, 2.5],
  [(c) => P.downCandle(c) && P.alignBear(c) && P.htfBear(c), -1, 2.5],
  [(c) => P.upCandle(c) && P.htfBull(c) && P.structUp(c), 1, 2],
  [(c) => P.downCandle(c) && P.htfBear(c) && P.structDn(c), -1, 2],
  [(c) => P.upCandle(c) && P.htfBear(c), 0, 1.5],
  [(c) => P.downCandle(c) && P.htfBull(c), 0, 1.5]
]);

add('5.9', 'Continuation Risk Filter', 5, { method: 'price', stopMult: 1.4, rr: 2.0 }, [
  [(c) => P.threeWhite(c) && P.atrHigh(c), 0, 2],
  [(c) => P.threeBlack(c) && P.atrHigh(c), 0, 2],
  [(c) => P.threeWhite(c) && P.atrNormal(c), 1, 2],
  [(c) => P.threeBlack(c) && P.atrNormal(c), -1, 2],
  [(c) => P.marubozu(c) && P.atrNormal(c) && P.upCandle(c), 1, 2],
  [(c) => P.marubozu(c) && P.atrNormal(c) && P.downCandle(c), -1, 2],
  [(c) => P.upCandle(c) && P.rsiOB(c) && P.volClimax(c), 0, 2.5],
  [(c) => P.downCandle(c) && P.rsiOS(c) && P.volClimax(c), 0, 2.5],
  [(c) => P.upCandle(c) && P.spreadTight(c), 1, 1.5],
  [(c) => P.downCandle(c) && P.spreadTight(c), -1, 1.5]
]);

add('5.10', 'Continuation Compiler', 5, { method: 'ema21', stopMult: 1.2, rr: 2.4 }, [
  [(c) => P.threeWhite(c) && P.alignBull(c) && P.volSpike(c), 1, 4],
  [(c) => P.threeBlack(c) && P.alignBear(c) && P.volSpike(c), -1, 4],
  [(c) => P.marubozu(c) && P.alignBull(c) && P.upCandle(c), 1, 3],
  [(c) => P.marubozu(c) && P.alignBear(c) && P.downCandle(c), -1, 3],
  [(c) => P.threeWhite(c) && P.structUp(c), 1, 2.5],
  [(c) => P.threeBlack(c) && P.structDn(c), -1, 2.5],
  [(c) => P.upCandle(c) && P.alignBull(c) && P.aboveEma21(c), 1, 2],
  [(c) => P.downCandle(c) && P.alignBear(c) && P.belowEma21(c), -1, 2],
  [(c) => P.upCandle(c) && P.htfBull(c), 1, 2],
  [(c) => P.downCandle(c) && P.htfBear(c), -1, 2]
]);

// ===================== CATEGORY 6: SWING LEVEL MASTERS =====================
add('6.1', 'Swing High Resistance', 6, { method: 'swing', stopMult: 1.2, rr: 2.4 }, [
  [(c) => P.atLastH(c) && P.alignBear(c), -1, 3],
  [(c) => P.atLastH(c) && P.rsiOB(c), -1, 2.5],
  [(c) => P.atLastH(c) && P.pinBear(c), -1, 2.5],
  [(c) => P.atLastH(c) && P.rsiDivBear(c), -1, 3],
  [(c) => P.atLastH(c) && P.atResistance(c), -1, 2],
  [(c) => P.atLastH(c), -1, 2],
  [(c) => P.brokeResistance(c) && P.structUp(c), 1, 2],
  [(c) => P.atLastH(c) && P.fundingHigh(c), -1, 2],
  [(c) => P.atLastH(c) && P.volSpike(c), -1, 1.5],
  [(c) => P.atLastH(c) && P.alignBull(c), 0, 1.5]
]);

add('6.2', 'Swing Low Support', 6, { method: 'swing', stopMult: 1.2, rr: 2.4 }, [
  [(c) => P.atLastL(c) && P.alignBull(c), 1, 3],
  [(c) => P.atLastL(c) && P.rsiOS(c), 1, 2.5],
  [(c) => P.atLastL(c) && P.pinBull(c), 1, 2.5],
  [(c) => P.atLastL(c) && P.rsiDivBull(c), 1, 3],
  [(c) => P.atLastL(c) && P.atSupport(c), 1, 2],
  [(c) => P.atLastL(c), 1, 2],
  [(c) => P.brokeSupport(c) && P.structDn(c), -1, 2],
  [(c) => P.atLastL(c) && P.fundingLow(c), 1, 2],
  [(c) => P.atLastL(c) && P.volSpike(c), 1, 1.5],
  [(c) => P.atLastL(c) && P.alignBear(c), 0, 1.5]
]);

add('6.3', 'Structure Break Specialist', 6, { method: 'price', stopMult: 1.3, rr: 2.6 }, [
  [(c) => P.bosUp(c), 1, 2.5],
  [(c) => P.bosDn(c), -1, 2.5],
  [(c) => P.chochBull(c), 1, 3],
  [(c) => P.chochBear(c), -1, 3],
  [(c) => P.bosUp(c) && P.volSpike(c), 1, 3],
  [(c) => P.bosDn(c) && P.volSpike(c), -1, 3],
  [(c) => P.bosUp(c) && P.retestAboveLastH(c), 1, 2.5],
  [(c) => P.bosDn(c) && P.retestBelowLastL(c), -1, 2.5],
  [(c) => P.bosUp(c) && P.htfBear(c), 0, 2],
  [(c) => P.bosDn(c) && P.htfBull(c), 0, 2]
]);

add('6.4', 'Equal Highs Rejection', 6, { method: 'swing', stopMult: 1.2, rr: 2.5 }, [
  [(c) => P.atLastH(c) && P.doubleTop(c), -1, 3],
  [(c) => P.atLastL(c) && P.doubleBottom(c), 1, 3],
  [(c) => P.atLastH(c) && P.pinBear(c), -1, 2.5],
  [(c) => P.atLastL(c) && P.pinBull(c), 1, 2.5],
  [(c) => P.atLastH(c) && P.rsiDivBear(c), -1, 2.5],
  [(c) => P.atLastL(c) && P.rsiDivBull(c), 1, 2.5],
  [(c) => P.atLastH(c) && P.engulfBear(c), -1, 2],
  [(c) => P.atLastL(c) && P.engulfBull(c), 1, 2],
  [(c) => P.atLastH(c) && P.volClimax(c), -1, 2],
  [(c) => P.atLastL(c) && P.volClimax(c), 1, 2]
]);

add('6.5', 'Swing Trendline Touch', 6, { method: 'swing', stopMult: 1.2, rr: 2.4 }, [
  [(c) => P.trendlineUpTouch(c), 1, 2.5],
  [(c) => P.trendlineDnTouch(c), -1, 2.5],
  [(c) => P.trendlineUpTouch(c) && P.pinBull(c), 1, 3],
  [(c) => P.trendlineDnTouch(c) && P.pinBear(c), -1, 3],
  [(c) => P.trendlineUpBreak(c), 1, 2],
  [(c) => P.trendlineDnBreak(c), -1, 2],
  [(c) => P.trendlineUpTouch(c) && P.alignBull(c), 1, 2],
  [(c) => P.trendlineDnTouch(c) && P.alignBear(c), -1, 2],
  [(c) => P.trendlineUpTouch(c) && P.volSpike(c), 1, 2],
  [(c) => P.trendlineDnTouch(c) && P.volSpike(c), -1, 2]
]);

add('6.6', 'Swing Retest Confirm', 6, { method: 'swing', stopMult: 1.2, rr: 2.5 }, [
  [(c) => P.retestAboveLastH(c), 1, 3],
  [(c) => P.retestBelowLastL(c), -1, 3],
  [(c) => P.retestAboveLastH(c) && P.pinBull(c), 1, 3],
  [(c) => P.retestBelowLastL(c) && P.pinBear(c), -1, 3],
  [(c) => P.retestAboveLastH(c) && P.volSpike(c), 1, 2],
  [(c) => P.retestBelowLastL(c) && P.volSpike(c), -1, 2],
  [(c) => P.retestAboveLastH(c) && P.rsiDivBull(c), 1, 2],
  [(c) => P.retestBelowLastL(c) && P.rsiDivBear(c), -1, 2],
  [(c) => P.retestAboveLastH(c) && P.htfBull(c), 1, 2],
  [(c) => P.retestBelowLastL(c) && P.htfBear(c), -1, 2]
]);

add('6.7', 'Swing Failure Retrace', 6, { method: 'swing', stopMult: 1.2, rr: 2.4 }, [
  [(c) => P.atLastH(c) && P.alignBear(c) && P.rsiDivBear(c), -1, 3],
  [(c) => P.atLastL(c) && P.alignBull(c) && P.rsiDivBull(c), 1, 3],
  [(c) => P.brokeResistance(c) && P.closeBackBelowH(c), -1, 2.5],
  [(c) => P.brokeSupport(c) && P.closeBackAboveL(c), 1, 2.5],
  [(c) => P.atLastH(c) && P.macdHistFalling(c), -1, 2],
  [(c) => P.atLastL(c) && P.macdHistRising(c), 1, 2],
  [(c) => P.atLastH(c) && P.volClimax(c), -1, 2],
  [(c) => P.atLastL(c) && P.volClimax(c), 1, 2],
  [(c) => P.brokeResistance(c), 0, 2],
  [(c) => P.brokeSupport(c), 0, 2]
]);

add('6.8', 'Swing Volume Break', 6, { method: 'price', stopMult: 1.3, rr: 2.6 }, [
  [(c) => P.brokeResistance(c) && P.volSpike(c), 1, 3],
  [(c) => P.brokeSupport(c) && P.volSpike(c), -1, 3],
  [(c) => P.bosUp(c) && P.volSpike(c), 1, 2.5],
  [(c) => P.bosDn(c) && P.volSpike(c), -1, 2.5],
  [(c) => P.brokeResistance(c) && P.tapeBull(c), 1, 2],
  [(c) => P.brokeSupport(c) && P.tapeBear(c), -1, 2],
  [(c) => P.brokeResistance(c) && P.obvRising(c), 1, 2],
  [(c) => P.brokeSupport(c) && P.obvFalling(c), -1, 2],
  [(c) => P.brokeResistance(c) && P.rvolLow(c), 0, 2],
  [(c) => P.brokeSupport(c) && P.rvolLow(c), 0, 2]
]);

add('6.9', 'Swing MTF Levels', 6, { method: 'swing', stopMult: 1.3, rr: 2.6 }, [
  [(c) => P.atLastH(c) && P.h4Bear(c), -1, 3],
  [(c) => P.atLastL(c) && P.h4Bull(c), 1, 3],
  [(c) => P.atLastH(c) && P.htfBear(c), -1, 2.5],
  [(c) => P.atLastL(c) && P.htfBull(c), 1, 2.5],
  [(c) => P.atLastH(c) && P.atResistance(c) && P.h4Bear(c), -1, 3],
  [(c) => P.atLastL(c) && P.atSupport(c) && P.h4Bull(c), 1, 3],
  [(c) => P.brokeResistance(c) && P.h4Bull(c), 1, 2],
  [(c) => P.brokeSupport(c) && P.h4Bear(c), -1, 2],
  [(c) => P.atLastH(c) && P.h4Bull(c), 0, 1.5],
  [(c) => P.atLastL(c) && P.h4Bear(c), 0, 1.5]
]);

add('6.10', 'Swing Compiler', 6, { method: 'swing', stopMult: 1.2, rr: 2.5 }, [
  [(c) => P.atLastH(c) && P.pinBear(c) && P.rsiDivBear(c), -1, 3.5],
  [(c) => P.atLastL(c) && P.pinBull(c) && P.rsiDivBull(c), 1, 3.5],
  [(c) => P.brokeResistance(c) && P.retestAboveLastH(c) && P.volSpike(c), 1, 3],
  [(c) => P.brokeSupport(c) && P.retestBelowLastL(c) && P.volSpike(c), -1, 3],
  [(c) => P.atLastH(c) && P.engulfBear(c), -1, 2.5],
  [(c) => P.atLastL(c) && P.engulfBull(c), 1, 2.5],
  [(c) => P.atLastH(c) && P.atResistance(c), -1, 2],
  [(c) => P.atLastL(c) && P.atSupport(c), 1, 2],
  [(c) => P.bosUp(c), 1, 2],
  [(c) => P.bosDn(c), -1, 2]
]);

// ===================== CATEGORY 7: PIVOT POINT MASTERS =====================
add('7.1', 'Pivot R1 Rejection', 7, { method: 'pivot', stopMult: 1.2, rr: 2.4 }, [
  [(c) => P.nearR1(c) && P.pinBear(c), -1, 3],
  [(c) => P.nearR1(c) && P.rsiOB(c), -1, 2.5],
  [(c) => P.nearR1(c) && P.engulfBear(c), -1, 2.5],
  [(c) => P.nearR1(c) && P.rsiDivBear(c), -1, 2.5],
  [(c) => P.nearR1(c) && P.atResistance(c), -1, 2],
  [(c) => P.aboveR1(c), -1, 2],
  [(c) => P.nearR1(c) && P.volClimax(c), -1, 2],
  [(c) => P.nearR1(c) && P.alignBull(c), 0, 1.5],
  [(c) => P.nearR1(c), -1, 2],
  [(c) => P.aboveR1(c) && P.structUp(c), 1, 1.5]
]);

add('7.2', 'Pivot S1 Rejection', 7, { method: 'pivot', stopMult: 1.2, rr: 2.4 }, [
  [(c) => P.nearS1(c) && P.pinBull(c), 1, 3],
  [(c) => P.nearS1(c) && P.rsiOS(c), 1, 2.5],
  [(c) => P.nearS1(c) && P.engulfBull(c), 1, 2.5],
  [(c) => P.nearS1(c) && P.rsiDivBull(c), 1, 2.5],
  [(c) => P.nearS1(c) && P.atSupport(c), 1, 2],
  [(c) => P.belowS1(c), 1, 2],
  [(c) => P.nearS1(c) && P.volClimax(c), 1, 2],
  [(c) => P.nearS1(c) && P.alignBear(c), 0, 1.5],
  [(c) => P.nearS1(c), 1, 2],
  [(c) => P.belowS1(c) && P.structDn(c), -1, 1.5]
]);

add('7.3', 'Pivot Break Trader', 7, { method: 'price', stopMult: 1.3, rr: 2.6 }, [
  [(c) => P.aboveR1(c) && P.volSpike(c), 1, 3],
  [(c) => P.belowS1(c) && P.volSpike(c), -1, 3],
  [(c) => P.aboveR1(c) && P.structUp(c), 1, 2.5],
  [(c) => P.belowS1(c) && P.structDn(c), -1, 2.5],
  [(c) => P.aboveR1(c) && P.aboveVwap(c), 1, 2],
  [(c) => P.belowS1(c) && P.belowVwap(c), -1, 2],
  [(c) => P.aboveR1(c) && P.alignBull(c), 1, 2],
  [(c) => P.belowS1(c) && P.alignBear(c), -1, 2],
  [(c) => P.aboveR1(c) && P.rvolLow(c), 0, 2],
  [(c) => P.belowS1(c) && P.rvolLow(c), 0, 2]
]);

add('7.4', 'Pivot Midpoint Reclaim', 7, { method: 'pivot', stopMult: 1.2, rr: 2.4 }, [
  [(c) => P.abovePivotP(c) && P.aboveEma21(c), 1, 2.5],
  [(c) => P.belowPivotP(c) && P.belowEma21(c), -1, 2.5],
  [(c) => P.abovePivotP(c) && P.aboveVwap(c), 1, 2],
  [(c) => P.belowPivotP(c) && P.belowVwap(c), -1, 2],
  [(c) => P.abovePivotP(c) && P.structUp(c), 1, 2],
  [(c) => P.belowPivotP(c) && P.structDn(c), -1, 2],
  [(c) => P.abovePivotP(c), 1, 1.5],
  [(c) => P.belowPivotP(c), -1, 1.5],
  [(c) => P.abovePivotP(c) && P.rsiOB(c), 0, 1.5],
  [(c) => P.belowPivotP(c) && P.rsiOS(c), 0, 1.5]
]);

add('7.5', 'Pivot MTF Confluence', 7, { method: 'pivot', stopMult: 1.3, rr: 2.6 }, [
  [(c) => P.nearR1(c) && P.h4Bear(c), -1, 3],
  [(c) => P.nearS1(c) && P.h4Bull(c), 1, 3],
  [(c) => P.nearR1(c) && P.htfBear(c), -1, 2.5],
  [(c) => P.nearS1(c) && P.htfBull(c), 1, 2.5],
  [(c) => P.aboveR1(c) && P.h4Bull(c), 1, 2.5],
  [(c) => P.belowS1(c) && P.h4Bear(c), -1, 2.5],
  [(c) => P.nearR1(c) && P.atResistance(c), -1, 2],
  [(c) => P.nearS1(c) && P.atSupport(c), 1, 2],
  [(c) => P.nearR1(c) && P.h4Bull(c), 0, 1.5],
  [(c) => P.nearS1(c) && P.h4Bear(c), 0, 1.5]
]);

add('7.6', 'Pivot Volume Confirm', 7, { method: 'pivot', stopMult: 1.2, rr: 2.2 }, [
  [(c) => P.nearR1(c) && P.volClimax(c), -1, 2.5],
  [(c) => P.nearS1(c) && P.volClimax(c), 1, 2.5],
  [(c) => P.nearR1(c) && P.volSpike(c) && P.tapeBear(c), -1, 2.5],
  [(c) => P.nearS1(c) && P.volSpike(c) && P.tapeBull(c), 1, 2.5],
  [(c) => P.aboveR1(c) && P.obvRising(c), 1, 2],
  [(c) => P.belowS1(c) && P.obvFalling(c), -1, 2],
  [(c) => P.nearR1(c) && P.deltaNeg(c), -1, 2],
  [(c) => P.nearS1(c) && P.deltaPos(c), 1, 2],
  [(c) => P.aboveR1(c) && P.rvolLow(c), 0, 2],
  [(c) => P.belowS1(c) && P.rvolLow(c), 0, 2]
]);

add('7.7', 'Pivot Range Trader', 7, { method: 'pivot', stopMult: 1.1, rr: 2.0 }, [
  [(c) => P.nearS1(c) && P.nearR1(c) === false && P.structNeutral(c), 1, 2],
  [(c) => P.nearR1(c) && P.structNeutral(c), -1, 2],
  [(c) => P.nearS1(c) && P.structNeutral(c), 1, 2],
  [(c) => P.nearR1(c) && P.nearS1(c) && P.alignMixed(c), 0, 2.5],
  [(c) => P.abovePivotP(c) && P.belowR1(c) && P.alignMixed(c), 0, 2],
  [(c) => P.belowPivotP(c) && P.aboveS1(c) && P.alignMixed(c), 0, 2],
  [(c) => P.nearR1(c) && P.squeezeOn(c), 0, 2],
  [(c) => P.nearS1(c) && P.squeezeOn(c), 0, 2],
  [(c) => P.nearR1(c) && P.adxWeak(c), -1, 1.5],
  [(c) => P.nearS1(c) && P.adxWeak(c), 1, 1.5]
]);

add('7.8', 'Pivot Risk Specialist', 7, { method: 'pivot', stopMult: 1.4, rr: 2.0 }, [
  [(c) => P.nearR1(c) && P.spreadWide(c), 0, 2.5],
  [(c) => P.nearS1(c) && P.spreadWide(c), 0, 2.5],
  [(c) => P.nearR1(c) && P.atrHigh(c), -1, 1.5],
  [(c) => P.nearS1(c) && P.atrHigh(c), 1, 1.5],
  [(c) => P.nearR1(c) && P.spreadTight(c), -1, 2],
  [(c) => P.nearS1(c) && P.spreadTight(c), 1, 2],
  [(c) => P.nearR1(c) && P.atrNormal(c), -1, 2],
  [(c) => P.nearS1(c) && P.atrNormal(c), 1, 2],
  [(c) => P.nearR1(c) && P.atrVeryHigh(c), 0, 2.5],
  [(c) => P.nearS1(c) && P.atrVeryHigh(c), 0, 2.5]
]);

add('7.9', 'Pivot R2/S2 Specialist', 7, { method: 'pivot', stopMult: 1.3, rr: 2.6 }, [
  [(c) => P.near(c, 'R2') && P.pinBear(c), -1, 3],
  [(c) => P.near(c, 'S2') && P.pinBull(c), 1, 3],
  [(c) => P.near(c, 'R2') && P.volClimax(c), -1, 2.5],
  [(c) => P.near(c, 'S2') && P.volClimax(c), 1, 2.5],
  [(c) => P.near(c, 'R2') && P.rsiOB(c), -1, 2],
  [(c) => P.near(c, 'S2') && P.rsiOS(c), 1, 2],
  [(c) => P.near(c, 'R3') && P.alignBear(c), -1, 2.5],
  [(c) => P.near(c, 'S3') && P.alignBull(c), 1, 2.5],
  [(c) => P.near(c, 'R2') && P.fundingHigh(c), -1, 2],
  [(c) => P.near(c, 'S2') && P.fundingLow(c), 1, 2]
]);

add('7.10', 'Pivot Compiler', 7, { method: 'pivot', stopMult: 1.2, rr: 2.5 }, [
  [(c) => P.nearR1(c) && P.atResistance(c) && P.pinBear(c), -1, 3.5],
  [(c) => P.nearS1(c) && P.atSupport(c) && P.pinBull(c), 1, 3.5],
  [(c) => P.aboveR1(c) && P.retestAboveLastH(c), 1, 3],
  [(c) => P.belowS1(c) && P.retestBelowLastL(c), -1, 3],
  [(c) => P.abovePivotP(c) && P.htfBull(c), 1, 2.5],
  [(c) => P.belowPivotP(c) && P.htfBear(c), -1, 2.5],
  [(c) => P.nearR1(c) && P.rsiDivBear(c), -1, 2.5],
  [(c) => P.nearS1(c) && P.rsiDivBull(c), 1, 2.5],
  [(c) => P.aboveR1(c) && P.alignBull(c), 1, 2],
  [(c) => P.belowS1(c) && P.alignBear(c), -1, 2]
]);

// ===================== CATEGORY 8: DYNAMIC LEVEL MASTERS ===================
add('8.1', 'Dynamic Support Bounce', 8, { method: 'swing', stopMult: 1.2, rr: 2.4 }, [
  [(c) => P.atSupport(c) && P.pinBull(c), 1, 3],
  [(c) => P.atSupport(c) && P.engulfBull(c), 1, 2.5],
  [(c) => P.atSupport(c) && P.hammer(c), 1, 2.5],
  [(c) => P.atSupport(c) && P.rsiDivBull(c), 1, 2.5],
  [(c) => P.atSupport(c) && P.alignBull(c), 1, 2],
  [(c) => P.atSupport(c) && P.volSpike(c), 1, 2],
  [(c) => P.atSupport(c) && P.structUp(c), 1, 2],
  [(c) => P.atSupport(c), 1, 1.5],
  [(c) => P.atSupport(c) && P.rvolLow(c), 0, 1.5],
  [(c) => P.atSupport(c) && P.alignBear(c), 0, 1.5]
]);

add('8.2', 'Dynamic Resistance Reject', 8, { method: 'swing', stopMult: 1.2, rr: 2.4 }, [
  [(c) => P.atResistance(c) && P.pinBear(c), -1, 3],
  [(c) => P.atResistance(c) && P.engulfBear(c), -1, 2.5],
  [(c) => P.atResistance(c) && P.shootingStar(c), -1, 2.5],
  [(c) => P.atResistance(c) && P.rsiDivBear(c), -1, 2.5],
  [(c) => P.atResistance(c) && P.alignBear(c), -1, 2],
  [(c) => P.atResistance(c) && P.volSpike(c), -1, 2],
  [(c) => P.atResistance(c) && P.structDn(c), -1, 2],
  [(c) => P.atResistance(c), -1, 1.5],
  [(c) => P.atResistance(c) && P.rvolLow(c), 0, 1.5],
  [(c) => P.atResistance(c) && P.alignBull(c), 0, 1.5]
]);

add('8.3', 'Dynamic Level Break', 8, { method: 'price', stopMult: 1.3, rr: 2.6 }, [
  [(c) => P.brokeResistance(c) && P.volSpike(c), 1, 3],
  [(c) => P.brokeSupport(c) && P.volSpike(c), -1, 3],
  [(c) => P.brokeResistance(c) && P.retestAboveLastH(c), 1, 2.5],
  [(c) => P.brokeSupport(c) && P.retestBelowLastL(c), -1, 2.5],
  [(c) => P.brokeResistance(c) && P.alignBull(c), 1, 2],
  [(c) => P.brokeSupport(c) && P.alignBear(c), -1, 2],
  [(c) => P.brokeResistance(c) && P.htfBull(c), 1, 2],
  [(c) => P.brokeSupport(c) && P.htfBear(c), -1, 2],
  [(c) => P.brokeResistance(c) && P.rvolLow(c), 0, 2],
  [(c) => P.brokeSupport(c) && P.rvolLow(c), 0, 2]
]);

add('8.4', 'Dynamic Level Flip', 8, { method: 'swing', stopMult: 1.2, rr: 2.5 }, [
  [(c) => P.brokeResistance(c) && P.retestAboveLastH(c) && P.atSupport(c), 1, 3],
  [(c) => P.brokeSupport(c) && P.retestBelowLastL(c) && P.atResistance(c), -1, 3],
  [(c) => P.brokeResistance(c) && P.atSupport(c), 1, 2.5],
  [(c) => P.brokeSupport(c) && P.atResistance(c), -1, 2.5],
  [(c) => P.brokeResistance(c) && P.htfBull(c), 1, 2],
  [(c) => P.brokeSupport(c) && P.htfBear(c), -1, 2],
  [(c) => P.brokeResistance(c) && P.pinBull(c), 1, 2],
  [(c) => P.brokeSupport(c) && P.pinBear(c), -1, 2],
  [(c) => P.brokeResistance(c), 1, 1.5],
  [(c) => P.brokeSupport(c), -1, 1.5]
]);

add('8.5', 'Dynamic MTF Levels', 8, { method: 'swing', stopMult: 1.3, rr: 2.6 }, [
  [(c) => P.atSupport(c) && P.h4Bull(c), 1, 3],
  [(c) => P.atResistance(c) && P.h4Bear(c), -1, 3],
  [(c) => P.atSupport(c) && P.htfBull(c), 1, 2.5],
  [(c) => P.atResistance(c) && P.htfBear(c), -1, 2.5],
  [(c) => P.brokeResistance(c) && P.h4Bull(c), 1, 2.5],
  [(c) => P.brokeSupport(c) && P.h4Bear(c), -1, 2.5],
  [(c) => P.atSupport(c) && P.h4Bear(c), 0, 2],
  [(c) => P.atResistance(c) && P.h4Bull(c), 0, 2],
  [(c) => P.atSupport(c) && P.m5Bull(c), 1, 1.5],
  [(c) => P.atResistance(c) && P.m5Bear(c), -1, 1.5]
]);

add('8.6', 'Dynamic Level Wick Study', 8, { method: 'price', stopMult: 1.2, rr: 2.4 }, [
  [(c) => P.atSupport(c) && P.pinBull(c) && P.longLowerWick(c), 1, 3],
  [(c) => P.atResistance(c) && P.pinBear(c) && P.longUpperWick(c), -1, 3],
  [(c) => P.atSupport(c) && P.doji(c), 0, 2],
  [(c) => P.atResistance(c) && P.doji(c), 0, 2],
  [(c) => P.atSupport(c) && P.atLastL(c), 1, 2],
  [(c) => P.atResistance(c) && P.atLastH(c), -1, 2],
  [(c) => P.atSupport(c) && P.hammer(c), 1, 2],
  [(c) => P.atResistance(c) && P.shootingStar(c), -1, 2],
  [(c) => P.atSupport(c) && P.volClimax(c), 1, 2],
  [(c) => P.atResistance(c) && P.volClimax(c), -1, 2]
]);

add('8.7', 'Dynamic Level Volume', 8, { method: 'price', stopMult: 1.2, rr: 2.2 }, [
  [(c) => P.atSupport(c) && P.volSpike(c), 1, 2.5],
  [(c) => P.atResistance(c) && P.volSpike(c), -1, 2.5],
  [(c) => P.atSupport(c) && P.tapeBull(c), 1, 2],
  [(c) => P.atResistance(c) && P.tapeBear(c), -1, 2],
  [(c) => P.atSupport(c) && P.deltaPos(c), 1, 2],
  [(c) => P.atResistance(c) && P.deltaNeg(c), -1, 2],
  [(c) => P.atSupport(c) && P.obvRising(c), 1, 2],
  [(c) => P.atResistance(c) && P.obvFalling(c), -1, 2],
  [(c) => P.atSupport(c) && P.rvolLow(c), 0, 1.5],
  [(c) => P.atResistance(c) && P.rvolLow(c), 0, 1.5]
]);

add('8.8', 'Dynamic Level ATR Filter', 8, { method: 'swing', stopMult: 1.4, rr: 2.0 }, [
  [(c) => P.atSupport(c) && P.atrNormal(c), 1, 2],
  [(c) => P.atResistance(c) && P.atrNormal(c), -1, 2],
  [(c) => P.atSupport(c) && P.atrHigh(c), 0, 2],
  [(c) => P.atResistance(c) && P.atrHigh(c), 0, 2],
  [(c) => P.atSupport(c) && P.atrVeryHigh(c), 0, 2.5],
  [(c) => P.atResistance(c) && P.atrVeryHigh(c), 0, 2.5],
  [(c) => P.atSupport(c) && P.spreadTight(c), 1, 1.5],
  [(c) => P.atResistance(c) && P.spreadTight(c), -1, 1.5],
  [(c) => P.atSupport(c) && P.atrLow(c), 1, 1.5],
  [(c) => P.atResistance(c) && P.atrLow(c), -1, 1.5]
]);

add('8.9', 'Dynamic Cluster Finder', 8, { method: 'swing', stopMult: 1.2, rr: 2.5 }, [
  [(c) => P.atSupport(c) && P.atPoc(c), 1, 2.5],
  [(c) => P.atResistance(c) && P.atPoc(c), -1, 2.5],
  [(c) => P.atSupport(c) && P.nearFib618(c), 1, 2.5],
  [(c) => P.atResistance(c) && P.nearFib382(c), -1, 2.5],
  [(c) => P.atSupport(c) && P.nearS1(c), 1, 2.5],
  [(c) => P.atResistance(c) && P.nearR1(c), -1, 2.5],
  [(c) => P.atSupport(c) && P.atVal(c), 1, 2],
  [(c) => P.atResistance(c) && P.atVah(c), -1, 2],
  [(c) => P.atSupport(c) && P.nearVwap(c), 1, 2],
  [(c) => P.atResistance(c) && P.nearVwap(c), -1, 2]
]);

add('8.10', 'Dynamic Level Compiler', 8, { method: 'swing', stopMult: 1.2, rr: 2.5 }, [
  [(c) => P.atSupport(c) && P.rsiDivBull(c) && P.volSpike(c), 1, 3.5],
  [(c) => P.atResistance(c) && P.rsiDivBear(c) && P.volSpike(c), -1, 3.5],
  [(c) => P.atSupport(c) && P.pinBull(c), 1, 3],
  [(c) => P.atResistance(c) && P.pinBear(c), -1, 3],
  [(c) => P.brokeResistance(c) && P.retestAboveLastH(c), 1, 3],
  [(c) => P.brokeSupport(c) && P.retestBelowLastL(c), -1, 3],
  [(c) => P.atSupport(c) && P.alignBull(c), 1, 2],
  [(c) => P.atResistance(c) && P.alignBear(c), -1, 2],
  [(c) => P.atSupport(c), 1, 1.5],
  [(c) => P.atResistance(c), -1, 1.5]
]);

// ===================== CATEGORY 9: TRENDLINE MASTERS =======================
add('9.1', 'Bull Trendline Bounce', 9, { method: 'swing', stopMult: 1.2, rr: 2.4 }, [
  [(c) => P.trendlineUpTouch(c) && P.pinBull(c), 1, 3],
  [(c) => P.trendlineUpTouch(c) && P.hammer(c), 1, 2.5],
  [(c) => P.trendlineUpTouch(c) && P.alignBull(c), 1, 2.5],
  [(c) => P.trendlineUpTouch(c) && P.rsiDivBull(c), 1, 2.5],
  [(c) => P.trendlineUpTouch(c) && P.volSpike(c), 1, 2],
  [(c) => P.trendlineUpTouch(c), 1, 1.5],
  [(c) => P.trendlineUpTouch(c) && P.htfBull(c), 1, 2],
  [(c) => P.trendlineUpTouch(c) && P.atSupport(c), 1, 2],
  [(c) => P.trendlineUpTouch(c) && P.structUp(c), 1, 2],
  [(c) => P.trendlineUpTouch(c) && P.rvolLow(c), 0, 1.5]
]);

add('9.2', 'Bear Trendline Bounce', 9, { method: 'swing', stopMult: 1.2, rr: 2.4 }, [
  [(c) => P.trendlineDnTouch(c) && P.pinBear(c), -1, 3],
  [(c) => P.trendlineDnTouch(c) && P.shootingStar(c), -1, 2.5],
  [(c) => P.trendlineDnTouch(c) && P.alignBear(c), -1, 2.5],
  [(c) => P.trendlineDnTouch(c) && P.rsiDivBear(c), -1, 2.5],
  [(c) => P.trendlineDnTouch(c) && P.volSpike(c), -1, 2],
  [(c) => P.trendlineDnTouch(c), -1, 1.5],
  [(c) => P.trendlineDnTouch(c) && P.htfBear(c), -1, 2],
  [(c) => P.trendlineDnTouch(c) && P.atResistance(c), -1, 2],
  [(c) => P.trendlineDnTouch(c) && P.structDn(c), -1, 2],
  [(c) => P.trendlineDnTouch(c) && P.rvolLow(c), 0, 1.5]
]);

add('9.3', 'Trendline Breakout', 9, { method: 'price', stopMult: 1.3, rr: 2.6 }, [
  [(c) => P.trendlineUpBreak(c) && P.volSpike(c), 1, 3],
  [(c) => P.trendlineDnBreak(c) && P.volSpike(c), -1, 3],
  [(c) => P.trendlineUpBreak(c) && P.retestAboveLastH(c), 1, 2.5],
  [(c) => P.trendlineDnBreak(c) && P.retestBelowLastL(c), -1, 2.5],
  [(c) => P.trendlineUpBreak(c) && P.alignBull(c), 1, 2],
  [(c) => P.trendlineDnBreak(c) && P.alignBear(c), -1, 2],
  [(c) => P.trendlineUpBreak(c) && P.htfBull(c), 1, 2],
  [(c) => P.trendlineDnBreak(c) && P.htfBear(c), -1, 2],
  [(c) => P.trendlineUpBreak(c) && P.rvolLow(c), 0, 2],
  [(c) => P.trendlineDnBreak(c) && P.rvolLow(c), 0, 2]
]);

add('9.4', 'Trendline Fake Break', 9, { method: 'swing', stopMult: 1.2, rr: 2.8 }, [
  [(c) => P.trendlineDnFake(c), 1, 3],
  [(c) => P.trendlineUpFake(c), -1, 3],
  [(c) => P.trendlineDnFake(c) && P.pinBull(c), 1, 3],
  [(c) => P.trendlineUpFake(c) && P.pinBear(c), -1, 3],
  [(c) => P.trendlineDnFake(c) && P.rsiDivBull(c), 1, 2.5],
  [(c) => P.trendlineUpFake(c) && P.rsiDivBear(c), -1, 2.5],
  [(c) => P.trendlineDnFake(c) && P.volClimax(c), 1, 2.5],
  [(c) => P.trendlineUpFake(c) && P.volClimax(c), -1, 2.5],
  [(c) => P.trendlineDnFake(c) && P.htfBull(c), 1, 2],
  [(c) => P.trendlineUpFake(c) && P.htfBear(c), -1, 2]
]);

add('9.5', 'Trendline MTF', 9, { method: 'swing', stopMult: 1.3, rr: 2.6 }, [
  [(c) => P.trendlineUpTouch(c) && P.h4Bull(c), 1, 3],
  [(c) => P.trendlineDnTouch(c) && P.h4Bear(c), -1, 3],
  [(c) => P.trendlineUpTouch(c) && P.htfBull(c), 1, 2.5],
  [(c) => P.trendlineDnTouch(c) && P.htfBear(c), -1, 2.5],
  [(c) => P.trendlineUpBreak(c) && P.h4Bull(c), 1, 2.5],
  [(c) => P.trendlineDnBreak(c) && P.h4Bear(c), -1, 2.5],
  [(c) => P.trendlineUpTouch(c) && P.h4Bear(c), 0, 2],
  [(c) => P.trendlineDnTouch(c) && P.h4Bull(c), 0, 2],
  [(c) => P.trendlineUpTouch(c) && P.d1Bull(c), 1, 2],
  [(c) => P.trendlineDnTouch(c) && P.d1Bear(c), -1, 2]
]);

add('9.6', 'Trendline Angle Study', 9, { method: 'swing', stopMult: 1.2, rr: 2.4 }, [
  [(c) => P.trendlineUpTouch(c) && P.steepUpLine(c), 0, 2],
  [(c) => P.trendlineDnTouch(c) && P.steepDnLine(c), 0, 2],
  [(c) => P.trendlineUpTouch(c) && P.htfTrendUp(c), 1, 2],
  [(c) => P.trendlineDnTouch(c) && P.htfTrendDn(c), -1, 2],
  [(c) => P.trendlineUpTouch(c) && P.alignMixed(c), 1, 1.5],
  [(c) => P.trendlineDnTouch(c) && P.alignMixed(c), -1, 1.5],
  [(c) => P.trendlineUpTouch(c) && P.macdHistRising(c), 1, 1.5],
  [(c) => P.trendlineDnTouch(c) && P.macdHistFalling(c), -1, 1.5],
  [(c) => P.trendlineUpTouch(c) && P.adxWeak(c), 0, 1.5],
  [(c) => P.trendlineDnTouch(c) && P.adxWeak(c), 0, 1.5]
]);

add('9.7', 'Trendline Volume Confirm', 9, { method: 'price', stopMult: 1.2, rr: 2.2 }, [
  [(c) => P.trendlineUpTouch(c) && P.volSpike(c), 1, 2.5],
  [(c) => P.trendlineDnTouch(c) && P.volSpike(c), -1, 2.5],
  [(c) => P.trendlineUpTouch(c) && P.tapeBull(c), 1, 2],
  [(c) => P.trendlineDnTouch(c) && P.tapeBear(c), -1, 2],
  [(c) => P.trendlineUpBreak(c) && P.obvRising(c), 1, 2],
  [(c) => P.trendlineDnBreak(c) && P.obvFalling(c), -1, 2],
  [(c) => P.trendlineUpTouch(c) && P.rvolLow(c), 0, 2],
  [(c) => P.trendlineDnTouch(c) && P.rvolLow(c), 0, 2],
  [(c) => P.trendlineUpTouch(c) && P.deltaPos(c), 1, 1.5],
  [(c) => P.trendlineDnTouch(c) && P.deltaNeg(c), -1, 1.5]
]);

add('9.8', 'Trendline Risk Filter', 9, { method: 'swing', stopMult: 1.4, rr: 2.0 }, [
  [(c) => P.trendlineUpTouch(c) && P.atrHigh(c), 0, 2],
  [(c) => P.trendlineDnTouch(c) && P.atrHigh(c), 0, 2],
  [(c) => P.trendlineUpTouch(c) && P.atrNormal(c), 1, 2],
  [(c) => P.trendlineDnTouch(c) && P.atrNormal(c), -1, 2],
  [(c) => P.trendlineUpTouch(c) && P.spreadTight(c), 1, 1.5],
  [(c) => P.trendlineDnTouch(c) && P.spreadTight(c), -1, 1.5],
  [(c) => P.trendlineUpTouch(c) && P.spreadWide(c), 0, 2],
  [(c) => P.trendlineDnTouch(c) && P.spreadWide(c), 0, 2],
  [(c) => P.trendlineUpTouch(c) && P.atrLow(c), 1, 1.5],
  [(c) => P.trendlineDnTouch(c) && P.atrLow(c), -1, 1.5]
]);

add('9.9', 'Trendline Pattern Confluence', 9, { method: 'swing', stopMult: 1.2, rr: 2.5 }, [
  [(c) => P.trendlineUpTouch(c) && P.pinBull(c) && P.atSupport(c), 1, 3.5],
  [(c) => P.trendlineDnTouch(c) && P.pinBear(c) && P.atResistance(c), -1, 3.5],
  [(c) => P.trendlineUpTouch(c) && P.engulfBull(c), 1, 3],
  [(c) => P.trendlineDnTouch(c) && P.engulfBear(c), -1, 3],
  [(c) => P.trendlineUpTouch(c) && P.rsiDivBull(c), 1, 2.5],
  [(c) => P.trendlineDnTouch(c) && P.rsiDivBear(c), -1, 2.5],
  [(c) => P.trendlineUpTouch(c) && P.atPoc(c), 1, 2],
  [(c) => P.trendlineDnTouch(c) && P.atPoc(c), -1, 2],
  [(c) => P.trendlineUpTouch(c) && P.fundingLow(c), 1, 1.5],
  [(c) => P.trendlineDnTouch(c) && P.fundingHigh(c), -1, 1.5]
]);

add('9.10', 'Trendline Compiler', 9, { method: 'swing', stopMult: 1.2, rr: 2.5 }, [
  [(c) => P.trendlineUpTouch(c) && P.volSpike(c) && P.htfBull(c), 1, 3.5],
  [(c) => P.trendlineDnTouch(c) && P.volSpike(c) && P.htfBear(c), -1, 3.5],
  [(c) => P.trendlineUpBreak(c) && P.retestAboveLastH(c), 1, 3],
  [(c) => P.trendlineDnBreak(c) && P.retestBelowLastL(c), -1, 3],
  [(c) => P.trendlineUpFake(c), 1, 2.5],
  [(c) => P.trendlineDnFake(c), -1, 2.5],
  [(c) => P.trendlineUpTouch(c) && P.atSupport(c), 1, 2.5],
  [(c) => P.trendlineDnTouch(c) && P.atResistance(c), -1, 2.5],
  [(c) => P.trendlineUpTouch(c), 1, 1.5],
  [(c) => P.trendlineDnTouch(c), -1, 1.5]
]);

// ===================== CATEGORY 10: CHANNEL MASTERS ========================
add('10.1', 'Up Channel Support', 10, { method: 'swing', stopMult: 1.2, rr: 2.4 }, [
  [(c) => P.channelUpLowTouch(c) && P.pinBull(c), 1, 3],
  [(c) => P.channelUpLowTouch(c) && P.hammer(c), 1, 2.5],
  [(c) => P.channelUpLowTouch(c) && P.alignBull(c), 1, 2.5],
  [(c) => P.channelUpLowTouch(c) && P.rsiDivBull(c), 1, 2.5],
  [(c) => P.channelUpLowTouch(c) && P.volSpike(c), 1, 2],
  [(c) => P.channelUpLowTouch(c), 1, 1.5],
  [(c) => P.channelUpLowTouch(c) && P.htfBull(c), 1, 2],
  [(c) => P.channelUpLowTouch(c) && P.structUp(c), 1, 2],
  [(c) => P.channelUpLowTouch(c) && P.atSupport(c), 1, 2],
  [(c) => P.channelUpLowTouch(c) && P.rvolLow(c), 0, 1.5]
]);

add('10.2', 'Down Channel Resistance', 10, { method: 'swing', stopMult: 1.2, rr: 2.4 }, [
  [(c) => P.channelDnHighTouch(c) && P.pinBear(c), -1, 3],
  [(c) => P.channelDnHighTouch(c) && P.shootingStar(c), -1, 2.5],
  [(c) => P.channelDnHighTouch(c) && P.alignBear(c), -1, 2.5],
  [(c) => P.channelDnHighTouch(c) && P.rsiDivBear(c), -1, 2.5],
  [(c) => P.channelDnHighTouch(c) && P.volSpike(c), -1, 2],
  [(c) => P.channelDnHighTouch(c), -1, 1.5],
  [(c) => P.channelDnHighTouch(c) && P.htfBear(c), -1, 2],
  [(c) => P.channelDnHighTouch(c) && P.structDn(c), -1, 2],
  [(c) => P.channelDnHighTouch(c) && P.atResistance(c), -1, 2],
  [(c) => P.channelDnHighTouch(c) && P.rvolLow(c), 0, 1.5]
]);

add('10.3', 'Channel Breakout', 10, { method: 'price', stopMult: 1.3, rr: 2.6 }, [
  [(c) => P.channelUpBreak(c) && P.volSpike(c), 1, 3],
  [(c) => P.channelDnBreak(c) && P.volSpike(c), -1, 3],
  [(c) => P.channelUpBreak(c) && P.retestAboveLastH(c), 1, 2.5],
  [(c) => P.channelDnBreak(c) && P.retestBelowLastL(c), -1, 2.5],
  [(c) => P.channelUpBreak(c) && P.alignBull(c), 1, 2],
  [(c) => P.channelDnBreak(c) && P.alignBear(c), -1, 2],
  [(c) => P.channelUpBreak(c) && P.htfBull(c), 1, 2],
  [(c) => P.channelDnBreak(c) && P.htfBear(c), -1, 2],
  [(c) => P.channelUpBreak(c) && P.rvolLow(c), 0, 2],
  [(c) => P.channelDnBreak(c) && P.rvolLow(c), 0, 2]
]);

add('10.4', 'Channel Fake Break', 10, { method: 'swing', stopMult: 1.2, rr: 2.8 }, [
  [(c) => P.channelUpFake(c), -1, 3],
  [(c) => P.channelDnFake(c), 1, 3],
  [(c) => P.channelUpFake(c) && P.pinBear(c), -1, 3],
  [(c) => P.channelDnFake(c) && P.pinBull(c), 1, 3],
  [(c) => P.channelUpFake(c) && P.rsiDivBear(c), -1, 2.5],
  [(c) => P.channelDnFake(c) && P.rsiDivBull(c), 1, 2.5],
  [(c) => P.channelUpFake(c) && P.volClimax(c), -1, 2.5],
  [(c) => P.channelDnFake(c) && P.volClimax(c), 1, 2.5],
  [(c) => P.channelUpFake(c) && P.htfBear(c), -1, 2],
  [(c) => P.channelDnFake(c) && P.htfBull(c), 1, 2]
]);

add('10.5', 'Channel MTF', 10, { method: 'swing', stopMult: 1.3, rr: 2.6 }, [
  [(c) => P.channelUpLowTouch(c) && P.h4Bull(c), 1, 3],
  [(c) => P.channelDnHighTouch(c) && P.h4Bear(c), -1, 3],
  [(c) => P.channelUpLowTouch(c) && P.htfBull(c), 1, 2.5],
  [(c) => P.channelDnHighTouch(c) && P.htfBear(c), -1, 2.5],
  [(c) => P.channelUpBreak(c) && P.h4Bull(c), 1, 2.5],
  [(c) => P.channelDnBreak(c) && P.h4Bear(c), -1, 2.5],
  [(c) => P.channelUpLowTouch(c) && P.h4Bear(c), 0, 2],
  [(c) => P.channelDnHighTouch(c) && P.h4Bull(c), 0, 2],
  [(c) => P.channelUpLowTouch(c) && P.d1Bull(c), 1, 2],
  [(c) => P.channelDnHighTouch(c) && P.d1Bear(c), -1, 2]
]);

add('10.6', 'Channel Width Study', 10, { method: 'swing', stopMult: 1.2, rr: 2.4 }, [
  [(c) => P.channelTight(c) && P.channelUpLowTouch(c), 1, 2],
  [(c) => P.channelTight(c) && P.channelDnHighTouch(c), -1, 2],
  [(c) => P.channelWide(c), 0, 2],
  [(c) => P.channelUpLowTouch(c) && P.atrLow(c), 1, 1.5],
  [(c) => P.channelDnHighTouch(c) && P.atrLow(c), -1, 1.5],
  [(c) => P.channelUpLowTouch(c) && P.squeezeOn(c), 1, 1.5],
  [(c) => P.channelDnHighTouch(c) && P.squeezeOn(c), -1, 1.5],
  [(c) => P.channelUpLowTouch(c) && P.macdHistRising(c), 1, 1.5],
  [(c) => P.channelDnHighTouch(c) && P.macdHistFalling(c), -1, 1.5],
  [(c) => P.channelMid(c), 0, 1.5]
]);

add('10.7', 'Channel Volume Confirm', 10, { method: 'price', stopMult: 1.2, rr: 2.2 }, [
  [(c) => P.channelUpLowTouch(c) && P.volSpike(c), 1, 2.5],
  [(c) => P.channelDnHighTouch(c) && P.volSpike(c), -1, 2.5],
  [(c) => P.channelUpLowTouch(c) && P.tapeBull(c), 1, 2],
  [(c) => P.channelDnHighTouch(c) && P.tapeBear(c), -1, 2],
  [(c) => P.channelUpBreak(c) && P.obvRising(c), 1, 2],
  [(c) => P.channelDnBreak(c) && P.obvFalling(c), -1, 2],
  [(c) => P.channelUpLowTouch(c) && P.rvolLow(c), 0, 2],
  [(c) => P.channelDnHighTouch(c) && P.rvolLow(c), 0, 2],
  [(c) => P.channelUpLowTouch(c) && P.deltaPos(c), 1, 1.5],
  [(c) => P.channelDnHighTouch(c) && P.deltaNeg(c), -1, 1.5]
]);

add('10.8', 'Channel Risk Filter', 10, { method: 'swing', stopMult: 1.4, rr: 2.0 }, [
  [(c) => P.channelUpLowTouch(c) && P.atrHigh(c), 0, 2],
  [(c) => P.channelDnHighTouch(c) && P.atrHigh(c), 0, 2],
  [(c) => P.channelUpLowTouch(c) && P.atrNormal(c), 1, 2],
  [(c) => P.channelDnHighTouch(c) && P.atrNormal(c), -1, 2],
  [(c) => P.channelUpLowTouch(c) && P.spreadTight(c), 1, 1.5],
  [(c) => P.channelDnHighTouch(c) && P.spreadTight(c), -1, 1.5],
  [(c) => P.channelUpLowTouch(c) && P.spreadWide(c), 0, 2],
  [(c) => P.channelDnHighTouch(c) && P.spreadWide(c), 0, 2],
  [(c) => P.channelUpLowTouch(c) && P.atrLow(c), 1, 1.5],
  [(c) => P.channelDnHighTouch(c) && P.atrLow(c), -1, 1.5]
]);

add('10.9', 'Channel Pattern Confluence', 10, { method: 'swing', stopMult: 1.2, rr: 2.5 }, [
  [(c) => P.channelUpLowTouch(c) && P.pinBull(c) && P.atSupport(c), 1, 3.5],
  [(c) => P.channelDnHighTouch(c) && P.pinBear(c) && P.atResistance(c), -1, 3.5],
  [(c) => P.channelUpLowTouch(c) && P.engulfBull(c), 1, 3],
  [(c) => P.channelDnHighTouch(c) && P.engulfBear(c), -1, 3],
  [(c) => P.channelUpLowTouch(c) && P.rsiDivBull(c), 1, 2.5],
  [(c) => P.channelDnHighTouch(c) && P.rsiDivBear(c), -1, 2.5],
  [(c) => P.channelUpLowTouch(c) && P.atPoc(c), 1, 2],
  [(c) => P.channelDnHighTouch(c) && P.atPoc(c), -1, 2],
  [(c) => P.channelUpLowTouch(c) && P.fundingLow(c), 1, 1.5],
  [(c) => P.channelDnHighTouch(c) && P.fundingHigh(c), -1, 1.5]
]);

add('10.10', 'Channel Compiler', 10, { method: 'swing', stopMult: 1.2, rr: 2.5 }, [
  [(c) => P.channelUpLowTouch(c) && P.volSpike(c) && P.htfBull(c), 1, 3.5],
  [(c) => P.channelDnHighTouch(c) && P.volSpike(c) && P.htfBear(c), -1, 3.5],
  [(c) => P.channelUpBreak(c) && P.retestAboveLastH(c), 1, 3],
  [(c) => P.channelDnBreak(c) && P.retestBelowLastL(c), -1, 3],
  [(c) => P.channelUpFake(c), -1, 2.5],
  [(c) => P.channelDnFake(c), 1, 2.5],
  [(c) => P.channelUpLowTouch(c) && P.atSupport(c), 1, 2.5],
  [(c) => P.channelDnHighTouch(c) && P.atResistance(c), -1, 2.5],
  [(c) => P.channelUpLowTouch(c), 1, 1.5],
  [(c) => P.channelDnHighTouch(c), -1, 1.5]
]);

module.exports = { agents: require('./engine.js').agents };
