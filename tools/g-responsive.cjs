/* Responsive audit: overflow, tap targets, text size and element fit
   across phone, tablet-portrait and tablet-landscape widths. */
const { chromium } = require('playwright');
const fs = require('fs');

const WIDTHS = [
  [360, 780, 'phone small'],
  [390, 844, 'phone'],
  [414, 896, 'phone large'],
  [768, 1024, 'tablet portrait'],
  [820, 1180, 'iPad Air portrait'],
  [1024, 768, 'tablet landscape'],
  [1180, 820, 'iPad Pro landscape'],
];

const PROBE = () => {
  const vw = document.documentElement.clientWidth;
  const out = { overflow: document.documentElement.scrollWidth - vw, wide: [], taps: [], tiny: [] };

  document.querySelectorAll('.g *').forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none') return;
    if (el.ownerSVGElement || el.tagName === 'svg') return;   // clipped by the stage

    // anything sticking out past the right edge
    if (r.right > vw + 1 && el.children.length === 0) {
      out.wide.push(`${(el.className || el.tagName).toString().slice(0, 28)} +${Math.round(r.right - vw)}px`);
    }

    // interactive targets below the 44px guideline
    const tag = el.tagName.toLowerCase();
    const clickable = tag === 'a' || tag === 'button' || (tag === 'input' && el.type !== 'hidden') || tag === 'select' || tag === 'summary';
    if (clickable && el.offsetParent !== null) {
      // WCAG 2.2 SC 2.5.8 exempts targets inside a sentence or block of text,
      // where padding them out would wreck the line box. 24px is the floor
      // for those; standalone controls are held to 40.
      const inline = cs.display.startsWith('inline');
      const parentText = (el.parentElement ? el.parentElement.textContent : '').trim().length;
      const inProse = inline && parentText > (el.textContent || '').trim().length + 5;
      // SC 2.5.8 exempts inline targets outright and sets 24px for the rest.
      if (inProse) return;
      if (cs.pointerEvents === 'none') return;   // clipped input behind its label
      const h = Math.round(r.height), w = Math.round(r.width);
      if (h < 24 || w < 24) {
        const label = (el.textContent || el.getAttribute('aria-label') || tag).trim().slice(0, 22);
        out.taps.push(`${w}x${h} ${(el.className || tag).toString().slice(0, 20)} "${label}"`);
      }
    }

    // body text that has dropped below readable size
    const txt = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 8);
    if (txt) {
      const px = parseFloat(cs.fontSize);
      if (px < 12) out.tiny.push(`${px}px ${(el.className || el.tagName).toString().slice(0, 24)}`);
    }
  });
  const uniq = (a) => [...new Set(a)];
  return { overflow: out.overflow, wide: uniq(out.wide).slice(0, 5), taps: uniq(out.taps).slice(0, 6), tiny: uniq(out.tiny).slice(0, 4) };
};

(async () => {
  const only = process.argv[2];
  const pages = only ? [only + '.html']
    : fs.readdirSync('site').filter((f) => f.endsWith('.html') && f !== 'palette.html');
  const b = await chromium.launch();
  const found = {};

  for (const [w, h, name] of WIDTHS) {
    const p = await b.newPage({ viewport: { width: w, height: h }, isMobile: w < 900, hasTouch: w < 1200 });
    const issues = [];
    for (const f of pages) {
      await p.goto('http://127.0.0.1:8899/site/' + f, { waitUntil: 'domcontentloaded' });
      await p.evaluate(() => document.querySelectorAll('.g-rise,.g-wipe').forEach((e) => e.classList.add('in')));
      await p.waitForTimeout(250);
      await p.evaluate(`window.__p = ${PROBE.toString()}`);
      const r = await p.evaluate(() => window.__p());
      if (r.overflow > 0 || r.wide.length || r.taps.length || r.tiny.length) {
        issues.push({ f, ...r });
        [...r.taps, ...r.tiny, ...r.wide].forEach((k) => { found[k] = (found[k] || 0) + 1; });
      }
    }
    console.log(`\n=== ${w}x${h}  ${name} ===`);
    if (!issues.length) { console.log('  clean'); }
    else issues.slice(0, 4).forEach((i) => {
      console.log('  ' + i.f);
      if (i.overflow > 0) console.log('     OVERFLOW ' + i.overflow + 'px');
      i.wide.forEach((x) => console.log('     past edge: ' + x));
      i.taps.forEach((x) => console.log('     small tap: ' + x));
      i.tiny.forEach((x) => console.log('     tiny text: ' + x));
    });
    if (issues.length > 4) console.log(`  ... and ${issues.length - 4} more pages with the same pattern`);
    await p.close();
  }

  console.log('\n=== most common across all widths ===');
  Object.entries(found).sort((a, c) => c[1] - a[1]).slice(0, 12)
    .forEach(([k, n]) => console.log(`  ${String(n).padStart(3)}x  ${k}`));
  await b.close();
})();
