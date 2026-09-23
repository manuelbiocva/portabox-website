const { chromium } = require('playwright');
(async()=>{
  const b=await chromium.launch();
  const p=await b.newPage({viewport:{width:1920,height:1072}});
  await p.setContent(`<body style="margin:0">
    <video id="v" src="http://127.0.0.1:8899/site/assets/video/banner.mp4" muted playsinline
           style="width:1920px;height:1072px;object-fit:cover;display:block"></video></body>`);
  await p.waitForFunction(()=>{const v=document.getElementById('v');return v&&v.readyState>=2;},{timeout:45000});
  await p.evaluate(()=>{document.getElementById('v').currentTime=0.15;});
  await p.waitForTimeout(1200);
  await p.screenshot({path:'site/assets/img/banner-poster.jpg',type:'jpeg',quality:72,
                      clip:{x:0,y:0,width:1920,height:1072}});
  console.log('poster written');
  await b.close();
})();
