# Portabox — website rebuild

A static rebuild of [portabox.au](https://portabox.au), generated from a small Node script.
22 pages, one visual system, no runtime framework. Intended to be ported to WordPress —
see [WORDPRESS.md](WORDPRESS.md).

## Run it

```bash
node build/build.js                       # writes site/
npx http-server site -p 8899 -c-1         # then open http://127.0.0.1:8899/
```

Serve `site/` as the web root, not the repo root — links and asset paths are
root-relative, the same as on Vercel, so a repo-root server gives an unstyled
page and a quote flow that 404s. A server is needed rather than opening the
files directly for the same reason.

## How the build works

Everything in `site/` is generated. Edit the sources, not the output.

```
build/content.js        the data: services, locations, sizes, FAQs, contact details
build/build.js          the generator — page entries + the shared section builders
build/variant-g.js.txt  the homepage block (nav, hero, scroll journey, footer)
build/giga-*.js.txt     source fragments spliced into build.js
tools/add-variant-g.py  splices the homepage block into build.js
site/                   the generated site — safe to delete and rebuild
```

`build.js` holds a list of page entries. Each one names a file and an array of
section builders (`hero`, `split`, `cards`, `steps`, `pricing`, `faq`, …). Those
builders emit the markup, so a page entry is mostly content, not HTML.

Two things about the order of that file are load-bearing and easy to trip over:

- The section builders run **while the page list is being built**, which is before
  the homepage block's `const` helpers exist. That is why they keep their own copies
  of the button and label helpers instead of calling into the homepage ones.
- `tools/add-variant-g.py` replaces everything between the homepage marker and the
  emit section. Anything defined in that range is lost on the next splice, so
  shared helpers live above it.

### Section backgrounds

Sections pick their own band colour, so two neighbours can land on the same one and
the seam between them disappears. `alternate()` in `build.js` walks the sections of
each page and shifts any band that repeats the one before it. The trust strip and
the footer are both the darkest navy, so they bracket the run: a page cannot open or
close on that colour. The scroll journey is exempt — its styling is keyed to the
cyan band.

### The instant quote

`/get-a-quote/` is a port of the client's React prototype in
`website-changes/Portabox-Instant-Quote-source code` — the same five steps
(where, what, size, when, quote), the same pricing engine, the same numbers.
It replaced a single screen that asked nine questions, including email and
phone, before showing anything.

The numbers are not retyped. `tools/extract-quote-data.cjs` lifts the rates,
delivery zones, leg fees, interstate matrix, fuel surcharge, supplies pricing
and the postcode table straight out of the prototype's TypeScript into
`build/quote-data.json`, which the build inlines into the page. Run it again
whenever the client sends a new build of the quote app.

Where the prototype has no number — delivery zone 4, a state with no depot, a
blocked postcode — the page says so and asks for a call. It does not guess.

It lives in its own module because `tools/add-variant-g.py` replaces
everything between the giga marker and the emit section of `build.js`.

## The design

One system across every page: square corners, hairline rules, and the brand palette
of navy `#0E385D`, cyan `#1EC4F4` and yellow `#FED200` in Montserrat. `DESIGN.md`
has the reasoning; `site/assets/css/giga.css` is the whole of it.

Two details worth knowing before editing the CSS:

- **Reveal animations own `transform`.** Elements carrying `.g-rise` have their
  `transition` set by `.g-rise.in`, which is a shorthand and replaces the whole
  transition list. Card hovers therefore lift with the independent `translate`
  property and restate their transition at a higher specificity.
- **Nothing faded on cyan.** Navy text at 80% opacity measures 3.97:1 on the cyan
  band, below AA. On cyan, text is full navy — de-emphasis uses weight instead.
- **A hairline is not a control edge.** `--g-rule` is decoration and measures
  1.38:1 on white. The border of an input, select or choice box is held to 3:1
  by WCAG 1.4.11, which is a different rule from text contrast — the whole site
  passed AA while every field was outlined in that hairline. Controls use
  `--g-ctrl` instead; `tools/g-control-contrast.cjs` measures it.

## Verification

Scripts in `tools/` measure rather than eyeball. With the server running:

```bash
node tools/verify-site.cjs          # links, overflow, HTTP status, JS errors
node tools/g-contrast-all.cjs       # WCAG AA across every page
node tools/g-control-contrast.cjs    # WCAG 1.4.11: control borders, a separate rule
node tools/g-phero-audit.cjs        # hero text sampled against the actual photos
node tools/g-mega-contrast.cjs      # the nav mega panels
node tools/g-journey.cjs index      # scrubs the scroll animation beat by beat
node tools/g-pages-states.cjs       # mobile, reduced motion, JS-off FAQ
node tools/g-quoteflow.cjs          # drives the quote and checks its arithmetic
node tools/g-responsive.cjs         # overflow, tap targets and text size,
                                    # 360 / 390 / 414 / 768 / 820 / 1024 / 1180
```

## Deployment

Vercel serves `site/` as the web root (`outputDirectory`), which is why links and
asset paths are root-relative. `node build/build.js` runs on every deploy, so the
live site always reflects the sources. The generator needs no packages, so the
install step is a no-op.

`vercel.json` cannot carry comments, so the caching reasoning lives here:

- **`/assets/img` and `/assets/video`** are `immutable` for a year. Those files
  keep their names deliberately; replace one by changing its filename.
- **`/assets/css` and `/assets/js` must NOT be `immutable`.** They keep their
  filenames across deploys, so a browser would hold a stale copy for as long as
  the header says and never revalidate. This actually happened: a fixed redirect
  kept 404ing for anyone who had already loaded the old script. The build appends
  a content hash (`giga.js?v=2aba84ae`) so a new build produces a new URL, which
  also bypasses caches already holding the old copy.

Run `node tools/check-vercel.cjs` before pushing config changes. An invalid key
fails the *deploy*, not the build, so it is only visible in the dashboard — a
stray `"comment"` in a header rule cost one failed deploy.

## Not wired up yet

The forms validate in the browser but have nowhere to post. They say so on submit
rather than pretending a message was sent. Before launch, point these at a real
handler or a WordPress form plugin:

- the last step of the quote on `/get-a-quote/`. The price it shows is real — it
  is computed in the browser from the client's own engine — but there is no
  mailbox behind the "send me this quote" button, and the page says so.
- the enquiry form on `/contact/`
- the postcode boxes, which resolve a depot client-side and hand the postcode
  to the quote flow, where it answers step 1

## Content that must not be invented

`PRODUCT.md` records what the client has actually published. Years trading, delivery
totals, review counts, star ratings, named business customers, press coverage and
certifications have **not** been supplied and do not appear anywhere on the site.
The testimonials are real, from the live site. Photography is the client's own.

Full pre-launch checklist at the end of `WORDPRESS.md`.
