const { chromium } = require('playwright');
(async()=>{
  const b=await chromium.launch();
  const p=await b.newPage({viewport:{width:1440,height:1100}});
  await p.goto('http://127.0.0.1:8899/site/choose.html',{waitUntil:'networkidle'});
  await p.waitForTimeout(1500);
  await p.screenshot({path:'research/shots/choose.png',fullPage:false});
  await p.goto('http://127.0.0.1:8899/site/index-c.html',{waitUntil:'networkidle'});
  await p.waitForTimeout(1200);
  await p.evaluate(()=>document.querySelector('.band--coal').scrollIntoView());
  await p.waitForTimeout(900);
  await p.screenshot({path:'research/shots/c-quiet.png'});
  console.log('ok');
  await b.close();
})();
