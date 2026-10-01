const { chromium } = require('playwright');
(async()=>{
  const b=await chromium.launch();
  const p=await b.newPage({viewport:{width:1440,height:1000}});
  await p.goto('http://127.0.0.1:8899/pricing/',{waitUntil:'networkidle'});
  await p.waitForTimeout(1200);
  const r=await p.evaluate(()=>{const m={};
    document.querySelectorAll('body *').forEach(e=>{const rr=getComputedStyle(e).borderRadius;
      const b=e.getBoundingClientRect(); if(b.width<4||b.height<4) return;
      if(rr&&rr!=='0px') m[rr]=(m[rr]||0)+1;});
    return Object.entries(m).sort((a,b)=>b[1]-a[1]);});
  r.forEach(x=>console.log('  ',x[0],'x',x[1]));
  await b.close();
})();
