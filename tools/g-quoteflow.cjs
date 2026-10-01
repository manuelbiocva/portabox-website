/* Drive the instant quote the way a customer does, and check the price it
   prints against the client's own pricing engine.

   The point of this file is the last assertion. The flow is a port, so the
   only failure that matters is the port quietly disagreeing with the
   prototype — a wrong rate reads as a perfectly ordinary number on screen.
   Each case below recomputes the expected figure from build/quote-data.json
   by hand and compares it with what the page rendered.

     node tools/g-quoteflow.cjs
*/
const { chromium } = require('playwright');
const path = require('path');
const D = require('../build/quote-data.json');

const BASE = 'http://127.0.0.1:8899';
const URL = BASE + '/get-a-quote/';

/* The radios are clipped and pointer-events:none so the card can own the
   click. Driving them with check({force:true}) aims at the input's own
   box, which lands on whatever is beneath it — pick the card instead. */
const pick = (p, value) => p.locator('.g-qf-opt:has(input[value="' + value + '"]) label').click();

const fail = [];
const ok = (cond, msg) => { if (!cond) fail.push(msg); console.log((cond ? '  ok   ' : '  FAIL ') + msg); };

/* The engine's own helpers, re-derived here rather than imported, so a bug
   copied into the page would have to be copied into this file too. */
const rec = (pc) => D.postcodes.find((p) => p.postcode === pc);
const haversine = (a, b) => {
  const R = 6371, r = Math.PI / 180;
  const dLat = (b.lat - a.lat) * r, dLng = (b.lng - a.lng) * r;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h)));
};
const driving = (a, b) => {
  const k = D.roads[a.postcode + '-' + b.postcode];
  if (k) return k;
  const line = haversine(a, b);
  if (!line) return 0;
  return Math.round(line * (line < 20 ? 1.25 : line > 150 ? 1.22 : 1.27));
};
const closest = (r) => D.depots
  .map((d) => ({ d, km: driving(r, d) }))
  .reduce((a, b) => (b.km < a.km ? b : a));
const zoneOf = (km) => km <= D.zones.zone1MaxKm ? 1 : km <= D.zones.zone2MaxKm ? 2 : km <= D.zones.zone3MaxKm ? 3 : 4;
const zoneRate = (z) => z === 2 ? D.zones.zone2RatePerKm : z === 3 ? D.zones.zone3RatePerKm : 0;
const hub = (r) => r.state === 'SA' ? 'Adelaide' : r.state === 'VIC' ? 'Melbourne'
  : (r.state === 'NSW' || r.state === 'ACT') ? 'Sydney'
  : r.state === 'QLD' ? (+r.postcode >= 4550 && +r.postcode <= 4575 ? 'Sunshine Coast' : 'Brisbane/Gold Coast')
  : null;

const RATES = {
  small_10m3: [D.rates.small_10m3.monthlyRate, D.rates.small_10m3.weeklyRate, 1],
  medium_19m3: [D.rates.medium_19m3.monthlyRate, D.rates.medium_19m3.weeklyRate, 1],
  large_25m3: [D.rates.large_25m3.monthlyRate, D.rates.large_25m3.weeklyRate, 1],
  combo_35m3: [D.rates.large_25m3.monthlyRate + D.rates.small_10m3.monthlyRate,
               D.rates.large_25m3.weeklyRate + D.rates.small_10m3.weeklyRate, 2],
  two_large_50m3: [D.rates.large_25m3.monthlyRate * 2, D.rates.large_25m3.weeklyRate * 2, 2],
};

/* What the page should print as "due on delivery": the first leg, plus the
   first period of rent, plus any supplies. */
function expectedToday(c) {
  const o = rec(c.origin), dest = c.dest ? rec(c.dest) : null;
  const [mo, wk, count] = RATES[c.size];
  const leg = D.legFee * count;
  const near = closest(o);
  const z = zoneOf(near.km);
  const kmCharge = (z === 2 || z === 3) ? Math.round(near.km * zoneRate(z)) * count : 0;
  const isMove = c.service === 'moving' || c.service === 'moving_storage';

  let fuel = 0;
  if (!isMove && near.km > D.zones.zone1MaxKm) {
    fuel = Math.round(near.km * D.fuelPerKm * 100) / 100 * count;
  }
  /* Only the first leg is due on delivery, and for a move the first leg is
     the empty drop-off — which carries no fuel surcharge in the engine. */
  const firstLeg = isMove ? leg + kmCharge : leg + kmCharge + fuel;

  const rent = c.billing === 'weekly' ? (c.duration === '2_weeks' ? wk * 2 : wk)
    : c.billing === 'monthly' ? mo
    : Math.round(mo * (c.billing === '3_months_upfront' ? 3 : c.billing === '6_months_upfront' ? 6 : 12)
                 * (c.billing === '3_months_upfront' ? 0.95 : c.billing === '6_months_upfront' ? 0.90 : 0.85));

  return { today: Math.round(rent + firstLeg), interstate: !!(dest && hub(o) !== hub(dest)) };
}

const CASES = [
  { name: 'storage at my place, Adelaide metro, monthly 25 m³',
    origin: '5061', service: 'storage', placement: 'my_place',
    size: 'large_25m3', duration: '4_to_11_months', billing: 'monthly' },

  { name: 'storage at a facility, Sydney, weekly 10 m³ for 2 weeks',
    origin: '2000', service: 'storage', placement: 'facility',
    size: 'small_10m3', duration: '2_weeks', billing: 'weekly' },

  { name: 'local move inside Adelaide, 12 months upfront, combo',
    origin: '5061', dest: '5211', service: 'moving',
    size: 'combo_35m3', duration: '12_plus_months', billing: '12_months_upfront' },

  { name: 'interstate Adelaide to Melbourne, moving and storage, 19 m³',
    origin: '5000', dest: '3000', service: 'moving_storage',
    size: 'medium_19m3', duration: '1_to_3_months', billing: 'monthly' },
];

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 1000 } });
  const errs = [];
  p.on('pageerror', (e) => errs.push(String(e)));
  p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });

  /* ---- the hand-off from every other page's postcode box ---- */
  console.log('\nhand-off from a hero postcode box');
  await p.goto(BASE + '/', { waitUntil: 'networkidle' });
  const box = p.locator('.quote-form input').first();
  await box.fill('5061');
  await p.locator('.quote-form button').first().click();
  await p.waitForURL(/get-a-quote/, { timeout: 10000 }).catch(() => {});
  ok(/\/get-a-quote\//.test(p.url()), 'lands on /get-a-quote/ (got ' + p.url() + ')');
  ok((await p.evaluate(() => document.title)).length > 0 && p.url().includes('postcode=5061'),
     'carries the postcode in the URL');
  await p.waitForTimeout(400);
  ok(await p.locator('#qf-origin').inputValue() === '5061', 'step 1 is filled in from the hand-off');
  ok(await p.locator('[data-qf-panel="2"]').isVisible(), 'and the flow has advanced to step 2');

  /* ---- one question per screen ---- */
  console.log('\nshape of the flow');
  await p.goto(URL, { waitUntil: 'networkidle' });
  const visible = await p.locator('[data-qf-panel]:visible').count();
  ok(visible === 1, 'exactly one step is on screen at a time (saw ' + visible + ')');
  const askedUpFront = await p.locator('[data-qf-panel="1"] input, [data-qf-panel="1"] select').count();
  ok(askedUpFront === 1, 'step 1 asks one question (saw ' + askedUpFront + ')');
  ok(!(await p.locator('#qf-email').isVisible()), 'email is not asked before the price');
  ok(!(await p.locator('#qf-mobile').isVisible()), 'phone is not asked before the price');

  /* ---- a step will not advance without its answer ---- */
  await p.locator('[data-qf-panel="1"] [data-qf-next]').click();
  await p.waitForTimeout(250);
  ok(await p.locator('[data-qf-panel="1"]').isVisible(), 'step 1 refuses to advance without a postcode');
  ok((await p.locator('[data-qf-panel="1"] [data-qf-problem]').textContent() || '').length > 10,
     'and says what is missing');

  /* ---- an unserviceable postcode is called out, not priced ---- */
  console.log('\npostcodes the engine cannot price');
  await p.locator('#qf-origin').fill('7151');          // blocked in the prototype's config
  await p.waitForTimeout(300);
  const blockedMsg = await p.locator('[data-qf-depot]').textContent();
  ok(/not somewhere we can deliver|cannot/i.test(blockedMsg), 'a blocked postcode is refused: ' + blockedMsg.slice(0, 60));
  await p.locator('#qf-origin').fill('6000');          // WA: real postcode, no depot
  await p.waitForTimeout(300);
  const waMsg = await p.locator('[data-qf-depot]').textContent();
  ok(/Regional Solution/i.test(waMsg), 'a state with no depot is quoted by hand, not guessed');

  /* ---- each case, end to end ---- */
  for (const c of CASES) {
    console.log('\n' + c.name);
    await p.goto(URL, { waitUntil: 'networkidle' });

    await p.locator('#qf-origin').fill(c.origin);
    await p.waitForTimeout(250);
    await p.locator('[data-qf-panel="1"] [data-qf-next]').click();

    await pick(p, c.service);
    await p.waitForTimeout(150);
    if (c.placement) await pick(p, c.placement);
    if (c.dest) { await p.locator('#qf-dest').fill(c.dest); await p.waitForTimeout(250); }
    await p.locator('[data-qf-panel="2"] [data-qf-next]').click();

    await pick(p, c.size);
    await p.locator('[data-qf-panel="3"] [data-qf-next]').click();

    const soon = new Date(Date.now() + 9 * 864e5).toISOString().slice(0, 10);
    await p.locator('#qf-date').fill(soon);
    await pick(p, c.duration);
    await p.waitForTimeout(120);
    await p.locator('#qf-billing').selectOption(c.billing);
    await p.locator('[data-qf-panel="4"] [data-qf-next]').click();
    await p.waitForTimeout(300);

    ok(await p.locator('[data-qf-panel="5"]').isVisible(), 'reaches the quote');

    const sum = await p.locator('[data-qf-summary]').innerText();
    const shown = Number((sum.match(/Due on delivery\s*\$?([\d,]+)/i) || [])[1] ? (sum.match(/Due on delivery\s*\$?([\d,]+)/i)[1]).replace(/,/g, '') : NaN);
    const want = expectedToday(c);
    ok(shown === want.today, 'due on delivery is $' + want.today + ' (page printed $' + shown + ')');

    if (want.interstate) {
      ok(/Interstate transport/.test(sum), 'the interstate leg is named');
      const h1 = hub(rec(c.origin)), h2 = hub(rec(c.dest));
      const rate = D.interstate[h1 + '->' + h2] * RATES[c.size][2];
      ok(sum.includes('$' + rate.toLocaleString('en-AU')),
         'and priced at the matrix rate $' + rate.toLocaleString('en-AU'));
    }

    /* The rail should carry the answers back, so the customer can see what
       they picked without walking backwards through the flow. */
    const rail = await p.locator('.g-qf-steps').innerText();
    ok(rail.includes(rec(c.origin).suburb), 'the rail shows the origin suburb');
  }

  /* ---- the billing dropdown ---- */
  console.log();
  console.log("billing cycle follows the hire");
  await p.goto(URL, { waitUntil: "networkidle" });
  await p.locator("#qf-origin").fill("2000");
  await p.waitForTimeout(250);
  await p.locator('[data-qf-panel="1"] [data-qf-next]').click();
  await pick(p, "storage");
  await p.waitForTimeout(150);
  await pick(p, "facility");
  await p.locator('[data-qf-panel="2"] [data-qf-next]').click();
  await pick(p, "large_25m3");
  await p.locator('[data-qf-panel="3"] [data-qf-next]').click();

  const billing = () => p.evaluate(() => {
    const s = document.getElementById("qf-billing");
    return { value: s.value, offered: [...s.options].map((o) => o.value),
             disabled: [...s.options].filter((o) => o.disabled).length };
  });

  await pick(p, "2_weeks"); await p.waitForTimeout(150);
  let b1 = await billing();
  /* Greying the options out is what made this read as a broken control. */
  ok(b1.disabled === 0, "nothing in the dropdown is disabled");
  ok(b1.value === "weekly", "two weeks defaults to the weekly rate, not a month of rent");
  ok(!b1.offered.includes("12_months_upfront"),
     "a 12-month prepay is not offered against a 2-week hire");

  await pick(p, "12_plus_months"); await p.waitForTimeout(150);
  let b2 = await billing();
  ok(b2.offered.length === 5, "a 12-month hire is offered every cycle (saw " + b2.offered.length + ")");
  await p.locator("#qf-billing").selectOption("12_months_upfront");
  ok(await p.locator("#qf-billing").inputValue() === "12_months_upfront",
     "and an upfront option can actually be chosen");

  await pick(p, "4_to_11_months"); await p.waitForTimeout(150);
  ok((await billing()).value === "monthly",
     "a choice the shorter hire cannot carry falls back rather than sticking");
  await p.locator("#qf-billing").selectOption("6_months_upfront");
  await pick(p, "12_plus_months"); await p.waitForTimeout(150);
  ok((await billing()).value === "6_months_upfront", "a choice that still fits is kept");

  await p.locator("#qf-date").fill(new Date(Date.now() + 9 * 864e5).toISOString().slice(0, 10));
  await p.locator('[data-qf-panel="4"] [data-qf-next]').click();
  await p.waitForTimeout(300);
  /* ---- the last step validates, and is honest about having nowhere to post ---- */
  console.log('\nsubmitting');
  await p.locator('[data-qf-panel="5"] button[type=submit]').click();
  await p.waitForTimeout(200);
  ok(/highlighted field|name, a mobile/.test(await p.locator('.g-qf-msg').textContent()),
     'refuses to submit an empty contact block');
  await p.locator('#qf-name').fill('Sam');
  await p.locator('#qf-mobile').fill('0400 000 000');
  await p.locator('#qf-email').fill('sam@example.com');
  await p.locator('#qf-agree').check();
  await p.locator('[data-qf-panel="5"] button[type=submit]').click();
  await p.waitForTimeout(200);
  const sent = await p.locator('.g-qf-msg').textContent();
  ok(/no mail handler|nothing has been sent/i.test(sent), 'says plainly that nothing was sent: ' + sent.slice(0, 70));

  /* ---- keyboard and screen reader ---- */
  console.log('\naccessibility');
  await p.goto(URL, { waitUntil: 'networkidle' });
  const hidden = await p.evaluate(() => {
    const r = document.querySelector('.g-qf-opt input');
    const s = getComputedStyle(r);
    return { display: s.display, visibility: s.visibility, pe: s.pointerEvents };
  });
  ok(hidden.display !== 'none' && hidden.visibility !== 'hidden',
     'the radios stay in the accessibility tree (clipped, not hidden)');
  ok(hidden.pe === 'none', 'and cannot swallow a click on the card');

  const reachable = await p.evaluate(() => {
    const el = document.querySelector('#qf-origin');
    return el && el.getAttribute('aria-describedby') === 'qf-origin-help';
  });
  ok(reachable, 'the postcode field points at its own help text');

  ok(errs.length === 0, 'no JavaScript errors (' + errs.slice(0, 2).join(' | ') + ')');

  await p.screenshot({ path: path.join(__dirname, 'qf-flow.png') });
  await b.close();

  console.log('\n' + (fail.length ? fail.length + ' FAILED' : 'all checks passed'));
  process.exitCode = fail.length ? 1 : 0;
})();
