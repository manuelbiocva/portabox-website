"""Record the squared-off shape decision in the brand doc and the site README."""
import io

# ---- brand/DESIGN.md: note the site's deliberate divergence -------------
p = 'brand/DESIGN.md'
s = io.open(p, encoding='utf-8').read()

anchor = "**Elevation: pick one language.**"
note = """> **Divergence on the site build.** The multi-page site in `site/` deliberately
> squares everything off after concourse.ai: cards at `0px` with a 1px hairline
> border and no shadow, buttons at `8px`. That was a client decision made after
> this audit, and it suits a container business — the product is a box. The pill
> language described below is what **portabox.au currently ships**; treat `site/`
> as the newer direction, not as drift.

"""
if "Divergence on the site build" not in s and anchor in s:
    s = s.replace(anchor, note + anchor)
    io.open(p, 'w', encoding='utf-8').write(s)
    print('brand/DESIGN.md: divergence recorded')
else:
    print('brand/DESIGN.md: already noted or anchor missing')

# ---- site/README.md: replace the shape line ----------------------------
r = 'site/README.md'
t = io.open(r, encoding='utf-8').read()

old = "- **Everything visual** — your own system: navy `#0E385D`, cyan `#1EC4F4`, yellow `#FED200`, Montserrat, pill buttons. Concourse's near-black, light-weight type and small radii were *not* carried over; brand beats reference."
new = """- **Everything visual** — your own system: navy `#0E385D`, cyan `#1EC4F4`, yellow `#FED200`, Montserrat. Concourse's near-black and light-weight 400 display type were *not* carried over; brand beats reference on colour and typography.
- **Shape** — squared off after Concourse, overriding the pill buttons in `../brand/DESIGN.md`. Measured from the reference and matched: cards `border-radius: 0`, 1px hairline border, **no shadow**; buttons `8px`, 48px tall. Nothing on the site is a pill. Rendered radius audit returns only 4px, 8px and 1px."""

if old in t:
    t = t.replace(old, new)
    io.open(r, 'w', encoding='utf-8').write(t)
    print('site/README.md: shape section updated')
else:
    print('site/README.md: line not found, leaving as is')
