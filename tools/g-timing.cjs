const { chromium } = require('playwright');
(async()=>{
  const b=await chromium.launch();
  const p=await b.newPage({viewport:{width:1440,height:1000}});
  await p.goto('http://127.0.0.1:8899/site/index.html',{waitUntil:'networkidle'});
  await p.waitForTimeout(1200);
  const r=await p.evaluate(()=>{
    const q=(s,pseudo)=>{const e=document.querySelector(s); if(!e) return null;
      const cs=getComputedStyle(e,pseudo||null);
      return {sel:s+(pseudo||''), dur:cs.transitionDuration, ease:cs.transitionTimingFunction.slice(0,40)};};
    return [q('.g-row','::before'),q('.g-row','::after'),q('.g-row-n'),
            q('.g-btn'),q('.g-link span'),q('.g-menu a'),q('.g-card-img img'),
            q('.g-rise')].filter(Boolean);
  });
  r.forEach(x=>console.log(`  ${x.sel.padEnd(22)} ${x.dur.padEnd(22)} ${x.ease}`));
  await b.close();
})();
