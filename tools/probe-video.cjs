const { chromium } = require('playwright');
(async()=>{
  const b=await chromium.launch();
  const p=await b.newPage({viewport:{width:1280,height:720}});
  await p.setContent(`<body style="margin:0;background:#111">
    <video id="v" src="http://127.0.0.1:8899/assets/video/banner.mp4" muted playsinline
           style="width:100%;height:100vh;object-fit:contain"></video></body>`);
  await p.waitForFunction(()=>{const v=document.getElementById('v');return v&&v.readyState>=2;},{timeout:45000});
  const meta=await p.evaluate(()=>{const v=document.getElementById('v');
    return {w:v.videoWidth,h:v.videoHeight,dur:+v.duration.toFixed(2),ratio:(v.videoWidth/v.videoHeight).toFixed(2)};});
  console.log(JSON.stringify(meta));
  for(const t of [0.2, meta.dur*0.35, meta.dur*0.7]){
    await p.evaluate(s=>{document.getElementById('v').currentTime=s;},t);
    await p.waitForTimeout(900);
    await p.screenshot({path:`research/shots/vid-${Math.round(t*10)}.png`});
  }
  await b.close();
})();
