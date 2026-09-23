const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 1000 } });
  const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://127.0.0.1:8899/brand/styleguide.html', { waitUntil: 'networkidle' });
  await p.waitForTimeout(1500);
  await p.screenshot({ path: 'brand-audit/sg-top.png' });
  const ov = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  await p.evaluate(() => document.querySelectorAll('.sg-block')[4].scrollIntoView());
  await p.waitForTimeout(700);
  await p.screenshot({ path: 'brand-audit/sg-buttons.png' });
  await p.evaluate(() => document.querySelectorAll('.sg-block')[6].scrollIntoView());
  await p.waitForTimeout(700);
  await p.screenshot({ path: 'brand-audit/sg-logo.png' });
  console.log('h-overflow:', ov, '| errors:', errs.length ? errs.join(';') : 'none');
  await b.close();
})();
