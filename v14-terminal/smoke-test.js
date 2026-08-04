'use strict';
// smoke test: run all 500 agents against a rich synthetic context
const { agents, runAgent } = require('../v14-terminal/agents/engine.js');
require('../v14-terminal/agents/part1.js');
require('../v14-terminal/agents/part2.js');
require('../v14-terminal/agents/part3.js');
require('../v14-terminal/agents/part4.js');
require('../v14-terminal/agents/part5.js');

const ctx = {
  price: 3000.5, pricePrev: 3000.1,
  ind: {
    atr14: 6.5, atrPct: 0.3, ema8: 2999, ema21: 2996, ema50: 2988, ema200: 2970,
    ema8Slope: 1.2, ema21Slope: 0.8, alignment: 'BULLISH',
    rsi: 62, rsiDiv: null, macdLine: 5, macdSig: 4, macdHist: 1.2, macdHistPrev: 0.9,
    stK: 70, stD: 62, cci: 120, wr: -30, roc: 1, momentumScore: 7,
    bbUp: 3012, bbLo: 2980, bbWidthPct: 3, bbWidthHist: 2.8, squeeze: false, kcUp: 3005, kcLo: 2990,
    struct: 'UP', bosUp: false, bosDn: false, choch: null, supertrendDir: 1,
    adx: 28, diPlus: 24, diMinus: 18, vwap: 2998, vwapSd: 5, hull: 2999, kama: 2997,
    psar: null, dcUp: 3010, dcLo: 2985, ribbon: { state: 'BULLISH', spread: 3 },
    lastH: 3008, lastL: 2992, swingHighs: [3008, 3005, 3006], swingLows: [2992, 2990, 2991],
    dynamicSR: { nearestResistance: 3008.2, nearestSupport: 2991.5 },
    fvg: null, orderBlocks: [{ type: 'BULLISH', top: 2994, bottom: 2991 }],
    breakerBlocks: [], voids: [], inducement: null,
    volumeProfile: { poc: 2996, vah: 3004, val: 2988, range: 16 },
    tl: { upTouch: false, dnTouch: false, upBreak: false, dnBreak: false, upFake: false, dnFake: false, upSlope: 0.05, dnSlope: -0.04 },
    channel: { upLowTouch: false, dnHighTouch: false, upBreak: false, dnBreak: false, upFake: false, dnFake: false, tight: false, wide: false, midTouch: false },
    range: { hi: 3010, lo: 2990, mid: 3000, width: 20, active: false, atHigh: false, atLow: false, atMid: false, breakUp: false, breakDn: false, fakeUp: false, fakeDn: false },
    bsl: 3010, ssl: 2990, eqHighs: [3009, 3010], eqLows: [2991, 2990],
    rvol: 1.8, mfi: 65, obvSlope: 100, cvd: 50, delta: 30, vol: 100,
    patterns: { pinBull: false, pinBear: false, hammer: false, shootingStar: false, doji: false, engulfBull: false, engulfBear: false, threeWhite: false, threeBlack: false, marubozu: false, body: 3, upBody: true, upperWick: 1, lowerWick: 2 },
    close: 3000.5, high: 3001, low: 2999, open: 2999, vol2: 100
  },
  inds: {
    '5m': { alignment: 'BULLISH', supertrendDir: 1, ema21: 2998, ema50: 2990, ema200: 2975, atr14: 3, rsi: 58, macdHist: 1, adx: 22, hull: 2997 },
    '15m': { alignment: 'BULLISH', supertrendDir: 1, ema21: 2995, ema50: 2985, ema200: 2968, atr14: 5, rsi: 55, macdHist: 0.8, adx: 24, hull: 2993 },
    '1h': { alignment: 'BULLISH', supertrendDir: 1, ema21: 2990, ema50: 2978, ema200: 2950, atr14: 8, rsi: 52, macdHist: 0.5, adx: 20, hull: 2985 },
    '4h': { alignment: 'BULLISH', supertrendDir: 1, ema21: 2980, ema50: 2960, ema200: 2920, atr14: 15, rsi: 50, macdHist: 0.2, adx: 18, hull: 2970 },
    '1d': { alignment: 'BULLISH', supertrendDir: 1, ema21: 2940, ema50: 2890, ema200: 2800, atr14: 40, rsi: 48, macdHist: -0.5, adx: 16, hull: 2930 }
  },
  pivots: { P: 3000, R1: 3006, S1: 2994 },
  fib: { L382: 2995, L50: 2999, L618: 3002 },
  tape: { ratio: 1.6, bigBuys: 5, bigSells: 2, aggression: 0.4, buyVol: 60, sellVol: 40 },
  book: { imbalance: 18, spread: 0.1, bidSum: 100, askSum: 90, walls: [] },
  funds: { funding: 0.0004, fundingTrend: { slope: 0.00001, flip: null, lastRate: 0.0004, avg8: 0.0003, avg24: 0.0003 }, oiChange: 1.2, globalLS: 1.3, lsSeries: [1.1, 1.2, 1.3], topPosLS: 1.3, takerRatio: 1.2, basis: 0.5, basisAbs: 0.5, markPrice: 3000 },
  macro: { dxy: { changePct: -0.2 }, tnx: { changePct: -0.1 }, vix: { changePct: -2 }, usdjpy: { changePct: -0.1 }, silver: { changePct: 0.4 } },
  spot: { price: 3000.8 },
  session: { name: 'LONDON', openMins: 90 },
  sys: { apiOk: true, wsConnected: true, halted: false, freshnessScore: 10, cycleMs: 1500 },
  lastAgg: { d: 1, confidence: 70, gatesPass: true, gatesFail: false, bias: 'BULLISH', outliers: 20 }
};

let long = 0, short = 0, neutral = 0, errors = [];
for (const a of agents) {
  try {
    const v = runAgent(ctx, a);
    if (v.d === 1) long++; else if (v.d === -1) short++; else neutral++;
    if (v.conf < 0 || v.conf > 96) errors.push(a.id + ' conf out of range: ' + v.conf);
  } catch (e) { errors.push(a.id + ': ' + e.message); }
}
console.log('LONG:', long, 'SHORT:', short, 'NEUTRAL:', neutral);
console.log('errors:', errors.length ? errors.slice(0, 10) : 'none');
