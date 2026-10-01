/* Drive the TAXIBOX booking flow by name and record the numbered step list it
   exposes, so the Portabox quote can be compared against it step for step. */
const { chromium } = require('playwright');

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 1000 } });
  await p.goto('https://www.taxibox.com.au/booking/', { waitUntil: 'networkidle', timeout: 90000 });
  await p.waitForTimeout(2500);

  const state = async (label) => {
    const s = await p.evaluate(() => {
      const main = document.querySelector('main') || document.body;
      const lines = main.innerText.split('\n').map((x) => x.trim()).filter(Boolean);
      // the flow lists its own steps, numbered
      const steps = lines.filter((l) => /^\d+\.\s/.test(l));
      const cards = [...document.querySelectorAll('button,[role=button]')]
        .filter((e) => e.offsetParent !== null)
        .map((e) => e.innerText.trim().split('\n')[0])
        .filter((t) => t && !/1300/.test(t));
      return {
        h: (document.querySelector('h1,h2,h3') || {}).innerText || '',
        prompt: lines.find((l) => /\?$/.test(l) && l.length > 12) || '',
        steps, cards: [...new Set(cards)],
        inputs: [...document.querySelectorAll('input,select')]
          .filter((e) => e.type !== 'hidden' && e.offsetParent !== null)
          .map((e) => (e.placeholder || e.name || e.type)),
      };
    });
    console.log('\n--- ' + label + ' ---');
    console.log('heading:', s.h, s.prompt ? '| ' + s.prompt : '');
    if (s.inputs.length) console.log('inputs :', s.inputs.join(', '));
    console.log('options:', s.cards.join(' / '));
    if (s.steps.length) console.log('steps  :', s.steps.join('  '));
    return s;
  };

  const go = async (name) => {
    const el = p.getByText(name, { exact: false }).first();
    await el.click({ timeout: 8000 }).catch(() => {});
    await p.waitForTimeout(2200);
  };

  // the field is an autocomplete: a suburb has to be chosen from the list
  await p.locator('input').first().click();
  await p.locator('input').first().type('3000', { delay: 120 });
  await p.waitForTimeout(2000);
  const sug = p.locator('li, [role=option]').first();
  if (await sug.count().catch(() => 0)) { await sug.click().catch(() => {}); }
  await p.waitForTimeout(1200);
  await p.getByRole('button', { name: /continue/i }).click().catch(() => {});
  await p.waitForTimeout(2800);
  await state('1. postcode entered');

  // pick the service, then the storage location
  await p.locator('button:has-text("Select")').first().click().catch(() => {});
  await p.waitForTimeout(2500);
  await state('2. Mobile Storage chosen');

  await go('Store at your place');
  await state('3. storage location chosen');

  for (let i = 4; i <= 8; i++) {
    const before = p.url() + (await p.evaluate(() => (document.querySelector('h1,h2,h3') || {}).innerText || ''));
    // take the first non-navigation option on the screen
    const clicked = await p.evaluate(() => {
      const skip = /previous|back|continue|next|1300|change|edit/i;
      const c = [...document.querySelectorAll('button,[role=button]')]
        .filter((e) => e.offsetParent !== null && e.innerText.trim() && !skip.test(e.innerText));
      if (!c.length) return null;
      const t = c[0].innerText.trim().split(String.fromCharCode(10))[0];
      c[0].click();
      return t;
    });
    await p.waitForTimeout(1500);
    await p.getByRole('button', { name: /^continue$|^next$/i }).click().catch(() => {});
    await p.waitForTimeout(2200);
    const after = p.url() + (await p.evaluate(() => (document.querySelector('h1,h2,h3') || {}).innerText || ''));
    const s = await state(`${i}. ${clicked ? 'picked "' + clicked + '"' : 'no option'}`);
    if (!clicked || before === after) break;
  }

  await p.screenshot({ path: 'tools/tb-flow.png', fullPage: false });
  await b.close();
})();
