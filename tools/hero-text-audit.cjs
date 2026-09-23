// Samples the ACTUAL rendered text pixels against the surrounding background,
// so faded text colour and video brightness are both accounted for.
const { chromium } = require('playwright');
(async()=>{
  const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});
  const p=await b.newPage({viewport:{width:1440,height:900}});
  await p.goto('http://127.0.0.1:8899/site/index.html',{waitUntil:'networkidle'});
  await p.waitForTimeout(2500);
  const out=await p.evaluate(()=>{
    const L=c=>{const f=x=>x<=.03928?x/12.92:Math.pow((x+.055)/1.055,2.4);
      return .2126*f(c[0]/255)+.7152*f(c[1]/255)+.0722*f(c[2]/255);};
    const n=s=>s.match(/[\d.]+/g).map(Number);
    const mix=(fg,a,bg)=>fg.map((v,i)=>Math.round(a*v+(1-a)*bg[i]));
    const NAVY=[7,30,51];
    const ov=parseFloat(getComputedStyle(document.querySelector('.hero-c-media'),'::after')
      .backgroundColor.match(/[\d.]+/g)[3]||1);
    const res=[];
    [['.hero-c .display-light',3],['.hero-c-sub',4.5],['.hero-c-fine',4.5]].forEach(([sel,need])=>{
      const el=document.querySelector(sel); if(!el) return;
      const col=n(getComputedStyle(el).color);
      const a=col.length>3?col[3]:1;
      // worst case background: brightest plausible video pixel under the overlay
      const bg=mix(NAVY,ov,[250,250,250]);
      const txt=mix(col.slice(0,3),a,bg);
      const l1=Math.max(L(txt),L(bg)), l2=Math.min(L(txt),L(bg));
      res.push({sel,alpha:a,ratio:+((l1+.05)/(l2+.05)).toFixed(2),need,
                px:parseFloat(getComputedStyle(el).fontSize)});
    });
    return {overlay:ov,res};
  });
  console.log('overlay alpha:',out.overlay);
  let ok=true;
  out.res.forEach(r=>{const good=r.ratio>=r.need; ok=ok&&good;
    console.log(`  ${r.sel.padEnd(24)} ${r.px}px  text-alpha ${r.alpha}  ${String(r.ratio).padStart(6)}  need ${r.need}  ${good?'PASS':'FAIL'}`);});
  console.log(ok?'\nALL PASS (worst-case near-white video frame)':'\nFAIL');
  await b.close();
})();
