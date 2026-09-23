const { chromium } = require('playwright');
const fs = require('fs');
(async()=>{
  const b=await chromium.launch();
  const p=await b.newPage({viewport:{width:1440,height:950}});
  const scripts=[];
  p.on('request',r=>{const u=r.url(); if(/\.js(\?|$)/.test(u))scripts.push(u.split('/').pop().slice(0,60));});
  await p.goto('https://www.gigaenergy.com/',{waitUntil:'networkidle',timeout:90000});
  await p.waitForTimeout(3500);
  const H=await p.evaluate(()=>document.body.scrollHeight);
  for(let i=0;i<=8;i++){
    await p.evaluate(v=>window.scrollTo(0,v), Math.round((H-950)*(i/8)));
    await p.waitForTimeout(1300);
    await p.screenshot({path:`research/giga/g-${i}.png`});
  }
  await p.evaluate(()=>window.scrollTo(0,0)); await p.waitForTimeout(1200);

  const d=await p.evaluate(()=>{
    const norm=c=>{if(!c||c==='rgba(0, 0, 0, 0)')return null;const m=c.match(/[\d.]+/g);if(!m)return c;
      const[r,g,bl,a]=m.map(Number); if(a!==undefined&&a<1)return c;
      return '#'+[r,g,bl].map(v=>v.toString(16).padStart(2,'0')).join('');};
    const top=(o,n=12)=>Object.entries(o).sort((a,b)=>b[1]-a[1]).slice(0,n);
    const bg={},col={},fnt={},rad={},sz={},tr={};
    document.querySelectorAll('body *').forEach(el=>{
      const r=el.getBoundingClientRect(); if(r.width<3||r.height<3)return;
      const cs=getComputedStyle(el);
      const B=norm(cs.backgroundColor),C=norm(cs.color);
      if(B)bg[B]=(bg[B]||0)+1; if(C)col[C]=(col[C]||0)+1;
      fnt[cs.fontFamily.split(',')[0].replace(/["']/g,'')]=(fnt[cs.fontFamily.split(',')[0]]||0)+1;
      if(cs.borderRadius!=='0px')rad[cs.borderRadius]=(rad[cs.borderRadius]||0)+1;
      if(el.textContent&&el.textContent.trim().length>1)sz[cs.fontSize+'|'+cs.fontWeight]=(sz[cs.fontSize+'|'+cs.fontWeight]||0)+1;
      if(cs.transitionDuration&&cs.transitionDuration!=='0s')tr[cs.transitionTimingFunction.slice(0,46)]=(tr[cs.transitionTimingFunction.slice(0,46)]||0)+1;
    });
    const heads=[...document.querySelectorAll('h1,h2,h3')].slice(0,12).map(h=>{const cs=getComputedStyle(h);
      return `${h.tagName} ${cs.fontSize} w${cs.fontWeight} lh${cs.lineHeight} tr${cs.letterSpacing} ${cs.textTransform} | ${h.textContent.trim().replace(/\s+/g,' ').slice(0,60)}`;});
    const secs=[...document.querySelectorAll('section,main>div')].slice(0,16).map(s=>{
      const cs=getComputedStyle(s),r=s.getBoundingClientRect();
      return `h=${String(Math.round(r.height)).padStart(5)} ${cs.position.padEnd(8)} bg=${String(norm(cs.backgroundColor)).padEnd(9)} pad=${cs.padding.slice(0,24).padEnd(26)} ${(s.className||'').toString().slice(0,44)}`;});
    return {title:document.title, bodyBg:norm(getComputedStyle(document.body).backgroundColor),
      bodyFont:getComputedStyle(document.body).fontFamily, htmlCls:document.documentElement.className.slice(0,60),
      bg:top(bg),col:top(col,8),fnt:top(fnt,6),rad:top(rad,8),sz:top(sz,14),tr:top(tr,5),heads,secs,
      maxw:top((()=>{const m={};document.querySelectorAll('div').forEach(e=>{const w=getComputedStyle(e).maxWidth;if(w!=='none')m[w]=(m[w]||0)+1;});return m;})(),5),
      sticky:[...document.querySelectorAll('*')].filter(e=>['sticky','fixed'].includes(getComputedStyle(e).position)).length};
  });
  fs.writeFileSync('research/giga/meta.json',JSON.stringify(d,null,2));
  console.log('TITLE:',d.title,'| body',d.bodyBg,'|',d.bodyFont.slice(0,40),'| html:',d.htmlCls);
  console.log('\nFONTS:'); d.fnt.forEach(f=>console.log('  ',f[1],'x',f[0]));
  console.log('\nBG:'); d.bg.forEach(x=>console.log('  ',x[0],x[1]));
  console.log('\nTEXT:'); d.col.forEach(x=>console.log('  ',x[0],x[1]));
  console.log('\nRADII:'); d.rad.forEach(x=>console.log('  ',x[0],x[1]));
  console.log('\nMAXW:'); d.maxw.forEach(x=>console.log('  ',x[0],x[1]));
  console.log('\nSIZES:'); d.sz.forEach(x=>console.log('  ',x[0],x[1]));
  console.log('\nHEADS:'); d.heads.forEach(h=>console.log('  ',h));
  console.log('\nSECTIONS:'); d.secs.forEach(s=>console.log('  ',s));
  console.log('\nEASING:'); d.tr.forEach(x=>console.log('  ',x[1],'x',x[0]));
  console.log('\nsticky/fixed count:',d.sticky);
  console.log('SCRIPTS:',[...new Set(scripts)].slice(0,10).join(', '));
  await b.close();
})();
