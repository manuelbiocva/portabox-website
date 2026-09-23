const { chromium } = require('playwright');
(async()=>{
  const b=await chromium.launch();
  const p=await b.newPage({viewport:{width:1440,height:900}});
  await p.goto('http://127.0.0.1:8899/site/index.html',{waitUntil:'networkidle'});
  await p.waitForTimeout(1200);
  for (const sel of ['.btn-trace--primary','.btn-trace--dark']) {
    const name = await p.$eval(sel, el => {
      // what assistive tech actually computes: visible, non-aria-hidden text
      const walk = n => {
        if (n.nodeType===3) return n.textContent;
        if (n.nodeType!==1) return '';
        if (n.getAttribute('aria-hidden')==='true') return '';
        if (getComputedStyle(n).visibility==='hidden') return '';
        return [...n.childNodes].map(walk).join('');
      };
      return walk(el).replace(/\s+/g,' ').trim();
    });
    console.log(sel, '-> accessible name:', JSON.stringify(name));
  }
  await b.close();
})();
