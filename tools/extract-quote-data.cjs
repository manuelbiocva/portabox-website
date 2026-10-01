/* Regenerate build/quote-data.json from the client's React prototype.

   The prototype is the source of truth for rates, zones, leg fees, the
   interstate matrix, surcharges, supplies and the postcode table. Rather
   than retyping those numbers into the site (and drifting from them), this
   lifts the literals straight out of the TypeScript.

   Run it whenever the client sends a new build of the quote app:
     node tools/extract-quote-data.cjs
*/
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'website-changes', 'Portabox-Instant-Quote-source code', 'src');
const OUT = path.join(__dirname, '..', 'build', 'quote-data.json');

/* Pull a top-level `const NAME = <literal>` out of a TS file by balancing
   brackets. The files are plain data declarations, so this is enough — and
   it is a lot less fragile than a regex over nested objects. */
function literal(src, name) {
  const i = src.indexOf('const ' + name);
  if (i < 0) throw new Error('not found: ' + name);
  const a = src.indexOf('= ', i) + 2;
  const open = src[a];
  const close = open === '[' ? ']' : '}';
  let depth = 0, j = a;
  for (; j < src.length; j++) {
    if (src[j] === open) depth++;
    else if (src[j] === close && !--depth) break;
  }
  return src.slice(a, j + 1);
}

const postcodesTs = fs.readFileSync(path.join(SRC, 'data', 'australianPostcodes.ts'), 'utf8');
const engineTs = fs.readFileSync(path.join(SRC, 'services', 'pricingEngine.ts'), 'utf8');

/* DEFAULT_CONFIG references these two by name, so they have to exist in
   scope before it is evaluated. */
const DEFAULT_PACKING_SUPPLIES = eval('(' + literal(engineTs, 'DEFAULT_PACKING_SUPPLIES') + ')');
const DEFAULT_DEPOT_CALENDARS = [];
void DEFAULT_DEPOT_CALENDARS;
const cfg = eval('(' + literal(engineTs, 'DEFAULT_CONFIG') + ')');

const data = {
  postcodes: eval('(' + literal(postcodesTs, 'AUSTRALIAN_POSTCODES') + ')'),
  depots: eval('(' + literal(postcodesTs, 'PORTABOX_DEPOTS') + ')')
    .map((d) => ({ id: d.id, name: d.name, suburb: d.suburb, state: d.state,
                   postcode: d.postcode, lat: d.lat, lng: d.lng })),
  roads: eval('(' + literal(postcodesTs, 'KNOWN_DRIVING_DISTANCES') + ')'),
  interstate: cfg.interstateRates,
  rates: cfg.containerPrices,
  zones: cfg.deliveryZones,
  legFee: cfg.domesticLegFee,
  fuelPerKm: cfg.fuelSurchargeRatePerKm,
  supplies: DEFAULT_PACKING_SUPPLIES,
  blocked: cfg.blockedPostcodes,
};

fs.writeFileSync(OUT, JSON.stringify(data));
console.log(
  `quote-data.json: ${data.postcodes.length} postcodes, ${data.depots.length} depots, ` +
  `${Object.keys(data.roads).length} measured routes, ${Object.keys(data.interstate).length} interstate rates, ` +
  `${(fs.statSync(OUT).size / 1024).toFixed(1)} KB`
);
