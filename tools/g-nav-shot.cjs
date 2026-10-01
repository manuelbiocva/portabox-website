const { chromium } = require('playwright');
(async()=>{
  const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});
  const p=await b.newPage({viewport:{width:1440,height:950},deviceScaleFactor:2});
  await p.goto('http://127.0.0.1:8899/',{waitUntil:'networkidle'});
  await p.waitForTimeout(1800);
  await p.screenshot({path:'research/shots/gg-nav.png',clip:{x:0,y:0,width:1440,height:70}});
  const w=await p.$eval('.g-menu a', e=>getComputedStyle(e).fontWeight);
  console.log('nav link weight:', w);
  await b.close();
})();
