const { chromium } = require('playwright');
(async()=>{
  const b=await chromium.launch();
  const p=await b.newPage({viewport:{width:1400,height:1000}});
  await p.goto('http://127.0.0.1:8899/palette.html',{waitUntil:'networkidle'});
  await p.waitForTimeout(1200);
  await p.screenshot({path:'research/shots/pal-0.png'});
  await p.evaluate(()=>window.scrollBy(0,980)); await p.waitForTimeout(600);
  await p.screenshot({path:'research/shots/pal-1.png'});
  console.log('ok');
  await b.close();
})();
