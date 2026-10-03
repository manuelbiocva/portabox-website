const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const BASE = 'http://127.0.0.1:8899';
const { pageUrls } = require('./pages.cjs');
const files = pageUrls();   // served URL paths, nested per the scope's sitemap

/* Braces, before the browser gets involved.
   Deleting CSS rules by filtering lines is how a stylesheet ends up with a
   rule's opening line gone and its declarations orphaned into whatever came
   before. The page still loads, nothing errors, and a hero field quietly
   turns white. The browser cannot report that; counting braces can. */
function cssBalance() {
  const css = fs.readFileSync(path.join('site', 'assets', 'css', 'giga.css'), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '');
  let depth = 0, stray = 0;
  for (const ch of css) {
    if (ch === '{') depth++;
    else if (ch === '}') { depth--; if (depth < 0) { stray++; depth = 0; } }
  }
  return { stray, open: depth };
}

(async () => {
  const braces = cssBalance();
  const b = await chromium.launch();
  const p = await b.newPage({ viewport:{width:1440,height:1000} });
  const bad404 = new Set(), errs = [];
  p.on('response', r => { if (r.status() >= 400) bad404.add(r.status()+' '+r.url().replace(BASE,'')); });
  p.on('pageerror', e => errs.push(e.message));
  p.on('console', m => { if (m.type()==='error') errs.push(m.text()); });

  let overflow = [], brokenLinks = new Set(), missingImg = [];
  for (const f of files) {
    await p.goto(BASE+f, { waitUntil:'networkidle' });
    await p.waitForTimeout(700);

    /* /get-a-quote/ redirects to the quote app, which is a separate
       deployment with its own tests. Checking that the redirect fires is this
       file's job; auditing what it lands on is not. */
    if (!p.url().startsWith(BASE)) {
      console.log('  redirect ok       :', f, '->', p.url());
      continue;
    }

    const r = await p.evaluate(() => {
      const ov = document.documentElement.scrollWidth - document.documentElement.clientWidth;
      const imgs = [...document.querySelectorAll('img')].filter(i=>!i.complete||i.naturalWidth===0).map(i=>i.getAttribute('src'));
      const links = [...document.querySelectorAll('a[href]')].map(a=>a.getAttribute('href'))
        .filter(h=>h && !/^(https?:|tel:|mailto:|sms:|#)/.test(h));
      return { ov, imgs, links:[...new Set(links)] };
    });
    if (r.ov > 0) overflow.push(f+':'+r.ov);
    r.imgs.forEach(i=>missingImg.push(f+' -> '+i));
    r.links.forEach(l => { if (!fs.existsSync(path.join('site', l.split('#')[0]))) brokenLinks.add(l+'  (from '+f+')'); });
  }

  // mobile sweep on 3 representative pages
  const m = await b.newPage({ viewport:{width:390,height:844}, isMobile:true, hasTouch:true });
  let movf = [];
  for (const f of ['/','/storage/self-storage/','/locations/melbourne/']) {
    await m.goto(BASE+f, { waitUntil:'networkidle' }); await m.waitForTimeout(600);
    const ov = await m.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
    if (ov>0) movf.push(f+':'+ov);
  }

  // Links built in JavaScript never appear in markup, so the link crawl cannot
  // see them. After the move to nested routes, any flat .html literal in the
  // runtime script is a stale path.
  const jsStale = (fs.readFileSync('site/assets/js/giga.js', 'utf8').match(/"[a-z0-9-]+\.html"/g) || []);
  console.log('pages checked      :', files.length);
  console.log('css braces         :', braces.stray || braces.open
    ? `UNBALANCED — ${braces.stray} stray close(s), ${braces.open} left open`
    : 'balanced');
  console.log('stale paths in js  :', jsStale.length ? [...new Set(jsStale)].join(', ') : 'none');
  console.log('desktop overflow   :', overflow.length?overflow.join(', '):'none');
  console.log('mobile overflow    :', movf.length?movf.join(', '):'none');
  console.log('broken local links :', brokenLinks.size?[...brokenLinks].join('\n                     '):'none');
  console.log('images not loaded  :', missingImg.length?missingImg.slice(0,8).join('\n                     '):'none');
  console.log('http >=400         :', bad404.size?[...bad404].slice(0,8).join(', '):'none');
  console.log('js errors          :', errs.length?[...new Set(errs)].slice(0,5).join(' | '):'none');
  await b.close();
})();
