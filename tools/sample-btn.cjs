const { chromium } = require('playwright');
(async()=>{
  const b=await chromium.launch();
  const p=await b.newPage({viewport:{width:1440,height:900},deviceScaleFactor:2});
  await p.goto('http://127.0.0.1:8899/',{waitUntil:'networkidle'});
  await p.waitForTimeout(1300);
  await p.evaluate(()=>document.querySelectorAll('.rv').forEach(e=>e.classList.add('in')));
  const btn=await p.$('.btn-trace--primary');
  await btn.scrollIntoViewIfNeeded(); await p.waitForTimeout(800);
  await p.screenshot({path:'research/shots/btn-rest.png',clip:await clip(btn)});
  await btn.hover(); await p.waitForTimeout(900);
  await p.screenshot({path:'research/shots/btn-hover.png',clip:await clip(btn)});
  const info=await p.evaluate(()=>{
    const el=document.querySelector('.btn-trace--primary');
    const cs=getComputedStyle(el), be=getComputedStyle(el,'::before');
    return { trace: cs.getPropertyValue('--bt-trace').trim(),
             beforeBg: be.backgroundColor, border: cs.border, radius: cs.borderRadius,
             bandBg: getComputedStyle(el.closest('section')).backgroundColor };
  });
  console.log(JSON.stringify(info,null,1));
  async function clip(el){const bb=await el.boundingBox();
    return {x:bb.x-14,y:bb.y-14,width:bb.width+28,height:bb.height+28};}
  await b.close();
})();
