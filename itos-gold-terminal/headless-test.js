const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    headless: true,
  });
  const page = await browser.newPage({ viewport: { width: 1600, height: 950 } });
  const errors = [];
  page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()); });

  await page.goto('http://localhost:8791/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(16000);

  const price = await page.$eval('#s-price', el => el.textContent);
  const chg = await page.$eval('#s-chgpct', el => el.textContent);
  const fund = await page.$eval('#s-fund', el => el.textContent);
  const oi = await page.$eval('#s-oi', el => el.textContent);
  const spread = await page.$eval('#s-spread', el => el.textContent);
  const mark = await page.$eval('#s-mark', el => el.textContent);
  const macroRows = await page.$$eval('#macro-body tr', rows => rows.map(r => r.innerText.replace(/\s+/g, ' ')));
  const sentiment = await page.$eval('#sentiment-box', el => el.innerText.replace(/\s+/g, ' ').slice(0, 120));
  const depthImb = await page.$eval('#ob-imb', el => el.textContent);

  // Click signal tab and capture report
  await page.click('.tabbtn[data-tab="signal"]');
  await page.click('#signal-btn');
  await page.waitForTimeout(1500);
  const signalText = await page.$eval('#signal-report', el => el.innerText);
  const signalHead = signalText.split('\n').slice(0, 30).join('\n');

  // Matrix
  await page.click('.tabbtn[data-tab="matrix"]');
  await page.waitForTimeout(500);
  const matrixText = await page.$eval('#matrix-report', el => el.innerText.replace(/\s+/g, ' ').slice(0, 900));

  // Structure
  await page.click('.tabbtn[data-tab="structure"]');
  await page.waitForTimeout(500);
  const structText = await page.$eval('#structure-report', el => el.innerText.replace(/\s+/g, ' ').slice(0, 600));

  console.log('=== HEADER ===');
  console.log('Price:', price, '| 24h:', chg, '| Mark/Index:', mark, '| Funding:', fund, '| OI:', oi, '| Spread:', spread);
  console.log('=== ORDERBOOK IMBALANCE ===');
  console.log(depthImb);
  console.log('=== MACRO ===');
  console.log(macroRows.join('\n'));
  console.log('=== SENTIMENT ===');
  console.log(sentiment);
  console.log('=== SIGNAL REPORT (head) ===');
  console.log(signalHead);
  console.log('=== MATRIX (excerpt) ===');
  console.log(matrixText);
  console.log('=== STRUCTURE (excerpt) ===');
  console.log(structText);
  console.log('=== JS ERRORS ===');
  console.log(errors.length ? errors.join('\n') : 'NONE');

  await page.screenshot({ path: 'C:/Users/vm587/Documents/Default Project/itos-gold-terminal/test-shot.png' });
  await browser.close();
})().catch(e => { console.error('FATAL', e.message); process.exit(1); });
