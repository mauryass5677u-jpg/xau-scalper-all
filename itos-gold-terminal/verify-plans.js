const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true });
  const page = await browser.newPage({ viewport: { width: 1700, height: 1000 } });
  const errors = [];
  page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
  await page.goto('http://localhost:8791/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(14000);

  // 1) WebSocket check: wait for price to move via WS OR confirm ws-dot live
  const wsLive = await page.$eval('#ws-dot', el => el.className);
  const priceNow = await page.$eval('#s-price', el => el.textContent);
  await page.waitForTimeout(4000);
  const priceLater = await page.$eval('#s-price', el => el.textContent);
  console.log('WS dot:', wsLive, '| price t0:', priceNow, '| price t0+4s:', priceLater);

  // 2) Force-build plans for both directions to verify the math
  const planL = await page.evaluate(() => {
    S.tf='5m'; S.plan=null;
    const p = buildPlan('LONG');
    return { entry:p.entry, entryName:p.entryName, sl:p.sl, risk:p.risk, tp1:p.tp1, tp2:p.tp2, tp3:p.tp3, danger:p.danger, sizeOz:p.sizeOz, lev:p.lev, evPct:p.evPct, pWin:p.pWin, slMethod:p.slMethod };
  });
  const planS = await page.evaluate(() => {
    const p = buildPlan('SHORT');
    return { entry:p.entry, entryName:p.entryName, sl:p.sl, risk:p.risk, tp1:p.tp1, tp2:p.tp2, tp3:p.tp3, danger:p.danger, sizeOz:p.sizeOz, lev:p.lev, evPct:p.evPct, pWin:p.pWin, slMethod:p.slMethod };
  });
  console.log('=== FORCED LONG PLAN (5m) ===');
  console.log(JSON.stringify(planL, null, 1));
  console.log('=== FORCED SHORT PLAN (5m) ===');
  console.log(JSON.stringify(planS, null, 1));

  // 3) Verify RR math: (TP1-entry)/risk == 1.5
  const r1 = ((planL.tp1-planL.entry)/planL.risk);
  const r2 = ((planL.tp2-planL.entry)/planL.risk);
  const r3 = ((planL.tp3-planL.entry)/planL.risk);
  console.log('LONG RR check 1.5/2.5/4.0 =>', r1.toFixed(2), r2.toFixed(2), r3.toFixed(2));
  const s1 = ((planS.entry-planS.tp1)/planS.risk);
  const s2 = ((planS.entry-planS.tp2)/planS.risk);
  console.log('SHORT RR check 1.5/2.5 =>', s1.toFixed(2), s2.toFixed(2));

  // 4) switch timeframe to 1m and check chart renders
  await page.click('.tfbtn[data-tf="1m"]');
  await page.waitForTimeout(1200);
  const legend = await page.$eval('#chart-legend', el => el.textContent.slice(0, 120));
  console.log('1m legend:', legend);
  await page.screenshot({ path: 'C:/Users/vm587/Documents/Default Project/itos-gold-terminal/test-shot-2.png' });

  console.log('=== JS ERRORS ===');
  console.log(errors.length ? errors.join('\n') : 'NONE');
  await browser.close();
})().catch(e => { console.error('FATAL', e.message); process.exit(1); });
