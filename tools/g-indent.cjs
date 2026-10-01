const { chromium } = require('playwright');
(async()=>{
  const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});
  const p=await b.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:2});
  await p.goto('http://127.0.0.1:8899/',{waitUntil:'networkidle'});
  await p.waitForTimeout(1800);
  await p.addStyleTag({content:'.g-rise,.g-wipe{opacity:1!important;transform:none!important}'});

  const pr=await p.$('.g-price'); await pr.scrollIntoViewIfNeeded(); await p.waitForTimeout(600);
  const rows=await pr.$$('.g-price-row');

  const at = async (label)=> p.evaluate(()=>{
    const sec=document.querySelector('#pricing');
    const r=sec.querySelector('.g-price-row');
    return {heading:Math.round(sec.querySelector('.g-h2').getBoundingClientRect().left),
            rule:Math.round(sec.querySelector('.g-price').getBoundingClientRect().left),
            name:Math.round(r.querySelector('.g-price-name b').getBoundingClientRect().left)};
  });
  await p.mouse.move(10,10); await p.waitForTimeout(600);
  console.log('at rest :', JSON.stringify(await at()));
  await rows[0].hover(); await p.waitForTimeout(800);
  console.log('hovered :', JSON.stringify(await at()));

  const bb=await pr.boundingBox();
  await p.screenshot({path:'research/shots/gg-indent.png',clip:{x:0,y:bb.y-20,width:1440,height:Math.min(bb.height+40,420)}});
  await b.close();
})();
