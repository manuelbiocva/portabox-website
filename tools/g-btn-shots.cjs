const { chromium } = require('playwright');
(async()=>{
  const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});
  const p=await b.newPage({viewport:{width:1440,height:950},deviceScaleFactor:3});
  await p.goto('http://127.0.0.1:8899/',{waitUntil:'networkidle'});
  await p.waitForTimeout(1800);
  // nav buttons at rest, over the hero
  await p.screenshot({path:'research/shots/gg-btns-rest.png',clip:{x:1000,y:4,width:420,height:56}});
  // scrolled: cyan bar
  await p.evaluate(()=>window.scrollTo(0,1600)); await p.waitForTimeout(900);
  await p.screenshot({path:'research/shots/gg-btns-cyan.png',clip:{x:1000,y:4,width:420,height:56}});
  // a full-size hero button
  await p.evaluate(()=>window.scrollTo(0,0)); await p.waitForTimeout(900);
  const bb=await (await p.$('.g-hero .g-btn')).boundingBox();
  await p.screenshot({path:'research/shots/gg-btn-hero.png',clip:{x:bb.x-8,y:bb.y-8,width:bb.width+16,height:bb.height+16}});
  console.log('ok');
  await b.close();
})();
