/* Exercise the mega menu: hover, click, keyboard, focus-out, geometry. */
const { chromium } = require('playwright');

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('http://127.0.0.1:8899/pricing/', { waitUntil: 'networkidle' });
  await p.waitForTimeout(300);

  const state = () => p.evaluate(() => {
    const open = [...document.querySelectorAll('.g-mega')].filter((m) => !m.hidden && m.classList.contains('is-open'));
    const exp = [...document.querySelectorAll('.g-menu-t')].map((t) => t.getAttribute('aria-expanded'));
    const m = open[0];
    const r = m ? m.getBoundingClientRect() : null;
    const nav = document.querySelector('.g-nav').getBoundingClientRect();
    return {
      openCount: open.length, expanded: exp.join(','),
      geo: r ? { top: Math.round(r.top), left: Math.round(r.left), w: Math.round(r.width), h: Math.round(r.height) } : null,
      navBottom: Math.round(nav.bottom),
      links: m ? m.querySelectorAll('.g-mega-l').length : 0,
    };
  });

  console.log('groups:', await p.locator('.g-mi').count(), '| triggers:', await p.locator('.g-menu-t').count());
  console.log('at rest     ', JSON.stringify(await state()));

  // hover Storage
  await p.locator('.g-menu-t', { hasText: 'Storage' }).hover();
  await p.waitForTimeout(500);
  const s1 = await state();
  console.log('hover storage', JSON.stringify(s1));
  console.log('  flush under nav?', s1.geo && s1.geo.top === s1.navBottom ? 'yes' : 'NO (' + (s1.geo && s1.geo.top) + ' vs ' + s1.navBottom + ')');
  console.log('  full width?    ', s1.geo && s1.geo.left === 0 && s1.geo.w === 1440 ? 'yes' : 'NO');

  // move to Moving — only one open
  await p.locator('.g-menu-t', { hasText: 'Moving' }).hover();
  await p.waitForTimeout(500);
  console.log('hover moving ', JSON.stringify(await state()));

  // move away
  await p.mouse.move(700, 700);
  await p.waitForTimeout(800);
  console.log('mouse away  ', JSON.stringify(await state()));

  // keyboard: focus trigger, Enter to open, Escape to close
  await p.locator('.g-menu-t', { hasText: 'Locations' }).focus();
  await p.keyboard.press('Enter');
  await p.waitForTimeout(400);
  console.log('kbd enter   ', JSON.stringify(await state()));
  await p.keyboard.press('Escape');
  await p.waitForTimeout(400);
  const afterEsc = await state();
  const focused = await p.evaluate(() => document.activeElement.textContent.trim().slice(0, 20));
  console.log('kbd escape  ', JSON.stringify(afterEsc), '| focus returned to:', JSON.stringify(focused));

  // panel links are real and reachable
  await p.locator('.g-menu-t', { hasText: 'Storage' }).click();
  await p.waitForTimeout(400);
  const hrefs = await p.evaluate(() => [...document.querySelectorAll('.g-mega:not([hidden]) a')].map((a) => a.getAttribute('href')));
  console.log('storage panel links:', hrefs.join(', '));

  console.log('page errors:', errs.length ? errs : 'none');
  await b.close();
})();
