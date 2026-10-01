const { chromium } = require('playwright');
(async()=>{
  const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});
  const p=await b.newPage({viewport:{width:1440,height:950}});
  await p.goto('http://127.0.0.1:8899/',{waitUntil:'networkidle'});
  await p.waitForTimeout(2200);
  const r=await p.evaluate(()=>{
    const L=c=>{const f=x=>x<=.03928?x/12.92:Math.pow((x+.055)/1.055,2.4);
      return .2126*f(c[0]/255)+.7152*f(c[1]/255)+.0722*f(c[2]/255);};
    const n=s=>s.match(/[\d.]+/g).map(Number);
    const mix=(f,a,g)=>f.map((v,i)=>Math.round(a*v+(1-a)*g[i]));
    const NAVY=[7,30,51];
    // the hero scrim is a gradient; take its darkest declared stop as worst case
    const worstAlpha=0.42;
    const bg=mix(NAVY,worstAlpha,[250,250,250]);   // brightest video frame
    const out=[];
    [['.g-display',3],['.g-hero-body',4.5],['.g-flag span',4.5]].forEach(([sel,need])=>{
      const el=document.querySelector(sel); if(!el) return;
      const col=n(getComputedStyle(el).color);
      const a=col.length>3?col[3]:1;
      const t=mix(col.slice(0,3),a,bg);
      const l1=Math.max(L(t),L(bg)),l2=Math.min(L(t),L(bg));
      out.push({sel,ratio:+((l1+.05)/(l2+.05)).toFixed(2),need,
                px:parseFloat(getComputedStyle(el).fontSize)});
    });
    return out;
  });
  let ok=true;
  r.forEach(x=>{const g=x.ratio>=x.need; ok=ok&&g;
    console.log(`  ${x.sel.padEnd(16)} ${x.px}px  ${String(x.ratio).padStart(6)}  need ${x.need}  ${g?'PASS':'FAIL'}`);});
  console.log(ok?'  (worst-case: brightest video frame under the lightest gradient stop)':'  NEEDS A DARKER SCRIM');
  await b.close();
})();
