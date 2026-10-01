const { chromium } = require('playwright');
const B='http://127.0.0.1:8899/';
const files=['index.html','storage-at-your-place.html','victoria.html','pricing.html'];
(async()=>{
  const b=await chromium.launch();
  const p=await b.newPage({viewport:{width:1440,height:1000}});
  const bad=[];
  for(const f of files){
    await p.goto(B+f,{waitUntil:'networkidle'}); await p.waitForTimeout(900);
    // force every reveal visible so nothing is skipped
    await p.evaluate(()=>document.querySelectorAll('.rv').forEach(e=>e.classList.add('in')));
    const res=await p.evaluate(()=>{
      const L=h=>{const f=c=>c<=.03928?c/12.92:Math.pow((c+.055)/1.055,2.4);
        return .2126*f(h[0]/255)+.7152*f(h[1]/255)+.0722*f(h[2]/255);};
      const parse=c=>{const m=c.match(/[\d.]+/g);return m?m.slice(0,3).map(Number):null;};
      const bgOf=el=>{let n=el;while(n&&n!==document.documentElement){
        const c=getComputedStyle(n).backgroundColor;const m=c.match(/[\d.]+/g);
        if(m&&(m.length<4||Number(m[3])>0.85))return parse(c);n=n.parentElement;}return [255,255,255];};
      const out=[];
      document.querySelectorAll('body *').forEach(el=>{
        const r=el.getBoundingClientRect(); if(r.width<3||r.height<3) return;
        const hasText=[...el.childNodes].some(n=>n.nodeType===3&&n.textContent.trim().length>1);
        if(!hasText) return;
        const cs=getComputedStyle(el);
        if(cs.visibility==='hidden'||cs.opacity==='0') return;
        const fg=parse(cs.color), bg=bgOf(el);
        if(!fg||!bg) return;
        const l1=Math.max(L(fg),L(bg)), l2=Math.min(L(fg),L(bg));
        const ratio=(l1+.05)/(l2+.05);
        const px=parseFloat(cs.fontSize), wt=parseInt(cs.fontWeight)||400;
        const large=px>=24||(px>=18.66&&wt>=700);
        const need=large?3:4.5;
        if(ratio<need) out.push({t:el.textContent.trim().slice(0,38),
          fg:cs.color,bg:'rgb('+bg.join(',')+')',r:ratio.toFixed(2),need,px,wt,
          sel:el.tagName.toLowerCase()+'.'+(el.className||'').toString().split(' ').slice(0,2).join('.')});
      });
      return out;
    });
    res.forEach(x=>bad.push({f,...x}));
  }
  if(!bad.length) console.log('PASS — no real contrast failures in the rendered DOM');
  else { console.log('FAILURES:'); bad.slice(0,20).forEach(x=>
    console.log(`  ${x.f} ${x.sel}\n     "${x.t}" ${x.fg} on ${x.bg} = ${x.r} (need ${x.need}) ${x.px}px/${x.wt}`)); }
  await b.close();
})();
