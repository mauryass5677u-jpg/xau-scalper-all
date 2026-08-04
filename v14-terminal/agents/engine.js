'use strict';

// ============================================================================
// PART C0 — AGENT SWARM ENGINE — XAUUSDT OMNISCIENT SCALPER v14.0
// Each of the 500 agents casts exactly 1 vote: LONG / SHORT / NEUTRAL.
// An agent activates its 10 rules; rule weights push it LONG or SHORT.
// Majority of 500 (>250) decides the scalp trade.
// ============================================================================

const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
const num = (x) => (x === undefined || x === null || Number.isNaN(x) ? null : x);
const LT = (a, b) => a !== null && b !== null && a < b;
const GT = (a, b) => a !== null && b !== null && a > b;

// ---------------------------------------------------------------------------
// PREDICATE LIBRARY — shared boolean conditions over the market context.
// ---------------------------------------------------------------------------
const P = {
  // --- price / ema geometry ---
  aboveEma8: (c) => GT(c.price, c.ind && c.ind.ema8),
  belowEma8: (c) => LT(c.price, c.ind && c.ind.ema8),
  aboveEma21: (c) => GT(c.price, c.ind && c.ind.ema21),
  belowEma21: (c) => LT(c.price, c.ind && c.ind.ema21),
  aboveEma50: (c) => GT(c.price, c.ind && c.ind.ema50),
  belowEma50: (c) => LT(c.price, c.ind && c.ind.ema50),
  aboveEma200: (c) => GT(c.price, c.ind && c.ind.ema200),
  belowEma200: (c) => LT(c.price, c.ind && c.ind.ema200),
  ema8Above21: (c) => GT(c.ind && c.ind.ema8, c.ind && c.ind.ema21),
  ema8Below21: (c) => LT(c.ind && c.ind.ema8, c.ind && c.ind.ema21),
  ema21Above50: (c) => GT(c.ind && c.ind.ema21, c.ind && c.ind.ema50),
  ema21Below50: (c) => LT(c.ind && c.ind.ema21, c.ind && c.ind.ema50),
  ema50Above200: (c) => GT(c.ind && c.ind.ema50, c.ind && c.ind.ema200),
  ema50Below200: (c) => LT(c.ind && c.ind.ema50, c.ind && c.ind.ema200),
  ema8Rising: (c) => GT(c.ind && c.ind.ema8Slope, 0),
  ema8Falling: (c) => LT(c.ind && c.ind.ema8Slope, 0),
  ema21Rising: (c) => GT(c.ind && c.ind.ema21Slope, 0),
  ema21Falling: (c) => LT(c.ind && c.ind.ema21Slope, 0),
  alignBull: (c) => c.ind && c.ind.alignment === 'BULLISH',
  alignBear: (c) => c.ind && c.ind.alignment === 'BEARISH',
  alignMixed: (c) => c.ind && c.ind.alignment === 'MIXED',

  // --- candles ---
  pinBull: (c) => c.ind && c.ind.patterns.pinBull,
  pinBear: (c) => c.ind && c.ind.patterns.pinBear,
  hammer: (c) => c.ind && c.ind.patterns.hammer,
  shootingStar: (c) => c.ind && c.ind.patterns.shootingStar,
  doji: (c) => c.ind && c.ind.patterns.doji,
  engulfBull: (c) => c.ind && c.ind.patterns.engulfBull,
  engulfBear: (c) => c.ind && c.ind.patterns.engulfBear,
  threeWhite: (c) => c.ind && c.ind.patterns.threeWhite,
  threeBlack: (c) => c.ind && c.ind.patterns.threeBlack,
  marubozu: (c) => c.ind && c.ind.patterns.marubozu,
  upCandle: (c) => c.ind && c.ind.patterns.upBody,
  downCandle: (c) => c.ind && !c.ind.patterns.upBody,
  bigBody: (c) => c.ind && c.ind.patterns.body > c.ind.atr14 * 0.8,
  longUpperWick: (c) => c.ind && c.ind.patterns.upperWick > c.ind.atr14 * 0.6,
  longLowerWick: (c) => c.ind && c.ind.patterns.lowerWick > c.ind.atr14 * 0.6,

  // --- momentum ---
  rsiAbove50: (c) => GT(c.ind && c.ind.rsi, 50),
  rsiBelow50: (c) => LT(c.ind && c.ind.rsi, 50),
  rsiBull: (c) => GT(c.ind && c.ind.rsi, 55),
  rsiBear: (c) => LT(c.ind && c.ind.rsi, 45),
  rsiOB: (c) => GT(c.ind && c.ind.rsi, 70),
  rsiOS: (c) => LT(c.ind && c.ind.rsi, 30),
  rsiExtremeOB: (c) => GT(c.ind && c.ind.rsi, 80),
  rsiExtremeOS: (c) => LT(c.ind && c.ind.rsi, 20),
  rsiDivBull: (c) => c.ind && c.ind.rsiDiv === 'BULLISH',
  rsiDivBear: (c) => c.ind && c.ind.rsiDiv === 'BEARISH',
  macdAboveSig: (c) => GT(c.ind && c.ind.macdLine, c.ind && c.ind.macdSig),
  macdBelowSig: (c) => LT(c.ind && c.ind.macdLine, c.ind && c.ind.macdSig),
  macdHistUp: (c) => GT(c.ind && c.ind.macdHist, 0),
  macdHistDn: (c) => LT(c.ind && c.ind.macdHist, 0),
  macdHistRising: (c) => GT(c.ind && c.ind.macdHist, c.ind && c.ind.macdHistPrev),
  macdHistFalling: (c) => LT(c.ind && c.ind.macdHist, c.ind && c.ind.macdHistPrev),
  stKAboveD: (c) => GT(c.ind && c.ind.stK, c.ind && c.ind.stD),
  stKBelowD: (c) => LT(c.ind && c.ind.stK, c.ind && c.ind.stD),
  stBull: (c) => GT(c.ind && c.ind.stK, 50),
  stBear: (c) => LT(c.ind && c.ind.stK, 50),
  stOB: (c) => GT(c.ind && c.ind.stK, 80),
  stOS: (c) => LT(c.ind && c.ind.stK, 20),
  cciBull: (c) => GT(c.ind && c.ind.cci, 100),
  cciBear: (c) => LT(c.ind && c.ind.cci, -100),
  cciRising: (c) => GT(c.ind && c.ind.cci, 0),
  cciFalling: (c) => LT(c.ind && c.ind.cci, 0),
  wrBull: (c) => GT(c.ind && c.ind.wr, -50),
  wrBear: (c) => LT(c.ind && c.ind.wr, -50),
  wrOB: (c) => GT(c.ind && c.ind.wr, -20),
  wrOS: (c) => LT(c.ind && c.ind.wr, -80),
  rocPos: (c) => GT(c.ind && c.ind.roc, 0),
  rocNeg: (c) => LT(c.ind && c.ind.roc, 0),
  momUp: (c) => GT(c.ind && c.ind.momentumScore, 6),
  momDown: (c) => LT(c.ind && c.ind.momentumScore, 4),

  // --- volatility / bands ---
  atrLow: (c) => LT(c.ind && c.ind.atrPct, 0.08),
  atrNormal: (c) => { const a = c.ind && c.ind.atrPct; return a !== null && a >= 0.08 && a <= 0.45; },
  atrHigh: (c) => GT(c.ind && c.ind.atrPct, 0.45),
  atrVeryHigh: (c) => GT(c.ind && c.ind.atrPct, 0.7),
  aboveBBUp: (c) => GT(c.price, c.ind && c.ind.bbUp),
  belowBBLo: (c) => LT(c.price, c.ind && c.ind.bbLo),
  nearBBUp: (c) => { const i = c.ind; return i && i.bbUp !== null && Math.abs(i.bbUp - c.price) < i.atr14 * 0.25; },
  nearBBLo: (c) => { const i = c.ind; return i && i.bbLo !== null && Math.abs(c.price - i.bbLo) < i.atr14 * 0.25; },
  squeezeOn: (c) => c.ind && c.ind.squeeze,
  bbWidthExpanding: (c) => { const i = c.ind; return i && i.bbWidthHist !== null && i.bbWidthPct > i.bbWidthHist * 1.05; },
  aboveKcUp: (c) => GT(c.price, c.ind && c.ind.kcUp),
  belowKcLo: (c) => LT(c.price, c.ind && c.ind.kcLo),
  kcBandWalk: (c) => { const i = c.ind; return i && (GT(c.price, i.kcUp) || LT(c.price, i.kcLo)) && GT(i.atrPct, 0.3); },

  // --- trend / structure ---
  structUp: (c) => c.ind && c.ind.struct.includes('UP'),
  structDn: (c) => c.ind && c.ind.struct.includes('DOWN'),
  structNeutral: (c) => c.ind && c.ind.struct === 'NEUTRAL',
  bosUp: (c) => c.ind && c.ind.bosUp,
  bosDn: (c) => c.ind && c.ind.bosDn,
  chochBull: (c) => c.ind && c.ind.choch === 'BULLISH_CHOCH',
  chochBear: (c) => c.ind && c.ind.choch === 'BEARISH_CHOCH',
  aboveSuperTrend: (c) => c.ind && c.ind.supertrendDir === 1,
  belowSuperTrend: (c) => c.ind && c.ind.supertrendDir === -1,
  adxStrong: (c) => GT(c.ind && c.ind.adx, 25),
  adxWeak: (c) => LT(c.ind && c.ind.adx, 20),
  diPlusWins: (c) => GT(c.ind && c.ind.diPlus, c.ind && c.ind.diMinus),
  diMinusWins: (c) => LT(c.ind && c.ind.diPlus, c.ind && c.ind.diMinus),
  aboveVwap: (c) => GT(c.price, c.ind && c.ind.vwap),
  belowVwap: (c) => LT(c.price, c.ind && c.ind.vwap),
  nearVwap: (c) => { const i = c.ind; return i && i.vwap !== null && Math.abs(c.price - i.vwap) < i.atr14 * 0.3; },
  aboveHull: (c) => GT(c.price, c.ind && c.ind.hull),
  belowHull: (c) => LT(c.price, c.ind && c.ind.hull),
  hullRising: (c) => { const i = c.ind; return i && i.hull !== null && i.price > i.hull; },
  hullFalling: (c) => { const i = c.ind; return i && i.hull !== null && i.price < i.hull; },
  aboveKama: (c) => GT(c.price, c.ind && c.ind.kama),
  belowKama: (c) => LT(c.price, c.ind && c.ind.kama),
  kamaAbovePrice: (c) => LT(c.ind && c.ind.kama, c.ind && c.ind.price),
  ribbonBull: (c) => c.ind && c.ind.ribbon && c.ind.ribbon.state === 'BULLISH',
  ribbonBear: (c) => c.ind && c.ind.ribbon && c.ind.ribbon.state === 'BEARISH',
  ribbonTight: (c) => { const i = c.ind; return i && i.ribbon && i.ribbon.spread !== null && i.ribbon.spread < i.atr14 * 0.8; },
  psarBelow: (c) => GT(c.ind && c.ind.price, c.ind && c.ind.psar),
  psarAbove: (c) => LT(c.ind && c.ind.price, c.ind && c.ind.psar),
  donchianBreakUp: (c) => GT(c.price, c.ind && c.ind.dcUp),
  donchianBreakDn: (c) => LT(c.price, c.ind && c.ind.dcLo),

  // --- levels ---
  nearEma21At: (c, side) => { const i = c.ind; if (!i) return false; const tol = i.atr14 * 0.35; const ref = side === 'low' ? i.low : side === 'high' ? i.high : c.price; return ref !== null && Math.abs(i.ema21 - ref) < tol; },
  nearEma50At: (c, side) => { const i = c.ind; if (!i) return false; const tol = i.atr14 * 0.35; const ref = side === 'low' ? i.low : side === 'high' ? i.high : c.price; return ref !== null && Math.abs(i.ema50 - ref) < tol; },
  retestAboveLastH: (c) => { const i = c.ind; return i && i.lastH !== null && c.price > i.lastH && c.price - i.lastH < i.atr14 * 1.2; },
  retestBelowLastL: (c) => { const i = c.ind; return i && i.lastL !== null && c.price < i.lastL && i.lastL - c.price < i.atr14 * 1.2; },
  closeBackBelowH: (c) => { const i = c.ind; return i && i.lastH !== null && i.high > i.lastH && c.price < i.lastH; },
  closeBackAboveL: (c) => { const i = c.ind; return i && i.lastL !== null && i.low < i.lastL && c.price > i.lastL; },
  doubleTop: (c) => { const h = c.ind && c.ind.swingHighs; return h && h.length >= 3 && Math.abs(h[h.length - 1] - h[h.length - 3]) < (c.ind.atr14 || 1) * 0.2; },
  doubleBottom: (c) => { const l = c.ind && c.ind.swingLows; return l && l.length >= 3 && Math.abs(l[l.length - 1] - l[l.length - 3]) < (c.ind.atr14 || 1) * 0.2; },
  near: (c, key) => { const p = c.pivots; if (!p || p[key] === undefined || !c.ind) return false; return Math.abs(p[key] - c.price) < c.ind.atr14 * 0.3; },
  // --- trendlines ---
  trendlineUpTouch: (c) => c.ind && c.ind.tl && c.ind.tl.upTouch,
  trendlineDnTouch: (c) => c.ind && c.ind.tl && c.ind.tl.dnTouch,
  trendlineUpBreak: (c) => c.ind && c.ind.tl && c.ind.tl.upBreak,
  trendlineDnBreak: (c) => c.ind && c.ind.tl && c.ind.tl.dnBreak,
  trendlineUpFake: (c) => c.ind && c.ind.tl && c.ind.tl.upFake,
  trendlineDnFake: (c) => c.ind && c.ind.tl && c.ind.tl.dnFake,
  steepUpLine: (c) => { const t = c.ind && c.ind.tl; return t && t.upSlope !== null && t.upSlope > (c.ind.atr14 || 1) * 0.03; },
  steepDnLine: (c) => { const t = c.ind && c.ind.tl; return t && t.dnSlope !== null && t.dnSlope < -(c.ind.atr14 || 1) * 0.03; },
  // --- channels ---
  channelUpLowTouch: (c) => c.ind && c.ind.channel && c.ind.channel.upLowTouch,
  channelDnHighTouch: (c) => c.ind && c.ind.channel && c.ind.channel.dnHighTouch,
  channelUpBreak: (c) => c.ind && c.ind.channel && c.ind.channel.upBreak,
  channelDnBreak: (c) => c.ind && c.ind.channel && c.ind.channel.dnBreak,
  channelUpFake: (c) => c.ind && c.ind.channel && c.ind.channel.upFake,
  channelDnFake: (c) => c.ind && c.ind.channel && c.ind.channel.dnFake,
  channelTight: (c) => c.ind && c.ind.channel && c.ind.channel.tight,
  channelWide: (c) => c.ind && c.ind.channel && c.ind.channel.wide,
  channelMid: (c) => c.ind && c.ind.channel && c.ind.channel.midTouch,
  atResistance: (c) => { const r = c.ind && c.ind.dynamicSR && c.ind.dynamicSR.nearestResistance; return r !== null && Math.abs(r - c.price) < c.ind.atr14 * 0.35; },
  atSupport: (c) => { const s = c.ind && c.ind.dynamicSR && c.ind.dynamicSR.nearestSupport; return s !== null && Math.abs(c.price - s) < c.ind.atr14 * 0.35; },
  brokeResistance: (c) => { const r = c.ind && c.ind.dynamicSR && c.ind.dynamicSR.nearestResistance; return r !== null && c.price > r; },
  brokeSupport: (c) => { const s = c.ind && c.ind.dynamicSR && c.ind.dynamicSR.nearestSupport; return s !== null && c.price < s; },
  abovePivotP: (c) => GT(c.price, c.pivots && c.pivots.P),
  belowPivotP: (c) => LT(c.price, c.pivots && c.pivots.P),
  aboveR1: (c) => GT(c.price, c.pivots && c.pivots.R1),
  belowS1: (c) => LT(c.price, c.pivots && c.pivots.S1),
  nearR1: (c) => { const r = c.pivots && c.pivots.R1; return r !== null && Math.abs(r - c.price) < 0.3 * c.ind.atr14; },
  nearS1: (c) => { const s = c.pivots && c.pivots.S1; return s !== null && Math.abs(c.price - s) < 0.3 * c.ind.atr14; },
  nearFib618: (c) => { const f = c.fib; return f && Math.abs(f.L618 - c.price) < c.ind.atr14 * 0.3; },
  nearFib382: (c) => { const f = c.fib; return f && Math.abs(f.L382 - c.price) < c.ind.atr14 * 0.3; },
  nearFib50: (c) => { const f = c.fib; return f && Math.abs(f.L50 - c.price) < c.ind.atr14 * 0.3; },
  aboveFvg: (c) => { const f = c.ind && c.ind.fvg; return f && f.type === 'BULLISH' && c.price > f.mid; },
  belowFvg: (c) => { const f = c.ind && c.ind.fvg; return f && f.type === 'BEARISH' && c.price < f.mid; },
  fvgUnfilled: (c) => c.ind && c.ind.fvg !== null,
  nearFvg: (c) => { const f = c.ind && c.ind.fvg; return f && Math.abs(c.price - f.mid) < c.ind.atr14 * 0.4; },
  obNear: (c) => { const obs = c.ind && c.ind.orderBlocks; if (!obs || !obs.length) return false; const ob = obs[obs.length - 1]; return Math.abs((ob.top + ob.bottom) / 2 - c.price) < c.ind.atr14 * 0.6; },
  obBullNear: (c) => { const obs = c.ind && c.ind.orderBlocks; if (!obs || !obs.length) return false; const ob = obs[obs.length - 1]; return ob.type === 'BULLISH' && Math.abs((ob.top + ob.bottom) / 2 - c.price) < c.ind.atr14 * 0.6; },
  obBearNear: (c) => { const obs = c.ind && c.ind.orderBlocks; if (!obs || !obs.length) return false; const ob = obs[obs.length - 1]; return ob.type === 'BEARISH' && Math.abs((ob.top + ob.bottom) / 2 - c.price) < c.ind.atr14 * 0.6; },
  aboveLastH: (c) => GT(c.price, c.ind && c.ind.lastH),
  belowLastL: (c) => LT(c.price, c.ind && c.ind.lastL),
  atLastH: (c) => { const h = c.ind && c.ind.lastH; return h !== null && Math.abs(c.price - h) < c.ind.atr14 * 0.3; },
  atLastL: (c) => { const l = c.ind && c.ind.lastL; return l !== null && Math.abs(c.price - l) < c.ind.atr14 * 0.3; },

  // --- volume / tape ---
  rvolHigh: (c) => GT(c.ind && c.ind.rvol, 1.5),
  rvolLow: (c) => LT(c.ind && c.ind.rvol, 0.7),
  volSpike: (c) => GT(c.ind && c.ind.rvol, 2.0),
  volClimax: (c) => GT(c.ind && c.ind.rvol, 3.0),
  mfiBull: (c) => GT(c.ind && c.ind.mfi, 60),
  mfiBear: (c) => LT(c.ind && c.ind.mfi, 40),
  obvRising: (c) => GT(c.ind && c.ind.obvSlope, 0),
  obvFalling: (c) => LT(c.ind && c.ind.obvSlope, 0),
  cvdRising: (c) => GT(c.ind && c.ind.cvd, 0),
  cvdFalling: (c) => LT(c.ind && c.ind.cvd, 0),
  deltaPos: (c) => GT(c.ind && c.ind.delta, 0),
  deltaNeg: (c) => LT(c.ind && c.ind.delta, 0),
  deltaExtremePos: (c) => { const i = c.ind; return i && i.vol > 0 && i.delta / i.vol > 0.6; },
  deltaExtremeNeg: (c) => { const i = c.ind; return i && i.vol > 0 && i.delta / i.vol < -0.6; },
  priceRising: (c) => GT(c.price, c.pricePrev !== undefined && c.pricePrev !== null ? c.pricePrev : c.ind && c.ind.close),
  priceFalling: (c) => LT(c.price, c.pricePrev !== undefined && c.pricePrev !== null ? c.pricePrev : c.ind && c.ind.close),
  priceHeldBid: (c) => { const i = c.ind; return i && i.delta < 0 && i.close >= i.open; },
  priceHeldAsk: (c) => { const i = c.ind; return i && i.delta > 0 && i.close <= i.open; },
  tapeBull: (c) => GT(c.tape && c.tape.ratio, 1.5),
  tapeBear: (c) => LT(c.tape && c.tape.ratio, 0.7),
  tapeNeutral: (c) => { const r = c.tape && c.tape.ratio; return r !== null && r >= 0.7 && r <= 1.5; },
  bigBuyDominates: (c) => GT(c.tape && c.tape.bigBuys, c.tape && c.tape.bigSells),
  bigSellDominates: (c) => LT(c.tape && c.tape.bigBuys, c.tape && c.tape.bigSells),

  // --- order book ---
  bookBidHeavy: (c) => GT(c.book && c.book.imbalance, 15),
  bookAskHeavy: (c) => LT(c.book && c.book.imbalance, -15),
  bookBalanced: (c) => { const i = c.book && c.book.imbalance; return i !== null && Math.abs(i) <= 15; },
  spreadTight: (c) => LT(c.book && c.book.spread, 0.15),
  spreadWide: (c) => GT(c.book && c.book.spread, 0.5),
  bidWallAbove: (c) => { const w = c.book && c.book.walls && c.book.walls.find((x) => x.side === 'BID'); return !!w; },
  askWallBelow: (c) => { const w = c.book && c.book.walls && c.book.walls.find((x) => x.side === 'ASK'); return !!w; },
  bidAbsorbing: (c) => { const b = c.book; return b && b.bidSum > 0 && b.askSum > 0 && b.imbalance > 25; },
  askAbsorbing: (c) => { const b = c.book; return b && b.bidSum > 0 && b.askSum > 0 && b.imbalance < -25; },

  // --- funding / derivatives ---
  fundingPos: (c) => GT(c.funds && c.funds.funding, 0),
  fundingNeg: (c) => LT(c.funds && c.funds.funding, 0),
  fundingHigh: (c) => GT(c.funds && c.funds.funding, 0.0005),
  fundingLow: (c) => LT(c.funds && c.funds.funding, -0.0005),
  fundingExtremePos: (c) => GT(c.funds && c.funds.funding, 0.001),
  fundingExtremeNeg: (c) => LT(c.funds && c.funds.funding, -0.001),
  fundingRising: (c) => { const t = c.funds && c.funds.fundingTrend; return t && t.slope > 0; },
  fundingFalling: (c) => { const t = c.funds && c.funds.fundingTrend; return t && t.slope < 0; },
  fundingFlipUp: (c) => { const t = c.funds && c.funds.fundingTrend; return t && t.flip === 'UP'; },
  fundingFlipDn: (c) => { const t = c.funds && c.funds.fundingTrend; return t && t.flip === 'DOWN'; },
  fundingAboveMa8: (c) => { const t = c.funds && c.funds.fundingTrend; return t && t.lastRate > t.avg8; },
  fundingBelowMa8: (c) => { const t = c.funds && c.funds.fundingTrend; return t && t.lastRate < t.avg8; },
  fundingSustainedPos: (c) => { const t = c.funds && c.funds.fundingTrend; return t && t.avg24 > 0.0003; },
  fundingSustainedNeg: (c) => { const t = c.funds && c.funds.fundingTrend; return t && t.avg24 < -0.0003; },
  oiRising: (c) => GT(c.funds && c.funds.oiChange, 0.5),
  oiFalling: (c) => LT(c.funds && c.funds.oiChange, -0.5),
  oiFlat: (c) => { const o = c.funds && c.funds.oiChange; return o !== null && Math.abs(o) <= 0.5; },
  oiSpike: (c) => GT(c.funds && c.funds.oiChange, 3),
  oiDrop: (c) => LT(c.funds && c.funds.oiChange, -3),
  lsExtremeLong: (c) => GT(c.funds && c.funds.globalLS, 2.0),
  lsExtremeShort: (c) => LT(c.funds && c.funds.globalLS, 0.5),
  lsLong: (c) => GT(c.funds && c.funds.globalLS, 1.2),
  lsShort: (c) => LT(c.funds && c.funds.globalLS, 0.85),
  lsRising: (c) => { const a = c.funds && c.funds.lsSeries; const n = a && a.length; return n >= 3 && a[n - 1] > a[n - 2] && a[n - 2] > a[n - 3]; },
  lsFalling: (c) => { const a = c.funds && c.funds.lsSeries; const n = a && a.length; return n >= 3 && a[n - 1] < a[n - 2] && a[n - 2] < a[n - 3]; },
  topTraderLong: (c) => GT(c.funds && c.funds.topPosLS, 1.2),
  topTraderShort: (c) => LT(c.funds && c.funds.topPosLS, 0.85),
  takerBuyHeavy: (c) => GT(c.funds && c.funds.takerRatio, 1.5),
  takerSellHeavy: (c) => LT(c.funds && c.funds.takerRatio, 0.7),
  basisPos: (c) => GT(c.funds && c.funds.basis, 0),
  basisNeg: (c) => LT(c.funds && c.funds.basis, 0),
  basisWide: (c) => GT(c.funds && c.funds.basisAbs, 1),

  // --- macro ---
  dxyDown: (c) => { const m = c.macro && c.macro.dxy; return m && m.changePct !== null && m.changePct < -0.12; },
  dxyUp: (c) => { const m = c.macro && c.macro.dxy; return m && m.changePct !== null && m.changePct > 0.12; },
  tnxDown: (c) => { const m = c.macro && c.macro.tnx; return m && m.changePct !== null && m.changePct < -0.05; },
  tnxUp: (c) => { const m = c.macro && c.macro.tnx; return m && m.changePct !== null && m.changePct > 0.05; },
  vixSpiking: (c) => { const m = c.macro && c.macro.vix; return m && m.changePct !== null && m.changePct > 3; },
  vixCalm: (c) => { const m = c.macro && c.macro.vix; return m && m.changePct !== null && m.changePct < -3; },
  usdjpyDown: (c) => { const m = c.macro && c.macro.usdjpy; return m && m.changePct !== null && m.changePct < -0.1; },
  silverUp: (c) => { const m = c.macro && c.macro.silver; return m && m.changePct !== null && m.changePct > 0.3; },
  silverDown: (c) => { const m = c.macro && c.macro.silver; return m && m.changePct !== null && m.changePct < -0.3; },
  spotPremium: (c) => { const s = c.spot && c.spot.price, m = c.funds && c.funds.markPrice; return s && m && ((s - m) / m) * 100 > 0.05; },
  spotDiscount: (c) => { const s = c.spot && c.spot.price, m = c.funds && c.funds.markPrice; return s && m && ((s - m) / m) * 100 < -0.05; },

  // --- sessions / timing ---
  asia: (c) => c.session && c.session.name === 'ASIA',
  london: (c) => c.session && c.session.name === 'LONDON',
  newyork: (c) => c.session && c.session.name === 'NEWYORK',
  sessionYoung: (c) => c.session && c.session.openMins < 60,
  sessionMature: (c) => c.session && c.session.openMins > 240,
  nyLondonOverlap: (c) => c.session && c.session.name === 'NEWYORK' && c.session.openMins < 60,

  // --- multi-timeframe ---
  htfBull: (c) => { const h = c.inds && c.inds['1h']; return h && h.alignment === 'BULLISH'; },
  htfBear: (c) => { const h = c.inds && c.inds['1h']; return h && h.alignment === 'BEARISH'; },
  h4Bull: (c) => { const h = c.inds && c.inds['4h']; return h && h.alignment === 'BULLISH'; },
  h4Bear: (c) => { const h = c.inds && c.inds['4h']; return h && h.alignment === 'BEARISH'; },
  d1Bull: (c) => { const d = c.inds && c.inds['1d']; return d && d.alignment === 'BULLISH'; },
  d1Bear: (c) => { const d = c.inds && c.inds['1d']; return d && d.alignment === 'BEARISH'; },
  m5Bull: (c) => { const m = c.inds && c.inds['5m']; return m && m.alignment === 'BULLISH'; },
  m5Bear: (c) => { const m = c.inds && c.inds['5m']; return m && m.alignment === 'BEARISH'; },
  htfTrendUp: (c) => { const h = c.inds && c.inds['4h']; return h && (h.alignment === 'BULLISH' || h.supertrendDir === 1); },
  htfTrendDn: (c) => { const h = c.inds && c.inds['4h']; return h && (h.alignment === 'BEARISH' || h.supertrendDir === -1); },
  allTfBull: (c) => { const inds = c.inds; return inds && ['5m', '15m', '1h', '4h'].every((t) => inds[t] && inds[t].alignment === 'BULLISH'); },
  allTfBear: (c) => { const inds = c.inds; return inds && ['5m', '15m', '1h', '4h'].every((t) => inds[t] && inds[t].alignment === 'BEARISH'); },
  mtfMixed: (c) => { const inds = c.inds; return inds && inds['5m'] && inds['15m'] && inds['5m'].alignment !== inds['15m'].alignment; },
  htfPullbackBuy: (c) => { const h = c.inds && c.inds['1h'], i = c.ind; return h && i && h.alignment === 'BULLISH' && i.price < i.ema21 && i.price > i.ema21 - i.atr14; },
  htfPullbackSell: (c) => { const h = c.inds && c.inds['1h'], i = c.ind; return h && i && h.alignment === 'BEARISH' && i.price > i.ema21 && i.price < i.ema21 + i.atr14; },

  // --- volume profile ---
  atPoc: (c) => { const vp = c.ind && c.ind.volumeProfile; return vp && Math.abs(c.price - vp.poc) < c.ind.atr14 * 0.3; },
  aboveVal: (c) => { const vp = c.ind && c.ind.volumeProfile; return vp && c.price > vp.val; },
  belowVah: (c) => { const vp = c.ind && c.ind.volumeProfile; return vp && c.price < vp.vah; },
  atVah: (c) => { const vp = c.ind && c.ind.volumeProfile; return vp && Math.abs(c.price - vp.vah) < c.ind.atr14 * 0.3; },
  atVal: (c) => { const vp = c.ind && c.ind.volumeProfile; return vp && Math.abs(c.price - vp.val) < c.ind.atr14 * 0.3; },
  aboveVah: (c) => { const vp = c.ind && c.ind.volumeProfile; return vp && c.price > vp.vah; },
  belowVal: (c) => { const vp = c.ind && c.ind.volumeProfile; return vp && c.price < vp.val; },
  vpInValue: (c) => { const vp = c.ind && c.ind.volumeProfile; return vp && c.price >= vp.val && c.price <= vp.vah; },
  vpTight: (c) => { const vp = c.ind && c.ind.volumeProfile; return vp && vp.range < c.ind.atr14 * 2.5; },
  vpWide: (c) => { const vp = c.ind && c.ind.volumeProfile; return vp && vp.range > c.ind.atr14 * 3.5; },
  abovePocToVah: (c) => { const vp = c.ind && c.ind.volumeProfile; return vp && c.price > vp.poc && c.price < vp.vah; },
  belowPocToVal: (c) => { const vp = c.ind && c.ind.volumeProfile; return vp && c.price < vp.poc && c.price > vp.val; },

  // --- range / consolidation (c.ind.range from rangeDetect) ---
  rangeAtHigh: (c) => c.ind && c.ind.range && c.ind.range.atHigh,
  rangeAtLow: (c) => c.ind && c.ind.range && c.ind.range.atLow,
  rangeAtMid: (c) => c.ind && c.ind.range && c.ind.range.atMid,
  rangeActive: (c) => c.ind && c.ind.range && c.ind.range.active,
  rangeTight: (c) => c.ind && c.ind.range && c.ind.range.active && c.ind.range.width < c.ind.atr14 * 2,
  rangeBreakUp: (c) => c.ind && c.ind.range && c.ind.range.breakUp,
  rangeBreakDn: (c) => c.ind && c.ind.range && c.ind.range.breakDn,
  rangeFakeUp: (c) => c.ind && c.ind.range && c.ind.range.fakeUp,
  rangeFakeDn: (c) => c.ind && c.ind.range && c.ind.range.fakeDn,

  // --- liquidity pools (c.ind.bsl/ssl/eqHighs/eqLows) ---
  nearBsl: (c) => { const i = c.ind; return i && i.bsl !== null && Math.abs(i.bsl - c.price) < i.atr14 * 0.35; },
  nearSsl: (c) => { const i = c.ind; return i && i.ssl !== null && Math.abs(c.price - i.ssl) < i.atr14 * 0.35; },
  sweptBsl: (c) => { const i = c.ind; return i && i.bsl !== null && i.high > i.bsl && c.price < i.bsl; },
  sweptSsl: (c) => { const i = c.ind; return i && i.ssl !== null && i.low < i.ssl && c.price > i.ssl; },
  aboveBsl: (c) => { const i = c.ind; return i && i.bsl !== null && c.price > i.bsl; },
  belowSsl: (c) => { const i = c.ind; return i && i.ssl !== null && c.price < i.ssl; },
  eqHighsNear: (c) => { const i = c.ind, a = i && i.eqHighs; return a && a.length && Math.abs(a[a.length - 1] - c.price) < i.atr14 * 0.35; },
  eqLowsNear: (c) => { const i = c.ind, a = i && i.eqLows; return a && a.length && Math.abs(c.price - a[a.length - 1]) < i.atr14 * 0.35; },
  eqHighsSwept: (c) => { const i = c.ind, a = i && i.eqHighs; return a && a.length && i.high > a[a.length - 1] && c.price < a[a.length - 1]; },
  eqLowsSwept: (c) => { const i = c.ind, a = i && i.eqLows; return a && a.length && i.low < a[a.length - 1] && c.price > a[a.length - 1]; },

  // --- breaks / voids / inducement / breaker ---
  voidNear: (c) => { const v = c.ind && c.ind.voids; return v && v.length > 0 && Math.abs((v[v.length - 1].top + v[v.length - 1].bottom) / 2 - c.price) < c.ind.atr14 * 0.6; },
  voidAbove: (c) => { const v = c.ind && c.ind.voids; return v && v.length > 0 && v[v.length - 1].type === 'BULLISH' && c.price < v[v.length - 1].bottom; },
  voidBelow: (c) => { const v = c.ind && c.ind.voids; return v && v.length > 0 && v[v.length - 1].type === 'BEARISH' && c.price > v[v.length - 1].top; },
  induceBull: (c) => c.ind && c.ind.inducement && c.ind.inducement.type === 'BULLISH',
  induceBear: (c) => c.ind && c.ind.inducement && c.ind.inducement.type === 'BEARISH',
  breakerBull: (c) => { const b = c.ind && c.ind.breakerBlocks; return b && b.length > 0 && b[b.length - 1].type === 'BULLISH'; },
  breakerBear: (c) => { const b = c.ind && c.ind.breakerBlocks; return b && b.length > 0 && b[b.length - 1].type === 'BEARISH'; },
  aboveBreaker: (c) => { const b = c.ind && c.ind.breakerBlocks; return b && b.length > 0 && b[b.length - 1].type === 'BULLISH' && c.price > b[b.length - 1].top; },
  belowBreaker: (c) => { const b = c.ind && c.ind.breakerBlocks; return b && b.length > 0 && b[b.length - 1].type === 'BEARISH' && c.price < b[b.length - 1].bottom; },

  // --- system state (for system agents 46-50) ---
  sysHealthy: (c) => c.sys && c.sys.apiOk && c.sys.wsConnected && !c.sys.halted,
  sysStale: (c) => c.sys && c.sys.freshnessScore > 30,
  sysVeryStale: (c) => c.sys && c.sys.freshnessScore > 60,
  sysSlow: (c) => c.sys && c.sys.cycleMs > 5000,
  sysFast: (c) => c.sys && c.sys.cycleMs < 2000,
  aggLong: (c) => c.lastAgg && c.lastAgg.d === 1,
  aggShort: (c) => c.lastAgg && c.lastAgg.d === -1,
  aggNeutral: (c) => !c.lastAgg || c.lastAgg.d === 0,
  aggHighConf: (c) => c.lastAgg && c.lastAgg.confidence >= 65,
  aggLowConf: (c) => c.lastAgg && c.lastAgg.confidence < 55,
  gatesAllPass: (c) => c.lastAgg && c.lastAgg.gatesPass,
  gatesFail: (c) => c.lastAgg && c.lastAgg.gatesFail,
  biasLong: (c) => c.lastAgg && c.lastAgg.bias === 'BULLISH',
  biasShort: (c) => c.lastAgg && c.lastAgg.bias === 'BEARISH',
  outVote: (c) => c.lastAgg && c.lastAgg.outliers > 30,
  inVote: (c) => c.lastAgg && c.lastAgg.outliers <= 30
};

// ---------------------------------------------------------------------------
// Agent builder — `add(id, name, cat, opts, rules)` where each rule is
// [ predicate(ctx)->bool, dir(+1/-1), weight ].
// opts: { method, stopMult, rr, minScore, catWeight }
// ---------------------------------------------------------------------------
const agents = [];

function add(id, name, cat, opts, rules) {
  agents.push({
    id, name, cat,
    method: opts.method || 'price',
    stopMult: opts.stopMult || 1.1,
    rr: opts.rr || 2.0,
    minScore: opts.minScore || 1.2,
    catWeight: opts.catWeight || 1.0,
    rules
  });
}

// ---------------------------------------------------------------------------
// Vote runtime — exactly one vote per agent per cycle.
// ---------------------------------------------------------------------------
function runAgent(ctx, agent) {
  let bull = 0, bear = 0, active = 0;
  for (const r of agent.rules) {
    let hit = false;
    try { hit = !!r[0](ctx); } catch { hit = false; }
    if (hit) { active++; if (r[1] === 1) bull += r[2]; else bear += r[2]; }
  }
  const margin = bull - bear;
  const min = agent.minScore;
  let d = 0;
  if (margin >= min) d = 1;
  else if (margin <= -min) d = -1;
  const total = bull + bear;
  const ratio = total > 0 ? Math.max(bull, bear) / total : 0;
  const conf = total === 0 ? 0 : clamp(38 + Math.abs(margin) * 8 + ratio * 12, 0, 96);
  return {
    id: agent.id, name: agent.name, cat: agent.cat, d, conf: Math.round(conf * 10) / 10,
    bullScore: Math.round(bull * 10) / 10, bearScore: Math.round(bear * 10) / 10,
    activeRules: active, method: agent.method, stopMult: agent.stopMult, rr: agent.rr, catWeight: agent.catWeight
  };
}

module.exports = { P, add, agents, runAgent, clamp, num };
