const { chromium } = require('playwright');
(async()=>{
  const b=await chromium.launch();
  const p=await b.newPage({viewport:{width:1440,height:900},deviceScaleFactor:2});
  await p.goto('http://127.0.0.1:8899/site/index.html',{waitUntil:'networkidle'});
  await p.waitForTimeout(1400);
  await p.addStyleTag({content:'.rv{opacity:1!important;transform:none!important}'});
  const shots=[['.nav .btn-trace','nav'],['.tool-card-form .btn-trace','form'],
               ['.price-rule .btn-trace','price'],['.faq + * .btn-trace, .btn-trace--outline','outline']];
  for(const [sel,name] of shots){
    const el=await p.$(sel); if(!el){console.log('skip',name);continue;}
    await el.scrollIntoViewIfNeeded(); await p.waitForTimeout(500);
    const bb=await el.boundingBox();
    const clip={x:Math.max(0,bb.x-16),y:Math.max(0,bb.y-16),width:bb.width+32,height:bb.height+32};
    await p.screenshot({path:`research/shots/bt-${name}-rest.png`,clip});
    await el.hover(); await p.waitForTimeout(800);
    await p.screenshot({path:`research/shots/bt-${name}-hover.png`,clip});
  }
  console.log('captured');
  await b.close();
})();
