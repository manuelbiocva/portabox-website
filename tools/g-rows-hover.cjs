const { chromium } = require('playwright');
(async()=>{
  const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});
  const p=await b.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:2});
  await p.goto('http://127.0.0.1:8899/',{waitUntil:'networkidle'});
  await p.waitForTimeout(1800);
  await p.addStyleTag({content:'.g-rise,.g-wipe{opacity:1!important;transform:none!important}'});

  // pricing, hovering the middle row
  const pr=await p.$('.g-price'); await pr.scrollIntoViewIfNeeded(); await p.waitForTimeout(600);
  await (await pr.$$('.g-price-row'))[1].hover(); await p.waitForTimeout(800);
  let bb=await pr.boundingBox();
  await p.screenshot({path:'research/shots/gg-price-hover.png',clip:{x:0,y:bb.y-16,width:1440,height:Math.min(bb.height+32,520)}});

  // quotes, circular avatars
  const q=await p.$('.g-quotes'); await q.scrollIntoViewIfNeeded(); await p.waitForTimeout(600);
  bb=await q.boundingBox();
  await p.screenshot({path:'research/shots/gg-quotes.png',clip:{x:bb.x-20,y:bb.y-20,width:bb.width+40,height:bb.height+40}});

  const m=await p.evaluate(()=>({
    avatarRadius:getComputedStyle(document.querySelector('.g-quote figcaption img')).borderRadius,
    priceHasBefore:getComputedStyle(document.querySelector('.g-price-row'),'::before').content !== 'none',
    regionHasBefore:getComputedStyle(document.querySelector('.g-region'),'::before').content !== 'none',
    bestBg:getComputedStyle(document.querySelector('.g-price-row.is-best'),'::before').backgroundImage.slice(0,40)
  }));
  console.log(JSON.stringify(m,null,1));
  await b.close();
})();
