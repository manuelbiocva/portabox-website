const { chromium } = require('playwright');
(async()=>{
  const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});
  const p=await b.newPage({viewport:{width:1440,height:950}});
  await p.goto('http://127.0.0.1:8899/',{waitUntil:'networkidle'});
  await p.waitForTimeout(2500);
  const boxes=await p.evaluate(()=>{
    const q=s=>{const e=document.querySelector(s); if(!e) return null;
      const r=e.getBoundingClientRect();
      const cs=getComputedStyle(e);
      return {s,x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height),
              color:cs.color,px:parseFloat(cs.fontSize)};};
    return [q('.g-display'),q('.g-hero-body'),q('.g-flag')].filter(Boolean);
  });
  // sample several video frames with the copy hidden
  for(const t of [1,5,9,13]){
    await p.evaluate(v=>{const el=document.querySelector('.hero-video'); el.pause(); el.currentTime=v;},t);
    await p.waitForTimeout(700);
    await p.evaluate(()=>{document.querySelector('.g-hero-in').style.visibility='hidden';});
    await p.waitForTimeout(150);
    require('fs').writeFileSync(`research/shots/gh-${t}.png`, await p.screenshot());
    await p.evaluate(()=>{document.querySelector('.g-hero-in').style.visibility='visible';});
  }
  console.log(JSON.stringify(boxes));
  await b.close();
})();
