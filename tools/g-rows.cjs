const { chromium } = require('playwright');
(async()=>{
  const b=await chromium.launch();
  const p=await b.newPage({viewport:{width:1440,height:950}});
  await p.goto('http://127.0.0.1:8899/',{waitUntil:'networkidle'});
  await p.waitForTimeout(1000);
  const r=await p.evaluate(()=>{
    const idx=document.querySelectorAll('.g-index')[0];
    return [...idx.querySelectorAll('.g-row')].map(row=>{
      const g=e=>{const x=row.querySelector(e); return x?Math.round(x.getBoundingClientRect().left):null;};
      const gr=e=>{const x=row.querySelector(e); return x?Math.round(x.getBoundingClientRect().right):null;};
      return {cols:getComputedStyle(row).gridTemplateColumns,
              n:g('.g-row-n'), t:g('.g-row-t'), d:g('.g-row-d'), m:g('.g-row-m'), mr:gr('.g-row-m')};
    });
  });
  console.log('left edge of each cell, per row:');
  r.forEach((x,i)=>console.log(`  row${i+1}  n=${x.n}  t=${x.t}  d=${x.d}  m=${x.m}  (m right=${x.mr})`));
  console.log('\ncolumn templates:');
  r.forEach((x,i)=>console.log(`  row${i+1}  ${x.cols}`));
  const same = (k)=> new Set(r.map(x=>x[k])).size===1;
  console.log('\naligned across rows?  n:',same('n'),' t:',same('t'),' d:',same('d'),' m:',same('m'));
  await b.close();
})();
