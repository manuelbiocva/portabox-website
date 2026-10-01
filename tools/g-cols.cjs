const { chromium } = require('playwright');
(async()=>{
  const b=await chromium.launch();
  for (const w of [390, 800, 1000, 1440, 1900]) {
    const p=await b.newPage({viewport:{width:w,height:950}});
    await p.goto('http://127.0.0.1:8899/',{waitUntil:'networkidle'});
    await p.waitForTimeout(700);
    const r=await p.evaluate(()=>{
      const out=[];
      document.querySelectorAll('.g-grid').forEach(g=>{
        const cols=getComputedStyle(g).gridTemplateColumns.split(' ').length;
        out.push({cls:g.className.replace('g-grid ',''), cols,
                  first:Math.round(g.firstElementChild.getBoundingClientRect().width)});
      });
      return out;
    });
    console.log(`${String(w).padStart(5)}px : ` + r.map(x=>`${x.cls}=${x.cols}col(${x.first}px)`).join('  '));
    await p.close();
  }
  await b.close();
})();
