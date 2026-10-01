/* WCAG 1.4.11: the boundary of a form control has to reach 3:1 against what
   it sits on. That is a separate rule from text contrast, which is why
   g-contrast-all.cjs passed the whole site while every input was outlined in
   a 1.38:1 hairline.

   This walks the real inputs, selects, textareas and the quote's choice
   boxes on every page and measures each border against the background
   actually painted behind it.

     node tools/g-control-contrast.cjs
*/
const { chromium } = require('playwright');
const { pageUrls, BASE } = require('./pages.cjs');

const MIN = 3.0;

const probe = () => {
  const lum = (rgb) => {
    const c = rgb.map((v) => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  };
  const parse = (s) => {
    const m = String(s).match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const p = m[1].split(/[,/]/).map((x) => parseFloat(x));
    return { rgb: [p[0], p[1], p[2]], a: p.length > 3 ? p[3] : 1 };
  };
  const over = (fg, bg) => fg.rgb.map((v, i) => v * fg.a + bg[i] * (1 - fg.a));
  /* The painted background behind an element is the first opaque one up the
     tree — a transparent card shows whatever its band is filled with. */
  const groundOf = (el) => {
    let n = el, stack = [];
    while (n && n !== document.documentElement) {
      const c = parse(getComputedStyle(n).backgroundColor);
      if (c && c.a > 0) { stack.push(c); if (c.a === 1) break; }
      n = n.parentElement;
    }
    let base = [255, 255, 255];
    for (let i = stack.length - 1; i >= 0; i--) base = over(stack[i], base);
    return base;
  };
  const ratio = (a, b) => {
    const x = lum(a), y = lum(b);
    return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
  };

  const out = [];
  const sel = 'input:not([type=hidden]):not([type=radio]):not([type=checkbox]), select, textarea, .g-qf-opt-box';
  document.querySelectorAll(sel).forEach((el) => {
    const s = getComputedStyle(el);
    if (s.visibility === 'hidden' || s.display === 'none') return;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return;          // clipped, not shown
    if (parseFloat(s.borderTopWidth) === 0) return;   // nothing to measure
    const border = parse(s.borderTopColor);
    if (!border || border.a === 0) return;
    const ground = groundOf(el.parentElement || el);
    const painted = over(border, ground);
    out.push({
      what: el.className || el.tagName.toLowerCase(),
      id: el.id || '',
      ratio: Math.round(ratio(painted, ground) * 100) / 100,
    });
  });
  return out;
};

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 1000 } });
  const bad = [];
  let checked = 0;

  for (const url of pageUrls()) {
    await p.goto(BASE + url, { waitUntil: 'networkidle' });
    /* The quote's later steps are hidden until you reach them, so reveal the
       panels rather than walking the flow five times. */
    await p.evaluate(() => {
      document.querySelectorAll('[data-qf-panel]').forEach((x) => { x.hidden = false; });
      document.querySelectorAll('details').forEach((d) => { d.open = true; });
      document.querySelectorAll('[data-qf-sub]').forEach((x) => { x.hidden = false; });
    });
    const rows = await p.evaluate(probe);
    checked += rows.length;
    rows.filter((r) => r.ratio < MIN).forEach((r) => bad.push({ url, ...r }));
  }

  await b.close();

  if (bad.length) {
    const seen = new Set();
    bad.forEach((r) => {
      const k = r.what + r.ratio;
      if (seen.has(k)) return;
      seen.add(k);
      console.log(`  ${r.ratio}:1  ${r.what}${r.id ? ' #' + r.id : ''}   ${r.url}`);
    });
    console.log(`\nFAIL — ${bad.length} control borders below ${MIN}:1 (of ${checked} checked)`);
    process.exitCode = 1;
  } else {
    console.log(`PASS — ${checked} control borders all clear ${MIN}:1 (WCAG 1.4.11)`);
  }
})();
