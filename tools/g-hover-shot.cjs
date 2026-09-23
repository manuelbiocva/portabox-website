const { chromium } = require('playwright');
(async()=>{
  const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});
  const p=await b.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:2});
  await p.goto('http://127.0.0.1:8899/site/index.html',{waitUntil:'networkidle'});
  await p.waitForTimeout(1800);
  await p.addStyleTag({content:'.g-rise,.g-wipe{opacity:1!important;transform:none!important}'});

  // navy band "how it works", hover row 1
  const how=(await p.$$('.g-index'))[0];
  await how.scrollIntoViewIfNeeded(); await p.waitForTimeout(600);
  await (await how.$$('.g-row'))[0].hover(); await p.waitForTimeout(800);
  let bb=await how.boundingBox();
  await p.screenshot({path:'research/shots/gg-hover-navy.png',clip:{x:0,y:bb.y-24,width:1440,height:Math.min(bb.height+48,420)}});

  // light band "why", hover row 2
  const why=(await p.$$('.g-index'))[1];
  await why.scrollIntoViewIfNeeded(); await p.waitForTimeout(600);
  await (await why.$$('.g-row'))[1].hover(); await p.waitForTimeout(800);
  bb=await why.boundingBox();
  await p.screenshot({path:'research/shots/gg-hover-light.png',clip:{x:0,y:bb.y-24,width:1440,height:Math.min(bb.height+48,420)}});
  console.log('ok');
  await b.close();
})();
