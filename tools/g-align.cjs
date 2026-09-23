const { chromium } = require('playwright');
(async()=>{
  const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});
  const p=await b.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:2});
  await p.goto('http://127.0.0.1:8899/site/index.html',{waitUntil:'networkidle'});
  await p.waitForTimeout(1800);
  await p.addStyleTag({content:'.g-rise,.g-wipe{opacity:1!important;transform:none!important}'});
  const how=(await p.$$('.g-index'))[0];
  await how.scrollIntoViewIfNeeded(); await p.waitForTimeout(600);
  const row=(await how.$$('.g-row'))[0];
  await row.hover(); await p.waitForTimeout(800);

  const m=await p.evaluate(()=>{
    const sec=document.querySelector('#how');
    const h2=sec.querySelector('.g-h2').getBoundingClientRect().left;
    const lbl=sec.querySelector('.g-label').getBoundingClientRect().left;
    const idx=sec.querySelector('.g-index').getBoundingClientRect().left;
    const r=sec.querySelector('.g-row');
    const rb=r.getBoundingClientRect();
    const n=r.querySelector('.g-row-n').getBoundingClientRect().left;
    // the bar is ::after, positioned at left:0 of the row
    const barLeft = rb.left + parseFloat(getComputedStyle(r,'::after').left || 0);
    return {heading:Math.round(h2), label:Math.round(lbl), indexRule:Math.round(idx),
            row:Math.round(rb.left), number:Math.round(n), bar:Math.round(barLeft)};
  });
  console.log('left edges @1440:');
  Object.entries(m).forEach(([k,v])=>console.log(`  ${k.padEnd(11)} ${v}`));
  const aligned = new Set([m.heading,m.label,m.indexRule,m.row,m.bar]).size===1;
  console.log('\nheading / label / rules / row / accent bar all aligned:', aligned);

  const bb=await how.boundingBox();
  await p.screenshot({path:'research/shots/gg-align.png',clip:{x:0,y:bb.y-140,width:1440,height:Math.min(bb.height+180,560)}});
  await b.close();
})();
