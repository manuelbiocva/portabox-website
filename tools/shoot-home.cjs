const { chromium } = require('playwright');
const B='http://127.0.0.1:8899/';
(async()=>{
  const b=await chromium.launch();
  const p=await b.newPage({viewport:{width:1440,height:1000}});
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto(B+'index.html',{waitUntil:'networkidle'}); await p.waitForTimeout(1600);
  await p.screenshot({path:'research/shots/final-0.png'});
  for(let i=1;i<=6;i++){
    await p.evaluate(()=>window.scrollBy(0,window.innerHeight*0.95));
    await p.waitForTimeout(900);
    await p.screenshot({path:`research/shots/final-${i}.png`});
  }
  const m=await b.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  await m.goto(B+'index.html',{waitUntil:'networkidle'}); await m.waitForTimeout(1500);
  await m.screenshot({path:'research/shots/final-m.png'});
  console.log('errors:',errs.length?errs.join(';'):'none');
  await b.close();
})();
