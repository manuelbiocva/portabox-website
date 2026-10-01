const { chromium } = require('playwright');
(async()=>{
  const b=await chromium.launch();
  const p=await b.newPage({viewport:{width:390,height:844},isMobile:true});
  await p.goto('http://127.0.0.1:8899/',{waitUntil:'networkidle'});
  await p.waitForTimeout(1200);
  const r=await p.evaluate(()=>{
    const q=s=>{const e=document.querySelector(s); if(!e) return null;
      const cs=getComputedStyle(e);
      return {sel:s, box:cs.boxSizing, w:cs.width, pad:cs.paddingLeft+'/'+cs.paddingRight,
              max:cs.maxWidth, pos:cs.position, rectW:Math.round(e.getBoundingClientRect().width)};};
    return {
      bodyMargin:getComputedStyle(document.body).margin,
      bodyBox:getComputedStyle(document.body).boxSizing,
      htmlOverflowX:getComputedStyle(document.documentElement).overflowX,
      items:[q('.g-nav'),q('.g-nav-in'),q('.g-wrap'),q('.g-hero')].filter(Boolean)
    };
  });
  console.log('body margin:',r.bodyMargin,'| body box-sizing:',r.bodyBox,'| html overflow-x:',r.htmlOverflowX);
  r.items.forEach(i=>console.log(`  ${i.sel.padEnd(12)} box=${i.box.padEnd(11)} w=${i.w.padEnd(9)} pad=${i.pad.padEnd(12)} max=${i.max.padEnd(9)} pos=${i.pos.padEnd(8)} rect=${i.rectW}`));
  await b.close();
})();
