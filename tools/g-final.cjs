const { chromium } = require('playwright');
(async()=>{
  const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});
  const p=await b.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:2});
  await p.goto('http://127.0.0.1:8899/',{waitUntil:'networkidle'});
  await p.waitForTimeout(1800);
  await p.addStyleTag({content:'.g-rise,.g-wipe{opacity:1!important;transform:none!important}'});

  // quotes with avatars
  let el=await p.$('.g-quotes'); await el.scrollIntoViewIfNeeded(); await p.waitForTimeout(700);
  let bb=await el.boundingBox();
  await p.screenshot({path:'research/shots/gg-quotes.png',clip:{x:bb.x-24,y:bb.y-24,width:bb.width+48,height:bb.height+48}});

  // index with a row hovered
  const idx=(await p.$$('.g-index'))[1];
  await idx.scrollIntoViewIfNeeded(); await p.waitForTimeout(700);
  const row=(await idx.$$('.g-row'))[1];
  await row.hover(); await p.waitForTimeout(800);
  bb=await idx.boundingBox();
  await p.screenshot({path:'research/shots/gg-index-hover.png',
    clip:{x:bb.x-20,y:bb.y-20,width:bb.width+40,height:Math.min(bb.height+40,760)}});

  const info=await p.evaluate(()=>{
    const q=[...document.querySelectorAll('.g-quote img')].map(i=>({ok:i.complete&&i.naturalWidth>0,n:i.naturalWidth}));
    const n=document.querySelector('.g-row-n');
    return {avatars:q, numSize:getComputedStyle(n).fontSize, numWeight:getComputedStyle(n).fontWeight};
  });
  console.log('avatars:',JSON.stringify(info.avatars));
  console.log('step number:',info.numSize,'weight',info.numWeight);
  await b.close();
})();
