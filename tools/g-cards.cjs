const { chromium } = require('playwright');
(async()=>{
  const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});
  const p=await b.newPage({viewport:{width:1440,height:1000}});
  await p.goto('http://127.0.0.1:8899/',{waitUntil:'networkidle'});
  await p.waitForTimeout(2000);
  await p.addStyleTag({content:'.g-rise,.g-wipe{opacity:1!important;transform:none!important}'});
  await p.evaluate(()=>document.querySelectorAll('.g-grid')[0].scrollIntoView({block:'center'}));
  await p.waitForTimeout(900);
  await p.screenshot({path:'research/shots/gg-cards.png'});
  await p.evaluate(()=>document.querySelectorAll('.g-grid')[1].scrollIntoView({block:'center'}));
  await p.waitForTimeout(900);
  await p.screenshot({path:'research/shots/gg-specs.png'});
  console.log('ok');
  await b.close();
})();
