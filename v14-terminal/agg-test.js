'use strict';
const agg = require('../v14-terminal/aggregator.js');
require('../v14-terminal/agents/part1.js');
require('../v14-terminal/agents/part2.js');
require('../v14-terminal/agents/part3.js');
require('../v14-terminal/agents/part4.js');
require('../v14-terminal/agents/part5.js');

const ctx = {
  price: 3000.5, pricePrev: 3000.1,
  ind: {
    price: 3000.5, atr14: 6.5, atrPct: 0.3, ema8: 2999, ema21: 2996, ema50: 2988, ema200: 2970,
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

const votes = agg.runAll(ctx);
const res = agg.compile(ctx, votes, {});
console.log('tally:', JSON.stringify(res.tally));
console.log('params:', JSON.stringify(res.params));
console.log('gates:', JSON.stringify(res.gates));
console.log('conf:', res.confidence, 'quality:', res.quality, 'outliers:', res.outliers);
console.log('lastAgg:', JSON.stringify(res.lastAgg));
console.log('signal:', JSON.stringify(res.signal, null, 1));

const ctx2 = JSON.parse(JSON.stringify(ctx));
ctx2.price = 3012; ctx2.pricePrev = 3001;
ctx2.ind.price = 3012; ctx2.ind.close = 3012; ctx2.ind.high = 3013; ctx2.ind.low = 3005; ctx2.ind.open = 3002;
ctx2.ind.ema8 = 3004; ctx2.ind.ema21 = 3000; ctx2.ind.ema50 = 2992; ctx2.ind.ema200 = 2974;
ctx2.ind.ema8Slope = 3.5; ctx2.ind.ema21Slope = 2.2; ctx2.ind.alignment = 'BULLISH';
ctx2.ind.rsi = 74; ctx2.ind.macdLine = 12; ctx2.ind.macdSig = 9; ctx2.ind.macdHist = 3.2; ctx2.ind.macdHistPrev = 2.1;
ctx2.ind.stK = 86; ctx2.ind.stD = 78; ctx2.ind.cci = 180; ctx2.ind.wr = -12; ctx2.ind.roc = 2.4; ctx2.ind.momentumScore = 9.5;
ctx2.ind.hull = 3006; ctx2.ind.kama = 3003; ctx2.ind.vwap = 3002; ctx2.ind.vwapSd = 4;
ctx2.ind.struct = 'UP'; ctx2.ind.supertrendDir = 1; ctx2.ind.adx = 34; ctx2.ind.diPlus = 30; ctx2.ind.diMinus = 12;
ctx2.ind.bbUp = 3014; ctx2.ind.bbLo = 2996; ctx2.ind.bbWidthPct = 2.2; ctx2.ind.bbWidthHist = 2.0;
ctx2.ind.kcUp = 3009; ctx2.ind.kcLo = 2994;
ctx2.ind.psar = 3003; ctx2.ind.dcUp = 3013; ctx2.ind.dcLo = 2994; ctx2.ind.ribbon = { state: 'BULLISH', spread: 1 };
ctx2.ind.lastH = 3013; ctx2.ind.lastL = 2994; ctx2.ind.swingHighs = [3013, 3009, 3008]; ctx2.ind.swingLows = [2994, 2993, 2995];
ctx2.ind.dynamicSR = { nearestResistance: 3013.5, nearestSupport: 3001.2 };
ctx2.ind.rvol = 2.6; ctx2.ind.mfi = 78; ctx2.ind.obvSlope = 220; ctx2.ind.cvd = 120; ctx2.ind.delta = 60;
ctx2.ind.range = { hi: 3009, lo: 2996, mid: 3002.5, width: 13, active: true, atHigh: false, atLow: false, atMid: false, breakUp: true, breakDn: false, fakeUp: false, fakeDn: false };
ctx2.ind.dcUp = 3008; ctx2.ind.dcLo = 2994;
ctx2.ind.bsl = 3010; ctx2.ind.ssl = 3001; ctx2.ind.eqHighs = [3009, 3009]; ctx2.ind.eqLows = [2995, 2996];
ctx2.ind.volumeProfile = { poc: 3002, vah: 3009, val: 2998, range: 11 };
ctx2.ind.patterns = { pinBull: true, pinBear: false, hammer: true, shootingStar: false, doji: false, engulfBull: true, engulfBear: false, threeWhite: true, threeBlack: false, marubozu: true, body: 7, upBody: true, upperWick: 0.4, lowerWick: 1.8 };
ctx2.inds = {
  '5m': { alignment: 'BULLISH', supertrendDir: 1, ema21: 3008, ema50: 2998, ema200: 2980, atr14: 3, rsi: 76, macdHist: 2.2, adx: 28, hull: 3010 },
  '15m': { alignment: 'BULLISH', supertrendDir: 1, ema21: 3002, ema50: 2992, ema200: 2972, atr14: 5, rsi: 72, macdHist: 1.9, adx: 30, hull: 3006 },
  '1h': { alignment: 'BULLISH', supertrendDir: 1, ema21: 2996, ema50: 2982, ema200: 2955, atr14: 8, rsi: 68, macdHist: 1.4, adx: 26, hull: 3000 },
  '4h': { alignment: 'BULLISH', supertrendDir: 1, ema21: 2986, ema50: 2964, ema200: 2924, atr14: 15, rsi: 62, macdHist: 1.0, adx: 24, hull: 2992 },
  '1d': { alignment: 'BULLISH', supertrendDir: 1, ema21: 2944, ema50: 2894, ema200: 2804, atr14: 40, rsi: 58, macdHist: 0.4, adx: 22, hull: 2950 }
};
ctx2.pivots = { P: 3005, R1: 3012, S1: 2998 };
ctx2.fib = { L382: 3006, L50: 3002, L618: 2999 };
ctx2.tape = { ratio: 2.8, bigBuys: 12, bigSells: 1, aggression: 0.6, buyVol: 80, sellVol: 30 };
ctx2.book = { imbalance: 34, spread: 0.06, bidSum: 130, askSum: 80, walls: [] };
ctx2.funds = { funding: -0.0001, fundingTrend: { slope: 0.00002, flip: null, lastRate: -0.0001, avg8: -0.0002, avg24: -0.0001 }, oiChange: 2.4, globalLS: 1.1, lsSeries: [0.9, 1.0, 1.1], topPosLS: 1.2, takerRatio: 1.8, basis: -0.3, basisAbs: 0.3, markPrice: 3011.5 };
ctx2.macro = { dxy: { changePct: -0.5 }, tnx: { changePct: -0.25 }, vix: { changePct: -4 }, usdjpy: { changePct: -0.3 }, silver: { changePct: 0.9 } };
ctx2.spot = { price: 3012.6 };
ctx2.ind.doji = false;
ctx2.ind.patterns.doji = false;
ctx2.ind.tl = { upTouch: true, dnTouch: false, upBreak: false, dnBreak: false, upFake: false, dnFake: false, upSlope: 0.09, dnSlope: -0.04 };
ctx2.ind.channel = { upLowTouch: true, dnHighTouch: false, upBreak: false, dnBreak: false, upFake: false, dnFake: false, tight: false, wide: true, midTouch: true };
ctx2.ind.fvg = { type: 'BULLISH', top: 3006, bottom: 3003, mid: 3004.5, size: 3 };
ctx2.ind.orderBlocks = [{ type: 'BULLISH', top: 3011, bottom: 3009 }, { type: 'BULLISH', top: 3008, bottom: 3006 }];
ctx2.ind.breakerBlocks = [{ type: 'BULLISH', top: 3002, bottom: 2999 }];
ctx2.ind.voids = [{ type: 'BULLISH', top: 3016, bottom: 3013 }];
ctx2.ind.inducement = { type: 'BULLISH', range: { hi: 3006, lo: 3000, mid: 3003 } };
ctx2.ind.bsl = 3016; ctx2.ind.ssl = 3010;
ctx2.ind.eqHighs = [3012, 3012]; ctx2.ind.eqLows = [3008, 3008];
ctx2.ind.rvol = 3.5;
ctx2.ind.patterns.doji = true;
ctx2.lastAgg = { d: 1, confidence: 85, gatesPass: true, gatesFail: false, bias: 'BULLISH', outliers: 5 };

const votes2 = agg.runAll(ctx2);
const res2 = agg.compile(ctx2, votes2, {});
console.log('\n--- STRONG BULLISH ---');
console.log('tally:', JSON.stringify(res2.tally));
console.log('params:', JSON.stringify(res2.params));
console.log('gates:', JSON.stringify(res2.gates));
console.log('conf:', res2.confidence, 'quality:', res2.quality, 'outliers:', res2.outliers);
console.log('lastAgg:', JSON.stringify(res2.lastAgg));
console.log('signal:', JSON.stringify(res2.signal, null, 1));
