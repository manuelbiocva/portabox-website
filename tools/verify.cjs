const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const errs = [];
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  p.on('pageerror', e => errs.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type()==='error') errs.push('console: ' + m.text()); });
  await p.goto('http://127.0.0.1:8899/', { waitUntil: 'networkidle' });
  await p.waitForTimeout(1800);

  // 1. Size interaction
  await p.evaluate(() => document.getElementById('sizes').scrollIntoView());
  await p.waitForTimeout(900);
  await p.click('.size-row[data-size="small"]');
  await p.waitForTimeout(900);
  const small = await p.evaluate(() => ({
    perm3: document.getElementById('readout-perm3').textContent,
    vol: document.getElementById('readout-volume').textContent,
    rate: document.getElementById('readout-rate').textContent,
    label: document.querySelector('#size-drawing svg').getAttribute('aria-label').slice(0,62)
  }));
  await p.screenshot({ path: '.impeccable/shots3/v-size-small.png' });

  // 2. Quote form: error then success
  await p.evaluate(() => document.getElementById('final-cta').scrollIntoView());
  await p.waitForTimeout(600);
  await p.fill('#pc-foot', '12'); await p.click('#final-cta .qf-submit'); await p.waitForTimeout(400);
  await p.screenshot({ path: '.impeccable/shots3/v-form-error.png' });
  await p.fill('#pc-foot', '3121'); await p.click('#final-cta .qf-submit'); await p.waitForTimeout(1400);
  await p.screenshot({ path: '.impeccable/shots3/v-form-ok.png' });

  // 3. EARL scrub at full progress
  await p.evaluate(() => { const t=document.getElementById('earl-track'); window.scrollTo(0, t.offsetTop + t.offsetHeight - window.innerHeight - 20); });
  await p.waitForTimeout(900);
  await p.screenshot({ path: '.impeccable/shots3/v-earl-end.png' });

  // 4. Keyboard focus visibility
  await p.evaluate(() => window.scrollTo(0,0)); await p.waitForTimeout(400);
  await p.keyboard.press('Tab'); await p.waitForTimeout(250);
  await p.screenshot({ path: '.impeccable/shots3/v-focus.png' });

  // 5. Reduced motion
  const rp = await b.newPage({ viewport:{width:1440,height:900} });
  await rp.emulateMedia({ reducedMotion: 'reduce' });
  await rp.goto('http://127.0.0.1:8899/', { waitUntil:'networkidle' });
  await rp.waitForTimeout(1200);
  const rm = await rp.evaluate(() => {
    const items = document.querySelectorAll('#hero-drawing .load-item');
    const path = document.querySelector('#hero-drawing .draw-path');
    return { loadVisible: items.length ? getComputedStyle(items[0]).opacity : 'none',
             dashoffset: path ? getComputedStyle(path).strokeDashoffset : 'none' };
  });
  await rp.screenshot({ path: '.impeccable/shots3/v-reduced.png' });

  console.log('SMALL selected ->', JSON.stringify(small));
  console.log('reduced-motion ->', JSON.stringify(rm));
  console.log(errs.length ? errs.join('\n') : 'no errors');
  await b.close();
})();
