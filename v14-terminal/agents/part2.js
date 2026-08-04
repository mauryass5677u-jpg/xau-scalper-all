'use strict';

// ============================================================================
// PART C2 — AGENT SWARM: CATEGORIES 11–20 (Agents 11.1 – 20.10) = 100 agents
// Range/Breakout/Liquidity/Volume (Cats 11-15) + Order Flow (Cats 16-20)
// ============================================================================

const { P, add } = require('./engine.js');

// =================== CATEGORY 11: RANGE & CONSOLIDATION ====================
add('11.1', 'Range High Resistance', 11, { method: 'swing', stopMult: 1.2, rr: 2.4 }, [
  [(c) => P.rangeAtHigh(c) && P.pinBear(c), -1, 3],
  [(c) => P.rangeAtHigh(c) && P.engulfBear(c), -1, 2.5],
  [(c) => P.rangeAtHigh(c) && P.rsiOB(c), -1, 2.5],
  [(c) => P.rangeAtHigh(c) && P.rsiDivBear(c), -1, 2.5],
  [(c) => P.rangeAtHigh(c) && P.atResistance(c), -1, 2.5],
  [(c) => P.rangeAtHigh(c), -1, 2],
  [(c) => P.rangeAtHigh(c) && P.shootingStar(c), -1, 2.5],
  [(c) => P.rangeAtHigh(c) && P.structDn(c), -1, 2],
  [(c) => P.rangeAtHigh(c) && P.volClimax(c), -1, 2],
  [(c) => P.rangeAtHigh(c) && P.alignBull(c), 0, 1.5]
]);

add('11.2', 'Range Low Support', 11, { method: 'swing', stopMult: 1.2, rr: 2.4 }, [
  [(c) => P.rangeAtLow(c) && P.pinBull(c), 1, 3],
  [(c) => P.rangeAtLow(c) && P.engulfBull(c), 1, 2.5],
  [(c) => P.rangeAtLow(c) && P.rsiOS(c), 1, 2.5],
  [(c) => P.rangeAtLow(c) && P.rsiDivBull(c), 1, 2.5],
  [(c) => P.rangeAtLow(c) && P.atSupport(c), 1, 2.5],
  [(c) => P.rangeAtLow(c), 1, 2],
  [(c) => P.rangeAtLow(c) && P.hammer(c), 1, 2.5],
  [(c) => P.rangeAtLow(c) && P.structUp(c), 1, 2],
  [(c) => P.rangeAtLow(c) && P.volClimax(c), 1, 2],
  [(c) => P.rangeAtLow(c) && P.alignBear(c), 0, 1.5]
]);

add('11.3', 'Range Mean Reversion', 11, { method: 'swing', stopMult: 1.1, rr: 2.0 }, [
  [(c) => P.rangeAtHigh(c) && P.rangeActive(c), -1, 3],
  [(c) => P.rangeAtLow(c) && P.rangeActive(c), 1, 3],
  [(c) => P.rangeAtHigh(c) && P.adxWeak(c), -1, 2.5],
  [(c) => P.rangeAtLow(c) && P.adxWeak(c), 1, 2.5],
  [(c) => P.rangeAtMid(c), 0, 2],
  [(c) => P.rangeAtHigh(c) && P.structNeutral(c), -1, 2.5],
  [(c) => P.rangeAtLow(c) && P.structNeutral(c), 1, 2.5],
  [(c) => P.rangeAtHigh(c) && P.volSpike(c), -1, 2],
  [(c) => P.rangeAtLow(c) && P.volSpike(c), 1, 2],
  [(c) => P.rangeAtHigh(c) && P.squeezeOn(c), -1, 2]
]);

add('11.4', 'Range Compression', 11, { method: 'price', stopMult: 1.2, rr: 2.5 }, [
  [(c) => P.rangeTight(c) && P.squeezeOn(c), 0, 2.5],
  [(c) => P.rangeTight(c) && P.volSpike(c), 0, 2],
  [(c) => P.rangeTight(c) && P.adxWeak(c), 0, 2],
  [(c) => P.rangeTight(c) && P.atrLow(c), 0, 2],
  [(c) => P.rangeTight(c) && P.ribbonTight(c), 0, 2],
  [(c) => P.rangeTight(c) && P.macdHistRising(c), 1, 1.5],
  [(c) => P.rangeTight(c) && P.macdHistFalling(c), -1, 1.5],
  [(c) => P.rangeTight(c) && P.rvolHigh(c), 0, 2],
  [(c) => P.rangeTight(c) && P.adxStrong(c), 0, 1.5],
  [(c) => P.rangeTight(c), 0, 1.5]
]);

add('11.5', 'Range Volume Profile', 11, { method: 'price', stopMult: 1.2, rr: 2.2 }, [
  [(c) => P.rangeAtHigh(c) && P.atVah(c), -1, 2.5],
  [(c) => P.rangeAtLow(c) && P.atVal(c), 1, 2.5],
  [(c) => P.rangeAtHigh(c) && P.atPoc(c), -1, 2],
  [(c) => P.rangeAtLow(c) && P.atPoc(c), 1, 2],
  [(c) => P.rangeAtHigh(c) && P.aboveVah(c), -1, 2],
  [(c) => P.rangeAtLow(c) && P.belowVal(c), 1, 2],
  [(c) => P.rangeAtHigh(c) && P.rvolHigh(c), -1, 2],
  [(c) => P.rangeAtLow(c) && P.rvolHigh(c), 1, 2],
  [(c) => P.rangeAtHigh(c) && P.rvolLow(c), 0, 1.5],
  [(c) => P.rangeAtLow(c) && P.rvolLow(c), 0, 1.5]
]);

add('11.6', 'Range Breakout Plan', 11, { method: 'price', stopMult: 1.3, rr: 2.6 }, [
  [(c) => P.rangeBreakUp(c) && P.volSpike(c), 1, 3],
  [(c) => P.rangeBreakDn(c) && P.volSpike(c), -1, 3],
  [(c) => P.rangeBreakUp(c) && P.retestAboveLastH(c), 1, 2.5],
  [(c) => P.rangeBreakDn(c) && P.retestBelowLastL(c), -1, 2.5],
  [(c) => P.rangeBreakUp(c) && P.htfBull(c), 1, 2.5],
  [(c) => P.rangeBreakDn(c) && P.htfBear(c), -1, 2.5],
  [(c) => P.rangeBreakUp(c) && P.alignBull(c), 1, 2],
  [(c) => P.rangeBreakDn(c) && P.alignBear(c), -1, 2],
  [(c) => P.rangeBreakUp(c) && P.rvolLow(c), 0, 2],
  [(c) => P.rangeBreakDn(c) && P.rvolLow(c), 0, 2]
]);

add('11.7', 'Range Fakeout Reversal', 11, { method: 'swing', stopMult: 1.2, rr: 2.8 }, [
  [(c) => P.rangeFakeUp(c), -1, 3],
  [(c) => P.rangeFakeDn(c), 1, 3],
  [(c) => P.rangeFakeUp(c) && P.pinBear(c), -1, 3],
  [(c) => P.rangeFakeDn(c) && P.pinBull(c), 1, 3],
  [(c) => P.rangeFakeUp(c) && P.volClimax(c), -1, 2.5],
  [(c) => P.rangeFakeDn(c) && P.volClimax(c), 1, 2.5],
  [(c) => P.rangeFakeUp(c) && P.rsiDivBear(c), -1, 2.5],
  [(c) => P.rangeFakeDn(c) && P.rsiDivBull(c), 1, 2.5],
  [(c) => P.rangeFakeUp(c) && P.htfBear(c), -1, 2],
  [(c) => P.rangeFakeDn(c) && P.htfBull(c), 1, 2]
]);

add('11.8', 'Range MTF Context', 11, { method: 'swing', stopMult: 1.3, rr: 2.6 }, [
  [(c) => P.rangeAtHigh(c) && P.h4Bear(c), -1, 3],
  [(c) => P.rangeAtLow(c) && P.h4Bull(c), 1, 3],
  [(c) => P.rangeAtHigh(c) && P.htfBear(c), -1, 2.5],
  [(c) => P.rangeAtLow(c) && P.htfBull(c), 1, 2.5],
  [(c) => P.rangeAtHigh(c) && P.h4Bull(c), 0, 2],
  [(c) => P.rangeAtLow(c) && P.h4Bear(c), 0, 2],
  [(c) => P.rangeBreakUp(c) && P.h4Bull(c), 1, 2.5],
  [(c) => P.rangeBreakDn(c) && P.h4Bear(c), -1, 2.5],
  [(c) => P.rangeAtMid(c) && P.h4Bull(c), 1, 1.5],
  [(c) => P.rangeAtMid(c) && P.h4Bear(c), -1, 1.5]
]);

add('11.9', 'Range Risk Filter', 11, { method: 'swing', stopMult: 1.4, rr: 2.0 }, [
  [(c) => P.rangeAtHigh(c) && P.spreadWide(c), 0, 2.5],
  [(c) => P.rangeAtLow(c) && P.spreadWide(c), 0, 2.5],
  [(c) => P.rangeAtHigh(c) && P.atrHigh(c), -1, 1.5],
  [(c) => P.rangeAtLow(c) && P.atrHigh(c), 1, 1.5],
  [(c) => P.rangeAtHigh(c) && P.atrNormal(c), -1, 2],
  [(c) => P.rangeAtLow(c) && P.atrNormal(c), 1, 2],
  [(c) => P.rangeAtHigh(c) && P.atrVeryHigh(c), 0, 2.5],
  [(c) => P.rangeAtLow(c) && P.atrVeryHigh(c), 0, 2.5],
  [(c) => P.rangeAtHigh(c) && P.spreadTight(c), -1, 2],
  [(c) => P.rangeAtLow(c) && P.spreadTight(c), 1, 2]
]);

add('11.10', 'Range Compiler', 11, { method: 'swing', stopMult: 1.2, rr: 2.5 }, [
  [(c) => P.rangeAtHigh(c) && P.pinBear(c) && P.rsiDivBear(c), -1, 3.5],
  [(c) => P.rangeAtLow(c) && P.pinBull(c) && P.rsiDivBull(c), 1, 3.5],
  [(c) => P.rangeBreakUp(c) && P.volSpike(c) && P.htfBull(c), 1, 3.5],
  [(c) => P.rangeBreakDn(c) && P.volSpike(c) && P.htfBear(c), -1, 3.5],
  [(c) => P.rangeFakeUp(c), -1, 2.5],
  [(c) => P.rangeFakeDn(c), 1, 2.5],
  [(c) => P.rangeAtHigh(c) && P.atResistance(c), -1, 2.5],
  [(c) => P.rangeAtLow(c) && P.atSupport(c), 1, 2.5],
  [(c) => P.rangeAtHigh(c), -1, 1.5],
  [(c) => P.rangeAtLow(c), 1, 1.5]
]);

// =================== CATEGORY 12: BREAKOUT & FAKEOUT =======================
add('12.1', 'Breakout Momentum', 12, { method: 'price', stopMult: 1.3, rr: 2.6 }, [
  [(c) => P.rangeBreakUp(c) && P.volSpike(c) && P.adxStrong(c), 1, 3.5],
  [(c) => P.rangeBreakDn(c) && P.volSpike(c) && P.adxStrong(c), -1, 3.5],
  [(c) => P.donchianBreakUp(c) && P.volSpike(c), 1, 3],
  [(c) => P.donchianBreakDn(c) && P.volSpike(c), -1, 3],
  [(c) => P.rangeBreakUp(c) && P.aboveVwap(c), 1, 2],
  [(c) => P.rangeBreakDn(c) && P.belowVwap(c), -1, 2],
  [(c) => P.rangeBreakUp(c) && P.tapeBull(c), 1, 2],
  [(c) => P.rangeBreakDn(c) && P.tapeBear(c), -1, 2],
  [(c) => P.rangeBreakUp(c) && P.rvolLow(c), 0, 2],
  [(c) => P.rangeBreakDn(c) && P.rvolLow(c), 0, 2]
]);

add('12.2', 'Breakout Retest', 12, { method: 'swing', stopMult: 1.2, rr: 2.6 }, [
  [(c) => P.rangeBreakUp(c) && P.retestAboveLastH(c), 1, 3],
  [(c) => P.rangeBreakDn(c) && P.retestBelowLastL(c), -1, 3],
  [(c) => P.brokeResistance(c) && P.retestAboveLastH(c), 1, 3],
  [(c) => P.brokeSupport(c) && P.retestBelowLastL(c), -1, 3],
  [(c) => P.rangeBreakUp(c) && P.atSupport(c), 1, 2.5],
  [(c) => P.rangeBreakDn(c) && P.atResistance(c), -1, 2.5],
  [(c) => P.rangeBreakUp(c) && P.pinBull(c), 1, 2],
  [(c) => P.rangeBreakDn(c) && P.pinBear(c), -1, 2],
  [(c) => P.rangeBreakUp(c), 1, 1.5],
  [(c) => P.rangeBreakDn(c), -1, 1.5]
]);

add('12.3', 'Fakeout Trapper', 12, { method: 'swing', stopMult: 1.2, rr: 2.8 }, [
  [(c) => P.rangeFakeUp(c), -1, 3],
  [(c) => P.rangeFakeDn(c), 1, 3],
  [(c) => P.closeBackBelowH(c), -1, 3],
  [(c) => P.closeBackAboveL(c), 1, 3],
  [(c) => P.rangeFakeUp(c) && P.pinBear(c), -1, 3],
  [(c) => P.rangeFakeDn(c) && P.pinBull(c), 1, 3],
  [(c) => P.rangeFakeUp(c) && P.volClimax(c), -1, 2.5],
  [(c) => P.rangeFakeDn(c) && P.volClimax(c), 1, 2.5],
  [(c) => P.rangeFakeUp(c) && P.rsiDivBear(c), -1, 2.5],
  [(c) => P.rangeFakeDn(c) && P.rsiDivBull(c), 1, 2.5]
]);

add('12.4', 'Breakout Volume Study', 12, { method: 'price', stopMult: 1.3, rr: 2.6 }, [
  [(c) => P.rangeBreakUp(c) && P.volClimax(c), 1, 2.5],
  [(c) => P.rangeBreakDn(c) && P.volClimax(c), -1, 2.5],
  [(c) => P.rangeBreakUp(c) && P.rvolHigh(c), 1, 2.5],
  [(c) => P.rangeBreakDn(c) && P.rvolHigh(c), -1, 2.5],
  [(c) => P.rangeBreakUp(c) && P.tapeBull(c), 1, 2],
  [(c) => P.rangeBreakDn(c) && P.tapeBear(c), -1, 2],
  [(c) => P.rangeBreakUp(c) && P.obvRising(c), 1, 2],
  [(c) => P.rangeBreakDn(c) && P.obvFalling(c), -1, 2],
  [(c) => P.rangeBreakUp(c) && P.volSpike(c) && P.tapeBear(c), 0, 2],
  [(c) => P.rangeBreakDn(c) && P.volSpike(c) && P.tapeBull(c), 0, 2]
]);

add('12.5', 'Breakout MTF', 12, { method: 'price', stopMult: 1.3, rr: 2.6 }, [
  [(c) => P.rangeBreakUp(c) && P.h4Bull(c), 1, 3],
  [(c) => P.rangeBreakDn(c) && P.h4Bear(c), -1, 3],
  [(c) => P.rangeBreakUp(c) && P.htfBull(c), 1, 2.5],
  [(c) => P.rangeBreakDn(c) && P.htfBear(c), -1, 2.5],
  [(c) => P.rangeBreakUp(c) && P.allTfBull(c), 1, 3.5],
  [(c) => P.rangeBreakDn(c) && P.allTfBear(c), -1, 3.5],
  [(c) => P.rangeBreakUp(c) && P.htfBear(c), 0, 2],
  [(c) => P.rangeBreakDn(c) && P.htfBull(c), 0, 2],
  [(c) => P.rangeBreakUp(c) && P.d1Bull(c), 1, 2],
  [(c) => P.rangeBreakDn(c) && P.d1Bear(c), -1, 2]
]);

add('12.6', 'Breakout Pullback Entry', 12, { method: 'ema21', stopMult: 1.2, rr: 2.4 }, [
  [(c) => P.rangeBreakUp(c) && P.htfPullbackBuy(c), 1, 3],
  [(c) => P.rangeBreakDn(c) && P.htfPullbackSell(c), -1, 3],
  [(c) => P.brokeResistance(c) && P.nearEma21At(c, 'low'), 1, 2.5],
  [(c) => P.brokeSupport(c) && P.nearEma21At(c, 'high'), -1, 2.5],
  [(c) => P.brokeResistance(c) && P.nearVwap(c), 1, 2],
  [(c) => P.brokeSupport(c) && P.nearVwap(c), -1, 2],
  [(c) => P.brokeResistance(c) && P.nearFib382(c), 1, 2],
  [(c) => P.brokeSupport(c) && P.nearFib618(c), -1, 2],
  [(c) => P.brokeResistance(c) && P.nearEma50At(c, 'low'), 1, 2],
  [(c) => P.brokeSupport(c) && P.nearEma50At(c, 'high'), -1, 2]
]);

add('12.7', 'Breakout Exhaustion', 12, { method: 'swing', stopMult: 1.2, rr: 2.8 }, [
  [(c) => P.rangeBreakUp(c) && P.volClimax(c) && P.rsiOB(c), -1, 3],
  [(c) => P.rangeBreakDn(c) && P.volClimax(c) && P.rsiOS(c), 1, 3],
  [(c) => P.rangeBreakUp(c) && P.aboveBBUp(c) && P.rsiOB(c), -1, 2.5],
  [(c) => P.rangeBreakDn(c) && P.belowBBLo(c) && P.rsiOS(c), 1, 2.5],
  [(c) => P.rangeBreakUp(c) && P.atrVeryHigh(c) && P.rsiOB(c), -1, 2.5],
  [(c) => P.rangeBreakDn(c) && P.atrVeryHigh(c) && P.rsiOS(c), 1, 2.5],
  [(c) => P.rangeBreakUp(c) && P.volClimax(c), 0, 2],
  [(c) => P.rangeBreakDn(c) && P.volClimax(c), 0, 2],
  [(c) => P.rangeBreakUp(c) && P.fundingHigh(c), -1, 2],
  [(c) => P.rangeBreakDn(c) && P.fundingLow(c), 1, 2]
]);

add('12.8', 'Breakout Risk Manager', 12, { method: 'price', stopMult: 1.4, rr: 2.0 }, [
  [(c) => P.rangeBreakUp(c) && P.spreadWide(c), 0, 2.5],
  [(c) => P.rangeBreakDn(c) && P.spreadWide(c), 0, 2.5],
  [(c) => P.rangeBreakUp(c) && P.atrVeryHigh(c), 0, 2.5],
  [(c) => P.rangeBreakDn(c) && P.atrVeryHigh(c), 0, 2.5],
  [(c) => P.rangeBreakUp(c) && P.atrNormal(c), 1, 2],
  [(c) => P.rangeBreakDn(c) && P.atrNormal(c), -1, 2],
  [(c) => P.rangeBreakUp(c) && P.spreadTight(c), 1, 2],
  [(c) => P.rangeBreakDn(c) && P.spreadTight(c), -1, 2],
  [(c) => P.rangeBreakUp(c) && P.atrLow(c), 1, 1.5],
  [(c) => P.rangeBreakDn(c) && P.atrLow(c), -1, 1.5]
]);

add('12.9', 'Breakout Pattern Confluence', 12, { method: 'price', stopMult: 1.2, rr: 2.5 }, [
  [(c) => P.rangeBreakUp(c) && P.engulfBull(c), 1, 3],
  [(c) => P.rangeBreakDn(c) && P.engulfBear(c), -1, 3],
  [(c) => P.rangeBreakUp(c) && P.marubozu(c) && P.upCandle(c), 1, 3],
  [(c) => P.rangeBreakDn(c) && P.marubozu(c) && P.downCandle(c), -1, 3],
  [(c) => P.rangeBreakUp(c) && P.threeWhite(c), 1, 2.5],
  [(c) => P.rangeBreakDn(c) && P.threeBlack(c), -1, 2.5],
  [(c) => P.rangeBreakUp(c) && P.rsiBull(c), 1, 2],
  [(c) => P.rangeBreakDn(c) && P.rsiBear(c), -1, 2],
  [(c) => P.rangeBreakUp(c) && P.aboveHull(c), 1, 1.5],
  [(c) => P.rangeBreakDn(c) && P.belowHull(c), -1, 1.5]
]);

add('12.10', 'Breakout Compiler', 12, { method: 'price', stopMult: 1.2, rr: 2.6 }, [
  [(c) => P.rangeBreakUp(c) && P.volSpike(c) && P.htfBull(c) && P.tapeBull(c), 1, 4],
  [(c) => P.rangeBreakDn(c) && P.volSpike(c) && P.htfBear(c) && P.tapeBear(c), -1, 4],
  [(c) => P.rangeBreakUp(c) && P.retestAboveLastH(c), 1, 3],
  [(c) => P.rangeBreakDn(c) && P.retestBelowLastL(c), -1, 3],
  [(c) => P.rangeFakeUp(c), -1, 2.5],
  [(c) => P.rangeFakeDn(c), 1, 2.5],
  [(c) => P.donchianBreakUp(c), 1, 2],
  [(c) => P.donchianBreakDn(c), -1, 2],
  [(c) => P.rangeBreakUp(c), 1, 1.5],
  [(c) => P.rangeBreakDn(c), -1, 1.5]
]);

// =================== CATEGORY 13: LIQUIDITY POOL MASTERS ===================
add('13.1', 'Buy-Side Liquidity Hunter', 13, { method: 'liq', stopMult: 1.2, rr: 2.6 }, [
  [(c) => P.nearBsl(c) && P.pinBear(c), -1, 3],
  [(c) => P.nearBsl(c) && P.atResistance(c), -1, 2.5],
  [(c) => P.nearBsl(c) && P.engulfBear(c), -1, 2.5],
  [(c) => P.nearBsl(c) && P.rsiDivBear(c), -1, 2.5],
  [(c) => P.sweptBsl(c), -1, 3],
  [(c) => P.nearBsl(c) && P.shootingStar(c), -1, 2.5],
  [(c) => P.nearBsl(c), -1, 2],
  [(c) => P.nearBsl(c) && P.volClimax(c), -1, 2],
  [(c) => P.nearBsl(c) && P.htfBear(c), -1, 2],
  [(c) => P.nearBsl(c) && P.alignBull(c), 0, 1.5]
]);

add('13.2', 'Sell-Side Liquidity Hunter', 13, { method: 'liq', stopMult: 1.2, rr: 2.6 }, [
  [(c) => P.nearSsl(c) && P.pinBull(c), 1, 3],
  [(c) => P.nearSsl(c) && P.atSupport(c), 1, 2.5],
  [(c) => P.nearSsl(c) && P.engulfBull(c), 1, 2.5],
  [(c) => P.nearSsl(c) && P.rsiDivBull(c), 1, 2.5],
  [(c) => P.sweptSsl(c), 1, 3],
  [(c) => P.nearSsl(c) && P.hammer(c), 1, 2.5],
  [(c) => P.nearSsl(c), 1, 2],
  [(c) => P.nearSsl(c) && P.volClimax(c), 1, 2],
  [(c) => P.nearSsl(c) && P.htfBull(c), 1, 2],
  [(c) => P.nearSsl(c) && P.alignBear(c), 0, 1.5]
]);

add('13.3', 'Liquidity Sweep Reversal', 13, { method: 'liq', stopMult: 1.2, rr: 2.8 }, [
  [(c) => P.sweptBsl(c) && P.pinBear(c), -1, 3.5],
  [(c) => P.sweptSsl(c) && P.pinBull(c), 1, 3.5],
  [(c) => P.sweptBsl(c) && P.rsiDivBear(c), -1, 3],
  [(c) => P.sweptSsl(c) && P.rsiDivBull(c), 1, 3],
  [(c) => P.sweptBsl(c) && P.volClimax(c), -1, 2.5],
  [(c) => P.sweptSsl(c) && P.volClimax(c), 1, 2.5],
  [(c) => P.sweptBsl(c) && P.engulfBear(c), -1, 2.5],
  [(c) => P.sweptSsl(c) && P.engulfBull(c), 1, 2.5],
  [(c) => P.sweptBsl(c), -1, 2],
  [(c) => P.sweptSsl(c), 1, 2]
]);

add('13.4', 'Liquidity Run Continuation', 13, { method: 'price', stopMult: 1.3, rr: 2.6 }, [
  [(c) => P.sweptBsl(c) && P.alignBull(c), 1, 2.5],
  [(c) => P.sweptSsl(c) && P.alignBear(c), -1, 2.5],
  [(c) => P.sweptBsl(c) && P.htfBull(c), 1, 2.5],
  [(c) => P.sweptSsl(c) && P.htfBear(c), -1, 2.5],
  [(c) => P.aboveBsl(c) && P.structUp(c), 1, 2.5],
  [(c) => P.belowSsl(c) && P.structDn(c), -1, 2.5],
  [(c) => P.sweptBsl(c) && P.volSpike(c), 1, 2],
  [(c) => P.sweptSsl(c) && P.volSpike(c), -1, 2],
  [(c) => P.aboveBsl(c), 1, 1.5],
  [(c) => P.belowSsl(c), -1, 1.5]
]);

add('13.5', 'Equal Highs Liquidity', 13, { method: 'liq', stopMult: 1.2, rr: 2.6 }, [
  [(c) => P.eqHighsNear(c) && P.pinBear(c), -1, 3],
  [(c) => P.eqLowsNear(c) && P.pinBull(c), 1, 3],
  [(c) => P.eqHighsNear(c) && P.atResistance(c), -1, 2.5],
  [(c) => P.eqLowsNear(c) && P.atSupport(c), 1, 2.5],
  [(c) => P.eqHighsNear(c) && P.rsiDivBear(c), -1, 2.5],
  [(c) => P.eqLowsNear(c) && P.rsiDivBull(c), 1, 2.5],
  [(c) => P.eqHighsSwept(c), -1, 2.5],
  [(c) => P.eqLowsSwept(c), 1, 2.5],
  [(c) => P.eqHighsNear(c), -1, 1.5],
  [(c) => P.eqLowsNear(c), 1, 1.5]
]);

add('13.6', 'Liquidity Order Block', 13, { method: 'ob', stopMult: 1.2, rr: 2.5 }, [
  [(c) => P.sweptBsl(c) && P.obBullNear(c), 1, 3],
  [(c) => P.sweptSsl(c) && P.obBearNear(c), -1, 3],
  [(c) => P.nearBsl(c) && P.obBullNear(c), 1, 2.5],
  [(c) => P.nearSsl(c) && P.obBearNear(c), -1, 2.5],
  [(c) => P.sweptBsl(c) && P.obBullNear(c) && P.pinBull(c), 1, 3.5],
  [(c) => P.sweptSsl(c) && P.obBearNear(c) && P.pinBear(c), -1, 3.5],
  [(c) => P.aboveBsl(c) && P.obBullNear(c), 1, 2],
  [(c) => P.belowSsl(c) && P.obBearNear(c), -1, 2],
  [(c) => P.nearBsl(c), -1, 1.5],
  [(c) => P.nearSsl(c), 1, 1.5]
]);

add('13.7', 'Liquidity Volume Confirm', 13, { method: 'liq', stopMult: 1.2, rr: 2.4 }, [
  [(c) => P.sweptBsl(c) && P.volClimax(c), -1, 3],
  [(c) => P.sweptSsl(c) && P.volClimax(c), 1, 3],
  [(c) => P.nearBsl(c) && P.volSpike(c), -1, 2],
  [(c) => P.nearSsl(c) && P.volSpike(c), 1, 2],
  [(c) => P.sweptBsl(c) && P.tapeBear(c), -1, 2.5],
  [(c) => P.sweptSsl(c) && P.tapeBull(c), 1, 2.5],
  [(c) => P.sweptBsl(c) && P.deltaNeg(c), -1, 2],
  [(c) => P.sweptSsl(c) && P.deltaPos(c), 1, 2],
  [(c) => P.nearBsl(c) && P.rvolLow(c), 0, 1.5],
  [(c) => P.nearSsl(c) && P.rvolLow(c), 0, 1.5]
]);

add('13.8', 'Liquidity MTF', 13, { method: 'liq', stopMult: 1.3, rr: 2.6 }, [
  [(c) => P.nearBsl(c) && P.h4Bear(c), -1, 3],
  [(c) => P.nearSsl(c) && P.h4Bull(c), 1, 3],
  [(c) => P.sweptBsl(c) && P.h4Bear(c), -1, 3],
  [(c) => P.sweptSsl(c) && P.h4Bull(c), 1, 3],
  [(c) => P.nearBsl(c) && P.htfBear(c), -1, 2.5],
  [(c) => P.nearSsl(c) && P.htfBull(c), 1, 2.5],
  [(c) => P.nearBsl(c) && P.h4Bull(c), 0, 2],
  [(c) => P.nearSsl(c) && P.h4Bear(c), 0, 2],
  [(c) => P.sweptBsl(c) && P.htfBull(c), 1, 2],
  [(c) => P.sweptSsl(c) && P.htfBear(c), -1, 2]
]);

add('13.9', 'Liquidity Risk Filter', 13, { method: 'liq', stopMult: 1.4, rr: 2.0 }, [
  [(c) => P.nearBsl(c) && P.spreadWide(c), 0, 2.5],
  [(c) => P.nearSsl(c) && P.spreadWide(c), 0, 2.5],
  [(c) => P.nearBsl(c) && P.atrVeryHigh(c), 0, 2.5],
  [(c) => P.nearSsl(c) && P.atrVeryHigh(c), 0, 2.5],
  [(c) => P.sweptBsl(c) && P.atrHigh(c), -1, 1.5],
  [(c) => P.sweptSsl(c) && P.atrHigh(c), 1, 1.5],
  [(c) => P.nearBsl(c) && P.atrNormal(c), -1, 2],
  [(c) => P.nearSsl(c) && P.atrNormal(c), 1, 2],
  [(c) => P.nearBsl(c) && P.spreadTight(c), -1, 1.5],
  [(c) => P.nearSsl(c) && P.spreadTight(c), 1, 1.5]
]);

add('13.10', 'Liquidity Compiler', 13, { method: 'liq', stopMult: 1.2, rr: 2.6 }, [
  [(c) => P.sweptBsl(c) && P.rsiDivBear(c) && P.volClimax(c), -1, 4],
  [(c) => P.sweptSsl(c) && P.rsiDivBull(c) && P.volClimax(c), 1, 4],
  [(c) => P.sweptBsl(c) && P.engulfBear(c), -1, 3],
  [(c) => P.sweptSsl(c) && P.engulfBull(c), 1, 3],
  [(c) => P.nearBsl(c) && P.atResistance(c), -1, 2.5],
  [(c) => P.nearSsl(c) && P.atSupport(c), 1, 2.5],
  [(c) => P.sweptBsl(c), -1, 2],
  [(c) => P.sweptSsl(c), 1, 2],
  [(c) => P.nearBsl(c), -1, 1.5],
  [(c) => P.nearSsl(c), 1, 1.5]
]);

// =================== CATEGORY 14: VOLUME PROFILE MASTERS ===================
add('14.1', 'POC Magnet Trader', 14, { method: 'vp', stopMult: 1.2, rr: 2.2 }, [
  [(c) => P.aboveVah(c) && P.atPoc(c) === false, -1, 2],
  [(c) => P.belowVal(c), 1, 2],
  [(c) => P.atPoc(c) && P.alignBull(c), 1, 2],
  [(c) => P.atPoc(c) && P.alignBear(c), -1, 2],
  [(c) => P.atPoc(c) && P.pinBull(c), 1, 2.5],
  [(c) => P.atPoc(c) && P.pinBear(c), -1, 2.5],
  [(c) => P.atPoc(c) && P.squeezeOn(c), 0, 2],
  [(c) => P.abovePocToVah(c), -1, 1.5],
  [(c) => P.belowPocToVal(c), 1, 1.5],
  [(c) => P.vpTight(c), 0, 1.5]
]);

add('14.2', 'Value Area High Rejection', 14, { method: 'vp', stopMult: 1.2, rr: 2.4 }, [
  [(c) => P.atVah(c) && P.pinBear(c), -1, 3],
  [(c) => P.atVah(c) && P.engulfBear(c), -1, 2.5],
  [(c) => P.atVah(c) && P.rsiOB(c), -1, 2.5],
  [(c) => P.atVah(c) && P.rsiDivBear(c), -1, 2.5],
  [(c) => P.atVah(c) && P.atResistance(c), -1, 2.5],
  [(c) => P.atVah(c), -1, 2],
  [(c) => P.atVah(c) && P.volClimax(c), -1, 2],
  [(c) => P.aboveVah(c), -1, 2],
  [(c) => P.atVah(c) && P.htfBear(c), -1, 2],
  [(c) => P.atVah(c) && P.alignBull(c), 0, 1.5]
]);

add('14.3', 'Value Area Low Support', 14, { method: 'vp', stopMult: 1.2, rr: 2.4 }, [
  [(c) => P.atVal(c) && P.pinBull(c), 1, 3],
  [(c) => P.atVal(c) && P.engulfBull(c), 1, 2.5],
  [(c) => P.atVal(c) && P.rsiOS(c), 1, 2.5],
  [(c) => P.atVal(c) && P.rsiDivBull(c), 1, 2.5],
  [(c) => P.atVal(c) && P.atSupport(c), 1, 2.5],
  [(c) => P.atVal(c), 1, 2],
  [(c) => P.atVal(c) && P.volClimax(c), 1, 2],
  [(c) => P.belowVal(c), 1, 2],
  [(c) => P.atVal(c) && P.htfBull(c), 1, 2],
  [(c) => P.atVal(c) && P.alignBear(c), 0, 1.5]
]);

add('14.4', 'Value Area Breakout', 14, { method: 'price', stopMult: 1.3, rr: 2.6 }, [
  [(c) => P.aboveVah(c) && P.volSpike(c), 1, 3],
  [(c) => P.belowVal(c) && P.volSpike(c), -1, 3],
  [(c) => P.aboveVah(c) && P.retestAboveLastH(c), 1, 2.5],
  [(c) => P.belowVal(c) && P.retestBelowLastL(c), -1, 2.5],
  [(c) => P.aboveVah(c) && P.htfBull(c), 1, 2.5],
  [(c) => P.belowVal(c) && P.htfBear(c), -1, 2.5],
  [(c) => P.aboveVah(c) && P.alignBull(c), 1, 2],
  [(c) => P.belowVal(c) && P.alignBear(c), -1, 2],
  [(c) => P.aboveVah(c) && P.rvolLow(c), 0, 2],
  [(c) => P.belowVal(c) && P.rvolLow(c), 0, 2]
]);

add('14.5', 'Volume Profile MTF', 14, { method: 'vp', stopMult: 1.3, rr: 2.6 }, [
  [(c) => P.atPoc(c) && P.h4Bull(c), 1, 2.5],
  [(c) => P.atPoc(c) && P.h4Bear(c), -1, 2.5],
  [(c) => P.atVah(c) && P.h4Bear(c), -1, 3],
  [(c) => P.atVal(c) && P.h4Bull(c), 1, 3],
  [(c) => P.atPoc(c) && P.htfBull(c), 1, 2],
  [(c) => P.atPoc(c) && P.htfBear(c), -1, 2],
  [(c) => P.aboveVah(c) && P.h4Bull(c), 1, 2.5],
  [(c) => P.belowVal(c) && P.h4Bear(c), -1, 2.5],
  [(c) => P.atPoc(c) && P.h4Bull(c) && P.alignBull(c), 1, 3],
  [(c) => P.atPoc(c) && P.h4Bear(c) && P.alignBear(c), -1, 3]
]);

add('14.6', 'Profile Shape Analyst', 14, { method: 'price', stopMult: 1.2, rr: 2.2 }, [
  [(c) => P.vpTight(c) && P.volSpike(c), 0, 2],
  [(c) => P.vpWide(c) && P.volSpike(c), 0, 2],
  [(c) => P.atPoc(c) && P.rvolHigh(c), 1, 2],
  [(c) => P.atPoc(c) && P.rvolLow(c), 0, 2],
  [(c) => P.vpTight(c) && P.squeezeOn(c), 0, 2],
  [(c) => P.vpWide(c) && P.atrHigh(c), 0, 2],
  [(c) => P.atPoc(c) && P.pinBull(c), 1, 2],
  [(c) => P.atPoc(c) && P.pinBear(c), -1, 2],
  [(c) => P.atVah(c) && P.volClimax(c), -1, 2],
  [(c) => P.atVal(c) && P.volClimax(c), 1, 2]
]);

add('14.7', 'Profile Order Flow', 14, { method: 'vp', stopMult: 1.2, rr: 2.4 }, [
  [(c) => P.atPoc(c) && P.tapeBull(c), 1, 2],
  [(c) => P.atPoc(c) && P.tapeBear(c), -1, 2],
  [(c) => P.atVal(c) && P.tapeBull(c), 1, 2.5],
  [(c) => P.atVah(c) && P.tapeBear(c), -1, 2.5],
  [(c) => P.atPoc(c) && P.deltaPos(c), 1, 2],
  [(c) => P.atPoc(c) && P.deltaNeg(c), -1, 2],
  [(c) => P.aboveVah(c) && P.bigBuyDominates(c), 1, 2],
  [(c) => P.belowVal(c) && P.bigSellDominates(c), -1, 2],
  [(c) => P.atPoc(c) && P.cvdRising(c), 1, 1.5],
  [(c) => P.atPoc(c) && P.cvdFalling(c), -1, 1.5]
]);

add('14.8', 'Profile Risk Filter', 14, { method: 'vp', stopMult: 1.4, rr: 2.0 }, [
  [(c) => P.atPoc(c) && P.spreadWide(c), 0, 2.5],
  [(c) => P.atVah(c) && P.spreadWide(c), 0, 2.5],
  [(c) => P.atVal(c) && P.spreadWide(c), 0, 2.5],
  [(c) => P.atPoc(c) && P.atrVeryHigh(c), 0, 2.5],
  [(c) => P.atPoc(c) && P.atrNormal(c), 1, 2],
  [(c) => P.atPoc(c) && P.atrNormal(c), -1, 2],
  [(c) => P.atPoc(c) && P.atrHigh(c), 0, 2],
  [(c) => P.atVah(c) && P.atrNormal(c), -1, 2],
  [(c) => P.atVal(c) && P.atrNormal(c), 1, 2],
  [(c) => P.vpInValue(c) && P.spreadTight(c), 0, 1.5]
]);

add('14.9', 'Profile Session Analysis', 14, { method: 'vp', stopMult: 1.2, rr: 2.4 }, [
  [(c) => P.atPoc(c) && P.newyork(c), 1, 2],
  [(c) => P.atPoc(c) && P.asia(c), 0, 1.5],
  [(c) => P.atVah(c) && P.nyLondonOverlap(c), -1, 2.5],
  [(c) => P.atVal(c) && P.nyLondonOverlap(c), 1, 2.5],
  [(c) => P.atPoc(c) && P.sessionYoung(c), 1, 2],
  [(c) => P.aboveVah(c) && P.sessionMature(c), 1, 2],
  [(c) => P.belowVal(c) && P.sessionMature(c), -1, 2],
  [(c) => P.atPoc(c) && P.london(c), 1, 2],
  [(c) => P.atPoc(c) && P.sessionMature(c), 0, 1.5],
  [(c) => P.atPoc(c), 0, 1]
]);

add('14.10', 'Profile Compiler', 14, { method: 'vp', stopMult: 1.2, rr: 2.5 }, [
  [(c) => P.atVal(c) && P.pinBull(c) && P.volSpike(c), 1, 3.5],
  [(c) => P.atVah(c) && P.pinBear(c) && P.volSpike(c), -1, 3.5],
  [(c) => P.aboveVah(c) && P.retestAboveLastH(c), 1, 3],
  [(c) => P.belowVal(c) && P.retestBelowLastL(c), -1, 3],
  [(c) => P.atPoc(c) && P.alignBull(c), 1, 2.5],
  [(c) => P.atPoc(c) && P.alignBear(c), -1, 2.5],
  [(c) => P.atVal(c) && P.atSupport(c), 1, 2.5],
  [(c) => P.atVah(c) && P.atResistance(c), -1, 2.5],
  [(c) => P.atPoc(c), 0, 1.5],
  [(c) => P.vpInValue(c), 0, 1.5]
]);

// =================== CATEGORY 15: VOLUME SPIKE MASTERS =====================
add('15.1', 'Volume Spike Breakout', 15, { method: 'price', stopMult: 1.3, rr: 2.6 }, [
  [(c) => P.volSpike(c) && P.upCandle(c) && P.brokeResistance(c), 1, 3.5],
  [(c) => P.volSpike(c) && P.downCandle(c) && P.brokeSupport(c), -1, 3.5],
  [(c) => P.volSpike(c) && P.upCandle(c) && P.aboveEma21(c), 1, 2.5],
  [(c) => P.volSpike(c) && P.downCandle(c) && P.belowEma21(c), -1, 2.5],
  [(c) => P.volSpike(c) && P.upCandle(c) && P.rangeBreakUp(c), 1, 3],
  [(c) => P.volSpike(c) && P.downCandle(c) && P.rangeBreakDn(c), -1, 3],
  [(c) => P.volSpike(c) && P.upCandle(c) && P.htfBull(c), 1, 2],
  [(c) => P.volSpike(c) && P.downCandle(c) && P.htfBear(c), -1, 2],
  [(c) => P.volSpike(c) && P.upCandle(c), 1, 2],
  [(c) => P.volSpike(c) && P.downCandle(c), -1, 2]
]);

add('15.2', 'Volume Spike Exhaustion', 15, { method: 'swing', stopMult: 1.2, rr: 2.8 }, [
  [(c) => P.volClimax(c) && P.upCandle(c) && P.rsiOB(c), -1, 3.5],
  [(c) => P.volClimax(c) && P.downCandle(c) && P.rsiOS(c), 1, 3.5],
  [(c) => P.volClimax(c) && P.upCandle(c) && P.aboveBBUp(c), -1, 3],
  [(c) => P.volClimax(c) && P.downCandle(c) && P.belowBBLo(c), 1, 3],
  [(c) => P.volClimax(c) && P.upCandle(c) && P.atLastH(c), -1, 3],
  [(c) => P.volClimax(c) && P.downCandle(c) && P.atLastL(c), 1, 3],
  [(c) => P.volClimax(c) && P.upCandle(c), 0, 2],
  [(c) => P.volClimax(c) && P.downCandle(c), 0, 2],
  [(c) => P.volClimax(c) && P.upCandle(c) && P.fundingHigh(c), -1, 2.5],
  [(c) => P.volClimax(c) && P.downCandle(c) && P.fundingLow(c), 1, 2.5]
]);

add('15.3', 'Volume Spike Divergence', 15, { method: 'price', stopMult: 1.2, rr: 2.6 }, [
  [(c) => P.volSpike(c) && P.upCandle(c) && P.rsiDivBear(c), -1, 3],
  [(c) => P.volSpike(c) && P.downCandle(c) && P.rsiDivBull(c), 1, 3],
  [(c) => P.volSpike(c) && P.upCandle(c) && P.macdHistFalling(c), -1, 2.5],
  [(c) => P.volSpike(c) && P.downCandle(c) && P.macdHistRising(c), 1, 2.5],
  [(c) => P.volSpike(c) && P.upCandle(c) && P.obvFalling(c), -1, 2.5],
  [(c) => P.volSpike(c) && P.downCandle(c) && P.obvRising(c), 1, 2.5],
  [(c) => P.volSpike(c) && P.upCandle(c) && P.cvdFalling(c), -1, 2],
  [(c) => P.volSpike(c) && P.downCandle(c) && P.cvdRising(c), 1, 2],
  [(c) => P.volSpike(c) && P.upCandle(c) && P.mfiBear(c), -1, 2],
  [(c) => P.volSpike(c) && P.downCandle(c) && P.mfiBull(c), 1, 2]
]);

add('15.4', 'Volume Spike Absorption', 15, { method: 'swing', stopMult: 1.2, rr: 2.6 }, [
  [(c) => P.volSpike(c) && P.upCandle(c) && P.bidAbsorbing(c), 1, 3],
  [(c) => P.volSpike(c) && P.downCandle(c) && P.askAbsorbing(c), -1, 3],
  [(c) => P.volSpike(c) && P.upCandle(c) && P.bidWallAbove(c), 1, 2.5],
  [(c) => P.volSpike(c) && P.downCandle(c) && P.askWallBelow(c), -1, 2.5],
  [(c) => P.volSpike(c) && P.upCandle(c) && P.priceHeldBid(c), 1, 2.5],
  [(c) => P.volSpike(c) && P.downCandle(c) && P.priceHeldAsk(c), -1, 2.5],
  [(c) => P.volSpike(c) && P.upCandle(c) && P.bookBalanced(c), 0, 1.5],
  [(c) => P.volSpike(c) && P.downCandle(c) && P.bookBalanced(c), 0, 1.5],
  [(c) => P.volSpike(c) && P.upCandle(c) && P.askWallBelow(c), 0, 2],
  [(c) => P.volSpike(c) && P.downCandle(c) && P.bidWallAbove(c), 0, 2]
]);

add('15.5', 'Volume Spike MTF', 15, { method: 'price', stopMult: 1.3, rr: 2.6 }, [
  [(c) => P.volSpike(c) && P.upCandle(c) && P.h4Bull(c), 1, 3],
  [(c) => P.volSpike(c) && P.downCandle(c) && P.h4Bear(c), -1, 3],
  [(c) => P.volSpike(c) && P.upCandle(c) && P.htfBull(c), 1, 2.5],
  [(c) => P.volSpike(c) && P.downCandle(c) && P.htfBear(c), -1, 2.5],
  [(c) => P.volSpike(c) && P.upCandle(c) && P.allTfBull(c), 1, 3.5],
  [(c) => P.volSpike(c) && P.downCandle(c) && P.allTfBear(c), -1, 3.5],
  [(c) => P.volSpike(c) && P.upCandle(c) && P.htfBear(c), 0, 2],
  [(c) => P.volSpike(c) && P.downCandle(c) && P.htfBull(c), 0, 2],
  [(c) => P.volSpike(c) && P.upCandle(c) && P.m5Bull(c), 1, 2],
  [(c) => P.volSpike(c) && P.downCandle(c) && P.m5Bear(c), -1, 2]
]);

add('15.6', 'Volume Spike Reversal Pin', 15, { method: 'swing', stopMult: 1.2, rr: 2.6 }, [
  [(c) => P.volSpike(c) && P.pinBull(c), 1, 3],
  [(c) => P.volSpike(c) && P.pinBear(c), -1, 3],
  [(c) => P.volSpike(c) && P.hammer(c), 1, 3],
  [(c) => P.volSpike(c) && P.shootingStar(c), -1, 3],
  [(c) => P.volSpike(c) && P.engulfBull(c), 1, 2.5],
  [(c) => P.volSpike(c) && P.engulfBear(c), -1, 2.5],
  [(c) => P.volSpike(c) && P.doji(c), 0, 2],
  [(c) => P.volSpike(c) && P.pinBull(c) && P.atSupport(c), 1, 3.5],
  [(c) => P.volSpike(c) && P.pinBear(c) && P.atResistance(c), -1, 3.5],
  [(c) => P.volSpike(c) && P.doji(c) && P.atSupport(c), 1, 2]
]);

add('15.7', 'Volume Spike Relative Study', 15, { method: 'price', stopMult: 1.2, rr: 2.4 }, [
  [(c) => P.rvolHigh(c) && P.upCandle(c) && P.alignBull(c), 1, 2.5],
  [(c) => P.rvolHigh(c) && P.downCandle(c) && P.alignBear(c), -1, 2.5],
  [(c) => P.rvolLow(c) && P.upCandle(c), 0, 2],
  [(c) => P.rvolLow(c) && P.downCandle(c), 0, 2],
  [(c) => P.rvolHigh(c) && P.upCandle(c) && P.atSupport(c), 1, 2.5],
  [(c) => P.rvolHigh(c) && P.downCandle(c) && P.atResistance(c), -1, 2.5],
  [(c) => P.rvolHigh(c) && P.upCandle(c) && P.aboveVwap(c), 1, 2],
  [(c) => P.rvolHigh(c) && P.downCandle(c) && P.belowVwap(c), -1, 2],
  [(c) => P.rvolHigh(c) && P.upCandle(c) && P.rsiOS(c), 1, 2],
  [(c) => P.rvolHigh(c) && P.downCandle(c) && P.rsiOB(c), -1, 2]
]);

add('15.8', 'Volume Spike Risk Filter', 15, { method: 'price', stopMult: 1.4, rr: 2.0 }, [
  [(c) => P.volSpike(c) && P.atrVeryHigh(c), 0, 3],
  [(c) => P.volClimax(c) && P.atrVeryHigh(c), 0, 3],
  [(c) => P.volSpike(c) && P.spreadWide(c), 0, 2.5],
  [(c) => P.volSpike(c) && P.atrNormal(c), 1, 2],
  [(c) => P.volSpike(c) && P.atrNormal(c), -1, 2],
  [(c) => P.volSpike(c) && P.spreadTight(c), 1, 1.5],
  [(c) => P.volSpike(c) && P.spreadTight(c), -1, 1.5],
  [(c) => P.volSpike(c) && P.atrLow(c), 0, 1.5],
  [(c) => P.volSpike(c) && P.alignMixed(c), 0, 2],
  [(c) => P.volSpike(c), 0, 1]
]);

add('15.9', 'Volume Spike Tape', 15, { method: 'price', stopMult: 1.2, rr: 2.4 }, [
  [(c) => P.volSpike(c) && P.tapeBull(c), 1, 2.5],
  [(c) => P.volSpike(c) && P.tapeBear(c), -1, 2.5],
  [(c) => P.volSpike(c) && P.bigBuyDominates(c), 1, 3],
  [(c) => P.volSpike(c) && P.bigSellDominates(c), -1, 3],
  [(c) => P.volSpike(c) && P.deltaPos(c), 1, 2],
  [(c) => P.volSpike(c) && P.deltaNeg(c), -1, 2],
  [(c) => P.volSpike(c) && P.cvdRising(c), 1, 2],
  [(c) => P.volSpike(c) && P.cvdFalling(c), -1, 2],
  [(c) => P.volSpike(c) && P.tapeNeutral(c), 0, 2],
  [(c) => P.volSpike(c) && P.upCandle(c) && P.tapeBear(c), 0, 2]
]);

add('15.10', 'Volume Spike Compiler', 15, { method: 'price', stopMult: 1.2, rr: 2.6 }, [
  [(c) => P.volSpike(c) && P.upCandle(c) && P.htfBull(c) && P.tapeBull(c), 1, 4],
  [(c) => P.volSpike(c) && P.downCandle(c) && P.htfBear(c) && P.tapeBear(c), -1, 4],
  [(c) => P.volSpike(c) && P.upCandle(c) && P.brokeResistance(c), 1, 3],
  [(c) => P.volSpike(c) && P.downCandle(c) && P.brokeSupport(c), -1, 3],
  [(c) => P.volClimax(c) && P.rsiOB(c) && P.upCandle(c), -1, 3],
  [(c) => P.volClimax(c) && P.rsiOS(c) && P.downCandle(c), 1, 3],
  [(c) => P.volSpike(c) && P.pinBull(c), 1, 2.5],
  [(c) => P.volSpike(c) && P.pinBear(c), -1, 2.5],
  [(c) => P.volSpike(c) && P.upCandle(c), 1, 1.5],
  [(c) => P.volSpike(c) && P.downCandle(c), -1, 1.5]
]);

// =================== CATEGORY 16: CVD & DELTA MASTERS ======================
add('16.1', 'CVD Trend Follower', 16, { method: 'price', stopMult: 1.2, rr: 2.4 }, [
  [(c) => P.cvdRising(c) && P.upCandle(c), 1, 2.5],
  [(c) => P.cvdFalling(c) && P.downCandle(c), -1, 2.5],
  [(c) => P.cvdRising(c) && P.aboveEma21(c), 1, 2],
  [(c) => P.cvdFalling(c) && P.belowEma21(c), -1, 2],
  [(c) => P.cvdRising(c) && P.alignBull(c), 1, 2.5],
  [(c) => P.cvdFalling(c) && P.alignBear(c), -1, 2.5],
  [(c) => P.cvdRising(c) && P.volSpike(c), 1, 2],
  [(c) => P.cvdFalling(c) && P.volSpike(c), -1, 2],
  [(c) => P.cvdRising(c) && P.rvolLow(c), 0, 1.5],
  [(c) => P.cvdFalling(c) && P.rvolLow(c), 0, 1.5]
]);

add('16.2', 'Delta Divergence Hunter', 16, { method: 'swing', stopMult: 1.2, rr: 2.8 }, [
  [(c) => P.deltaNeg(c) && P.upCandle(c), -1, 3],
  [(c) => P.deltaPos(c) && P.downCandle(c), 1, 3],
  [(c) => P.cvdFalling(c) && P.priceRising(c), -1, 3],
  [(c) => P.cvdRising(c) && P.priceFalling(c), 1, 3],
  [(c) => P.deltaNeg(c) && P.upCandle(c) && P.aboveEma21(c), -1, 3],
  [(c) => P.deltaPos(c) && P.downCandle(c) && P.belowEma21(c), 1, 3],
  [(c) => P.cvdFalling(c) && P.atLastH(c), -1, 2.5],
  [(c) => P.cvdRising(c) && P.atLastL(c), 1, 2.5],
  [(c) => P.deltaNeg(c) && P.upCandle(c) && P.volSpike(c), -1, 3.5],
  [(c) => P.deltaPos(c) && P.downCandle(c) && P.volSpike(c), 1, 3.5]
]);

add('16.3', 'Delta Climax Trader', 16, { method: 'swing', stopMult: 1.2, rr: 2.8 }, [
  [(c) => P.deltaExtremePos(c), -1, 3],
  [(c) => P.deltaExtremeNeg(c), 1, 3],
  [(c) => P.deltaExtremePos(c) && P.upCandle(c), -1, 3],
  [(c) => P.deltaExtremeNeg(c) && P.downCandle(c), 1, 3],
  [(c) => P.deltaExtremePos(c) && P.atLastH(c), -1, 3],
  [(c) => P.deltaExtremeNeg(c) && P.atLastL(c), 1, 3],
  [(c) => P.deltaExtremePos(c) && P.rsiOB(c), -1, 2.5],
  [(c) => P.deltaExtremeNeg(c) && P.rsiOS(c), 1, 2.5],
  [(c) => P.deltaExtremePos(c) && P.volClimax(c), -1, 2.5],
  [(c) => P.deltaExtremeNeg(c) && P.volClimax(c), 1, 2.5]
]);

add('16.4', 'CVD Volume Confluence', 16, { method: 'price', stopMult: 1.2, rr: 2.4 }, [
  [(c) => P.cvdRising(c) && P.obvRising(c), 1, 3],
  [(c) => P.cvdFalling(c) && P.obvFalling(c), -1, 3],
  [(c) => P.cvdRising(c) && P.volSpike(c) && P.upCandle(c), 1, 3],
  [(c) => P.cvdFalling(c) && P.volSpike(c) && P.downCandle(c), -1, 3],
  [(c) => P.cvdRising(c) && P.tapeBull(c), 1, 2],
  [(c) => P.cvdFalling(c) && P.tapeBear(c), -1, 2],
  [(c) => P.cvdRising(c) && P.mfiBull(c), 1, 2],
  [(c) => P.cvdFalling(c) && P.mfiBear(c), -1, 2],
  [(c) => P.cvdRising(c) && P.rvolLow(c), 0, 1.5],
  [(c) => P.cvdFalling(c) && P.rvolLow(c), 0, 1.5]
]);

add('16.5', 'CVD MTF', 16, { method: 'price', stopMult: 1.3, rr: 2.6 }, [
  [(c) => P.cvdRising(c) && P.h4Bull(c), 1, 3],
  [(c) => P.cvdFalling(c) && P.h4Bear(c), -1, 3],
  [(c) => P.cvdRising(c) && P.htfBull(c), 1, 2.5],
  [(c) => P.cvdFalling(c) && P.htfBear(c), -1, 2.5],
  [(c) => P.cvdRising(c) && P.htfBear(c), 0, 2],
  [(c) => P.cvdFalling(c) && P.htfBull(c), 0, 2],
  [(c) => P.cvdRising(c) && P.allTfBull(c), 1, 3.5],
  [(c) => P.cvdFalling(c) && P.allTfBear(c), -1, 3.5],
  [(c) => P.cvdRising(c) && P.m5Bull(c), 1, 2],
  [(c) => P.cvdFalling(c) && P.m5Bear(c), -1, 2]
]);

add('16.6', 'CVD Level Confluence', 16, { method: 'swing', stopMult: 1.2, rr: 2.6 }, [
  [(c) => P.cvdRising(c) && P.atSupport(c), 1, 3],
  [(c) => P.cvdFalling(c) && P.atResistance(c), -1, 3],
  [(c) => P.cvdRising(c) && P.retestAboveLastH(c), 1, 3],
  [(c) => P.cvdFalling(c) && P.retestBelowLastL(c), -1, 3],
  [(c) => P.cvdRising(c) && P.atLastL(c), 1, 2.5],
  [(c) => P.cvdFalling(c) && P.atLastH(c), -1, 2.5],
  [(c) => P.cvdRising(c) && P.nearSsl(c), 1, 2.5],
  [(c) => P.cvdFalling(c) && P.nearBsl(c), -1, 2.5],
  [(c) => P.cvdRising(c) && P.atPoc(c), 1, 2],
  [(c) => P.cvdFalling(c) && P.atPoc(c), -1, 2]
]);

add('16.7', 'Delta Bar Study', 16, { method: 'price', stopMult: 1.2, rr: 2.4 }, [
  [(c) => P.deltaPos(c) && P.upCandle(c) && P.bigBody(c), 1, 3],
  [(c) => P.deltaNeg(c) && P.downCandle(c) && P.bigBody(c), -1, 3],
  [(c) => P.deltaPos(c) && P.upCandle(c) && P.volSpike(c), 1, 2.5],
  [(c) => P.deltaNeg(c) && P.downCandle(c) && P.volSpike(c), -1, 2.5],
  [(c) => P.deltaPos(c) && P.downCandle(c), 0, 2],
  [(c) => P.deltaNeg(c) && P.upCandle(c), 0, 2],
  [(c) => P.deltaPos(c) && P.upCandle(c) && P.alignBull(c), 1, 2.5],
  [(c) => P.deltaNeg(c) && P.downCandle(c) && P.alignBear(c), -1, 2.5],
  [(c) => P.deltaPos(c) && P.upCandle(c) && P.rvolLow(c), 0, 1.5],
  [(c) => P.deltaNeg(c) && P.downCandle(c) && P.rvolLow(c), 0, 1.5]
]);

add('16.8', 'CVD Risk Filter', 16, { method: 'price', stopMult: 1.4, rr: 2.0 }, [
  [(c) => P.cvdRising(c) && P.spreadWide(c), 0, 2.5],
  [(c) => P.cvdFalling(c) && P.spreadWide(c), 0, 2.5],
  [(c) => P.cvdRising(c) && P.atrVeryHigh(c), 0, 2.5],
  [(c) => P.cvdFalling(c) && P.atrVeryHigh(c), 0, 2.5],
  [(c) => P.cvdRising(c) && P.atrNormal(c), 1, 2],
  [(c) => P.cvdFalling(c) && P.atrNormal(c), -1, 2],
  [(c) => P.cvdRising(c) && P.atrHigh(c), 1, 1.5],
  [(c) => P.cvdFalling(c) && P.atrHigh(c), -1, 1.5],
  [(c) => P.cvdRising(c) && P.alignMixed(c), 0, 1.5],
  [(c) => P.cvdFalling(c) && P.alignMixed(c), 0, 1.5]
]);

add('16.9', 'Delta Order Flow', 16, { method: 'price', stopMult: 1.2, rr: 2.4 }, [
  [(c) => P.deltaPos(c) && P.bigBuyDominates(c), 1, 3],
  [(c) => P.deltaNeg(c) && P.bigSellDominates(c), -1, 3],
  [(c) => P.cvdRising(c) && P.tapeBull(c), 1, 2.5],
  [(c) => P.cvdFalling(c) && P.tapeBear(c), -1, 2.5],
  [(c) => P.deltaPos(c) && P.bidAbsorbing(c), 1, 2.5],
  [(c) => P.deltaNeg(c) && P.askAbsorbing(c), -1, 2.5],
  [(c) => P.cvdRising(c) && P.takerBuyHeavy(c), 1, 2],
  [(c) => P.cvdFalling(c) && P.takerSellHeavy(c), -1, 2],
  [(c) => P.deltaPos(c) && P.tapeNeutral(c), 0, 1.5],
  [(c) => P.deltaNeg(c) && P.tapeNeutral(c), 0, 1.5]
]);

add('16.10', 'CVD Compiler', 16, { method: 'price', stopMult: 1.2, rr: 2.6 }, [
  [(c) => P.cvdRising(c) && P.htfBull(c) && P.atSupport(c), 1, 4],
  [(c) => P.cvdFalling(c) && P.htfBear(c) && P.atResistance(c), -1, 4],
  [(c) => P.deltaExtremeNeg(c) && P.atLastL(c) && P.pinBull(c), 1, 4],
  [(c) => P.deltaExtremePos(c) && P.atLastH(c) && P.pinBear(c), -1, 4],
  [(c) => P.cvdRising(c) && P.alignBull(c), 1, 2.5],
  [(c) => P.cvdFalling(c) && P.alignBear(c), -1, 2.5],
  [(c) => P.cvdRising(c) && P.obvRising(c), 1, 2],
  [(c) => P.cvdFalling(c) && P.obvFalling(c), -1, 2],
  [(c) => P.cvdRising(c), 1, 1.5],
  [(c) => P.cvdFalling(c), -1, 1.5]
]);

// =================== CATEGORY 17: ORDER BOOK DEPTH ========================
add('17.1', 'Depth Bid Support', 17, { method: 'liq', stopMult: 1.2, rr: 2.4 }, [
  [(c) => P.bidWallAbove(c) && P.atSupport(c), 1, 3],
  [(c) => P.bidWallAbove(c) && P.atLastL(c), 1, 2.5],
  [(c) => P.bidWallAbove(c) && P.pinBull(c), 1, 2.5],
  [(c) => P.bidWallAbove(c) && P.volSpike(c), 1, 2.5],
  [(c) => P.bidWallAbove(c) && P.htfBull(c), 1, 2],
  [(c) => P.bidWallAbove(c) && P.structUp(c), 1, 2],
  [(c) => P.bidWallAbove(c), 1, 2],
  [(c) => P.bidWallAbove(c) && P.askWallBelow(c), 0, 2],
  [(c) => P.bidWallAbove(c) && P.rvolLow(c), 0, 1.5],
  [(c) => P.bidWallAbove(c) && P.alignBear(c), 0, 1.5]
]);

add('17.2', 'Depth Ask Resistance', 17, { method: 'liq', stopMult: 1.2, rr: 2.4 }, [
  [(c) => P.askWallBelow(c) && P.atResistance(c), -1, 3],
  [(c) => P.askWallBelow(c) && P.atLastH(c), -1, 2.5],
  [(c) => P.askWallBelow(c) && P.pinBear(c), -1, 2.5],
  [(c) => P.askWallBelow(c) && P.volSpike(c), -1, 2.5],
  [(c) => P.askWallBelow(c) && P.htfBear(c), -1, 2],
  [(c) => P.askWallBelow(c) && P.structDn(c), -1, 2],
  [(c) => P.askWallBelow(c), -1, 2],
  [(c) => P.askWallBelow(c) && P.bidWallAbove(c), 0, 2],
  [(c) => P.askWallBelow(c) && P.rvolLow(c), 0, 1.5],
  [(c) => P.askWallBelow(c) && P.alignBull(c), 0, 1.5]
]);

add('17.3', 'Depth Break Hunter', 17, { method: 'price', stopMult: 1.3, rr: 2.6 }, [
  [(c) => P.askWallBelow(c) && P.brokeResistance(c), 1, 3],
  [(c) => P.bidWallAbove(c) && P.brokeSupport(c), -1, 3],
  [(c) => P.askWallBelow(c) && P.rangeBreakUp(c), 1, 3],
  [(c) => P.bidWallAbove(c) && P.rangeBreakDn(c), -1, 3],
  [(c) => P.askWallBelow(c) && P.volSpike(c), 1, 2.5],
  [(c) => P.bidWallAbove(c) && P.volSpike(c), -1, 2.5],
  [(c) => P.askWallBelow(c) && P.htfBull(c), 1, 2],
  [(c) => P.bidWallAbove(c) && P.htfBear(c), -1, 2],
  [(c) => P.askWallBelow(c), 1, 1.5],
  [(c) => P.bidWallAbove(c), -1, 1.5]
]);

add('17.4', 'Depth Stacking Study', 17, { method: 'price', stopMult: 1.2, rr: 2.4 }, [
  [(c) => P.bookBidHeavy(c) && P.aboveEma21(c), 1, 2.5],
  [(c) => P.bookAskHeavy(c) && P.belowEma21(c), -1, 2.5],
  [(c) => P.bookBidHeavy(c) && P.upCandle(c), 1, 2],
  [(c) => P.bookAskHeavy(c) && P.downCandle(c), -1, 2],
  [(c) => P.bookBalanced(c) && P.volSpike(c), 0, 2],
  [(c) => P.bookBidHeavy(c) && P.bookAskHeavy(c), 0, 2.5],
  [(c) => P.bookBidHeavy(c) && P.atSupport(c), 1, 2.5],
  [(c) => P.bookAskHeavy(c) && P.atResistance(c), -1, 2.5],
  [(c) => P.bookBidHeavy(c) && P.structUp(c), 1, 2],
  [(c) => P.bookAskHeavy(c) && P.structDn(c), -1, 2]
]);

add('17.5', 'Depth MTF Context', 17, { method: 'liq', stopMult: 1.3, rr: 2.6 }, [
  [(c) => P.bidWallAbove(c) && P.h4Bull(c), 1, 3],
  [(c) => P.askWallBelow(c) && P.h4Bear(c), -1, 3],
  [(c) => P.bidWallAbove(c) && P.htfBull(c), 1, 2.5],
  [(c) => P.askWallBelow(c) && P.htfBear(c), -1, 2.5],
  [(c) => P.bidWallAbove(c) && P.h4Bear(c), 0, 2],
  [(c) => P.askWallBelow(c) && P.h4Bull(c), 0, 2],
  [(c) => P.bookBidHeavy(c) && P.htfBull(c), 1, 2],
  [(c) => P.bookAskHeavy(c) && P.htfBear(c), -1, 2],
  [(c) => P.bidWallAbove(c) && P.allTfBull(c), 1, 3],
  [(c) => P.askWallBelow(c) && P.allTfBear(c), -1, 3]
]);

add('17.6', 'Depth Absorption', 17, { method: 'swing', stopMult: 1.2, rr: 2.6 }, [
  [(c) => P.bidAbsorbing(c) && P.volClimax(c) && P.downCandle(c), 1, 3.5],
  [(c) => P.askAbsorbing(c) && P.volClimax(c) && P.upCandle(c), -1, 3.5],
  [(c) => P.bidAbsorbing(c) && P.pinBull(c), 1, 3],
  [(c) => P.askAbsorbing(c) && P.pinBear(c), -1, 3],
  [(c) => P.bidAbsorbing(c) && P.atLastL(c), 1, 2.5],
  [(c) => P.askAbsorbing(c) && P.atLastH(c), -1, 2.5],
  [(c) => P.bidAbsorbing(c) && P.volSpike(c), 1, 2],
  [(c) => P.askAbsorbing(c) && P.volSpike(c), -1, 2],
  [(c) => P.bidAbsorbing(c) && P.alignBear(c), 1, 2.5],
  [(c) => P.askAbsorbing(c) && P.alignBull(c), -1, 2.5]
]);

add('17.7', 'Depth Tape Confluence', 17, { method: 'price', stopMult: 1.2, rr: 2.4 }, [
  [(c) => P.bidWallAbove(c) && P.tapeBull(c), 1, 2.5],
  [(c) => P.askWallBelow(c) && P.tapeBear(c), -1, 2.5],
  [(c) => P.bidWallAbove(c) && P.bigBuyDominates(c), 1, 2.5],
  [(c) => P.askWallBelow(c) && P.bigSellDominates(c), -1, 2.5],
  [(c) => P.bookBidHeavy(c) && P.deltaPos(c), 1, 2],
  [(c) => P.bookAskHeavy(c) && P.deltaNeg(c), -1, 2],
  [(c) => P.bidWallAbove(c) && P.tapeBear(c), 0, 2],
  [(c) => P.askWallBelow(c) && P.tapeBull(c), 0, 2],
  [(c) => P.bidWallAbove(c) && P.takerBuyHeavy(c), 1, 2],
  [(c) => P.askWallBelow(c) && P.takerSellHeavy(c), -1, 2]
]);

add('17.8', 'Depth Risk Filter', 17, { method: 'liq', stopMult: 1.4, rr: 2.0 }, [
  [(c) => P.spreadWide(c) && P.volSpike(c), 0, 3],
  [(c) => P.spreadWide(c), 0, 2.5],
  [(c) => P.spreadTight(c) && P.bidWallAbove(c), 1, 2],
  [(c) => P.spreadTight(c) && P.askWallBelow(c), -1, 2],
  [(c) => P.atrVeryHigh(c) && P.volSpike(c), 0, 2.5],
  [(c) => P.atrNormal(c) && P.bidWallAbove(c), 1, 1.5],
  [(c) => P.atrNormal(c) && P.askWallBelow(c), -1, 1.5],
  [(c) => P.bookBalanced(c) && P.rvolHigh(c), 0, 2],
  [(c) => P.spreadTight(c), 1, 1.5],
  [(c) => P.spreadTight(c), -1, 1.5]
]);

add('17.9', 'Depth Wall Study', 17, { method: 'liq', stopMult: 1.2, rr: 2.4 }, [
  [(c) => P.bidWallAbove(c) && P.bidWallAbove(c) && P.atSupport(c), 1, 3],
  [(c) => P.askWallBelow(c) && P.askWallBelow(c) && P.atResistance(c), -1, 3],
  [(c) => P.bidWallAbove(c) && P.volSpike(c) && P.upCandle(c), 1, 2.5],
  [(c) => P.askWallBelow(c) && P.volSpike(c) && P.downCandle(c), -1, 2.5],
  [(c) => P.bidWallAbove(c) && P.downCandle(c) && P.volClimax(c), 1, 2.5],
  [(c) => P.askWallBelow(c) && P.upCandle(c) && P.volClimax(c), -1, 2.5],
  [(c) => P.bidWallAbove(c) && P.squeezeOn(c), 1, 1.5],
  [(c) => P.askWallBelow(c) && P.squeezeOn(c), -1, 1.5],
  [(c) => P.bidWallAbove(c) && P.atPoc(c), 1, 2],
  [(c) => P.askWallBelow(c) && P.atPoc(c), -1, 2]
]);

add('17.10', 'Depth Compiler', 17, { method: 'liq', stopMult: 1.2, rr: 2.6 }, [
  [(c) => P.bidWallAbove(c) && P.atSupport(c) && P.htfBull(c), 1, 4],
  [(c) => P.askWallBelow(c) && P.atResistance(c) && P.htfBear(c), -1, 4],
  [(c) => P.bidAbsorbing(c) && P.volClimax(c), 1, 3],
  [(c) => P.askAbsorbing(c) && P.volClimax(c), -1, 3],
  [(c) => P.askWallBelow(c) && P.rangeBreakUp(c), 1, 3],
  [(c) => P.bidWallAbove(c) && P.rangeBreakDn(c), -1, 3],
  [(c) => P.bookBidHeavy(c), 1, 2],
  [(c) => P.bookAskHeavy(c), -1, 2],
  [(c) => P.bidWallAbove(c), 1, 1.5],
  [(c) => P.askWallBelow(c), -1, 1.5]
]);

// =================== CATEGORY 18: BID-ASK IMBALANCE ========================
add('18.1', 'Bid Imbalance Momentum', 18, { method: 'price', stopMult: 1.2, rr: 2.4 }, [
  [(c) => P.bookBidHeavy(c) && P.aboveEma21(c), 1, 3],
  [(c) => P.bookAskHeavy(c) && P.belowEma21(c), -1, 3],
  [(c) => P.bookBidHeavy(c) && P.upCandle(c), 1, 2.5],
  [(c) => P.bookAskHeavy(c) && P.downCandle(c), -1, 2.5],
  [(c) => P.bookBidHeavy(c) && P.macdHistRising(c), 1, 2],
  [(c) => P.bookAskHeavy(c) && P.macdHistFalling(c), -1, 2],
  [(c) => P.bookBidHeavy(c) && P.structUp(c), 1, 2],
  [(c) => P.bookAskHeavy(c) && P.structDn(c), -1, 2],
  [(c) => P.bookBidHeavy(c) && P.rsiBull(c), 1, 2],
  [(c) => P.bookAskHeavy(c) && P.rsiBear(c), -1, 2]
]);

add('18.2', 'Ask Imbalance Momentum', 18, { method: 'price', stopMult: 1.2, rr: 2.4 }, [
  [(c) => P.bookAskHeavy(c) && P.belowEma21(c), -1, 2.5],
  [(c) => P.bookAskHeavy(c) && P.downCandle(c), -1, 2],
  [(c) => P.bookAskHeavy(c) && P.alignBear(c), -1, 2.5],
  [(c) => P.bookAskHeavy(c) && P.macdHistFalling(c), -1, 2],
  [(c) => P.bookAskHeavy(c) && P.htfBear(c), -1, 2],
  [(c) => P.bookAskHeavy(c) && P.rsiBear(c), -1, 2],
  [(c) => P.bookAskHeavy(c) && P.belowVwap(c), -1, 2],
  [(c) => P.bookAskHeavy(c) && P.cvdFalling(c), -1, 2],
  [(c) => P.bookAskHeavy(c) && P.volSpike(c), -1, 2],
  [(c) => P.bookAskHeavy(c), -1, 1.5]
]);

add('18.3', 'Imbalance Flip', 18, { method: 'swing', stopMult: 1.2, rr: 2.6 }, [
  [(c) => P.bookBidHeavy(c) && P.alignBear(c) && P.atSupport(c), 1, 3],
  [(c) => P.bookAskHeavy(c) && P.alignBull(c) && P.atResistance(c), -1, 3],
  [(c) => P.bookBidHeavy(c) && P.rsiDivBull(c), 1, 2.5],
  [(c) => P.bookAskHeavy(c) && P.rsiDivBear(c), -1, 2.5],
  [(c) => P.bookBidHeavy(c) && P.downCandle(c), 1, 2],
  [(c) => P.bookAskHeavy(c) && P.upCandle(c), -1, 2],
  [(c) => P.bookBidHeavy(c) && P.volSpike(c) && P.downCandle(c), 1, 2.5],
  [(c) => P.bookAskHeavy(c) && P.volSpike(c) && P.upCandle(c), -1, 2.5],
  [(c) => P.bookBidHeavy(c) && P.deltaNeg(c), 1, 2],
  [(c) => P.bookAskHeavy(c) && P.deltaPos(c), -1, 2]
]);

add('18.4', 'Imbalance Absorption', 18, { method: 'swing', stopMult: 1.2, rr: 2.6 }, [
  [(c) => P.bidAbsorbing(c) && P.volClimax(c), 1, 3.5],
  [(c) => P.askAbsorbing(c) && P.volClimax(c), -1, 3.5],
  [(c) => P.bidAbsorbing(c) && P.downCandle(c), 1, 3],
  [(c) => P.askAbsorbing(c) && P.upCandle(c), -1, 3],
  [(c) => P.bidAbsorbing(c) && P.atLastL(c), 1, 3],
  [(c) => P.askAbsorbing(c) && P.atLastH(c), -1, 3],
  [(c) => P.bidAbsorbing(c) && P.tapeBear(c), 1, 2.5],
  [(c) => P.askAbsorbing(c) && P.tapeBull(c), -1, 2.5],
  [(c) => P.bidAbsorbing(c), 1, 2],
  [(c) => P.askAbsorbing(c), -1, 2]
]);

add('18.5', 'Imbalance MTF', 18, { method: 'price', stopMult: 1.3, rr: 2.6 }, [
  [(c) => P.bookBidHeavy(c) && P.h4Bull(c), 1, 3],
  [(c) => P.bookAskHeavy(c) && P.h4Bear(c), -1, 3],
  [(c) => P.bookBidHeavy(c) && P.htfBull(c), 1, 2.5],
  [(c) => P.bookAskHeavy(c) && P.htfBear(c), -1, 2.5],
  [(c) => P.bookBidHeavy(c) && P.h4Bear(c), 0, 2],
  [(c) => P.bookAskHeavy(c) && P.h4Bull(c), 0, 2],
  [(c) => P.bidAbsorbing(c) && P.htfBull(c), 1, 2.5],
  [(c) => P.askAbsorbing(c) && P.htfBear(c), -1, 2.5],
  [(c) => P.bookBidHeavy(c) && P.allTfBull(c), 1, 3],
  [(c) => P.bookAskHeavy(c) && P.allTfBear(c), -1, 3]
]);

add('18.6', 'Imbalance Level Trade', 18, { method: 'swing', stopMult: 1.2, rr: 2.4 }, [
  [(c) => P.bookBidHeavy(c) && P.atSupport(c), 1, 3],
  [(c) => P.bookAskHeavy(c) && P.atResistance(c), -1, 3],
  [(c) => P.bookBidHeavy(c) && P.atLastL(c), 1, 2.5],
  [(c) => P.bookAskHeavy(c) && P.atLastH(c), -1, 2.5],
  [(c) => P.bookBidHeavy(c) && P.atPoc(c), 1, 2],
  [(c) => P.bookAskHeavy(c) && P.atPoc(c), -1, 2],
  [(c) => P.bookBidHeavy(c) && P.nearSsl(c), 1, 2.5],
  [(c) => P.bookAskHeavy(c) && P.nearBsl(c), -1, 2.5],
  [(c) => P.bookBidHeavy(c) && P.rangeAtLow(c), 1, 2],
  [(c) => P.bookAskHeavy(c) && P.rangeAtHigh(c), -1, 2]
]);

add('18.7', 'Imbalance Volume Study', 18, { method: 'price', stopMult: 1.2, rr: 2.2 }, [
  [(c) => P.bookBidHeavy(c) && P.volSpike(c) && P.upCandle(c), 1, 3],
  [(c) => P.bookAskHeavy(c) && P.volSpike(c) && P.downCandle(c), -1, 3],
  [(c) => P.bookBidHeavy(c) && P.rvolHigh(c), 1, 2],
  [(c) => P.bookAskHeavy(c) && P.rvolHigh(c), -1, 2],
  [(c) => P.bookBidHeavy(c) && P.rvolLow(c), 0, 2],
  [(c) => P.bookAskHeavy(c) && P.rvolLow(c), 0, 2],
  [(c) => P.bookBidHeavy(c) && P.tapeBull(c), 1, 2.5],
  [(c) => P.bookAskHeavy(c) && P.tapeBear(c), -1, 2.5],
  [(c) => P.bidAbsorbing(c) && P.volSpike(c), 1, 2.5],
  [(c) => P.askAbsorbing(c) && P.volSpike(c), -1, 2.5]
]);

add('18.8', 'Imbalance Risk Filter', 18, { method: 'price', stopMult: 1.4, rr: 2.0 }, [
  [(c) => P.spreadWide(c) && P.bookBidHeavy(c), 0, 2.5],
  [(c) => P.spreadWide(c) && P.bookAskHeavy(c), 0, 2.5],
  [(c) => P.bookBidHeavy(c) && P.atrVeryHigh(c), 0, 2.5],
  [(c) => P.bookAskHeavy(c) && P.atrVeryHigh(c), 0, 2.5],
  [(c) => P.bookBidHeavy(c) && P.atrNormal(c), 1, 2],
  [(c) => P.bookAskHeavy(c) && P.atrNormal(c), -1, 2],
  [(c) => P.bookBalanced(c) && P.rvolHigh(c), 0, 2],
  [(c) => P.spreadTight(c) && P.bookBidHeavy(c), 1, 1.5],
  [(c) => P.spreadTight(c) && P.bookAskHeavy(c), -1, 1.5],
  [(c) => P.bookBidHeavy(c) && P.alignMixed(c), 0, 1.5]
]);

add('18.9', 'Imbalance Spread Study', 18, { method: 'price', stopMult: 1.2, rr: 2.4 }, [
  [(c) => P.spreadTight(c) && P.volSpike(c) && P.upCandle(c), 1, 2.5],
  [(c) => P.spreadTight(c) && P.volSpike(c) && P.downCandle(c), -1, 2.5],
  [(c) => P.spreadWide(c) && P.volSpike(c), 0, 3],
  [(c) => P.spreadWide(c) && P.downCandle(c), 0, 2],
  [(c) => P.spreadWide(c) && P.upCandle(c), 0, 2],
  [(c) => P.spreadTight(c) && P.tapeBull(c), 1, 2],
  [(c) => P.spreadTight(c) && P.tapeBear(c), -1, 2],
  [(c) => P.spreadTight(c) && P.alignBull(c), 1, 2],
  [(c) => P.spreadTight(c) && P.alignBear(c), -1, 2],
  [(c) => P.spreadWide(c), 0, 2]
]);

add('18.10', 'Imbalance Compiler', 18, { method: 'price', stopMult: 1.2, rr: 2.6 }, [
  [(c) => P.bidAbsorbing(c) && P.volClimax(c) && P.atLastL(c), 1, 4],
  [(c) => P.askAbsorbing(c) && P.volClimax(c) && P.atLastH(c), -1, 4],
  [(c) => P.bookBidHeavy(c) && P.atSupport(c) && P.htfBull(c), 1, 3.5],
  [(c) => P.bookAskHeavy(c) && P.atResistance(c) && P.htfBear(c), -1, 3.5],
  [(c) => P.bookBidHeavy(c) && P.volSpike(c), 1, 2.5],
  [(c) => P.bookAskHeavy(c) && P.volSpike(c), -1, 2.5],
  [(c) => P.bookBidHeavy(c) && P.upCandle(c), 1, 2],
  [(c) => P.bookAskHeavy(c) && P.downCandle(c), -1, 2],
  [(c) => P.bookBidHeavy(c), 1, 1.5],
  [(c) => P.bookAskHeavy(c), -1, 1.5]
]);

// =================== CATEGORY 19: TRADE TAPE MASTERS =======================
add('19.1', 'Tape Aggression Follow', 19, { method: 'price', stopMult: 1.2, rr: 2.4 }, [
  [(c) => P.tapeBull(c) && P.upCandle(c), 1, 3],
  [(c) => P.tapeBear(c) && P.downCandle(c), -1, 3],
  [(c) => P.tapeBull(c) && P.alignBull(c), 1, 2.5],
  [(c) => P.tapeBear(c) && P.alignBear(c), -1, 2.5],
  [(c) => P.tapeBull(c) && P.aboveEma21(c), 1, 2],
  [(c) => P.tapeBear(c) && P.belowEma21(c), -1, 2],
  [(c) => P.tapeBull(c) && P.volSpike(c), 1, 2],
  [(c) => P.tapeBear(c) && P.volSpike(c), -1, 2],
  [(c) => P.tapeNeutral(c), 0, 2],
  [(c) => P.tapeBull(c) && P.rvolLow(c), 0, 1.5]
]);

add('19.2', 'Tape Divergence Hunter', 19, { method: 'swing', stopMult: 1.2, rr: 2.8 }, [
  [(c) => P.tapeBear(c) && P.upCandle(c) && P.alignBull(c), -1, 3],
  [(c) => P.tapeBull(c) && P.downCandle(c) && P.alignBear(c), 1, 3],
  [(c) => P.tapeBear(c) && P.aboveEma21(c), -1, 2.5],
  [(c) => P.tapeBull(c) && P.belowEma21(c), 1, 2.5],
  [(c) => P.tapeBear(c) && P.atLastH(c), -1, 2.5],
  [(c) => P.tapeBull(c) && P.atLastL(c), 1, 2.5],
  [(c) => P.tapeBear(c) && P.rsiOB(c), -1, 2.5],
  [(c) => P.tapeBull(c) && P.rsiOS(c), 1, 2.5],
  [(c) => P.tapeBear(c) && P.volSpike(c) && P.upCandle(c), -1, 3.5],
  [(c) => P.tapeBull(c) && P.volSpike(c) && P.downCandle(c), 1, 3.5]
]);

add('19.3', 'Big Trade Tracker', 19, { method: 'price', stopMult: 1.2, rr: 2.6 }, [
  [(c) => P.bigBuyDominates(c) && P.upCandle(c), 1, 3],
  [(c) => P.bigSellDominates(c) && P.downCandle(c), -1, 3],
  [(c) => P.bigBuyDominates(c) && P.aboveEma21(c), 1, 2.5],
  [(c) => P.bigSellDominates(c) && P.belowEma21(c), -1, 2.5],
  [(c) => P.bigBuyDominates(c) && P.atSupport(c), 1, 2.5],
  [(c) => P.bigSellDominates(c) && P.atResistance(c), -1, 2.5],
  [(c) => P.bigBuyDominates(c) && P.htfBull(c), 1, 2],
  [(c) => P.bigSellDominates(c) && P.htfBear(c), -1, 2],
  [(c) => P.bigBuyDominates(c) && P.volSpike(c), 1, 2],
  [(c) => P.bigSellDominates(c) && P.volSpike(c), -1, 2]
]);

add('19.4', 'Tape Momentum Burst', 19, { method: 'price', stopMult: 1.2, rr: 2.4 }, [
  [(c) => P.tapeBull(c) && P.volClimax(c), 1, 2.5],
  [(c) => P.tapeBear(c) && P.volClimax(c), -1, 2.5],
  [(c) => P.tapeBull(c) && P.macdHistRising(c), 1, 2],
  [(c) => P.tapeBear(c) && P.macdHistFalling(c), -1, 2],
  [(c) => P.tapeBull(c) && P.adxStrong(c), 1, 2],
  [(c) => P.tapeBear(c) && P.adxStrong(c), -1, 2],
  [(c) => P.tapeBull(c) && P.momUp(c), 1, 2],
  [(c) => P.tapeBear(c) && P.momDown(c), -1, 2],
  [(c) => P.tapeBull(c) && P.alignMixed(c), 0, 1.5],
  [(c) => P.tapeBear(c) && P.alignMixed(c), 0, 1.5]
]);

add('19.5', 'Tape MTF', 19, { method: 'price', stopMult: 1.3, rr: 2.6 }, [
  [(c) => P.tapeBull(c) && P.h4Bull(c), 1, 3],
  [(c) => P.tapeBear(c) && P.h4Bear(c), -1, 3],
  [(c) => P.tapeBull(c) && P.htfBull(c), 1, 2.5],
  [(c) => P.tapeBear(c) && P.htfBear(c), -1, 2.5],
  [(c) => P.tapeBull(c) && P.htfBear(c), 0, 2],
  [(c) => P.tapeBear(c) && P.htfBull(c), 0, 2],
  [(c) => P.bigBuyDominates(c) && P.h4Bull(c), 1, 2.5],
  [(c) => P.bigSellDominates(c) && P.h4Bear(c), -1, 2.5],
  [(c) => P.tapeBull(c) && P.allTfBull(c), 1, 3],
  [(c) => P.tapeBear(c) && P.allTfBear(c), -1, 3]
]);

add('19.6', 'Tape Level Confluence', 19, { method: 'swing', stopMult: 1.2, rr: 2.6 }, [
  [(c) => P.tapeBull(c) && P.atSupport(c), 1, 3],
  [(c) => P.tapeBear(c) && P.atResistance(c), -1, 3],
  [(c) => P.tapeBull(c) && P.atLastL(c), 1, 2.5],
  [(c) => P.tapeBear(c) && P.atLastH(c), -1, 2.5],
  [(c) => P.tapeBull(c) && P.nearSsl(c), 1, 2.5],
  [(c) => P.tapeBear(c) && P.nearBsl(c), -1, 2.5],
  [(c) => P.tapeBull(c) && P.atPoc(c), 1, 2],
  [(c) => P.tapeBear(c) && P.atPoc(c), -1, 2],
  [(c) => P.tapeBull(c) && P.rangeAtLow(c), 1, 2],
  [(c) => P.tapeBear(c) && P.rangeAtHigh(c), -1, 2]
]);

add('19.7', 'Tape CVD Confluence', 19, { method: 'price', stopMult: 1.2, rr: 2.4 }, [
  [(c) => P.tapeBull(c) && P.cvdRising(c), 1, 3],
  [(c) => P.tapeBear(c) && P.cvdFalling(c), -1, 3],
  [(c) => P.tapeBull(c) && P.deltaPos(c), 1, 2.5],
  [(c) => P.tapeBear(c) && P.deltaNeg(c), -1, 2.5],
  [(c) => P.tapeBull(c) && P.takerBuyHeavy(c), 1, 2],
  [(c) => P.tapeBear(c) && P.takerSellHeavy(c), -1, 2],
  [(c) => P.tapeBull(c) && P.obvRising(c), 1, 2],
  [(c) => P.tapeBear(c) && P.obvFalling(c), -1, 2],
  [(c) => P.tapeBull(c) && P.deltaNeg(c), 0, 2],
  [(c) => P.tapeBear(c) && P.deltaPos(c), 0, 2]
]);

add('19.8', 'Tape Risk Filter', 19, { method: 'price', stopMult: 1.4, rr: 2.0 }, [
  [(c) => P.tapeBull(c) && P.spreadWide(c), 0, 2.5],
  [(c) => P.tapeBear(c) && P.spreadWide(c), 0, 2.5],
  [(c) => P.tapeBull(c) && P.atrVeryHigh(c), 0, 2.5],
  [(c) => P.tapeBear(c) && P.atrVeryHigh(c), 0, 2.5],
  [(c) => P.tapeBull(c) && P.atrNormal(c), 1, 2],
  [(c) => P.tapeBear(c) && P.atrNormal(c), -1, 2],
  [(c) => P.tapeNeutral(c) && P.volSpike(c), 0, 2],
  [(c) => P.tapeBull(c) && P.spreadTight(c), 1, 1.5],
  [(c) => P.tapeBear(c) && P.spreadTight(c), -1, 1.5],
  [(c) => P.tapeNeutral(c), 0, 1.5]
]);

add('19.9', 'Tape Exhaustion', 19, { method: 'swing', stopMult: 1.2, rr: 2.8 }, [
  [(c) => P.tapeBull(c) && P.volClimax(c) && P.rsiOB(c), -1, 3],
  [(c) => P.tapeBear(c) && P.volClimax(c) && P.rsiOS(c), 1, 3],
  [(c) => P.bigBuyDominates(c) && P.volClimax(c) && P.atLastH(c), -1, 3],
  [(c) => P.bigSellDominates(c) && P.volClimax(c) && P.atLastL(c), 1, 3],
  [(c) => P.tapeBull(c) && P.fundingHigh(c), -1, 2],
  [(c) => P.tapeBear(c) && P.fundingLow(c), 1, 2],
  [(c) => P.tapeBull(c) && P.aboveBBUp(c) && P.volClimax(c), -1, 2.5],
  [(c) => P.tapeBear(c) && P.belowBBLo(c) && P.volClimax(c), 1, 2.5],
  [(c) => P.bigBuyDominates(c) && P.volClimax(c), 0, 2],
  [(c) => P.bigSellDominates(c) && P.volClimax(c), 0, 2]
]);

add('19.10', 'Tape Compiler', 19, { method: 'price', stopMult: 1.2, rr: 2.6 }, [
  [(c) => P.tapeBull(c) && P.volSpike(c) && P.htfBull(c) && P.atSupport(c), 1, 4],
  [(c) => P.tapeBear(c) && P.volSpike(c) && P.htfBear(c) && P.atResistance(c), -1, 4],
  [(c) => P.bigBuyDominates(c) && P.cvdRising(c), 1, 3],
  [(c) => P.bigSellDominates(c) && P.cvdFalling(c), -1, 3],
  [(c) => P.tapeBull(c) && P.atSupport(c), 1, 2.5],
  [(c) => P.tapeBear(c) && P.atResistance(c), -1, 2.5],
  [(c) => P.tapeBull(c) && P.alignBull(c), 1, 2.5],
  [(c) => P.tapeBear(c) && P.alignBear(c), -1, 2.5],
  [(c) => P.tapeBull(c), 1, 1.5],
  [(c) => P.tapeBear(c), -1, 1.5]
]);

// =================== CATEGORY 20: ABSORPTION & EXHAUSTION ==================
add('20.1', 'Bid Absorption Reversal', 20, { method: 'swing', stopMult: 1.2, rr: 2.8 }, [
  [(c) => P.bidAbsorbing(c) && P.downCandle(c) && P.volClimax(c), 1, 3.5],
  [(c) => P.bidAbsorbing(c) && P.atLastL(c), 1, 3],
  [(c) => P.bidAbsorbing(c) && P.pinBull(c), 1, 3],
  [(c) => P.bidAbsorbing(c) && P.rsiDivBull(c), 1, 3],
  [(c) => P.bidAbsorbing(c) && P.alignBear(c), 1, 2.5],
  [(c) => P.bidAbsorbing(c) && P.volSpike(c), 1, 2.5],
  [(c) => P.bidAbsorbing(c) && P.tapeBear(c), 1, 2.5],
  [(c) => P.bidAbsorbing(c), 1, 2],
  [(c) => P.bidAbsorbing(c) && P.htfBear(c), 1, 2],
  [(c) => P.bidAbsorbing(c) && P.upCandle(c), 0, 2]
]);

add('20.2', 'Ask Absorption Reversal', 20, { method: 'swing', stopMult: 1.2, rr: 2.8 }, [
  [(c) => P.askAbsorbing(c) && P.upCandle(c) && P.volClimax(c), -1, 3.5],
  [(c) => P.askAbsorbing(c) && P.atLastH(c), -1, 3],
  [(c) => P.askAbsorbing(c) && P.pinBear(c), -1, 3],
  [(c) => P.askAbsorbing(c) && P.rsiDivBear(c), -1, 3],
  [(c) => P.askAbsorbing(c) && P.alignBull(c), -1, 2.5],
  [(c) => P.askAbsorbing(c) && P.volSpike(c), -1, 2.5],
  [(c) => P.askAbsorbing(c) && P.tapeBull(c), -1, 2.5],
  [(c) => P.askAbsorbing(c), -1, 2],
  [(c) => P.askAbsorbing(c) && P.htfBull(c), -1, 2],
  [(c) => P.askAbsorbing(c) && P.downCandle(c), 0, 2]
]);

add('20.3', 'Volume Climax Exhaustion', 20, { method: 'swing', stopMult: 1.2, rr: 2.8 }, [
  [(c) => P.volClimax(c) && P.upCandle(c) && P.atLastH(c), -1, 3.5],
  [(c) => P.volClimax(c) && P.downCandle(c) && P.atLastL(c), 1, 3.5],
  [(c) => P.volClimax(c) && P.upCandle(c) && P.rsiOB(c), -1, 3],
  [(c) => P.volClimax(c) && P.downCandle(c) && P.rsiOS(c), 1, 3],
  [(c) => P.volClimax(c) && P.upCandle(c) && P.aboveBBUp(c), -1, 3],
  [(c) => P.volClimax(c) && P.downCandle(c) && P.belowBBLo(c), 1, 3],
  [(c) => P.volClimax(c) && P.upCandle(c) && P.fundingHigh(c), -1, 2.5],
  [(c) => P.volClimax(c) && P.downCandle(c) && P.fundingLow(c), 1, 2.5],
  [(c) => P.volClimax(c) && P.upCandle(c), 0, 2],
  [(c) => P.volClimax(c) && P.downCandle(c), 0, 2]
]);

add('20.4', 'Exhaustion Sequence', 20, { method: 'swing', stopMult: 1.3, rr: 2.8 }, [
  [(c) => P.volClimax(c) && P.upCandle(c) && P.doji(c) === false && P.macdHistFalling(c), -1, 3],
  [(c) => P.volClimax(c) && P.downCandle(c) && P.macdHistRising(c), 1, 3],
  [(c) => P.volClimax(c) && P.upCandle(c) && P.atrVeryHigh(c), -1, 2.5],
  [(c) => P.volClimax(c) && P.downCandle(c) && P.atrVeryHigh(c), 1, 2.5],
  [(c) => P.volClimax(c) && P.upCandle(c) && P.rsiOB(c) && P.rsiDivBear(c), -1, 4],
  [(c) => P.volClimax(c) && P.downCandle(c) && P.rsiOS(c) && P.rsiDivBull(c), 1, 4],
  [(c) => P.volClimax(c) && P.upCandle(c), 0, 2],
  [(c) => P.volClimax(c) && P.downCandle(c), 0, 2],
  [(c) => P.volClimax(c) && P.upCandle(c) && P.deltaExtremePos(c), -1, 3],
  [(c) => P.volClimax(c) && P.downCandle(c) && P.deltaExtremeNeg(c), 1, 3]
]);

add('20.5', 'Absorption MTF', 20, { method: 'swing', stopMult: 1.3, rr: 2.6 }, [
  [(c) => P.bidAbsorbing(c) && P.h4Bull(c), 1, 3],
  [(c) => P.askAbsorbing(c) && P.h4Bear(c), -1, 3],
  [(c) => P.bidAbsorbing(c) && P.htfBull(c), 1, 2.5],
  [(c) => P.askAbsorbing(c) && P.htfBear(c), -1, 2.5],
  [(c) => P.bidAbsorbing(c) && P.h4Bear(c), 0, 2],
  [(c) => P.askAbsorbing(c) && P.h4Bull(c), 0, 2],
  [(c) => P.volClimax(c) && P.upCandle(c) && P.h4Bear(c), -1, 3],
  [(c) => P.volClimax(c) && P.downCandle(c) && P.h4Bull(c), 1, 3],
  [(c) => P.bidAbsorbing(c) && P.allTfBull(c), 1, 3.5],
  [(c) => P.askAbsorbing(c) && P.allTfBear(c), -1, 3.5]
]);

add('20.6', 'Exhaustion Level Trade', 20, { method: 'swing', stopMult: 1.2, rr: 2.8 }, [
  [(c) => P.volClimax(c) && P.upCandle(c) && P.atResistance(c), -1, 3.5],
  [(c) => P.volClimax(c) && P.downCandle(c) && P.atSupport(c), 1, 3.5],
  [(c) => P.volClimax(c) && P.upCandle(c) && P.atLastH(c), -1, 3],
  [(c) => P.volClimax(c) && P.downCandle(c) && P.atLastL(c), 1, 3],
  [(c) => P.volClimax(c) && P.upCandle(c) && P.atVah(c), -1, 3],
  [(c) => P.volClimax(c) && P.downCandle(c) && P.atVal(c), 1, 3],
  [(c) => P.volClimax(c) && P.upCandle(c) && P.nearBsl(c), -1, 3],
  [(c) => P.volClimax(c) && P.downCandle(c) && P.nearSsl(c), 1, 3],
  [(c) => P.volClimax(c) && P.upCandle(c) && P.rangeAtHigh(c), -1, 2.5],
  [(c) => P.volClimax(c) && P.downCandle(c) && P.rangeAtLow(c), 1, 2.5]
]);

add('20.7', 'Exhaustion Risk Filter', 20, { method: 'swing', stopMult: 1.4, rr: 2.0 }, [
  [(c) => P.volClimax(c) && P.spreadWide(c), 0, 3],
  [(c) => P.volClimax(c) && P.atrVeryHigh(c), 0, 2.5],
  [(c) => P.bidAbsorbing(c) && P.spreadWide(c), 0, 2.5],
  [(c) => P.askAbsorbing(c) && P.spreadWide(c), 0, 2.5],
  [(c) => P.volClimax(c) && P.atrNormal(c), 1, 2],
  [(c) => P.volClimax(c) && P.atrNormal(c), -1, 2],
  [(c) => P.volClimax(c) && P.spreadTight(c), 1, 1.5],
  [(c) => P.volClimax(c) && P.spreadTight(c), -1, 1.5],
  [(c) => P.volClimax(c) && P.alignMixed(c), 0, 2],
  [(c) => P.volClimax(c), 0, 1]
]);

add('20.8', 'Absorption Tape Study', 20, { method: 'swing', stopMult: 1.2, rr: 2.6 }, [
  [(c) => P.bidAbsorbing(c) && P.tapeBear(c), 1, 3],
  [(c) => P.askAbsorbing(c) && P.tapeBull(c), -1, 3],
  [(c) => P.bidAbsorbing(c) && P.bigSellDominates(c), 1, 3],
  [(c) => P.askAbsorbing(c) && P.bigBuyDominates(c), -1, 3],
  [(c) => P.bidAbsorbing(c) && P.deltaNeg(c), 1, 2.5],
  [(c) => P.askAbsorbing(c) && P.deltaPos(c), -1, 2.5],
  [(c) => P.bidAbsorbing(c) && P.cvdFalling(c), 1, 2.5],
  [(c) => P.askAbsorbing(c) && P.cvdRising(c), -1, 2.5],
  [(c) => P.bidAbsorbing(c) && P.tapeBull(c), 0, 2],
  [(c) => P.askAbsorbing(c) && P.tapeBear(c), 0, 2]
]);

add('20.9', 'Exhaustion Reversal Confirm', 20, { method: 'swing', stopMult: 1.2, rr: 2.8 }, [
  [(c) => P.volClimax(c) && P.upCandle(c) && P.doji(c), -1, 2.5],
  [(c) => P.volClimax(c) && P.downCandle(c) && P.doji(c), 1, 2.5],
  [(c) => P.volClimax(c) && P.upCandle(c) && P.pinBear(c), -1, 3.5],
  [(c) => P.volClimax(c) && P.downCandle(c) && P.pinBull(c), 1, 3.5],
  [(c) => P.volClimax(c) && P.upCandle(c) && P.engulfBear(c), -1, 3],
  [(c) => P.volClimax(c) && P.downCandle(c) && P.engulfBull(c), 1, 3],
  [(c) => P.volClimax(c) && P.upCandle(c) && P.rsiDivBear(c), -1, 3],
  [(c) => P.volClimax(c) && P.downCandle(c) && P.rsiDivBull(c), 1, 3],
  [(c) => P.volClimax(c) && P.upCandle(c), 0, 1.5],
  [(c) => P.volClimax(c) && P.downCandle(c), 0, 1.5]
]);

add('20.10', 'Absorption Compiler', 20, { method: 'swing', stopMult: 1.2, rr: 2.8 }, [
  [(c) => P.bidAbsorbing(c) && P.volClimax(c) && P.atLastL(c) && P.pinBull(c), 1, 4],
  [(c) => P.askAbsorbing(c) && P.volClimax(c) && P.atLastH(c) && P.pinBear(c), -1, 4],
  [(c) => P.volClimax(c) && P.downCandle(c) && P.rsiDivBull(c) && P.atSupport(c), 1, 4],
  [(c) => P.volClimax(c) && P.upCandle(c) && P.rsiDivBear(c) && P.atResistance(c), -1, 4],
  [(c) => P.bidAbsorbing(c) && P.htfBull(c), 1, 2.5],
  [(c) => P.askAbsorbing(c) && P.htfBear(c), -1, 2.5],
  [(c) => P.bidAbsorbing(c), 1, 2],
  [(c) => P.askAbsorbing(c), -1, 2],
  [(c) => P.volClimax(c) && P.downCandle(c), 1, 1.5],
  [(c) => P.volClimax(c) && P.upCandle(c), -1, 1.5]
]);

module.exports = { agents: require('./engine.js').agents };
