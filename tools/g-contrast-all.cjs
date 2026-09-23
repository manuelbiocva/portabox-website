/* Opacity-aware contrast audit across every generated page.
   Skips SVG (painted with fill, not color) and text that is currently
   invisible; the hero is checked separately against its own scrim. */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const AUDIT = () => {
  const L = (c) => { const f = (x) => (x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4));
    return 0.2126 * f(c[0] / 255) + 0.7152 * f(c[1] / 255) + 0.0722 * f(c[2] / 255); };
  const n = (s) => { const m = s.match(/[\d.]+/g); return m ? m.map(Number) : null; };
  const op = (el) => { let o = 1, x = el; while (x && x !== document.body) { o *= parseFloat(getComputedStyle(x).opacity || 1); x = x.parentElement; } return o; };
  const solid = (el) => { let x = el; while (x && x !== document.documentElement) {
      const m = n(getComputedStyle(x).backgroundColor);
      if (m && (m.length < 4 || m[3] > 0.85)) return m.slice(0, 3); x = x.parentElement; } return [255, 255, 255]; };
  const mix = (f, a, g) => f.map((v, i) => Math.round(a * v + (1 - a) * g[i]));
  const out = [];
  document.querySelectorAll('.g *').forEach((el) => {
    if (el.closest('.g-hero') || el.closest('.g-phero') || el.closest('.g-nav') || el.closest('.g-card-img')) return;
    if (el.ownerSVGElement || el.tagName === 'svg') return;
    if (op(el) < 0.05) return;
    const r = el.getBoundingClientRect(); if (r.width < 3 || r.height < 3) return;
    if (![...el.childNodes].some((t) => t.nodeType === 3 && t.textContent.trim().length > 1)) return;
    const cs = getComputedStyle(el); if (cs.visibility === 'hidden') return;
    const col = n(cs.color); if (!col) return;
    const bg = solid(el);
    const a = (col.length > 3 ? col[3] : 1) * op(el);
    const t = mix(col.slice(0, 3), a, bg);
    const l1 = Math.max(L(t), L(bg)), l2 = Math.min(L(t), L(bg));
    const ra = (l1 + 0.05) / (l2 + 0.05);
    const px = parseFloat(cs.fontSize), wt = parseInt(cs.fontWeight) || 400;
    const need = px >= 24 || (px >= 18.66 && wt >= 700) ? 3 : 4.5;
    if (ra < need) out.push(`${(el.className || el.tagName).toString().slice(0, 30)} "${el.textContent.trim().slice(0, 24)}" ${ra.toFixed(2)}<${need} ${px}px/${wt}`);
  });
  return [...new Set(out)];
};

(async () => {
  const pages = fs.readdirSync('site').filter((f) => f.endsWith('.html') && f !== 'palette.html');
  const b = await chromium.launch();
  let bad = 0;
  for (const f of pages) {
    const p = await b.newPage({ viewport: { width: 1440, height: 950 } });
    const errs = [];
    p.on('pageerror', (e) => errs.push(e.message));
    await p.goto('http://127.0.0.1:8899/site/' + f, { waitUntil: 'domcontentloaded' });
    await p.waitForTimeout(500);
    await p.addStyleTag({ content: '*{transition:none!important;animation:none!important}' });
    await p.evaluate(() => {
      document.querySelectorAll('.g-rise,.g-wipe').forEach((e) => e.classList.add('in'));
      document.querySelectorAll('details').forEach((d) => (d.open = true));
    });
    await p.waitForTimeout(250);
    await p.evaluate(`window.__a = ${AUDIT.toString()}`);
    const res = await p.evaluate(() => window.__a());
    if (res.length || errs.length) {
      bad++;
      console.log('\n' + f);
      res.slice(0, 6).forEach((r) => console.log('   ' + r));
      errs.forEach((e) => console.log('   JS ERROR: ' + e));
    }
    await p.close();
  }
  console.log(bad ? `\n${bad} of ${pages.length} pages have findings` : `PASS — ${pages.length} pages clear AA`);
  await b.close();
})();
