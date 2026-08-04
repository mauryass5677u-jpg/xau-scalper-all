'use strict';

// ============================================================================
// PART C4 — AGENT SWARM: CATEGORIES 31–40 (Agents 31.1 – 40.10) = 100 agents
// Volatility Masters (Cats 31-35) + Smart-Money Concept Masters (Cats 36-40)
// Each agent: 10 rules → 1 vote (LONG or SHORT — forced side, never NEUTRAL).
// ============================================================================

const { P, add } = require('./engine.js');

const price = (c) => c.price;
const atr = (c) => (c.ind ? c.ind.atr14 : null);

// ===================== CATEGORY 31: ATR MASTERS ============================
add('31.1', 'ATR Volatility State Reader', 31, { method: 'atr', stopMult: 1.2, rr: 2.0 }, [
  [(c) => P.atrNormal(c) && P.rangeBreakUp(c), 1, 3],
  [(c) => P.atrNormal(c) && P.rangeBreakDn(c), -1, 3],
  [(c) => P.atrHigh(c) && P.rsiOB(c), -1, 2.5],
  [(c) => P.atrHigh(c) && P.rsiOS(c), 1, 2.5],
  [(c) => P.atrLow(c) && P.squeezeOn(c), 0, 2.5],
  [(c) => P.atrVeryHigh(c), 0, 2.5],
  [(c) => P.atrNormal(c) && P.adxStrong(c), 1, 2],
  [(c) => P.atrNormal(c) && P.adxStrong(c), -1, 2],
  [(c) => P.atrLow(c) && P.rangeTight(c), 0, 2],
  [(c) => P.atrHigh(c) && P.macdHistFalling(c), -1, 2]
]);

add('31.2', 'ATR Trend Expansion Trader', 31, { method: 'atr', stopMult: 1.1, rr: 2.0 }, [
  [(c) => P.atrHigh(c) && P.structUp(c) && P.alignBull(c), 1, 3],
  [(c) => P.atrHigh(c) && P.structDn(c) && P.alignBear(c), -1, 3],
  [(c) => P.atrNormal(c) && P.bosUp(c) && P.volSpike(c), 1, 3],
  [(c) => P.atrNormal(c) && P.bosDn(c) && P.volSpike(c), -1, 3],
  [(c) => P.atrHigh(c) && P.ema8Above21(c), 1, 2],
  [(c) => P.atrHigh(c) && P.ema8Below21(c), -1, 2],
  [(c) => P.atrNormal(c) && P.adxStrong(c) && P.diPlusWins(c), 1, 2.5],
  [(c) => P.atrNormal(c) && P.adxStrong(c) && P.diMinusWins(c), -1, 2.5],
  [(c) => P.atrLow(c) && P.structNeutral(c), 0, 2.5],
  [(c) => P.atrVeryHigh(c) && P.rangeTight(c), 0, 3]
]);

add('31.3', 'ATR Stop Distance Analyst', 31, { method: 'atr', stopMult: 1.2, rr: 2.2 }, [
  [(c) => P.alignBull(c) && c.ind && c.ind.lastL !== null && (c.price - c.ind.lastL) > atr(c) * 1.5, 1, 3],
  [(c) => P.alignBear(c) && c.ind && c.ind.lastH !== null && (c.ind.lastH - c.price) > atr(c) * 1.5, -1, 3],
  [(c) => P.alignBull(c) && c.ind && c.ind.lastL !== null && (c.price - c.ind.lastL) < atr(c) * 0.5, 0, 3],
  [(c) => P.alignBear(c) && c.ind && c.ind.lastH !== null && (c.ind.lastH - c.price) < atr(c) * 0.5, 0, 3],
  [(c) => P.aboveVwap(c) && (c.price - (c.ind && c.ind.vwap)) > atr(c) * 1.5, 1, 2],
  [(c) => P.belowVwap(c) && ((c.ind && c.ind.vwap) - c.price) > atr(c) * 1.5, -1, 2],
  [(c) => P.nearSsl(c) && P.alignBull(c), 1, 2.5],
  [(c) => P.nearBsl(c) && P.alignBear(c), -1, 2.5],
  [(c) => P.atrVeryHigh(c) && P.alignBull(c), 0, 2.5],
  [(c) => P.atrVeryHigh(c) && P.alignBear(c), 0, 2.5]
]);

add('31.4', 'ATR Expansion Breakout Trader', 31, { method: 'atr', stopMult: 1.1, rr: 2.0 }, [
  [(c) => P.atrHigh(c) && P.rangeBreakUp(c) && P.volSpike(c), 1, 3.5],
  [(c) => P.atrHigh(c) && P.rangeBreakDn(c) && P.volSpike(c), -1, 3.5],
  [(c) => P.atrNormal(c) && P.channelUpBreak(c) && P.tapeBull(c), 1, 3],
  [(c) => P.atrNormal(c) && P.channelDnBreak(c) && P.tapeBear(c), -1, 3],
  [(c) => P.atrHigh(c) && P.brokeResistance(c), 1, 2.5],
  [(c) => P.atrHigh(c) && P.brokeSupport(c), -1, 2.5],
  [(c) => P.atrNormal(c) && P.trendlineUpBreak(c), 1, 2.5],
  [(c) => P.atrNormal(c) && P.trendlineDnBreak(c), -1, 2.5],
  [(c) => P.atrVeryHigh(c) && P.rangeBreakUp(c), 0, 2.5],
  [(c) => P.atrVeryHigh(c) && P.rangeBreakDn(c), 0, 2.5]
]);

add('31.5', 'ATR Contraction Setup Trader', 31, { method: 'atr', stopMult: 1.3, rr: 2.6 }, [
  [(c) => P.atrLow(c) && P.squeezeOn(c) && P.bbWidthExpanding(c) && P.upCandle(c), 1, 3.5],
  [(c) => P.atrLow(c) && P.squeezeOn(c) && P.bbWidthExpanding(c) && P.downCandle(c), -1, 3.5],
  [(c) => P.atrLow(c) && P.rangeTight(c) && P.volSpike(c), 0, 2.5],
  [(c) => P.atrLow(c) && P.ribbonTight(c), 0, 2.5],
  [(c) => P.atrLow(c) && P.adxWeak(c) && P.macdHistRising(c), 1, 2],
  [(c) => P.atrLow(c) && P.adxWeak(c) && P.macdHistFalling(c), -1, 2],
  [(c) => P.atrLow(c) && P.rangeBreakUp(c), 1, 3],
  [(c) => P.atrLow(c) && P.rangeBreakDn(c), -1, 3],
  [(c) => P.atrLow(c) && P.adxStrong(c), 0, 2.5],
  [(c) => P.atrLow(c) && P.atPoc(c), 0, 2]
]);

add('31.6', 'ATR Climax Reversal Trader', 31, { method: 'atr', stopMult: 1.3, rr: 2.5 }, [
  [(c) => P.atrVeryHigh(c) && P.volClimax(c) && P.deltaExtremePos(c), -1, 3.5],
  [(c) => P.atrVeryHigh(c) && P.volClimax(c) && P.deltaExtremeNeg(c), 1, 3.5],
  [(c) => P.atrVeryHigh(c) && P.rsiOB(c), -1, 3],
  [(c) => P.atrVeryHigh(c) && P.rsiOS(c), 1, 3],
  [(c) => P.atrVeryHigh(c) && P.aboveBBUp(c), -1, 2.5],
  [(c) => P.atrVeryHigh(c) && P.belowBBLo(c), 1, 2.5],
  [(c) => P.atrVeryHigh(c) && P.macdHistFalling(c), -1, 2.5],
  [(c) => P.atrVeryHigh(c) && P.macdHistRising(c), 1, 2.5],
  [(c) => P.atrVeryHigh(c) && P.atResistance(c), -1, 2.5],
  [(c) => P.atrVeryHigh(c) && P.atSupport(c), 1, 2.5]
]);

add('31.7', 'ATR + Pivot Range Trader', 31, { method: 'atr', stopMult: 1.2, rr: 2.2 }, [
  [(c) => P.atrNormal(c) && P.nearR1(c) && P.pinBear(c), -1, 3],
  [(c) => P.atrNormal(c) && P.nearS1(c) && P.pinBull(c), 1, 3],
  [(c) => P.atrNormal(c) && P.aboveR1(c) && P.alignBull(c), 1, 2.5],
  [(c) => P.atrNormal(c) && P.belowS1(c) && P.alignBear(c), -1, 2.5],
  [(c) => P.atrHigh(c) && P.aboveR1(c), 1, 2.5],
  [(c) => P.atrHigh(c) && P.belowS1(c), -1, 2.5],
  [(c) => P.atrNormal(c) && P.nearR1(c) && P.rsiOB(c), -1, 2.5],
  [(c) => P.atrNormal(c) && P.nearS1(c) && P.rsiOS(c), 1, 2.5],
  [(c) => P.atrLow(c) && P.nearR1(c), 0, 2],
  [(c) => P.atrLow(c) && P.nearS1(c), 0, 2]
]);

add('31.8', 'ATR + Volume Surge Trader', 31, { method: 'atr', stopMult: 1.1, rr: 2.0 }, [
  [(c) => P.atrHigh(c) && P.volSpike(c) && P.upCandle(c), 1, 3],
  [(c) => P.atrHigh(c) && P.volSpike(c) && P.downCandle(c), -1, 3],
  [(c) => P.atrNormal(c) && P.volClimax(c) && P.pinBull(c), 1, 3],
  [(c) => P.atrNormal(c) && P.volClimax(c) && P.pinBear(c), -1, 3],
  [(c) => P.atrNormal(c) && P.rvolHigh(c) && P.tapeBull(c), 1, 2.5],
  [(c) => P.atrNormal(c) && P.rvolHigh(c) && P.tapeBear(c), -1, 2.5],
  [(c) => P.atrHigh(c) && P.rvolHigh(c), 1, 2],
  [(c) => P.atrHigh(c) && P.rvolHigh(c), -1, 2],
  [(c) => P.atrVeryHigh(c) && P.rvolLow(c), 0, 2.5],
  [(c) => P.atrLow(c) && P.rvolLow(c), 0, 2]
]);

add('31.9', 'ATR Multi-Timeframe Expansion', 31, { method: 'atr', stopMult: 1.2, rr: 2.2 }, [
  [(c) => P.atrHigh(c) && P.h4Bull(c) && P.htfBull(c), 1, 3],
  [(c) => P.atrHigh(c) && P.h4Bear(c) && P.htfBear(c), -1, 3],
  [(c) => P.atrNormal(c) && P.h4Bull(c) && P.alignBull(c), 1, 2.5],
  [(c) => P.atrNormal(c) && P.h4Bear(c) && P.alignBear(c), -1, 2.5],
  [(c) => P.atrHigh(c) && P.htfBull(c), 1, 2],
  [(c) => P.atrHigh(c) && P.htfBear(c), -1, 2],
  [(c) => P.atrNormal(c) && P.allTfBull(c), 1, 2.5],
  [(c) => P.atrNormal(c) && P.allTfBear(c), -1, 2.5],
  [(c) => P.atrVeryHigh(c) && P.htfBull(c), 0, 2.5],
  [(c) => P.atrVeryHigh(c) && P.htfBear(c), 0, 2.5]
]);

add('31.10', 'ATR Range Quality Filter', 31, { method: 'atr', stopMult: 1.2, rr: 2.0 }, [
  [(c) => P.rangeAtLow(c) && P.atrNormal(c) && P.pinBull(c), 1, 3],
  [(c) => P.rangeAtHigh(c) && P.atrNormal(c) && P.pinBear(c), -1, 3],
  [(c) => P.rangeAtLow(c) && P.atrLow(c), 0, 2.5],
  [(c) => P.rangeAtHigh(c) && P.atrLow(c), 0, 2.5],
  [(c) => P.rangeAtLow(c) && P.atrVeryHigh(c), 0, 2.5],
  [(c) => P.rangeAtHigh(c) && P.atrVeryHigh(c), 0, 2.5],
  [(c) => P.rangeBreakUp(c) && P.atrNormal(c) && P.volSpike(c), 1, 3],
  [(c) => P.rangeBreakDn(c) && P.atrNormal(c) && P.volSpike(c), -1, 3],
  [(c) => P.rangeActive(c) && P.atrNormal(c), 0, 2],
  [(c) => P.rangeTight(c) && P.atrLow(c), 0, 2]
]);

// ===================== CATEGORY 32: BOLLINGER MASTERS ======================
add('32.1', 'Bollinger Band Walk Trader', 32, { method: 'bollinger', stopMult: 1.1, rr: 2.0 }, [
  [(c) => P.aboveBBUp(c) && P.htfBull(c) && P.adxStrong(c), 1, 3],
  [(c) => P.belowBBLo(c) && P.htfBear(c) && P.adxStrong(c), -1, 3],
  [(c) => P.aboveBBUp(c) && P.ema8Above21(c), 1, 2.5],
  [(c) => P.belowBBLo(c) && P.ema8Below21(c), -1, 2.5],
  [(c) => P.aboveBBUp(c) && P.rsiBull(c), 1, 2],
  [(c) => P.belowBBLo(c) && P.rsiBear(c), -1, 2],
  [(c) => P.aboveBBUp(c) && P.structUp(c), 1, 2],
  [(c) => P.belowBBLo(c) && P.structDn(c), -1, 2],
  [(c) => P.aboveBBUp(c) && P.adxWeak(c), 0, 2.5],
  [(c) => P.belowBBLo(c) && P.adxWeak(c), 0, 2.5]
]);

add('32.2', 'Bollinger Band Mean Reversion', 32, { method: 'bollinger', stopMult: 1.3, rr: 2.5 }, [
  [(c) => P.aboveBBUp(c) && P.rsiOB(c) && P.volClimax(c), -1, 3.5],
  [(c) => P.belowBBLo(c) && P.rsiOS(c) && P.volClimax(c), 1, 3.5],
  [(c) => P.aboveBBUp(c) && P.pinBear(c), -1, 3],
  [(c) => P.belowBBLo(c) && P.pinBull(c), 1, 3],
  [(c) => P.aboveBBUp(c) && P.rsiDivBear(c), -1, 3],
  [(c) => P.belowBBLo(c) && P.rsiDivBull(c), 1, 3],
  [(c) => P.aboveBBUp(c) && P.rangeAtHigh(c), -1, 2.5],
  [(c) => P.belowBBLo(c) && P.rangeAtLow(c), 1, 2.5],
  [(c) => P.aboveBBUp(c) && P.deltaExtremePos(c), -1, 2.5],
  [(c) => P.belowBBLo(c) && P.deltaExtremeNeg(c), 1, 2.5]
]);

add('32.3', 'Bollinger Squeeze Expansion', 32, { method: 'bollinger', stopMult: 1.1, rr: 2.2 }, [
  [(c) => P.squeezeOn(c) && P.bbWidthExpanding(c) && P.rangeBreakUp(c), 1, 3.5],
  [(c) => P.squeezeOn(c) && P.bbWidthExpanding(c) && P.rangeBreakDn(c), -1, 3.5],
  [(c) => P.squeezeOn(c) && P.bbWidthExpanding(c) && P.upCandle(c), 1, 3],
  [(c) => P.squeezeOn(c) && P.bbWidthExpanding(c) && P.downCandle(c), -1, 3],
  [(c) => P.squeezeOn(c) && P.volSpike(c) && P.htfBull(c), 1, 2.5],
  [(c) => P.squeezeOn(c) && P.volSpike(c) && P.htfBear(c), -1, 2.5],
  [(c) => P.squeezeOn(c) && P.adxWeak(c), 0, 2.5],
  [(c) => P.squeezeOn(c) && P.atrLow(c), 0, 2],
  [(c) => P.squeezeOn(c) && P.rangeBreakUp(c) && P.tapeBull(c), 1, 2.5],
  [(c) => P.squeezeOn(c) && P.rangeBreakDn(c) && P.tapeBear(c), -1, 2.5]
]);

add('32.4', 'Bollinger Middle Band Trader', 32, { method: 'bollinger', stopMult: 1.2, rr: 2.2 }, [
  [(c) => P.aboveEma21(c) && P.nearBBLo(c), 1, 3],
  [(c) => P.belowEma21(c) && P.nearBBUp(c), -1, 3],
  [(c) => P.alignBull(c) && P.nearBBLo(c), 1, 2.5],
  [(c) => P.alignBear(c) && P.nearBBUp(c), -1, 2.5],
  [(c) => P.nearBBLo(c) && P.rsiBull(c), 1, 2.5],
  [(c) => P.nearBBUp(c) && P.rsiBear(c), -1, 2.5],
  [(c) => P.nearBBLo(c) && P.atSupport(c), 1, 2.5],
  [(c) => P.nearBBUp(c) && P.atResistance(c), -1, 2.5],
  [(c) => P.nearBBLo(c) && P.adxWeak(c), 0, 2],
  [(c) => P.nearBBUp(c) && P.adxWeak(c), 0, 2]
]);

add('32.5', 'Bollinger Breakout Momentum', 32, { method: 'bollinger', stopMult: 1.1, rr: 2.0 }, [
  [(c) => P.aboveBBUp(c) && P.volSpike(c) && P.macdHistRising(c), 1, 3],
  [(c) => P.belowBBLo(c) && P.volSpike(c) && P.macdHistFalling(c), -1, 3],
  [(c) => P.aboveBBUp(c) && P.rangeBreakUp(c), 1, 2.5],
  [(c) => P.belowBBLo(c) && P.rangeBreakDn(c), -1, 2.5],
  [(c) => P.aboveBBUp(c) && P.brokeResistance(c), 1, 2.5],
  [(c) => P.belowBBLo(c) && P.brokeSupport(c), -1, 2.5],
  [(c) => P.aboveBBUp(c) && P.tapeBull(c), 1, 2.5],
  [(c) => P.belowBBLo(c) && P.tapeBear(c), -1, 2.5],
  [(c) => P.aboveBBUp(c) && P.rsiDivBear(c), 0, 2.5],
  [(c) => P.belowBBLo(c) && P.rsiDivBull(c), 0, 2.5]
]);

add('32.6', 'Bollinger Bandwidth Filter', 32, { method: 'bollinger', stopMult: 1.2, rr: 2.0 }, [
  [(c) => P.bbWidthExpanding(c) && P.htfBull(c) && P.ema8Above21(c), 1, 3],
  [(c) => P.bbWidthExpanding(c) && P.htfBear(c) && P.ema8Below21(c), -1, 3],
  [(c) => P.bbWidthExpanding(c) && P.bosUp(c), 1, 2.5],
  [(c) => P.bbWidthExpanding(c) && P.bosDn(c), -1, 2.5],
  [(c) => P.bbWidthExpanding(c) && P.rangeBreakUp(c), 1, 2.5],
  [(c) => P.bbWidthExpanding(c) && P.rangeBreakDn(c), -1, 2.5],
  [(c) => P.squeezeOn(c), 0, 2.5],
  [(c) => P.bbWidthExpanding(c) && P.adxWeak(c), 0, 2.5],
  [(c) => P.bbWidthExpanding(c) && P.macdHistRising(c), 1, 2],
  [(c) => P.bbWidthExpanding(c) && P.macdHistFalling(c), -1, 2]
]);

add('32.7', 'Bollinger + Volume Confirmation', 32, { method: 'bollinger', stopMult: 1.1, rr: 2.0 }, [
  [(c) => P.nearBBLo(c) && P.volSpike(c) && P.pinBull(c), 1, 3],
  [(c) => P.nearBBUp(c) && P.volSpike(c) && P.pinBear(c), -1, 3],
  [(c) => P.aboveBBUp(c) && P.rvolHigh(c) && P.tapeBull(c), 1, 2.5],
  [(c) => P.belowBBLo(c) && P.rvolHigh(c) && P.tapeBear(c), -1, 2.5],
  [(c) => P.nearBBLo(c) && P.obvRising(c), 1, 2.5],
  [(c) => P.nearBBUp(c) && P.obvFalling(c), -1, 2.5],
  [(c) => P.belowBBLo(c) && P.deltaExtremeNeg(c), 1, 2.5],
  [(c) => P.aboveBBUp(c) && P.deltaExtremePos(c), -1, 2.5],
  [(c) => P.squeezeOn(c) && P.rvolLow(c), 0, 2.5],
  [(c) => P.rangeTight(c) && P.rvolLow(c), 0, 2]
]);

add('32.8', 'Bollinger + Keltner Confluence', 32, { method: 'bollinger', stopMult: 1.2, rr: 2.2 }, [
  [(c) => P.aboveKcUp(c) && P.aboveBBUp(c) && P.alignBull(c), 1, 3],
  [(c) => P.belowKcLo(c) && P.belowBBLo(c) && P.alignBear(c), -1, 3],
  [(c) => P.aboveKcUp(c) && P.nearBBUp(c), 1, 2.5],
  [(c) => P.belowKcLo(c) && P.nearBBLo(c), -1, 2.5],
  [(c) => P.kcBandWalk(c) && P.rsiBull(c), 1, 2.5],
  [(c) => P.kcBandWalk(c) && P.rsiBear(c), -1, 2.5],
  [(c) => P.squeezeOn(c) && P.rangeTight(c), 0, 2.5],
  [(c) => P.kcBandWalk(c) && P.volSpike(c), 1, 2.5],
  [(c) => P.kcBandWalk(c) && P.volSpike(c), -1, 2.5],
  [(c) => P.aboveBBUp(c) && P.belowKcLo(c), 0, 2.5]
]);

add('32.9', 'Bollinger Multi-Timeframe Sync', 32, { method: 'bollinger', stopMult: 1.2, rr: 2.3 }, [
  [(c) => P.aboveBBUp(c) && P.h4Bull(c) && P.htfBull(c), 1, 3],
  [(c) => P.belowBBLo(c) && P.h4Bear(c) && P.htfBear(c), -1, 3],
  [(c) => P.nearBBLo(c) && P.h4Bull(c), 1, 2.5],
  [(c) => P.nearBBUp(c) && P.h4Bear(c), -1, 2.5],
  [(c) => P.aboveBBUp(c) && P.allTfBull(c), 1, 3],
  [(c) => P.belowBBLo(c) && P.allTfBear(c), -1, 3],
  [(c) => P.aboveBBUp(c) && P.htfBear(c), 0, 2.5],
  [(c) => P.belowBBLo(c) && P.htfBull(c), 0, 2.5],
  [(c) => P.squeezeOn(c) && P.mtfMixed(c), 0, 2.5],
  [(c) => P.nearBBLo(c) && P.htfBear(c), 0, 2.5]
]);

add('32.10', 'Bollinger Reversal Confluence', 32, { method: 'bollinger', stopMult: 1.3, rr: 2.6 }, [
  [(c) => P.aboveBBUp(c) && P.rangeFakeUp(c) && P.pinBear(c), -1, 3.5],
  [(c) => P.belowBBLo(c) && P.rangeFakeDn(c) && P.pinBull(c), 1, 3.5],
  [(c) => P.aboveBBUp(c) && P.closeBackBelowH(c), -1, 3],
  [(c) => P.belowBBLo(c) && P.closeBackAboveL(c), 1, 3],
  [(c) => P.aboveBBUp(c) && P.eqHighsNear(c), -1, 2.5],
  [(c) => P.belowBBLo(c) && P.eqLowsNear(c), 1, 2.5],
  [(c) => P.aboveBBUp(c) && P.macdHistFalling(c), -1, 2.5],
  [(c) => P.belowBBLo(c) && P.macdHistRising(c), 1, 2.5],
  [(c) => P.aboveBBUp(c) && P.chochBear(c), -1, 2.5],
  [(c) => P.belowBBLo(c) && P.chochBull(c), 1, 2.5]
]);

// ===================== CATEGORY 33: KELTNER MASTERS ========================
add('33.1', 'Keltner Channel Trend Trader', 33, { method: 'keltner', stopMult: 1.1, rr: 2.0 }, [
  [(c) => P.aboveKcUp(c) && P.htfBull(c) && P.adxStrong(c), 1, 3],
  [(c) => P.belowKcLo(c) && P.htfBear(c) && P.adxStrong(c), -1, 3],
  [(c) => P.aboveKcUp(c) && P.ema8Above21(c), 1, 2.5],
  [(c) => P.belowKcLo(c) && P.ema8Below21(c), -1, 2.5],
  [(c) => P.aboveKcUp(c) && P.structUp(c), 1, 2],
  [(c) => P.belowKcLo(c) && P.structDn(c), -1, 2],
  [(c) => P.aboveKcUp(c) && P.rsiBull(c), 1, 2],
  [(c) => P.belowKcLo(c) && P.rsiBear(c), -1, 2],
  [(c) => P.aboveKcUp(c) && P.adxWeak(c), 0, 2.5],
  [(c) => P.belowKcLo(c) && P.adxWeak(c), 0, 2.5]
]);

add('33.2', 'Keltner Reversion to Midline', 33, { method: 'keltner', stopMult: 1.3, rr: 2.5 }, [
  [(c) => P.aboveKcUp(c) && P.rsiOB(c) && P.volClimax(c), -1, 3.5],
  [(c) => P.belowKcLo(c) && P.rsiOS(c) && P.volClimax(c), 1, 3.5],
  [(c) => P.aboveKcUp(c) && P.pinBear(c), -1, 3],
  [(c) => P.belowKcLo(c) && P.pinBull(c), 1, 3],
  [(c) => P.aboveKcUp(c) && P.atResistance(c), -1, 2.5],
  [(c) => P.belowKcLo(c) && P.atSupport(c), 1, 2.5],
  [(c) => P.aboveKcUp(c) && P.deltaExtremePos(c), -1, 2.5],
  [(c) => P.belowKcLo(c) && P.deltaExtremeNeg(c), 1, 2.5],
  [(c) => P.aboveKcUp(c) && P.rsiDivBear(c), -1, 2.5],
  [(c) => P.belowKcLo(c) && P.rsiDivBull(c), 1, 2.5]
]);

add('33.3', 'Keltner Squeeze Release Trader', 33, { method: 'keltner', stopMult: 1.1, rr: 2.2 }, [
  [(c) => P.squeezeOn(c) && P.rangeBreakUp(c) && P.aboveKcUp(c), 1, 3.5],
  [(c) => P.squeezeOn(c) && P.rangeBreakDn(c) && P.belowKcLo(c), -1, 3.5],
  [(c) => P.squeezeOn(c) && P.volSpike(c) && P.upCandle(c), 1, 3],
  [(c) => P.squeezeOn(c) && P.volSpike(c) && P.downCandle(c), -1, 3],
  [(c) => P.squeezeOn(c) && P.bbWidthExpanding(c), 1, 2.5],
  [(c) => P.squeezeOn(c) && P.bbWidthExpanding(c), -1, 2.5],
  [(c) => P.squeezeOn(c) && P.adxWeak(c), 0, 2.5],
  [(c) => P.squeezeOn(c) && P.atrLow(c), 0, 2.5],
  [(c) => P.squeezeOn(c) && P.htfBull(c) && P.upCandle(c), 1, 2.5],
  [(c) => P.squeezeOn(c) && P.htfBear(c) && P.downCandle(c), -1, 2.5]
]);

add('33.4', 'Keltner Band Walk Momentum', 33, { method: 'keltner', stopMult: 1.1, rr: 2.0 }, [
  [(c) => P.kcBandWalk(c) && P.macdHistRising(c), 1, 3],
  [(c) => P.kcBandWalk(c) && P.macdHistFalling(c), -1, 3],
  [(c) => P.kcBandWalk(c) && P.rsiBull(c), 1, 2.5],
  [(c) => P.kcBandWalk(c) && P.rsiBear(c), -1, 2.5],
  [(c) => P.kcBandWalk(c) && P.volSpike(c), 1, 2.5],
  [(c) => P.kcBandWalk(c) && P.volSpike(c), -1, 2.5],
  [(c) => P.aboveKcUp(c) && P.stKAboveD(c), 1, 2],
  [(c) => P.belowKcLo(c) && P.stKBelowD(c), -1, 2],
  [(c) => P.kcBandWalk(c) && P.adxWeak(c), 0, 2.5],
  [(c) => P.kcBandWalk(c) && P.rsiOB(c), 0, 2.5]
]);

add('33.5', 'Keltner Midline Magnet Trader', 33, { method: 'keltner', stopMult: 1.2, rr: 2.2 }, [
  [(c) => P.nearEma21At(c) && P.aboveKcUp(c) && P.htfBull(c), 1, 3],
  [(c) => P.nearEma21At(c) && P.belowKcLo(c) && P.htfBear(c), -1, 3],
  [(c) => P.aboveEma21(c) && P.belowKcLo(c), 0, 2.5],
  [(c) => P.belowEma21(c) && P.aboveKcUp(c), 0, 2.5],
  [(c) => P.nearEma21At(c) && P.aboveVwap(c), 1, 2.5],
  [(c) => P.nearEma21At(c) && P.belowVwap(c), -1, 2.5],
  [(c) => P.nearEma21At(c) && P.rsiAbove50(c), 1, 2],
  [(c) => P.nearEma21At(c) && P.rsiBelow50(c), -1, 2],
  [(c) => P.nearEma21At(c) && P.adxWeak(c), 0, 2],
  [(c) => P.nearEma21At(c) && P.structNeutral(c), 0, 2]
]);

add('33.6', 'Keltner + ATR Volatility Trader', 33, { method: 'keltner', stopMult: 1.2, rr: 2.2 }, [
  [(c) => P.aboveKcUp(c) && P.atrHigh(c) && P.alignBull(c), 1, 3],
  [(c) => P.belowKcLo(c) && P.atrHigh(c) && P.alignBear(c), -1, 3],
  [(c) => P.aboveKcUp(c) && P.atrNormal(c), 1, 2],
  [(c) => P.belowKcLo(c) && P.atrNormal(c), -1, 2],
  [(c) => P.squeezeOn(c) && P.atrLow(c), 0, 2.5],
  [(c) => P.aboveKcUp(c) && P.atrVeryHigh(c), 0, 2.5],
  [(c) => P.belowKcLo(c) && P.atrVeryHigh(c), 0, 2.5],
  [(c) => P.aboveKcUp(c) && P.atrHigh(c) && P.htfBull(c), 1, 2.5],
  [(c) => P.belowKcLo(c) && P.atrHigh(c) && P.htfBear(c), -1, 2.5],
  [(c) => P.squeezeOn(c) && P.atrHigh(c), 0, 2.5]
]);

add('33.7', 'Keltner Breakout Confirmer', 33, { method: 'keltner', stopMult: 1.1, rr: 2.0 }, [
  [(c) => P.aboveKcUp(c) && P.rangeBreakUp(c) && P.volSpike(c), 1, 3.5],
  [(c) => P.belowKcLo(c) && P.rangeBreakDn(c) && P.volSpike(c), -1, 3.5],
  [(c) => P.aboveKcUp(c) && P.brokeResistance(c), 1, 2.5],
  [(c) => P.belowKcLo(c) && P.brokeSupport(c), -1, 2.5],
  [(c) => P.aboveKcUp(c) && P.channelUpBreak(c), 1, 2.5],
  [(c) => P.belowKcLo(c) && P.channelDnBreak(c), -1, 2.5],
  [(c) => P.aboveKcUp(c) && P.bosUp(c), 1, 2.5],
  [(c) => P.belowKcLo(c) && P.bosDn(c), -1, 2.5],
  [(c) => P.aboveKcUp(c) && P.rangeFakeUp(c), 0, 2.5],
  [(c) => P.belowKcLo(c) && P.rangeFakeDn(c), 0, 2.5]
]);

add('33.8', 'Keltner + Tape Trader', 33, { method: 'keltner', stopMult: 1.1, rr: 2.0 }, [
  [(c) => P.aboveKcUp(c) && P.tapeBull(c) && P.deltaPos(c), 1, 3],
  [(c) => P.belowKcLo(c) && P.tapeBear(c) && P.deltaNeg(c), -1, 3],
  [(c) => P.nearEma21At(c) && P.tapeBull(c) && P.aboveKcUp(c), 1, 2.5],
  [(c) => P.nearEma21At(c) && P.tapeBear(c) && P.belowKcLo(c), -1, 2.5],
  [(c) => P.aboveKcUp(c) && P.bookBidHeavy(c), 1, 2],
  [(c) => P.belowKcLo(c) && P.bookAskHeavy(c), -1, 2],
  [(c) => P.aboveKcUp(c) && P.takerBuyHeavy(c), 1, 2],
  [(c) => P.belowKcLo(c) && P.takerSellHeavy(c), -1, 2],
  [(c) => P.aboveKcUp(c) && P.tapeBear(c), 0, 2.5],
  [(c) => P.belowKcLo(c) && P.tapeBull(c), 0, 2.5]
]);

add('33.9', 'Keltner Multi-Timeframe Sync', 33, { method: 'keltner', stopMult: 1.2, rr: 2.3 }, [
  [(c) => P.aboveKcUp(c) && P.h4Bull(c) && P.htfBull(c), 1, 3],
  [(c) => P.belowKcLo(c) && P.h4Bear(c) && P.htfBear(c), -1, 3],
  [(c) => P.aboveKcUp(c) && P.allTfBull(c), 1, 3],
  [(c) => P.belowKcLo(c) && P.allTfBear(c), -1, 3],
  [(c) => P.aboveKcUp(c) && P.htfBull(c), 1, 2],
  [(c) => P.belowKcLo(c) && P.htfBear(c), -1, 2],
  [(c) => P.aboveKcUp(c) && P.htfBear(c), 0, 2.5],
  [(c) => P.belowKcLo(c) && P.htfBull(c), 0, 2.5],
  [(c) => P.squeezeOn(c) && P.htfBull(c), 1, 1.5],
  [(c) => P.squeezeOn(c) && P.htfBear(c), -1, 1.5]
]);

add('33.10', 'Keltner Reversal Confluence', 33, { method: 'keltner', stopMult: 1.3, rr: 2.6 }, [
  [(c) => P.aboveKcUp(c) && P.closeBackBelowH(c) && P.pinBear(c), -1, 3.5],
  [(c) => P.belowKcLo(c) && P.closeBackAboveL(c) && P.pinBull(c), 1, 3.5],
  [(c) => P.aboveKcUp(c) && P.nearBsl(c) && P.sweptBsl(c), -1, 3],
  [(c) => P.belowKcLo(c) && P.nearSsl(c) && P.sweptSsl(c), 1, 3],
  [(c) => P.aboveKcUp(c) && P.fundingHigh(c), -1, 2.5],
  [(c) => P.belowKcLo(c) && P.fundingLow(c), 1, 2.5],
  [(c) => P.aboveKcUp(c) && P.rsiDivBear(c), -1, 2.5],
  [(c) => P.belowKcLo(c) && P.rsiDivBull(c), 1, 2.5],
  [(c) => P.aboveKcUp(c) && P.atVah(c), -1, 2.5],
  [(c) => P.belowKcLo(c) && P.atVal(c), 1, 2.5]
]);

// ===================== CATEGORY 34: VOLATILITY REGIME MASTERS ==============
add('34.1', 'Volatility Regime Classifier', 34, { method: 'vol', stopMult: 1.2, rr: 2.0 }, [
  [(c) => P.atrNormal(c) && P.adxStrong(c) && P.structUp(c), 1, 3],
  [(c) => P.atrNormal(c) && P.adxStrong(c) && P.structDn(c), -1, 3],
  [(c) => P.atrLow(c) && P.adxWeak(c), 0, 3],
  [(c) => P.atrVeryHigh(c) && P.volClimax(c), 0, 3],
  [(c) => P.atrHigh(c) && P.adxStrong(c) && P.alignBull(c), 1, 2.5],
  [(c) => P.atrHigh(c) && P.adxStrong(c) && P.alignBear(c), -1, 2.5],
  [(c) => P.atrLow(c) && P.squeezeOn(c), 0, 2.5],
  [(c) => P.atrNormal(c) && P.structNeutral(c), 0, 2],
  [(c) => P.atrHigh(c) && P.adxWeak(c), 0, 2.5],
  [(c) => P.atrNormal(c) && P.adxStrong(c) && P.macdHistRising(c), 1, 2]
]);

add('34.2', 'Low-Volatility Range Trader', 34, { method: 'vol', stopMult: 1.3, rr: 2.5 }, [
  [(c) => P.atrLow(c) && P.rangeAtHigh(c) && P.rsiOB(c), -1, 3],
  [(c) => P.atrLow(c) && P.rangeAtLow(c) && P.rsiOS(c), 1, 3],
  [(c) => P.atrLow(c) && P.rangeAtHigh(c) && P.adxWeak(c), -1, 2.5],
  [(c) => P.atrLow(c) && P.rangeAtLow(c) && P.adxWeak(c), 1, 2.5],
  [(c) => P.atrLow(c) && P.rangeAtHigh(c) && P.stOB(c), -1, 2.5],
  [(c) => P.atrLow(c) && P.rangeAtLow(c) && P.stOS(c), 1, 2.5],
  [(c) => P.atrLow(c) && P.rangeAtHigh(c), -1, 2],
  [(c) => P.atrLow(c) && P.rangeAtLow(c), 1, 2],
  [(c) => P.atrLow(c) && P.rangeActive(c) && P.rangeTight(c), 0, 2.5],
  [(c) => P.atrLow(c) && P.adxStrong(c), 0, 2.5]
]);

add('34.3', 'High-Volatility Breakout Trader', 34, { method: 'vol', stopMult: 1.1, rr: 2.0 }, [
  [(c) => P.atrHigh(c) && P.rangeBreakUp(c) && P.volSpike(c), 1, 3.5],
  [(c) => P.atrHigh(c) && P.rangeBreakDn(c) && P.volSpike(c), -1, 3.5],
  [(c) => P.atrHigh(c) && P.brokeResistance(c) && P.htfBull(c), 1, 3],
  [(c) => P.atrHigh(c) && P.brokeSupport(c) && P.htfBear(c), -1, 3],
  [(c) => P.atrHigh(c) && P.ema8Above21(c), 1, 2.5],
  [(c) => P.atrHigh(c) && P.ema8Below21(c), -1, 2.5],
  [(c) => P.atrHigh(c) && P.adxStrong(c) && P.diPlusWins(c), 1, 2.5],
  [(c) => P.atrHigh(c) && P.adxStrong(c) && P.diMinusWins(c), -1, 2.5],
  [(c) => P.atrVeryHigh(c) && P.rangeBreakUp(c), 0, 2.5],
  [(c) => P.atrVeryHigh(c) && P.rangeBreakDn(c), 0, 2.5]
]);

add('34.4', 'Volatility Contraction Watch', 34, { method: 'vol', stopMult: 1.3, rr: 2.6 }, [
  [(c) => P.squeezeOn(c) && P.atrLow(c) && P.rangeTight(c) && P.volSpike(c), 0, 3],
  [(c) => P.squeezeOn(c) && P.atrLow(c) && P.rangeTight(c) && P.htfBull(c), 1, 2.5],
  [(c) => P.squeezeOn(c) && P.atrLow(c) && P.rangeTight(c) && P.htfBear(c), -1, 2.5],
  [(c) => P.squeezeOn(c) && P.bbWidthExpanding(c) && P.upCandle(c), 1, 3],
  [(c) => P.squeezeOn(c) && P.bbWidthExpanding(c) && P.downCandle(c), -1, 3],
  [(c) => P.squeezeOn(c) && P.atrLow(c), 0, 2.5],
  [(c) => P.squeezeOn(c) && P.adxWeak(c), 0, 2.5],
  [(c) => P.squeezeOn(c) && P.ribbonTight(c), 0, 2.5],
  [(c) => P.squeezeOn(c) && P.volSpike(c) && P.rvolHigh(c), 0, 2.5],
  [(c) => P.squeezeOn(c) && P.rangeBreakUp(c), 1, 3]
]);

add('34.5', 'Volatility Climax Counter', 34, { method: 'vol', stopMult: 1.3, rr: 2.5 }, [
  [(c) => P.volClimax(c) && P.deltaExtremePos(c) && P.rsiOB(c), -1, 3.5],
  [(c) => P.volClimax(c) && P.deltaExtremeNeg(c) && P.rsiOS(c), 1, 3.5],
  [(c) => P.volClimax(c) && P.upCandle(c) && P.rangeAtHigh(c), -1, 3],
  [(c) => P.volClimax(c) && P.downCandle(c) && P.rangeAtLow(c), 1, 3],
  [(c) => P.volClimax(c) && P.atrVeryHigh(c), 0, 2.5],
  [(c) => P.volClimax(c) && P.pinBear(c), -1, 2.5],
  [(c) => P.volClimax(c) && P.pinBull(c), 1, 2.5],
  [(c) => P.volClimax(c) && P.closeBackBelowH(c), -1, 3],
  [(c) => P.volClimax(c) && P.closeBackAboveL(c), 1, 3],
  [(c) => P.volClimax(c) && P.macdHistFalling(c) && P.upCandle(c), -1, 2.5]
]);

add('34.6', 'Volatility Trend Expansion', 34, { method: 'vol', stopMult: 1.1, rr: 2.0 }, [
  [(c) => P.atrNormal(c) && P.bosUp(c) && P.volSpike(c), 1, 3],
  [(c) => P.atrNormal(c) && P.bosDn(c) && P.volSpike(c), -1, 3],
  [(c) => P.atrHigh(c) && P.structUp(c) && P.htfBull(c), 1, 3],
  [(c) => P.atrHigh(c) && P.structDn(c) && P.htfBear(c), -1, 3],
  [(c) => P.atrNormal(c) && P.ema8Above21(c) && P.adxStrong(c), 1, 2.5],
  [(c) => P.atrNormal(c) && P.ema8Below21(c) && P.adxStrong(c), -1, 2.5],
  [(c) => P.atrNormal(c) && P.chochBull(c) && P.macdHistRising(c), 1, 2.5],
  [(c) => P.atrNormal(c) && P.chochBear(c) && P.macdHistFalling(c), -1, 2.5],
  [(c) => P.atrNormal(c) && P.structNeutral(c), 0, 2],
  [(c) => P.atrVeryHigh(c), 0, 2.5]
]);

add('34.7', 'Volatility + Macro Volatility', 34, { method: 'vol', stopMult: 1.2, rr: 2.2 }, [
  [(c) => P.atrHigh(c) && P.vixSpiking(c) && P.rsiBear(c), -1, 3],
  [(c) => P.atrHigh(c) && P.vixCalm(c) && P.rsiBull(c), 1, 3],
  [(c) => P.atrNormal(c) && P.vixSpiking(c), 0, 2.5],
  [(c) => P.atrNormal(c) && P.vixCalm(c), 0, 2],
  [(c) => P.atrHigh(c) && P.dxyUp(c), -1, 2.5],
  [(c) => P.atrHigh(c) && P.dxyDown(c), 1, 2.5],
  [(c) => P.atrNormal(c) && P.tnxUp(c), -1, 2],
  [(c) => P.atrNormal(c) && P.tnxDown(c), 1, 2],
  [(c) => P.atrLow(c) && P.vixSpiking(c), 0, 2.5],
  [(c) => P.atrVeryHigh(c) && P.vixCalm(c), 0, 2.5]
]);

add('34.8', 'Volatility + Funding Regime', 34, { method: 'vol', stopMult: 1.2, rr: 2.2 }, [
  [(c) => P.atrHigh(c) && P.fundingExtremePos(c) && P.rsiOB(c), -1, 3.5],
  [(c) => P.atrHigh(c) && P.fundingExtremeNeg(c) && P.rsiOS(c), 1, 3.5],
  [(c) => P.atrNormal(c) && P.fundingFlipUp(c) && P.htfBull(c), 1, 2.5],
  [(c) => P.atrNormal(c) && P.fundingFlipDn(c) && P.htfBear(c), -1, 2.5],
  [(c) => P.atrNormal(c) && P.fundingHigh(c), -1, 2],
  [(c) => P.atrNormal(c) && P.fundingLow(c), 1, 2],
  [(c) => P.atrHigh(c) && P.oiSpike(c) && P.htfBull(c), 1, 2.5],
  [(c) => P.atrHigh(c) && P.oiDrop(c) && P.htfBear(c), -1, 2.5],
  [(c) => P.atrLow(c) && P.fundingHigh(c), 0, 2],
  [(c) => P.atrLow(c) && P.fundingLow(c), 0, 2]
]);

add('34.9', 'Volatility Multi-Timeframe Sync', 34, { method: 'vol', stopMult: 1.2, rr: 2.2 }, [
  [(c) => P.atrHigh(c) && P.h4Bull(c) && P.alignBull(c), 1, 3],
  [(c) => P.atrHigh(c) && P.h4Bear(c) && P.alignBear(c), -1, 3],
  [(c) => P.atrNormal(c) && P.htfBull(c) && P.macdHistRising(c), 1, 2.5],
  [(c) => P.atrNormal(c) && P.htfBear(c) && P.macdHistFalling(c), -1, 2.5],
  [(c) => P.atrHigh(c) && P.htfBull(c), 1, 2],
  [(c) => P.atrHigh(c) && P.htfBear(c), -1, 2],
  [(c) => P.atrLow(c) && P.htfBull(c), 1, 1.5],
  [(c) => P.atrLow(c) && P.htfBear(c), -1, 1.5],
  [(c) => P.atrVeryHigh(c), 0, 2.5],
  [(c) => P.atrLow(c) && P.mtfMixed(c), 0, 2.5]
]);

add('34.10', 'Volatility Quality Filter', 34, { method: 'vol', stopMult: 1.2, rr: 2.0 }, [
  [(c) => P.atrNormal(c) && P.rangeTight(c), 0, 2.5],
  [(c) => P.atrHigh(c) && P.rangeActive(c), 0, 2.5],
  [(c) => P.atrLow(c) && P.adxWeak(c), 0, 2.5],
  [(c) => P.atrNormal(c) && P.adxStrong(c) && P.rangeBreakUp(c), 1, 3],
  [(c) => P.atrNormal(c) && P.adxStrong(c) && P.rangeBreakDn(c), -1, 3],
  [(c) => P.atrHigh(c) && P.spreadWide(c), 0, 3],
  [(c) => P.atrNormal(c) && P.spreadTight(c) && P.alignBull(c), 1, 2],
  [(c) => P.atrNormal(c) && P.spreadTight(c) && P.alignBear(c), -1, 2],
  [(c) => P.atrLow(c) && P.rvolLow(c), 0, 2.5],
  [(c) => P.atrVeryHigh(c) && P.spreadWide(c), 0, 3]
]);

// ===================== CATEGORY 35: POSITION SIZE MASTERS ==================
add('35.1', 'Risk-Adjusted Position Sizer', 35, { method: 'risk', stopMult: 1.2, rr: 2.5 }, [
  [(c) => P.alignBull(c) && P.atrNormal(c) && P.adxStrong(c), 1, 3],
  [(c) => P.alignBear(c) && P.atrNormal(c) && P.adxStrong(c), -1, 3],
  [(c) => P.alignBull(c) && P.atrVeryHigh(c), 0, 3],
  [(c) => P.alignBear(c) && P.atrVeryHigh(c), 0, 3],
  [(c) => P.alignBull(c) && P.spreadWide(c), 0, 3],
  [(c) => P.alignBear(c) && P.spreadWide(c), 0, 3],
  [(c) => P.alignBull(c) && P.atrLow(c), 1, 1.5],
  [(c) => P.alignBear(c) && P.atrLow(c), -1, 1.5],
  [(c) => P.alignMixed(c), 0, 2],
  [(c) => P.adxWeak(c) && P.rangeTight(c), 0, 2.5]
]);

add('35.2', 'Stop Distance Optimizer', 35, { method: 'risk', stopMult: 1.3, rr: 2.5 }, [
  [(c) => P.alignBull(c) && P.atrNormal(c) && P.aboveEma21(c), 1, 3],
  [(c) => P.alignBear(c) && P.atrNormal(c) && P.belowEma21(c), -1, 3],
  [(c) => P.htfPullbackBuy(c) && P.atrNormal(c), 1, 3],
  [(c) => P.htfPullbackSell(c) && P.atrNormal(c), -1, 3],
  [(c) => P.alignBull(c) && P.atrHigh(c), 0, 2.5],
  [(c) => P.alignBear(c) && P.atrHigh(c), 0, 2.5],
  [(c) => P.atrVeryHigh(c), 0, 3],
  [(c) => P.spreadWide(c), 0, 3],
  [(c) => P.alignBull(c) && P.atrNormal(c) && P.rvolHigh(c), 1, 2],
  [(c) => P.alignBear(c) && P.atrNormal(c) && P.rvolHigh(c), -1, 2]
]);

add('35.3', 'Reward-Risk Ratio Evaluator', 35, { method: 'risk', stopMult: 1.2, rr: 2.5 }, [
  [(c) => P.alignBull(c) && P.atrNormal(c) && P.atSupport(c), 1, 3],
  [(c) => P.alignBear(c) && P.atrNormal(c) && P.atResistance(c), -1, 3],
  [(c) => P.alignBull(c) && P.nearSsl(c) && P.atrNormal(c), 1, 2.5],
  [(c) => P.alignBear(c) && P.nearBsl(c) && P.atrNormal(c), -1, 2.5],
  [(c) => P.alignBull(c) && P.atrVeryHigh(c), 0, 3],
  [(c) => P.alignBear(c) && P.atrVeryHigh(c), 0, 3],
  [(c) => P.alignBull(c) && P.rvolLow(c) && P.atrNormal(c), 1, 2],
  [(c) => P.alignBear(c) && P.rvolLow(c) && P.atrNormal(c), -1, 2],
  [(c) => P.rangeTight(c) && P.adxWeak(c), 0, 2.5],
  [(c) => P.alignMixed(c), 0, 2]
]);

add('35.4', 'Position Size Cap Filter', 35, { method: 'risk', stopMult: 1.2, rr: 2.0 }, [
  [(c) => P.atrVeryHigh(c) && P.volClimax(c), 0, 3],
  [(c) => P.spreadWide(c), 0, 3],
  [(c) => P.atrHigh(c) && P.alignBull(c), 0, 2.5],
  [(c) => P.atrHigh(c) && P.alignBear(c), 0, 2.5],
  [(c) => P.atrNormal(c) && P.alignBull(c) && P.htfBull(c), 1, 2.5],
  [(c) => P.atrNormal(c) && P.alignBear(c) && P.htfBear(c), -1, 2.5],
  [(c) => P.atrNormal(c) && P.alignBull(c), 1, 2],
  [(c) => P.atrNormal(c) && P.alignBear(c), -1, 2],
  [(c) => P.sysStale(c), 0, 3],
  [(c) => P.sysVeryStale(c), 0, 3]
]);

add('35.5', 'Leverage Safety Officer', 35, { method: 'risk', stopMult: 1.2, rr: 2.0 }, [
  [(c) => P.atrVeryHigh(c), 0, 3],
  [(c) => P.vixSpiking(c), 0, 3],
  [(c) => P.fundingExtremePos(c), 0, 2.5],
  [(c) => P.fundingExtremeNeg(c), 0, 2.5],
  [(c) => P.spreadWide(c), 0, 2.5],
  [(c) => P.atrNormal(c) && P.alignBull(c) && P.htfBull(c), 1, 2],
  [(c) => P.atrNormal(c) && P.alignBear(c) && P.htfBear(c), -1, 2],
  [(c) => P.atrNormal(c) && P.vixCalm(c), 1, 1.5],
  [(c) => P.atrNormal(c) && P.vixCalm(c), -1, 1.5],
  [(c) => P.atrHigh(c) && P.spreadTight(c), 0, 2]
]);

add('35.6', 'Volatility-Weighted Entry Sizer', 35, { method: 'risk', stopMult: 1.2, rr: 2.3 }, [
  [(c) => P.atrNormal(c) && P.rvolHigh(c) && P.alignBull(c), 1, 3],
  [(c) => P.atrNormal(c) && P.rvolHigh(c) && P.alignBear(c), -1, 3],
  [(c) => P.atrNormal(c) && P.volSpike(c) && P.htfBull(c), 1, 2.5],
  [(c) => P.atrNormal(c) && P.volSpike(c) && P.htfBear(c), -1, 2.5],
  [(c) => P.atrNormal(c) && P.rvolLow(c), 0, 2.5],
  [(c) => P.atrNormal(c) && P.volClimax(c), 0, 2.5],
  [(c) => P.atrHigh(c) && P.htfBull(c), 1, 1.5],
  [(c) => P.atrHigh(c) && P.htfBear(c), -1, 1.5],
  [(c) => P.atrNormal(c) && P.alignBull(c) && P.macdHistRising(c), 1, 2],
  [(c) => P.atrNormal(c) && P.alignBear(c) && P.macdHistFalling(c), -1, 2]
]);

add('35.7', 'Optimal Entry Timing Sizer', 35, { method: 'risk', stopMult: 1.2, rr: 2.4 }, [
  [(c) => P.atrNormal(c) && P.nearEma21At(c, 'low') && P.alignBull(c), 1, 3],
  [(c) => P.atrNormal(c) && P.nearEma21At(c, 'high') && P.alignBear(c), -1, 3],
  [(c) => P.atrNormal(c) && P.nearVwap(c) && P.htfBull(c), 1, 2.5],
  [(c) => P.atrNormal(c) && P.nearVwap(c) && P.htfBear(c), -1, 2.5],
  [(c) => P.atrNormal(c) && P.atSupport(c) && P.pinBull(c), 1, 3],
  [(c) => P.atrNormal(c) && P.atResistance(c) && P.pinBear(c), -1, 3],
  [(c) => P.atrNormal(c) && P.retestAboveLastH(c), 1, 2.5],
  [(c) => P.atrNormal(c) && P.retestBelowLastL(c), -1, 2.5],
  [(c) => P.atrNormal(c) && P.adxWeak(c), 0, 2.5],
  [(c) => P.atrNormal(c) && P.rangeTight(c), 0, 2.5]
]);

add('35.8', 'Fee & Spread Efficiency Analyst', 35, { method: 'risk', stopMult: 1.2, rr: 2.0 }, [
  [(c) => P.spreadTight(c) && P.alignBull(c) && P.htfBull(c), 1, 2.5],
  [(c) => P.spreadTight(c) && P.alignBear(c) && P.htfBear(c), -1, 2.5],
  [(c) => P.spreadWide(c), 0, 3],
  [(c) => P.spreadTight(c) && P.atrLow(c), 0, 2],
  [(c) => P.spreadTight(c) && P.alignBull(c), 1, 2],
  [(c) => P.spreadTight(c) && P.alignBear(c), -1, 2],
  [(c) => P.spreadTight(c) && P.rvolHigh(c) && P.alignBull(c), 1, 2.5],
  [(c) => P.spreadTight(c) && P.rvolHigh(c) && P.alignBear(c), -1, 2.5],
  [(c) => P.spreadTight(c) && P.rangeTight(c), 0, 2.5],
  [(c) => P.spreadWide(c) && P.htfBull(c), 0, 3]
]);

add('35.9', 'Correlated Risk Hedger', 35, { method: 'risk', stopMult: 1.2, rr: 2.0 }, [
  [(c) => P.dxyUp(c) && P.atrHigh(c), -1, 2.5],
  [(c) => P.dxyDown(c) && P.atrHigh(c), 1, 2.5],
  [(c) => P.tnxUp(c) && P.htfBear(c), -1, 2.5],
  [(c) => P.tnxDown(c) && P.htfBull(c), 1, 2.5],
  [(c) => P.vixSpiking(c), 0, 3],
  [(c) => P.silverUp(c) && P.alignBull(c), 1, 2],
  [(c) => P.silverDown(c) && P.alignBear(c), -1, 2],
  [(c) => P.usdjpyDown(c) && P.htfBull(c), 1, 2],
  [(c) => P.spotDiscount(c) && P.atrHigh(c), 0, 2.5],
  [(c) => P.spotPremium(c) && P.atrHigh(c), 0, 2.5]
]);

add('35.10', 'Final Position Sizing Governor', 35, { method: 'risk', stopMult: 1.2, rr: 2.2 }, [
  [(c) => P.atrNormal(c) && P.alignBull(c) && P.htfBull(c) && P.spreadTight(c), 1, 3],
  [(c) => P.atrNormal(c) && P.alignBear(c) && P.htfBear(c) && P.spreadTight(c), -1, 3],
  [(c) => P.atrVeryHigh(c), 0, 3],
  [(c) => P.spreadWide(c), 0, 3],
  [(c) => P.atrHigh(c), 0, 2.5],
  [(c) => P.sysStale(c), 0, 3],
  [(c) => P.alignMixed(c), 0, 2.5],
  [(c) => P.rangeTight(c) && P.adxWeak(c), 0, 2.5],
  [(c) => P.atrNormal(c) && P.alignBull(c), 1, 2],
  [(c) => P.atrNormal(c) && P.alignBear(c), -1, 2]
]);

// ===================== CATEGORY 36: ORDER BLOCK MASTERS ====================
add('36.1', 'Order Block Bounce Trader', 36, { method: 'ob', stopMult: 1.2, rr: 2.5 }, [
  [(c) => P.obBullNear(c) && P.alignBull(c), 1, 3],
  [(c) => P.obBearNear(c) && P.alignBear(c), -1, 3],
  [(c) => P.obBullNear(c) && P.pinBull(c), 1, 3],
  [(c) => P.obBearNear(c) && P.pinBear(c), -1, 3],
  [(c) => P.obBullNear(c) && P.macdHistRising(c), 1, 2.5],
  [(c) => P.obBearNear(c) && P.macdHistFalling(c), -1, 2.5],
  [(c) => P.obBullNear(c) && P.rsiDivBull(c), 1, 2.5],
  [(c) => P.obBearNear(c) && P.rsiDivBear(c), -1, 2.5],
  [(c) => P.obBullNear(c) && P.rvolLow(c), 0, 2],
  [(c) => P.obBearNear(c) && P.rvolLow(c), 0, 2]
]);

add('36.2', 'Order Block + Liquidity Sweep', 36, { method: 'ob', stopMult: 1.3, rr: 2.8 }, [
  [(c) => P.sweptSsl(c) && P.obBullNear(c), 1, 3.5],
  [(c) => P.sweptBsl(c) && P.obBearNear(c), -1, 3.5],
  [(c) => P.eqLowsSwept(c) && P.obBullNear(c), 1, 3],
  [(c) => P.eqHighsSwept(c) && P.obBearNear(c), -1, 3],
  [(c) => P.sweptSsl(c) && P.obBullNear(c) && P.pinBull(c), 1, 3.5],
  [(c) => P.sweptBsl(c) && P.obBearNear(c) && P.pinBear(c), -1, 3.5],
  [(c) => P.sweptSsl(c) && P.volClimax(c), 1, 3],
  [(c) => P.sweptBsl(c) && P.volClimax(c), -1, 3],
  [(c) => P.sweptSsl(c) && P.htfBull(c), 1, 2.5],
  [(c) => P.sweptBsl(c) && P.htfBear(c), -1, 2.5]
]);

add('36.3', 'Order Block Breakout Retest', 36, { method: 'ob', stopMult: 1.2, rr: 2.4 }, [
  [(c) => P.obBullNear(c) && P.retestAboveLastH(c), 1, 3],
  [(c) => P.obBearNear(c) && P.retestBelowLastL(c), -1, 3],
  [(c) => P.obBullNear(c) && P.aboveEma8(c), 1, 2.5],
  [(c) => P.obBearNear(c) && P.belowEma8(c), -1, 2.5],
  [(c) => P.obBullNear(c) && P.bosUp(c), 1, 2.5],
  [(c) => P.obBearNear(c) && P.bosDn(c), -1, 2.5],
  [(c) => P.obBullNear(c) && P.volSpike(c), 1, 2.5],
  [(c) => P.obBearNear(c) && P.volSpike(c), -1, 2.5],
  [(c) => P.obBullNear(c) && P.rangeAtLow(c), 1, 2],
  [(c) => P.obBearNear(c) && P.rangeAtHigh(c), -1, 2]
]);

add('36.4', 'Order Block Continuation Rider', 36, { method: 'ob', stopMult: 1.1, rr: 2.0 }, [
  [(c) => P.obBullNear(c) && P.structUp(c) && P.adxStrong(c), 1, 3],
  [(c) => P.obBearNear(c) && P.structDn(c) && P.adxStrong(c), -1, 3],
  [(c) => P.obBullNear(c) && P.htfPullbackBuy(c), 1, 3],
  [(c) => P.obBearNear(c) && P.htfPullbackSell(c), -1, 3],
  [(c) => P.obBullNear(c) && P.ema8Above21(c), 1, 2],
  [(c) => P.obBearNear(c) && P.ema8Below21(c), -1, 2],
  [(c) => P.obBullNear(c) && P.aboveVwap(c), 1, 2],
  [(c) => P.obBearNear(c) && P.belowVwap(c), -1, 2],
  [(c) => P.obBullNear(c) && P.rsiOB(c), 0, 2],
  [(c) => P.obBearNear(c) && P.rsiOS(c), 0, 2]
]);

add('36.5', 'Order Block Volume Confirmation', 36, { method: 'ob', stopMult: 1.1, rr: 2.0 }, [
  [(c) => P.obBullNear(c) && P.volSpike(c) && P.upCandle(c), 1, 3],
  [(c) => P.obBearNear(c) && P.volSpike(c) && P.downCandle(c), -1, 3],
  [(c) => P.obBullNear(c) && P.tapeBull(c), 1, 2.5],
  [(c) => P.obBearNear(c) && P.tapeBear(c), -1, 2.5],
  [(c) => P.obBullNear(c) && P.deltaPos(c), 1, 2.5],
  [(c) => P.obBearNear(c) && P.deltaNeg(c), -1, 2.5],
  [(c) => P.obBullNear(c) && P.bookBidHeavy(c), 1, 2],
  [(c) => P.obBearNear(c) && P.bookAskHeavy(c), -1, 2],
  [(c) => P.obBullNear(c) && P.rvolLow(c), 0, 2],
  [(c) => P.obBearNear(c) && P.rvolLow(c), 0, 2]
]);

add('36.6', 'Order Block + FVG Confluence', 36, { method: 'ob', stopMult: 1.2, rr: 2.4 }, [
  [(c) => P.obBullNear(c) && P.aboveFvg(c) && P.fvgUnfilled(c), 1, 3.5],
  [(c) => P.obBearNear(c) && P.belowFvg(c) && P.fvgUnfilled(c), -1, 3.5],
  [(c) => P.obBullNear(c) && P.nearFvg(c), 1, 2.5],
  [(c) => P.obBearNear(c) && P.nearFvg(c), -1, 2.5],
  [(c) => P.obBullNear(c) && P.voidAbove(c), 1, 2.5],
  [(c) => P.obBearNear(c) && P.voidBelow(c), -1, 2.5],
  [(c) => P.obBullNear(c) && P.fvgUnfilled(c), 1, 2],
  [(c) => P.obBearNear(c) && P.fvgUnfilled(c), -1, 2],
  [(c) => P.obBullNear(c) && P.voidNear(c), 0, 2.5],
  [(c) => P.obBearNear(c) && P.voidNear(c), 0, 2.5]
]);

add('36.7', 'Order Block + Dynamic S/R', 36, { method: 'ob', stopMult: 1.2, rr: 2.3 }, [
  [(c) => P.obBullNear(c) && P.atSupport(c), 1, 3],
  [(c) => P.obBearNear(c) && P.atResistance(c), -1, 3],
  [(c) => P.obBullNear(c) && P.nearSsl(c), 1, 2.5],
  [(c) => P.obBearNear(c) && P.nearBsl(c), -1, 2.5],
  [(c) => P.obBullNear(c) && P.atPoc(c), 1, 2.5],
  [(c) => P.obBearNear(c) && P.atPoc(c), -1, 2.5],
  [(c) => P.obBullNear(c) && P.atVal(c), 1, 2.5],
  [(c) => P.obBearNear(c) && P.atVah(c), -1, 2.5],
  [(c) => P.obBullNear(c) && P.brokeSupport(c), 0, 2.5],
  [(c) => P.obBearNear(c) && P.brokeResistance(c), 0, 2.5]
]);

add('36.8', 'Order Block + Trendline Trader', 36, { method: 'ob', stopMult: 1.2, rr: 2.3 }, [
  [(c) => P.obBullNear(c) && P.trendlineUpTouch(c), 1, 3],
  [(c) => P.obBearNear(c) && P.trendlineDnTouch(c), -1, 3],
  [(c) => P.obBullNear(c) && P.channelUpLowTouch(c), 1, 2.5],
  [(c) => P.obBearNear(c) && P.channelDnHighTouch(c), -1, 2.5],
  [(c) => P.obBullNear(c) && P.trendlineUpBreak(c), 1, 2.5],
  [(c) => P.obBearNear(c) && P.trendlineDnBreak(c), -1, 2.5],
  [(c) => P.obBullNear(c) && P.steepDnLine(c), 1, 2.5],
  [(c) => P.obBearNear(c) && P.steepUpLine(c), -1, 2.5],
  [(c) => P.obBullNear(c) && P.channelUpBreak(c), 1, 2.5],
  [(c) => P.obBearNear(c) && P.channelDnBreak(c), -1, 2.5]
]);

add('36.9', 'Order Block Multi-Timeframe Sync', 36, { method: 'ob', stopMult: 1.2, rr: 2.4 }, [
  [(c) => P.obBullNear(c) && P.htfBull(c) && P.h4Bull(c), 1, 3],
  [(c) => P.obBearNear(c) && P.htfBear(c) && P.h4Bear(c), -1, 3],
  [(c) => P.obBullNear(c) && P.htfBull(c), 1, 2.5],
  [(c) => P.obBearNear(c) && P.htfBear(c), -1, 2.5],
  [(c) => P.obBullNear(c) && P.allTfBull(c), 1, 3.5],
  [(c) => P.obBearNear(c) && P.allTfBear(c), -1, 3.5],
  [(c) => P.obBullNear(c) && P.htfBear(c), 0, 2.5],
  [(c) => P.obBearNear(c) && P.htfBull(c), 0, 2.5],
  [(c) => P.obBullNear(c) && P.d1Bull(c), 1, 2],
  [(c) => P.obBearNear(c) && P.d1Bear(c), -1, 2]
]);

add('36.10', 'Order Block Exhaustion Reader', 36, { method: 'ob', stopMult: 1.3, rr: 2.5 }, [
  [(c) => P.obBullNear(c) && P.sweptSsl(c) && P.volClimax(c), 1, 3.5],
  [(c) => P.obBearNear(c) && P.sweptBsl(c) && P.volClimax(c), -1, 3.5],
  [(c) => P.obBullNear(c) && P.deltaExtremeNeg(c), 1, 3],
  [(c) => P.obBearNear(c) && P.deltaExtremePos(c), -1, 3],
  [(c) => P.obBullNear(c) && P.rsiDivBull(c) && P.atrVeryHigh(c), 1, 3],
  [(c) => P.obBearNear(c) && P.rsiDivBear(c) && P.atrVeryHigh(c), -1, 3],
  [(c) => P.obBullNear(c) && P.fundingLow(c), 1, 2.5],
  [(c) => P.obBearNear(c) && P.fundingHigh(c), -1, 2.5],
  [(c) => P.obBullNear(c) && P.rangeAtLow(c) && P.volClimax(c), 1, 2.5],
  [(c) => P.obBearNear(c) && P.rangeAtHigh(c) && P.volClimax(c), -1, 2.5]
]);

// ===================== CATEGORY 37: FVG MASTERS ============================
add('37.1', 'FVG Reversal Trader', 37, { method: 'fvg', stopMult: 1.2, rr: 2.5 }, [
  [(c) => P.fvgUnfilled(c) && P.aboveFvg(c) && P.alignBear(c), -1, 3],
  [(c) => P.fvgUnfilled(c) && P.belowFvg(c) && P.alignBull(c), 1, 3],
  [(c) => P.nearFvg(c) && P.aboveFvg(c) && P.pinBear(c), -1, 3],
  [(c) => P.nearFvg(c) && P.belowFvg(c) && P.pinBull(c), 1, 3],
  [(c) => P.nearFvg(c) && P.aboveFvg(c) && P.rsiDivBear(c), -1, 2.5],
  [(c) => P.nearFvg(c) && P.belowFvg(c) && P.rsiDivBull(c), 1, 2.5],
  [(c) => P.fvgUnfilled(c) && P.aboveFvg(c) && P.macdHistFalling(c), -1, 2.5],
  [(c) => P.fvgUnfilled(c) && P.belowFvg(c) && P.macdHistRising(c), 1, 2.5],
  [(c) => P.nearFvg(c) && P.aboveFvg(c) && P.htfBull(c), 0, 2.5],
  [(c) => P.nearFvg(c) && P.belowFvg(c) && P.htfBear(c), 0, 2.5]
]);

add('37.2', 'FVG Continuation Trader', 37, { method: 'fvg', stopMult: 1.1, rr: 2.0 }, [
  [(c) => P.aboveFvg(c) && P.structUp(c) && P.adxStrong(c), 1, 3],
  [(c) => P.belowFvg(c) && P.structDn(c) && P.adxStrong(c), -1, 3],
  [(c) => P.aboveFvg(c) && P.htfBull(c), 1, 2.5],
  [(c) => P.belowFvg(c) && P.htfBear(c), -1, 2.5],
  [(c) => P.aboveFvg(c) && P.ema8Above21(c), 1, 2],
  [(c) => P.belowFvg(c) && P.ema8Below21(c), -1, 2],
  [(c) => P.aboveFvg(c) && P.rsiBull(c), 1, 2],
  [(c) => P.belowFvg(c) && P.rsiBear(c), -1, 2],
  [(c) => P.nearFvg(c) && P.rangeTight(c), 0, 2],
  [(c) => P.nearFvg(c) && P.adxWeak(c), 0, 2.5]
]);

add('37.3', 'FVG Fill Trader', 37, { method: 'fvg', stopMult: 1.2, rr: 2.4 }, [
  [(c) => P.nearFvg(c) && P.aboveFvg(c) && P.atResistance(c), -1, 3],
  [(c) => P.nearFvg(c) && P.belowFvg(c) && P.atSupport(c), 1, 3],
  [(c) => P.nearFvg(c) && P.aboveFvg(c) && P.engulfBear(c), -1, 2.5],
  [(c) => P.nearFvg(c) && P.belowFvg(c) && P.engulfBull(c), 1, 2.5],
  [(c) => P.nearFvg(c) && P.aboveFvg(c) && P.macdHistFalling(c), -1, 2.5],
  [(c) => P.nearFvg(c) && P.belowFvg(c) && P.macdHistRising(c), 1, 2.5],
  [(c) => P.nearFvg(c) && P.aboveFvg(c) && P.stKBelowD(c), -1, 2],
  [(c) => P.nearFvg(c) && P.belowFvg(c) && P.stKAboveD(c), 1, 2],
  [(c) => P.nearFvg(c) && P.aboveFvg(c) && P.htfBear(c), -1, 2],
  [(c) => P.nearFvg(c) && P.belowFvg(c) && P.htfBull(c), 1, 2]
]);

add('37.4', 'FVG + Order Block Combo', 37, { method: 'fvg', stopMult: 1.2, rr: 2.5 }, [
  [(c) => P.nearFvg(c) && P.belowFvg(c) && P.obBullNear(c), 1, 3.5],
  [(c) => P.nearFvg(c) && P.aboveFvg(c) && P.obBearNear(c), -1, 3.5],
  [(c) => P.belowFvg(c) && P.obBullNear(c), 1, 3],
  [(c) => P.aboveFvg(c) && P.obBearNear(c), -1, 3],
  [(c) => P.nearFvg(c) && P.sweptSsl(c), 1, 3],
  [(c) => P.nearFvg(c) && P.sweptBsl(c), -1, 3],
  [(c) => P.belowFvg(c) && P.voidNear(c), 0, 2.5],
  [(c) => P.aboveFvg(c) && P.voidNear(c), 0, 2.5],
  [(c) => P.belowFvg(c) && P.belowEma21(c), 0, 2],
  [(c) => P.aboveFvg(c) && P.aboveEma21(c), 0, 2]
]);

add('37.5', 'FVG Volume Confirmation', 37, { method: 'fvg', stopMult: 1.1, rr: 2.0 }, [
  [(c) => P.belowFvg(c) && P.volSpike(c) && P.upCandle(c), 1, 3],
  [(c) => P.aboveFvg(c) && P.volSpike(c) && P.downCandle(c), -1, 3],
  [(c) => P.belowFvg(c) && P.tapeBull(c), 1, 2.5],
  [(c) => P.aboveFvg(c) && P.tapeBear(c), -1, 2.5],
  [(c) => P.belowFvg(c) && P.deltaPos(c), 1, 2.5],
  [(c) => P.aboveFvg(c) && P.deltaNeg(c), -1, 2.5],
  [(c) => P.belowFvg(c) && P.bookBidHeavy(c), 1, 2],
  [(c) => P.aboveFvg(c) && P.bookAskHeavy(c), -1, 2],
  [(c) => P.nearFvg(c) && P.rvolLow(c), 0, 2.5],
  [(c) => P.nearFvg(c) && P.adxWeak(c), 0, 2]
]);

add('37.6', 'FVG + Liquidity Sweep Trader', 37, { method: 'fvg', stopMult: 1.3, rr: 2.8 }, [
  [(c) => P.eqLowsSwept(c) && P.belowFvg(c), 1, 3.5],
  [(c) => P.eqHighsSwept(c) && P.aboveFvg(c), -1, 3.5],
  [(c) => P.sweptSsl(c) && P.belowFvg(c), 1, 3.5],
  [(c) => P.sweptBsl(c) && P.aboveFvg(c), -1, 3.5],
  [(c) => P.sweptSsl(c) && P.nearFvg(c) && P.pinBull(c), 1, 3.5],
  [(c) => P.sweptBsl(c) && P.nearFvg(c) && P.pinBear(c), -1, 3.5],
  [(c) => P.eqLowsSwept(c) && P.volClimax(c), 1, 3],
  [(c) => P.eqHighsSwept(c) && P.volClimax(c), -1, 3],
  [(c) => P.sweptSsl(c) && P.htfBull(c), 1, 2.5],
  [(c) => P.sweptBsl(c) && P.htfBear(c), -1, 2.5]
]);

add('37.7', 'FVG + Dynamic S/R Trader', 37, { method: 'fvg', stopMult: 1.2, rr: 2.3 }, [
  [(c) => P.belowFvg(c) && P.atSupport(c), 1, 3],
  [(c) => P.aboveFvg(c) && P.atResistance(c), -1, 3],
  [(c) => P.belowFvg(c) && P.nearSsl(c), 1, 2.5],
  [(c) => P.aboveFvg(c) && P.nearBsl(c), -1, 2.5],
  [(c) => P.belowFvg(c) && P.atPoc(c), 1, 2.5],
  [(c) => P.aboveFvg(c) && P.atPoc(c), -1, 2.5],
  [(c) => P.belowFvg(c) && P.atVal(c), 1, 2.5],
  [(c) => P.aboveFvg(c) && P.atVah(c), -1, 2.5],
  [(c) => P.nearFvg(c) && P.atSupport(c), 1, 2],
  [(c) => P.nearFvg(c) && P.atResistance(c), -1, 2]
]);

add('37.8', 'FVG Trendline Confluence', 37, { method: 'fvg', stopMult: 1.2, rr: 2.3 }, [
  [(c) => P.belowFvg(c) && P.trendlineUpTouch(c), 1, 3],
  [(c) => P.aboveFvg(c) && P.trendlineDnTouch(c), -1, 3],
  [(c) => P.belowFvg(c) && P.channelUpLowTouch(c), 1, 2.5],
  [(c) => P.aboveFvg(c) && P.channelDnHighTouch(c), -1, 2.5],
  [(c) => P.belowFvg(c) && P.steepDnLine(c), 1, 2.5],
  [(c) => P.aboveFvg(c) && P.steepUpLine(c), -1, 2.5],
  [(c) => P.belowFvg(c) && P.retestAboveLastH(c), 1, 2.5],
  [(c) => P.aboveFvg(c) && P.retestBelowLastL(c), -1, 2.5],
  [(c) => P.nearFvg(c) && P.channelMid(c), 0, 2],
  [(c) => P.nearFvg(c) && P.rangeTight(c), 0, 2]
]);

add('37.9', 'FVG Multi-Timeframe Sync', 37, { method: 'fvg', stopMult: 1.2, rr: 2.4 }, [
  [(c) => P.belowFvg(c) && P.htfBull(c) && P.h4Bull(c), 1, 3],
  [(c) => P.aboveFvg(c) && P.htfBear(c) && P.h4Bear(c), -1, 3],
  [(c) => P.belowFvg(c) && P.htfBull(c), 1, 2.5],
  [(c) => P.aboveFvg(c) && P.htfBear(c), -1, 2.5],
  [(c) => P.belowFvg(c) && P.allTfBull(c), 1, 3.5],
  [(c) => P.aboveFvg(c) && P.allTfBear(c), -1, 3.5],
  [(c) => P.nearFvg(c) && P.htfBull(c), 1, 2],
  [(c) => P.nearFvg(c) && P.htfBear(c), -1, 2],
  [(c) => P.belowFvg(c) && P.htfBear(c), 0, 2.5],
  [(c) => P.aboveFvg(c) && P.htfBull(c), 0, 2.5]
]);

add('37.10', 'FVG Exhaustion Counter', 37, { method: 'fvg', stopMult: 1.3, rr: 2.5 }, [
  [(c) => P.aboveFvg(c) && P.rsiOB(c) && P.volClimax(c), -1, 3.5],
  [(c) => P.belowFvg(c) && P.rsiOS(c) && P.volClimax(c), 1, 3.5],
  [(c) => P.aboveFvg(c) && P.deltaExtremePos(c) && P.macdHistFalling(c), -1, 3],
  [(c) => P.belowFvg(c) && P.deltaExtremeNeg(c) && P.macdHistRising(c), 1, 3],
  [(c) => P.aboveFvg(c) && P.closeBackBelowH(c), -1, 3],
  [(c) => P.belowFvg(c) && P.closeBackAboveL(c), 1, 3],
  [(c) => P.aboveFvg(c) && P.fundingHigh(c), -1, 2.5],
  [(c) => P.belowFvg(c) && P.fundingLow(c), 1, 2.5],
  [(c) => P.aboveFvg(c) && P.rangeAtHigh(c), -1, 2.5],
  [(c) => P.belowFvg(c) && P.rangeAtLow(c), 1, 2.5]
]);

// ===================== CATEGORY 38: LIQUIDITY VOID / IMBALANCE MASTERS ====
add('38.1', 'Liquidity Void Magnet Trader', 38, { method: 'void', stopMult: 1.2, rr: 2.4 }, [
  [(c) => P.voidBelow(c) && P.alignBull(c), 1, 3],
  [(c) => P.voidAbove(c) && P.alignBear(c), -1, 3],
  [(c) => P.voidBelow(c) && P.structUp(c), 1, 2.5],
  [(c) => P.voidAbove(c) && P.structDn(c), -1, 2.5],
  [(c) => P.voidBelow(c) && P.htfBull(c), 1, 2.5],
  [(c) => P.voidAbove(c) && P.htfBear(c), -1, 2.5],
  [(c) => P.voidBelow(c) && P.rsiBull(c), 1, 2],
  [(c) => P.voidAbove(c) && P.rsiBear(c), -1, 2],
  [(c) => P.voidNear(c), 0, 2.5],
  [(c) => P.voidBelow(c) && P.htfBear(c), 0, 2.5]
]);

add('38.2', 'Void Reclaim Trader', 38, { method: 'void', stopMult: 1.2, rr: 2.5 }, [
  [(c) => P.closeBackAboveL(c) && P.voidBelow(c), 1, 3.5],
  [(c) => P.closeBackBelowH(c) && P.voidAbove(c), -1, 3.5],
  [(c) => P.sweptSsl(c) && P.voidBelow(c), 1, 3],
  [(c) => P.sweptBsl(c) && P.voidAbove(c), -1, 3],
  [(c) => P.voidBelow(c) && P.pinBull(c), 1, 2.5],
  [(c) => P.voidAbove(c) && P.pinBear(c), -1, 2.5],
  [(c) => P.voidBelow(c) && P.volSpike(c) && P.upCandle(c), 1, 2.5],
  [(c) => P.voidAbove(c) && P.volSpike(c) && P.downCandle(c), -1, 2.5],
  [(c) => P.voidNear(c) && P.rvolLow(c), 0, 2.5],
  [(c) => P.voidNear(c) && P.adxWeak(c), 0, 2.5]
]);

add('38.3', 'Void + Momentum Trader', 38, { method: 'void', stopMult: 1.1, rr: 2.0 }, [
  [(c) => P.voidBelow(c) && P.macdHistRising(c) && P.rsiAbove50(c), 1, 3],
  [(c) => P.voidAbove(c) && P.macdHistFalling(c) && P.rsiBelow50(c), -1, 3],
  [(c) => P.voidBelow(c) && P.momUp(c), 1, 2.5],
  [(c) => P.voidAbove(c) && P.momDown(c), -1, 2.5],
  [(c) => P.voidBelow(c) && P.stKAboveD(c), 1, 2],
  [(c) => P.voidAbove(c) && P.stKBelowD(c), -1, 2],
  [(c) => P.voidBelow(c) && P.cciRising(c), 1, 2],
  [(c) => P.voidAbove(c) && P.cciFalling(c), -1, 2],
  [(c) => P.voidBelow(c) && P.adxWeak(c), 0, 2.5],
  [(c) => P.voidAbove(c) && P.adxWeak(c), 0, 2.5]
]);

add('38.4', 'Void + Volume Imbalance', 38, { method: 'void', stopMult: 1.1, rr: 2.0 }, [
  [(c) => P.voidBelow(c) && P.volSpike(c) && P.tapeBull(c), 1, 3],
  [(c) => P.voidAbove(c) && P.volSpike(c) && P.tapeBear(c), -1, 3],
  [(c) => P.voidBelow(c) && P.deltaPos(c), 1, 2.5],
  [(c) => P.voidAbove(c) && P.deltaNeg(c), -1, 2.5],
  [(c) => P.voidBelow(c) && P.rvolHigh(c), 1, 2.5],
  [(c) => P.voidAbove(c) && P.rvolHigh(c), -1, 2.5],
  [(c) => P.voidBelow(c) && P.bookBidHeavy(c), 1, 2],
  [(c) => P.voidAbove(c) && P.bookAskHeavy(c), -1, 2],
  [(c) => P.voidBelow(c) && P.rvolLow(c), 0, 2.5],
  [(c) => P.voidAbove(c) && P.rvolLow(c), 0, 2.5]
]);

add('38.5', 'Void + Breakout Trader', 38, { method: 'void', stopMult: 1.1, rr: 2.0 }, [
  [(c) => P.voidBelow(c) && P.rangeBreakUp(c), 1, 3],
  [(c) => P.voidAbove(c) && P.rangeBreakDn(c), -1, 3],
  [(c) => P.voidBelow(c) && P.brokeResistance(c), 1, 2.5],
  [(c) => P.voidAbove(c) && P.brokeSupport(c), -1, 2.5],
  [(c) => P.voidBelow(c) && P.channelUpBreak(c), 1, 2.5],
  [(c) => P.voidAbove(c) && P.channelDnBreak(c), -1, 2.5],
  [(c) => P.voidBelow(c) && P.trendlineUpBreak(c), 1, 2.5],
  [(c) => P.voidAbove(c) && P.trendlineDnBreak(c), -1, 2.5],
  [(c) => P.voidBelow(c) && P.rangeFakeDn(c), 0, 2.5],
  [(c) => P.voidAbove(c) && P.rangeFakeUp(c), 0, 2.5]
]);

add('38.6', 'Void + S/R Confluence', 38, { method: 'void', stopMult: 1.2, rr: 2.3 }, [
  [(c) => P.voidBelow(c) && P.atSupport(c), 1, 3],
  [(c) => P.voidAbove(c) && P.atResistance(c), -1, 3],
  [(c) => P.voidBelow(c) && P.atPoc(c), 1, 2.5],
  [(c) => P.voidAbove(c) && P.atPoc(c), -1, 2.5],
  [(c) => P.voidBelow(c) && P.nearFib618(c), 1, 2.5],
  [(c) => P.voidAbove(c) && P.nearFib382(c), -1, 2.5],
  [(c) => P.voidBelow(c) && P.nearSsl(c), 1, 2.5],
  [(c) => P.voidAbove(c) && P.nearBsl(c), -1, 2.5],
  [(c) => P.voidNear(c) && P.atPoc(c), 0, 2.5],
  [(c) => P.voidBelow(c) && P.htfBear(c), 0, 2.5]
]);

add('38.7', 'Void + OB/FVG Stack', 38, { method: 'void', stopMult: 1.2, rr: 2.5 }, [
  [(c) => P.voidBelow(c) && P.obBullNear(c), 1, 3.5],
  [(c) => P.voidAbove(c) && P.obBearNear(c), -1, 3.5],
  [(c) => P.voidBelow(c) && P.belowFvg(c), 1, 3],
  [(c) => P.voidAbove(c) && P.aboveFvg(c), -1, 3],
  [(c) => P.voidBelow(c) && P.nearFvg(c), 1, 2.5],
  [(c) => P.voidAbove(c) && P.nearFvg(c), -1, 2.5],
  [(c) => P.voidBelow(c) && P.breakerBull(c), 1, 2.5],
  [(c) => P.voidAbove(c) && P.breakerBear(c), -1, 2.5],
  [(c) => P.voidNear(c) && P.obNear(c), 0, 2.5],
  [(c) => P.voidNear(c) && P.fvgUnfilled(c), 0, 2.5]
]);

add('38.8', 'Void Session Timing Trader', 38, { method: 'void', stopMult: 1.2, rr: 2.2 }, [
  [(c) => P.voidBelow(c) && P.london(c) && P.htfBull(c), 1, 3],
  [(c) => P.voidAbove(c) && P.london(c) && P.htfBear(c), -1, 3],
  [(c) => P.voidBelow(c) && P.newyork(c) && P.sessionYoung(c), 1, 3],
  [(c) => P.voidAbove(c) && P.newyork(c) && P.sessionYoung(c), -1, 3],
  [(c) => P.voidBelow(c) && P.newyork(c), 1, 2.5],
  [(c) => P.voidAbove(c) && P.newyork(c), -1, 2.5],
  [(c) => P.voidBelow(c) && P.nyLondonOverlap(c), 1, 2.5],
  [(c) => P.voidAbove(c) && P.nyLondonOverlap(c), -1, 2.5],
  [(c) => P.voidBelow(c) && P.asia(c), 0, 2],
  [(c) => P.voidAbove(c) && P.asia(c), 0, 2]
]);

add('38.9', 'Void Multi-Timeframe Sync', 38, { method: 'void', stopMult: 1.2, rr: 2.4 }, [
  [(c) => P.voidBelow(c) && P.htfBull(c) && P.h4Bull(c), 1, 3],
  [(c) => P.voidAbove(c) && P.htfBear(c) && P.h4Bear(c), -1, 3],
  [(c) => P.voidBelow(c) && P.htfBull(c), 1, 2.5],
  [(c) => P.voidAbove(c) && P.htfBear(c), -1, 2.5],
  [(c) => P.voidBelow(c) && P.allTfBull(c), 1, 3.5],
  [(c) => P.voidAbove(c) && P.allTfBear(c), -1, 3.5],
  [(c) => P.voidBelow(c) && P.htfBear(c), 0, 2.5],
  [(c) => P.voidAbove(c) && P.htfBull(c), 0, 2.5],
  [(c) => P.voidBelow(c) && P.d1Bull(c), 1, 2],
  [(c) => P.voidAbove(c) && P.d1Bear(c), -1, 2]
]);

add('38.10', 'Void Exhaustion Reversal', 38, { method: 'void', stopMult: 1.3, rr: 2.5 }, [
  [(c) => P.voidBelow(c) && P.rsiOS(c) && P.volClimax(c) && P.pinBull(c), 1, 3.5],
  [(c) => P.voidAbove(c) && P.rsiOB(c) && P.volClimax(c) && P.pinBear(c), -1, 3.5],
  [(c) => P.voidBelow(c) && P.deltaExtremeNeg(c), 1, 3],
  [(c) => P.voidAbove(c) && P.deltaExtremePos(c), -1, 3],
  [(c) => P.voidBelow(c) && P.closeBackAboveL(c), 1, 3],
  [(c) => P.voidAbove(c) && P.closeBackBelowH(c), -1, 3],
  [(c) => P.voidBelow(c) && P.fundingLow(c), 1, 2.5],
  [(c) => P.voidAbove(c) && P.fundingHigh(c), -1, 2.5],
  [(c) => P.voidBelow(c) && P.rangeAtLow(c) && P.volClimax(c), 1, 2.5],
  [(c) => P.voidAbove(c) && P.rangeAtHigh(c) && P.volClimax(c), -1, 2.5]
]);

// ===================== CATEGORY 39: BREAKER BLOCK MASTERS ==================
add('39.1', 'Breaker Block Reversal Trader', 39, { method: 'breaker', stopMult: 1.2, rr: 2.6 }, [
  [(c) => P.breakerBull(c) && P.aboveBreaker(c) && P.alignBull(c), 1, 3],
  [(c) => P.breakerBear(c) && P.belowBreaker(c) && P.alignBear(c), -1, 3],
  [(c) => P.breakerBull(c) && P.aboveBreaker(c) && P.chochBull(c), 1, 3],
  [(c) => P.breakerBear(c) && P.belowBreaker(c) && P.chochBear(c), -1, 3],
  [(c) => P.breakerBull(c) && P.aboveBreaker(c) && P.macdHistRising(c), 1, 2.5],
  [(c) => P.breakerBear(c) && P.belowBreaker(c) && P.macdHistFalling(c), -1, 2.5],
  [(c) => P.breakerBull(c) && P.aboveBreaker(c) && P.rsiDivBull(c), 1, 2.5],
  [(c) => P.breakerBear(c) && P.belowBreaker(c) && P.rsiDivBear(c), -1, 2.5],
  [(c) => P.breakerBull(c) && P.aboveBreaker(c) && P.htfBear(c), 0, 2.5],
  [(c) => P.breakerBear(c) && P.belowBreaker(c) && P.htfBull(c), 0, 2.5]
]);

add('39.2', 'Breaker + Liquidity Sweep', 39, { method: 'breaker', stopMult: 1.3, rr: 2.8 }, [
  [(c) => P.sweptBsl(c) && P.breakerBull(c) && P.aboveBreaker(c), 1, 3.5],
  [(c) => P.sweptSsl(c) && P.breakerBear(c) && P.belowBreaker(c), -1, 3.5],
  [(c) => P.eqHighsSwept(c) && P.breakerBull(c), 1, 3],
  [(c) => P.eqLowsSwept(c) && P.breakerBear(c), -1, 3],
  [(c) => P.sweptBsl(c) && P.volClimax(c) && P.breakerBull(c), 1, 3],
  [(c) => P.sweptSsl(c) && P.volClimax(c) && P.breakerBear(c), -1, 3],
  [(c) => P.sweptBsl(c) && P.htfBull(c), 1, 2.5],
  [(c) => P.sweptSsl(c) && P.htfBear(c), -1, 2.5],
  [(c) => P.sweptBsl(c) && P.rsiDivBull(c), 1, 2.5],
  [(c) => P.sweptSsl(c) && P.rsiDivBear(c), -1, 2.5]
]);

add('39.3', 'Breaker Continuation Trader', 39, { method: 'breaker', stopMult: 1.1, rr: 2.0 }, [
  [(c) => P.breakerBull(c) && P.aboveBreaker(c) && P.structUp(c), 1, 3],
  [(c) => P.breakerBear(c) && P.belowBreaker(c) && P.structDn(c), -1, 3],
  [(c) => P.breakerBull(c) && P.aboveBreaker(c) && P.adxStrong(c), 1, 2.5],
  [(c) => P.breakerBear(c) && P.belowBreaker(c) && P.adxStrong(c), -1, 2.5],
  [(c) => P.breakerBull(c) && P.aboveBreaker(c) && P.ema8Above21(c), 1, 2],
  [(c) => P.breakerBear(c) && P.belowBreaker(c) && P.ema8Below21(c), -1, 2],
  [(c) => P.breakerBull(c) && P.aboveBreaker(c) && P.aboveVwap(c), 1, 2],
  [(c) => P.breakerBear(c) && P.belowBreaker(c) && P.belowVwap(c), -1, 2],
  [(c) => P.breakerBull(c) && P.aboveBreaker(c) && P.rsiOB(c), 0, 2],
  [(c) => P.breakerBear(c) && P.belowBreaker(c) && P.rsiOS(c), 0, 2]
]);

add('39.4', 'Breaker + OB/FVG Stack', 39, { method: 'breaker', stopMult: 1.2, rr: 2.5 }, [
  [(c) => P.breakerBull(c) && P.aboveBreaker(c) && P.obBullNear(c), 1, 3.5],
  [(c) => P.breakerBear(c) && P.belowBreaker(c) && P.obBearNear(c), -1, 3.5],
  [(c) => P.breakerBull(c) && P.aboveBreaker(c) && P.belowFvg(c), 1, 3],
  [(c) => P.breakerBear(c) && P.belowBreaker(c) && P.aboveFvg(c), -1, 3],
  [(c) => P.breakerBull(c) && P.nearFvg(c), 1, 2.5],
  [(c) => P.breakerBear(c) && P.nearFvg(c), -1, 2.5],
  [(c) => P.breakerBull(c) && P.voidBelow(c), 1, 2.5],
  [(c) => P.breakerBear(c) && P.voidAbove(c), -1, 2.5],
  [(c) => P.breakerBull(c) && P.fvgUnfilled(c) && P.aboveFvg(c), 0, 2.5],
  [(c) => P.breakerBear(c) && P.fvgUnfilled(c) && P.belowFvg(c), 0, 2.5]
]);

add('39.5', 'Breaker Volume Confirmation', 39, { method: 'breaker', stopMult: 1.1, rr: 2.0 }, [
  [(c) => P.breakerBull(c) && P.aboveBreaker(c) && P.volSpike(c), 1, 3],
  [(c) => P.breakerBear(c) && P.belowBreaker(c) && P.volSpike(c), -1, 3],
  [(c) => P.breakerBull(c) && P.aboveBreaker(c) && P.tapeBull(c), 1, 2.5],
  [(c) => P.breakerBear(c) && P.belowBreaker(c) && P.tapeBear(c), -1, 2.5],
  [(c) => P.breakerBull(c) && P.aboveBreaker(c) && P.deltaPos(c), 1, 2.5],
  [(c) => P.breakerBear(c) && P.belowBreaker(c) && P.deltaNeg(c), -1, 2.5],
  [(c) => P.breakerBull(c) && P.aboveBreaker(c) && P.bookBidHeavy(c), 1, 2],
  [(c) => P.breakerBear(c) && P.belowBreaker(c) && P.bookAskHeavy(c), -1, 2],
  [(c) => P.breakerBull(c) && P.aboveBreaker(c) && P.rvolLow(c), 0, 2],
  [(c) => P.breakerBear(c) && P.belowBreaker(c) && P.rvolLow(c), 0, 2]
]);

add('39.6', 'Breaker + S/R Trader', 39, { method: 'breaker', stopMult: 1.2, rr: 2.3 }, [
  [(c) => P.breakerBull(c) && P.aboveBreaker(c) && P.atSupport(c), 1, 3],
  [(c) => P.breakerBear(c) && P.belowBreaker(c) && P.atResistance(c), -1, 3],
  [(c) => P.breakerBull(c) && P.aboveBreaker(c) && P.nearSsl(c), 1, 2.5],
  [(c) => P.breakerBear(c) && P.belowBreaker(c) && P.nearBsl(c), -1, 2.5],
  [(c) => P.breakerBull(c) && P.aboveBreaker(c) && P.atPoc(c), 1, 2.5],
  [(c) => P.breakerBear(c) && P.belowBreaker(c) && P.atPoc(c), -1, 2.5],
  [(c) => P.breakerBull(c) && P.aboveBreaker(c) && P.atVal(c), 1, 2],
  [(c) => P.breakerBear(c) && P.belowBreaker(c) && P.atVah(c), -1, 2],
  [(c) => P.breakerBull(c) && P.aboveBreaker(c) && P.aboveVah(c), 0, 2.5],
  [(c) => P.breakerBear(c) && P.belowBreaker(c) && P.belowVal(c), 0, 2.5]
]);

add('39.7', 'Breaker Retest Trader', 39, { method: 'breaker', stopMult: 1.2, rr: 2.5 }, [
  [(c) => P.breakerBull(c) && P.retestAboveLastH(c), 1, 3],
  [(c) => P.breakerBear(c) && P.retestBelowLastL(c), -1, 3],
  [(c) => P.breakerBull(c) && P.closeBackBelowH(c), 0, 3],
  [(c) => P.breakerBear(c) && P.closeBackAboveL(c), 0, 3],
  [(c) => P.breakerBull(c) && P.retestAboveLastH(c) && P.tapeBull(c), 1, 3],
  [(c) => P.breakerBear(c) && P.retestBelowLastL(c) && P.tapeBear(c), -1, 3],
  [(c) => P.breakerBull(c) && P.retestAboveLastH(c) && P.htfBull(c), 1, 2.5],
  [(c) => P.breakerBear(c) && P.retestBelowLastL(c) && P.htfBear(c), -1, 2.5],
  [(c) => P.breakerBull(c) && P.retestAboveLastH(c) && P.rvolLow(c), 0, 2.5],
  [(c) => P.breakerBear(c) && P.retestBelowLastL(c) && P.rvolLow(c), 0, 2.5]
]);

add('39.8', 'Breaker + Trendline Trader', 39, { method: 'breaker', stopMult: 1.2, rr: 2.3 }, [
  [(c) => P.breakerBull(c) && P.aboveBreaker(c) && P.trendlineUpTouch(c), 1, 3],
  [(c) => P.breakerBear(c) && P.belowBreaker(c) && P.trendlineDnTouch(c), -1, 3],
  [(c) => P.breakerBull(c) && P.aboveBreaker(c) && P.trendlineUpBreak(c), 1, 2.5],
  [(c) => P.breakerBear(c) && P.belowBreaker(c) && P.trendlineDnBreak(c), -1, 2.5],
  [(c) => P.breakerBull(c) && P.aboveBreaker(c) && P.channelUpLowTouch(c), 1, 2.5],
  [(c) => P.breakerBear(c) && P.belowBreaker(c) && P.channelDnHighTouch(c), -1, 2.5],
  [(c) => P.breakerBull(c) && P.aboveBreaker(c) && P.channelUpBreak(c), 1, 2.5],
  [(c) => P.breakerBear(c) && P.belowBreaker(c) && P.channelDnBreak(c), -1, 2.5],
  [(c) => P.breakerBull(c) && P.aboveBreaker(c) && P.steepDnLine(c), 1, 2.5],
  [(c) => P.breakerBear(c) && P.belowBreaker(c) && P.steepUpLine(c), -1, 2.5]
]);

add('39.9', 'Breaker Multi-Timeframe Sync', 39, { method: 'breaker', stopMult: 1.2, rr: 2.4 }, [
  [(c) => P.breakerBull(c) && P.aboveBreaker(c) && P.htfBull(c), 1, 3],
  [(c) => P.breakerBear(c) && P.belowBreaker(c) && P.htfBear(c), -1, 3],
  [(c) => P.breakerBull(c) && P.aboveBreaker(c) && P.h4Bull(c), 1, 2.5],
  [(c) => P.breakerBear(c) && P.belowBreaker(c) && P.h4Bear(c), -1, 2.5],
  [(c) => P.breakerBull(c) && P.aboveBreaker(c) && P.allTfBull(c), 1, 3.5],
  [(c) => P.breakerBear(c) && P.belowBreaker(c) && P.allTfBear(c), -1, 3.5],
  [(c) => P.breakerBull(c) && P.aboveBreaker(c) && P.htfBear(c), 0, 2.5],
  [(c) => P.breakerBear(c) && P.belowBreaker(c) && P.htfBull(c), 0, 2.5],
  [(c) => P.breakerBull(c) && P.aboveBreaker(c) && P.d1Bull(c), 1, 2],
  [(c) => P.breakerBear(c) && P.belowBreaker(c) && P.d1Bear(c), -1, 2]
]);

add('39.10', 'Breaker Exhaustion Counter', 39, { method: 'breaker', stopMult: 1.3, rr: 2.5 }, [
  [(c) => P.breakerBull(c) && P.aboveBreaker(c) && P.rsiOB(c) && P.volClimax(c), 0, 3.5],
  [(c) => P.breakerBear(c) && P.belowBreaker(c) && P.rsiOS(c) && P.volClimax(c), 0, 3.5],
  [(c) => P.breakerBull(c) && P.aboveBreaker(c) && P.deltaExtremePos(c), 0, 3],
  [(c) => P.breakerBear(c) && P.belowBreaker(c) && P.deltaExtremeNeg(c), 0, 3],
  [(c) => P.breakerBull(c) && P.aboveBreaker(c) && P.fundingHigh(c), -1, 2.5],
  [(c) => P.breakerBear(c) && P.belowBreaker(c) && P.fundingLow(c), 1, 2.5],
  [(c) => P.breakerBull(c) && P.aboveBreaker(c) && P.atVah(c), -1, 2.5],
  [(c) => P.breakerBear(c) && P.belowBreaker(c) && P.atVal(c), 1, 2.5],
  [(c) => P.breakerBull(c) && P.aboveBreaker(c) && P.macdHistFalling(c), 0, 2.5],
  [(c) => P.breakerBear(c) && P.belowBreaker(c) && P.macdHistRising(c), 0, 2.5]
]);

// ===================== CATEGORY 40: INDUCEMENT MASTERS =====================
add('40.1', 'Inducement Bull Trader', 40, { method: 'induce', stopMult: 1.3, rr: 2.8 }, [
  [(c) => P.induceBull(c) && P.alignBull(c), 1, 3.5],
  [(c) => P.induceBear(c) && P.alignBear(c), -1, 3.5],
  [(c) => P.induceBull(c) && P.macdHistRising(c), 1, 3],
  [(c) => P.induceBear(c) && P.macdHistFalling(c), -1, 3],
  [(c) => P.induceBull(c) && P.sweptSsl(c), 1, 3],
  [(c) => P.induceBear(c) && P.sweptBsl(c), -1, 3],
  [(c) => P.induceBull(c) && P.htfBull(c), 1, 2.5],
  [(c) => P.induceBear(c) && P.htfBear(c), -1, 2.5],
  [(c) => P.induceBull(c) && P.htfBear(c), 0, 2.5],
  [(c) => P.induceBear(c) && P.htfBull(c), 0, 2.5]
]);

add('40.2', 'Inducement + Liquidity Trader', 40, { method: 'induce', stopMult: 1.3, rr: 2.8 }, [
  [(c) => P.induceBull(c) && P.eqLowsSwept(c), 1, 3.5],
  [(c) => P.induceBear(c) && P.eqHighsSwept(c), -1, 3.5],
  [(c) => P.induceBull(c) && P.sweptSsl(c) && P.volClimax(c), 1, 3.5],
  [(c) => P.induceBear(c) && P.sweptBsl(c) && P.volClimax(c), -1, 3.5],
  [(c) => P.induceBull(c) && P.closeBackAboveL(c), 1, 3],
  [(c) => P.induceBear(c) && P.closeBackBelowH(c), -1, 3],
  [(c) => P.induceBull(c) && P.obBullNear(c), 1, 3],
  [(c) => P.induceBear(c) && P.obBearNear(c), -1, 3],
  [(c) => P.induceBull(c) && P.rangeFakeDn(c), 1, 3],
  [(c) => P.induceBear(c) && P.rangeFakeUp(c), -1, 3]
]);

add('40.3', 'Inducement Continuation Trader', 40, { method: 'induce', stopMult: 1.2, rr: 2.2 }, [
  [(c) => P.induceBull(c) && P.structUp(c) && P.adxStrong(c), 1, 3],
  [(c) => P.induceBear(c) && P.structDn(c) && P.adxStrong(c), -1, 3],
  [(c) => P.induceBull(c) && P.ema8Above21(c), 1, 2.5],
  [(c) => P.induceBear(c) && P.ema8Below21(c), -1, 2.5],
  [(c) => P.induceBull(c) && P.aboveVwap(c), 1, 2],
  [(c) => P.induceBear(c) && P.belowVwap(c), -1, 2],
  [(c) => P.induceBull(c) && P.rsiBull(c), 1, 2],
  [(c) => P.induceBear(c) && P.rsiBear(c), -1, 2],
  [(c) => P.induceBull(c) && P.aboveBreaker(c), 1, 2.5],
  [(c) => P.induceBear(c) && P.belowBreaker(c), -1, 2.5]
]);

add('40.4', 'Inducement + Volume Trader', 40, { method: 'induce', stopMult: 1.1, rr: 2.0 }, [
  [(c) => P.induceBull(c) && P.volSpike(c) && P.upCandle(c), 1, 3],
  [(c) => P.induceBear(c) && P.volSpike(c) && P.downCandle(c), -1, 3],
  [(c) => P.induceBull(c) && P.tapeBull(c), 1, 2.5],
  [(c) => P.induceBear(c) && P.tapeBear(c), -1, 2.5],
  [(c) => P.induceBull(c) && P.deltaPos(c), 1, 2.5],
  [(c) => P.induceBear(c) && P.deltaNeg(c), -1, 2.5],
  [(c) => P.induceBull(c) && P.bookBidHeavy(c), 1, 2],
  [(c) => P.induceBear(c) && P.bookAskHeavy(c), -1, 2],
  [(c) => P.induceBull(c) && P.rvolLow(c), 0, 2.5],
  [(c) => P.induceBear(c) && P.rvolLow(c), 0, 2.5]
]);

add('40.5', 'Inducement + S/R Trader', 40, { method: 'induce', stopMult: 1.2, rr: 2.4 }, [
  [(c) => P.induceBull(c) && P.atSupport(c), 1, 3],
  [(c) => P.induceBear(c) && P.atResistance(c), -1, 3],
  [(c) => P.induceBull(c) && P.nearSsl(c), 1, 2.5],
  [(c) => P.induceBear(c) && P.nearBsl(c), -1, 2.5],
  [(c) => P.induceBull(c) && P.atPoc(c), 1, 2.5],
  [(c) => P.induceBear(c) && P.atPoc(c), -1, 2.5],
  [(c) => P.induceBull(c) && P.nearFib618(c), 1, 2.5],
  [(c) => P.induceBear(c) && P.nearFib382(c), -1, 2.5],
  [(c) => P.induceBull(c) && P.atVal(c), 1, 2],
  [(c) => P.induceBear(c) && P.atVah(c), -1, 2]
]);

add('40.6', 'Inducement + FVG/OB Trader', 40, { method: 'induce', stopMult: 1.2, rr: 2.5 }, [
  [(c) => P.induceBull(c) && P.belowFvg(c), 1, 3.5],
  [(c) => P.induceBear(c) && P.aboveFvg(c), -1, 3.5],
  [(c) => P.induceBull(c) && P.obBullNear(c), 1, 3],
  [(c) => P.induceBear(c) && P.obBearNear(c), -1, 3],
  [(c) => P.induceBull(c) && P.nearFvg(c), 1, 2.5],
  [(c) => P.induceBear(c) && P.nearFvg(c), -1, 2.5],
  [(c) => P.induceBull(c) && P.breakerBull(c), 1, 2.5],
  [(c) => P.induceBear(c) && P.breakerBear(c), -1, 2.5],
  [(c) => P.induceBull(c) && P.voidNear(c), 0, 2.5],
  [(c) => P.induceBear(c) && P.voidNear(c), 0, 2.5]
]);

add('40.7', 'Inducement Trendline Trader', 40, { method: 'induce', stopMult: 1.2, rr: 2.4 }, [
  [(c) => P.induceBull(c) && P.trendlineUpTouch(c), 1, 3],
  [(c) => P.induceBear(c) && P.trendlineDnTouch(c), -1, 3],
  [(c) => P.induceBull(c) && P.channelUpLowTouch(c), 1, 2.5],
  [(c) => P.induceBear(c) && P.channelDnHighTouch(c), -1, 2.5],
  [(c) => P.induceBull(c) && P.trendlineUpBreak(c), 1, 2.5],
  [(c) => P.induceBear(c) && P.trendlineDnBreak(c), -1, 2.5],
  [(c) => P.induceBull(c) && P.channelUpBreak(c), 1, 2.5],
  [(c) => P.induceBear(c) && P.channelDnBreak(c), -1, 2.5],
  [(c) => P.induceBull(c) && P.rangeBreakUp(c), 1, 2.5],
  [(c) => P.induceBear(c) && P.rangeBreakDn(c), -1, 2.5]
]);

add('40.8', 'Inducement Session Trader', 40, { method: 'induce', stopMult: 1.2, rr: 2.2 }, [
  [(c) => P.induceBull(c) && P.newyork(c) && P.sessionYoung(c), 1, 3],
  [(c) => P.induceBear(c) && P.newyork(c) && P.sessionYoung(c), -1, 3],
  [(c) => P.induceBull(c) && P.london(c), 1, 2.5],
  [(c) => P.induceBear(c) && P.london(c), -1, 2.5],
  [(c) => P.induceBull(c) && P.nyLondonOverlap(c), 1, 2.5],
  [(c) => P.induceBear(c) && P.nyLondonOverlap(c), -1, 2.5],
  [(c) => P.induceBull(c) && P.sessionMature(c), 1, 1.5],
  [(c) => P.induceBear(c) && P.sessionMature(c), -1, 1.5],
  [(c) => P.induceBull(c) && P.asia(c), 0, 2],
  [(c) => P.induceBear(c) && P.asia(c), 0, 2]
]);

add('40.9', 'Inducement Multi-Timeframe Sync', 40, { method: 'induce', stopMult: 1.2, rr: 2.5 }, [
  [(c) => P.induceBull(c) && P.htfBull(c) && P.h4Bull(c), 1, 3.5],
  [(c) => P.induceBear(c) && P.htfBear(c) && P.h4Bear(c), -1, 3.5],
  [(c) => P.induceBull(c) && P.htfBull(c), 1, 2.5],
  [(c) => P.induceBear(c) && P.htfBear(c), -1, 2.5],
  [(c) => P.induceBull(c) && P.allTfBull(c), 1, 3.5],
  [(c) => P.induceBear(c) && P.allTfBear(c), -1, 3.5],
  [(c) => P.induceBull(c) && P.htfBear(c), 0, 2.5],
  [(c) => P.induceBear(c) && P.htfBull(c), 0, 2.5],
  [(c) => P.induceBull(c) && P.d1Bull(c), 1, 2],
  [(c) => P.induceBear(c) && P.d1Bear(c), -1, 2]
]);

add('40.10', 'Inducement Exhaustion Reversal', 40, { method: 'induce', stopMult: 1.3, rr: 2.5 }, [
  [(c) => P.induceBull(c) && P.rsiOB(c) && P.volClimax(c) && P.aboveBBUp(c), 0, 3.5],
  [(c) => P.induceBear(c) && P.rsiOS(c) && P.volClimax(c) && P.belowBBLo(c), 0, 3.5],
  [(c) => P.induceBull(c) && P.deltaExtremePos(c) && P.macdHistFalling(c), 0, 3],
  [(c) => P.induceBear(c) && P.deltaExtremeNeg(c) && P.macdHistRising(c), 0, 3],
  [(c) => P.induceBull(c) && P.fundingLow(c) && P.rsiOS(c), 1, 3],
  [(c) => P.induceBear(c) && P.fundingHigh(c) && P.rsiOB(c), -1, 3],
  [(c) => P.induceBull(c) && P.atVal(c) && P.rsiOS(c), 1, 2.5],
  [(c) => P.induceBear(c) && P.atVah(c) && P.rsiOB(c), -1, 2.5],
  [(c) => P.induceBull(c) && P.rangeAtHigh(c) && P.volClimax(c), 0, 2.5],
  [(c) => P.induceBear(c) && P.rangeAtLow(c) && P.volClimax(c), 0, 2.5]
]);

module.exports = { agents: require('./engine.js').agents };
