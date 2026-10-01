const { chromium } = require('playwright');
(async()=>{
  const b=await chromium.launch();
  const p=await b.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  await p.goto('http://127.0.0.1:8899/',{waitUntil:'networkidle'});
  await p.waitForTimeout(1500);
  const bad=await p.evaluate(()=>{
    const w=document.documentElement.clientWidth, out=[];
    document.querySelectorAll('body *').forEach(e=>{
      const r=e.getBoundingClientRect();
      if(r.right>w+1||r.left<-1){
        out.push({tag:e.tagName.toLowerCase(),cls:(e.className||'').toString().slice(0,46),
                  left:Math.round(r.left),right:Math.round(r.right),w:Math.round(r.width)});
      }});
    return out.slice(0,12);
  });
  console.log('viewport 390 — elements breaking the edge:');
  bad.forEach(x=>console.log(`  ${x.tag}.${x.cls}  left=${x.left} right=${x.right} w=${x.w}`));
  await b.close();
})();
