const { chromium } = require('playwright');
(async()=>{
  const b=await chromium.launch();
  const p=await b.newPage({viewport:{width:1440,height:1000}});
  await p.goto('http://127.0.0.1:8899/site/index.html',{waitUntil:'networkidle'});
  await p.waitForTimeout(1300);
  await p.addStyleTag({content:'*{transition:none !important;animation:none !important}'});
  await p.evaluate(()=>document.querySelectorAll('.rv').forEach(e=>e.classList.add('in')));
  await p.waitForTimeout(600);
  const res=await p.evaluate(()=>{
    const L=c=>{const f=x=>x<=.03928?x/12.92:Math.pow((x+.055)/1.055,2.4);
      return .2126*f(c[0]/255)+.7152*f(c[1]/255)+.0722*f(c[2]/255);};
    const num=s=>{const m=s.match(/[\d.]+/g);return m?m.map(Number):null;};
    const over=(fg,a,bg)=>fg.map((v,i)=>Math.round(a*v+(1-a)*bg[i]));
    const ratio=(a,b)=>{const l1=Math.max(L(a),L(b)),l2=Math.min(L(a),L(b));return (l1+.05)/(l2+.05);};
    // opacity accumulates down the tree
    const effOpacity=el=>{let o=1,n=el;while(n&&n!==document.body){o*=parseFloat(getComputedStyle(n).opacity||1);n=n.parentElement;}return o;};
    const solidBg=el=>{let n=el;while(n&&n!==document.documentElement){
      const c=getComputedStyle(n).backgroundColor,m=num(c);
      if(m&&(m.length<4||m[3]>.85))return m.slice(0,3); n=n.parentElement;} return [255,255,255];};
    const out=[];
    document.querySelectorAll('.band--cyan *, .trust--cyan *').forEach(el=>{
      const r=el.getBoundingClientRect(); if(r.width<3||r.height<3) return;
      if(![...el.childNodes].some(n=>n.nodeType===3&&n.textContent.trim().length>0)) return;
      const cs=getComputedStyle(el); if(cs.visibility==='hidden') return;
      const col=num(cs.color); if(!col) return;
      const bg=solidBg(el);
      const alpha=(col.length>3?col[3]:1)*effOpacity(el);
      const eff=over(col.slice(0,3),alpha,bg);
      const px=parseFloat(cs.fontSize), wt=parseInt(cs.fontWeight)||400;
      const need=(px>=24||(px>=18.66&&wt>=700))?3:4.5;
      const ra=ratio(eff,bg);
      if(ra<need) out.push(`${el.tagName.toLowerCase()}.${(el.className||'').toString().split(' ')[0]} "${el.textContent.trim().slice(0,26)}" ${ra.toFixed(2)}<${need} ${px}px/${wt} a=${alpha.toFixed(2)}`);
    });
    return out;
  });
  console.log(res.length? 'FAILURES:\n  '+res.join('\n  ') : 'PASS - every element on cyan clears its threshold');
  await b.close();
})();
