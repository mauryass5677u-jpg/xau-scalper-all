'use strict';
const indLib = require('./indicators.js');
const fetcher = require('./fetcher.js');
const agg = require('./aggregator.js');

(async () => {
  const t0 = Date.now();
  const [k, b, m, s] = await Promise.allSettled([
    fetcher.fetchAllKlines('XAUUSDT'),
    fetcher.fetchBinance('XAUUSDT'),
    fetcher.fetchMacro(),
    fetcher.fetchSpotGold()
  ]);
  console.log('klines:', k.status, Object.keys(k.status === 'fulfilled' ? k.value : {}));
  console.log('binance:', b.status, 'macro:', m.status, 'spot:', s.status, 'in', Date.now() - t0, 'ms');

  const allK = k.status === 'fulfilled' ? k.value : {};
  const bin = b.status === 'fulfilled' ? b.value : null;
  const macro = m.status === 'fulfilled' ? m.value : m.reason ? null : null;
  const spot = s.status === 'fulfilled' ? s.value : null;

  const inds = {}, prevInds = {};
  for (const tf of fetcher.TFS) {
    const raw = allK[tf];
    if (!raw || raw.length < 80) { console.log('SKIP tf', tf); continue; }
    const cs = indLib.prepCandles(raw);
    const full = indLib.computeIndicators(cs);
    if (full) inds[tf] = full.cur;
    const prev = indLib.computeIndicators(cs.slice(0, -1));
    if (prev) prevInds[tf] = prev.cur;
  }
  console.log('computed inds for', Object.keys(inds).join(','));

  const depthHist = bin && bin.depth ? [fetcher.depthMetrics(bin.depth)] : null;
  const trades = bin && bin.aggTrades ? fetcher.aggregateTradesMetrics(bin.aggTrades) : null;

  const tf = '15m';
  const ctx = agg.buildContext({ tf, allK, inds, prevInds, funds: bin, depth: depthHist, trades, macro, spot });
  console.log('ctx.ind.price', ctx.price, 'funds.oiChange', ctx.funds.oiChange, 'globalLS', ctx.funds.globalLS);
  console.log('depth', ctx.depth && ctx.depth.imbalance.toFixed(1));
  console.log('trades ratio', trades && trades.ratio);

  const votes = agg.runAgents(ctx);
  const long = votes.filter((v) => v.d === 1).length;
  const short = votes.filter((v) => v.d === -1).length;
  const neutral = votes.filter((v) => v.d === 0).length;
  console.log(`VOTES: LONG ${long} SHORT ${short} NEUTRAL ${neutral}`);

  const signal = agg.buildSignal(ctx, votes);
  console.log('SIGNAL:', signal.direction, 'conf', signal.confPct + '%', 'entry', signal.entry, 'sl', signal.sl, 'tp1', signal.tp1, 'tp2', signal.tp2, 'tp3', signal.tp3);
  console.log('entry votes', signal.entryVotes, 'sl votes', signal.slVotes, 'rr', signal.rr1.toFixed(1));
  console.log('leverage', signal.leverage, 'sizeOz', signal.sizeOz, 'EV', signal.evPct.toFixed(3) + '%');
  console.log('TCS', signal.tcs, 'bias', signal.bias, 'confluence', signal.confluence.toFixed(3));
  console.log('top agents:', signal.topAgents.map((a) => '#' + a.id + ' ' + a.name + ' ' + a.conf + '%'));

  const gates = agg.checkGates(ctx, signal, ctx.depth, Date.now() - t0);
  console.log('gates:', JSON.stringify(gates.gates));
  console.log('layers', JSON.stringify({ L1: signal.L1, L2: signal.L2, L3: signal.L3, L4: signal.L4, L5: signal.L5 }));
})().catch((e) => { console.error('FAIL', e); process.exit(1); });
