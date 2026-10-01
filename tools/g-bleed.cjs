const { chromium } = require('playwright');
(async()=>{
  const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});
  for (const w of [390, 1440]) {
    const p=await b.newPage({viewport:{width:w,height:1000},deviceScaleFactor:w>500?2:2});
    await p.goto('http://127.0.0.1:8899/',{waitUntil:'networkidle'});
    await p.waitForTimeout(1500);
    await p.addStyleTag({content:'.g-rise,.g-wipe{opacity:1!important;transform:none!important}'});
    const idx=(await p.$$('.g-index'))[1];
    await idx.scrollIntoViewIfNeeded(); await p.waitForTimeout(600);
    const row=(await idx.$$('.g-row'))[0];
    await row.hover(); await p.waitForTimeout(800);
    const m=await p.evaluate(()=>{
      const r=document.querySelectorAll('.g-index')[1].querySelector('.g-row');
      const cs=getComputedStyle(r,'::before');
      const rb=r.getBoundingClientRect();
      const n=r.querySelector('.g-row-n').getBoundingClientRect();
      return {bleed:getComputedStyle(r).getPropertyValue('--row-bleed').trim(),
              tint:cs.backgroundColor, rowLeft:Math.round(rb.left), numLeft:Math.round(n.left),
              docOv:document.documentElement.scrollWidth-document.documentElement.clientWidth};
    });
    const bb=await idx.boundingBox();
    await p.screenshot({path:`research/shots/gg-bleed-${w}.png`,
      clip:{x:0,y:bb.y-10,width:w,height:Math.min(260,bb.height)}});
    console.log(`${String(w).padStart(5)}px  bleed=${m.bleed.padEnd(8)} tint=${m.tint.padEnd(22)} row.left=${m.rowLeft} num.left=${m.numLeft}  overflow=${m.docOv}`);
    await p.close();
  }
  await b.close();
})();
