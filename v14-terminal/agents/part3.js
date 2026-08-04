'use strict';

// ============================================================================
// PART C3 — AGENT SWARM: CATEGORIES 21–30 (Agents 21.1 – 30.10) = 100 agents
// Momentum Masters (Cats 21-25) + Moving Average Masters (Cats 26-30)
// Each agent: 10 rules → 1 vote (LONG or SHORT — forced side, never NEUTRAL).
// ============================================================================

const { P, add } = require('./engine.js');

const price = (c) => c.price;
const atr = (c) => (c.ind ? c.ind.atr14 : null);

// ===================== CATEGORY 21: RSI MASTERS ============================
add('21.1', 'RSI Trend Rider', 21, { method: 'rsi', stopMult: 1.2, rr: 2.2 }, [
  [(c) => P.rsiBull(c) && P.alignBull(c), 1, 3],
  [(c) => P.rsiBear(c) && P.alignBear(c), -1, 3],
  [(c) => P.rsiAbove50(c) && P.aboveEma21(c) && P.aboveVwap(c), 1, 2.5],
  [(c) => P.rsiBelow50(c) && P.belowEma21(c) && P.belowVwap(c), -1, 2.5],
  [(c) => P.rsiBull(c) && P.ema8Above21(c), 1, 2],
  [(c) => P.rsiBear(c) && P.ema8Below21(c), -1, 2],
  [(c) => P.rsiAbove50(c) && P.structUp(c), 1, 2],
  [(c) => P.rsiBelow50(c) && P.structDn(c), -1, 2],
  [(c) => P.rsiAbove50(c) && P.structDn(c), 0, 2],
  [(c) => P.rsiBelow50(c) && P.structUp(c), 0, 2]
]);

add('21.2', 'RSI Overbought Reversal Hunter', 21, { method: 'rsi', stopMult: 1.2, rr: 2.4 }, [
  [(c) => P.rsiOB(c) && P.atResistance(c), -1, 3],
  [(c) => P.rsiOB(c) && P.pinBear(c), -1, 3],
  [(c) => P.rsiOB(c) && P.engulfBear(c), -1, 2.5],
  [(c) => P.rsiOB(c) && P.nearBsl(c), -1, 2.5],
  [(c) => P.rsiOB(c) && P.aboveBBUp(c), -1, 2.5],
  [(c) => P.rsiOB(c) && P.rsiDivBear(c), -1, 3],
  [(c) => P.rsiOB(c) && P.macdHistFalling(c), -1, 2],
  [(c) => P.rsiOB(c) && P.rangeAtHigh(c), -1, 2],
  [(c) => P.rsiOB(c) && P.alignBull(c), 0, 2],
  [(c) => P.rsiOB(c) && P.htfBull(c), 0, 1.5]
]);

add('21.3', 'RSI Oversold Reversal Hunter', 21, { method: 'rsi', stopMult: 1.2, rr: 2.4 }, [
  [(c) => P.rsiOS(c) && P.atSupport(c), 1, 3],
  [(c) => P.rsiOS(c) && P.pinBull(c), 1, 3],
  [(c) => P.rsiOS(c) && P.engulfBull(c), 1, 2.5],
  [(c) => P.rsiOS(c) && P.nearSsl(c), 1, 2.5],
  [(c) => P.rsiOS(c) && P.belowBBLo(c), 1, 2.5],
  [(c) => P.rsiOS(c) && P.rsiDivBull(c), 1, 3],
  [(c) => P.rsiOS(c) && P.macdHistRising(c), 1, 2],
  [(c) => P.rsiOS(c) && P.rangeAtLow(c), 1, 2],
  [(c) => P.rsiOS(c) && P.alignBear(c), 0, 2],
  [(c) => P.rsiOS(c) && P.htfBear(c), 0, 1.5]
]);

add('21.4', 'RSI Divergence Specialist', 21, { method: 'rsi', stopMult: 1.3, rr: 2.6 }, [
  [(c) => P.rsiDivBull(c) && P.atSupport(c), 1, 3.5],
  [(c) => P.rsiDivBear(c) && P.atResistance(c), -1, 3.5],
  [(c) => P.rsiDivBull(c) && P.macdHistRising(c), 1, 3],
  [(c) => P.rsiDivBear(c) && P.macdHistFalling(c), -1, 3],
  [(c) => P.rsiDivBull(c) && P.pinBull(c), 1, 3],
  [(c) => P.rsiDivBear(c) && P.pinBear(c), -1, 3],
  [(c) => P.rsiDivBull(c) && P.volSpike(c), 1, 2.5],
  [(c) => P.rsiDivBear(c) && P.volSpike(c), -1, 2.5],
  [(c) => P.rsiDivBull(c) && P.nearSsl(c), 1, 2],
  [(c) => P.rsiDivBear(c) && P.nearBsl(c), -1, 2]
]);

add('21.5', 'RSI 50-Line Pullback Specialist', 21, { method: 'rsi', stopMult: 1.2, rr: 2.3 }, [
  [(c) => P.htfPullbackBuy(c) && P.rsiAbove50(c), 1, 3],
  [(c) => P.htfPullbackSell(c) && P.rsiBelow50(c), -1, 3],
  [(c) => P.rsiAbove50(c) && P.nearEma21At(c), 1, 2.5],
  [(c) => P.rsiBelow50(c) && P.nearEma21At(c), -1, 2.5],
  [(c) => P.rsiAbove50(c) && P.nearVwap(c), 1, 2],
  [(c) => P.rsiBelow50(c) && P.nearVwap(c), -1, 2],
  [(c) => P.rsiAbove50(c) && P.atSupport(c), 1, 2],
  [(c) => P.rsiBelow50(c) && P.atResistance(c), -1, 2],
  [(c) => P.rsiAbove50(c) && P.rsiOB(c), 0, 2],
  [(c) => P.rsiBelow50(c) && P.rsiOS(c), 0, 2]
]);

add('21.6', 'RSI Extreme Climax Trader', 21, { method: 'rsi', stopMult: 1.3, rr: 2.5 }, [
  [(c) => P.rsiExtremeOB(c) && P.volClimax(c), -1, 3.5],
  [(c) => P.rsiExtremeOS(c) && P.volClimax(c), 1, 3.5],
  [(c) => P.rsiExtremeOB(c) && P.aboveBBUp(c), -1, 3],
  [(c) => P.rsiExtremeOS(c) && P.belowBBLo(c), 1, 3],
  [(c) => P.rsiExtremeOB(c) && P.deltaExtremePos(c), -1, 3],
  [(c) => P.rsiExtremeOS(c) && P.deltaExtremeNeg(c), 1, 3],
  [(c) => P.rsiExtremeOB(c) && P.fundingHigh(c), -1, 2.5],
  [(c) => P.rsiExtremeOS(c) && P.fundingLow(c), 1, 2.5],
  [(c) => P.rsiExtremeOB(c) && P.rsiDivBear(c), -1, 2.5],
  [(c) => P.rsiExtremeOS(c) && P.rsiDivBull(c), 1, 2.5]
]);

add('21.7', 'RSI Level Confluence Analyst', 21, { method: 'rsi', stopMult: 1.3, rr: 2.5 }, [
  [(c) => P.rsiBull(c) && P.nearFib618(c), 1, 2.5],
  [(c) => P.rsiBear(c) && P.nearFib618(c), -1, 2.5],
  [(c) => P.rsiBull(c) && P.atPoc(c), 1, 2],
  [(c) => P.rsiBear(c) && P.atPoc(c), -1, 2],
  [(c) => P.rsiOB(c) && P.atVah(c), -1, 2.5],
  [(c) => P.rsiOS(c) && P.atVal(c), 1, 2.5],
  [(c) => P.rsiBull(c) && P.atSupport(c), 1, 2.5],
  [(c) => P.rsiBear(c) && P.atResistance(c), -1, 2.5],
  [(c) => P.rsiOB(c) && P.atPoc(c), 0, 1.5],
  [(c) => P.rsiOS(c) && P.atPoc(c), 0, 1.5]
]);

add('21.8', 'RSI Momentum Break Trader', 21, { method: 'rsi', stopMult: 1.1, rr: 2.0 }, [
  [(c) => P.rsiAbove50(c) && P.rangeBreakUp(c), 1, 3],
  [(c) => P.rsiBelow50(c) && P.rangeBreakDn(c), -1, 3],
  [(c) => P.rsiAbove50(c) && P.brokeResistance(c), 1, 2.5],
  [(c) => P.rsiBelow50(c) && P.brokeSupport(c), -1, 2.5],
  [(c) => P.rsiAbove50(c) && P.bosUp(c), 1, 2.5],
  [(c) => P.rsiBelow50(c) && P.bosDn(c), -1, 2.5],
  [(c) => P.rsiAbove50(c) && P.channelUpBreak(c), 1, 2.5],
  [(c) => P.rsiBelow50(c) && P.channelDnBreak(c), -1, 2.5],
  [(c) => P.rsiAbove50(c) && P.donchianBreakUp(c), 1, 2],
  [(c) => P.rsiBelow50(c) && P.donchianBreakDn(c), -1, 2]
]);

add('21.9', 'RSI Multi-Timeframe Sync', 21, { method: 'rsi', stopMult: 1.2, rr: 2.3 }, [
  [(c) => P.rsiBull(c) && P.h4Bull(c) && P.htfBull(c), 1, 3],
  [(c) => P.rsiBear(c) && P.h4Bear(c) && P.htfBear(c), -1, 3],
  [(c) => P.rsiBull(c) && P.allTfBull(c), 1, 3],
  [(c) => P.rsiBear(c) && P.allTfBear(c), -1, 3],
  [(c) => P.rsiBull(c) && P.htfBull(c), 1, 2],
  [(c) => P.rsiBear(c) && P.htfBear(c), -1, 2],
  [(c) => P.rsiBull(c) && P.htfBear(c), 0, 2],
  [(c) => P.rsiBear(c) && P.htfBull(c), 0, 2],
  [(c) => P.rsiBull(c) && P.m5Bull(c), 1, 1.5],
  [(c) => P.rsiBear(c) && P.m5Bear(c), -1, 1.5]
]);

add('21.10', 'RSI Tape Confirmation', 21, { method: 'rsi', stopMult: 1.1, rr: 2.0 }, [
  [(c) => P.rsiBull(c) && P.tapeBull(c) && P.deltaPos(c), 1, 3],
  [(c) => P.rsiBear(c) && P.tapeBear(c) && P.deltaNeg(c), -1, 3],
  [(c) => P.rsiBull(c) && P.tapeBull(c), 1, 2.5],
  [(c) => P.rsiBear(c) && P.tapeBear(c), -1, 2.5],
  [(c) => P.rsiBull(c) && P.bookBidHeavy(c), 1, 2],
  [(c) => P.rsiBear(c) && P.bookAskHeavy(c), -1, 2],
  [(c) => P.rsiBull(c) && P.takerBuyHeavy(c), 1, 2],
  [(c) => P.rsiBear(c) && P.takerSellHeavy(c), -1, 2],
  [(c) => P.rsiBull(c) && P.tapeBear(c), 0, 2],
  [(c) => P.rsiBear(c) && P.tapeBull(c), 0, 2]
]);

// ===================== CATEGORY 22: MACD MASTERS ===========================
add('22.1', 'MACD Crossover Hunter', 22, { method: 'macd', stopMult: 1.2, rr: 2.2 }, [
  [(c) => P.macdAboveSig(c) && P.alignBull(c), 1, 3],
  [(c) => P.macdBelowSig(c) && P.alignBear(c), -1, 3],
  [(c) => P.macdAboveSig(c) && P.macdHistRising(c), 1, 2.5],
  [(c) => P.macdBelowSig(c) && P.macdHistFalling(c), -1, 2.5],
  [(c) => P.macdAboveSig(c) && P.aboveEma21(c), 1, 2],
  [(c) => P.macdBelowSig(c) && P.belowEma21(c), -1, 2],
  [(c) => P.macdAboveSig(c) && P.stKAboveD(c), 1, 2],
  [(c) => P.macdBelowSig(c) && P.stKBelowD(c), -1, 2],
  [(c) => P.macdAboveSig(c) && P.aboveVwap(c), 1, 1.5],
  [(c) => P.macdBelowSig(c) && P.belowVwap(c), -1, 1.5]
]);

add('22.2', 'MACD Histogram Momentum Trader', 22, { method: 'macd', stopMult: 1.1, rr: 2.0 }, [
  [(c) => P.macdHistRising(c) && P.macdHistUp(c), 1, 3],
  [(c) => P.macdHistFalling(c) && P.macdHistDn(c), -1, 3],
  [(c) => P.macdHistRising(c) && P.aboveEma8(c), 1, 2.5],
  [(c) => P.macdHistFalling(c) && P.belowEma8(c), -1, 2.5],
  [(c) => P.macdHistRising(c) && P.rsiAbove50(c), 1, 2],
  [(c) => P.macdHistFalling(c) && P.rsiBelow50(c), -1, 2],
  [(c) => P.macdHistRising(c) && P.volSpike(c), 1, 2],
  [(c) => P.macdHistFalling(c) && P.volSpike(c), -1, 2],
  [(c) => P.macdHistRising(c) && P.macdHistDn(c), 0, 2],
  [(c) => P.macdHistFalling(c) && P.macdHistUp(c), 0, 2]
]);

add('22.3', 'MACD Zero-Line Toggle', 22, { method: 'macd', stopMult: 1.2, rr: 2.3 }, [
  [(c) => P.macdHistUp(c) && P.macdAboveSig(c) && P.aboveEma50(c), 1, 3],
  [(c) => P.macdHistDn(c) && P.macdBelowSig(c) && P.belowEma50(c), -1, 3],
  [(c) => P.macdHistUp(c) && P.aboveEma50(c), 1, 2.5],
  [(c) => P.macdHistDn(c) && P.belowEma50(c), -1, 2.5],
  [(c) => P.macdHistUp(c) && P.ema21Above50(c), 1, 2],
  [(c) => P.macdHistDn(c) && P.ema21Below50(c), -1, 2],
  [(c) => P.macdHistUp(c) && P.ema21Below50(c), 0, 2],
  [(c) => P.macdHistDn(c) && P.ema21Above50(c), 0, 2],
  [(c) => P.macdHistUp(c) && P.rsiAbove50(c), 1, 1.5],
  [(c) => P.macdHistDn(c) && P.rsiBelow50(c), -1, 1.5]
]);

add('22.4', 'MACD Divergence Specialist', 22, { method: 'macd', stopMult: 1.3, rr: 2.6 }, [
  [(c) => P.rsiDivBull(c) && P.macdHistRising(c), 1, 3],
  [(c) => P.rsiDivBear(c) && P.macdHistFalling(c), -1, 3],
  [(c) => P.macdHistRising(c) && P.priceFalling(c) && P.belowBBLo(c), 1, 3],
  [(c) => P.macdHistFalling(c) && P.priceRising(c) && P.aboveBBUp(c), -1, 3],
  [(c) => P.macdHistRising(c) && P.priceFalling(c), 1, 2.5],
  [(c) => P.macdHistFalling(c) && P.priceRising(c), -1, 2.5],
  [(c) => P.macdHistRising(c) && P.atSupport(c), 1, 2.5],
  [(c) => P.macdHistFalling(c) && P.atResistance(c), -1, 2.5],
  [(c) => P.macdHistRising(c) && P.macdHistDn(c), 0, 1.5],
  [(c) => P.macdHistFalling(c) && P.macdHistUp(c), 0, 1.5]
]);

add('22.5', 'MACD Pullback-in-Trend Trader', 22, { method: 'macd', stopMult: 1.2, rr: 2.4 }, [
  [(c) => P.htfPullbackBuy(c) && P.macdHistRising(c), 1, 3],
  [(c) => P.htfPullbackSell(c) && P.macdHistFalling(c), -1, 3],
  [(c) => P.alignBull(c) && P.belowEma8(c) && P.macdHistRising(c), 1, 2.5],
  [(c) => P.alignBear(c) && P.aboveEma8(c) && P.macdHistFalling(c), -1, 2.5],
  [(c) => P.alignBull(c) && P.nearEma21At(c, 'low') && P.macdAboveSig(c), 1, 2.5],
  [(c) => P.alignBear(c) && P.nearEma21At(c, 'high') && P.macdBelowSig(c), -1, 2.5],
  [(c) => P.alignBull(c) && P.macdHistRising(c), 1, 2],
  [(c) => P.alignBear(c) && P.macdHistFalling(c), -1, 2],
  [(c) => P.alignBull(c) && P.macdHistFalling(c), 0, 2],
  [(c) => P.alignBear(c) && P.macdHistRising(c), 0, 2]
]);

add('22.6', 'MACD Breakout Confirmer', 22, { method: 'macd', stopMult: 1.1, rr: 2.0 }, [
  [(c) => P.rangeBreakUp(c) && P.macdHistRising(c) && P.macdAboveSig(c), 1, 3],
  [(c) => P.rangeBreakDn(c) && P.macdHistFalling(c) && P.macdBelowSig(c), -1, 3],
  [(c) => P.brokeResistance(c) && P.macdHistRising(c), 1, 2.5],
  [(c) => P.brokeSupport(c) && P.macdHistFalling(c), -1, 2.5],
  [(c) => P.bosUp(c) && P.macdAboveSig(c), 1, 2.5],
  [(c) => P.bosDn(c) && P.macdBelowSig(c), -1, 2.5],
  [(c) => P.trendlineUpBreak(c) && P.macdHistRising(c), 1, 2.5],
  [(c) => P.trendlineDnBreak(c) && P.macdHistFalling(c), -1, 2.5],
  [(c) => P.rangeBreakUp(c) && P.macdHistFalling(c), 0, 2],
  [(c) => P.rangeBreakDn(c) && P.macdHistRising(c), 0, 2]
]);

add('22.7', 'MACD Exhaustion Reader', 22, { method: 'macd', stopMult: 1.3, rr: 2.5 }, [
  [(c) => P.macdHistUp(c) && P.macdHistFalling(c) && P.rsiOB(c), -1, 3],
  [(c) => P.macdHistDn(c) && P.macdHistRising(c) && P.rsiOS(c), 1, 3],
  [(c) => P.macdHistUp(c) && P.macdHistFalling(c) && P.aboveBBUp(c), -1, 2.5],
  [(c) => P.macdHistDn(c) && P.macdHistRising(c) && P.belowBBLo(c), 1, 2.5],
  [(c) => P.macdHistUp(c) && P.macdHistFalling(c), -1, 2],
  [(c) => P.macdHistDn(c) && P.macdHistRising(c), 1, 2],
  [(c) => P.macdHistUp(c) && P.macdHistFalling(c) && P.volClimax(c), -1, 3],
  [(c) => P.macdHistDn(c) && P.macdHistRising(c) && P.volClimax(c), 1, 3],
  [(c) => P.macdHistUp(c) && P.macdHistRising(c), 0, 1.5],
  [(c) => P.macdHistDn(c) && P.macdHistFalling(c), 0, 1.5]
]);

add('22.8', 'MACD + VWAP Confluence', 22, { method: 'macd', stopMult: 1.2, rr: 2.2 }, [
  [(c) => P.macdHistRising(c) && P.aboveVwap(c) && P.aboveEma21(c), 1, 3],
  [(c) => P.macdHistFalling(c) && P.belowVwap(c) && P.belowEma21(c), -1, 3],
  [(c) => P.macdHistRising(c) && P.nearVwap(c), 1, 2.5],
  [(c) => P.macdHistFalling(c) && P.nearVwap(c), -1, 2.5],
  [(c) => P.macdAboveSig(c) && P.aboveVwap(c), 1, 2],
  [(c) => P.macdBelowSig(c) && P.belowVwap(c), -1, 2],
  [(c) => P.macdHistRising(c) && P.aboveVwap(c), 1, 2],
  [(c) => P.macdHistFalling(c) && P.belowVwap(c), -1, 2],
  [(c) => P.macdHistRising(c) && P.belowVwap(c), 0, 2],
  [(c) => P.macdHistFalling(c) && P.aboveVwap(c), 0, 2]
]);

add('22.9', 'MACD Multi-Timeframe Sync', 22, { method: 'macd', stopMult: 1.2, rr: 2.3 }, [
  [(c) => P.macdHistRising(c) && P.h4Bull(c) && P.htfBull(c), 1, 3],
  [(c) => P.macdHistFalling(c) && P.h4Bear(c) && P.htfBear(c), -1, 3],
  [(c) => P.macdHistRising(c) && P.allTfBull(c), 1, 3],
  [(c) => P.macdHistFalling(c) && P.allTfBear(c), -1, 3],
  [(c) => P.macdHistRising(c) && P.htfBull(c), 1, 2],
  [(c) => P.macdHistFalling(c) && P.htfBear(c), -1, 2],
  [(c) => P.macdHistRising(c) && P.htfBear(c), 0, 2],
  [(c) => P.macdHistFalling(c) && P.htfBull(c), 0, 2],
  [(c) => P.macdHistRising(c) && P.m5Bull(c), 1, 1.5],
  [(c) => P.macdHistFalling(c) && P.m5Bear(c), -1, 1.5]
]);

add('22.10', 'MACD Histogram Climax Trader', 22, { method: 'macd', stopMult: 1.3, rr: 2.5 }, [
  [(c) => P.macdHistUp(c) && P.volClimax(c) && P.deltaExtremePos(c), -1, 3.5],
  [(c) => P.macdHistDn(c) && P.volClimax(c) && P.deltaExtremeNeg(c), 1, 3.5],
  [(c) => P.macdHistUp(c) && P.volClimax(c), 0, 2.5],
  [(c) => P.macdHistDn(c) && P.volClimax(c), 0, 2.5],
  [(c) => P.macdHistUp(c) && P.volSpike(c) && P.rsiOB(c), -1, 2.5],
  [(c) => P.macdHistDn(c) && P.volSpike(c) && P.rsiOS(c), 1, 2.5],
  [(c) => P.macdHistUp(c) && P.macdHistFalling(c) && P.volSpike(c), -1, 2.5],
  [(c) => P.macdHistDn(c) && P.macdHistRising(c) && P.volSpike(c), 1, 2.5],
  [(c) => P.macdHistUp(c) && P.fundingHigh(c), -1, 2],
  [(c) => P.macdHistDn(c) && P.fundingLow(c), 1, 2]
]);

// ===================== CATEGORY 23: STOCHASTIC MASTERS =====================
add('23.1', 'Stochastic Crossover Hunter', 23, { method: 'stoch', stopMult: 1.2, rr: 2.2 }, [
  [(c) => P.stKAboveD(c) && P.stBull(c) && P.alignBull(c), 1, 3],
  [(c) => P.stKBelowD(c) && P.stBear(c) && P.alignBear(c), -1, 3],
  [(c) => P.stKAboveD(c) && P.macdAboveSig(c), 1, 2.5],
  [(c) => P.stKBelowD(c) && P.macdBelowSig(c), -1, 2.5],
  [(c) => P.stKAboveD(c) && P.aboveEma21(c), 1, 2],
  [(c) => P.stKBelowD(c) && P.belowEma21(c), -1, 2],
  [(c) => P.stKAboveD(c) && P.aboveVwap(c), 1, 2],
  [(c) => P.stKBelowD(c) && P.belowVwap(c), -1, 2],
  [(c) => P.stKAboveD(c) && P.stBear(c), 0, 2],
  [(c) => P.stKBelowD(c) && P.stBull(c), 0, 2]
]);

add('23.2', 'Stochastic Overbought Reversal', 23, { method: 'stoch', stopMult: 1.2, rr: 2.4 }, [
  [(c) => P.stOB(c) && P.atResistance(c), -1, 3],
  [(c) => P.stOS(c) && P.atSupport(c), 1, 3],
  [(c) => P.stOB(c) && P.pinBear(c), -1, 2.5],
  [(c) => P.stOS(c) && P.pinBull(c), 1, 2.5],
  [(c) => P.stOB(c) && P.rsiOB(c), -1, 2.5],
  [(c) => P.stOS(c) && P.rsiOS(c), 1, 2.5],
  [(c) => P.stOB(c) && P.aboveBBUp(c), -1, 2.5],
  [(c) => P.stOS(c) && P.belowBBLo(c), 1, 2.5],
  [(c) => P.stOB(c) && P.rangeAtHigh(c), -1, 2],
  [(c) => P.stOS(c) && P.rangeAtLow(c), 1, 2]
]);

add('23.3', 'Stochastic Trend Aligner', 23, { method: 'stoch', stopMult: 1.1, rr: 2.0 }, [
  [(c) => P.stBull(c) && P.structUp(c) && P.ema8Above21(c), 1, 3],
  [(c) => P.stBear(c) && P.structDn(c) && P.ema8Below21(c), -1, 3],
  [(c) => P.stBull(c) && P.structUp(c), 1, 2.5],
  [(c) => P.stBear(c) && P.structDn(c), -1, 2.5],
  [(c) => P.stBull(c) && P.adxStrong(c) && P.diPlusWins(c), 1, 2.5],
  [(c) => P.stBear(c) && P.adxStrong(c) && P.diMinusWins(c), -1, 2.5],
  [(c) => P.stBull(c) && P.aboveSuperTrend(c), 1, 2],
  [(c) => P.stBear(c) && P.belowSuperTrend(c), -1, 2],
  [(c) => P.stBull(c) && P.structDn(c), 0, 2],
  [(c) => P.stBear(c) && P.structUp(c), 0, 2]
]);

add('23.4', 'Stochastic + RSI Confluence', 23, { method: 'stoch', stopMult: 1.2, rr: 2.3 }, [
  [(c) => P.stKAboveD(c) && P.rsiAbove50(c) && P.macdHistRising(c), 1, 3],
  [(c) => P.stKBelowD(c) && P.rsiBelow50(c) && P.macdHistFalling(c), -1, 3],
  [(c) => P.stBull(c) && P.rsiBull(c), 1, 2.5],
  [(c) => P.stBear(c) && P.rsiBear(c), -1, 2.5],
  [(c) => P.stOS(c) && P.rsiOS(c), 1, 2.5],
  [(c) => P.stOB(c) && P.rsiOB(c), -1, 2.5],
  [(c) => P.stBull(c) && P.rsiBear(c), 0, 2],
  [(c) => P.stBear(c) && P.rsiBull(c), 0, 2],
  [(c) => P.stKAboveD(c) && P.rsiAbove50(c), 1, 1.5],
  [(c) => P.stKBelowD(c) && P.rsiBelow50(c), -1, 1.5]
]);

add('23.5', 'Stochastic Swing Reversal', 23, { method: 'stoch', stopMult: 1.3, rr: 2.5 }, [
  [(c) => P.stOB(c) && P.doubleTop(c), -1, 3],
  [(c) => P.stOS(c) && P.doubleBottom(c), 1, 3],
  [(c) => P.stOB(c) && P.atLastH(c), -1, 2.5],
  [(c) => P.stOS(c) && P.atLastL(c), 1, 2.5],
  [(c) => P.stOB(c) && P.closeBackBelowH(c), -1, 2.5],
  [(c) => P.stOS(c) && P.closeBackAboveL(c), 1, 2.5],
  [(c) => P.stOB(c) && P.eqHighsNear(c), -1, 2.5],
  [(c) => P.stOS(c) && P.eqLowsNear(c), 1, 2.5],
  [(c) => P.stOB(c) && P.chochBear(c), -1, 2.5],
  [(c) => P.stOS(c) && P.chochBull(c), 1, 2.5]
]);

add('23.6', 'Stochastic Pullback Timer', 23, { method: 'stoch', stopMult: 1.2, rr: 2.4 }, [
  [(c) => P.alignBull(c) && P.stBear(c) && P.stKAboveD(c), 1, 3],
  [(c) => P.alignBear(c) && P.stBull(c) && P.stKBelowD(c), -1, 3],
  [(c) => P.alignBull(c) && P.stOS(c), 1, 2.5],
  [(c) => P.alignBear(c) && P.stOB(c), -1, 2.5],
  [(c) => P.alignBull(c) && P.stKAboveD(c), 1, 2],
  [(c) => P.alignBear(c) && P.stKBelowD(c), -1, 2],
  [(c) => P.alignBull(c) && P.nearEma21At(c), 1, 2],
  [(c) => P.alignBear(c) && P.nearEma21At(c), -1, 2],
  [(c) => P.alignMixed(c) && P.stKAboveD(c), 0, 2],
  [(c) => P.alignMixed(c) && P.stKBelowD(c), 0, 2]
]);

add('23.7', 'Stochastic Breakout Timer', 23, { method: 'stoch', stopMult: 1.1, rr: 2.0 }, [
  [(c) => P.rangeBreakUp(c) && P.stKAboveD(c) && P.stBull(c), 1, 3],
  [(c) => P.rangeBreakDn(c) && P.stKBelowD(c) && P.stBear(c), -1, 3],
  [(c) => P.brokeResistance(c) && P.stKAboveD(c), 1, 2.5],
  [(c) => P.brokeSupport(c) && P.stKBelowD(c), -1, 2.5],
  [(c) => P.bosUp(c) && P.stBull(c), 1, 2],
  [(c) => P.bosDn(c) && P.stBear(c), -1, 2],
  [(c) => P.trendlineUpBreak(c) && P.stKAboveD(c), 1, 2.5],
  [(c) => P.trendlineDnBreak(c) && P.stKBelowD(c), -1, 2.5],
  [(c) => P.rangeBreakUp(c) && P.stKBelowD(c), 0, 2],
  [(c) => P.rangeBreakDn(c) && P.stKAboveD(c), 0, 2]
]);

add('23.8', 'Stochastic Tape Confirmer', 23, { method: 'stoch', stopMult: 1.1, rr: 2.0 }, [
  [(c) => P.stKAboveD(c) && P.tapeBull(c) && P.deltaPos(c), 1, 3],
  [(c) => P.stKBelowD(c) && P.tapeBear(c) && P.deltaNeg(c), -1, 3],
  [(c) => P.stKAboveD(c) && P.bookBidHeavy(c), 1, 2.5],
  [(c) => P.stKBelowD(c) && P.bookAskHeavy(c), -1, 2.5],
  [(c) => P.stKAboveD(c) && P.takerBuyHeavy(c), 1, 2],
  [(c) => P.stKBelowD(c) && P.takerSellHeavy(c), -1, 2],
  [(c) => P.stKAboveD(c) && P.cvdRising(c), 1, 2],
  [(c) => P.stKBelowD(c) && P.cvdFalling(c), -1, 2],
  [(c) => P.stKAboveD(c) && P.tapeBear(c), 0, 2],
  [(c) => P.stKBelowD(c) && P.tapeBull(c), 0, 2]
]);

add('23.9', 'Stochastic Multi-Timeframe Sync', 23, { method: 'stoch', stopMult: 1.2, rr: 2.3 }, [
  [(c) => P.stBull(c) && P.h4Bull(c) && P.htfBull(c), 1, 3],
  [(c) => P.stBear(c) && P.h4Bear(c) && P.htfBear(c), -1, 3],
  [(c) => P.stBull(c) && P.allTfBull(c), 1, 3],
  [(c) => P.stBear(c) && P.allTfBear(c), -1, 3],
  [(c) => P.stKAboveD(c) && P.htfBull(c), 1, 2],
  [(c) => P.stKBelowD(c) && P.htfBear(c), -1, 2],
  [(c) => P.stKAboveD(c) && P.htfBear(c), 0, 2],
  [(c) => P.stKBelowD(c) && P.htfBull(c), 0, 2],
  [(c) => P.stBull(c) && P.m5Bull(c), 1, 1.5],
  [(c) => P.stBear(c) && P.m5Bear(c), -1, 1.5]
]);

add('23.10', 'Stochastic Neutral Fader', 23, { method: 'stoch', stopMult: 1.3, rr: 2.5 }, [
  [(c) => P.stOB(c) && P.rangeAtHigh(c) && P.adxWeak(c), -1, 3],
  [(c) => P.stOS(c) && P.rangeAtLow(c) && P.adxWeak(c), 1, 3],
  [(c) => P.stOB(c) && P.adxWeak(c) && P.ribbonTight(c), -1, 2.5],
  [(c) => P.stOS(c) && P.adxWeak(c) && P.ribbonTight(c), 1, 2.5],
  [(c) => P.stOB(c) && P.rangeAtHigh(c), -1, 2],
  [(c) => P.stOS(c) && P.rangeAtLow(c), 1, 2],
  [(c) => P.stOB(c) && P.adxStrong(c), 0, 2.5],
  [(c) => P.stOS(c) && P.adxStrong(c), 0, 2.5],
  [(c) => P.stBull(c) && P.rangeTight(c), 0, 2],
  [(c) => P.stBear(c) && P.rangeTight(c), 0, 2]
]);

// ===================== CATEGORY 24: CCI / WILLIAMS %R MASTERS ==============
add('24.1', 'CCI Extreme Trader', 24, { method: 'cci', stopMult: 1.2, rr: 2.4 }, [
  [(c) => P.cciBull(c) && P.atResistance(c), -1, 3],
  [(c) => P.cciBear(c) && P.atSupport(c), 1, 3],
  [(c) => P.cciBull(c) && P.rsiOB(c) && P.macdHistFalling(c), -1, 3],
  [(c) => P.cciBear(c) && P.rsiOS(c) && P.macdHistRising(c), 1, 3],
  [(c) => P.cciBull(c) && P.volClimax(c), -1, 2.5],
  [(c) => P.cciBear(c) && P.volClimax(c), 1, 2.5],
  [(c) => P.cciBull(c) && P.aboveBBUp(c), -1, 2],
  [(c) => P.cciBear(c) && P.belowBBLo(c), 1, 2],
  [(c) => P.cciBull(c) && P.alignBull(c), 0, 2],
  [(c) => P.cciBear(c) && P.alignBear(c), 0, 2]
]);

add('24.2', 'CCI Zero-Line Cross', 24, { method: 'cci', stopMult: 1.1, rr: 2.0 }, [
  [(c) => P.cciRising(c) && P.alignBull(c), 1, 3],
  [(c) => P.cciFalling(c) && P.alignBear(c), -1, 3],
  [(c) => P.cciRising(c) && P.aboveEma21(c), 1, 2.5],
  [(c) => P.cciFalling(c) && P.belowEma21(c), -1, 2.5],
  [(c) => P.cciRising(c) && P.rsiAbove50(c), 1, 2],
  [(c) => P.cciFalling(c) && P.rsiBelow50(c), -1, 2],
  [(c) => P.cciRising(c) && P.macdHistRising(c), 1, 2.5],
  [(c) => P.cciFalling(c) && P.macdHistFalling(c), -1, 2.5],
  [(c) => P.cciRising(c) && P.alignBear(c), 0, 2],
  [(c) => P.cciFalling(c) && P.alignBull(c), 0, 2]
]);

add('24.3', 'CCI Trend Momentum', 23, { method: 'cci', stopMult: 1.2, rr: 2.2 }, [
  [(c) => P.cciBull(c) && P.structUp(c) && P.adxStrong(c), 1, 3],
  [(c) => P.cciBear(c) && P.structDn(c) && P.adxStrong(c), -1, 3],
  [(c) => P.cciBull(c) && P.aboveSuperTrend(c), 1, 2.5],
  [(c) => P.cciBear(c) && P.belowSuperTrend(c), -1, 2.5],
  [(c) => P.cciBull(c) && P.ema8Above21(c), 1, 2],
  [(c) => P.cciBear(c) && P.ema8Below21(c), -1, 2],
  [(c) => P.cciBull(c) && P.aboveVwap(c), 1, 2],
  [(c) => P.cciBear(c) && P.belowVwap(c), -1, 2],
  [(c) => P.cciBull(c) && P.adxWeak(c), 0, 2],
  [(c) => P.cciBear(c) && P.adxWeak(c), 0, 2]
]);

add('24.4', 'CCI + S/R Reversal', 24, { method: 'cci', stopMult: 1.3, rr: 2.6 }, [
  [(c) => P.cciBear(c) && P.atSupport(c) && P.pinBull(c), 1, 3.5],
  [(c) => P.cciBull(c) && P.atResistance(c) && P.pinBear(c), -1, 3.5],
  [(c) => P.cciBear(c) && P.atSupport(c), 1, 2.5],
  [(c) => P.cciBull(c) && P.atResistance(c), -1, 2.5],
  [(c) => P.cciBear(c) && P.nearSsl(c), 1, 2.5],
  [(c) => P.cciBull(c) && P.nearBsl(c), -1, 2.5],
  [(c) => P.cciBear(c) && P.atLastL(c), 1, 2],
  [(c) => P.cciBull(c) && P.atLastH(c), -1, 2],
  [(c) => P.cciBear(c) && P.stOS(c), 1, 2],
  [(c) => P.cciBull(c) && P.stOB(c), -1, 2]
]);

add('24.5', 'Williams %R Oscillator Trader', 24, { method: 'wr', stopMult: 1.2, rr: 2.3 }, [
  [(c) => P.wrBull(c) && P.alignBull(c), 1, 3],
  [(c) => P.wrBear(c) && P.alignBear(c), -1, 3],
  [(c) => P.wrOB(c) && P.atResistance(c), -1, 3],
  [(c) => P.wrOS(c) && P.atSupport(c), 1, 3],
  [(c) => P.wrOB(c) && P.rsiOB(c), -1, 2.5],
  [(c) => P.wrOS(c) && P.rsiOS(c), 1, 2.5],
  [(c) => P.wrBull(c) && P.stKAboveD(c), 1, 2],
  [(c) => P.wrBear(c) && P.stKBelowD(c), -1, 2],
  [(c) => P.wrOB(c) && P.htfBull(c), 0, 2],
  [(c) => P.wrOS(c) && P.htfBear(c), 0, 2]
]);

add('24.6', 'Williams %R Momentum Cross', 24, { method: 'wr', stopMult: 1.1, rr: 2.0 }, [
  [(c) => P.wrBull(c) && P.aboveEma8(c) && P.macdHistRising(c), 1, 3],
  [(c) => P.wrBear(c) && P.belowEma8(c) && P.macdHistFalling(c), -1, 3],
  [(c) => P.wrBull(c) && P.cciRising(c), 1, 2.5],
  [(c) => P.wrBear(c) && P.cciFalling(c), -1, 2.5],
  [(c) => P.wrBull(c) && P.stKAboveD(c), 1, 2],
  [(c) => P.wrBear(c) && P.stKBelowD(c), -1, 2],
  [(c) => P.wrBull(c) && P.aboveVwap(c), 1, 2],
  [(c) => P.wrBear(c) && P.belowVwap(c), -1, 2],
  [(c) => P.wrBull(c) && P.rsiBear(c), 0, 2],
  [(c) => P.wrBear(c) && P.rsiBull(c), 0, 2]
]);

add('24.7', 'CCI Divergence Trader', 24, { method: 'cci', stopMult: 1.3, rr: 2.6 }, [
  [(c) => P.rsiDivBull(c) && P.cciBear(c) && P.cciRising(c), 1, 3.5],
  [(c) => P.rsiDivBear(c) && P.cciBull(c) && P.cciFalling(c), -1, 3.5],
  [(c) => P.rsiDivBull(c) && P.atSupport(c), 1, 3],
  [(c) => P.rsiDivBear(c) && P.atResistance(c), -1, 3],
  [(c) => P.cciBear(c) && P.priceFalling(c) && P.macdHistRising(c), 1, 3],
  [(c) => P.cciBull(c) && P.priceRising(c) && P.macdHistFalling(c), -1, 3],
  [(c) => P.cciBear(c) && P.pinBull(c), 1, 2.5],
  [(c) => P.cciBull(c) && P.pinBear(c), -1, 2.5],
  [(c) => P.cciBear(c) && P.volClimax(c), 1, 2.5],
  [(c) => P.cciBull(c) && P.volClimax(c), -1, 2.5]
]);

add('24.8', 'CCI + Volume Confirmation', 24, { method: 'cci', stopMult: 1.1, rr: 2.0 }, [
  [(c) => P.cciRising(c) && P.volSpike(c) && P.upCandle(c), 1, 3],
  [(c) => P.cciFalling(c) && P.volSpike(c) && P.downCandle(c), -1, 3],
  [(c) => P.cciRising(c) && P.rvolHigh(c), 1, 2.5],
  [(c) => P.cciFalling(c) && P.rvolHigh(c), -1, 2.5],
  [(c) => P.cciRising(c) && P.tapeBull(c), 1, 2.5],
  [(c) => P.cciFalling(c) && P.tapeBear(c), -1, 2.5],
  [(c) => P.cciRising(c) && P.obvRising(c), 1, 2],
  [(c) => P.cciFalling(c) && P.obvFalling(c), -1, 2],
  [(c) => P.cciRising(c) && P.rvolLow(c), 0, 2],
  [(c) => P.cciFalling(c) && P.rvolLow(c), 0, 2]
]);

add('24.9', 'CCI Multi-Timeframe Sync', 24, { method: 'cci', stopMult: 1.2, rr: 2.3 }, [
  [(c) => P.cciBull(c) && P.h4Bull(c) && P.htfBull(c), 1, 3],
  [(c) => P.cciBear(c) && P.h4Bear(c) && P.htfBear(c), -1, 3],
  [(c) => P.cciBull(c) && P.allTfBull(c), 1, 3],
  [(c) => P.cciBear(c) && P.allTfBear(c), -1, 3],
  [(c) => P.cciRising(c) && P.htfBull(c), 1, 2],
  [(c) => P.cciFalling(c) && P.htfBear(c), -1, 2],
  [(c) => P.cciRising(c) && P.htfBear(c), 0, 2],
  [(c) => P.cciFalling(c) && P.htfBull(c), 0, 2],
  [(c) => P.cciBull(c) && P.m5Bull(c), 1, 1.5],
  [(c) => P.cciBear(c) && P.m5Bear(c), -1, 1.5]
]);

add('24.10', 'CCI + %R Combo Trader', 24, { method: 'cci', stopMult: 1.2, rr: 2.2 }, [
  [(c) => P.cciBull(c) && P.wrBull(c) && P.stKAboveD(c), 1, 3],
  [(c) => P.cciBear(c) && P.wrBear(c) && P.stKBelowD(c), -1, 3],
  [(c) => P.cciBull(c) && P.wrBull(c), 1, 2.5],
  [(c) => P.cciBear(c) && P.wrBear(c), -1, 2.5],
  [(c) => P.cciBull(c) && P.stBull(c), 1, 2],
  [(c) => P.cciBear(c) && P.stBear(c), -1, 2],
  [(c) => P.cciBull(c) && P.rsiBull(c), 1, 2],
  [(c) => P.cciBear(c) && P.rsiBear(c), -1, 2],
  [(c) => P.cciBull(c) && P.wrBear(c), 0, 2],
  [(c) => P.cciBear(c) && P.wrBull(c), 0, 2]
]);

// ===================== CATEGORY 25: MOMENTUM CONFLUENCE MASTERS ============
add('25.1', 'Momentum Multi-Oscillator Convincer', 25, { method: 'momentum', stopMult: 1.2, rr: 2.2 }, [
  [(c) => P.momUp(c) && P.rsiBull(c) && P.macdHistRising(c), 1, 3],
  [(c) => P.momDown(c) && P.rsiBear(c) && P.macdHistFalling(c), -1, 3],
  [(c) => P.momUp(c) && P.stKAboveD(c) && P.cciRising(c), 1, 2.5],
  [(c) => P.momDown(c) && P.stKBelowD(c) && P.cciFalling(c), -1, 2.5],
  [(c) => P.momUp(c) && P.rocPos(c), 1, 2],
  [(c) => P.momDown(c) && P.rocNeg(c), -1, 2],
  [(c) => P.momUp(c) && P.aboveEma8(c), 1, 2],
  [(c) => P.momDown(c) && P.belowEma8(c), -1, 2],
  [(c) => P.momUp(c) && P.macdHistFalling(c), 0, 2],
  [(c) => P.momDown(c) && P.macdHistRising(c), 0, 2]
]);

add('25.2', 'ROC Break Momentum Trader', 25, { method: 'momentum', stopMult: 1.1, rr: 2.0 }, [
  [(c) => P.rocPos(c) && P.rangeBreakUp(c), 1, 3],
  [(c) => P.rocNeg(c) && P.rangeBreakDn(c), -1, 3],
  [(c) => P.rocPos(c) && P.brokeResistance(c), 1, 2.5],
  [(c) => P.rocNeg(c) && P.brokeSupport(c), -1, 2.5],
  [(c) => P.rocPos(c) && P.bosUp(c), 1, 2.5],
  [(c) => P.rocNeg(c) && P.bosDn(c), -1, 2.5],
  [(c) => P.rocPos(c) && P.volSpike(c), 1, 2.5],
  [(c) => P.rocNeg(c) && P.volSpike(c), -1, 2.5],
  [(c) => P.rocPos(c) && P.aboveVwap(c), 1, 2],
  [(c) => P.rocNeg(c) && P.belowVwap(c), -1, 2]
]);

add('25.3', 'Momentum + EMA Trend', 25, { method: 'momentum', stopMult: 1.2, rr: 2.2 }, [
  [(c) => P.momUp(c) && P.ema8Above21(c) && P.ema21Above50(c), 1, 3],
  [(c) => P.momDown(c) && P.ema8Below21(c) && P.ema21Below50(c), -1, 3],
  [(c) => P.momUp(c) && P.ema21Above50(c), 1, 2.5],
  [(c) => P.momDown(c) && P.ema21Below50(c), -1, 2.5],
  [(c) => P.momUp(c) && P.aboveEma200(c), 1, 2.5],
  [(c) => P.momDown(c) && P.belowEma200(c), -1, 2.5],
  [(c) => P.momUp(c) && P.aboveEma50(c), 1, 2],
  [(c) => P.momDown(c) && P.belowEma50(c), -1, 2],
  [(c) => P.momUp(c) && P.ema8Below21(c), 0, 2],
  [(c) => P.momDown(c) && P.ema8Above21(c), 0, 2]
]);

add('25.4', 'Momentum + Structure Break', 25, { method: 'momentum', stopMult: 1.1, rr: 2.0 }, [
  [(c) => P.bosUp(c) && P.momUp(c), 1, 3],
  [(c) => P.bosDn(c) && P.momDown(c), -1, 3],
  [(c) => P.chochBull(c) && P.momUp(c), 1, 3],
  [(c) => P.chochBear(c) && P.momDown(c), -1, 3],
  [(c) => P.trendlineUpBreak(c) && P.momUp(c), 1, 2.5],
  [(c) => P.trendlineDnBreak(c) && P.momDown(c), -1, 2.5],
  [(c) => P.channelUpBreak(c) && P.momUp(c), 1, 2.5],
  [(c) => P.channelDnBreak(c) && P.momDown(c), -1, 2.5],
  [(c) => P.bosUp(c) && P.momDown(c), 0, 2],
  [(c) => P.bosDn(c) && P.momUp(c), 0, 2]
]);

add('25.5', 'Momentum Divergence Reader', 25, { method: 'momentum', stopMult: 1.3, rr: 2.6 }, [
  [(c) => P.rsiDivBull(c) && P.momUp(c), 1, 3.5],
  [(c) => P.rsiDivBear(c) && P.momDown(c), -1, 3.5],
  [(c) => P.rsiDivBull(c) && P.macdHistRising(c), 1, 3],
  [(c) => P.rsiDivBear(c) && P.macdHistFalling(c), -1, 3],
  [(c) => P.rsiDivBull(c) && P.priceFalling(c) && P.deltaPos(c), 1, 3],
  [(c) => P.rsiDivBear(c) && P.priceRising(c) && P.deltaNeg(c), -1, 3],
  [(c) => P.rsiDivBull(c) && P.atSupport(c), 1, 2.5],
  [(c) => P.rsiDivBear(c) && P.atResistance(c), -1, 2.5],
  [(c) => P.rsiDivBull(c) && P.structDn(c), 0, 2],
  [(c) => P.rsiDivBear(c) && P.structUp(c), 0, 2]
]);

add('25.6', 'Momentum + Volume Surge', 25, { method: 'momentum', stopMult: 1.1, rr: 2.0 }, [
  [(c) => P.momUp(c) && P.volSpike(c) && P.upCandle(c), 1, 3],
  [(c) => P.momDown(c) && P.volSpike(c) && P.downCandle(c), -1, 3],
  [(c) => P.momUp(c) && P.rvolHigh(c), 1, 2.5],
  [(c) => P.momDown(c) && P.rvolHigh(c), -1, 2.5],
  [(c) => P.momUp(c) && P.tapeBull(c), 1, 2.5],
  [(c) => P.momDown(c) && P.tapeBear(c), -1, 2.5],
  [(c) => P.momUp(c) && P.obvRising(c), 1, 2],
  [(c) => P.momDown(c) && P.obvFalling(c), -1, 2],
  [(c) => P.momUp(c) && P.rvolLow(c), 0, 2],
  [(c) => P.momDown(c) && P.rvolLow(c), 0, 2]
]);

add('25.7', 'Momentum + VWAP Sync', 25, { method: 'momentum', stopMult: 1.2, rr: 2.2 }, [
  [(c) => P.momUp(c) && P.aboveVwap(c), 1, 3],
  [(c) => P.momDown(c) && P.belowVwap(c), -1, 3],
  [(c) => P.momUp(c) && P.nearVwap(c), 1, 2.5],
  [(c) => P.momDown(c) && P.nearVwap(c), -1, 2.5],
  [(c) => P.momUp(c) && P.aboveVwap(c) && P.aboveEma21(c), 1, 2.5],
  [(c) => P.momDown(c) && P.belowVwap(c) && P.belowEma21(c), -1, 2.5],
  [(c) => P.momUp(c) && P.aboveVwap(c) && P.htfBull(c), 1, 2.5],
  [(c) => P.momDown(c) && P.belowVwap(c) && P.htfBear(c), -1, 2.5],
  [(c) => P.momUp(c) && P.belowVwap(c), 0, 2],
  [(c) => P.momDown(c) && P.aboveVwap(c), 0, 2]
]);

add('25.8', 'Momentum Squeeze Release', 25, { method: 'momentum', stopMult: 1.1, rr: 2.2 }, [
  [(c) => P.squeezeOn(c) && P.momUp(c) && P.bbWidthExpanding(c), 1, 3.5],
  [(c) => P.squeezeOn(c) && P.momDown(c) && P.bbWidthExpanding(c), -1, 3.5],
  [(c) => P.squeezeOn(c) && P.rangeBreakUp(c), 1, 3],
  [(c) => P.squeezeOn(c) && P.rangeBreakDn(c), -1, 3],
  [(c) => P.squeezeOn(c) && P.momUp(c), 1, 2.5],
  [(c) => P.squeezeOn(c) && P.momDown(c), -1, 2.5],
  [(c) => P.squeezeOn(c) && P.volSpike(c), 1, 2.5],
  [(c) => P.squeezeOn(c) && P.momUp(c) && P.htfBull(c), 1, 2.5],
  [(c) => P.squeezeOn(c) && P.momDown(c) && P.htfBear(c), -1, 2.5],
  [(c) => P.squeezeOn(c) && P.adxWeak(c), 0, 2]
]);

add('25.9', 'Momentum Multi-Timeframe Sync', 25, { method: 'momentum', stopMult: 1.2, rr: 2.3 }, [
  [(c) => P.momUp(c) && P.h4Bull(c) && P.htfBull(c), 1, 3],
  [(c) => P.momDown(c) && P.h4Bear(c) && P.htfBear(c), -1, 3],
  [(c) => P.momUp(c) && P.allTfBull(c), 1, 3],
  [(c) => P.momDown(c) && P.allTfBear(c), -1, 3],
  [(c) => P.momUp(c) && P.htfBull(c), 1, 2],
  [(c) => P.momDown(c) && P.htfBear(c), -1, 2],
  [(c) => P.momUp(c) && P.htfBear(c), 0, 2],
  [(c) => P.momDown(c) && P.htfBull(c), 0, 2],
  [(c) => P.momUp(c) && P.m5Bull(c), 1, 1.5],
  [(c) => P.momDown(c) && P.m5Bear(c), -1, 1.5]
]);

add('25.10', 'Momentum Exhaustion Counter', 25, { method: 'momentum', stopMult: 1.3, rr: 2.5 }, [
  [(c) => P.momUp(c) && P.rsiOB(c) && P.volClimax(c), -1, 3.5],
  [(c) => P.momDown(c) && P.rsiOS(c) && P.volClimax(c), 1, 3.5],
  [(c) => P.momUp(c) && P.aboveBBUp(c) && P.rsiDivBear(c), -1, 3],
  [(c) => P.momDown(c) && P.belowBBLo(c) && P.rsiDivBull(c), 1, 3],
  [(c) => P.momUp(c) && P.deltaExtremePos(c) && P.macdHistFalling(c), -1, 3],
  [(c) => P.momDown(c) && P.deltaExtremeNeg(c) && P.macdHistRising(c), 1, 3],
  [(c) => P.momUp(c) && P.fundingHigh(c), -1, 2.5],
  [(c) => P.momDown(c) && P.fundingLow(c), 1, 2.5],
  [(c) => P.momUp(c) && P.atVah(c), -1, 2],
  [(c) => P.momDown(c) && P.atVal(c), 1, 2]
]);

// ===================== CATEGORY 26: EMA CROSSOVER MASTERS ==================
add('26.1', 'EMA 8/21 Crossover Trader', 26, { method: 'ema', stopMult: 1.1, rr: 2.0 }, [
  [(c) => P.ema8Above21(c) && P.alignBull(c) && P.aboveEma8(c), 1, 3],
  [(c) => P.ema8Below21(c) && P.alignBear(c) && P.belowEma8(c), -1, 3],
  [(c) => P.ema8Above21(c) && P.macdHistRising(c), 1, 2.5],
  [(c) => P.ema8Below21(c) && P.macdHistFalling(c), -1, 2.5],
  [(c) => P.ema8Above21(c) && P.rsiAbove50(c), 1, 2],
  [(c) => P.ema8Below21(c) && P.rsiBelow50(c), -1, 2],
  [(c) => P.ema8Above21(c) && P.aboveVwap(c), 1, 2],
  [(c) => P.ema8Below21(c) && P.belowVwap(c), -1, 2],
  [(c) => P.ema8Above21(c) && P.ema21Below50(c), 0, 2],
  [(c) => P.ema8Below21(c) && P.ema21Above50(c), 0, 2]
]);

add('26.2', 'EMA 21/50 Crossover Trader', 26, { method: 'ema', stopMult: 1.2, rr: 2.2 }, [
  [(c) => P.ema21Above50(c) && P.alignBull(c), 1, 3],
  [(c) => P.ema21Below50(c) && P.alignBear(c), -1, 3],
  [(c) => P.ema21Above50(c) && P.aboveEma21(c), 1, 2.5],
  [(c) => P.ema21Below50(c) && P.belowEma21(c), -1, 2.5],
  [(c) => P.ema21Above50(c) && P.ema8Above21(c), 1, 2.5],
  [(c) => P.ema21Below50(c) && P.ema8Below21(c), -1, 2.5],
  [(c) => P.ema21Above50(c) && P.adxStrong(c), 1, 2],
  [(c) => P.ema21Below50(c) && P.adxStrong(c), -1, 2],
  [(c) => P.ema21Above50(c) && P.ema8Below21(c), 0, 2],
  [(c) => P.ema21Below50(c) && P.ema8Above21(c), 0, 2]
]);

add('26.3', 'Golden/Death Cross Trader', 26, { method: 'ema', stopMult: 1.3, rr: 2.5 }, [
  [(c) => P.ema50Above200(c) && P.alignBull(c) && P.aboveEma50(c), 1, 3.5],
  [(c) => P.ema50Below200(c) && P.alignBear(c) && P.belowEma50(c), -1, 3.5],
  [(c) => P.ema50Above200(c) && P.aboveEma200(c), 1, 2.5],
  [(c) => P.ema50Below200(c) && P.belowEma200(c), -1, 2.5],
  [(c) => P.ema50Above200(c) && P.htfBull(c), 1, 2.5],
  [(c) => P.ema50Below200(c) && P.htfBear(c), -1, 2.5],
  [(c) => P.ema50Above200(c) && P.ema21Above50(c), 1, 2],
  [(c) => P.ema50Below200(c) && P.ema21Below50(c), -1, 2],
  [(c) => P.ema50Above200(c) && P.ema8Below21(c), 0, 2],
  [(c) => P.ema50Below200(c) && P.ema8Above21(c), 0, 2]
]);

add('26.4', 'Triple EMA Stack Trader', 26, { method: 'ema', stopMult: 1.2, rr: 2.2 }, [
  [(c) => P.ema8Above21(c) && P.ema21Above50(c) && P.ema50Above200(c), 1, 3.5],
  [(c) => P.ema8Below21(c) && P.ema21Below50(c) && P.ema50Below200(c), -1, 3.5],
  [(c) => P.ema8Above21(c) && P.ema21Above50(c), 1, 2.5],
  [(c) => P.ema8Below21(c) && P.ema21Below50(c), -1, 2.5],
  [(c) => P.alignBull(c) && P.ema21Above50(c), 1, 2],
  [(c) => P.alignBear(c) && P.ema21Below50(c), -1, 2],
  [(c) => P.ema8Above21(c) && P.ema50Above200(c), 1, 2],
  [(c) => P.ema8Below21(c) && P.ema50Below200(c), -1, 2],
  [(c) => P.ema8Above21(c) && P.ema21Below50(c), 0, 2.5],
  [(c) => P.ema8Below21(c) && P.ema21Above50(c), 0, 2.5]
]);

add('26.5', 'EMA Pullback Bounce Trader', 26, { method: 'ema21', stopMult: 1.2, rr: 2.4 }, [
  [(c) => P.alignBull(c) && P.nearEma21At(c, 'low') && P.aboveEma21(c), 1, 3],
  [(c) => P.alignBear(c) && P.nearEma21At(c, 'high') && P.belowEma21(c), -1, 3],
  [(c) => P.alignBull(c) && P.retestAboveLastH(c) && P.nearEma21At(c), 1, 3],
  [(c) => P.alignBear(c) && P.retestBelowLastL(c) && P.nearEma21At(c), -1, 3],
  [(c) => P.alignBull(c) && P.nearEma50At(c, 'low'), 1, 2.5],
  [(c) => P.alignBear(c) && P.nearEma50At(c, 'high'), -1, 2.5],
  [(c) => P.alignBull(c) && P.nearEma21At(c) && P.pinBull(c), 1, 2.5],
  [(c) => P.alignBear(c) && P.nearEma21At(c) && P.pinBear(c), -1, 2.5],
  [(c) => P.alignMixed(c) && P.nearEma21At(c), 0, 2],
  [(c) => P.nearEma21At(c) && P.adxWeak(c), 0, 1.5]
]);

add('26.6', 'EMA Slope + Cross Trader', 26, { method: 'ema', stopMult: 1.2, rr: 2.2 }, [
  [(c) => P.ema8Above21(c) && P.ema8Rising(c) && P.ema21Rising(c), 1, 3],
  [(c) => P.ema8Below21(c) && P.ema8Falling(c) && P.ema21Falling(c), -1, 3],
  [(c) => P.ema8Above21(c) && P.ema21Rising(c), 1, 2.5],
  [(c) => P.ema8Below21(c) && P.ema21Falling(c), -1, 2.5],
  [(c) => P.ema8Rising(c) && P.alignBull(c), 1, 2],
  [(c) => P.ema8Falling(c) && P.alignBear(c), -1, 2],
  [(c) => P.ema21Rising(c) && P.aboveEma21(c), 1, 2],
  [(c) => P.ema21Falling(c) && P.belowEma21(c), -1, 2],
  [(c) => P.ema8Rising(c) && P.alignBear(c), 0, 2],
  [(c) => P.ema8Falling(c) && P.alignBull(c), 0, 2]
]);

add('26.7', 'EMA Cross + Volume Trader', 26, { method: 'ema', stopMult: 1.1, rr: 2.0 }, [
  [(c) => P.ema8Above21(c) && P.volSpike(c) && P.upCandle(c), 1, 3],
  [(c) => P.ema8Below21(c) && P.volSpike(c) && P.downCandle(c), -1, 3],
  [(c) => P.ema8Above21(c) && P.rvolHigh(c), 1, 2.5],
  [(c) => P.ema8Below21(c) && P.rvolHigh(c), -1, 2.5],
  [(c) => P.ema8Above21(c) && P.tapeBull(c), 1, 2.5],
  [(c) => P.ema8Below21(c) && P.tapeBear(c), -1, 2.5],
  [(c) => P.ema8Above21(c) && P.obvRising(c), 1, 2],
  [(c) => P.ema8Below21(c) && P.obvFalling(c), -1, 2],
  [(c) => P.ema8Above21(c) && P.rvolLow(c), 0, 2],
  [(c) => P.ema8Below21(c) && P.rvolLow(c), 0, 2]
]);

add('26.8', 'EMA Cross + Breakout Trader', 26, { method: 'ema', stopMult: 1.1, rr: 2.0 }, [
  [(c) => P.ema8Above21(c) && P.rangeBreakUp(c), 1, 3],
  [(c) => P.ema8Below21(c) && P.rangeBreakDn(c), -1, 3],
  [(c) => P.ema8Above21(c) && P.brokeResistance(c), 1, 2.5],
  [(c) => P.ema8Below21(c) && P.brokeSupport(c), -1, 2.5],
  [(c) => P.ema8Above21(c) && P.bosUp(c), 1, 2.5],
  [(c) => P.ema8Below21(c) && P.bosDn(c), -1, 2.5],
  [(c) => P.ema8Above21(c) && P.channelUpBreak(c), 1, 2.5],
  [(c) => P.ema8Below21(c) && P.channelDnBreak(c), -1, 2.5],
  [(c) => P.ema8Above21(c) && P.trendlineUpBreak(c), 1, 2],
  [(c) => P.ema8Below21(c) && P.trendlineDnBreak(c), -1, 2]
]);

add('26.9', 'EMA Multi-Timeframe Sync', 26, { method: 'ema', stopMult: 1.2, rr: 2.3 }, [
  [(c) => P.ema8Above21(c) && P.htfBull(c) && P.h4Bull(c), 1, 3],
  [(c) => P.ema8Below21(c) && P.htfBear(c) && P.h4Bear(c), -1, 3],
  [(c) => P.ema8Above21(c) && P.allTfBull(c), 1, 3],
  [(c) => P.ema8Below21(c) && P.allTfBear(c), -1, 3],
  [(c) => P.aboveEma21(c) && P.htfBull(c), 1, 2],
  [(c) => P.belowEma21(c) && P.htfBear(c), -1, 2],
  [(c) => P.aboveEma21(c) && P.htfBear(c), 0, 2],
  [(c) => P.belowEma21(c) && P.htfBull(c), 0, 2],
  [(c) => P.ema8Above21(c) && P.m5Bull(c), 1, 1.5],
  [(c) => P.ema8Below21(c) && P.m5Bear(c), -1, 1.5]
]);

add('26.10', 'EMA Overextension Fader', 26, { method: 'ema', stopMult: 1.3, rr: 2.5 }, [
  [(c) => P.aboveEma8(c) && (c.ind && c.ind.ema8 !== null && (c.price - c.ind.ema8) / atr(c) > 3) && P.rsiOB(c), -1, 3.5],
  [(c) => P.belowEma8(c) && (c.ind && c.ind.ema8 !== null && (c.ind.ema8 - c.price) / atr(c) > 3) && P.rsiOS(c), 1, 3.5],
  [(c) => P.aboveEma8(c) && (c.ind && c.ind.ema8 !== null && (c.price - c.ind.ema8) / atr(c) > 2.5), -1, 2.5],
  [(c) => P.belowEma8(c) && (c.ind && c.ind.ema8 !== null && (c.ind.ema8 - c.price) / atr(c) > 2.5), 1, 2.5],
  [(c) => P.aboveBBUp(c) && P.macdHistFalling(c), -1, 2.5],
  [(c) => P.belowBBLo(c) && P.macdHistRising(c), 1, 2.5],
  [(c) => P.aboveEma21(c) && (c.ind && c.ind.ema21 !== null && (c.price - c.ind.ema21) / atr(c) > 4), -1, 2.5],
  [(c) => P.belowEma21(c) && (c.ind && c.ind.ema21 !== null && (c.ind.ema21 - c.price) / atr(c) > 4), 1, 2.5],
  [(c) => P.aboveEma8(c) && P.rsiOB(c), -1, 2],
  [(c) => P.belowEma8(c) && P.rsiOS(c), 1, 2]
]);

// ===================== CATEGORY 27: DYNAMIC S/R MASTERS ====================
add('27.1', 'S/R Touch Reversal Trader', 27, { method: 's/r', stopMult: 1.2, rr: 2.4 }, [
  [(c) => P.atResistance(c) && P.pinBear(c), -1, 3],
  [(c) => P.atSupport(c) && P.pinBull(c), 1, 3],
  [(c) => P.atResistance(c) && P.engulfBear(c), -1, 2.5],
  [(c) => P.atSupport(c) && P.engulfBull(c), 1, 2.5],
  [(c) => P.atResistance(c) && P.rsiOB(c), -1, 2.5],
  [(c) => P.atSupport(c) && P.rsiOS(c), 1, 2.5],
  [(c) => P.atResistance(c) && P.stOB(c), -1, 2],
  [(c) => P.atSupport(c) && P.stOS(c), 1, 2],
  [(c) => P.atResistance(c) && P.htfBull(c), 0, 2],
  [(c) => P.atSupport(c) && P.htfBear(c), 0, 2]
]);

add('27.2', 'S/R Break Continuation Trader', 27, { method: 's/r', stopMult: 1.1, rr: 2.0 }, [
  [(c) => P.brokeResistance(c) && P.volSpike(c) && P.upCandle(c), 1, 3],
  [(c) => P.brokeSupport(c) && P.volSpike(c) && P.downCandle(c), -1, 3],
  [(c) => P.brokeResistance(c) && P.alignBull(c), 1, 2.5],
  [(c) => P.brokeSupport(c) && P.alignBear(c), -1, 2.5],
  [(c) => P.brokeResistance(c) && P.htfBull(c), 1, 2.5],
  [(c) => P.brokeSupport(c) && P.htfBear(c), -1, 2.5],
  [(c) => P.brokeResistance(c) && P.macdHistRising(c), 1, 2],
  [(c) => P.brokeSupport(c) && P.macdHistFalling(c), -1, 2],
  [(c) => P.brokeResistance(c) && P.htfBear(c), 0, 2],
  [(c) => P.brokeSupport(c) && P.htfBull(c), 0, 2]
]);

add('27.3', 'S/R Break + Retest Trader', 27, { method: 's/r', stopMult: 1.2, rr: 2.5 }, [
  [(c) => P.retestAboveLastH(c) && P.brokeResistance(c) && P.aboveEma8(c), 1, 3],
  [(c) => P.retestBelowLastL(c) && P.brokeSupport(c) && P.belowEma8(c), -1, 3],
  [(c) => P.retestAboveLastH(c) && P.alignBull(c), 1, 2.5],
  [(c) => P.retestBelowLastL(c) && P.alignBear(c), -1, 2.5],
  [(c) => P.closeBackBelowH(c) && P.brokeResistance(c), 0, 3],
  [(c) => P.closeBackAboveL(c) && P.brokeSupport(c), 0, 3],
  [(c) => P.retestAboveLastH(c) && P.tapeBull(c), 1, 2.5],
  [(c) => P.retestBelowLastL(c) && P.tapeBear(c), -1, 2.5],
  [(c) => P.retestAboveLastH(c) && P.rvolLow(c), 0, 2],
  [(c) => P.retestBelowLastL(c) && P.rvolLow(c), 0, 2]
]);

add('27.4', 'S/R Fake Break Hunter', 27, { method: 's/r', stopMult: 1.3, rr: 2.8 }, [
  [(c) => P.closeBackBelowH(c) && P.pinBear(c) && P.atResistance(c), -1, 3.5],
  [(c) => P.closeBackAboveL(c) && P.pinBull(c) && P.atSupport(c), 1, 3.5],
  [(c) => P.closeBackBelowH(c) && P.engulfBear(c), -1, 3],
  [(c) => P.closeBackAboveL(c) && P.engulfBull(c), 1, 3],
  [(c) => P.closeBackBelowH(c) && P.rsiDivBear(c), -1, 2.5],
  [(c) => P.closeBackAboveL(c) && P.rsiDivBull(c), 1, 2.5],
  [(c) => P.closeBackBelowH(c) && P.volClimax(c), -1, 2.5],
  [(c) => P.closeBackAboveL(c) && P.volClimax(c), 1, 2.5],
  [(c) => P.closeBackBelowH(c) && P.rangeFakeUp(c), -1, 3],
  [(c) => P.closeBackAboveL(c) && P.rangeFakeDn(c), 1, 3]
]);

add('27.5', 'S/R + Volume Trader', 27, { method: 's/r', stopMult: 1.1, rr: 2.0 }, [
  [(c) => P.atSupport(c) && P.volSpike(c) && P.pinBull(c), 1, 3],
  [(c) => P.atResistance(c) && P.volSpike(c) && P.pinBear(c), -1, 3],
  [(c) => P.atSupport(c) && P.volClimax(c), 1, 2.5],
  [(c) => P.atResistance(c) && P.volClimax(c), -1, 2.5],
  [(c) => P.atSupport(c) && P.rvolHigh(c), 1, 2],
  [(c) => P.atResistance(c) && P.rvolHigh(c), -1, 2],
  [(c) => P.atSupport(c) && P.tapeBull(c), 1, 2],
  [(c) => P.atResistance(c) && P.tapeBear(c), -1, 2],
  [(c) => P.atSupport(c) && P.rvolLow(c), 0, 2],
  [(c) => P.atResistance(c) && P.rvolLow(c), 0, 2]
]);

add('27.6', 'S/R + Momentum Trader', 27, { method: 's/r', stopMult: 1.2, rr: 2.2 }, [
  [(c) => P.atSupport(c) && P.rsiDivBull(c) && P.macdHistRising(c), 1, 3],
  [(c) => P.atResistance(c) && P.rsiDivBear(c) && P.macdHistFalling(c), -1, 3],
  [(c) => P.atSupport(c) && P.stOS(c) && P.stKAboveD(c), 1, 2.5],
  [(c) => P.atResistance(c) && P.stOB(c) && P.stKBelowD(c), -1, 2.5],
  [(c) => P.atSupport(c) && P.cciBear(c), 1, 2],
  [(c) => P.atResistance(c) && P.cciBull(c), -1, 2],
  [(c) => P.atSupport(c) && P.wrOS(c), 1, 2],
  [(c) => P.atResistance(c) && P.wrOB(c), -1, 2],
  [(c) => P.atSupport(c) && P.rsiOB(c), 0, 2],
  [(c) => P.atResistance(c) && P.rsiOS(c), 0, 2]
]);

add('27.7', 'S/R Cluster Strength Analyst', 27, { method: 's/r', stopMult: 1.2, rr: 2.3 }, [
  [(c) => P.atSupport(c) && P.atPoc(c), 1, 3],
  [(c) => P.atResistance(c) && P.atPoc(c), -1, 3],
  [(c) => P.atSupport(c) && P.nearFib618(c), 1, 2.5],
  [(c) => P.atResistance(c) && P.nearFib382(c), -1, 2.5],
  [(c) => P.atSupport(c) && P.atVal(c), 1, 2.5],
  [(c) => P.atResistance(c) && P.atVah(c), -1, 2.5],
  [(c) => P.atSupport(c) && P.nearEma50At(c, 'low'), 1, 2.5],
  [(c) => P.atResistance(c) && P.nearEma50At(c, 'high'), -1, 2.5],
  [(c) => P.atSupport(c) && P.atVah(c), 0, 2],
  [(c) => P.atResistance(c) && P.atVal(c), 0, 2]
]);

add('27.8', 'S/R + EMA Confluence', 27, { method: 's/r', stopMult: 1.2, rr: 2.3 }, [
  [(c) => P.atSupport(c) && P.nearEma21At(c) && P.alignBull(c), 1, 3],
  [(c) => P.atResistance(c) && P.nearEma21At(c) && P.alignBear(c), -1, 3],
  [(c) => P.atSupport(c) && P.nearEma21At(c, 'low'), 1, 2.5],
  [(c) => P.atResistance(c) && P.nearEma21At(c, 'high'), -1, 2.5],
  [(c) => P.atSupport(c) && P.aboveEma21(c), 1, 2],
  [(c) => P.atResistance(c) && P.belowEma21(c), -1, 2],
  [(c) => P.atSupport(c) && P.ema8Above21(c), 1, 2],
  [(c) => P.atResistance(c) && P.ema8Below21(c), -1, 2],
  [(c) => P.atSupport(c) && P.belowEma21(c), 0, 2],
  [(c) => P.atResistance(c) && P.aboveEma21(c), 0, 2]
]);

add('27.9', 'S/R Multi-Timeframe Aligner', 27, { method: 's/r', stopMult: 1.2, rr: 2.3 }, [
  [(c) => P.atSupport(c) && P.htfBull(c) && P.h4Bull(c), 1, 3],
  [(c) => P.atResistance(c) && P.htfBear(c) && P.h4Bear(c), -1, 3],
  [(c) => P.atSupport(c) && P.htfBull(c), 1, 2.5],
  [(c) => P.atResistance(c) && P.htfBear(c), -1, 2.5],
  [(c) => P.atSupport(c) && P.allTfBull(c), 1, 3],
  [(c) => P.atResistance(c) && P.allTfBear(c), -1, 3],
  [(c) => P.atSupport(c) && P.htfBear(c), 0, 2],
  [(c) => P.atResistance(c) && P.htfBull(c), 0, 2],
  [(c) => P.atSupport(c) && P.m5Bull(c), 1, 1.5],
  [(c) => P.atResistance(c) && P.m5Bear(c), -1, 1.5]
]);

add('27.10', 'S/R Range Fade Trader', 27, { method: 's/r', stopMult: 1.3, rr: 2.5 }, [
  [(c) => P.atResistance(c) && P.rangeAtHigh(c) && P.adxWeak(c), -1, 3],
  [(c) => P.atSupport(c) && P.rangeAtLow(c) && P.adxWeak(c), 1, 3],
  [(c) => P.atResistance(c) && P.rangeAtHigh(c) && P.rsiDivBear(c), -1, 3],
  [(c) => P.atSupport(c) && P.rangeAtLow(c) && P.rsiDivBull(c), 1, 3],
  [(c) => P.atResistance(c) && P.rangeAtHigh(c), -1, 2.5],
  [(c) => P.atSupport(c) && P.rangeAtLow(c), 1, 2.5],
  [(c) => P.atResistance(c) && P.rangeTight(c), -1, 2],
  [(c) => P.atSupport(c) && P.rangeTight(c), 1, 2],
  [(c) => P.atResistance(c) && P.adxStrong(c), 0, 2.5],
  [(c) => P.atSupport(c) && P.adxStrong(c), 0, 2.5]
]);

// ===================== CATEGORY 28: MA RIBBON MASTERS ======================
add('28.1', 'Ribbon Bull Expansion Trader', 28, { method: 'ribbon', stopMult: 1.2, rr: 2.2 }, [
  [(c) => P.ribbonBull(c) && P.aboveEma8(c) && P.ema8Rising(c), 1, 3],
  [(c) => P.ribbonBull(c) && P.aboveEma21(c), 1, 2.5],
  [(c) => P.ribbonBull(c) && P.alignBull(c), 1, 2.5],
  [(c) => P.ribbonBull(c) && P.adxStrong(c), 1, 2.5],
  [(c) => P.ribbonBull(c) && P.macdHistRising(c), 1, 2],
  [(c) => P.ribbonBull(c) && P.rsiBull(c), 1, 2],
  [(c) => P.ribbonBull(c) && P.htfBull(c), 1, 2],
  [(c) => P.ribbonBull(c) && P.nearEma21At(c), 1, 2],
  [(c) => P.ribbonBull(c) && P.rsiOB(c), 0, 2],
  [(c) => P.ribbonBull(c) && P.aboveEma8(c) && P.ema8Falling(c), 0, 2]
]);

add('28.2', 'Ribbon Bear Expansion Trader', 28, { method: 'ribbon', stopMult: 1.2, rr: 2.2 }, [
  [(c) => P.ribbonBear(c) && P.belowEma8(c) && P.ema8Falling(c), -1, 3],
  [(c) => P.ribbonBear(c) && P.belowEma21(c), -1, 2.5],
  [(c) => P.ribbonBear(c) && P.alignBear(c), -1, 2.5],
  [(c) => P.ribbonBear(c) && P.adxStrong(c), -1, 2.5],
  [(c) => P.ribbonBear(c) && P.macdHistFalling(c), -1, 2],
  [(c) => P.ribbonBear(c) && P.rsiBear(c), -1, 2],
  [(c) => P.ribbonBear(c) && P.htfBear(c), -1, 2],
  [(c) => P.ribbonBear(c) && P.nearEma21At(c), -1, 2],
  [(c) => P.ribbonBear(c) && P.rsiOS(c), 0, 2],
  [(c) => P.ribbonBear(c) && P.belowEma8(c) && P.ema8Rising(c), 0, 2]
]);

add('28.3', 'Ribbon Squeeze Reader', 28, { method: 'ribbon', stopMult: 1.1, rr: 2.2 }, [
  [(c) => P.ribbonTight(c) && P.squeezeOn(c) && P.bbWidthExpanding(c), 0, 3],
  [(c) => P.ribbonTight(c) && P.volSpike(c) && P.upCandle(c), 1, 2.5],
  [(c) => P.ribbonTight(c) && P.volSpike(c) && P.downCandle(c), -1, 2.5],
  [(c) => P.ribbonTight(c) && P.rangeBreakUp(c), 1, 3],
  [(c) => P.ribbonTight(c) && P.rangeBreakDn(c), -1, 3],
  [(c) => P.ribbonTight(c) && P.rangeTight(c), 0, 2.5],
  [(c) => P.ribbonTight(c) && P.adxWeak(c), 0, 2],
  [(c) => P.ribbonTight(c) && P.atrLow(c), 0, 2],
  [(c) => P.ribbonTight(c) && P.macdHistRising(c), 1, 1.5],
  [(c) => P.ribbonTight(c) && P.macdHistFalling(c), -1, 1.5]
]);

add('28.4', 'Ribbon Price Position Trader', 28, { method: 'ribbon', stopMult: 1.1, rr: 2.0 }, [
  [(c) => P.ribbonBull(c) && P.aboveEma8(c), 1, 3],
  [(c) => P.ribbonBear(c) && P.belowEma8(c), -1, 3],
  [(c) => P.ribbonBull(c) && P.nearEma21At(c, 'low'), 1, 2.5],
  [(c) => P.ribbonBear(c) && P.nearEma21At(c, 'high'), -1, 2.5],
  [(c) => P.ribbonBull(c) && P.aboveVwap(c), 1, 2],
  [(c) => P.ribbonBear(c) && P.belowVwap(c), -1, 2],
  [(c) => P.ribbonBull(c) && P.aboveHull(c), 1, 2],
  [(c) => P.ribbonBear(c) && P.belowHull(c), -1, 2],
  [(c) => P.ribbonBull(c) && P.belowEma8(c), 0, 2],
  [(c) => P.ribbonBear(c) && P.aboveEma8(c), 0, 2]
]);

add('28.5', 'Ribbon + Volume Confirmation', 28, { method: 'ribbon', stopMult: 1.1, rr: 2.0 }, [
  [(c) => P.ribbonBull(c) && P.volSpike(c) && P.upCandle(c), 1, 3],
  [(c) => P.ribbonBear(c) && P.volSpike(c) && P.downCandle(c), -1, 3],
  [(c) => P.ribbonBull(c) && P.rvolHigh(c), 1, 2.5],
  [(c) => P.ribbonBear(c) && P.rvolHigh(c), -1, 2.5],
  [(c) => P.ribbonBull(c) && P.tapeBull(c), 1, 2.5],
  [(c) => P.ribbonBear(c) && P.tapeBear(c), -1, 2.5],
  [(c) => P.ribbonBull(c) && P.obvRising(c), 1, 2],
  [(c) => P.ribbonBear(c) && P.obvFalling(c), -1, 2],
  [(c) => P.ribbonBull(c) && P.rvolLow(c), 0, 2],
  [(c) => P.ribbonBear(c) && P.rvolLow(c), 0, 2]
]);

add('28.6', 'Ribbon + Momentum Trader', 28, { method: 'ribbon', stopMult: 1.2, rr: 2.2 }, [
  [(c) => P.ribbonBull(c) && P.macdHistRising(c) && P.rsiBull(c), 1, 3],
  [(c) => P.ribbonBear(c) && P.macdHistFalling(c) && P.rsiBear(c), -1, 3],
  [(c) => P.ribbonBull(c) && P.stKAboveD(c), 1, 2],
  [(c) => P.ribbonBear(c) && P.stKBelowD(c), -1, 2],
  [(c) => P.ribbonBull(c) && P.cciRising(c), 1, 2],
  [(c) => P.ribbonBear(c) && P.cciFalling(c), -1, 2],
  [(c) => P.ribbonBull(c) && P.momUp(c), 1, 2],
  [(c) => P.ribbonBear(c) && P.momDown(c), -1, 2],
  [(c) => P.ribbonBull(c) && P.macdHistFalling(c), 0, 2],
  [(c) => P.ribbonBear(c) && P.macdHistRising(c), 0, 2]
]);

add('28.7', 'Ribbon Breakout Confirmer', 28, { method: 'ribbon', stopMult: 1.1, rr: 2.0 }, [
  [(c) => P.ribbonBull(c) && P.rangeBreakUp(c), 1, 3],
  [(c) => P.ribbonBear(c) && P.rangeBreakDn(c), -1, 3],
  [(c) => P.ribbonBull(c) && P.brokeResistance(c), 1, 2.5],
  [(c) => P.ribbonBear(c) && P.brokeSupport(c), -1, 2.5],
  [(c) => P.ribbonBull(c) && P.bosUp(c), 1, 2.5],
  [(c) => P.ribbonBear(c) && P.bosDn(c), -1, 2.5],
  [(c) => P.ribbonBull(c) && P.channelUpBreak(c), 1, 2.5],
  [(c) => P.ribbonBear(c) && P.channelDnBreak(c), -1, 2.5],
  [(c) => P.ribbonBull(c) && P.rangeFakeUp(c), 0, 2.5],
  [(c) => P.ribbonBear(c) && P.rangeFakeDn(c), 0, 2.5]
]);

add('28.8', 'Ribbon Compression Setup Trader', 28, { method: 'ribbon', stopMult: 1.3, rr: 2.6 }, [
  [(c) => P.ribbonTight(c) && P.adxWeak(c) && P.atrLow(c) && P.volSpike(c), 1, 3],
  [(c) => P.ribbonTight(c) && P.adxWeak(c) && P.atrLow(c) && P.volSpike(c), -1, 3],
  [(c) => P.ribbonTight(c) && P.rangeTight(c) && P.squeezeOn(c), 0, 2.5],
  [(c) => P.ribbonTight(c) && P.squeezeOn(c) && P.macdHistRising(c), 1, 2],
  [(c) => P.ribbonTight(c) && P.squeezeOn(c) && P.macdHistFalling(c), -1, 2],
  [(c) => P.ribbonTight(c) && P.volClimax(c), 0, 2.5],
  [(c) => P.ribbonTight(c) && P.rangeAtMid(c), 0, 2],
  [(c) => P.ribbonTight(c) && P.htfBull(c) && P.squeezeOn(c), 1, 2],
  [(c) => P.ribbonTight(c) && P.htfBear(c) && P.squeezeOn(c), -1, 2],
  [(c) => P.ribbonTight(c) && P.bbWidthExpanding(c) && P.upCandle(c), 1, 2.5]
]);

add('28.9', 'Ribbon Multi-Timeframe Sync', 28, { method: 'ribbon', stopMult: 1.2, rr: 2.3 }, [
  [(c) => P.ribbonBull(c) && P.h4Bull(c) && P.htfBull(c), 1, 3],
  [(c) => P.ribbonBear(c) && P.h4Bear(c) && P.htfBear(c), -1, 3],
  [(c) => P.ribbonBull(c) && P.allTfBull(c), 1, 3],
  [(c) => P.ribbonBear(c) && P.allTfBear(c), -1, 3],
  [(c) => P.ribbonBull(c) && P.htfBull(c), 1, 2],
  [(c) => P.ribbonBear(c) && P.htfBear(c), -1, 2],
  [(c) => P.ribbonBull(c) && P.htfBear(c), 0, 2],
  [(c) => P.ribbonBear(c) && P.htfBull(c), 0, 2],
  [(c) => P.ribbonTight(c) && P.mtfMixed(c), 0, 2],
  [(c) => P.ribbonBull(c) && P.d1Bull(c), 1, 2]
]);

add('28.10', 'Ribbon Fade Trader', 28, { method: 'ribbon', stopMult: 1.3, rr: 2.5 }, [
  [(c) => P.ribbonBull(c) && P.rsiOB(c) && P.aboveBBUp(c), -1, 3.5],
  [(c) => P.ribbonBear(c) && P.rsiOS(c) && P.belowBBLo(c), 1, 3.5],
  [(c) => P.ribbonBull(c) && P.deltaExtremePos(c), -1, 3],
  [(c) => P.ribbonBear(c) && P.deltaExtremeNeg(c), 1, 3],
  [(c) => P.ribbonBull(c) && P.fundingHigh(c), -1, 2.5],
  [(c) => P.ribbonBear(c) && P.fundingLow(c), 1, 2.5],
  [(c) => P.ribbonBull(c) && P.atVah(c), -1, 2.5],
  [(c) => P.ribbonBear(c) && P.atVal(c), 1, 2.5],
  [(c) => P.ribbonBull(c) && P.rsiOB(c), -1, 2],
  [(c) => P.ribbonBear(c) && P.rsiOS(c), 1, 2]
]);

// ===================== CATEGORY 29: HULL / ADAPTIVE MA MASTERS =============
add('29.1', 'Hull Trend Rider', 29, { method: 'hull', stopMult: 1.2, rr: 2.2 }, [
  [(c) => P.aboveHull(c) && P.hullRising(c) && P.alignBull(c), 1, 3],
  [(c) => P.belowHull(c) && P.hullFalling(c) && P.alignBear(c), -1, 3],
  [(c) => P.aboveHull(c) && P.ema8Above21(c), 1, 2.5],
  [(c) => P.belowHull(c) && P.ema8Below21(c), -1, 2.5],
  [(c) => P.aboveHull(c) && P.adxStrong(c), 1, 2],
  [(c) => P.belowHull(c) && P.adxStrong(c), -1, 2],
  [(c) => P.aboveHull(c) && P.macdHistRising(c), 1, 2],
  [(c) => P.belowHull(c) && P.macdHistFalling(c), -1, 2],
  [(c) => P.aboveHull(c) && P.alignBear(c), 0, 2],
  [(c) => P.belowHull(c) && P.alignBull(c), 0, 2]
]);

add('29.2', 'Hull Cross Trader', 29, { method: 'hull', stopMult: 1.1, rr: 2.0 }, [
  [(c) => P.aboveHull(c) && P.aboveEma21(c) && P.aboveEma8(c), 1, 3],
  [(c) => P.belowHull(c) && P.belowEma21(c) && P.belowEma8(c), -1, 3],
  [(c) => P.aboveHull(c) && P.aboveEma21(c), 1, 2.5],
  [(c) => P.belowHull(c) && P.belowEma21(c), -1, 2.5],
  [(c) => P.aboveHull(c) && P.ema21Above50(c), 1, 2],
  [(c) => P.belowHull(c) && P.ema21Below50(c), -1, 2],
  [(c) => P.aboveHull(c) && P.aboveVwap(c), 1, 2],
  [(c) => P.belowHull(c) && P.belowVwap(c), -1, 2],
  [(c) => P.aboveHull(c) && P.belowEma21(c), 0, 2],
  [(c) => P.belowHull(c) && P.aboveEma21(c), 0, 2]
]);

add('29.3', 'Hull Slope Momentum', 29, { method: 'hull', stopMult: 1.2, rr: 2.2 }, [
  [(c) => P.hullRising(c) && P.momUp(c) && P.rsiBull(c), 1, 3],
  [(c) => P.hullFalling(c) && P.momDown(c) && P.rsiBear(c), -1, 3],
  [(c) => P.hullRising(c) && P.macdHistRising(c), 1, 2.5],
  [(c) => P.hullFalling(c) && P.macdHistFalling(c), -1, 2.5],
  [(c) => P.hullRising(c) && P.stKAboveD(c), 1, 2],
  [(c) => P.hullFalling(c) && P.stKBelowD(c), -1, 2],
  [(c) => P.hullRising(c) && P.cciRising(c), 1, 2],
  [(c) => P.hullFalling(c) && P.cciFalling(c), -1, 2],
  [(c) => P.hullRising(c) && P.momDown(c), 0, 2],
  [(c) => P.hullFalling(c) && P.momUp(c), 0, 2]
]);

add('29.4', 'Hull + Structure Trader', 29, { method: 'hull', stopMult: 1.2, rr: 2.3 }, [
  [(c) => P.aboveHull(c) && P.structUp(c) && P.aboveSuperTrend(c), 1, 3],
  [(c) => P.belowHull(c) && P.structDn(c) && P.belowSuperTrend(c), -1, 3],
  [(c) => P.aboveHull(c) && P.bosUp(c), 1, 2.5],
  [(c) => P.belowHull(c) && P.bosDn(c), -1, 2.5],
  [(c) => P.aboveHull(c) && P.structUp(c), 1, 2],
  [(c) => P.belowHull(c) && P.structDn(c), -1, 2],
  [(c) => P.aboveHull(c) && P.retestAboveLastH(c), 1, 2.5],
  [(c) => P.belowHull(c) && P.retestBelowLastL(c), -1, 2.5],
  [(c) => P.aboveHull(c) && P.structDn(c), 0, 2],
  [(c) => P.belowHull(c) && P.structUp(c), 0, 2]
]);

add('29.5', 'KAMA Trend Tracker', 29, { method: 'kama', stopMult: 1.2, rr: 2.2 }, [
  [(c) => P.aboveKama(c) && P.kamaAbovePrice(c) && P.alignBull(c), 1, 3],
  [(c) => P.belowKama(c) && !P.kamaAbovePrice(c) && P.alignBear(c), -1, 3],
  [(c) => P.aboveKama(c) && P.ema21Above50(c), 1, 2.5],
  [(c) => P.belowKama(c) && P.ema21Below50(c), -1, 2.5],
  [(c) => P.aboveKama(c) && P.aboveEma200(c), 1, 2.5],
  [(c) => P.belowKama(c) && P.belowEma200(c), -1, 2.5],
  [(c) => P.aboveKama(c) && P.rsiAbove50(c), 1, 2],
  [(c) => P.belowKama(c) && P.rsiBelow50(c), -1, 2],
  [(c) => P.aboveKama(c) && P.alignBear(c), 0, 2],
  [(c) => P.belowKama(c) && P.alignBull(c), 0, 2]
]);

add('29.6', 'KAMA vs EMA Divergence Trader', 29, { method: 'kama', stopMult: 1.2, rr: 2.3 }, [
  [(c) => P.aboveKama(c) && P.aboveEma21(c) && P.ema21Above50(c), 1, 3],
  [(c) => P.belowKama(c) && P.belowEma21(c) && P.ema21Below50(c), -1, 3],
  [(c) => P.aboveKama(c) && P.aboveEma8(c), 1, 2.5],
  [(c) => P.belowKama(c) && P.belowEma8(c), -1, 2.5],
  [(c) => P.aboveKama(c) && P.aboveVwap(c), 1, 2],
  [(c) => P.belowKama(c) && P.belowVwap(c), -1, 2],
  [(c) => P.aboveKama(c) && P.macdHistRising(c), 1, 2],
  [(c) => P.belowKama(c) && P.macdHistFalling(c), -1, 2],
  [(c) => P.aboveKama(c) && P.belowEma21(c), 0, 2],
  [(c) => P.belowKama(c) && P.aboveEma21(c), 0, 2]
]);

add('29.7', 'Hull + Volume Trader', 29, { method: 'hull', stopMult: 1.1, rr: 2.0 }, [
  [(c) => P.aboveHull(c) && P.volSpike(c) && P.upCandle(c), 1, 3],
  [(c) => P.belowHull(c) && P.volSpike(c) && P.downCandle(c), -1, 3],
  [(c) => P.aboveHull(c) && P.rvolHigh(c), 1, 2.5],
  [(c) => P.belowHull(c) && P.rvolHigh(c), -1, 2.5],
  [(c) => P.aboveHull(c) && P.tapeBull(c), 1, 2.5],
  [(c) => P.belowHull(c) && P.tapeBear(c), -1, 2.5],
  [(c) => P.aboveHull(c) && P.obvRising(c), 1, 2],
  [(c) => P.belowHull(c) && P.obvFalling(c), -1, 2],
  [(c) => P.aboveHull(c) && P.rvolLow(c), 0, 2],
  [(c) => P.belowHull(c) && P.rvolLow(c), 0, 2]
]);

add('29.8', 'Hull Pullback Trader', 29, { method: 'hull', stopMult: 1.2, rr: 2.4 }, [
  [(c) => P.hullRising(c) && P.nearEma21At(c, 'low') && P.aboveHull(c), 1, 3],
  [(c) => P.hullFalling(c) && P.nearEma21At(c, 'high') && P.belowHull(c), -1, 3],
  [(c) => P.hullRising(c) && P.atSupport(c), 1, 2.5],
  [(c) => P.hullFalling(c) && P.atResistance(c), -1, 2.5],
  [(c) => P.hullRising(c) && P.nearVwap(c), 1, 2],
  [(c) => P.hullFalling(c) && P.nearVwap(c), -1, 2],
  [(c) => P.hullRising(c) && P.retestAboveLastH(c), 1, 2.5],
  [(c) => P.hullFalling(c) && P.retestBelowLastL(c), -1, 2.5],
  [(c) => P.hullRising(c) && P.rsiOB(c), 0, 2],
  [(c) => P.hullFalling(c) && P.rsiOS(c), 0, 2]
]);

add('29.9', 'Hull Multi-Timeframe Sync', 29, { method: 'hull', stopMult: 1.2, rr: 2.3 }, [
  [(c) => P.aboveHull(c) && P.h4Bull(c) && P.htfBull(c), 1, 3],
  [(c) => P.belowHull(c) && P.h4Bear(c) && P.htfBear(c), -1, 3],
  [(c) => P.aboveHull(c) && P.allTfBull(c), 1, 3],
  [(c) => P.belowHull(c) && P.allTfBear(c), -1, 3],
  [(c) => P.aboveHull(c) && P.htfBull(c), 1, 2],
  [(c) => P.belowHull(c) && P.htfBear(c), -1, 2],
  [(c) => P.aboveHull(c) && P.htfBear(c), 0, 2],
  [(c) => P.belowHull(c) && P.htfBull(c), 0, 2],
  [(c) => P.aboveHull(c) && P.m5Bull(c), 1, 1.5],
  [(c) => P.belowHull(c) && P.m5Bear(c), -1, 1.5]
]);

add('29.10', 'Hull Breakout Confirmer', 29, { method: 'hull', stopMult: 1.1, rr: 2.0 }, [
  [(c) => P.aboveHull(c) && P.rangeBreakUp(c), 1, 3],
  [(c) => P.belowHull(c) && P.rangeBreakDn(c), -1, 3],
  [(c) => P.aboveHull(c) && P.brokeResistance(c), 1, 2.5],
  [(c) => P.belowHull(c) && P.brokeSupport(c), -1, 2.5],
  [(c) => P.aboveHull(c) && P.channelUpBreak(c), 1, 2.5],
  [(c) => P.belowHull(c) && P.channelDnBreak(c), -1, 2.5],
  [(c) => P.aboveHull(c) && P.trendlineUpBreak(c), 1, 2.5],
  [(c) => P.belowHull(c) && P.trendlineDnBreak(c), -1, 2.5],
  [(c) => P.aboveHull(c) && P.rangeFakeUp(c), 0, 2.5],
  [(c) => P.belowHull(c) && P.rangeFakeDn(c), 0, 2.5]
]);

// ===================== CATEGORY 30: MTF MA MASTERS =========================
add('30.1', 'MTF EMA Stack Aligner', 30, { method: 'mtf-ema', stopMult: 1.2, rr: 2.3 }, [
  [(c) => P.h4Bull(c) && P.htfBull(c) && P.alignBull(c), 1, 3],
  [(c) => P.h4Bear(c) && P.htfBear(c) && P.alignBear(c), -1, 3],
  [(c) => P.h4Bull(c) && P.alignBull(c) && P.aboveEma21(c), 1, 2.5],
  [(c) => P.h4Bear(c) && P.alignBear(c) && P.belowEma21(c), -1, 2.5],
  [(c) => P.d1Bull(c) && P.h4Bull(c) && P.htfBull(c), 1, 3],
  [(c) => P.d1Bear(c) && P.h4Bear(c) && P.htfBear(c), -1, 3],
  [(c) => P.h4Bull(c) && P.htfMixed(c), 1, 2],
  [(c) => P.h4Bear(c) && P.htfMixed(c), -1, 2],
  [(c) => P.h4Bull(c) && P.htfBear(c), 0, 2],
  [(c) => P.h4Bear(c) && P.htfBull(c), 0, 2]
]);

add('30.2', '4H Trend Pullback Specialist', 30, { method: 'mtf-ema', stopMult: 1.2, rr: 2.5 }, [
  [(c) => P.htfPullbackBuy(c) && P.alignBull(c), 1, 3],
  [(c) => P.htfPullbackSell(c) && P.alignBear(c), -1, 3],
  [(c) => P.h4Bull(c) && P.nearEma21At(c, 'low'), 1, 2.5],
  [(c) => P.h4Bear(c) && P.nearEma21At(c, 'high'), -1, 2.5],
  [(c) => P.h4Bull(c) && P.nearEma50At(c, 'low'), 1, 2.5],
  [(c) => P.h4Bear(c) && P.nearEma50At(c, 'high'), -1, 2.5],
  [(c) => P.h4Bull(c) && P.nearVwap(c), 1, 2],
  [(c) => P.h4Bear(c) && P.nearVwap(c), -1, 2],
  [(c) => P.h4Bull(c) && P.rsiOB(c), 0, 2],
  [(c) => P.h4Bear(c) && P.rsiOS(c), 0, 2]
]);

add('30.3', 'Daily Bias Filter', 30, { method: 'mtf-ema', stopMult: 1.2, rr: 2.3 }, [
  [(c) => P.d1Bull(c) && P.htfBull(c) && P.alignBull(c), 1, 3],
  [(c) => P.d1Bear(c) && P.htfBear(c) && P.alignBear(c), -1, 3],
  [(c) => P.d1Bull(c) && P.aboveEma200(c), 1, 2.5],
  [(c) => P.d1Bear(c) && P.belowEma200(c), -1, 2.5],
  [(c) => P.d1Bull(c) && P.ema50Above200(c), 1, 2.5],
  [(c) => P.d1Bear(c) && P.ema50Below200(c), -1, 2.5],
  [(c) => P.d1Bull(c) && P.htfBull(c), 1, 2],
  [(c) => P.d1Bear(c) && P.htfBear(c), -1, 2],
  [(c) => P.d1Bull(c) && P.htfBear(c), 0, 2.5],
  [(c) => P.d1Bear(c) && P.htfBull(c), 0, 2.5]
]);

add('30.4', 'MTF Cross Confirmation', 30, { method: 'mtf-ema', stopMult: 1.2, rr: 2.2 }, [
  [(c) => P.h4Bull(c) && P.ema8Above21(c) && P.macdHistRising(c), 1, 3],
  [(c) => P.h4Bear(c) && P.ema8Below21(c) && P.macdHistFalling(c), -1, 3],
  [(c) => P.htfBull(c) && P.ema21Above50(c), 1, 2.5],
  [(c) => P.htfBear(c) && P.ema21Below50(c), -1, 2.5],
  [(c) => P.h4Bull(c) && P.ema8Above21(c), 1, 2],
  [(c) => P.h4Bear(c) && P.ema8Below21(c), -1, 2],
  [(c) => P.htfBull(c) && P.ema8Above21(c), 1, 2],
  [(c) => P.htfBear(c) && P.ema8Below21(c), -1, 2],
  [(c) => P.h4Bull(c) && P.ema8Below21(c), 0, 2],
  [(c) => P.h4Bear(c) && P.ema8Above21(c), 0, 2]
]);

add('30.5', 'MTF Momentum Aligner', 30, { method: 'mtf-ema', stopMult: 1.2, rr: 2.2 }, [
  [(c) => P.h4Bull(c) && P.rsiBull(c) && P.macdHistRising(c), 1, 3],
  [(c) => P.h4Bear(c) && P.rsiBear(c) && P.macdHistFalling(c), -1, 3],
  [(c) => P.htfBull(c) && P.rsiAbove50(c), 1, 2.5],
  [(c) => P.htfBear(c) && P.rsiBelow50(c), -1, 2.5],
  [(c) => P.h4Bull(c) && P.stKAboveD(c), 1, 2],
  [(c) => P.h4Bear(c) && P.stKBelowD(c), -1, 2],
  [(c) => P.h4Bull(c) && P.momUp(c), 1, 2],
  [(c) => P.h4Bear(c) && P.momDown(c), -1, 2],
  [(c) => P.h4Bull(c) && P.rsiBear(c), 0, 2],
  [(c) => P.h4Bear(c) && P.rsiBull(c), 0, 2]
]);

add('30.6', 'MTF Breakout Validator', 30, { method: 'mtf-ema', stopMult: 1.1, rr: 2.0 }, [
  [(c) => P.rangeBreakUp(c) && P.h4Bull(c) && P.volSpike(c), 1, 3.5],
  [(c) => P.rangeBreakDn(c) && P.h4Bear(c) && P.volSpike(c), -1, 3.5],
  [(c) => P.brokeResistance(c) && P.htfBull(c), 1, 2.5],
  [(c) => P.brokeSupport(c) && P.htfBear(c), -1, 2.5],
  [(c) => P.bosUp(c) && P.h4Bull(c), 1, 2.5],
  [(c) => P.bosDn(c) && P.h4Bear(c), -1, 2.5],
  [(c) => P.rangeBreakUp(c) && P.allTfBull(c), 1, 3],
  [(c) => P.rangeBreakDn(c) && P.allTfBear(c), -1, 3],
  [(c) => P.rangeBreakUp(c) && P.h4Bear(c), 0, 2.5],
  [(c) => P.rangeBreakDn(c) && P.h4Bull(c), 0, 2.5]
]);

add('30.7', 'MTF Contrarian Reader', 30, { method: 'mtf-ema', stopMult: 1.3, rr: 2.5 }, [
  [(c) => P.htfBull(c) && P.rangeAtHigh(c) && P.rsiOB(c) && P.stOB(c), -1, 3],
  [(c) => P.htfBear(c) && P.rangeAtLow(c) && P.rsiOS(c) && P.stOS(c), 1, 3],
  [(c) => P.h4Bull(c) && P.atResistance(c) && P.pinBear(c), -1, 2.5],
  [(c) => P.h4Bear(c) && P.atSupport(c) && P.pinBull(c), 1, 2.5],
  [(c) => P.htfBull(c) && P.aboveBBUp(c) && P.deltaExtremePos(c), -1, 2.5],
  [(c) => P.htfBear(c) && P.belowBBLo(c) && P.deltaExtremeNeg(c), 1, 2.5],
  [(c) => P.h4Bull(c) && P.rangeFakeUp(c), -1, 2.5],
  [(c) => P.h4Bear(c) && P.rangeFakeDn(c), 1, 2.5],
  [(c) => P.htfBull(c) && P.atResistance(c), -1, 2],
  [(c) => P.htfBear(c) && P.atSupport(c), 1, 2]
]);

add('30.8', 'MTF VWAP Trader', 30, { method: 'mtf-ema', stopMult: 1.2, rr: 2.2 }, [
  [(c) => P.aboveVwap(c) && P.h4Bull(c) && P.aboveEma21(c), 1, 3],
  [(c) => P.belowVwap(c) && P.h4Bear(c) && P.belowEma21(c), -1, 3],
  [(c) => P.nearVwap(c) && P.h4Bull(c), 1, 2.5],
  [(c) => P.nearVwap(c) && P.h4Bear(c), -1, 2.5],
  [(c) => P.aboveVwap(c) && P.htfBull(c), 1, 2.5],
  [(c) => P.belowVwap(c) && P.htfBear(c), -1, 2.5],
  [(c) => P.aboveVwap(c) && P.h4Bull(c), 1, 2],
  [(c) => P.belowVwap(c) && P.h4Bear(c), -1, 2],
  [(c) => P.aboveVwap(c) && P.h4Bear(c), 0, 2],
  [(c) => P.belowVwap(c) && P.h4Bull(c), 0, 2]
]);

add('30.9', 'MTF Ribbon Alignment', 30, { method: 'mtf-ema', stopMult: 1.2, rr: 2.3 }, [
  [(c) => P.ribbonBull(c) && P.h4Bull(c) && P.htfBull(c), 1, 3],
  [(c) => P.ribbonBear(c) && P.h4Bear(c) && P.htfBear(c), -1, 3],
  [(c) => P.ribbonBull(c) && P.h4Bull(c), 1, 2.5],
  [(c) => P.ribbonBear(c) && P.h4Bear(c), -1, 2.5],
  [(c) => P.ribbonBull(c) && P.allTfBull(c), 1, 3],
  [(c) => P.ribbonBear(c) && P.allTfBear(c), -1, 3],
  [(c) => P.ribbonTight(c) && P.h4Bull(c), 1, 1.5],
  [(c) => P.ribbonTight(c) && P.h4Bear(c), -1, 1.5],
  [(c) => P.ribbonBull(c) && P.htfBear(c), 0, 2],
  [(c) => P.ribbonBear(c) && P.htfBull(c), 0, 2]
]);

add('30.10', 'MTF Final MA Confluencer', 30, { method: 'mtf-ema', stopMult: 1.2, rr: 2.4 }, [
  [(c) => P.allTfBull(c) && P.ribbonBull(c) && P.aboveVwap(c), 1, 3.5],
  [(c) => P.allTfBear(c) && P.ribbonBear(c) && P.belowVwap(c), -1, 3.5],
  [(c) => P.h4Bull(c) && P.htfBull(c) && P.aboveHull(c), 1, 2.5],
  [(c) => P.h4Bear(c) && P.htfBear(c) && P.belowHull(c), -1, 2.5],
  [(c) => P.h4Bull(c) && P.alignBull(c) && P.rsiBull(c), 1, 2.5],
  [(c) => P.h4Bear(c) && P.alignBear(c) && P.rsiBear(c), -1, 2.5],
  [(c) => P.d1Bull(c) && P.htfBull(c), 1, 2],
  [(c) => P.d1Bear(c) && P.htfBear(c), -1, 2],
  [(c) => P.h4Bull(c) && P.htfMixed(c), 0, 2],
  [(c) => P.h4Bear(c) && P.htfMixed(c), 0, 2]
]);

module.exports = { agents: require('./engine.js').agents };
