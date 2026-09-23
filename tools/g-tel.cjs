const { chromium } = require('playwright');
(async()=>{
  const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});
  const p=await b.newPage({viewport:{width:1440,height:950},deviceScaleFactor:3});
  await p.goto('http://127.0.0.1:8899/site/index.html',{waitUntil:'networkidle'});
  await p.waitForTimeout(1800);
  const bb=await (await p.$('.g-nav .g-btn--tel')).boundingBox();
  await p.screenshot({path:'research/shots/gg-tel-rest.png',clip:{x:bb.x-8,y:bb.y-8,width:bb.width+16,height:bb.height+16}});
  await (await p.$('.g-nav .g-btn--tel')).hover(); await p.waitForTimeout(700);
  await p.screenshot({path:'research/shots/gg-tel-hover.png',clip:{x:bb.x-8,y:bb.y-8,width:bb.width+16,height:bb.height+16}});
  const n=await p.evaluate(()=>({
    tel:document.querySelectorAll('.g-btn--tel').length,
    arrows:[...document.querySelectorAll('.g-btn--tel i path')].map(p=>p.getAttribute('d').slice(0,12))
  }));
  console.log(JSON.stringify(n));
  await b.close();
})();
