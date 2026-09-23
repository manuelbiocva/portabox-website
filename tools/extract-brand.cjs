const { chromium } = require('playwright');
const fs = require('fs');

const URLS = [
  ['live',    'https://portabox.au/'],
  ['netlify', 'https://portabox.netlify.app/'],
];

(async () => {
  const b = await chromium.launch();
  const out = {};

  for (const [key, url] of URLS) {
    const p = await b.newPage({ viewport: { width: 1440, height: 1000 } });
    try {
      await p.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
      await p.waitForTimeout(2500);

      const data = await p.evaluate(() => {
        const norm = c => {
          if (!c || c === 'rgba(0, 0, 0, 0)' || c === 'transparent') return null;
          const m = c.match(/\d+/g); if (!m) return c;
          const [r,g,bl,a] = m.map(Number);
          if (a !== undefined && a < 1) return c;
          return '#' + [r,g,bl].map(v => v.toString(16).padStart(2,'0')).join('');
        };

        // CSS custom properties declared on :root
        const vars = {};
        for (const sheet of Array.from(document.styleSheets)) {
          let rules; try { rules = sheet.cssRules; } catch(e) { continue; }
          for (const r of Array.from(rules || [])) {
            if (r.style && r.selectorText && /:root|^html$|^body$/.test(r.selectorText)) {
              for (const prop of Array.from(r.style)) {
                if (prop.startsWith('--')) vars[prop] = r.style.getPropertyValue(prop).trim();
              }
            }
          }
        }

        // Frequency of colors + fonts across visible elements
        const colorFreq = {}, bgFreq = {}, fontFreq = {}, sizeFreq = {}, radiusFreq = {}, shadowFreq = {};
        const els = document.querySelectorAll('body *');
        for (const el of els) {
          const r = el.getBoundingClientRect();
          if (r.width < 2 || r.height < 2) continue;
          const cs = getComputedStyle(el);
          const c = norm(cs.color), bg = norm(cs.backgroundColor);
          if (c) colorFreq[c] = (colorFreq[c]||0)+1;
          if (bg) bgFreq[bg] = (bgFreq[bg]||0)+1;
          if (cs.fontFamily) fontFreq[cs.fontFamily] = (fontFreq[cs.fontFamily]||0)+1;
          if (el.textContent && el.textContent.trim().length > 1)
            sizeFreq[cs.fontSize + '|' + cs.fontWeight] = (sizeFreq[cs.fontSize+'|'+cs.fontWeight]||0)+1;
          if (cs.borderRadius && cs.borderRadius !== '0px') radiusFreq[cs.borderRadius]=(radiusFreq[cs.borderRadius]||0)+1;
          if (cs.boxShadow && cs.boxShadow !== 'none') shadowFreq[cs.boxShadow]=(shadowFreq[cs.boxShadow]||0)+1;
        }
        const top = (o,n=14) => Object.entries(o).sort((a,b)=>b[1]-a[1]).slice(0,n);

        // Headings + their treatment
        const heads = Array.from(document.querySelectorAll('h1,h2,h3')).slice(0,10).map(h => ({
          tag: h.tagName, text: h.textContent.trim().slice(0,70),
          font: getComputedStyle(h).fontFamily.split(',')[0],
          size: getComputedStyle(h).fontSize, weight: getComputedStyle(h).fontWeight,
          tracking: getComputedStyle(h).letterSpacing, lh: getComputedStyle(h).lineHeight,
          transform: getComputedStyle(h).textTransform, color: norm(getComputedStyle(h).color)
        }));

        // Buttons / CTAs
        const btns = Array.from(document.querySelectorAll('a,button')).filter(e=>{
          const r=e.getBoundingClientRect(); return r.height>26 && r.width>56;
        }).slice(0,14).map(e => {
          const cs = getComputedStyle(e);
          return { text: e.textContent.trim().slice(0,32), bg: norm(cs.backgroundColor),
                   color: norm(cs.color), radius: cs.borderRadius, border: cs.border,
                   pad: cs.padding, font: cs.fontFamily.split(',')[0], weight: cs.fontWeight,
                   size: cs.fontSize, transform: cs.textTransform };
        });

        // Logos / imagery
        const imgs = Array.from(document.querySelectorAll('img')).slice(0,25).map(i => ({
          src: i.currentSrc || i.src, alt: i.alt, w: i.naturalWidth, h: i.naturalHeight
        }));

        return {
          title: document.title,
          vars,
          colors: top(colorFreq), backgrounds: top(bgFreq),
          fonts: top(fontFreq, 8), sizes: top(sizeFreq, 18),
          radii: top(radiusFreq, 8), shadows: top(shadowFreq, 6),
          heads, btns, imgs,
          bodyBg: norm(getComputedStyle(document.body).backgroundColor),
          bodyColor: norm(getComputedStyle(document.body).color),
          bodyFont: getComputedStyle(document.body).fontFamily
        };
      });

      out[key] = { url, ok: true, ...data };
      await p.screenshot({ path: `brand-audit/${key}-top.png` });
      await p.evaluate(()=>window.scrollTo(0, 1600)); await p.waitForTimeout(1200);
      await p.screenshot({ path: `brand-audit/${key}-mid.png` });
    } catch (e) {
      out[key] = { url, ok: false, error: e.message };
    }
    await p.close();
  }

  fs.writeFileSync('brand-audit/raw.json', JSON.stringify(out, null, 2));
  for (const k of Object.keys(out)) {
    const d = out[k];
    console.log('\n===== ' + k + ' ' + d.url + ' =====');
    if (!d.ok) { console.log('FAILED: ' + d.error); continue; }
    console.log('title:', d.title);
    console.log('body:', d.bodyBg, d.bodyColor, '|', (d.bodyFont||'').slice(0,60));
    console.log('--- css vars ---'); 
    const ve = Object.entries(d.vars).filter(([k,v])=>/color|brand|primary|accent|bg|text|font/i.test(k)).slice(0,25);
    ve.forEach(([k2,v])=>console.log('   ',k2,'=',v));
    console.log('--- top text colors ---'); d.colors.slice(0,8).forEach(c=>console.log('   ',c[0],c[1]));
    console.log('--- top backgrounds ---'); d.backgrounds.slice(0,8).forEach(c=>console.log('   ',c[0],c[1]));
    console.log('--- fonts ---'); d.fonts.forEach(f=>console.log('   ',f[1],'x',f[0].slice(0,58)));
    console.log('--- radii ---'); d.radii.slice(0,6).forEach(r=>console.log('   ',r[0],r[1]));
  }
  await b.close();
})();
