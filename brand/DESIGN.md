---
version: 1.0
name: Portabox-design-system
description: >
  The Portabox brand system, extracted from the live site (portabox.au) and the
  Netlify concept build. A three-colour Australian logistics identity: a cyan
  brand field carries the chrome, a deep navy carries every piece of ink, and a
  single saturated yellow is reserved for action. Montserrat does all the work,
  heavy (800) at display sizes with the headline set sentence-case rather than
  shouted. Buttons are full pills. Imagery is documentary photography of real
  people beside real containers in real Australian streets — never studio
  product shots, never stock-office abstraction. The system reads friendly,
  practical and unpretentious: a trades brand that has been designed, not a tech
  brand pretending to move furniture.

colors:
  # Brand
  cyan: "#1EC4F4"            # the brand field — chrome, bars, logo ground
  navy: "#0E385D"            # the ink — headings, body on light, text on cyan/yellow
  yellow: "#FED200"          # action only — primary CTAs, never decoration

  # Ink
  ink: "#111111"             # body copy on white
  ink-muted: "#5E6A73"       # secondary copy, captions
  ink-on-brand: "#0E385D"    # text sitting on cyan or yellow
  ink-inverse: "#FFFFFF"     # text on navy, on cyan, on photography

  # Surfaces
  canvas: "#FFFFFF"
  surface-tint-cyan: "#EAF8FE"   # section wash, cards
  surface-tint-yellow: "#FFF1A8" # highlight / callout wash
  surface-navy: "#0E385D"
  surface-navy-deep: "#1B2F3A"   # footer, dark sections

  # Lines
  hairline: "#D6E3EC"
  hairline-strong: "#AFC4D4"

  # State
  focus: "#FED200"
  success: "#1E9E5A"
  error: "#C4372C"

typography:
  family: "Montserrat"
  fallback: "Montserrat, 'Helvetica Neue', Arial, sans-serif"
  weights: [400, 500, 600, 700, 800]
  display-weight: 800
  display-case: "sentence"
  display-tracking: "-0.01em"
  display-leading: 1.10
  body-leading: 1.65
  measure: "62ch"

shape:
  radius-pill: "999px"      # buttons, chips, inputs
  radius-card: "16px"
  radius-media: "24px"
  radius-control: "4px"
  border-width: "2px"

elevation:
  card: "0 18px 40px -24px rgba(14, 56, 93, 0.35)"
  lift: "0 24px 50px -28px rgba(14, 56, 93, 0.55)"
  block: "0 6px 0 0 #0E385D"   # hard navy offset — use sparingly, see Elevation

motion:
  ease: "cubic-bezier(0.16, 1, 0.3, 1)"
  fast: "160ms"
  base: "240ms"
  slow: "400ms"
---

# Portabox Design System

Extracted from **portabox.au** and **portabox.netlify.app** on 21 September 2026 by reading computed styles off the rendered pages — not by eye. Every hex, weight and radius below is a value one of those two sites is actually shipping, unless it is marked **Proposed**, which means I am filling a gap the audit exposed.

Facebook was not usable: `facebook.com/portabox.au` is behind a login wall and returned no brand content. Nothing in this document is derived from social.

---

## 1. The idea in one paragraph

Portabox is a **cyan field, navy ink, and one yellow button**. The cyan is the brand's chrome — it wraps the navigation, the sticky action bar and the logo lockup, and it is the colour a customer sees on the side of the container in the street. Navy does all the reading. Yellow appears only where the business wants a click. That restraint is the system's best quality and it is already 90% right in production; most of what follows is codifying it and repairing the places where execution drifted.

---

## 2. Colour

### Roles, not swatches

| Role | Value | Where it goes |
|---|---|---|
| **Brand field** | `#1EC4F4` cyan | Nav bar, sticky action bar, logo ground, section washes, container livery |
| **Ink** | `#0E385D` navy | All headings. Body text on cyan and on yellow. Icon strokes. |
| **Action** | `#FED200` yellow | Primary CTAs. Nothing else. |
| **Body** | `#111111` | Paragraph copy on white |
| **Secondary** | `#5E6A73` | Captions, helper text, meta |
| **Canvas** | `#FFFFFF` | Default page |

### The cyan rule — this one matters

`#1EC4F4` on white measures **2.05:1**. White on `#1EC4F4` also measures **2.05:1**. Both fail WCAG AA for body text *and* for large text.

> **Cyan is a surface colour, never a text colour on white, and never a background for white text.**

Navy on cyan measures **5.89:1** and passes comfortably. That is why the nav works: the links are navy, not white. Keep it that way. When something must be cyan-coloured text, put it on navy (`#1EC4F4` on `#0E385D` = 5.89:1, passes).

The live site also carries `#6EC1E4` in a few places — an Elementor default blue, not a brand colour, and it measures 2.02:1 on white. Remove it.

### Verified contrast

| Pair | Ratio | AA body | AA large |
|---|---:|---|---|
| Navy on white | 12.05 | Pass | Pass |
| Ink on white | 18.88 | Pass | Pass |
| Secondary on white | 5.55 | Pass | Pass |
| Navy on yellow | 8.28 | Pass | Pass |
| White on navy | 12.05 | Pass | Pass |
| Navy on cyan | 5.89 | Pass | Pass |
| Navy on cyan tint | 11.11 | Pass | Pass |
| **Cyan on white** | **2.05** | **Fail** | **Fail** |
| **White on cyan** | **2.05** | **Fail** | **Fail** |
| **`#6EC1E4` on white** | **2.02** | **Fail** | **Fail** |

### Ratio in practice

Roughly **60% white, 25% cyan and navy, 10% tints, 5% yellow.** Yellow crossing about 5% of a page is the signal that it has stopped meaning "click here". The live site respects this; keep measuring it.

---

## 3. Typography

**Montserrat, everything.** The live site currently also loads **Roboto** (93 elements) — that is a WordPress theme or plugin default leaking through, not a brand decision. Remove it; it is a wasted font request and a visible inconsistency.

### The scale

Production sets H1 at 64–68px and H2 at 42–56px, then drops straight to 17.5–19px for H3. **There is no intermediate step**, so any section needing a mid-level heading has nowhere to go. The scale below keeps the measured display sizes and fills the hole.

| Token | Size (desktop) | Size (mobile) | Weight | Leading | Tracking | Use |
|---|---|---|---|---|---|---|
| `display` | 68px | 38px | 800 | 1.10 | -0.015em | Hero only |
| `h1` | 56px | 34px | 800 | 1.12 | -0.01em | Page title |
| `h2` | 42px | 30px | 800 | 1.15 | -0.01em | Section |
| `h3` | 28px | 24px | 700 | 1.25 | -0.005em | Sub-section — **Proposed**, fills the gap |
| `h4` | 19px | 18px | 700 | 1.30 | 0 | Card title |
| `body-lg` | 18px | 17px | 400 | 1.65 | 0 | Lede |
| `body` | 16px | 16px | 400 | 1.65 | 0 | Default |
| `body-sm` | 14px | 14px | 400 | 1.6 | 0 | Meta, captions |
| `label` | 13px | 13px | 600 | 1.3 | 0.04em | Form labels, eyebrows |

**Sentence case, not caps.** "Storage That Stays at Your Place" is title case in production; sentence case reads warmer and is easier at 68px. Either is defensible — what is not defensible is mixing them, which currently happens.

**Never set body text below 14px.** The live site's buttons run 12px, which is too small for a primary action — see below.

**Measure caps at 62ch.** The hero lede currently runs long on wide screens.

---

## 4. Buttons

The button system is the strongest thing in the brand and the most inconsistently applied. Pills are correct — `border-radius: 999px` (production uses `80px`, which is the same thing at these heights).

| Variant | Background | Text | Border | Use |
|---|---|---|---|---|
| **Primary** | `#FED200` | `#0E385D` | none | The one action on the screen. Instant Quote. |
| **Secondary** | transparent | `#0E385D` | 2px `#0E385D` | Book Now, alternatives |
| **On photography** | transparent | `#FFFFFF` | 2px `#FFFFFF` | Over hero imagery |
| **On navy** | `#FED200` | `#0E385D` | none | Same primary, unchanged |

**Fixed specification** (production currently varies — see §9):

- Height 48px desktop / 52px mobile, padding `14px 28px`
- Font size **15px**, weight **600**, sentence case
- Hover: darken yellow to `#E8BF00`, lift `translateY(-1px)`
- Active: `translateY(1px)`
- Focus: `3px` yellow ring at `2px` offset — and on yellow buttons, a navy ring instead so it is visible
- Minimum touch target 44px including padding

**One primary per viewport.** The live page shows "Instant Quote" in the nav, again in the hero, and again in a sticky bottom bar — three identical yellow pills competing at once. Keep the sticky bar *or* the nav button, not both.

---

## 5. Shape and elevation

Production ships six radii — `3px, 4px, 16px, 24px, 50px, 80px` — which is four too many.

| Token | Value | Use |
|---|---|---|
| `radius-pill` | `999px` | Buttons, chips, inputs, tags |
| `radius-card` | `16px` | Cards, panels |
| `radius-media` | `24px` | Photography, video |
| `radius-control` | `4px` | Checkboxes, small inputs |

> **Divergence on the site build.** The multi-page site in `site/` deliberately
> squares everything off after concourse.ai: cards at `0px` with a 1px hairline
> border and no shadow, buttons at `8px`. That was a client decision made after
> this audit, and it suits a container business — the product is a box. The pill
> language described below is what **portabox.au currently ships**; treat `site/`
> as the newer direction, not as drift.

**Elevation: pick one language.** The Netlify build uses a hard navy offset shadow (`0 4px 0 0 #0E385D`) *and* a soft diffused shadow in the same page. They belong to different worlds. The hard block reads confident and slightly playful and suits a trades brand; the soft shadow is the safer, more conventional choice.

Recommendation: **soft as the default** (`0 18px 40px -24px rgba(14,56,93,.35)`) with the hard navy block reserved as a deliberate accent on one or two elements per page — a price card, a testimonial. Declare elevation once per element: a border *or* a shadow, not both.

---

## 6. Spacing — **Proposed**

The audit did not produce a clean spacing scale (Elementor emits ad-hoc values). Use an 8px base:

`4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128`

- Section padding: `96px` desktop, `56px` mobile
- Grid gutter: `24px` desktop, `16px` mobile
- Container max-width: `1200px`, side gutter `24px` / `16px`
- More space above a heading than below it — roughly 2:1 — so headings group with their own content

---

## 7. Photography and iconography

**Photography is the brand's biggest asset and it is already right.** Real Australian streets, real customers, real staff in hi-vis, real containers with the livery visible. Natural daylight, mid-distance, people in the frame doing something. A handshake at a driveway. A man loading a sofa. Keep commissioning exactly this.

Avoid: studio cut-outs of containers, stock photos of generic warehouses, anything with an American streetscape, empty containers with no human in frame.

Treat with `radius-media` (24px). Where text sits over an image, use a navy scrim at 45–60% rather than lightening the photo.

**Icons are currently 60×60 PNG rasters** (`icon-truck.png`, `icon-key.png`, `icon-box.png`, `icon-calculator.png`, `icon-globe.png`). Convert to SVG at a single stroke weight (2px, round caps) in navy. Rasters cannot recolour, do not scale on retina, and each one is a network request.

---

## 8. Logo

The wordmark is **"portabox"** set in a heavy geometric sans, lowercase, with `porta` in navy and `box` in white, above a tracked-caps tagline "MOVING AND STORAGE CONTAINERS". It is a good mark: the two-tone split makes the compound name legible instantly.

**The file has a problem.** `logoo.png` (2145×775) has the **cyan background baked in** rather than being transparent. It only works because it happens to sit on a cyan nav — and on the Netlify build the logo's cyan and the nav's cyan are very slightly different, which shows as a faint rectangle around the mark.

Required assets:
1. **SVG, transparent** — navy `porta` + white `box`, primary use on cyan or navy
2. **SVG, transparent, all-navy** — for white and light backgrounds, where the white `box` would vanish
3. **SVG, transparent, all-white** — for photography and dark navy
4. Clear space: the height of the `b` on all sides
5. Minimum width: 140px digital, 30mm print
6. Never: recolour outside these three, stretch, add effects, or place the two-tone version on white

---

## 9. What the audit found wrong

Concrete, fixable, ordered by cost of leaving it:

1. **Cyan text fails contrast.** `#1EC4F4` on white is 2.05:1. Anywhere cyan is used as text or as a background for white text, it is unreadable for a real portion of your customers. **Fix first.**
2. **Two yellows.** `#FED200` everywhere, but the form Submit button is `#FED203` with `#373737` text. Consolidate to `#FED200` / `#0E385D`.
3. **Roboto is loading** on the live site alongside Montserrat. Theme leakage. Remove.
4. **`#6EC1E4`** — an Elementor default blue, not a brand colour, failing contrast at 2.02:1. Remove.
5. **Button text at 12–13px** with weights split between 500 and 600 across the two builds. Standardise at 15px / 600.
6. **Six border radii.** Reduce to the four in §5.
7. **No H3 tier** — the scale falls off a cliff from 42px to 19px.
8. **Three simultaneous primary CTAs** in one viewport.
9. **Logo has a baked-in background.** Needs transparent SVGs.
10. **Icons are PNG.** Needs SVG.

---

## 10. Voice

Drawn from the copy both sites already ship — this is descriptive, not invented.

Plain Australian English. Short sentences. Concrete nouns. The brand talks about driveways, keys, boxes and months, not "solutions" or "journeys". It is confident about price and says the number out loud: *"From $209 per month"*, *"No stressful facility trips, no inflated prices."*

- **Say:** "It stays at your place." / "You hold the only keys." / "We'll beat it, not just match it."
- **Don't say:** "Seamless storage solutions." / "Revolutionising the way Australians store." / "Unlock your space."

Headlines are a claim, not a tagline. Body copy answers the next practical question. CTAs are verbs the customer would use — "Instant Quote", "Book Now", "See How It Works".

---

## 11. Files

- `portabox-tokens.css` — every token above as CSS custom properties, ready to drop into a WordPress theme
- `styleguide.html` — a living specimen page; open it to see the system rendered, including the contrast failures called out in §2

## 12. Relationship to the Load Plan concept

This document describes **the brand as it exists today**. The homepage concept in the project root (`index.html`, `DESIGN.md` at root) is a separate, deliberately bolder reinvention that was briefed and approved earlier — it is not this system, and the two should not be merged without a decision about which direction Portabox is committing to.
