# Portabox — website rebuild

A static rebuild of [portabox.au](https://portabox.au), generated from a small Node script.
22 pages, one visual system, no runtime framework. Intended to be ported to WordPress —
see [WORDPRESS.md](WORDPRESS.md).

## Run it

```bash
node build/build.js                       # writes site/
npx http-server -p 8899 -c-1              # then open http://127.0.0.1:8899/site/
```

A server is needed rather than opening the files directly: the pages use relative
asset paths and the scroll-driven sections read layout on load.

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

## Verification

Scripts in `tools/` measure rather than eyeball. With the server running:

```bash
node tools/verify-site.cjs          # links, overflow, HTTP status, JS errors
node tools/g-contrast-all.cjs       # WCAG AA across every page
node tools/g-phero-audit.cjs        # hero text sampled against the actual photos
node tools/g-mega-contrast.cjs      # the nav mega panels
node tools/g-journey.cjs index      # scrubs the scroll animation beat by beat
node tools/g-pages-states.cjs       # mobile, reduced motion, JS-off FAQ
```

## Not wired up yet

The forms validate in the browser but have nowhere to post. They say so on submit
rather than pretending a message was sent. Before launch, point these at a real
handler or a WordPress form plugin:

- the quote request on `instant-quote.html` (the live site posts to Gravity Forms)
- the enquiry form on `contact-us.html`
- the postcode boxes, which currently resolve a depot client-side and hand the
  postcode to the quote page

## Content that must not be invented

`PRODUCT.md` records what the client has actually published. Years trading, delivery
totals, review counts, star ratings, named business customers, press coverage and
certifications have **not** been supplied and do not appear anywhere on the site.
The testimonials are real, from the live site. Photography is the client's own.

Full pre-launch checklist at the end of `WORDPRESS.md`.
