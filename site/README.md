# Portabox — multi-page site

18 static pages. No build step at runtime, no framework, no dependencies. The homepage follows stivio.ai's warm-editorial structure; the inner pages follow concourse.ai's band layout. Both are rendered entirely in the Portabox design system from `../brand/DESIGN.md`.

## Run it

```bash
npx http-server -p 8899 -c-1
# http://127.0.0.1:8899/site/
```

## Pages

| Page | File |
|---|---|
| Home | `index.html` |
| **Storage Services** (hub) | `storage-services.html` |
| → Storage at Your Place | `storage-at-your-place.html` |
| → Store With Us | `store-with-us.html` |
| → Business & Inventory Storage | `business-storage.html` |
| → Renovation Storage | `renovation-storage.html` |
| **Moving Services** (hub) | `moving-services.html` |
| → Local Moves | `local-moves.html` |
| → Interstate Moves | `interstate-moves.html` |
| → Regional & Remote | `regional-remote.html` |
| **Locations** (hub) | `locations.html` |
| → South East Queensland | `south-east-queensland.html` |
| → Greater Sydney | `greater-sydney.html` |
| → Victoria | `victoria.html` |
| → South Australia | `south-australia.html` |
| → Regional Australia | `regional-australia.html` |
| Pricing & Sizes | `pricing.html` |
| How It Works | `how-it-works.html` |

Location slugs match the live WordPress site (`/south-east-queensland/`, `/greater-sydney/`, `/victoria/`, `/south-australia/`), so redirects are one-to-one.

## Editing

**Do not hand-edit the HTML** — it is generated and will be overwritten.

```
build/content.js   all copy, services, locations, sizes, testimonials, FAQs
build/build.js     templates, section builders, icon set, page assembly
```

After a change:

```bash
node build/build.js
```

Adding a service or location is a single entry in `content.js` — nav, dropdowns, footer, hub cards and cross-links all update from it.

```
site/assets/css/portabox.css   the whole design system
site/assets/js/site.js         nav, dropdowns, drawer, FAQ, reveals, quote form
site/assets/img/               25 real Portabox photos, local
```

## What came from where

**Homepage — after stivio.ai.** Split hero with the quote widget as an inline tool card, warm cream ground (`#F1EFEA`) instead of white, light-weight (500) display type, features and pricing as hairline-ruled columns and rows, and a deliberately quiet statement band on deep navy.

Chosen from three candidates. The other two — a photo-led cinematic version and a price-led editorial version — were removed once this one was picked.

**Inner pages — after concourse.ai.** Cinematic full-bleed dark heroes, alternating dark/light bands, chip labels above centred statements, 1380px container, generous vertical rhythm. These are unchanged and still to be reviewed.

- **Layout grammar** — concourse.ai, as above.
- **Everything visual** — your own system: navy `#0E385D`, cyan `#1EC4F4`, yellow `#FED200`, Montserrat. Concourse's near-black and light-weight 400 display type were *not* carried over; brand beats reference on colour and typography.
- **Shape** — squared off after Concourse, overriding the pill buttons in `../brand/DESIGN.md`. Measured from the reference and matched: cards `border-radius: 0`, 1px hairline border, **no shadow**; buttons `8px`, 48px tall. Nothing on the site is a pill. Rendered radius audit returns only 4px, 8px and 1px.
- **Photography** — your real images, pulled from portabox.au. No stock, no AI imagery.
- **CTA buttons** — the edge-tracing effect from Uiverse.io by Nawsome, rebuilt on the brand palette. Four 2px edges trace inward on hover, then the label rotates out and a second line rises in. Currently on the homepage only (`Get a price` → `Let's go`, `Call the depot` → `1800 467 637`). The original renders its text from `data-` attributes through `::before`/`::after`, which assistive tech does not reliably announce — this version keeps the visual in the pseudo-elements and carries a real `.sr-only` label for screen readers, and animates `transform` rather than `width`/`height`.

## Logo

`logo-white.png`, `logo-navy.png` and `logo-transparent.png` were generated from your `logoo.png` by knocking out the baked-in cyan (measured at exactly `rgb(30,196,244)` = `#1EC4F4`) and trimming to the artwork. The white knockout is what the navy nav and footer use.

These are still rasters derived from a raster. **Get proper SVGs from your designer** — see `../brand/DESIGN.md` §8.

## Verified

- 18/18 pages: no horizontal overflow at 1440px or 390px
- Trace buttons resolve to single accessible names (`Get a price`, `Call the depot`)
- No broken internal links, no 404s, no JS errors
- Contrast measured against real rendered pixels — nav worst case 7.23:1, no body-text failures
- Keyboard focus visible throughout, `prefers-reduced-motion` honoured, skip link on every page

## Not real yet

- **The quote form is simulated.** It validates the postcode and maps it to the right depot using real Australian postcode ranges, then waits 620ms. Point it at `/get-a-quote/` — see `../WORDPRESS.md` §7.
- **No ratings or review counts** appear anywhere, because none are published. If Portabox has Google reviews, that is the one missing piece of social proof.
- **Container dimensions** are shown only on `pricing.html` and labelled indicative.
- **Facebook contributed nothing** — `facebook.com/portabox.au` is behind a login wall and returned no brand content on two attempts.

## WordPress

`../WORDPRESS.md` still applies — same enqueue snippet, same header/footer split, same gotchas. The difference is that you now have 18 pages instead of one, so the sensible mapping is:

- `header.php` / `footer.php` — identical across all 18, lift once
- `front-page.php` — `index.html`
- `page-service.php` — one template, content from ACF, covers all 7 service pages
- `page-location.php` — one template, covers all 5 location pages
- Hub pages (`storage-services`, `moving-services`, `locations`) — one archive-style template

That collapses 18 files into about 6 templates.
