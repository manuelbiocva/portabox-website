const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 1000 } });
  await p.goto('https://stivio.ai/', { waitUntil: 'networkidle', timeout: 90000 });
  await p.waitForTimeout(3000);

  for (let i = 0; i < 6; i++) {
    await p.screenshot({ path: `research/stivio-${i}.png` });
    await p.evaluate(() => window.scrollBy(0, window.innerHeight * 0.92));
    await p.waitForTimeout(1100);
  }

  const d = await p.evaluate(() => {
    const norm = c => { if(!c||c==='rgba(0, 0, 0, 0)') return null; const m=c.match(/\d+/g); if(!m) return c;
      const [r,g,bl,a]=m.map(Number); if(a!==undefined&&a<1) return c;
      return '#'+[r,g,bl].map(v=>v.toString(16).padStart(2,'0')).join(''); };
    const freq=(o)=>Object.entries(o).sort((a,b)=>b[1]-a[1]).slice(0,12);
    const bg={},col={},fnt={},rad={},sz={};
    document.querySelectorAll('body *').forEach(el=>{
      const r=el.getBoundingClientRect(); if(r.width<3||r.height<3) return;
      const cs=getComputedStyle(el);
      const B=norm(cs.backgroundColor), C=norm(cs.color);
      if(B) bg[B]=(bg[B]||0)+1; if(C) col[C]=(col[C]||0)+1;
      fnt[cs.fontFamily.split(',')[0]]=(fnt[cs.fontFamily.split(',')[0]]||0)+1;
      if(cs.borderRadius!=='0px') rad[cs.borderRadius]=(rad[cs.borderRadius]||0)+1;
      if(el.textContent&&el.textContent.trim().length>1) sz[cs.fontSize+'|'+cs.fontWeight]=(sz[cs.fontSize+'|'+cs.fontWeight]||0)+1;
    });
    const heads=[...document.querySelectorAll('h1,h2,h3')].slice(0,12).map(h=>{
      const cs=getComputedStyle(h);
      return {tag:h.tagName,size:cs.fontSize,w:cs.fontWeight,lh:cs.lineHeight,tr:cs.letterSpacing,
              tf:cs.textTransform,txt:h.textContent.trim().slice(0,62)};});
    const secs=[...document.querySelectorAll('section,[class*=section]')].slice(0,14).map(s=>{
      const cs=getComputedStyle(s); const r=s.getBoundingClientRect();
      return {h:Math.round(r.height), pad:cs.padding, bg:norm(cs.backgroundColor),
              cls:(s.className||'').toString().slice(0,44)};});
    const nav=[...document.querySelectorAll('nav a, header a')].slice(0,16).map(a=>a.textContent.trim()).filter(Boolean);
    return {bg:freq(bg),col:freq(col),fnt:freq(fnt),rad:freq(rad),sz:freq(sz),heads,secs,nav,
            bodyBg:norm(getComputedStyle(document.body).backgroundColor),
            bodyFont:getComputedStyle(document.body).fontFamily,
            maxW:(()=>{const m={};document.querySelectorAll('div').forEach(el=>{const w=getComputedStyle(el).maxWidth; if(w!=='none') m[w]=(m[w]||0)+1;});return freq(m);})()};
  });
  fs.writeFileSync('research/concourse.json', JSON.stringify(d,null,2));
  console.log('BODY', d.bodyBg, '|', d.bodyFont.slice(0,50));
  console.log('NAV:', d.nav.join(' · '));
  console.log('\nBG:'); d.bg.forEach(x=>console.log('  ',x[0],x[1]));
  console.log('\nTEXT:'); d.col.slice(0,6).forEach(x=>console.log('  ',x[0],x[1]));
  console.log('\nFONTS:'); d.fnt.slice(0,5).forEach(x=>console.log('  ',x[1],'x',x[0]));
  console.log('\nRADII:'); d.rad.slice(0,7).forEach(x=>console.log('  ',x[0],x[1]));
  console.log('\nMAXW:'); d.maxW.slice(0,5).forEach(x=>console.log('  ',x[0],x[1]));
  console.log('\nHEADS:'); d.heads.forEach(h=>console.log(`   ${h.tag} ${h.size} w${h.w} lh${h.lh} tr${h.tr} ${h.tf} | ${h.txt}`));
  console.log('\nSECTIONS:'); d.secs.forEach(s=>console.log(`   h=${s.h} pad=${s.pad} bg=${s.bg} ${s.cls}`));
  await b.close();
})();
