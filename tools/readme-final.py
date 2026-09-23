"""Bring site/README.md in line with the finalised homepage."""
import io

r = 'site/README.md'
t = io.open(r, encoding='utf-8').read()

t = t.replace(
"18 static pages. No build step at runtime, no framework, no dependencies. Concourse-style layout grammar rendered entirely in the Portabox design system from `../brand/DESIGN.md`.",
"18 static pages. No build step at runtime, no framework, no dependencies. The homepage follows stivio.ai's warm-editorial structure; the inner pages follow concourse.ai's band layout. Both are rendered entirely in the Portabox design system from `../brand/DESIGN.md`.")

old = """## What came from where

- **Layout grammar** — concourse.ai: cinematic full-bleed dark heroes, alternating dark/light bands, a pill "chip" above centred statements, display type at 84px on ~1.06 leading with negative tracking, 1380px container, very generous vertical rhythm."""
new = """## What came from where

**Homepage — after stivio.ai.** Split hero with the quote widget as an inline tool card, warm cream ground (`#F1EFEA`) instead of white, light-weight (500) display type, features and pricing as hairline-ruled columns and rows, and a deliberately quiet statement band on deep navy.

Chosen from three candidates. The other two — a photo-led cinematic version and a price-led editorial version — were removed once this one was picked.

**Inner pages — after concourse.ai.** Cinematic full-bleed dark heroes, alternating dark/light bands, chip labels above centred statements, 1380px container, generous vertical rhythm. These are unchanged and still to be reviewed.

- **Layout grammar** — concourse.ai, as above."""
if old in t:
    t = t.replace(old, new)

old2 = "- **Photography** — your real images, pulled from portabox.au. No stock, no AI imagery."
new2 = """- **Photography** — your real images, pulled from portabox.au. No stock, no AI imagery.
- **CTA buttons** — the edge-tracing effect from Uiverse.io by Nawsome, rebuilt on the brand palette. Four 2px edges trace inward on hover, then the label rotates out and a second line rises in. Currently on the homepage only (`Get a price` → `Let's go`, `Call the depot` → `1800 467 637`). The original renders its text from `data-` attributes through `::before`/`::after`, which assistive tech does not reliably announce — this version keeps the visual in the pseudo-elements and carries a real `.sr-only` label for screen readers, and animates `transform` rather than `width`/`height`."""
if old2 in t:
    t = t.replace(old2, new2)

t = t.replace("""## Verified

- 18/18 pages: no horizontal overflow at 1440px or 390px""",
"""## Verified

- 18/18 pages: no horizontal overflow at 1440px or 390px
- Trace buttons resolve to single accessible names (`Get a price`, `Call the depot`)""")

io.open(r, 'w', encoding='utf-8').write(t)
print('site/README.md updated')
