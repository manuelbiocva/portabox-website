/* Scrub the How-it-works journey and capture a frame at each beat. */
const { chromium } = require('playwright');
const path = require('path');
const { pathToFileURL } = require('url');

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  await p.goto(pathToFileURL(path.resolve('site/' + (process.argv[2]||'index') + '.html')).href);
  await p.waitForTimeout(500);

  const beats = [0.02, 0.17, 0.3, 0.45, 0.62, 0.76, 0.92, 0.99];
  for (const target of beats) {
    await p.evaluate((t) => {
      const track = document.getElementById('pj-journey');
      const bar = document.querySelector('.g-nav');
      const top = bar ? bar.offsetHeight : 0;
      const r = track.getBoundingClientRect();
      const total = r.height - (window.innerHeight - top);
      const y = window.scrollY + r.top - top + total * t;
      window.scrollTo(0, y);
    }, target);
    await p.waitForTimeout(260);

    const s = await p.evaluate(() => {
      const num = (el, i) => {
        const m = (el.getAttribute('transform') || '').match(/translate\(([-\d.]+),\s*([-\d.]+)\)/);
        return m ? +m[i] : null;
      };
      const step = [...document.querySelectorAll('.g-pj-step')].findIndex(s => s.classList.contains('on'));
      return {
        truckX: num(document.getElementById('pj-truck'), 1),
        contY: num(document.getElementById('pj-container'), 2),
        doorY: num(document.getElementById('pj-door'), 2),
        boxes: [...document.querySelectorAll('#pj-items use')].filter(u => +u.style.opacity > 0).length,
        rail: document.getElementById('pj-rail').style.transform,
        chip: document.getElementById('pj-chipStep').textContent,
        step: step + 1,
        quote: +getComputedStyle(document.getElementById('pj-quote')).opacity,
      };
    });
    console.log(
      `p=${String(target).padEnd(5)} truckX=${String(s.truckX).padStart(7)} contY=${String(s.contY).padStart(6)}` +
      ` door=${String(s.doorY).padStart(6)} boxes=${s.boxes} step=${s.step} quote=${s.quote.toFixed(2)}  "${s.chip}"`
    );
    // Viewport capture: locator.screenshot() scrolls the element into view,
    // which moves scroll position and re-renders the timeline mid-capture.
    await p.screenshot({ path: `tools/journey-${String(Math.round(target * 100)).padStart(2, '0')}.png` });
  }
  console.log('page errors:', errs.length ? errs : 'none');
  await b.close();
})();
