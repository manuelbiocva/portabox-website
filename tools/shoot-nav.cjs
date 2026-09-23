const { chromium } = require('playwright');
(async()=>{
  const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});
  const p=await b.newPage({viewport:{width:1440,height:950}});
  await p.goto('http://127.0.0.1:8899/site/index.html',{waitUntil:'networkidle'});
  await p.waitForTimeout(2200);

  // transparent nav over the hero, mega open
  await p.hover('.nav-item:first-child .nav-link'); await p.waitForTimeout(700);
  await p.screenshot({path:'research/shots/nav-mega.png',clip:{x:0,y:0,width:1440,height:640}});

  // hero with the even overlay, nothing hovered
  await p.mouse.move(1400,800); await p.waitForTimeout(600);
  await p.screenshot({path:'research/shots/nav-hero.png'});

  // scrolled: cyan bar + original logo
  await p.evaluate(()=>window.scrollTo(0,1400)); await p.waitForTimeout(900);
  await p.screenshot({path:'research/shots/nav-solid.png',clip:{x:0,y:0,width:1440,height:110}});
  await p.hover('.nav-item:nth-child(3) .nav-link'); await p.waitForTimeout(700);
  await p.screenshot({path:'research/shots/nav-mega-solid.png',clip:{x:0,y:0,width:1440,height:560}});
  console.log('captured');
  await b.close();
})();
