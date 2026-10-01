const { chromium } = require('playwright');
(async()=>{
  const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});
  const p=await b.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:3});
  await p.goto('http://127.0.0.1:8899/',{waitUntil:'networkidle'});
  await p.waitForTimeout(1800);
  await p.addStyleTag({content:'.g-rise,.g-wipe{opacity:1!important;transform:none!important}'});
  const q=await p.$('.g-quotes'); await q.scrollIntoViewIfNeeded(); await p.waitForTimeout(700);
  // tight crop on the three attribution rows
  const caps=await p.$$('.g-quote figcaption');
  const bb0=await caps[0].boundingBox(); const bb2=await caps[2].boundingBox();
  await p.screenshot({path:'research/shots/gg-avatars.png',
    clip:{x:bb0.x-24,y:bb0.y-16,width:(bb2.x+bb2.width)-bb0.x+48,height:bb0.height+32}});
  console.log('ok');
  await b.close();
})();
