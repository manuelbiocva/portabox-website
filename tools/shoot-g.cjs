const { chromium } = require('playwright');
const B='http://127.0.0.1:8899/site/';
(async()=>{
  const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});
  const p=await b.newPage({viewport:{width:1440,height:950}});
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  p.on('console',m=>{if(m.type()==='error')errs.push(m.text());});
  await p.goto(B+'index.html',{waitUntil:'networkidle'}); await p.waitForTimeout(2300);
  await p.screenshot({path:'research/shots/gg-0.png'});
  const H=await p.evaluate(()=>document.body.scrollHeight);
  for(let i=1;i<=7;i++){
    await p.evaluate(v=>window.scrollTo(0,v), Math.round((H-950)*(i/7)));
    await p.waitForTimeout(1200);
    await p.screenshot({path:`research/shots/gg-${i}.png`});
  }
  const ov=await p.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
  const m=await b.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  await m.goto(B+'index.html',{waitUntil:'networkidle'}); await m.waitForTimeout(1800);
  await m.screenshot({path:'research/shots/gg-m.png'});
  const ovm=await m.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
  // radius audit — giga has zero
  const radii=await p.evaluate(()=>{const s=new Set();
    document.querySelectorAll('body *').forEach(e=>{const r=getComputedStyle(e).borderRadius;
      const b=e.getBoundingClientRect(); if(b.width>3&&b.height>3&&r&&r!=='0px') s.add(r);});
    return [...s];});
  console.log('desktop overflow:',ov,'| mobile overflow:',ovm);
  console.log('non-zero radii  :',radii.length?radii.join(', '):'none — fully square');
  console.log('errors          :',errs.length?errs.join(';'):'none');
  await b.close();
})();
