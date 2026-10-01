const { chromium } = require('playwright');
const lin = x => x <= 0.03928 ? x/12.92 : Math.pow((x+0.055)/1.055, 2.4);
const L = c => 0.2126*lin(c[0]/255) + 0.7152*lin(c[1]/255) + 0.0722*lin(c[2]/255);
const ratio = (a,b) => { const x=L(a), y=L(b); return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05); };
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto('http://127.0.0.1:8899/pricing/', { waitUntil: 'networkidle' });
  await p.evaluate(() => document.querySelectorAll('.g-mega').forEach(m => { m.hidden = false; m.classList.add('is-open'); }));
  await p.waitForTimeout(300);
  const rows = await p.evaluate(() => {
    const n = s => (s.match(/[\d.]+/g)||[]).map(Number);
    const solid = el => { let x = el; while (x && x !== document.documentElement) {
      const m = n(getComputedStyle(x).backgroundColor);
      if (m && (m.length < 4 || m[3] > 0.85)) return m.slice(0,3); x = x.parentElement; } return [255,255,255]; };
    const out = [];
    document.querySelectorAll('.g-mega *').forEach(el => {
      if (el.ownerSVGElement || el.tagName === 'svg') return;
      if (![...el.childNodes].some(t => t.nodeType === 3 && t.textContent.trim().length > 1)) return;
      const cs = getComputedStyle(el), col = n(cs.color); if (!col) return;
      const bg = solid(el), a = col.length > 3 ? col[3] : 1;
      out.push({ t: el.textContent.trim().slice(0,26), fg: col.slice(0,3).map((v,i)=>Math.round(a*v+(1-a)*bg[i])),
                 bg, px: parseFloat(cs.fontSize), w: parseInt(cs.fontWeight)||400, cls: (el.className||el.tagName).toString().slice(0,18) });
    });
    return out;
  });
  let fails = 0;
  for (const r of rows) {
    const need = r.px >= 24 || (r.px >= 18.66 && r.w >= 700) ? 3 : 4.5;
    const v = ratio(r.fg, r.bg);
    if (v < need) { console.log(`FAIL ${v.toFixed(2)}<${need}  ${r.px}px/${r.w}  ${r.cls}  "${r.t}"`); fails++; }
  }
  console.log(fails ? fails + ' failures' : `PASS — ${rows.length} text nodes in the panels clear AA`);
  await b.close();
})();
