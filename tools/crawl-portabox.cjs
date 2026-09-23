const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 1000 } });
  const out = {};

  for (const [k,u] of [['netlify','https://portabox.netlify.app/'],['live','https://portabox.au/']]) {
    await p.goto(u, { waitUntil:'networkidle', timeout:90000 });
    await p.waitForTimeout(2500);
    out[k] = await p.evaluate(() => {
      const links = [...document.querySelectorAll('a[href]')].map(a=>({
        t:a.textContent.trim().replace(/\s+/g,' ').slice(0,44), h:a.getAttribute('href')
      })).filter(x=>x.t && x.h && !x.h.startsWith('#') && !x.h.startsWith('tel') && !x.h.startsWith('mailto'));
      const uniq=[]; const seen=new Set();
      for(const l of links){ if(!seen.has(l.h)){seen.add(l.h); uniq.push(l);} }
      return uniq;
    });
  }

  // Harvest every image across the netlify build by scrolling the whole page
  await p.goto('https://portabox.netlify.app/', { waitUntil:'networkidle' });
  for(let i=0;i<14;i++){ await p.evaluate(()=>window.scrollBy(0,900)); await p.waitForTimeout(450); }
  await p.waitForTimeout(1500);
  const imgs = await p.evaluate(()=>[...document.querySelectorAll('img')]
    .map(i=>({src:i.currentSrc||i.src, alt:i.alt, w:i.naturalWidth, h:i.naturalHeight}))
    .filter(i=>i.src && i.w>200));
  out.images = imgs;

  fs.writeFileSync('research/portabox-structure.json', JSON.stringify(out,null,2));

  console.log('===== NETLIFY LINKS =====');
  out.netlify.forEach(l=>console.log(`  ${l.t.padEnd(42)} ${l.h}`));
  console.log('\n===== LIVE LINKS =====');
  out.live.slice(0,40).forEach(l=>console.log(`  ${l.t.padEnd(42)} ${l.h}`));
  console.log('\n===== IMAGES (' + imgs.length + ') =====');
  imgs.forEach(i=>console.log(`  ${String(i.w)+'x'+i.h}`.padEnd(12)+` ${i.alt.slice(0,46).padEnd(48)} ${i.src.slice(-58)}`));
  await b.close();
})();
