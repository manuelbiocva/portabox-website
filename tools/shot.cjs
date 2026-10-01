const { chromium } = require('playwright');
const OUT = process.argv[2];
(async () => {
  const b = await chromium.launch();
  const errs = [];

  // Desktop
  let p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  p.on('console', m => { if (m.type() === 'error') errs.push('DESKTOP console: ' + m.text()); });
  p.on('pageerror', e => errs.push('DESKTOP pageerror: ' + e.message));
  await p.goto('http://127.0.0.1:8899/', { waitUntil: 'networkidle' });
  await p.waitForTimeout(2200);
  await p.screenshot({ path: OUT + '/d-hero.png' });
  for (const [id, name] of [['problem','d-problem'],['earl','d-earl'],['how-it-works','d-how'],['sizes','d-sizes'],['proof','d-proof'],['regions','d-regions'],['final-cta','d-cta']]) {
    await p.evaluate(i => document.getElementById(i).scrollIntoView(), id);
    await p.waitForTimeout(1100);
    await p.screenshot({ path: `${OUT}/${name}.png` });
  }
  // horizontal overflow check
  const ovD = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

  // Mobile
  let m = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  m.on('pageerror', e => errs.push('MOBILE pageerror: ' + e.message));
  await m.goto('http://127.0.0.1:8899/', { waitUntil: 'networkidle' });
  await m.waitForTimeout(2200);
  await m.screenshot({ path: OUT + '/m-hero.png' });
  for (const [id, name] of [['problem','m-problem'],['earl','m-earl'],['sizes','m-sizes'],['proof','m-proof']]) {
    await m.evaluate(i => document.getElementById(i).scrollIntoView(), id);
    await m.waitForTimeout(1000);
    await m.screenshot({ path: `${OUT}/${name}.png` });
  }
  const ovM = await m.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

  console.log('desktop h-overflow px:', ovD);
  console.log('mobile  h-overflow px:', ovM);
  console.log(errs.length ? errs.join('\n') : 'no console/page errors');
  await b.close();
})();
