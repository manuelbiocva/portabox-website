const { chromium } = require('playwright');
(async()=>{
  const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});
  const p=await b.newPage({viewport:{width:1440,height:950}});
  await p.goto('http://127.0.0.1:8899/',{waitUntil:'networkidle'});
  await p.waitForTimeout(2000);
  await p.addStyleTag({content:'*{transition:none!important;animation:none!important}'});
  await p.evaluate(()=>document.querySelectorAll('.g-rise,.g-wipe').forEach(e=>e.classList.add('in')));
  await p.waitForTimeout(400);
  const AUDIT=()=>{
    const L=c=>{const f=x=>x<=.03928?x/12.92:Math.pow((x+.055)/1.055,2.4);
      return .2126*f(c[0]/255)+.7152*f(c[1]/255)+.0722*f(c[2]/255);};
    const n=s=>{const m=s.match(/[\d.]+/g);return m?m.map(Number):null;};
    const op=el=>{let o=1,x=el;while(x&&x!==document.body){o*=parseFloat(getComputedStyle(x).opacity||1);x=x.parentElement;}return o;};
    const solid=el=>{let x=el;while(x&&x!==document.documentElement){
      const c=getComputedStyle(x).backgroundColor,m=n(c);
      if(m&&(m.length<4||m[3]>.85))return m.slice(0,3); x=x.parentElement;}return[255,255,255];};
    const mix=(f,a,g)=>f.map((v,i)=>Math.round(a*v+(1-a)*g[i]));
    const out=[];
    document.querySelectorAll('.g *').forEach(el=>{
      if(el.closest('.g-hero')||el.closest('.g-nav')||el.closest('.g-card-img')) return;
      // SVG illustration text is painted with fill, not color, and sits on
      // shapes rather than a CSS background, so this method cannot read it.
      if(el.ownerSVGElement||el.tagName==='svg') return;
      // Text that is currently invisible (the journey's quote panel rests at
      // opacity 0) measures as 1.00; it is audited in the visible pass below.
      if(op(el)<0.05) return;
      const r=el.getBoundingClientRect(); if(r.width<3||r.height<3) return;
      if(![...el.childNodes].some(t=>t.nodeType===3&&t.textContent.trim().length>1)) return;
      const cs=getComputedStyle(el); if(cs.visibility==='hidden') return;
      const col=n(cs.color); if(!col) return;
      const bg=solid(el);
      const a=(col.length>3?col[3]:1)*op(el);
      const t=mix(col.slice(0,3),a,bg);
      const l1=Math.max(L(t),L(bg)),l2=Math.min(L(t),L(bg));
      const ra=(l1+.05)/(l2+.05);
      const px=parseFloat(cs.fontSize),wt=parseInt(cs.fontWeight)||400;
      const need=(px>=24||(px>=18.66&&wt>=700))?3:4.5;
      if(ra<need) out.push(`${(el.className||el.tagName).toString().slice(0,34)} "${el.textContent.trim().slice(0,26)}" ${ra.toFixed(2)}<${need} ${px}px/${wt}`);
    });
    return [...new Set(out)];
  };
  await p.evaluate(`window.__auditPass = ${AUDIT.toString()}`);
  const bad=await p.evaluate(()=>window.__auditPass());
  // The journey's quote panel only exists at the end of the timeline, so audit
  // it again with that end state forced on.
  await p.evaluate(()=>{const q=document.getElementById('pj-quote');
    if(q){q.style.opacity=1;q.style.pointerEvents='auto';}
    const c=document.getElementById('pj-stepsCol'); if(c)c.style.opacity=0;});
  await p.waitForTimeout(200);
  const bad2=await p.evaluate(()=>window.__auditPass());
  bad2.forEach(x=>{ if(!bad.includes(x)) bad.push(x+' [quote panel]'); });
  console.log(bad.length? 'FAILURES:\n  '+bad.slice(0,12).join('\n  ') : 'PASS — all non-hero text clears its threshold');
  await b.close();
})();
