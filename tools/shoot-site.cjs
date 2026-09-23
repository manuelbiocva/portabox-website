const { chromium } = require('playwright');
const B='http://127.0.0.1:8899/site/';
(async()=>{
  const b=await chromium.launch();
  const p=await b.newPage({viewport:{width:1440,height:1000}});
  const cap=async(f,name,scrolls)=>{
    await p.goto(B+f,{waitUntil:'networkidle'}); await p.waitForTimeout(1400);
    await p.screenshot({path:`research/shots/${name}-0.png`});
    for(let i=1;i<=scrolls;i++){
      await p.evaluate(()=>window.scrollBy(0,window.innerHeight*0.95));
      await p.waitForTimeout(950);
      await p.screenshot({path:`research/shots/${name}-${i}.png`});
    }
  };
  await cap('index.html','home',4);
  await cap('storage-at-your-place.html','svc',2);
  await cap('victoria.html','loc',2);
  const m=await b.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  await m.goto(B+'index.html',{waitUntil:'networkidle'}); await m.waitForTimeout(1400);
  await m.screenshot({path:'research/shots/m-home.png'});
  await m.click('.burger'); await m.waitForTimeout(600);
  await m.screenshot({path:'research/shots/m-menu.png'});
  console.log('done');
  await b.close();
})();
