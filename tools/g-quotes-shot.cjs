const { chromium } = require('playwright');
(async()=>{
  const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});
  const p=await b.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:2});
  await p.goto('http://127.0.0.1:8899/site/index.html',{waitUntil:'networkidle'});
  await p.waitForTimeout(1800);
  await p.addStyleTag({content:'.g-rise,.g-wipe{opacity:1!important;transform:none!important}'});
  const el=await p.$('.g-quotes');
  await el.scrollIntoViewIfNeeded(); await p.waitForTimeout(800);
  const bb=await el.boundingBox();
  await p.screenshot({path:'research/shots/gg-quotes.png',
    clip:{x:bb.x-24,y:bb.y-24,width:bb.width+48,height:bb.height+48}});
  const info=await p.evaluate(()=>[...document.querySelectorAll('.g-quote')].map(q=>{
    const i=q.querySelector('img');
    return {h:Math.round(q.getBoundingClientRect().height),
            imgLoaded:i.complete&&i.naturalWidth>0, nat:i.naturalWidth+'x'+i.naturalHeight};}));
  console.log(JSON.stringify(info));
  await b.close();
})();
