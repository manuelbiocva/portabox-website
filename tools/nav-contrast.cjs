const { chromium } = require('playwright');
const B='http://127.0.0.1:8899/';
(async()=>{
  const b=await chromium.launch();
  const p=await b.newPage({viewport:{width:1440,height:1000}});
  for(const f of ['index.html','storage-at-your-place.html','victoria.html','pricing.html','regional-australia.html']){
    await p.goto(B+f,{waitUntil:'networkidle'}); await p.waitForTimeout(1200);
    // hide only the nav's own content so we photograph what sits behind it
    await p.evaluate(()=>{ document.querySelector('.nav-in').style.visibility='hidden'; });
    await p.waitForTimeout(250);
    await p.screenshot({path:`research/shots/navbg-${f.replace('.html','')}.png`, clip:{x:0,y:0,width:1440,height:72}});
  }
  console.log('captured nav backgrounds');
  await b.close();
})();
