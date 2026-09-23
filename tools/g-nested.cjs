const { chromium } = require('playwright');
(async()=>{
  const b=await chromium.launch();
  const p=await b.newPage({viewport:{width:1440,height:1000}});
  await p.goto('http://127.0.0.1:8899/site/index.html',{waitUntil:'networkidle'});
  await p.waitForTimeout(900);
  const r=await p.evaluate(()=>{
    const nested=[...document.querySelectorAll('a a')].map(a=>a.textContent.trim().slice(0,30));
    const grid=document.querySelectorAll('.g-grid')[0];
    const kids=[...grid.children].map(c=>({tag:c.tagName.toLowerCase(),
      cls:(c.className||'').toString().slice(0,24),
      top:Math.round(c.getBoundingClientRect().top),
      w:Math.round(c.getBoundingClientRect().width)}));
    return {nested, kids, cols:getComputedStyle(grid).gridTemplateColumns};
  });
  console.log('nested anchors :', r.nested.length? r.nested.join(' | ') : 'none');
  console.log('grid columns   :', r.cols);
  console.log('grid children  :', r.kids.length);
  r.kids.forEach(k=>console.log(`   ${k.tag}.${k.cls.padEnd(24)} top=${k.top} w=${k.w}`));
  await b.close();
})();
