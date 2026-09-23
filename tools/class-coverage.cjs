// Every class used in the generated HTML must exist in the stylesheet.
const fs=require('fs');
const css=fs.readFileSync('site/assets/css/portabox.css','utf8');
const files=fs.readdirSync('site').filter(f=>f.endsWith('.html'));
const used=new Set();
for(const f of files){
  const h=fs.readFileSync('site/'+f,'utf8');
  for(const m of h.matchAll(/class="([^"]+)"/g))
    m[1].split(/\s+/).filter(Boolean).forEach(c=>used.add(c));
}
const missing=[...used].filter(c=>!css.includes('.'+c));
console.log('distinct classes used :', used.size);
console.log('not found in CSS      :', missing.length? missing.join(', ') : 'none');
// and the reverse: variant-B leftovers that nothing uses any more
const dead=['hero-b','hero-b-copy','fig-table','fig-row','svc-list','svc-row','pick-card','pick-grid']
  .filter(c=>css.includes('.'+c));
console.log('dead variant-B/chooser CSS still present :', dead.length? dead.join(', ') : 'none');
