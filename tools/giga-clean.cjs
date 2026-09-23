const { chromium } = require('playwright');
(async()=>{
  const b=await chromium.launch();
  const p=await b.newPage({viewport:{width:1440,height:950}});
  await p.goto('https://www.gigaenergy.com/',{waitUntil:'networkidle',timeout:90000});
  await p.waitForTimeout(3000);
  // dismiss cookie + modal
  for(const sel of ['text=Okay','[aria-label="Close"]','.w-lightbox-close','text=×']){
    try{ await p.click(sel,{timeout:1200}); await p.waitForTimeout(400);}catch(e){}
  }
  await p.evaluate(()=>{
    document.querySelectorAll('[class*=modal],[class*=cookie],[class*=popup],[id*=modal]').forEach(e=>{
      const r=e.getBoundingClientRect(); if(r.height>80) e.style.display='none';});
  });
  await p.waitForTimeout(800);
  const H=await p.evaluate(()=>document.body.scrollHeight);
  for(let i=0;i<=8;i++){
    await p.evaluate(v=>window.scrollTo(0,v), Math.round((H-950)*(i/8)));
    await p.waitForTimeout(1500);
    await p.screenshot({path:`research/giga/c-${i}.png`});
  }
  console.log('clean capture done, page height', H);
  await b.close();
})();
