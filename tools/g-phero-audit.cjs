/* Hero text sits over a photograph, so contrast is sampled from rendered
   pixels behind each line rather than from a CSS background colour. */
const { chromium } = require('playwright');
const fs = require('fs');
const { PNG } = (() => { try { return { PNG: require('pngjs').PNG }; } catch { return {}; } })();

const lin = (x) => (x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4));
const L = (c) => 0.2126 * lin(c[0] / 255) + 0.7152 * lin(c[1] / 255) + 0.0722 * lin(c[2] / 255);
const ratio = (a, b) => { const x = L(a), y = L(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };

(async () => {
  const { pageUrls, BASE } = require('./pages.cjs');
  const pages = pageUrls().filter((u) => u !== '/');
  const b = await chromium.launch();
  let worst = { r: 99 };
  for (const f of pages) {
    const p = await b.newPage({ viewport: { width: 1440, height: 950 } });
    await p.goto(BASE + f, { waitUntil: 'networkidle' });
    await p.evaluate(() => document.querySelectorAll('.g-rise').forEach((e) => e.classList.add('in')));
    await p.waitForTimeout(400);
    // hide the text, photograph the scrim underneath, then read its pixels
    const targets = await p.evaluate(() => {
      const out = [];
      document.querySelectorAll('.g-phero .g-display, .g-phero .g-phero-sub, .g-phero .g-crumb a, .g-phero .g-crumb span[aria-current], .g-phero .g-btn > span').forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.width < 4 || r.height < 4) return;
        const cs = getComputedStyle(el);
        const m = (cs.color.match(/[\d.]+/g) || []).map(Number);
        var btn = el.closest('.g-btn');
        var fill = btn ? (getComputedStyle(btn).backgroundColor.match(/[\d.]+/g) || []).map(Number) : null;
        out.push({ fill: fill && (fill.length < 4 || fill[3] > 0.85) ? fill.slice(0, 3) : null,
                   sel: el.className || (btn ? 'btn:' + btn.className : el.tagName), x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2),
                   col: m.slice(0, 3), a: m.length > 3 ? m[3] : 1, px: parseFloat(cs.fontSize), w: parseInt(cs.fontWeight) });
      });
      document.querySelectorAll('.g-phero-in').forEach((e) => (e.style.visibility = 'hidden'));
      return out;
    });
    const buf = await p.screenshot({ clip: { x: 0, y: 0, width: 1440, height: 950 } });
    const png = PNG.sync.read(buf);
    for (const t of targets) {
      const i = (png.width * t.y + t.x) * 4;
      const bg = t.fill || [png.data[i], png.data[i + 1], png.data[i + 2]];
      const fg = t.col.map((v, k) => Math.round(t.a * v + (1 - t.a) * bg[k]));
      const need = t.px >= 24 || (t.px >= 18.66 && t.w >= 700) ? 3 : 4.5;
      const r = ratio(fg, bg);
      if (r < need) console.log(`FAIL ${f} ${t.sel} ${r.toFixed(2)}<${need}`);
      if (r / need < worst.r / (worst.need || 1)) worst = { f, sel: t.sel, r, need };
    }
    await p.close();
  }
  console.log(`tightest margin: ${worst.f} ${worst.sel} ${worst.r.toFixed(2)} vs ${worst.need} needed`);
  await b.close();
})();
