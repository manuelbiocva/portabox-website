const { chromium } = require('playwright');
(async()=>{
  const b=await chromium.launch();
  const p=await b.newPage({viewport:{width:1440,height:950}});
  await p.goto('http://127.0.0.1:8899/',{waitUntil:'networkidle'});
  await p.waitForTimeout(1200);
  const r=await p.evaluate(()=>{
    const out=[];
    const probe=(sel,label)=>{
      const e=document.querySelector(sel); if(!e) return;
      const i=e.querySelector('i'); const s=e.querySelector('span');
      const eb=e.getBoundingClientRect(), ib=i.getBoundingClientRect(), sb=s?s.getBoundingClientRect():null;
      const cs=getComputedStyle(e), ci=getComputedStyle(i);
      out.push({label,
        btn:`top=${eb.top.toFixed(1)} bot=${eb.bottom.toFixed(1)} h=${eb.height.toFixed(1)}`,
        ico:`top=${ib.top.toFixed(1)} bot=${ib.bottom.toFixed(1)} h=${ib.height.toFixed(1)}`,
        overflowTop:+(eb.top-ib.top).toFixed(1), overflowBot:+(ib.bottom-eb.bottom).toFixed(1),
        btnH:cs.height, btnBox:cs.boxSizing, icoH:ci.height, align:cs.alignItems});
    };
    probe('.g-nav .g-btn--ghost','nav ghost');
    probe('.g-nav .g-btn--yellow','nav yellow');
    probe('.g-hero .g-btn','hero button');
    return out;
  });
  r.forEach(x=>{
    console.log(`\n${x.label}`);
    console.log('  button ',x.btn,'| css height',x.btnH,'| box',x.btnBox,'| align',x.align);
    console.log('  icon   ',x.ico,'| css height',x.icoH);
    console.log('  icon overflows: top by',x.overflowTop,'px, bottom by',x.overflowBot,'px');
  });
  await b.close();
})();
