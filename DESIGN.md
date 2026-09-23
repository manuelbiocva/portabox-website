# Design

The visual world is **The Load Plan**: a measured cutaway drawing of a storage volume. Storage is sold here as *volume you can see*, not as reassurance. The page refuses the category arrangement — white ground, stock truck photograph, three rounded cards, "Simple. Affordable. Secure." — and equally refuses that arrangement's predictable opposite, the hi-vis industrial warehouse page.

Seed `fd10f1cf`, direction candidate 4.

---

## Colour

Four named roles. Each has exactly one job, and the discipline is the point.

| Token | Value | Job |
|---|---|---|
| `--ink` | `#15181A` | The primary ground. Structure and type reverse out of it. |
| `--ink-2` | `#1F2427` | Inset surfaces on ink: inputs, result panels. |
| `--ink-3` | `#2B3135` | Solid fills inside the drawing. |
| `--rule` | `#3B4348` | Every 1px line on the ink ground. **Never text.** |
| `--film` | `#E9EBE5` | The drafting ground. Alternating sections invert to it. |
| `--film-2` / `--film-3` | `#DFE2DA` / `#C9CDC3` | Film-side fills and rules. |
| `--graphite` | `#5E6660` | Body text **on film only** (5.9:1). A line colour on ink. |
| `--graphite-2` | `#848C85` | Secondary text **on ink** (5.9:1). |
| `--markup` | `#C4372C` | Revision ink. The argument, never decoration. |
| `--markup-on-ink` | `#E4574A` | Small red text on ink, to clear 4.5:1. |
| `--markup-on-film` | `#A62B21` | Small red text on film, to clear 4.5:1. |
| `--wash` | `#E5B33D` | Highlighter. Focus rings, selection, the live dimension, primary hover. |
| `--sheet` | `#FFFFFF` | The container. Always drawn white, never tinted. |

**Strategy: committed.** The ink ground owns the majority of the surface, and film sections invert wholesale rather than tinting. Light versus dark was decided from the use scene — someone on a phone, mid-move, in daylight — which is why the *film* sections carry the long reading (the problem, the method, the testimonials) while ink carries the drawing and the numbers.

**The red rule.** `--markup` appears on the per-cubic-metre figure, the price-match line, the active size, the live volume callout, and the strikethrough on the category's habits. It appears nowhere else. If red is on screen, it is making the argument. This discipline was raised from the Bioluminescent Wake challenger.

**The white rule.** The container is `#FFFFFF` in every drawing at every size. Its discretion is a product selling point, so the palette does not get to take it.

---

## Type

| Role | Face | Use |
|---|---|---|
| Display | **Cabinet Grotesk** 700/800/900 | Headings only. Uppercase, `line-height: .93`, `letter-spacing: -.03em`. |
| Body | **Satoshi** 400/500/700 | All prose, and all field labels. |
| Measurement | **Geist Mono** 400/500 | Every measured quantity and nothing else. |

Mono is reserved for **measurement**: millimetres, cubic metres, dollars, postcodes, phone numbers, radii. Field *labels* are lettering, not quantities, so they are Satoshi at 11px / `.16em` uppercase. This distinction is what keeps mono from becoming a costume.

Nothing functional renders below **11px**. Body measure caps at 52ch for ledes, 68ch for prose. Display caps at `4.3rem`.

---

## Composition

- Asymmetric throughout. Nothing centred. Content sits on a 12-column grid at `≥1024px`, single column below.
- Container `max-width: 1500px`, gutter `1rem → 2.5rem`, plus a `76px` left inset at `≥1280px` for the sheet rail.
- **Cards are not the page structure.** Sections are built from ruled rows — `border-bottom` on list items, `divide`-style separation — the way a schedule of quantities is ruled. The only bordered boxes on the page are the two EARL comparison panels, where the border is the frame of a drawing, and the quote result panel, where elevation is functional.
- **No eyebrows or kickers.** Not once. Section headings stand alone. Wayfinding lives in the **sheet rail** — a fixed edge index of sheets 01–07 that reports position and navigates, the way a drawing set is tabbed.
- **Title blocks** are bordered field strips carrying real reference data (depots, capacity, phone). They sit at section boundaries, never above a heading.

---

## Drawing system

The container is generated in JavaScript as an isometric cutaway, not authored as a static asset. `x` runs length, `y` runs depth, `z` is height; projection is standard 30° isometric at 62px per metre.

- The **near side wall and roof are cut away** so the load reads. The removed plane is drawn as a dashed cut line — the drafting convention, not a missing wall.
- The **load is deterministic**: the same container length always packs the same way, in three lanes (tall goods against the far wall, cartons stacked in the middle, recognisable household items nearest the cut).
- **Cross-section is constant across the range; length is what changes.** Stepping Small → Medium → Large extends the box along one axis, so the size comparison is a physical one rather than three differently-scaled pictures.
- **Dimension lines** carry extension lines, tick terminators and self-lettering values. The volume hangs on a **curved leader line** with a numeral dot — raised from the Patent Drawing Sheet challenger.
- Hatching, never flat fill, indicates ground shadow.

This is geometry, not illustration: crisp vector shapes a session can specify exactly. No sketch-style linework, no `feTurbulence`, no SVG imitating a photograph.

---

## Motion

One grammar, two authored moments.

**Grammar.** Linework draws itself via `stroke-dashoffset`, with true path lengths measured at runtime so the draw-on is even. Everything else is `transform` and `opacity` only — no layout properties are animated. Easing is exponential ease-out `cubic-bezier(.16,1,.3,1)`.

**Moment one — the dimension re-measure.** Selecting a size redraws the container, re-letters the dimension lines, re-stacks the load, and steps the per-m³ figure to its new value. It **snaps with a single overshoot and settles**; it does not glide or crossfade. Raised from the Depot Destination Blind challenger, whose rule is that nothing glides and every change snaps one course.

**Moment two — the EARL scrub.** A `260vh` track with a sticky viewport drives a side-elevation comparison: the tilt tray rotates 26° and its load slides down the slope, while the Portabox container lowers 92px dead level. Progress is read from `getBoundingClientRect` inside a `requestAnimationFrame` gate — never a raw scroll handler.

**Reduced motion** is honoured completely: the scrub becomes a static side-by-side at its end state, all linework renders already-drawn, counters jump to final values, and the sticky track collapses.

---

## Browser surfaces

These ship with the design, not with the browser: text selection (`--wash` on `--ink`), the caret (`--markup`), the scrollbar (thumb `--rule` on an ink track, with a film-side context), focus rings (`2px --wash`, `3px` offset), underline offset (`.22em`), and tabular figures on every compared quantity.

---

## States

Every interactive element ships hover, focus-visible, active (`translateY(1px)`), and disabled. The quote form ships **idle, loading** (three pulsing dots, button disabled, label hidden), **error** (inline, `aria-invalid`, red rule, focus returned to the field) and **success** (depot result with a spring settle, `aria-live="polite"`). Tabs are full ARIA tablists with arrow-key navigation.

---

## Accessibility floor

WCAG 2.1 AA. All body text ≥4.5:1 and verified per ground — which is why red and graphite each have two values. Touch targets ≥44px. Heading order unbroken. Skip link. Every icon-only control labelled. `prefers-reduced-motion` fully supported.

---

## Deliberate departures

Three mechanical-detector findings are kept, as design decisions rather than oversights:

1. **Numbered process steps (01/02/03).** Section numbering is normally a default worth refusing, but the carve-out is "unless the sequence itself carries information the reader needs". Delivery order is exactly that information.
2. **The EARL side-elevation diagrams** register as assembled shapes. They are technical geometry doing explanatory work — the one thing the page must *demonstrate* rather than assert.
3. **The overshoot easing** `cubic-bezier(.2,1.5,.4,1)`. Bounce is usually a tell; here it is the briefed snap-and-settle donated from the Depot Blind, and it appears only on the size change.

A further ~42 "cramped padding" findings are a heuristic misreading `padding-block` shorthand; the rendered spacing is `1.5–1.75rem` on every ruled row.

---

## Not in this build

No photography — none was supplied, and none is invented. Every figure on the page is published by Portabox except the container's linear dimensions, which are **derived from the published volumes** against an assumed cross-section and are labelled indicative on screen. There are no star ratings, review counts, delivery totals, years-trading, certifications or named business customers anywhere, because none were supplied. See `WORDPRESS.md` for the replace-before-launch list.
