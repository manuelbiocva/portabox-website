const { chromium } = require('playwright');
(async()=>{
  const b=await chromium.launch();
  const p=await b.newPage({viewport:{width:1440,height:1000}});
  await p.goto('https://www.concourse.ai/',{waitUntil:'networkidle',timeout:90000});
  await p.waitForTimeout(2500);
  for(let i=0;i<10;i++){ await p.evaluate(()=>window.scrollBy(0,700)); await p.waitForTimeout(280); }
  await p.evaluate(()=>window.scrollTo(0,0)); await p.waitForTimeout(800);

  const d=await p.evaluate(()=>{
    const norm=c=>{if(!c||c==='rgba(0, 0, 0, 0)')return null;const m=c.match(/[\d.]+/g);if(!m)return c;
      const[r,g,bl,a]=m.map(Number); if(a!==undefined&&a<1)return c;
      return '#'+[r,g,bl].map(v=>v.toString(16).padStart(2,'0')).join('');};

    // Buttons / links that look like buttons
    const btns=[...document.querySelectorAll('a,button')].filter(e=>{
      const r=e.getBoundingClientRect(); const cs=getComputedStyle(e);
      return r.height>28&&r.width>70&&(cs.backgroundColor!=='rgba(0, 0, 0, 0)'||cs.borderWidth!=='0px');
    }).slice(0,14).map(e=>{const cs=getComputedStyle(e);return{
      txt:e.textContent.trim().slice(0,26), r:cs.borderRadius, bg:norm(cs.backgroundColor),
      fg:norm(cs.color), bd:cs.border, pad:cs.padding, fs:cs.fontSize, fw:cs.fontWeight,
      h:Math.round(e.getBoundingClientRect().height)};});

    // Card-like containers
    const cards=[...document.querySelectorAll('div,article,li')].filter(e=>{
      const r=e.getBoundingClientRect(); const cs=getComputedStyle(e);
      return r.width>220&&r.width<640&&r.height>150&&
        (cs.borderRadius!=='0px'||cs.borderWidth!=='0px'||cs.backgroundColor!=='rgba(0, 0, 0, 0)');
    }).slice(0,16).map(e=>{const cs=getComputedStyle(e);return{
      r:cs.borderRadius, bg:norm(cs.backgroundColor), bd:cs.border, sh:cs.boxShadow.slice(0,54),
      pad:cs.padding, w:Math.round(e.getBoundingClientRect().width),
      h:Math.round(e.getBoundingClientRect().height),
      cls:(e.className||'').toString().slice(0,52)};});

    // Images inside cards
    const imgs=[...document.querySelectorAll('img')].slice(0,10).map(i=>({
      r:getComputedStyle(i).borderRadius, w:Math.round(i.getBoundingClientRect().width)}));

    const radii={};
    document.querySelectorAll('body *').forEach(e=>{const r=getComputedStyle(e).borderRadius;
      if(r&&r!=='0px') radii[r]=(radii[r]||0)+1;});
    return {btns,cards,imgs,radii:Object.entries(radii).sort((a,b)=>b[1]-a[1]).slice(0,10)};
  });

  console.log('=== RADII (whole page) ==='); d.radii.forEach(r=>console.log('  ',r[0],'x',r[1]));
  console.log('\n=== BUTTONS ===');
  d.btns.forEach(x=>console.log(`  r=${x.r.padEnd(8)} h=${String(x.h).padEnd(4)} bg=${String(x.bg).padEnd(9)} fg=${String(x.fg).padEnd(9)} ${x.fs}/${x.fw} pad=${x.pad.padEnd(20)} bd=${x.bd.slice(0,22).padEnd(24)} "${x.txt}"`));
  console.log('\n=== CARDS ===');
  d.cards.forEach(x=>console.log(`  r=${x.r.padEnd(8)} ${String(x.w)}x${x.h} bg=${String(x.bg).padEnd(9)} pad=${x.pad.slice(0,18).padEnd(20)} bd=${x.bd.slice(0,26).padEnd(28)} sh=${x.sh.slice(0,26)} | ${x.cls}`));
  console.log('\n=== IMAGES ==='); d.imgs.forEach(i=>console.log('  r=',i.r,'w=',i.w));
  await b.close();
})();
