const { chromium } = require('playwright');
(async()=>{
  const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});
  const p=await b.newPage({viewport:{width:1440,height:900}});
  await p.goto('http://127.0.0.1:8899/',{waitUntil:'networkidle'});
  await p.waitForTimeout(2500);
  // where is each text block?
  const boxes=await p.evaluate(()=>{
    const pick=s=>{const e=document.querySelector(s); if(!e) return null;
      const r=e.getBoundingClientRect(); return {s,x:r.x,y:r.y,w:r.width,h:r.height};};
    return [pick('.hero-c .display-light'),pick('.hero-c-sub'),pick('.hero-c-fine')].filter(Boolean);
  });
  // sample several points in the video, with the copy hidden
  const frames=[1.0,5.0,9.0,13.0];
  const worst={};
  for(const ft of frames){
    await p.evaluate(t=>{const v=document.querySelector('.hero-video'); v.pause(); v.currentTime=t;},ft);
    await p.waitForTimeout(700);
    await p.evaluate(()=>{document.querySelector('.hero-c-inner').style.visibility='hidden';});
    await p.waitForTimeout(150);
    const buf=await p.screenshot();
    await p.evaluate(()=>{document.querySelector('.hero-c-inner').style.visibility='visible';});
    require('fs').writeFileSync(`research/shots/heroframe-${ft}.png`,buf);
  }
  console.log(JSON.stringify(boxes));
  await b.close();
})();
