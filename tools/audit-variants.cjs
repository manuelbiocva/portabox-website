const { chromium } = require('playwright');
const B='http://127.0.0.1:8899/';
(async()=>{
  const b=await chromium.launch();
  const p=await b.newPage({viewport:{width:1440,height:1000}});
  for(const f of ['index-b.html','index-c.html']){
    await p.goto(B+f,{waitUntil:'networkidle'}); await p.waitForTimeout(1100);
    await p.evaluate(()=>document.querySelectorAll('.rv').forEach(e=>e.classList.add('in')));
    const bad=await p.evaluate(()=>{
      const L=h=>{const f=c=>c<=.03928?c/12.92:Math.pow((c+.055)/1.055,2.4);
        return .2126*f(h[0]/255)+.7152*f(h[1]/255)+.0722*f(h[2]/255);};
      const pa=c=>{const m=c.match(/[\d.]+/g);return m?m.slice(0,3).map(Number):null;};
      const bg=el=>{let n=el;while(n&&n!==document.documentElement){const c=getComputedStyle(n).backgroundColor;
        const m=c.match(/[\d.]+/g); if(m&&(m.length<4||+m[3]>.85))return pa(c); n=n.parentElement;}return[255,255,255];};
      const out=[];
      document.querySelectorAll('body *').forEach(el=>{
        if(el.closest('.nav')) return;
        const r=el.getBoundingClientRect(); if(r.width<3||r.height<3) return;
        if(![...el.childNodes].some(n=>n.nodeType===3&&n.textContent.trim().length>1)) return;
        const cs=getComputedStyle(el); if(cs.visibility==='hidden'||cs.opacity==='0') return;
        const fg=pa(cs.color), b2=bg(el); if(!fg||!b2) return;
        const l1=Math.max(L(fg),L(b2)),l2=Math.min(L(fg),L(b2)); const ra=(l1+.05)/(l2+.05);
        const px=parseFloat(cs.fontSize), wt=parseInt(cs.fontWeight)||400;
        const need=(px>=24||(px>=18.66&&wt>=700))?3:4.5;
        if(ra<need) out.push(`${el.tagName.toLowerCase()}.${(el.className||'').toString().split(' ')[0]} "${el.textContent.trim().slice(0,30)}" ${ra.toFixed(2)}<${need} ${px}px/${wt}`);
      });
      return out;
    });
    console.log(f, bad.length? '\n   '+bad.slice(0,6).join('\n   ') : 'PASS');
  }
  await b.close();
})();
