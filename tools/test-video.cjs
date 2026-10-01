const { chromium } = require('playwright');
(async()=>{
  const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});
  const p=await b.newPage({viewport:{width:1440,height:900}});
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('http://127.0.0.1:8899/',{waitUntil:'networkidle'});
  await p.waitForTimeout(3000);
  const st=await p.evaluate(()=>{const v=document.querySelector('.hero-video');
    return v?{src:!!v.getAttribute('src'),playing:!v.paused,t:+v.currentTime.toFixed(2),
              w:v.videoWidth,h:v.videoHeight,poster:!!v.poster}:null;});
  console.log('desktop video:',JSON.stringify(st));
  await p.screenshot({path:'research/shots/vhero-desktop.png'});

  // mobile: poster only, no download
  const m=await b.newPage({viewport:{width:390,height:844},isMobile:true});
  await m.goto('http://127.0.0.1:8899/',{waitUntil:'networkidle'});
  await m.waitForTimeout(2000);
  const ms=await m.evaluate(()=>{const v=document.querySelector('.hero-video');
    return v?{src:v.getAttribute('src'),poster:!!v.poster}:null;});
  console.log('mobile video :',JSON.stringify(ms));
  await m.screenshot({path:'research/shots/vhero-mobile.png'});

  // reduced motion: poster only
  const r=await b.newPage({viewport:{width:1440,height:900}});
  await r.emulateMedia({reducedMotion:'reduce'});
  await r.goto('http://127.0.0.1:8899/',{waitUntil:'networkidle'});
  await r.waitForTimeout(1500);
  const rs=await r.evaluate(()=>{const v=document.querySelector('.hero-video');return v?{src:v.getAttribute('src')}:null;});
  console.log('reduced-motn :',JSON.stringify(rs));
  console.log('js errors    :',errs.length?errs.join(';'):'none');
  await b.close();
})();
