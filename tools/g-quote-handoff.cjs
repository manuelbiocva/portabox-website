/* The quote itself is the client's own app, deployed separately. What this
   site still owns is the hand-off: every CTA has to reach the app, the retired
   /get-a-quote/ URL has to redirect rather than 404, and a postcode typed into
   a hero box has to arrive with it so nobody is asked twice.

   That last one is the fragile part. It spans three repositories — the CTA URL
   in build/content.js, the redirect in giga.js, and ?postcode= handling in the
   quote app — so it can break from a change in any of them and still look
   perfectly fine on this side.

     node tools/g-quote-handoff.cjs          # needs the local server on 8899
     node tools/g-quote-handoff.cjs --offline  # skips the checks that hit the app

   Replaces g-quoteflow.cjs, which drove the native flow this site used to
   serve at /get-a-quote/.
*/
const { chromium } = require('playwright');
const { pageUrls, BASE } = require('./pages.cjs');
const C = require('../build/content.js');

const APP = C.CONTACT.quoteApp;
const OFFLINE = process.argv.includes('--offline');

const fail = [];
const ok = (cond, msg) => { if (!cond) fail.push(msg); console.log((cond ? '  ok   ' : '  FAIL ') + msg); };

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 1000 } });
  const errs = [];
  p.on('pageerror', (e) => errs.push(String(e).slice(0, 120)));
  p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text().slice(0, 120)); });

  console.log('every page reaches the app, and nothing points at the retired page');
  let toApp = 0, stale = [], bare = [];
  for (const url of pageUrls()) {
    await p.goto(BASE + url, { waitUntil: 'domcontentloaded' });
    if (!p.url().startsWith(BASE)) continue;        // the redirect page itself
    const hrefs = await p.evaluate(() =>
      [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')));
    const mine = hrefs.filter((h) => h === APP);
    toApp += mine.length;
    if (!mine.length) bare.push(url);
    hrefs.filter((h) => /^\/get-a-quote\/?$/.test(h)).forEach(() => stale.push(url));
  }
  ok(toApp > 0, 'links to the quote app across the site (' + toApp + ')');
  ok(bare.length === 0, 'every page offers the quote (' + (bare.join(', ') || 'none missing') + ')');
  /* The CTAs are all generated from one constant, so a stale link here means
     something bypassed it rather than that one button was missed. */
  ok(stale.length === 0, 'no link still points at the retired /get-a-quote/ (' + (stale[0] || '') + ')');

  console.log('\nthe hero postcode box carries the postcode over');
  await p.goto(BASE + '/', { waitUntil: 'networkidle' });
  const dest = await p.locator('.quote-form').first().getAttribute('data-quote');
  ok(dest === APP, 'the form carries the destination as data (' + dest + ')');

  /* An empty or malformed postcode must not send anyone anywhere. */
  await p.locator('.quote-form input').first().fill('12');
  await p.locator('.quote-form button').first().click();
  await p.waitForTimeout(400);
  ok(p.url().startsWith(BASE), 'a short postcode is refused rather than handed over');

  if (!OFFLINE) {
    await p.locator('.quote-form input').first().fill('3000');
    await p.locator('.quote-form button').first().click();
    await p.waitForTimeout(4000);
    ok(p.url() === APP + '?postcode=3000', 'lands on the app with the postcode (' + p.url() + ')');

    /* The point of the whole hand-off: step 1 is already answered. This is
       what silently regresses if the app stops reading the parameter. */
    const shown = await p.evaluate(() => {
      const i = document.querySelector('input');
      return i ? i.value : '';
    });
    ok(/3000/.test(shown), 'and the app opens on that postcode, not its default (' + shown + ')');
  }

  console.log('\nthe retired URL still works');
  await p.goto(BASE + '/get-a-quote/', { waitUntil: 'networkidle' });
  await p.waitForTimeout(OFFLINE ? 300 : 3000);
  if (OFFLINE) {
    /* The shell redirects itself the moment it loads, so there is no asking
       the browser what it contained — read the file the build wrote. */
    const html = require('fs').readFileSync(
      require('path').join(__dirname, '..', 'site', 'get-a-quote', 'index.html'), 'utf8');
    ok(html.includes('http-equiv="refresh" content="0; url=' + APP + '"'),
       'the fallback page refreshes to the app');
    ok(html.includes('rel="canonical" href="' + APP + '"'),
       'and points its canonical at the app, not at itself');
    ok(/name="robots" content="noindex/.test(html), 'and tells robots not to index the shell');
    ok(html.includes('<a href="' + APP + '">'), 'and offers a plain link for anyone it does not carry');
  } else {
    ok(p.url().startsWith(APP), '/get-a-quote/ reaches the app (' + p.url() + ')');
    await p.goto(BASE + '/get-a-quote/?postcode=4000', { waitUntil: 'networkidle' });
    await p.waitForTimeout(3000);
    ok(p.url().includes('postcode=4000'), 'and carries a postcode through the redirect');
  }

  ok(errs.length === 0, 'no JavaScript errors (' + errs.slice(0, 2).join(' | ') + ')');

  await b.close();
  console.log('\n' + (fail.length ? fail.length + ' FAILED' : 'all checks passed'));
  process.exitCode = fail.length ? 1 : 0;
})();
