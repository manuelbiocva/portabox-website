const { chromium } = require('playwright');
(async()=>{
  const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});
  const p=await b.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:2});
  await p.goto('http://127.0.0.1:8899/site/index.html',{waitUntil:'networkidle'});
  await p.waitForTimeout(1800);
  await p.addStyleTag({content:'.g-rise,.g-wipe{opacity:1!important;transform:none!important}'});
  const how=(await p.$$('.g-index'))[0];
  await how.scrollIntoViewIfNeeded(); await p.waitForTimeout(600);
  const row=(await how.$$('.g-row'))[0];
  const bb=await how.boundingBox();
  const clip={x:0,y:bb.y-10,width:1440,height:200};

  // sample the animation mid-flight to confirm it is easing, not snapping
  await row.hover();
  for (const ms of [80, 200, 600]) {
    await p.waitForTimeout(ms === 80 ? 80 : ms - (ms === 200 ? 80 : 200));
    const v = await p.evaluate(()=>{
      const r=document.querySelector('#how .g-row');
      return {bar:getComputedStyle(r,'::after').transform,
              wash:getComputedStyle(r,'::before').opacity,
              shift:getComputedStyle(r.querySelector('.g-row-t')).transform};
    });
    console.log(`t=${String(ms).padStart(3)}ms  wash=${Number(v.wash).toFixed(2)}  bar=${v.bar.slice(0,28)}  text=${v.shift.slice(0,28)}`);
  }
  await p.screenshot({path:'research/shots/gg-smooth.png',clip});
  await b.close();
})();
