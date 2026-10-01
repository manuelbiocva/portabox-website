const { chromium } = require('playwright');
(async()=>{
  const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});
  const p=await b.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:2});
  await p.goto('http://127.0.0.1:8899/',{waitUntil:'networkidle'});
  await p.waitForTimeout(1800);
  await p.addStyleTag({content:'.g-rise,.g-wipe{opacity:1!important;transform:none!important}'});
  for (const [i,name] of [[0,'how'],[1,'why']]) {
    const el=(await p.$$('.g-index'))[i];
    await el.scrollIntoViewIfNeeded(); await p.waitForTimeout(700);
    const bb=await el.boundingBox();
    await p.screenshot({path:`research/shots/gg-index-${name}.png`,
      clip:{x:bb.x-20,y:bb.y-20,width:bb.width+40,height:Math.min(bb.height+40,900)}});
  }
  console.log('ok');
  await b.close();
})();
