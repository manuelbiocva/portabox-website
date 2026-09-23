const { chromium } = require('playwright');
const B='http://127.0.0.1:8899/site/';
(async()=>{
  const b=await chromium.launch();
  const p=await b.newPage({viewport:{width:1440,height:900}});
  await p.goto(B+'index.html',{waitUntil:'networkidle'}); await p.waitForTimeout(1400);
  await p.evaluate(()=>document.querySelectorAll('.rv').forEach(e=>e.classList.add('in')));

  // Quiet-statement CTA: resting, mid-trace, and fully hovered
  const btn = await p.$('.btn-trace--primary');
  await btn.scrollIntoViewIfNeeded(); await p.waitForTimeout(700);
  await p.screenshot({path:'research/shots/tr-rest.png', clip: await clip(btn)});
  await btn.hover(); await p.waitForTimeout(180);
  await p.screenshot({path:'research/shots/tr-mid.png', clip: await clip(btn)});
  await p.waitForTimeout(700);
  await p.screenshot({path:'research/shots/tr-hover.png', clip: await clip(btn)});

  // Dark variant in the final CTA band
  const d = await p.$('.btn-trace--dark');
  await d.scrollIntoViewIfNeeded(); await p.waitForTimeout(700);
  await p.screenshot({path:'research/shots/tr-dark-rest.png', clip: await clip(d)});
  await d.hover(); await p.waitForTimeout(850);
  await p.screenshot({path:'research/shots/tr-dark-hover.png', clip: await clip(d)});

  // Accessible name check
  const names = await p.$$eval('.btn-trace', els => els.map(e => ({
    text: e.textContent.trim(), aria: e.getAttribute('aria-label')||'', href: e.getAttribute('href')
  })));
  console.log('accessible names:', JSON.stringify(names));

  async function clip(el){ const bb=await el.boundingBox();
    return {x:Math.max(0,bb.x-26), y:Math.max(0,bb.y-26), width:bb.width+52, height:bb.height+52}; }
  await b.close();
})();
