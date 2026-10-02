/* =================================================================
   The multi-step instant quote.

   This mirrors the client's React prototype
   (website-changes/Portabox-Instant-Quote-source code) step for step:

     1  Where       origin postcode
     2  What        moving / storage / both, and where the container lives
     3  Size        five containers
     4  When        start date, how long, billing, packing supplies
     5  Quote       contact details last, then the priced breakdown

   The prototype asks for nothing until step 5. The form this replaces
   asked nine questions, including email and phone, on one screen.

   Rates, zones, leg fees, interstate matrix, surcharges, supplies and
   the postcode table all come out of the prototype verbatim — see
   build/quote-data.json, which tools/extract-quote-data.cjs regenerates
   from the source. Nothing here is invented; where the prototype has no
   number (zone 4, unserviced postcodes) the page says so and asks the
   customer to call rather than guessing.

   Lives in its own module because tools/add-variant-g.py replaces
   everything between the giga marker and the emit section in build.js.
   ================================================================= */

const fs = require("fs");
const path = require("path");

const DATA = JSON.parse(fs.readFileSync(path.join(__dirname, "quote-data.json"), "utf8"));

/* The five containers the prototype offers, each with the rate its
   pricing engine charges. combo and two-large are two containers, so
   their rate is the sum of the parts — exactly as the engine computes it. */
const R = DATA.rates;
const CONTAINERS = [
  { id: "small_10m3", name: "10 m³ Portabox", vol: "10 m³", count: 1,
    mo: R.small_10m3.monthlyRate, wk: R.small_10m3.weeklyRate,
    dims: "2.15 m × 1.52 m × 2.40 m", floor: "3.3 m²", door: "1.40 m (W) × 2.10 m (H)",
    fits: "1 bedroom apartment · queen bed, sofa, fridge, 30–40 boxes", img: "size-small.jpg" },
  { id: "medium_19m3", name: "19 m³ Portabox", vol: "19 m³", count: 1,
    mo: R.medium_19m3.monthlyRate, wk: R.medium_19m3.weeklyRate,
    dims: "3.75 m × 2.20 m × 2.40 m", floor: "8.2 m²", door: "2.10 m (W) × 2.10 m (H)",
    fits: "2 bedroom home · 2 beds, dining suite, living room, 60–80 boxes", img: "size-medium.jpg" },
  { id: "large_25m3", name: "25 m³ Portabox", vol: "25 m³", count: 1, best: true,
    mo: R.large_25m3.monthlyRate, wk: R.large_25m3.weeklyRate,
    dims: "4.95 m × 2.20 m × 2.40 m", floor: "10.9 m²", door: "2.10 m (W) × 2.10 m (H)",
    fits: "3 bedroom family home · 3 beds, lounge, outdoor set, 100–120 boxes", img: "size-large.jpg" },
  { id: "combo_35m3", name: "Large + Small combo", vol: "35 m³", count: 2,
    mo: R.large_25m3.monthlyRate + R.small_10m3.monthlyRate,
    wk: R.large_25m3.weeklyRate + R.small_10m3.weeklyRate,
    dims: "25 m³ and 10 m³ together", floor: "14.2 m²", door: "Dual ground access doors",
    fits: "4 bedroom large home · 26 to 35 m³ of contents", img: "two-containers.jpeg" },
  { id: "two_large_50m3", name: "Two 25 m³ Portaboxes", vol: "50 m³", count: 2,
    mo: R.large_25m3.monthlyRate * 2, wk: R.large_25m3.weeklyRate * 2,
    dims: "2 × 4.95 m × 2.20 m × 2.40 m", floor: "21.8 m²", door: "Dual large access doors",
    fits: "5 bedroom expansive home · 36 to 50 m³ of contents", img: "size-large.jpg" },
];

/* Room volumes for the "estimate by room and furniture" helper. The
   prototype's space calculator works the same way: add up the rooms,
   then recommend the smallest container that holds the total. */
const ROOMS = [
  { id: "bed", label: "Bedroom", m3: 6 },
  { id: "living", label: "Living room", m3: 7 },
  { id: "kitchen", label: "Kitchen", m3: 4 },
  { id: "dining", label: "Dining room", m3: 4 },
  { id: "study", label: "Study or office", m3: 3 },
  { id: "garage", label: "Garage or shed", m3: 8 },
  { id: "outdoor", label: "Outdoor and patio", m3: 4 },
];

const SERVICES = [
  { id: "moving", t: "Moving", img: "truck-coastal.png",
    b: "We deliver the container, you load it, we drive it to the new address." },
  { id: "storage", t: "Storage", img: "store-with-us.jpg",
    b: "The container stays loaded — on your property or in a monitored facility." },
  { id: "moving_storage", t: "Moving and storage", img: "hybrid-choice.jpg",
    b: "Store it for a while, then have it delivered to the new address." },
];

const DURATIONS = [
  { id: "2_weeks", t: "2 weeks", cycle: "weekly" },
  { id: "1_to_3_months", t: "1–3 months", cycle: "monthly" },
  { id: "4_to_11_months", t: "4–11 months", cycle: "monthly" },
  { id: "12_plus_months", t: "12 months or more", cycle: "monthly" },
];

const BILLING = [
  { id: "weekly", t: "Weekly" },
  { id: "monthly", t: "Monthly" },
  { id: "3_months_upfront", t: "3 months upfront — 5% off" },
  { id: "6_months_upfront", t: "6 months upfront — 10% off" },
  { id: "12_months_upfront", t: "12 months upfront — 15% off" },
];

const SUPPLY_COUNTS = [0, 10, 20, 50, 100];

const STEPS = [
  { n: 1, t: "Where", q: "Where are you moving or storing?" },
  { n: 2, t: "What", q: "What do you need?" },
  { n: 3, t: "Size", q: "Which size do you need?" },
  { n: 4, t: "When", q: "When do you need it, and for how long?" },
  { n: 5, t: "Quote", q: "Where do we send your quote?" },
];

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");

/* The data the browser needs to price a quote. Inlined rather than
   fetched: it is 9 KB, it is needed before the first paint of step 5,
   and an inline script cannot go stale against a cached JSON file. */
function dataScript() {
  const payload = {
    postcodes: DATA.postcodes, depots: DATA.depots, roads: DATA.roads,
    interstate: DATA.interstate, zones: DATA.zones, legFee: DATA.legFee,
    fuelPerKm: DATA.fuelPerKm, supplies: DATA.supplies, blocked: DATA.blocked,
    containers: CONTAINERS.map((c) => ({ id: c.id, name: c.name, vol: c.vol, count: c.count, mo: c.mo, wk: c.wk })),
    rooms: ROOMS,
  };
  return `<script type="application/json" id="qf-data">${
    JSON.stringify(payload).replace(/</g, "\\u003c")
  }</script>`;
}

module.exports = function makeQuoteFlow(h) {
  const { bandOf, gintro, C, url } = h;

  const field = (id, label, attrs, help) => `
          <p class="g-qf-field">
            <label for="${id}">${label}</label>
            <input id="${id}" ${attrs}>
            ${help ? `<span class="g-qf-help" id="${id}-help">${help}</span>` : ""}
          </p>`;

  const TICK = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.5 5 5L19 7"/></svg>`;

  /* A choice is a radio with its label drawn as a card. The input stays in
     the flow for the keyboard and for screen readers; CSS clips it.

     The card carries a visible box that fills and ticks when chosen. Without
     it the cards read as three paragraphs of copy — the first version of this
     screen gave no sign that anything on it was clickable. Square rather than
     the conventional round radio, because nothing in this system has a
     radius; the tick carries the meaning instead of the shape. */
  const choice = (name, id, value, title, body, extra, img) => `
            <div class="g-qf-opt${img ? " g-qf-opt--img" : ""}">
              <input type="radio" name="${name}" id="${id}" value="${value}">
              <label for="${id}">
                ${img ? `<span class="g-qf-opt-pic"><img src="/assets/img/${img}" alt="" loading="lazy" decoding="async" width="640" height="400"></span>` : ""}
                <span class="g-qf-opt-head">
                  <span class="g-qf-opt-t">${title}</span>
                  <span class="g-qf-opt-box" aria-hidden="true">${TICK}</span>
                </span>
                ${body ? `<span class="g-qf-opt-b">${body}</span>` : ""}
                ${extra || ""}
              </label>
            </div>`;

  /* `.g-btn` pads only on the left, because the arrow cell fills the right
     edge. A button without one therefore has no right padding at all, which
     is how Previous came out with its text jammed against the border. It
     gets the mirrored treatment instead: same height, same cell, arrow on
     the left pointing back. */
  const BACK = h.ARROW.replace('d="M7 17 17 7M9 7h8v8"', 'd="M20 12H4M10 6l-6 6 6 6"');

  const nav = (n, nextLabel) => `
          <div class="g-qf-nav">
            ${n > 1 ? `<button type="button" class="g-btn g-btn--line g-btn--back" data-qf-back><i>${BACK}</i><span>Previous</span></button>` : "<span></span>"}
            <button type="button" class="g-btn g-btn--yellow" data-qf-next><span>${nextLabel || "Continue"}</span><i>${h.ARROW}</i></button>
          </div>`;

  const panel = (n, inner) => {
    const s = STEPS[n - 1];
    return `
        <section class="g-qf-panel" data-qf-panel="${n}" ${n > 1 ? "hidden" : ""} aria-labelledby="qf-q${n}">
          <p class="g-qf-step">Step ${n} of 5</p>
          <h3 class="g-qf-q" id="qf-q${n}">${s.q}</h3>
          ${inner}
        </section>`;
  };

  /* ---- Step 1: where ---- */
  const step1 = panel(1, `
          <p class="g-qf-lead">Start with the postcode the container is delivered to. We will tell you which depot covers it before you go any further.</p>
          ${field("qf-origin", "Delivery postcode or suburb",
            `type="text" name="origin" autocomplete="postal-code" inputmode="numeric" ` +
            `placeholder="e.g. 5000, 3000, 2000, 4000" aria-describedby="qf-origin-help"`,
            "Four digits, or start typing a suburb.")}
          <div class="g-qf-depot" data-qf-depot hidden></div>
          ${nav(1)}`);

  /* ---- Step 2: what ---- */
  const step2 = panel(2, `
          <p class="g-qf-lead">Pick one. You can change it at any point before you send the quote.</p>
          <div class="g-qf-opts g-qf-opts--3">
            ${SERVICES.map((s, i) => choice("service", "qf-svc-" + i, s.id, s.t, s.b, "", s.img)).join("")}
          </div>

          <div class="g-qf-sub" data-qf-sub="placement" hidden>
            <h4 class="g-qf-subq">Where will the container live?</h4>
            <div class="g-qf-opts g-qf-opts--2">
              ${choice("placement", "qf-place-1", "my_place", "At my place",
                "It sits on your driveway or yard. You keep the only keys and open it whenever you like.",
                "", "doorstep-delivery.jpg")}
              ${choice("placement", "qf-place-2", "facility", "At a Portabox facility",
                "We collect it once you have loaded it and store it in a monitored yard until you want it back.",
                "", "about-facility.jpg")}
            </div>
          </div>

          <div class="g-qf-sub" data-qf-sub="destination" hidden>
            <h4 class="g-qf-subq">Where is it going?</h4>
            ${field("qf-dest", "Destination postcode or suburb",
              `type="text" name="destination" autocomplete="postal-code" inputmode="numeric" ` +
              `placeholder="e.g. 3000 Melbourne" aria-describedby="qf-dest-help"`,
              "Anywhere in Australia. Interstate runs are priced off the route, not the kilometre.")}
            <div class="g-qf-depot" data-qf-depot-dest hidden></div>
          </div>
          ${nav(2)}`);

  /* ---- Step 3: size ---- */
  const step3 = panel(3, `
          <div class="g-qf-sizes">
            ${CONTAINERS.map((c, i) => choice("size", "qf-size-" + i, c.id,
              `${c.name}${c.best ? ' <span class="g-qf-flag">Most chosen</span>' : ""}`,
              c.fits,
              `<span class="g-qf-spec">
                 <span><b>${c.vol}</b> internal</span>
                 <span>${c.dims}</span>
                 <span>${c.floor} of driveway</span>
                 <span>${/[0-9]/.test(c.door) ? "Door " + c.door : c.door}</span>
               </span>
               <span class="g-qf-rate"><b>$${c.mo}</b> per month<small>$${c.wk} per week</small></span>`,
              c.img)).join("")}
          </div>

          <details class="g-qf-calc">
            <summary>Estimate by room &amp; furniture</summary>
            <p class="g-qf-lead">Count the rooms you are emptying. We will add up the volume and point at the smallest container that holds it.</p>
            <div class="g-qf-rooms">
              ${ROOMS.map((r) => `
              <p class="g-qf-room">
                <label for="qf-room-${r.id}">${r.label} <small>${r.m3} m³ each</small></label>
                <input type="number" id="qf-room-${r.id}" data-qf-room="${r.id}" min="0" max="20" step="1" value="0" inputmode="numeric">
              </p>`).join("")}
            </div>
            <p class="g-qf-calc-out" data-qf-calc role="status" aria-live="polite">Nothing added up yet.</p>
          </details>
          ${nav(3)}`);

  /* ---- Step 4: when ---- */
  const step4 = panel(4, `
          <div class="g-qf-two">
            ${field("qf-date", "Preferred delivery date",
              `type="date" name="date" aria-describedby="qf-date-help"`,
              "We confirm the window with you before the truck is booked.")}
            <p class="g-qf-field">
              <label for="qf-window">Delivery window</label>
              <select id="qf-window" name="window">
                <option value="Morning 7am – 11am">Morning, 7am – 11am</option>
                <option value="Midday 11am – 2pm">Midday, 11am – 2pm</option>
                <option value="Afternoon 2pm – 6pm">Afternoon, 2pm – 6pm</option>
                <option value="Any time on the day">Any time on the day</option>
              </select>
            </p>
          </div>

          <h4 class="g-qf-subq">How long do you need it?</h4>
          <div class="g-qf-opts g-qf-opts--4">
            ${DURATIONS.map((d, i) => choice("duration", "qf-dur-" + i, d.id, d.t, "")).join("")}
          </div>

          <p class="g-qf-field g-qf-field--wide">
            <label for="qf-billing">How would you like to pay?</label>
            <select id="qf-billing" name="billing">
              ${BILLING.map((b) => `<option value="${b.id}"${b.id === "monthly" ? " selected" : ""}>${b.t}</option>`).join("")}
            </select>
            <span class="g-qf-help">Paying further ahead takes a percentage off the monthly rate, so the longer the hire the more there is to choose from here. Nothing is charged today.</span>
          </p>

          <details class="g-qf-calc">
            <summary>Packing supplies and blanket rentals <span class="g-qf-opt-b">Optional</span></summary>
            <div class="g-qf-two">
              <p class="g-qf-field">
                <label for="qf-boxes">Moving boxes</label>
                <select id="qf-boxes" name="boxes">
                  ${SUPPLY_COUNTS.map((n) => `<option value="${n}">${n === 0 ? "None" : n + " boxes"}</option>`).join("")}
                </select>
              </p>
              <p class="g-qf-field">
                <label for="qf-blankets">Blanket rental</label>
                <select id="qf-blankets" name="blankets">
                  ${SUPPLY_COUNTS.map((n) => `<option value="${n}">${n === 0 ? "None" : n + " blankets"}</option>`).join("")}
                </select>
              </p>
            </div>
            <p class="g-qf-calc-out" data-qf-supplies role="status" aria-live="polite">No supplies added.</p>
          </details>
          ${nav(4, "See my quote")}`);

  /* ---- Step 5: contact, then the quote ---- */
  const step5 = panel(5, `
          <div class="g-qf-split">
            <div>
              <p class="g-qf-lead">Here is what we have priced. Leave your details and we will send the full breakdown and hold the date.</p>
              <div class="g-qf-two">
                ${field("qf-name", "First name", `type="text" name="first_name" autocomplete="given-name" required`)}
                ${field("qf-mobile", "Mobile", `type="tel" name="mobile" autocomplete="tel" required`)}
              </div>
              ${field("qf-email", "Email", `type="email" name="email" autocomplete="email" required`)}
              <p class="g-qf-check">
                <input type="checkbox" id="qf-agree" name="agree" required>
                <label for="qf-agree">Portabox may contact me about this quote by phone, SMS or email.</label>
              </p>
              <div class="g-qf-nav">
                <button type="button" class="g-btn g-btn--line g-btn--back" data-qf-back><i>${BACK}</i><span>Previous</span></button>
                <button type="submit" class="g-btn g-btn--yellow"><span>Send me this quote</span><i>${h.ARROW}</i></button>
              </div>
              <div class="g-qf-msg" role="status" aria-live="polite"></div>
            </div>

            <aside class="g-qf-sum" data-qf-summary aria-label="Your estimate"></aside>
          </div>`);

  return function quoteFlow(o) {
    o = o || {};
    return `
<section class="g-band g-band--${bandOf(o.band || "light")} g-qf" id="quote-form">
  <div class="g-wrap">
    ${gintro("Instant quote", o.h || "Five questions, then a price",
      "Nothing is charged and we do not ask for your details until the end. Metro and surrounding areas are priced here; outside the depot radius we quote the run by hand — call " +
      C.CONTACT.phone + " about the Regional Solution.")}

    <noscript>
      <p class="g-qf-depot is-warn">The step-by-step quote needs JavaScript, which is switched off.
        Ring <a href="${C.CONTACT.tel}">${C.CONTACT.phone}</a> and we will price it on the phone,
        or use the <a href="${C.CONTACT.quoteForm}">booking form on portabox.au</a>.</p>
    </noscript>

    <div class="g-qf-shell g-rise">
      <nav class="g-qf-rail" aria-label="Quote progress">
        <ol class="g-qf-steps">
          ${STEPS.map((s) => `
          <li data-qf-crumb="${s.n}"${s.n === 1 ? ' class="now"' : ""}>
            <button type="button" data-qf-goto="${s.n}" disabled>
              <span class="g-qf-num">${s.n}</span>
              <span class="g-qf-crumb-t">${s.t}</span>
              <span class="g-qf-crumb-v"></span>
            </button>
          </li>`).join("")}
        </ol>
        <p class="g-qf-rail-help">Rather talk it through?<br><a href="${C.CONTACT.tel}">${C.CONTACT.phone}</a></p>
      </nav>

      <form class="g-qf-main" data-qf novalidate>
        ${step1}
        ${step2}
        ${step3}
        ${step4}
        ${step5}
      </form>
    </div>
    ${dataScript()}
  </div>
</section>`;
  };
};

/* The suggestion popup needs only these three columns, so it travels as an
   array of arrays — about 1.8 KB, against 9 KB for the pricing dataset. */
module.exports.suburbsScript = () =>
  '<script type="application/json" id="qf-suburbs">' +
  JSON.stringify(DATA.postcodes.map((p) => [p.postcode, p.suburb, p.state])).replace(/</g, "\u003c") +
  '</scr' + 'ipt>';

module.exports.CONTAINERS = CONTAINERS;
