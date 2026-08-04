'use strict';

// ============================================================================
// PART C5 — AGENT SWARM: CATEGORIES 41–50 (Agents 41.1 – 50.10) = 100 agents
// Compiler Masters (Cats 41-46) + System Masters (Cats 47-50)
// Each agent: 10 rules → 1 vote (LONG/SHORT/NEUTRAL).
// ============================================================================

const { P, add } = require('./engine.js');

const price = (c) => c.price;
const atr = (c) => (c.ind ? c.ind.atr14 : null);

// ===================== CATEGORY 41: MTF ALIGNMENT MASTERS ==================
add('41.1', 'Full MTF Bull Aligner', 41, { method: 'mtf', stopMult: 1.2, rr: 2.3 }, [
  [(c) => P.allTfBull(c) && P.ribbonBull(c), 1, 3.5],
  [(c) => P.allTfBear(c) && P.ribbonBear(c), -1, 3.5],
  [(c) => P.h4Bull(c) && P.htfBull(c) && P.m5Bull(c), 1, 3],
  [(c) => P.h4Bear(c) && P.htfBear(c) && P.m5Bear(c), -1, 3],
  [(c) => P.h4Bull(c) && P.htfBull(c), 1, 2.5],
  [(c) => P.h4Bear(c) && P.htfBear(c), -1, 2.5],
  [(c) => P.allTfBull(c), 1, 2.5],
  [(c) => P.allTfBear(c), -1, 2.5],
  [(c) => P.mtfMixed(c), 0, 2.5],
  [(c) => P.h4Bull(c) && P.htfBear(c), 0, 2.5]
]);

add('41.2', 'MTF Structure Aligner', 41, { method: 'mtf', stopMult: 1.2, rr: 2.3 }, [
  [(c) => P.htfBull(c) && P.structUp(c) && P.bosUp(c), 1, 3.5],
  [(c) => P.htfBear(c) && P.structDn(c) && P.bosDn(c), -1, 3.5],
  [(c) => P.h4Bull(c) && P.structUp(c), 1, 3],
  [(c) => P.h4Bear(c) && P.structDn(c), -1, 3],
  [(c) => P.htfBull(c) && P.structUp(c), 1, 2.5],
  [(c) => P.htfBear(c) && P.structDn(c), -1, 2.5],
  [(c) => P.htfBull(c) && P.structNeutral(c), 1, 2],
  [(c) => P.htfBear(c) && P.structNeutral(c), -1, 2],
  [(c) => P.htfBull(c) && P.structDn(c), 0, 2.5],
  [(c) => P.htfBear(c) && P.structUp(c), 0, 2.5]
]);

add('41.3', 'MTF Pullback Framer', 41, { method: 'mtf', stopMult: 1.2, rr: 2.5 }, [
  [(c) => P.htfPullbackBuy(c) && P.m5Bull(c), 1, 3],
  [(c) => P.htfPullbackSell(c) && P.m5Bear(c), -1, 3],
  [(c) => P.htfPullbackBuy(c) && P.rsiAbove50(c), 1, 2.5],
  [(c) => P.htfPullbackSell(c) && P.rsiBelow50(c), -1, 2.5],
  [(c) => P.htfPullbackBuy(c) && P.macdHistRising(c), 1, 2.5],
  [(c) => P.htfPullbackSell(c) && P.macdHistFalling(c), -1, 2.5],
  [(c) => P.htfPullbackBuy(c), 1, 2],
  [(c) => P.htfPullbackSell(c), -1, 2],
  [(c) => P.htfPullbackBuy(c) && P.rsiOB(c), 0, 2.5],
  [(c) => P.htfPullbackSell(c) && P.rsiOS(c), 0, 2.5]
]);

add('41.4', 'MTF Momentum Aligner', 41, { method: 'mtf', stopMult: 1.2, rr: 2.2 }, [
  [(c) => P.h4Bull(c) && P.rsiBull(c) && P.macdHistRising(c), 1, 3],
  [(c) => P.h4Bear(c) && P.rsiBear(c) && P.macdHistFalling(c), -1, 3],
  [(c) => P.htfBull(c) && P.momUp(c), 1, 2.5],
  [(c) => P.htfBear(c) && P.momDown(c), -1, 2.5],
  [(c) => P.h4Bull(c) && P.stKAboveD(c), 1, 2],
  [(c) => P.h4Bear(c) && P.stKBelowD(c), -1, 2],
  [(c) => P.htfBull(c) && P.cciRising(c), 1, 2],
  [(c) => P.htfBear(c) && P.cciFalling(c), -1, 2],
  [(c) => P.h4Bull(c) && P.rsiBear(c), 0, 2.5],
  [(c) => P.h4Bear(c) && P.rsiBull(c), 0, 2.5]
]);

add('41.5', 'MTF Volume Aligner', 41, { method: 'mtf', stopMult: 1.1, rr: 2.0 }, [
  [(c) => P.htfBull(c) && P.volSpike(c) && P.upCandle(c), 1, 3],
  [(c) => P.htfBear(c) && P.volSpike(c) && P.downCandle(c), -1, 3],
  [(c) => P.h4Bull(c) && P.rvolHigh(c) && P.tapeBull(c), 1, 2.5],
  [(c) => P.h4Bear(c) && P.rvolHigh(c) && P.tapeBear(c), -1, 2.5],
  [(c) => P.htfBull(c) && P.deltaPos(c), 1, 2.5],
  [(c) => P.htfBear(c) && P.deltaNeg(c), -1, 2.5],
  [(c) => P.htfBull(c) && P.obvRising(c), 1, 2],
  [(c) => P.htfBear(c) && P.obvFalling(c), -1, 2],
  [(c) => P.htfBull(c) && P.volClimax(c), 0, 2.5],
  [(c) => P.htfBear(c) && P.volClimax(c), 0, 2.5]
]);

add('41.6', 'MTF S/R Aligner', 41, { method: 'mtf', stopMult: 1.2, rr: 2.3 }, [
  [(c) => P.htfBull(c) && P.atSupport(c), 1, 3],
  [(c) => P.htfBear(c) && P.atResistance(c), -1, 3],
  [(c) => P.htfBull(c) && P.nearSsl(c), 1, 2.5],
  [(c) => P.htfBear(c) && P.nearBsl(c), -1, 2.5],
  [(c) => P.h4Bull(c) && P.atPoc(c), 1, 2.5],
  [(c) => P.h4Bear(c) && P.atPoc(c), -1, 2.5],
  [(c) => P.htfBull(c) && P.atVal(c), 1, 2],
  [(c) => P.htfBear(c) && P.atVah(c), -1, 2],
  [(c) => P.htfBull(c) && P.atResistance(c), 0, 2.5],
  [(c) => P.htfBear(c) && P.atSupport(c), 0, 2.5]
]);

add('41.7', 'MTF Smart-Money Aligner', 41, { method: 'mtf', stopMult: 1.2, rr: 2.5 }, [
  [(c) => P.htfBull(c) && P.obBullNear(c), 1, 3],
  [(c) => P.htfBear(c) && P.obBearNear(c), -1, 3],
  [(c) => P.h4Bull(c) && P.belowFvg(c), 1, 2.5],
  [(c) => P.h4Bear(c) && P.aboveFvg(c), -1, 2.5],
  [(c) => P.htfBull(c) && P.breakerBull(c), 1, 2.5],
  [(c) => P.htfBear(c) && P.breakerBear(c), -1, 2.5],
  [(c) => P.htfBull(c) && P.sweptSsl(c), 1, 2.5],
  [(c) => P.htfBear(c) && P.sweptBsl(c), -1, 2.5],
  [(c) => P.htfBull(c) && P.voidBelow(c), 1, 2],
  [(c) => P.htfBear(c) && P.voidAbove(c), -1, 2]
]);

add('41.8', 'MTF Divergence Aligner', 41, { method: 'mtf', stopMult: 1.3, rr: 2.5 }, [
  [(c) => P.htfBull(c) && P.rsiDivBull(c), 1, 3],
  [(c) => P.htfBear(c) && P.rsiDivBear(c), -1, 3],
  [(c) => P.h4Bull(c) && P.rsiDivBull(c) && P.atSupport(c), 1, 3.5],
  [(c) => P.h4Bear(c) && P.rsiDivBear(c) && P.atResistance(c), -1, 3.5],
  [(c) => P.htfBull(c) && P.rsiDivBear(c), 0, 2.5],
  [(c) => P.htfBear(c) && P.rsiDivBull(c), 0, 2.5],
  [(c) => P.htfBull(c) && P.macdHistFalling(c), 0, 2],
  [(c) => P.htfBear(c) && P.macdHistRising(c), 0, 2],
  [(c) => P.h4Bull(c) && P.rsiDivBull(c), 1, 2.5],
  [(c) => P.h4Bear(c) && P.rsiDivBear(c), -1, 2.5]
]);

add('41.9', 'MTF Contrarian Aligner', 41, { method: 'mtf', stopMult: 1.3, rr: 2.5 }, [
  [(c) => P.htfBull(c) && P.rangeAtHigh(c) && P.rsiOB(c), -1, 3],
  [(c) => P.htfBear(c) && P.rangeAtLow(c) && P.rsiOS(c), 1, 3],
  [(c) => P.h4Bull(c) && P.aboveBBUp(c) && P.deltaExtremePos(c), -1, 3],
  [(c) => P.h4Bear(c) && P.belowBBLo(c) && P.deltaExtremeNeg(c), 1, 3],
  [(c) => P.htfBull(c) && P.fundingHigh(c), -1, 2.5],
  [(c) => P.htfBear(c) && P.fundingLow(c), 1, 2.5],
  [(c) => P.htfBull(c) && P.lsExtremeLong(c), -1, 2.5],
  [(c) => P.htfBear(c) && P.lsExtremeShort(c), 1, 2.5],
  [(c) => P.htfBull(c) && P.atResistance(c), -1, 2],
  [(c) => P.htfBear(c) && P.atSupport(c), 1, 2]
]);

add('41.10', 'MTF Final Directional Filter', 41, { method: 'mtf', stopMult: 1.2, rr: 2.3 }, [
  [(c) => P.h4Bull(c) && P.htfBull(c) && P.alignBull(c) && P.aboveVwap(c), 1, 3.5],
  [(c) => P.h4Bear(c) && P.htfBear(c) && P.alignBear(c) && P.belowVwap(c), -1, 3.5],
  [(c) => P.h4Bull(c) && P.htfBull(c) && P.alignBull(c), 1, 3],
  [(c) => P.h4Bear(c) && P.htfBear(c) && P.alignBear(c), -1, 3],
  [(c) => P.allTfBull(c) && P.alignBull(c), 1, 3],
  [(c) => P.allTfBear(c) && P.alignBear(c), -1, 3],
  [(c) => P.h4Bull(c) && P.alignBull(c), 1, 2.5],
  [(c) => P.h4Bear(c) && P.alignBear(c), -1, 2.5],
  [(c) => P.mtfMixed(c), 0, 2.5],
  [(c) => P.h4Bull(c) && P.htfBear(c), 0, 2.5]
]);

// ===================== CATEGORY 42: RISK MANAGEMENT MASTERS ================
add('42.1', 'Risk Per Trade Governor', 42, { method: 'risk', stopMult: 1.2, rr: 2.2 }, [
  [(c) => P.atrVeryHigh(c), 0, 3],
  [(c) => P.spreadWide(c), 0, 3],
  [(c) => P.vixSpiking(c), 0, 3],
  [(c) => P.sysStale(c), 0, 3],
  [(c) => P.atrHigh(c) && P.alignBull(c), 0, 2.5],
  [(c) => P.atrHigh(c) && P.alignBear(c), 0, 2.5],
  [(c) => P.atrNormal(c) && P.alignBull(c) && P.htfBull(c), 1, 2.5],
  [(c) => P.atrNormal(c) && P.alignBear(c) && P.htfBear(c), -1, 2.5],
  [(c) => P.atrNormal(c) && P.alignBull(c), 1, 2],
  [(c) => P.atrNormal(c) && P.alignBear(c), -1, 2]
]);

add('42.2', 'Stop Loss Placement Officer', 42, { method: 'risk', stopMult: 1.2, rr: 2.5 }, [
  [(c) => P.alignBull(c) && P.atSupport(c) && P.atrNormal(c), 1, 3],
  [(c) => P.alignBear(c) && P.atResistance(c) && P.atrNormal(c), -1, 3],
  [(c) => P.alignBull(c) && P.nearSsl(c), 1, 2.5],
  [(c) => P.alignBear(c) && P.nearBsl(c), -1, 2.5],
  [(c) => P.htfPullbackBuy(c) && P.atrNormal(c), 1, 2.5],
  [(c) => P.htfPullbackSell(c) && P.atrNormal(c), -1, 2.5],
  [(c) => P.alignBull(c) && P.atrVeryHigh(c), 0, 3],
  [(c) => P.alignBear(c) && P.atrVeryHigh(c), 0, 3],
  [(c) => P.alignBull(c) && P.atrNormal(c), 1, 2],
  [(c) => P.alignBear(c) && P.atrNormal(c), -1, 2]
]);

add('42.3', 'Take Profit Target Optimizer', 42, { method: 'risk', stopMult: 1.1, rr: 2.4 }, [
  [(c) => P.alignBull(c) && P.atResistance(c) && P.atrNormal(c), 1, 2.5],
  [(c) => P.alignBear(c) && P.atSupport(c) && P.atrNormal(c), -1, 2.5],
  [(c) => P.alignBull(c) && P.nearBsl(c), 1, 2.5],
  [(c) => P.alignBear(c) && P.nearSsl(c), -1, 2.5],
  [(c) => P.alignBull(c) && P.atVah(c), 1, 2.5],
  [(c) => P.alignBear(c) && P.atVal(c), -1, 2.5],
  [(c) => P.alignBull(c) && P.aboveVah(c), 0, 2.5],
  [(c) => P.alignBear(c) && P.belowVal(c), 0, 2.5],
  [(c) => P.alignBull(c) && P.atrNormal(c), 1, 2],
  [(c) => P.alignBear(c) && P.atrNormal(c), -1, 2]
]);

add('42.4', 'Max Loss Protector', 42, { method: 'risk', stopMult: 1.2, rr: 2.0 }, [
  [(c) => P.atrVeryHigh(c), 0, 3],
  [(c) => P.volClimax(c), 0, 3],
  [(c) => P.spreadWide(c), 0, 3],
  [(c) => P.vixSpiking(c), 0, 3],
  [(c) => P.sysVeryStale(c), 0, 3],
  [(c) => P.atrHigh(c) && P.alignBull(c), 0, 2.5],
  [(c) => P.atrHigh(c) && P.alignBear(c), 0, 2.5],
  [(c) => P.atrNormal(c) && P.alignBull(c) && P.htfBull(c), 1, 2],
  [(c) => P.atrNormal(c) && P.alignBear(c) && P.htfBear(c), -1, 2],
  [(c) => P.atrNormal(c) && P.alignMixed(c), 0, 2]
]);

add('42.5', 'Consecutive Loss Guard', 42, { method: 'risk', stopMult: 1.2, rr: 2.0 }, [
  [(c) => P.sysStale(c), 0, 3],
  [(c) => P.atrVeryHigh(c), 0, 3],
  [(c) => P.spreadWide(c), 0, 3],
  [(c) => P.alignMixed(c) && P.rangeTight(c), 0, 2.5],
  [(c) => P.atrNormal(c) && P.alignBull(c) && P.htfBull(c), 1, 2.5],
  [(c) => P.atrNormal(c) && P.alignBear(c) && P.htfBear(c), -1, 2.5],
  [(c) => P.atrNormal(c) && P.alignBull(c), 1, 2],
  [(c) => P.atrNormal(c) && P.alignBear(c), -1, 2],
  [(c) => P.atrHigh(c) && P.alignBull(c), 0, 2],
  [(c) => P.atrHigh(c) && P.alignBear(c), 0, 2]
]);

add('42.6', 'Position Concentration Limiter', 42, { method: 'risk', stopMult: 1.2, rr: 2.0 }, [
  [(c) => P.atrVeryHigh(c), 0, 3],
  [(c) => P.sysStale(c), 0, 3],
  [(c) => P.spreadWide(c), 0, 3],
  [(c) => P.alignBull(c) && P.atrNormal(c) && P.htfBull(c), 1, 2.5],
  [(c) => P.alignBear(c) && P.atrNormal(c) && P.htfBear(c), -1, 2.5],
  [(c) => P.alignBull(c) && P.atrNormal(c), 1, 2],
  [(c) => P.alignBear(c) && P.atrNormal(c), -1, 2],
  [(c) => P.alignBull(c) && P.atrHigh(c), 0, 2.5],
  [(c) => P.alignBear(c) && P.atrHigh(c), 0, 2.5],
  [(c) => P.alignMixed(c), 0, 2.5]
]);

add('42.7', 'Time-Based Risk Timer', 42, { method: 'risk', stopMult: 1.2, rr: 2.0 }, [
  [(c) => P.sessionYoung(c) && P.alignBull(c) && P.htfBull(c), 1, 2.5],
  [(c) => P.sessionYoung(c) && P.alignBear(c) && P.htfBear(c), -1, 2.5],
  [(c) => P.sessionMature(c) && P.rangeTight(c), 0, 2.5],
  [(c) => P.sessionMature(c) && P.adxWeak(c), 0, 2.5],
  [(c) => P.sessionYoung(c) && P.rangeAtHigh(c), -1, 2],
  [(c) => P.sessionYoung(c) && P.rangeAtLow(c), 1, 2],
  [(c) => P.sessionMature(c) && P.alignBull(c) && P.atrNormal(c), 1, 2],
  [(c) => P.sessionMature(c) && P.alignBear(c) && P.atrNormal(c), -1, 2],
  [(c) => P.sessionYoung(c) && P.volClimax(c), 0, 2.5],
  [(c) => P.sessionMature(c) && P.volClimax(c), 0, 2.5]
]);

add('42.8', 'News Event Risk Filter', 42, { method: 'risk', stopMult: 1.2, rr: 2.0 }, [
  [(c) => P.vixSpiking(c), 0, 3],
  [(c) => P.atrVeryHigh(c) && P.volClimax(c), 0, 3],
  [(c) => P.dxyUp(c) && P.atrVeryHigh(c), 0, 3],
  [(c) => P.dxyDown(c) && P.atrVeryHigh(c), 0, 3],
  [(c) => P.tnxUp(c) && P.atrHigh(c), 0, 2.5],
  [(c) => P.tnxDown(c) && P.atrHigh(c), 0, 2.5],
  [(c) => P.vixCalm(c) && P.atrNormal(c) && P.alignBull(c), 1, 2],
  [(c) => P.vixCalm(c) && P.atrNormal(c) && P.alignBear(c), -1, 2],
  [(c) => P.atrNormal(c) && P.alignBull(c) && P.htfBull(c), 1, 2],
  [(c) => P.atrNormal(c) && P.alignBear(c) && P.htfBear(c), -1, 2]
]);

add('42.9', 'Drawdown Rebalancer', 42, { method: 'risk', stopMult: 1.2, rr: 2.0 }, [
  [(c) => P.sysStale(c), 0, 3],
  [(c) => P.sysVeryStale(c), 0, 3],
  [(c) => P.atrVeryHigh(c), 0, 3],
  [(c) => P.volClimax(c), 0, 3],
  [(c) => P.atrNormal(c) && P.alignBull(c) && P.htfBull(c) && P.spreadTight(c), 1, 3],
  [(c) => P.atrNormal(c) && P.alignBear(c) && P.htfBear(c) && P.spreadTight(c), -1, 3],
  [(c) => P.atrNormal(c) && P.alignBull(c), 1, 2],
  [(c) => P.atrNormal(c) && P.alignBear(c), -1, 2],
  [(c) => P.spreadWide(c), 0, 2.5],
  [(c) => P.alignMixed(c), 0, 2.5]
]);

add('42.10', 'Risk Governor Final Authority', 42, { method: 'risk', stopMult: 1.2, rr: 2.2 }, [
  [(c) => P.atrVeryHigh(c) || P.spreadWide(c) || P.sysStale(c), 0, 3.5],
  [(c) => P.vixSpiking(c), 0, 3],
  [(c) => P.atrHigh(c), 0, 2.5],
  [(c) => P.atrNormal(c) && P.alignBull(c) && P.htfBull(c) && P.spreadTight(c) && P.adxStrong(c), 1, 3.5],
  [(c) => P.atrNormal(c) && P.alignBear(c) && P.htfBear(c) && P.spreadTight(c) && P.adxStrong(c), -1, 3.5],
  [(c) => P.atrNormal(c) && P.alignBull(c) && P.htfBull(c), 1, 2.5],
  [(c) => P.atrNormal(c) && P.alignBear(c) && P.htfBear(c), -1, 2.5],
  [(c) => P.atrNormal(c) && P.alignBull(c), 1, 2],
  [(c) => P.atrNormal(c) && P.alignBear(c), -1, 2],
  [(c) => P.alignMixed(c), 0, 2.5]
]);

// ===================== CATEGORY 43: SESSION MASTERS ========================
add('43.1', 'London Open Momentum Trader', 43, { method: 'session', stopMult: 1.2, rr: 2.3 }, [
  [(c) => P.london(c) && P.sessionYoung(c) && P.htfBull(c), 1, 3],
  [(c) => P.london(c) && P.sessionYoung(c) && P.htfBear(c), -1, 3],
  [(c) => P.london(c) && P.sessionYoung(c) && P.rsiBull(c), 1, 2.5],
  [(c) => P.london(c) && P.sessionYoung(c) && P.rsiBear(c), -1, 2.5],
  [(c) => P.london(c) && P.volSpike(c) && P.upCandle(c), 1, 2.5],
  [(c) => P.london(c) && P.volSpike(c) && P.downCandle(c), -1, 2.5],
  [(c) => P.london(c) && P.sessionYoung(c), 1, 2],
  [(c) => P.london(c) && P.sessionYoung(c), -1, 2],
  [(c) => P.london(c) && P.rangeTight(c), 0, 2.5],
  [(c) => P.london(c) && P.adxWeak(c), 0, 2]
]);

add('43.2', 'New York Open Momentum Trader', 43, { method: 'session', stopMult: 1.2, rr: 2.3 }, [
  [(c) => P.newyork(c) && P.sessionYoung(c) && P.htfBull(c), 1, 3],
  [(c) => P.newyork(c) && P.sessionYoung(c) && P.htfBear(c), -1, 3],
  [(c) => P.newyork(c) && P.sessionYoung(c) && P.rsiBull(c), 1, 2.5],
  [(c) => P.newyork(c) && P.sessionYoung(c) && P.rsiBear(c), -1, 2.5],
  [(c) => P.newyork(c) && P.volSpike(c) && P.upCandle(c), 1, 2.5],
  [(c) => P.newyork(c) && P.volSpike(c) && P.downCandle(c), -1, 2.5],
  [(c) => P.nyLondonOverlap(c) && P.htfBull(c), 1, 3],
  [(c) => P.nyLondonOverlap(c) && P.htfBear(c), -1, 3],
  [(c) => P.newyork(c) && P.rangeTight(c), 0, 2.5],
  [(c) => P.newyork(c) && P.adxWeak(c), 0, 2]
]);

add('43.3', 'Asia Session Range Trader', 43, { method: 'session', stopMult: 1.3, rr: 2.4 }, [
  [(c) => P.asia(c) && P.rangeAtHigh(c) && P.rsiOB(c), -1, 3],
  [(c) => P.asia(c) && P.rangeAtLow(c) && P.rsiOS(c), 1, 3],
  [(c) => P.asia(c) && P.rangeAtHigh(c) && P.stOB(c), -1, 2.5],
  [(c) => P.asia(c) && P.rangeAtLow(c) && P.stOS(c), 1, 2.5],
  [(c) => P.asia(c) && P.rangeAtHigh(c), -1, 2],
  [(c) => P.asia(c) && P.rangeAtLow(c), 1, 2],
  [(c) => P.asia(c) && P.rangeAtMid(c), 0, 2.5],
  [(c) => P.asia(c) && P.adxStrong(c), 0, 2.5],
  [(c) => P.asia(c) && P.rangeActive(c), 0, 2.5],
  [(c) => P.asia(c) && P.rangeBreakUp(c), 0, 2.5]
]);

add('43.4', 'Session Volatility Adjuster', 43, { method: 'session', stopMult: 1.2, rr: 2.0 }, [
  [(c) => P.nyLondonOverlap(c) && P.atrNormal(c) && P.alignBull(c), 1, 3],
  [(c) => P.nyLondonOverlap(c) && P.atrNormal(c) && P.alignBear(c), -1, 3],
  [(c) => P.london(c) && P.atrHigh(c) && P.alignBull(c), 1, 2.5],
  [(c) => P.london(c) && P.atrHigh(c) && P.alignBear(c), -1, 2.5],
  [(c) => P.asia(c) && P.atrLow(c), 0, 2.5],
  [(c) => P.newyork(c) && P.atrVeryHigh(c), 0, 2.5],
  [(c) => P.asia(c) && P.rangeTight(c), 0, 2.5],
  [(c) => P.nyLondonOverlap(c) && P.adxWeak(c), 0, 2.5],
  [(c) => P.london(c) && P.atrNormal(c) && P.alignBull(c), 1, 2],
  [(c) => P.london(c) && P.atrNormal(c) && P.alignBear(c), -1, 2]
]);

add('43.5', 'Session Breakout Trader', 43, { method: 'session', stopMult: 1.1, rr: 2.0 }, [
  [(c) => P.london(c) && P.sessionYoung(c) && P.rangeBreakUp(c), 1, 3.5],
  [(c) => P.london(c) && P.sessionYoung(c) && P.rangeBreakDn(c), -1, 3.5],
  [(c) => P.newyork(c) && P.sessionYoung(c) && P.rangeBreakUp(c), 1, 3.5],
  [(c) => P.newyork(c) && P.sessionYoung(c) && P.rangeBreakDn(c), -1, 3.5],
  [(c) => P.newyork(c) && P.brokeResistance(c) && P.volSpike(c), 1, 3],
  [(c) => P.newyork(c) && P.brokeSupport(c) && P.volSpike(c), -1, 3],
  [(c) => P.london(c) && P.brokeResistance(c) && P.volSpike(c), 1, 3],
  [(c) => P.london(c) && P.brokeSupport(c) && P.volSpike(c), -1, 3],
  [(c) => P.asia(c) && P.rangeBreakUp(c), 0, 2.5],
  [(c) => P.asia(c) && P.rangeBreakDn(c), 0, 2.5]
]);

add('43.6', 'Session Fade Trader', 43, { method: 'session', stopMult: 1.3, rr: 2.4 }, [
  [(c) => P.sessionMature(c) && P.rangeAtHigh(c) && P.rsiOB(c), -1, 3],
  [(c) => P.sessionMature(c) && P.rangeAtLow(c) && P.rsiOS(c), 1, 3],
  [(c) => P.asia(c) && P.rangeAtHigh(c) && P.volClimax(c), -1, 2.5],
  [(c) => P.asia(c) && P.rangeAtLow(c) && P.volClimax(c), 1, 2.5],
  [(c) => P.sessionMature(c) && P.atResistance(c) && P.pinBear(c), -1, 2.5],
  [(c) => P.sessionMature(c) && P.atSupport(c) && P.pinBull(c), 1, 2.5],
  [(c) => P.sessionMature(c) && P.rangeAtHigh(c), -1, 2],
  [(c) => P.sessionMature(c) && P.rangeAtLow(c), 1, 2],
  [(c) => P.sessionMature(c) && P.adxStrong(c), 0, 2.5],
  [(c) => P.sessionMature(c) && P.structUp(c), 0, 2]
]);

add('43.7', 'Session Liquidity Trader', 43, { method: 'session', stopMult: 1.2, rr: 2.4 }, [
  [(c) => P.london(c) && P.sessionYoung(c) && P.sweptSsl(c), 1, 3],
  [(c) => P.london(c) && P.sessionYoung(c) && P.sweptBsl(c), -1, 3],
  [(c) => P.newyork(c) && P.sessionYoung(c) && P.eqLowsSwept(c), 1, 3],
  [(c) => P.newyork(c) && P.sessionYoung(c) && P.eqHighsSwept(c), -1, 3],
  [(c) => P.london(c) && P.nearSsl(c) && P.htfBull(c), 1, 2.5],
  [(c) => P.london(c) && P.nearBsl(c) && P.htfBear(c), -1, 2.5],
  [(c) => P.newyork(c) && P.sweptSsl(c) && P.volClimax(c), 1, 2.5],
  [(c) => P.newyork(c) && P.sweptBsl(c) && P.volClimax(c), -1, 2.5],
  [(c) => P.asia(c) && P.rangeAtHigh(c) && P.nearBsl(c), -1, 2],
  [(c) => P.asia(c) && P.rangeAtLow(c) && P.nearSsl(c), 1, 2]
]);

add('43.8', 'Session Smart-Money Trader', 43, { method: 'session', stopMult: 1.2, rr: 2.4 }, [
  [(c) => P.nyLondonOverlap(c) && P.obBullNear(c), 1, 3],
  [(c) => P.nyLondonOverlap(c) && P.obBearNear(c), -1, 3],
  [(c) => P.london(c) && P.sessionYoung(c) && P.induceBull(c), 1, 3],
  [(c) => P.london(c) && P.sessionYoung(c) && P.induceBear(c), -1, 3],
  [(c) => P.newyork(c) && P.belowFvg(c), 1, 2.5],
  [(c) => P.newyork(c) && P.aboveFvg(c), -1, 2.5],
  [(c) => P.london(c) && P.breakerBull(c), 1, 2.5],
  [(c) => P.london(c) && P.breakerBear(c), -1, 2.5],
  [(c) => P.asia(c) && P.rangeAtHigh(c) && P.obBearNear(c), -1, 2],
  [(c) => P.asia(c) && P.rangeAtLow(c) && P.obBullNear(c), 1, 2]
]);

add('43.9', 'Session VWAP Reversion Trader', 43, { method: 'session', stopMult: 1.2, rr: 2.3 }, [
  [(c) => P.newyork(c) && P.nearVwap(c) && P.htfBull(c), 1, 3],
  [(c) => P.newyork(c) && P.nearVwap(c) && P.htfBear(c), -1, 3],
  [(c) => P.london(c) && P.nearVwap(c) && P.rsiBull(c), 1, 2.5],
  [(c) => P.london(c) && P.nearVwap(c) && P.rsiBear(c), -1, 2.5],
  [(c) => P.london(c) && P.aboveVwap(c) && P.htfBull(c), 1, 2],
  [(c) => P.london(c) && P.belowVwap(c) && P.htfBear(c), -1, 2],
  [(c) => P.asia(c) && P.aboveVwap(c) && P.htfBull(c), 1, 1.5],
  [(c) => P.asia(c) && P.belowVwap(c) && P.htfBear(c), -1, 1.5],
  [(c) => P.asia(c) && P.nearVwap(c), 0, 2],
  [(c) => P.sessionMature(c) && P.nearVwap(c), 0, 2]
]);

add('43.10', 'Session Global Market Aligner', 43, { method: 'session', stopMult: 1.2, rr: 2.2 }, [
  [(c) => P.nyLondonOverlap(c) && P.dxyDown(c) && P.htfBull(c), 1, 3],
  [(c) => P.nyLondonOverlap(c) && P.dxyUp(c) && P.htfBear(c), -1, 3],
  [(c) => P.london(c) && P.tnxDown(c) && P.htfBull(c), 1, 2.5],
  [(c) => P.london(c) && P.tnxUp(c) && P.htfBear(c), -1, 2.5],
  [(c) => P.newyork(c) && P.silverUp(c) && P.alignBull(c), 1, 2.5],
  [(c) => P.newyork(c) && P.silverDown(c) && P.alignBear(c), -1, 2.5],
  [(c) => P.london(c) && P.vixSpiking(c), 0, 3],
  [(c) => P.newyork(c) && P.vixCalm(c) && P.alignBull(c), 1, 2],
  [(c) => P.newyork(c) && P.vixCalm(c) && P.alignBear(c), -1, 2],
  [(c) => P.london(c) && P.vixCalm(c), 0, 2]
]);

// ===================== CATEGORY 44: DERIVATIVES MASTERS ====================
add('44.1', 'Open Interest Trend Trader', 44, { method: 'deriv', stopMult: 1.2, rr: 2.2 }, [
  [(c) => P.oiRising(c) && P.htfBull(c) && P.alignBull(c), 1, 3],
  [(c) => P.oiFalling(c) && P.htfBear(c) && P.alignBear(c), -1, 3],
  [(c) => P.oiRising(c) && P.structUp(c), 1, 2.5],
  [(c) => P.oiFalling(c) && P.structDn(c), -1, 2.5],
  [(c) => P.oiRising(c) && P.aboveEma21(c), 1, 2],
  [(c) => P.oiFalling(c) && P.belowEma21(c), -1, 2],
  [(c) => P.oiRising(c) && P.rsiBull(c), 1, 2],
  [(c) => P.oiFalling(c) && P.rsiBear(c), -1, 2],
  [(c) => P.oiFlat(c), 0, 2],
  [(c) => P.oiRising(c) && P.htfBear(c), 0, 2.5]
]);

add('44.2', 'Open Interest Divergence Trader', 44, { method: 'deriv', stopMult: 1.3, rr: 2.5 }, [
  [(c) => P.oiFalling(c) && P.priceRising(c) && P.rsiOB(c), -1, 3.5],
  [(c) => P.oiRising(c) && P.priceFalling(c) && P.rsiOS(c), 1, 3.5],
  [(c) => P.oiFalling(c) && P.priceRising(c), -1, 2.5],
  [(c) => P.oiRising(c) && P.priceFalling(c), 1, 2.5],
  [(c) => P.oiDrop(c) && P.volClimax(c), 0, 3],
  [(c) => P.oiSpike(c) && P.volClimax(c), 0, 3],
  [(c) => P.oiRising(c) && P.rsiOB(c) && P.alignBull(c), 0, 2.5],
  [(c) => P.oiFalling(c) && P.rsiOS(c) && P.alignBear(c), 0, 2.5],
  [(c) => P.oiDrop(c) && P.rangeBreakUp(c), 0, 2.5],
  [(c) => P.oiSpike(c) && P.rangeBreakUp(c), 1, 2]
]);

add('44.3', 'Long/Short Ratio Trader', 44, { method: 'deriv', stopMult: 1.2, rr: 2.2 }, [
  [(c) => P.lsLong(c) && P.htfBull(c) && P.alignBull(c), 1, 3],
  [(c) => P.lsShort(c) && P.htfBear(c) && P.alignBear(c), -1, 3],
  [(c) => P.lsRising(c) && P.htfBull(c), 1, 2.5],
  [(c) => P.lsFalling(c) && P.htfBear(c), -1, 2.5],
  [(c) => P.lsExtremeLong(c) && P.rsiOB(c), -1, 3],
  [(c) => P.lsExtremeShort(c) && P.rsiOS(c), 1, 3],
  [(c) => P.lsRising(c) && P.alignBull(c), 1, 2],
  [(c) => P.lsFalling(c) && P.alignBear(c), -1, 2],
  [(c) => P.lsExtremeLong(c), 0, 2.5],
  [(c) => P.lsExtremeShort(c), 0, 2.5]
]);

add('44.4', 'Top Trader Position Follower', 44, { method: 'deriv', stopMult: 1.2, rr: 2.2 }, [
  [(c) => P.topTraderLong(c) && P.htfBull(c), 1, 3],
  [(c) => P.topTraderShort(c) && P.htfBear(c), -1, 3],
  [(c) => P.topTraderLong(c) && P.alignBull(c), 1, 2.5],
  [(c) => P.topTraderShort(c) && P.alignBear(c), -1, 2.5],
  [(c) => P.topTraderLong(c) && P.rsiBull(c), 1, 2],
  [(c) => P.topTraderShort(c) && P.rsiBear(c), -1, 2],
  [(c) => P.topTraderLong(c) && P.oiRising(c), 1, 2.5],
  [(c) => P.topTraderShort(c) && P.oiRising(c), -1, 2.5],
  [(c) => P.topTraderLong(c) && P.htfBear(c), 0, 2.5],
  [(c) => P.topTraderShort(c) && P.htfBull(c), 0, 2.5]
]);

add('44.5', 'Taker Aggression Trader', 44, { method: 'deriv', stopMult: 1.1, rr: 2.0 }, [
  [(c) => P.takerBuyHeavy(c) && P.htfBull(c) && P.upCandle(c), 1, 3],
  [(c) => P.takerSellHeavy(c) && P.htfBear(c) && P.downCandle(c), -1, 3],
  [(c) => P.takerBuyHeavy(c) && P.rangeBreakUp(c), 1, 2.5],
  [(c) => P.takerSellHeavy(c) && P.rangeBreakDn(c), -1, 2.5],
  [(c) => P.takerBuyHeavy(c) && P.rsiBull(c), 1, 2],
  [(c) => P.takerSellHeavy(c) && P.rsiBear(c), -1, 2],
  [(c) => P.takerBuyHeavy(c) && P.alignBull(c), 1, 2],
  [(c) => P.takerSellHeavy(c) && P.alignBear(c), -1, 2],
  [(c) => P.takerBuyHeavy(c) && P.rsiOB(c), 0, 2.5],
  [(c) => P.takerSellHeavy(c) && P.rsiOS(c), 0, 2.5]
]);

add('44.6', 'Basis Arbitrage Trader', 44, { method: 'deriv', stopMult: 1.2, rr: 2.0 }, [
  [(c) => P.basisPos(c) && P.htfBull(c), 1, 2.5],
  [(c) => P.basisNeg(c) && P.htfBear(c), -1, 2.5],
  [(c) => P.basisWide(c) && P.rsiOB(c), -1, 2.5],
  [(c) => P.basisWide(c) && P.rsiOS(c), 1, 2.5],
  [(c) => P.basisPos(c) && P.alignBull(c), 1, 2],
  [(c) => P.basisNeg(c) && P.alignBear(c), -1, 2],
  [(c) => P.basisWide(c), 0, 2.5],
  [(c) => P.spotPremium(c) && P.htfBear(c), -1, 2],
  [(c) => P.spotDiscount(c) && P.htfBull(c), 1, 2],
  [(c) => P.basisPos(c) && P.basisWide(c), 0, 2.5]
]);

add('44.7', 'Derivatives Divergence Hunter', 44, { method: 'deriv', stopMult: 1.3, rr: 2.5 }, [
  [(c) => P.oiFalling(c) && P.priceRising(c) && P.takerSellHeavy(c), -1, 3.5],
  [(c) => P.oiRising(c) && P.priceFalling(c) && P.takerBuyHeavy(c), 1, 3.5],
  [(c) => P.lsExtremeLong(c) && P.fundingHigh(c) && P.rsiOB(c), -1, 3.5],
  [(c) => P.lsExtremeShort(c) && P.fundingLow(c) && P.rsiOS(c), 1, 3.5],
  [(c) => P.oiFalling(c) && P.volClimax(c) && P.upCandle(c), -1, 3],
  [(c) => P.oiFalling(c) && P.volClimax(c) && P.downCandle(c), 1, 3],
  [(c) => P.topTraderLong(c) && P.lsExtremeLong(c), 0, 2.5],
  [(c) => P.topTraderShort(c) && P.lsExtremeShort(c), 0, 2.5],
  [(c) => P.oiRising(c) && P.fundingHigh(c), 1, 2],
  [(c) => P.oiFalling(c) && P.fundingLow(c), -1, 2]
]);

add('44.8', 'Derivatives Confirmation Trader', 44, { method: 'deriv', stopMult: 1.2, rr: 2.2 }, [
  [(c) => P.oiRising(c) && P.lsLong(c) && P.topTraderLong(c) && P.htfBull(c), 1, 3.5],
  [(c) => P.oiFalling(c) && P.lsShort(c) && P.topTraderShort(c) && P.htfBear(c), -1, 3.5],
  [(c) => P.oiRising(c) && P.takerBuyHeavy(c), 1, 2.5],
  [(c) => P.oiFalling(c) && P.takerSellHeavy(c), -1, 2.5],
  [(c) => P.lsLong(c) && P.takerBuyHeavy(c), 1, 2],
  [(c) => P.lsShort(c) && P.takerSellHeavy(c), -1, 2],
  [(c) => P.topTraderLong(c) && P.oiRising(c), 1, 2.5],
  [(c) => P.topTraderShort(c) && P.oiFalling(c), -1, 2.5],
  [(c) => P.lsExtremeLong(c) && P.oiRising(c), 0, 2.5],
  [(c) => P.lsExtremeShort(c) && P.oiFalling(c), 0, 2.5]
]);

add('44.9', 'Derivatives Multi-Timeframe Sync', 44, { method: 'deriv', stopMult: 1.2, rr: 2.2 }, [
  [(c) => P.oiRising(c) && P.h4Bull(c) && P.htfBull(c), 1, 3],
  [(c) => P.oiFalling(c) && P.h4Bear(c) && P.htfBear(c), -1, 3],
  [(c) => P.oiRising(c) && P.allTfBull(c), 1, 3],
  [(c) => P.oiFalling(c) && P.allTfBear(c), -1, 3],
  [(c) => P.lsLong(c) && P.htfBull(c), 1, 2],
  [(c) => P.lsShort(c) && P.htfBear(c), -1, 2],
  [(c) => P.takerBuyHeavy(c) && P.htfBull(c), 1, 2],
  [(c) => P.takerSellHeavy(c) && P.htfBear(c), -1, 2],
  [(c) => P.oiRising(c) && P.htfBear(c), 0, 2.5],
  [(c) => P.oiFalling(c) && P.htfBull(c), 0, 2.5]
]);

add('44.10', 'Derivatives Exhaustion Reader', 44, { method: 'deriv', stopMult: 1.3, rr: 2.5 }, [
  [(c) => P.oiSpike(c) && P.volClimax(c) && P.rsiOB(c), -1, 3.5],
  [(c) => P.oiDrop(c) && P.volClimax(c) && P.rsiOS(c), 1, 3.5],
  [(c) => P.lsExtremeLong(c) && P.fundingExtremePos(c), -1, 3.5],
  [(c) => P.lsExtremeShort(c) && P.fundingExtremeNeg(c), 1, 3.5],
  [(c) => P.oiSpike(c) && P.upCandle(c) && P.rangeAtHigh(c), -1, 3],
  [(c) => P.oiDrop(c) && P.downCandle(c) && P.rangeAtLow(c), 1, 3],
  [(c) => P.takerBuyHeavy(c) && P.macdHistFalling(c), -1, 2.5],
  [(c) => P.takerSellHeavy(c) && P.macdHistRising(c), 1, 2.5],
  [(c) => P.oiSpike(c) && P.atrVeryHigh(c), 0, 3],
  [(c) => P.oiDrop(c) && P.atrVeryHigh(c), 0, 3]
]);

// ===================== CATEGORY 45: FUNDING MASTERS ========================
add('45.1', 'Funding Rate Trend Trader', 45, { method: 'funding', stopMult: 1.2, rr: 2.2 }, [
  [(c) => P.fundingRising(c) && P.htfBull(c) && P.alignBull(c), 1, 3],
  [(c) => P.fundingFalling(c) && P.htfBear(c) && P.alignBear(c), -1, 3],
  [(c) => P.fundingAboveMa8(c) && P.htfBull(c), 1, 2.5],
  [(c) => P.fundingBelowMa8(c) && P.htfBear(c), -1, 2.5],
  [(c) => P.fundingRising(c) && P.alignBull(c), 1, 2],
  [(c) => P.fundingFalling(c) && P.alignBear(c), -1, 2],
  [(c) => P.fundingRising(c) && P.structUp(c), 1, 2],
  [(c) => P.fundingFalling(c) && P.structDn(c), -1, 2],
  [(c) => P.fundingRising(c) && P.htfBear(c), 0, 2.5],
  [(c) => P.fundingFalling(c) && P.htfBull(c), 0, 2.5]
]);

add('45.2', 'Funding Extreme Contrarian', 45, { method: 'funding', stopMult: 1.3, rr: 2.5 }, [
  [(c) => P.fundingExtremePos(c) && P.rsiOB(c), -1, 3.5],
  [(c) => P.fundingExtremeNeg(c) && P.rsiOS(c), 1, 3.5],
  [(c) => P.fundingExtremePos(c) && P.volClimax(c), -1, 3],
  [(c) => P.fundingExtremeNeg(c) && P.volClimax(c), 1, 3],
  [(c) => P.fundingExtremePos(c) && P.aboveBBUp(c), -1, 3],
  [(c) => P.fundingExtremeNeg(c) && P.belowBBLo(c), 1, 3],
  [(c) => P.fundingExtremePos(c) && P.lsExtremeLong(c), -1, 3],
  [(c) => P.fundingExtremeNeg(c) && P.lsExtremeShort(c), 1, 3],
  [(c) => P.fundingExtremePos(c) && P.htfBull(c), 0, 2.5],
  [(c) => P.fundingExtremeNeg(c) && P.htfBear(c), 0, 2.5]
]);

add('45.3', 'Funding Flip Trader', 45, { method: 'funding', stopMult: 1.2, rr: 2.4 }, [
  [(c) => P.fundingFlipUp(c) && P.htfBull(c), 1, 3],
  [(c) => P.fundingFlipDn(c) && P.htfBear(c), -1, 3],
  [(c) => P.fundingFlipUp(c) && P.alignBull(c), 1, 2.5],
  [(c) => P.fundingFlipDn(c) && P.alignBear(c), -1, 2.5],
  [(c) => P.fundingFlipUp(c) && P.macdHistRising(c), 1, 2.5],
  [(c) => P.fundingFlipDn(c) && P.macdHistFalling(c), -1, 2.5],
  [(c) => P.fundingFlipUp(c) && P.rsiAbove50(c), 1, 2],
  [(c) => P.fundingFlipDn(c) && P.rsiBelow50(c), -1, 2],
  [(c) => P.fundingFlipUp(c) && P.htfBear(c), 0, 2.5],
  [(c) => P.fundingFlipDn(c) && P.htfBull(c), 0, 2.5]
]);

add('45.4', 'Funding + OI Confluence', 45, { method: 'funding', stopMult: 1.2, rr: 2.3 }, [
  [(c) => P.fundingRising(c) && P.oiRising(c) && P.htfBull(c), 1, 3.5],
  [(c) => P.fundingFalling(c) && P.oiFalling(c) && P.htfBear(c), -1, 3.5],
  [(c) => P.fundingRising(c) && P.oiRising(c), 1, 2.5],
  [(c) => P.fundingFalling(c) && P.oiFalling(c), -1, 2.5],
  [(c) => P.fundingHigh(c) && P.oiSpike(c), -1, 3],
  [(c) => P.fundingLow(c) && P.oiDrop(c), 1, 3],
  [(c) => P.fundingRising(c) && P.oiFalling(c), 0, 2.5],
  [(c) => P.fundingFalling(c) && P.oiRising(c), 0, 2.5],
  [(c) => P.fundingHigh(c) && P.oiRising(c), 1, 2],
  [(c) => P.fundingLow(c) && P.oiFalling(c), -1, 2]
]);

add('45.5', 'Funding + Long/Short Ratio', 45, { method: 'funding', stopMult: 1.2, rr: 2.3 }, [
  [(c) => P.fundingRising(c) && P.lsRising(c) && P.htfBull(c), 1, 3],
  [(c) => P.fundingFalling(c) && P.lsFalling(c) && P.htfBear(c), -1, 3],
  [(c) => P.fundingHigh(c) && P.lsExtremeLong(c), -1, 3],
  [(c) => P.fundingLow(c) && P.lsExtremeShort(c), 1, 3],
  [(c) => P.fundingRising(c) && P.lsLong(c), 1, 2],
  [(c) => P.fundingFalling(c) && P.lsShort(c), -1, 2],
  [(c) => P.fundingRising(c) && P.lsExtremeLong(c), 0, 2.5],
  [(c) => P.fundingFalling(c) && P.lsExtremeShort(c), 0, 2.5],
  [(c) => P.fundingRising(c) && P.topTraderLong(c), 1, 2],
  [(c) => P.fundingFalling(c) && P.topTraderShort(c), -1, 2]
]);

add('45.6', 'Funding MA Position Trader', 45, { method: 'funding', stopMult: 1.2, rr: 2.2 }, [
  [(c) => P.fundingAboveMa8(c) && P.alignBull(c) && P.htfBull(c), 1, 3],
  [(c) => P.fundingBelowMa8(c) && P.alignBear(c) && P.htfBear(c), -1, 3],
  [(c) => P.fundingAboveMa8(c) && P.aboveEma21(c), 1, 2.5],
  [(c) => P.fundingBelowMa8(c) && P.belowEma21(c), -1, 2.5],
  [(c) => P.fundingAboveMa8(c) && P.rsiBull(c), 1, 2],
  [(c) => P.fundingBelowMa8(c) && P.rsiBear(c), -1, 2],
  [(c) => P.fundingAboveMa8(c) && P.structUp(c), 1, 2],
  [(c) => P.fundingBelowMa8(c) && P.structDn(c), -1, 2],
  [(c) => P.fundingAboveMa8(c) && P.htfBear(c), 0, 2.5],
  [(c) => P.fundingBelowMa8(c) && P.htfBull(c), 0, 2.5]
]);

add('45.7', 'Funding Sustained Bias Trader', 45, { method: 'funding', stopMult: 1.2, rr: 2.2 }, [
  [(c) => P.fundingSustainedPos(c) && P.htfBull(c) && P.alignBull(c), 1, 3],
  [(c) => P.fundingSustainedNeg(c) && P.htfBear(c) && P.alignBear(c), -1, 3],
  [(c) => P.fundingSustainedPos(c) && P.aboveVwap(c), 1, 2.5],
  [(c) => P.fundingSustainedNeg(c) && P.belowVwap(c), -1, 2.5],
  [(c) => P.fundingSustainedPos(c) && P.macdHistRising(c), 1, 2],
  [(c) => P.fundingSustainedNeg(c) && P.macdHistFalling(c), -1, 2],
  [(c) => P.fundingSustainedPos(c) && P.rsiAbove50(c), 1, 2],
  [(c) => P.fundingSustainedNeg(c) && P.rsiBelow50(c), -1, 2],
  [(c) => P.fundingSustainedPos(c) && P.rsiOB(c), 0, 2.5],
  [(c) => P.fundingSustainedNeg(c) && P.rsiOS(c), 0, 2.5]
]);

add('45.8', 'Funding + Volume Trader', 45, { method: 'funding', stopMult: 1.1, rr: 2.0 }, [
  [(c) => P.fundingRising(c) && P.volSpike(c) && P.upCandle(c), 1, 3],
  [(c) => P.fundingFalling(c) && P.volSpike(c) && P.downCandle(c), -1, 3],
  [(c) => P.fundingRising(c) && P.tapeBull(c), 1, 2.5],
  [(c) => P.fundingFalling(c) && P.tapeBear(c), -1, 2.5],
  [(c) => P.fundingRising(c) && P.deltaPos(c), 1, 2],
  [(c) => P.fundingFalling(c) && P.deltaNeg(c), -1, 2],
  [(c) => P.fundingHigh(c) && P.volClimax(c), 0, 2.5],
  [(c) => P.fundingLow(c) && P.volClimax(c), 0, 2.5],
  [(c) => P.fundingRising(c) && P.volClimax(c), 0, 2.5],
  [(c) => P.fundingFalling(c) && P.volClimax(c), 0, 2.5]
]);

add('45.9', 'Funding Multi-Timeframe Sync', 45, { method: 'funding', stopMult: 1.2, rr: 2.3 }, [
  [(c) => P.fundingRising(c) && P.h4Bull(c) && P.htfBull(c), 1, 3],
  [(c) => P.fundingFalling(c) && P.h4Bear(c) && P.htfBear(c), -1, 3],
  [(c) => P.fundingRising(c) && P.allTfBull(c), 1, 3.5],
  [(c) => P.fundingFalling(c) && P.allTfBear(c), -1, 3.5],
  [(c) => P.fundingFlipUp(c) && P.h4Bull(c), 1, 2.5],
  [(c) => P.fundingFlipDn(c) && P.h4Bear(c), -1, 2.5],
  [(c) => P.fundingRising(c) && P.htfBear(c), 0, 2.5],
  [(c) => P.fundingFalling(c) && P.htfBull(c), 0, 2.5],
  [(c) => P.fundingHigh(c) && P.htfBull(c), 1, 2],
  [(c) => P.fundingLow(c) && P.htfBear(c), -1, 2]
]);

add('45.10', 'Funding Exhaustion Counter', 45, { method: 'funding', stopMult: 1.3, rr: 2.5 }, [
  [(c) => P.fundingExtremePos(c) && P.rsiOB(c) && P.volClimax(c), -1, 4],
  [(c) => P.fundingExtremeNeg(c) && P.rsiOS(c) && P.volClimax(c), 1, 4],
  [(c) => P.fundingExtremePos(c) && P.deltaExtremePos(c), -1, 3.5],
  [(c) => P.fundingExtremeNeg(c) && P.deltaExtremeNeg(c), 1, 3.5],
  [(c) => P.fundingExtremePos(c) && P.macdHistFalling(c), -1, 3],
  [(c) => P.fundingExtremeNeg(c) && P.macdHistRising(c), 1, 3],
  [(c) => P.fundingExtremePos(c) && P.closeBackBelowH(c), -1, 3],
  [(c) => P.fundingExtremeNeg(c) && P.closeBackAboveL(c), 1, 3],
  [(c) => P.fundingHigh(c) && P.rangeAtHigh(c) && P.rsiOB(c), -1, 2.5],
  [(c) => P.fundingLow(c) && P.rangeAtLow(c) && P.rsiOS(c), 1, 2.5]
]);

// ===================== CATEGORY 46: FINAL CONFLUENCE / VOTE COMPILER ======
add('46.1', 'Vote Compiler Lead', 46, { method: 'compiler', stopMult: 1.1, rr: 2.2 }, [
  [(c) => P.aggLong(c) && P.biasLong(c) && P.gatesAllPass(c), 1, 3.5],
  [(c) => P.aggShort(c) && P.biasShort(c) && P.gatesAllPass(c), -1, 3.5],
  [(c) => P.aggLong(c) && P.biasLong(c), 1, 2.5],
  [(c) => P.aggShort(c) && P.biasShort(c), -1, 2.5],
  [(c) => P.aggNeutral(c), 0, 3],
  [(c) => P.gatesFail(c), 0, 3],
  [(c) => P.aggLong(c) && P.aggHighConf(c) && P.htfBull(c), 1, 3],
  [(c) => P.aggShort(c) && P.aggHighConf(c) && P.htfBear(c), -1, 3],
  [(c) => P.aggLong(c) && P.aggLowConf(c), 0, 2.5],
  [(c) => P.aggShort(c) && P.aggLowConf(c), 0, 2.5]
]);

add('46.2', 'Vote Confidence Assessor', 46, { method: 'compiler', stopMult: 1.1, rr: 2.2 }, [
  [(c) => P.aggLong(c) && P.aggHighConf(c) && P.inVote(c), 1, 3.5],
  [(c) => P.aggShort(c) && P.aggHighConf(c) && P.inVote(c), -1, 3.5],
  [(c) => P.aggLong(c) && P.aggHighConf(c), 1, 2.5],
  [(c) => P.aggShort(c) && P.aggHighConf(c), -1, 2.5],
  [(c) => P.outVote(c), 0, 3],
  [(c) => P.aggLowConf(c), 0, 3],
  [(c) => P.aggNeutral(c), 0, 3],
  [(c) => P.aggLong(c) && P.htfBull(c) && P.alignBull(c), 1, 2.5],
  [(c) => P.aggShort(c) && P.htfBear(c) && P.alignBear(c), -1, 2.5],
  [(c) => P.aggLong(c) && P.htfBear(c), 0, 2.5]
]);

add('46.3', 'Category Weight Balancer', 46, { method: 'compiler', stopMult: 1.1, rr: 2.0 }, [
  [(c) => P.aggLong(c) && P.biasLong(c) && P.gatesAllPass(c) && P.sysHealthy(c), 1, 3],
  [(c) => P.aggShort(c) && P.biasShort(c) && P.gatesAllPass(c) && P.sysHealthy(c), -1, 3],
  [(c) => P.gatesFail(c), 0, 3],
  [(c) => P.sysStale(c), 0, 3],
  [(c) => P.aggNeutral(c), 0, 3],
  [(c) => P.aggLong(c) && P.outVote(c), 0, 2.5],
  [(c) => P.aggShort(c) && P.outVote(c), 0, 2.5],
  [(c) => P.aggLong(c) && P.htfBull(c), 1, 2],
  [(c) => P.aggShort(c) && P.htfBear(c), -1, 2],
  [(c) => P.aggLong(c) && P.aggLowConf(c), 0, 2.5]
]);

add('46.4', 'Final Vote Weight Agent (the compiler)', 46, { method: 'compiler', stopMult: 1.1, rr: 2.0, catWeight: 1.3 }, [
  [(c) => P.aggLong(c) && P.biasLong(c) && P.gatesAllPass(c) && P.aggHighConf(c), 1, 4],
  [(c) => P.aggShort(c) && P.biasShort(c) && P.gatesAllPass(c) && P.aggHighConf(c), -1, 4],
  [(c) => P.aggLong(c) && P.biasLong(c) && P.gatesAllPass(c), 1, 3],
  [(c) => P.aggShort(c) && P.biasShort(c) && P.gatesAllPass(c), -1, 3],
  [(c) => P.gatesFail(c), 0, 3.5],
  [(c) => P.aggNeutral(c), 0, 3],
  [(c) => P.sysStale(c), 0, 3],
  [(c) => P.aggLong(c) && P.aggHighConf(c) && P.htfBull(c), 1, 3],
  [(c) => P.aggShort(c) && P.aggHighConf(c) && P.htfBear(c), -1, 3],
  [(c) => P.aggLong(c) && P.outVote(c), 0, 2.5]
]);

add('46.5', 'Consensus Coherence Checker', 46, { method: 'compiler', stopMult: 1.1, rr: 2.0 }, [
  [(c) => P.aggLong(c) && P.htfBull(c) && P.alignBull(c) && P.aboveVwap(c), 1, 3.5],
  [(c) => P.aggShort(c) && P.htfBear(c) && P.alignBear(c) && P.belowVwap(c), -1, 3.5],
  [(c) => P.aggLong(c) && P.htfBear(c), 0, 3],
  [(c) => P.aggShort(c) && P.htfBull(c), 0, 3],
  [(c) => P.aggLong(c) && P.alignMixed(c), 0, 2.5],
  [(c) => P.aggShort(c) && P.alignMixed(c), 0, 2.5],
  [(c) => P.aggLong(c) && P.htfBull(c), 1, 2.5],
  [(c) => P.aggShort(c) && P.htfBear(c), -1, 2.5],
  [(c) => P.gatesFail(c), 0, 3],
  [(c) => P.aggNeutral(c), 0, 3]
]);

add('46.6', 'Signal Quality Scorer', 46, { method: 'compiler', stopMult: 1.1, rr: 2.0 }, [
  [(c) => P.aggLong(c) && P.aggHighConf(c) && P.inVote(c) && P.gatesAllPass(c), 1, 4],
  [(c) => P.aggShort(c) && P.aggHighConf(c) && P.inVote(c) && P.gatesAllPass(c), -1, 4],
  [(c) => P.aggLong(c) && P.gatesAllPass(c), 1, 2.5],
  [(c) => P.aggShort(c) && P.gatesAllPass(c), -1, 2.5],
  [(c) => P.outVote(c), 0, 3],
  [(c) => P.aggLowConf(c), 0, 3],
  [(c) => P.gatesFail(c), 0, 3],
  [(c) => P.sysStale(c), 0, 3],
  [(c) => P.aggNeutral(c), 0, 3],
  [(c) => P.aggLong(c) && P.aggLowConf(c), 0, 2.5]
]);

add('46.7', 'Vote Consistency Monitor', 46, { method: 'compiler', stopMult: 1.1, rr: 2.0 }, [
  [(c) => P.aggLong(c) && P.biasLong(c) && P.sysHealthy(c), 1, 3],
  [(c) => P.aggShort(c) && P.biasShort(c) && P.sysHealthy(c), -1, 3],
  [(c) => P.aggNeutral(c), 0, 3],
  [(c) => P.gatesFail(c), 0, 3],
  [(c) => P.sysVeryStale(c), 0, 3.5],
  [(c) => P.aggLong(c) && P.outVote(c), 0, 3],
  [(c) => P.aggShort(c) && P.outVote(c), 0, 3],
  [(c) => P.aggLong(c) && P.htfBull(c), 1, 2],
  [(c) => P.aggShort(c) && P.htfBear(c), -1, 2],
  [(c) => P.sysStale(c), 0, 2.5]
]);

add('46.8', 'Output Price Math Auditor', 46, { method: 'compiler', stopMult: 1.1, rr: 2.0 }, [
  [(c) => P.aggLong(c) && P.biasLong(c) && P.gatesAllPass(c) && P.sysFast(c), 1, 3.5],
  [(c) => P.aggShort(c) && P.biasShort(c) && P.gatesAllPass(c) && P.sysFast(c), -1, 3.5],
  [(c) => P.sysSlow(c), 0, 3],
  [(c) => P.sysVeryStale(c), 0, 3.5],
  [(c) => P.gatesFail(c), 0, 3],
  [(c) => P.aggNeutral(c), 0, 3],
  [(c) => P.sysStale(c), 0, 2.5],
  [(c) => P.aggLong(c) && P.gatesAllPass(c), 1, 2.5],
  [(c) => P.aggShort(c) && P.gatesAllPass(c), -1, 2.5],
  [(c) => P.aggLong(c) && P.aggLowConf(c), 0, 2.5]
]);

add('46.9', 'Compiler Sanity Guard', 46, { method: 'compiler', stopMult: 1.1, rr: 2.0 }, [
  [(c) => P.gatesFail(c), 0, 3.5],
  [(c) => P.sysVeryStale(c), 0, 3.5],
  [(c) => P.aggNeutral(c), 0, 3],
  [(c) => P.aggLong(c) && P.biasLong(c) && P.gatesAllPass(c), 1, 3],
  [(c) => P.aggShort(c) && P.biasShort(c) && P.gatesAllPass(c), -1, 3],
  [(c) => P.aggLong(c) && P.htfBear(c), 0, 3],
  [(c) => P.aggShort(c) && P.htfBull(c), 0, 3],
  [(c) => P.outVote(c), 0, 2.5],
  [(c) => P.aggLong(c) && P.sysHealthy(c), 1, 2],
  [(c) => P.aggShort(c) && P.sysHealthy(c), -1, 2]
]);

add('46.10', 'Supreme Confluence Compiler', 46, { method: 'compiler', stopMult: 1.1, rr: 2.0, catWeight: 1.3 }, [
  [(c) => P.aggLong(c) && P.biasLong(c) && P.gatesAllPass(c) && P.aggHighConf(c) && P.htfBull(c), 1, 4.5],
  [(c) => P.aggShort(c) && P.biasShort(c) && P.gatesAllPass(c) && P.aggHighConf(c) && P.htfBear(c), -1, 4.5],
  [(c) => P.gatesFail(c), 0, 4],
  [(c) => P.sysVeryStale(c), 0, 4],
  [(c) => P.aggNeutral(c), 0, 3.5],
  [(c) => P.aggLong(c) && P.biasLong(c) && P.gatesAllPass(c), 1, 3],
  [(c) => P.aggShort(c) && P.biasShort(c) && P.gatesAllPass(c), -1, 3],
  [(c) => P.outVote(c), 0, 3],
  [(c) => P.aggLong(c) && P.htfBull(c) && P.alignBull(c), 1, 2.5],
  [(c) => P.aggShort(c) && P.htfBear(c) && P.alignBear(c), -1, 2.5]
]);

// ===================== CATEGORY 47: SYSTEM OPS MASTERS =====================
add('47.1', 'API Health Monitor', 47, { method: 'system', stopMult: 1.1, rr: 2.0 }, [
  [(c) => P.sysHealthy(c) && P.aggLong(c), 1, 3],
  [(c) => P.sysHealthy(c) && P.aggShort(c), -1, 3],
  [(c) => P.sysStale(c), 0, 3.5],
  [(c) => P.sysVeryStale(c), 0, 4],
  [(c) => P.sysSlow(c), 0, 3],
  [(c) => P.sysFast(c) && P.aggLong(c) && P.gatesAllPass(c), 1, 3],
  [(c) => P.sysFast(c) && P.aggShort(c) && P.gatesAllPass(c), -1, 3],
  [(c) => !P.sysHealthy(c), 0, 4],
  [(c) => P.aggNeutral(c), 0, 3],
  [(c) => P.sysHealthy(c) && P.aggNeutral(c), 0, 3]
]);

add('47.2', 'WebSocket Connectivity Monitor', 47, { method: 'system', stopMult: 1.1, rr: 2.0 }, [
  [(c) => P.sysHealthy(c) && P.aggLong(c) && P.gatesAllPass(c), 1, 3],
  [(c) => P.sysHealthy(c) && P.aggShort(c) && P.gatesAllPass(c), -1, 3],
  [(c) => P.sysStale(c), 0, 3.5],
  [(c) => P.sysVeryStale(c), 0, 4],
  [(c) => P.sysSlow(c), 0, 3],
  [(c) => P.sysFast(c) && P.sysHealthy(c), 1, 2],
  [(c) => P.sysFast(c) && P.sysHealthy(c), -1, 2],
  [(c) => !P.sysHealthy(c), 0, 4],
  [(c) => P.aggNeutral(c), 0, 3],
  [(c) => P.gatesFail(c), 0, 3.5]
]);

add('47.3', 'Data Freshness Monitor', 47, { method: 'system', stopMult: 1.1, rr: 2.0 }, [
  [(c) => P.sysVeryStale(c), 0, 4],
  [(c) => P.sysStale(c), 0, 3.5],
  [(c) => P.sysSlow(c), 0, 3],
  [(c) => P.sysFast(c) && P.sysHealthy(c) && P.aggLong(c), 1, 3],
  [(c) => P.sysFast(c) && P.sysHealthy(c) && P.aggShort(c), -1, 3],
  [(c) => P.sysFast(c) && P.sysHealthy(c) && P.aggNeutral(c), 0, 3],
  [(c) => P.sysFast(c) && P.sysHealthy(c), 1, 2],
  [(c) => P.sysFast(c) && P.sysHealthy(c), -1, 2],
  [(c) => P.gatesFail(c), 0, 3],
  [(c) => P.sysHealthy(c) && P.gatesAllPass(c), 1, 2.5]
]);

add('47.4', 'Cycle Time Auditor', 47, { method: 'system', stopMult: 1.1, rr: 2.0 }, [
  [(c) => P.sysSlow(c), 0, 3.5],
  [(c) => P.sysVeryStale(c), 0, 4],
  [(c) => P.sysFast(c) && P.aggLong(c) && P.biasLong(c), 1, 3],
  [(c) => P.sysFast(c) && P.aggShort(c) && P.biasShort(c), -1, 3],
  [(c) => P.sysFast(c) && P.sysHealthy(c), 1, 2],
  [(c) => P.sysFast(c) && P.sysHealthy(c), -1, 2],
  [(c) => P.sysStale(c), 0, 3],
  [(c) => P.sysHealthy(c) && P.aggNeutral(c), 0, 3],
  [(c) => P.gatesFail(c), 0, 3],
  [(c) => P.sysFast(c) && P.gatesAllPass(c) && P.aggLong(c), 1, 2.5]
]);

add('47.5', 'Rate Limit Guardian', 47, { method: 'system', stopMult: 1.1, rr: 2.0 }, [
  [(c) => P.sysStale(c), 0, 3.5],
  [(c) => P.sysVeryStale(c), 0, 4],
  [(c) => P.sysSlow(c), 0, 3.5],
  [(c) => P.sysFast(c) && P.sysHealthy(c) && P.aggLong(c) && P.gatesAllPass(c), 1, 3],
  [(c) => P.sysFast(c) && P.sysHealthy(c) && P.aggShort(c) && P.gatesAllPass(c), -1, 3],
  [(c) => P.sysFast(c) && P.sysHealthy(c), 1, 2],
  [(c) => P.sysFast(c) && P.sysHealthy(c), -1, 2],
  [(c) => P.gatesFail(c), 0, 3],
  [(c) => P.aggNeutral(c), 0, 3],
  [(c) => P.sysHealthy(c), 1, 1.5]
]);

add('47.6', 'System Resource Monitor', 47, { method: 'system', stopMult: 1.1, rr: 2.0 }, [
  [(c) => P.sysVeryStale(c), 0, 4],
  [(c) => P.sysStale(c), 0, 3.5],
  [(c) => P.sysSlow(c), 0, 3.5],
  [(c) => P.sysFast(c) && P.sysHealthy(c) && P.aggLong(c), 1, 2.5],
  [(c) => P.sysFast(c) && P.sysHealthy(c) && P.aggShort(c), -1, 2.5],
  [(c) => P.sysFast(c) && P.sysHealthy(c) && P.aggNeutral(c), 0, 3],
  [(c) => P.gatesFail(c), 0, 3],
  [(c) => P.sysHealthy(c) && P.aggLong(c) && P.gatesAllPass(c), 1, 2.5],
  [(c) => P.sysHealthy(c) && P.aggShort(c) && P.gatesAllPass(c), -1, 2.5],
  [(c) => P.sysHealthy(c), 1, 1.5]
]);

add('47.7', 'Snapshot Integrity Checker', 47, { method: 'system', stopMult: 1.1, rr: 2.0 }, [
  [(c) => P.sysStale(c), 0, 3.5],
  [(c) => P.sysVeryStale(c), 0, 4],
  [(c) => P.sysHealthy(c) && P.aggLong(c) && P.biasLong(c) && P.gatesAllPass(c), 1, 3.5],
  [(c) => P.sysHealthy(c) && P.aggShort(c) && P.biasShort(c) && P.gatesAllPass(c), -1, 3.5],
  [(c) => P.gatesFail(c), 0, 3.5],
  [(c) => P.sysSlow(c), 0, 3],
  [(c) => P.aggNeutral(c), 0, 3],
  [(c) => P.sysHealthy(c) && P.aggLong(c), 1, 2],
  [(c) => P.sysHealthy(c) && P.aggShort(c), -1, 2],
  [(c) => P.sysHealthy(c), 1, 1.5]
]);

add('47.8', 'Restart Cooldown Manager', 47, { method: 'system', stopMult: 1.1, rr: 2.0 }, [
  [(c) => P.sysVeryStale(c), 0, 4],
  [(c) => P.sysStale(c), 0, 3.5],
  [(c) => P.sysSlow(c), 0, 3.5],
  [(c) => P.sysFast(c) && P.sysHealthy(c) && P.aggLong(c) && P.gatesAllPass(c), 1, 3],
  [(c) => P.sysFast(c) && P.sysHealthy(c) && P.aggShort(c) && P.gatesAllPass(c), -1, 3],
  [(c) => P.gatesFail(c), 0, 3],
  [(c) => P.sysHealthy(c) && P.aggNeutral(c), 0, 3],
  [(c) => P.sysFast(c) && P.sysHealthy(c), 1, 2],
  [(c) => P.sysFast(c) && P.sysHealthy(c), -1, 2]
]);

add('47.9', 'Cache Validity Monitor', 47, { method: 'system', stopMult: 1.1, rr: 2.0 }, [
  [(c) => P.sysVeryStale(c), 0, 4],
  [(c) => P.sysStale(c), 0, 3.5],
  [(c) => P.sysFast(c) && P.sysHealthy(c) && P.aggLong(c) && P.gatesAllPass(c), 1, 3],
  [(c) => P.sysFast(c) && P.sysHealthy(c) && P.aggShort(c) && P.gatesAllPass(c), -1, 3],
  [(c) => P.sysSlow(c), 0, 3],
  [(c) => P.gatesFail(c), 0, 3],
  [(c) => P.aggNeutral(c), 0, 3],
  [(c) => P.sysHealthy(c) && P.aggLong(c), 1, 2],
  [(c) => P.sysHealthy(c) && P.aggShort(c), -1, 2],
  [(c) => P.sysHealthy(c), 1, 1.5]
]);

add('47.10', 'System Ops Final Guard', 47, { method: 'system', stopMult: 1.1, rr: 2.0 }, [
  [(c) => P.sysVeryStale(c) || P.gatesFail(c), 0, 4],
  [(c) => P.sysStale(c), 0, 3.5],
  [(c) => P.sysSlow(c), 0, 3.5],
  [(c) => P.sysHealthy(c) && P.sysFast(c) && P.aggLong(c) && P.biasLong(c) && P.gatesAllPass(c), 1, 3.5],
  [(c) => P.sysHealthy(c) && P.sysFast(c) && P.aggShort(c) && P.biasShort(c) && P.gatesAllPass(c), -1, 3.5],
  [(c) => P.aggNeutral(c), 0, 3],
  [(c) => P.sysHealthy(c) && P.aggLong(c), 1, 2],
  [(c) => P.sysHealthy(c) && P.aggShort(c), -1, 2],
  [(c) => P.sysHealthy(c), 1, 1.5],
  [(c) => P.sysHealthy(c), -1, 1.5]
]);

// ===================== CATEGORY 48: KEYBOARD MASTERS =======================
add('48.1', 'Keyboard Snapshot Commander', 48, { method: 'keyboard', stopMult: 1.1, rr: 2.0 }, [
  [(c) => P.sysHealthy(c) && P.aggLong(c) && P.gatesAllPass(c), 1, 3],
  [(c) => P.sysHealthy(c) && P.aggShort(c) && P.gatesAllPass(c), -1, 3],
  [(c) => P.gatesFail(c), 0, 3.5],
  [(c) => P.sysStale(c), 0, 3.5],
  [(c) => P.sysVeryStale(c), 0, 4],
  [(c) => P.aggNeutral(c), 0, 3],
  [(c) => P.sysHealthy(c) && P.aggLong(c), 1, 2],
  [(c) => P.sysHealthy(c) && P.aggShort(c), -1, 2],
  [(c) => P.sysHealthy(c), 1, 1.5],
  [(c) => P.sysHealthy(c), -1, 1.5]
]);

add('48.2', 'Keyboard Refresh Commander', 48, { method: 'keyboard', stopMult: 1.1, rr: 2.0 }, [
  [(c) => P.sysFast(c) && P.sysHealthy(c) && P.aggLong(c) && P.gatesAllPass(c), 1, 3],
  [(c) => P.sysFast(c) && P.sysHealthy(c) && P.aggShort(c) && P.gatesAllPass(c), -1, 3],
  [(c) => P.sysSlow(c), 0, 3.5],
  [(c) => P.sysStale(c), 0, 3.5],
  [(c) => P.gatesFail(c), 0, 3],
  [(c) => P.aggNeutral(c), 0, 3],
  [(c) => P.sysHealthy(c) && P.aggLong(c), 1, 2],
  [(c) => P.sysHealthy(c) && P.aggShort(c), -1, 2],
  [(c) => P.sysHealthy(c), 1, 1.5],
  [(c) => P.sysHealthy(c), -1, 1.5]
]);

add('48.3', 'Keyboard Connection Monitor', 48, { method: 'keyboard', stopMult: 1.1, rr: 2.0 }, [
  [(c) => !P.sysHealthy(c), 0, 4],
  [(c) => P.sysStale(c), 0, 3.5],
  [(c) => P.sysVeryStale(c), 0, 4],
  [(c) => P.sysHealthy(c) && P.aggLong(c) && P.gatesAllPass(c), 1, 3],
  [(c) => P.sysHealthy(c) && P.aggShort(c) && P.gatesAllPass(c), -1, 3],
  [(c) => P.gatesFail(c), 0, 3],
  [(c) => P.aggNeutral(c), 0, 3],
  [(c) => P.sysHealthy(c) && P.aggLong(c), 1, 2],
  [(c) => P.sysHealthy(c) && P.aggShort(c), -1, 2],
  [(c) => P.sysHealthy(c), 1, 1.5]
]);

add('48.4', 'Keyboard Data Monitor', 48, { method: 'keyboard', stopMult: 1.1, rr: 2.0 }, [
  [(c) => P.sysVeryStale(c), 0, 4],
  [(c) => P.sysStale(c), 0, 3.5],
  [(c) => P.sysFast(c) && P.sysHealthy(c) && P.aggLong(c) && P.gatesAllPass(c), 1, 3],
  [(c) => P.sysFast(c) && P.sysHealthy(c) && P.aggShort(c) && P.gatesAllPass(c), -1, 3],
  [(c) => P.sysSlow(c), 0, 3],
  [(c) => P.gatesFail(c), 0, 3],
  [(c) => P.aggNeutral(c), 0, 3],
  [(c) => P.sysHealthy(c) && P.aggLong(c), 1, 2],
  [(c) => P.sysHealthy(c) && P.aggShort(c), -1, 2],
  [(c) => P.sysHealthy(c), 1, 1.5]
]);

add('48.5', 'Keyboard Boot Monitor', 48, { method: 'keyboard', stopMult: 1.1, rr: 2.0 }, [
  [(c) => P.sysVeryStale(c), 0, 4],
  [(c) => P.sysStale(c), 0, 3.5],
  [(c) => P.sysHealthy(c) && P.aggLong(c) && P.biasLong(c) && P.gatesAllPass(c), 1, 3.5],
  [(c) => P.sysHealthy(c) && P.aggShort(c) && P.biasShort(c) && P.gatesAllPass(c), -1, 3.5],
  [(c) => P.gatesFail(c), 0, 3.5],
  [(c) => P.sysSlow(c), 0, 3],
  [(c) => P.aggNeutral(c), 0, 3],
  [(c) => P.sysHealthy(c) && P.aggLong(c), 1, 2],
  [(c) => P.sysHealthy(c) && P.aggShort(c), -1, 2],
  [(c) => P.sysHealthy(c), 1, 1.5]
]);

add('48.6', 'Keyboard Chart Commander', 48, { method: 'keyboard', stopMult: 1.1, rr: 2.0 }, [
  [(c) => P.sysHealthy(c) && P.aggLong(c) && P.gatesAllPass(c) && P.htfBull(c), 1, 3],
  [(c) => P.sysHealthy(c) && P.aggShort(c) && P.gatesAllPass(c) && P.htfBear(c), -1, 3],
  [(c) => P.gatesFail(c), 0, 3.5],
  [(c) => P.sysStale(c), 0, 3.5],
  [(c) => P.aggNeutral(c), 0, 3],
  [(c) => P.sysHealthy(c) && P.aggLong(c), 1, 2],
  [(c) => P.sysHealthy(c) && P.aggShort(c), -1, 2],
  [(c) => P.sysVeryStale(c), 0, 4],
  [(c) => P.sysHealthy(c), 1, 1.5],
  [(c) => P.sysHealthy(c), -1, 1.5]
]);

add('48.7', 'Keyboard Order Book Commander', 48, { method: 'keyboard', stopMult: 1.1, rr: 2.0 }, [
  [(c) => P.sysHealthy(c) && P.bookBidHeavy(c) && P.aggLong(c), 1, 3],
  [(c) => P.sysHealthy(c) && P.bookAskHeavy(c) && P.aggShort(c), -1, 3],
  [(c) => P.sysStale(c), 0, 3.5],
  [(c) => P.gatesFail(c), 0, 3],
  [(c) => P.aggNeutral(c), 0, 3],
  [(c) => P.sysHealthy(c) && P.aggLong(c), 1, 2],
  [(c) => P.sysHealthy(c) && P.aggShort(c), -1, 2],
  [(c) => P.sysVeryStale(c), 0, 4],
  [(c) => P.sysHealthy(c), 1, 1.5],
  [(c) => P.sysHealthy(c), -1, 1.5]
]);

add('48.8', 'Keyboard News Commander', 48, { method: 'keyboard', stopMult: 1.1, rr: 2.0 }, [
  [(c) => P.sysHealthy(c) && P.aggLong(c) && P.biasLong(c) && P.gatesAllPass(c), 1, 3],
  [(c) => P.sysHealthy(c) && P.aggShort(c) && P.biasShort(c) && P.gatesAllPass(c), -1, 3],
  [(c) => P.gatesFail(c), 0, 3.5],
  [(c) => P.sysStale(c), 0, 3.5],
  [(c) => P.aggNeutral(c), 0, 3],
  [(c) => P.sysHealthy(c) && P.aggLong(c), 1, 2],
  [(c) => P.sysHealthy(c) && P.aggShort(c), -1, 2],
  [(c) => P.sysVeryStale(c), 0, 4],
  [(c) => P.sysHealthy(c), 1, 1.5],
  [(c) => P.sysHealthy(c), -1, 1.5]
]);

add('48.9', 'Keyboard Signal Monitor', 48, { method: 'keyboard', stopMult: 1.1, rr: 2.0 }, [
  [(c) => P.sysHealthy(c) && P.aggLong(c) && P.aggHighConf(c) && P.gatesAllPass(c), 1, 3.5],
  [(c) => P.sysHealthy(c) && P.aggShort(c) && P.aggHighConf(c) && P.gatesAllPass(c), -1, 3.5],
  [(c) => P.gatesFail(c), 0, 3.5],
  [(c) => P.aggLowConf(c), 0, 3],
  [(c) => P.sysStale(c), 0, 3.5],
  [(c) => P.aggNeutral(c), 0, 3],
  [(c) => P.sysHealthy(c) && P.aggLong(c), 1, 2],
  [(c) => P.sysHealthy(c) && P.aggShort(c), -1, 2],
  [(c) => P.sysHealthy(c), 1, 1.5],
  [(c) => P.sysHealthy(c), -1, 1.5]
]);

add('48.10', 'Keyboard Terminal Commander', 48, { method: 'keyboard', stopMult: 1.1, rr: 2.0 }, [
  [(c) => P.sysHealthy(c) && P.aggLong(c) && P.biasLong(c) && P.gatesAllPass(c) && P.aggHighConf(c), 1, 3.5],
  [(c) => P.sysHealthy(c) && P.aggShort(c) && P.biasShort(c) && P.gatesAllPass(c) && P.aggHighConf(c), -1, 3.5],
  [(c) => P.gatesFail(c), 0, 3.5],
  [(c) => P.sysVeryStale(c), 0, 4],
  [(c) => P.aggNeutral(c), 0, 3],
  [(c) => P.sysHealthy(c) && P.aggLong(c), 1, 2],
  [(c) => P.sysHealthy(c) && P.aggShort(c), -1, 2],
  [(c) => P.sysStale(c), 0, 3],
  [(c) => P.sysHealthy(c), 1, 1.5],
  [(c) => P.sysHealthy(c), -1, 1.5]
]);

// ===================== CATEGORY 49: ERROR HANDLING MASTERS =================
add('49.1', 'API Error Handler', 49, { method: 'errors', stopMult: 1.1, rr: 2.0 }, [
  [(c) => P.sysVeryStale(c), 0, 4],
  [(c) => P.sysStale(c), 0, 3.5],
  [(c) => P.sysSlow(c), 0, 3.5],
  [(c) => P.sysHealthy(c) && P.aggLong(c) && P.gatesAllPass(c), 1, 3],
  [(c) => P.sysHealthy(c) && P.aggShort(c) && P.gatesAllPass(c), -1, 3],
  [(c) => P.gatesFail(c), 0, 3],
  [(c) => P.aggNeutral(c), 0, 3],
  [(c) => P.sysHealthy(c) && P.aggLong(c), 1, 2],
  [(c) => P.sysHealthy(c) && P.aggShort(c), -1, 2],
  [(c) => P.sysHealthy(c), 1, 1.5]
]);

add('49.2', 'WebSocket Error Handler', 49, { method: 'errors', stopMult: 1.1, rr: 2.0 }, [
  [(c) => !P.sysHealthy(c), 0, 4],
  [(c) => P.sysVeryStale(c), 0, 4],
  [(c) => P.sysStale(c), 0, 3.5],
  [(c) => P.sysHealthy(c) && P.aggLong(c) && P.gatesAllPass(c), 1, 3],
  [(c) => P.sysHealthy(c) && P.aggShort(c) && P.gatesAllPass(c), -1, 3],
  [(c) => P.gatesFail(c), 0, 3],
  [(c) => P.aggNeutral(c), 0, 3],
  [(c) => P.sysHealthy(c) && P.aggLong(c), 1, 2],
  [(c) => P.sysHealthy(c) && P.aggShort(c), -1, 2],
  [(c) => P.sysHealthy(c), 1, 1.5]
]);

add('49.3', 'Data Validation Error Handler', 49, { method: 'errors', stopMult: 1.1, rr: 2.0 }, [
  [(c) => P.sysVeryStale(c), 0, 4],
  [(c) => P.sysStale(c), 0, 3.5],
  [(c) => P.sysSlow(c), 0, 3.5],
  [(c) => P.sysHealthy(c) && P.aggLong(c) && P.biasLong(c) && P.gatesAllPass(c), 1, 3.5],
  [(c) => P.sysHealthy(c) && P.aggShort(c) && P.biasShort(c) && P.gatesAllPass(c), -1, 3.5],
  [(c) => P.gatesFail(c), 0, 3.5],
  [(c) => P.aggNeutral(c), 0, 3],
  [(c) => P.sysHealthy(c) && P.aggLong(c), 1, 2],
  [(c) => P.sysHealthy(c) && P.aggShort(c), -1, 2]
]);

add('49.4', 'Parsing Error Handler', 49, { method: 'errors', stopMult: 1.1, rr: 2.0 }, [
  [(c) => P.sysVeryStale(c), 0, 4],
  [(c) => P.sysStale(c), 0, 3.5],
  [(c) => P.sysHealthy(c) && P.aggLong(c) && P.gatesAllPass(c) && P.aggHighConf(c), 1, 3.5],
  [(c) => P.sysHealthy(c) && P.aggShort(c) && P.gatesAllPass(c) && P.aggHighConf(c), -1, 3.5],
  [(c) => P.gatesFail(c), 0, 3.5],
  [(c) => P.aggLowConf(c), 0, 3],
  [(c) => P.sysSlow(c), 0, 3],
  [(c) => P.aggNeutral(c), 0, 3],
  [(c) => P.sysHealthy(c) && P.aggLong(c), 1, 2],
  [(c) => P.sysHealthy(c) && P.aggShort(c), -1, 2]
]);

add('49.5', 'Timeout Error Handler', 49, { method: 'errors', stopMult: 1.1, rr: 2.0 }, [
  [(c) => P.sysVeryStale(c), 0, 4],
  [(c) => P.sysStale(c), 0, 3.5],
  [(c) => P.sysSlow(c), 0, 3.5],
  [(c) => P.sysFast(c) && P.sysHealthy(c) && P.aggLong(c) && P.gatesAllPass(c), 1, 3],
  [(c) => P.sysFast(c) && P.sysHealthy(c) && P.aggShort(c) && P.gatesAllPass(c), -1, 3],
  [(c) => P.gatesFail(c), 0, 3],
  [(c) => P.aggNeutral(c), 0, 3],
  [(c) => P.sysHealthy(c) && P.aggLong(c), 1, 2],
  [(c) => P.sysHealthy(c) && P.aggShort(c), -1, 2]
]);

add('49.6', 'Recovery Strategy Monitor', 49, { method: 'errors', stopMult: 1.1, rr: 2.0 }, [
  [(c) => P.sysVeryStale(c), 0, 4],
  [(c) => P.sysStale(c), 0, 3.5],
  [(c) => P.sysHealthy(c) && P.sysFast(c) && P.aggLong(c) && P.gatesAllPass(c), 1, 3.5],
  [(c) => P.sysHealthy(c) && P.sysFast(c) && P.aggShort(c) && P.gatesAllPass(c), -1, 3.5],
  [(c) => P.gatesFail(c), 0, 3.5],
  [(c) => P.sysSlow(c), 0, 3],
  [(c) => P.aggNeutral(c), 0, 3],
  [(c) => P.sysHealthy(c) && P.aggLong(c), 1, 2],
  [(c) => P.sysHealthy(c) && P.aggShort(c), -1, 2],
  [(c) => P.sysHealthy(c), 1, 1.5]
]);

add('49.7', 'Error Log Auditor', 49, { method: 'errors', stopMult: 1.1, rr: 2.0 }, [
  [(c) => P.sysVeryStale(c), 0, 4],
  [(c) => P.sysStale(c), 0, 3.5],
  [(c) => P.sysHealthy(c) && P.aggLong(c) && P.biasLong(c) && P.gatesAllPass(c), 1, 3.5],
  [(c) => P.sysHealthy(c) && P.aggShort(c) && P.biasShort(c) && P.gatesAllPass(c), -1, 3.5],
  [(c) => P.gatesFail(c), 0, 3.5],
  [(c) => P.sysSlow(c), 0, 3],
  [(c) => P.aggNeutral(c), 0, 3],
  [(c) => P.sysHealthy(c) && P.aggLong(c), 1, 2],
  [(c) => P.sysHealthy(c) && P.aggShort(c), -1, 2],
  [(c) => P.sysHealthy(c), 1, 1.5]
]);

add('49.8', 'Circuit Breaker Monitor', 49, { method: 'errors', stopMult: 1.1, rr: 2.0 }, [
  [(c) => P.sysVeryStale(c), 0, 4],
  [(c) => P.sysStale(c), 0, 3.5],
  [(c) => P.sysSlow(c), 0, 3.5],
  [(c) => P.sysHealthy(c) && P.aggLong(c) && P.gatesAllPass(c), 1, 3],
  [(c) => P.sysHealthy(c) && P.aggShort(c) && P.gatesAllPass(c), -1, 3],
  [(c) => P.gatesFail(c), 0, 3.5],
  [(c) => P.aggNeutral(c), 0, 3],
  [(c) => P.sysHealthy(c) && P.aggLong(c), 1, 2],
  [(c) => P.sysHealthy(c) && P.aggShort(c), -1, 2]
]);

add('49.9', 'Retry Policy Monitor', 49, { method: 'errors', stopMult: 1.1, rr: 2.0 }, [
  [(c) => P.sysVeryStale(c), 0, 4],
  [(c) => P.sysStale(c), 0, 3.5],
  [(c) => P.sysFast(c) && P.sysHealthy(c) && P.aggLong(c) && P.gatesAllPass(c), 1, 3],
  [(c) => P.sysFast(c) && P.sysHealthy(c) && P.aggShort(c) && P.gatesAllPass(c), -1, 3],
  [(c) => P.gatesFail(c), 0, 3],
  [(c) => P.sysSlow(c), 0, 3],
  [(c) => P.aggNeutral(c), 0, 3],
  [(c) => P.sysHealthy(c) && P.aggLong(c), 1, 2],
  [(c) => P.sysHealthy(c) && P.aggShort(c), -1, 2],
  [(c) => P.sysHealthy(c), 1, 1.5]
]);

add('49.10', 'Error Handling Final Guard', 49, { method: 'errors', stopMult: 1.1, rr: 2.0 }, [
  [(c) => P.sysVeryStale(c) || P.gatesFail(c), 0, 4],
  [(c) => P.sysStale(c), 0, 3.5],
  [(c) => P.sysSlow(c), 0, 3.5],
  [(c) => P.sysHealthy(c) && P.sysFast(c) && P.aggLong(c) && P.biasLong(c) && P.gatesAllPass(c), 1, 3.5],
  [(c) => P.sysHealthy(c) && P.sysFast(c) && P.aggShort(c) && P.biasShort(c) && P.gatesAllPass(c), -1, 3.5],
  [(c) => P.aggNeutral(c), 0, 3],
  [(c) => P.sysHealthy(c) && P.aggLong(c), 1, 2],
  [(c) => P.sysHealthy(c) && P.aggShort(c), -1, 2],
  [(c) => P.sysHealthy(c), 1, 1.5],
  [(c) => P.sysHealthy(c), -1, 1.5]
]);

// ===================== CATEGORY 50: BOOT MASTERS ===========================
add('50.1', 'Boot Sequence Validator', 50, { method: 'boot', stopMult: 1.1, rr: 2.0 }, [
  [(c) => P.sysVeryStale(c), 0, 4],
  [(c) => P.sysStale(c), 0, 3.5],
  [(c) => P.sysHealthy(c) && P.aggLong(c) && P.gatesAllPass(c), 1, 3],
  [(c) => P.sysHealthy(c) && P.aggShort(c) && P.gatesAllPass(c), -1, 3],
  [(c) => P.gatesFail(c), 0, 3.5],
  [(c) => P.sysSlow(c), 0, 3],
  [(c) => P.aggNeutral(c), 0, 3],
  [(c) => P.sysHealthy(c) && P.aggLong(c), 1, 2],
  [(c) => P.sysHealthy(c) && P.aggShort(c), -1, 2],
  [(c) => P.sysHealthy(c), 1, 1.5]
]);

add('50.2', 'Boot Data Preloader', 50, { method: 'boot', stopMult: 1.1, rr: 2.0 }, [
  [(c) => P.sysVeryStale(c), 0, 4],
  [(c) => P.sysStale(c), 0, 3.5],
  [(c) => P.sysHealthy(c) && P.aggLong(c) && P.biasLong(c) && P.gatesAllPass(c), 1, 3.5],
  [(c) => P.sysHealthy(c) && P.aggShort(c) && P.biasShort(c) && P.gatesAllPass(c), -1, 3.5],
  [(c) => P.gatesFail(c), 0, 3.5],
  [(c) => P.sysSlow(c), 0, 3],
  [(c) => P.aggNeutral(c), 0, 3],
  [(c) => P.sysHealthy(c) && P.aggLong(c), 1, 2],
  [(c) => P.sysHealthy(c) && P.aggShort(c), -1, 2],
  [(c) => P.sysHealthy(c), 1, 1.5]
]);

add('50.3', 'Boot Connection Checker', 50, { method: 'boot', stopMult: 1.1, rr: 2.0 }, [
  [(c) => !P.sysHealthy(c), 0, 4],
  [(c) => P.sysVeryStale(c), 0, 4],
  [(c) => P.sysStale(c), 0, 3.5],
  [(c) => P.sysHealthy(c) && P.aggLong(c) && P.gatesAllPass(c), 1, 3],
  [(c) => P.sysHealthy(c) && P.aggShort(c) && P.gatesAllPass(c), -1, 3],
  [(c) => P.gatesFail(c), 0, 3],
  [(c) => P.aggNeutral(c), 0, 3],
  [(c) => P.sysHealthy(c) && P.aggLong(c), 1, 2],
  [(c) => P.sysHealthy(c) && P.aggShort(c), -1, 2],
  [(c) => P.sysHealthy(c), 1, 1.5]
]);

add('50.4', 'Boot Indicator Warmup Checker', 50, { method: 'boot', stopMult: 1.1, rr: 2.0 }, [
  [(c) => P.sysVeryStale(c), 0, 4],
  [(c) => P.sysStale(c), 0, 3.5],
  [(c) => P.sysHealthy(c) && P.aggLong(c) && P.gatesAllPass(c) && P.aggHighConf(c), 1, 3.5],
  [(c) => P.sysHealthy(c) && P.aggShort(c) && P.gatesAllPass(c) && P.aggHighConf(c), -1, 3.5],
  [(c) => P.aggLowConf(c), 0, 3],
  [(c) => P.gatesFail(c), 0, 3.5],
  [(c) => P.sysSlow(c), 0, 3],
  [(c) => P.aggNeutral(c), 0, 3],
  [(c) => P.sysHealthy(c) && P.aggLong(c), 1, 2],
  [(c) => P.sysHealthy(c) && P.aggShort(c), -1, 2]
]);

add('50.5', 'Boot Time Sync Checker', 50, { method: 'boot', stopMult: 1.1, rr: 2.0 }, [
  [(c) => P.sysVeryStale(c), 0, 4],
  [(c) => P.sysStale(c), 0, 3.5],
  [(c) => P.sysHealthy(c) && P.aggLong(c) && P.gatesAllPass(c), 1, 3],
  [(c) => P.sysHealthy(c) && P.aggShort(c) && P.gatesAllPass(c), -1, 3],
  [(c) => P.gatesFail(c), 0, 3.5],
  [(c) => P.sysSlow(c), 0, 3],
  [(c) => P.aggNeutral(c), 0, 3],
  [(c) => P.sysHealthy(c) && P.aggLong(c), 1, 2],
  [(c) => P.sysHealthy(c) && P.aggShort(c), -1, 2],
  [(c) => P.sysHealthy(c), 1, 1.5]
]);

add('50.6', 'Boot Env Validator', 50, { method: 'boot', stopMult: 1.1, rr: 2.0 }, [
  [(c) => P.sysVeryStale(c), 0, 4],
  [(c) => P.sysStale(c), 0, 3.5],
  [(c) => P.sysHealthy(c) && P.aggLong(c) && P.biasLong(c) && P.gatesAllPass(c), 1, 3.5],
  [(c) => P.sysHealthy(c) && P.aggShort(c) && P.biasShort(c) && P.gatesAllPass(c), -1, 3.5],
  [(c) => P.gatesFail(c), 0, 3.5],
  [(c) => P.sysSlow(c), 0, 3],
  [(c) => P.aggNeutral(c), 0, 3],
  [(c) => P.sysHealthy(c) && P.aggLong(c), 1, 2],
  [(c) => P.sysHealthy(c) && P.aggShort(c), -1, 2],
  [(c) => P.sysHealthy(c), 1, 1.5]
]);

add('50.7', 'Boot Config Loader', 50, { method: 'boot', stopMult: 1.1, rr: 2.0 }, [
  [(c) => P.sysVeryStale(c), 0, 4],
  [(c) => P.sysStale(c), 0, 3.5],
  [(c) => P.sysHealthy(c) && P.aggLong(c) && P.gatesAllPass(c), 1, 3],
  [(c) => P.sysHealthy(c) && P.aggShort(c) && P.gatesAllPass(c), -1, 3],
  [(c) => P.gatesFail(c), 0, 3.5],
  [(c) => P.sysSlow(c), 0, 3],
  [(c) => P.aggNeutral(c), 0, 3],
  [(c) => P.sysHealthy(c) && P.aggLong(c), 1, 2],
  [(c) => P.sysHealthy(c) && P.aggShort(c), -1, 2],
  [(c) => P.sysHealthy(c), 1, 1.5]
]);

add('50.8', 'Boot Health Report', 50, { method: 'boot', stopMult: 1.1, rr: 2.0 }, [
  [(c) => P.sysVeryStale(c), 0, 4],
  [(c) => P.sysStale(c), 0, 3.5],
  [(c) => P.sysHealthy(c) && P.sysFast(c) && P.aggLong(c) && P.gatesAllPass(c), 1, 3.5],
  [(c) => P.sysHealthy(c) && P.sysFast(c) && P.aggShort(c) && P.gatesAllPass(c), -1, 3.5],
  [(c) => P.gatesFail(c), 0, 3.5],
  [(c) => P.sysSlow(c), 0, 3],
  [(c) => P.aggNeutral(c), 0, 3],
  [(c) => P.sysHealthy(c) && P.aggLong(c), 1, 2],
  [(c) => P.sysHealthy(c) && P.aggShort(c), -1, 2],
  [(c) => P.sysHealthy(c), 1, 1.5]
]);

add('50.9', 'Boot Rollback Manager', 50, { method: 'boot', stopMult: 1.1, rr: 2.0 }, [
  [(c) => P.sysVeryStale(c), 0, 4],
  [(c) => P.sysStale(c), 0, 3.5],
  [(c) => P.sysHealthy(c) && P.aggLong(c) && P.gatesAllPass(c) && P.aggHighConf(c), 1, 3.5],
  [(c) => P.sysHealthy(c) && P.aggShort(c) && P.gatesAllPass(c) && P.aggHighConf(c), -1, 3.5],
  [(c) => P.gatesFail(c), 0, 3.5],
  [(c) => P.sysSlow(c), 0, 3],
  [(c) => P.aggLowConf(c), 0, 3],
  [(c) => P.aggNeutral(c), 0, 3],
  [(c) => P.sysHealthy(c) && P.aggLong(c), 1, 2],
  [(c) => P.sysHealthy(c) && P.aggShort(c), -1, 2]
]);

add('50.10', 'Boot Final Authority', 50, { method: 'boot', stopMult: 1.1, rr: 2.0 }, [
  [(c) => P.sysVeryStale(c) || P.gatesFail(c), 0, 4],
  [(c) => P.sysStale(c), 0, 3.5],
  [(c) => P.sysSlow(c), 0, 3.5],
  [(c) => P.sysHealthy(c) && P.sysFast(c) && P.aggLong(c) && P.biasLong(c) && P.gatesAllPass(c), 1, 4],
  [(c) => P.sysHealthy(c) && P.sysFast(c) && P.aggShort(c) && P.biasShort(c) && P.gatesAllPass(c), -1, 4],
  [(c) => P.aggNeutral(c), 0, 3],
  [(c) => P.sysHealthy(c) && P.aggLong(c), 1, 2],
  [(c) => P.sysHealthy(c) && P.aggShort(c), -1, 2],
  [(c) => P.sysHealthy(c), 1, 1.5]
]);

module.exports = { agents: require('./engine.js').agents };
