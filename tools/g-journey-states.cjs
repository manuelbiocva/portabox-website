/* Sanity checks the contrast audit cannot cover: that the quote panel is
   actually measurable when visible, plus the mobile and reduced-motion states. */
const { chromium } = require('playwright');
const path = require('path');
const { pathToFileURL } = require('url');
const URL = pathToFileURL(path.resolve('site/index.html')).href;

const ratio = (fg, bg) => {
  const lin = (x) => (x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4));
  const L = (c) => 0.2126 * lin(c[0] / 255) + 0.7152 * lin(c[1] / 255) + 0.0722 * lin(c[2] / 255);
  const a = L(fg), b = L(bg);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
};

(async () => {
  const br = await chromium.launch();

  // --- quote panel, forced visible, measured directly
  const p = await br.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(URL);
  await p.waitForTimeout(300);
  const q = await p.evaluate(() => {
    const el = document.getElementById('pj-quote');
    el.style.opacity = 1;
    const num = (s) => (s.match(/[\d.]+/g) || []).map(Number);
    const blend = (c, bg) => {
      const a = c.length > 3 ? c[3] : 1;
      return c.slice(0, 3).map((v, i) => Math.round(a * v + (1 - a) * bg[i]));
    };
    const bg = num(getComputedStyle(el).backgroundColor).slice(0, 3);
    const grab = (sel) => {
      const n = el.querySelector(sel);
      if (!n) return null;
      const cs = getComputedStyle(n);
      return { t: n.textContent.trim().slice(0, 22), c: blend(num(cs.color), bg), px: parseFloat(cs.fontSize), w: parseInt(cs.fontWeight) };
    };
    return { bg, rows: ['.g-label', 'h3', 'input', 'small', 'small a'].map(grab).filter(Boolean) };
  });
  console.log('QUOTE PANEL (visible), bg rgb(' + q.bg + '):');
  for (const r of q.rows) {
    const need = r.px >= 24 || (r.px >= 18.66 && r.w >= 700) ? 3 : 4.5;
    const v = ratio(r.c, q.bg);
    console.log(`  ${v.toFixed(2)} vs ${need}  ${v >= need ? 'PASS' : 'FAIL'}  ${r.px}px/${r.w}  "${r.t}"`);
  }
  // placeholder is its own colour
  const ph = await p.evaluate(() => {
    const el = document.getElementById('pj-quote');
    const num = (s) => (s.match(/[\d.]+/g) || []).map(Number);
    const cs = getComputedStyle(el.querySelector('input'), '::placeholder');
    return { c: num(cs.color), bg: num(getComputedStyle(el).backgroundColor).slice(0, 3) };
  });
  const phc = ph.c.slice(0, 3).map((v, i) => Math.round((ph.c[3] ?? 1) * v + (1 - (ph.c[3] ?? 1)) * ph.bg[i]));
  console.log(`  ${ratio(phc, ph.bg).toFixed(2)} vs 4.5  placeholder`);
  await p.close();

  // --- mobile
  const m = await br.newPage({ viewport: { width: 390, height: 844 } });
  await m.goto(URL);
  await m.waitForTimeout(400);
  const mob = await m.evaluate(() => {
    const pin = document.querySelector('.g-pj-pin');
    const stage = document.querySelector('.g-pj-stage');
    return {
      cols: getComputedStyle(pin).gridTemplateColumns,
      stageOrder: getComputedStyle(stage).order,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      trackVh: Math.round(document.getElementById('pj-journey').offsetHeight / window.innerHeight * 100),
    };
  });
  console.log('\nMOBILE 390px:', JSON.stringify(mob));
  await m.screenshot({ path: 'tools/journey-mobile.png' });
  await m.close();

  // --- reduced motion
  const r = await br.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const errs = [];
  r.on('pageerror', e => errs.push(e.message));
  await r.goto(URL);
  await r.waitForTimeout(500);
  const rm = await r.evaluate(() => ({
    pin: getComputedStyle(document.querySelector('.g-pj-pin')).position,
    trackH: document.getElementById('pj-journey').offsetHeight,
    quoteOpacity: getComputedStyle(document.getElementById('pj-quote')).opacity,
    boxes: [...document.querySelectorAll('#pj-items use')].filter(u => +u.style.opacity > 0).length,
    chip: document.getElementById('pj-chipStep').textContent,
  }));
  console.log('REDUCED MOTION:', JSON.stringify(rm), '| errors:', errs.length ? errs : 'none');
  await r.close();

  await br.close();
})();
