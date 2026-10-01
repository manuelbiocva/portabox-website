const { chromium } = require('playwright');
function L(c){const f=x=>x<=.03928?x/12.92:Math.pow((x+.055)/1.055,2.4);
  return .2126*f(c[0]/255)+.7152*f(c[1]/255)+.0722*f(c[2]/255);}
function cr(a,b){const l1=Math.max(L(a),L(b)),l2=Math.min(L(a),L(b));return (l1+.05)/(l2+.05);}
const n=s=>s.match(/[\d.]+/g).map(Number);
(async()=>{
  const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});
  const p=await b.newPage({viewport:{width:1440,height:950},deviceScaleFactor:2});
  await p.goto('http://127.0.0.1:8899/',{waitUntil:'networkidle'});
  await p.waitForTimeout(1800);

  for (const state of ['top','stuck']) {
    if (state==='stuck'){ await p.evaluate(()=>window.scrollTo(0,1500)); await p.waitForTimeout(900); }
    const btn = await p.$('.g-nav .g-btn--ghost');
    await btn.hover(); await p.waitForTimeout(700);
    const r = await p.evaluate(()=>{
      const e=document.querySelector('.g-nav .g-btn--ghost');
      const cs=getComputedStyle(e), i=getComputedStyle(e.querySelector('i svg'));
      return {color:cs.color, bg:cs.backgroundColor, border:cs.borderColor, icon:i.color};
    });
    const ratio = cr(n(r.color).slice(0,3), n(r.bg).slice(0,3)).toFixed(2);
    console.log(`${state.padEnd(6)} hover  text=${r.color.padEnd(20)} bg=${r.bg.padEnd(20)} icon=${r.icon.padEnd(20)} contrast=${ratio}`);
    const bb=await btn.boundingBox();
    await p.screenshot({path:`research/shots/gg-ghost-${state}.png`,
      clip:{x:bb.x-10,y:bb.y-10,width:bb.width+20,height:bb.height+20}});
  }
  await b.close();
})();
