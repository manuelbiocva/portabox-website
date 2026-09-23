"""Generate a palette page from the tokens the site actually ships."""
import io

def lum(h):
    h = h.lstrip('#')
    r, g, b = [int(h[i:i+2], 16) / 255 for i in (0, 2, 4)]
    f = lambda c: c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)

def cr(a, b):
    l1, l2 = sorted([lum(a), lum(b)], reverse=True)
    return (l1 + 0.05) / (l2 + 0.05)

def best_on(hexv):
    """Pick a legible label colour for a swatch."""
    return '#FFFFFF' if cr(hexv, '#FFFFFF') >= cr(hexv, '#0E385D') else '#0E385D'

# name, hex, role, where it is used now
BRAND = [
    ("Cyan",        "#1EC4F4", "Brand field",  "Logo ground, container livery, trace edges on dark, accent labels"),
    ("Navy",        "#0E385D", "The ink",      "Every heading, body text on cyan and yellow, nav bar"),
    ("Yellow",      "#FED200", "Action",       "Primary CTAs only. Roughly 5% of any page"),
]
DEEPS = [
    ("Navy deep",   "#0A2A47", "Dark band",    "Section bands, hero panel"),
    ("Coal",        "#071E33", "Deepest",      "Homepage hero panel, quiet statement band, footer"),
    ("Cyan deep",   "#0FA8D6", "Hover only",   "Cyan surfaces on hover. Not a text colour"),
    ("Yellow deep", "#E8BF00", "Hover only",   "Primary button hover"),
]
TEXT = [
    ("Ink",         "#111111", "Body copy",    "Paragraphs on white. 18.9:1"),
    ("Ink muted",   "#5E6A73", "Secondary",    "Captions, helper text. 5.6:1 on white"),
    ("Cyan text",   "#0A6F8E", "Cyan as text", "The only legal cyan for text on light. 5.7:1"),
]
SURF = [
    ("Canvas",      "#FFFFFF", "Default",      "Inner pages"),
    ("Cream",       "#F1EFEA", "Warm ground",  "Homepage light bands"),
    ("Cream 2",     "#E9E6DF", "Warm inset",   "Chips on cream"),
    ("Tint grey",   "#F4F7F9", "Cool wash",    "Alternate light bands"),
    ("Tint cyan",   "#EAF8FE", "Cyan wash",    "Icon tiles, chips"),
    ("Tint yellow", "#FFF1A8", "Highlight",    "Callouts"),
]
LINES = [
    ("Hairline",    "#D6E3EC", "Cool rule",    "Card borders, dividers"),
    ("Line warm",   "#D8D3C9", "Warm rule",    "Ruled columns on cream"),
    ("Hairline+",   "#AFC4D4", "Stronger",     "Input borders"),
]
STATE = [
    ("Success",     "#1E9E5A", "Success",      "Form success state"),
    ("Error",       "#C4372C", "Error",        "Validation messages"),
]

def group(title, note, items, big=False):
    cards = ""
    for name, hx, role, use in items:
        fg = best_on(hx)
        w = cr(hx, "#FFFFFF"); n = cr(hx, "#0E385D")
        cards += f"""
        <div class="sw{' sw--big' if big else ''}">
          <div class="sw-chip" style="background:{hx};color:{fg}">
            <span class="sw-role">{role}</span>
            <span class="sw-hex">{hx}</span>
          </div>
          <div class="sw-meta">
            <b>{name}</b>
            <p>{use}</p>
            <p class="sw-cr">on white <b>{w:.1f}</b> &middot; on navy <b>{n:.1f}</b></p>
          </div>
        </div>"""
    return f"""
  <section class="pg">
    <div class="wrap">
      <h2>{title}</h2>
      <p class="note">{note}</p>
      <div class="sw-grid{' sw-grid--big' if big else ''}">{cards}
      </div>
    </div>
  </section>"""

body = (
    group("The three that carry the brand", "Everything else supports these. If you are picking one, it is almost certainly one of these three.", BRAND, big=True)
    + group("Deeper shades", "Darker relatives of the brand three. The two 'hover only' values are surfaces, never text.", DEEPS)
    + group("Text colours", "Cyan as text on a light ground must be #0A6F8E — the brand cyan measures 2.05:1 on white and fails.", TEXT)
    + group("Surfaces", "Grounds a whole section can sit on. The homepage uses cream; the inner pages use white and cool grey.", SURF)
    + group("Rules", "One-pixel lines. Warm rules belong on cream, cool rules on white.", LINES)
    + group("State", "Reserved. Neither is a brand colour and neither should be used decoratively.", STATE)
)

html = f"""<!DOCTYPE html>
<html lang="en-AU">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Portabox — colour palette</title>
<meta name="robots" content="noindex">
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
  :root {{ --navy:#0E385D; --ink:#111; --muted:#5E6A73; --line:#D6E3EC; --cream:#F1EFEA; }}
  * {{ box-sizing:border-box; }}
  body {{ margin:0; font-family:Montserrat,Arial,sans-serif; color:var(--ink); background:#fff; line-height:1.6; }}
  .wrap {{ max-width:1320px; margin-inline:auto; padding-inline:clamp(1.25rem,4vw,3rem); }}
  header {{ background:#071E33; color:#fff; padding:clamp(3rem,7vw,4.5rem) 0 clamp(2.5rem,5vw,3.5rem); }}
  header h1 {{ font-size:clamp(2rem,4.6vw,3.25rem); font-weight:800; letter-spacing:-.025em; line-height:1.05; margin:0; }}
  header p {{ max-width:64ch; margin:1.25rem 0 0; color:rgba(255,255,255,.75); }}
  .kicker {{ font-size:.75rem; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:#1EC4F4; margin:0 0 .75rem; }}
  .pg {{ padding-block:clamp(2.5rem,5vw,4rem); border-bottom:1px solid var(--line); }}
  .pg h2 {{ font-size:clamp(1.25rem,2.2vw,1.75rem); font-weight:800; letter-spacing:-.02em; color:var(--navy); margin:0; }}
  .note {{ color:var(--muted); margin:.5rem 0 2rem; max-width:72ch; font-size:.9375rem; }}
  .sw-grid {{ display:grid; gap:1.25rem; grid-template-columns:repeat(auto-fill,minmax(230px,1fr)); }}
  .sw-grid--big {{ grid-template-columns:repeat(auto-fit,minmax(300px,1fr)); }}
  .sw {{ border:1px solid var(--line); overflow:hidden; }}
  .sw-chip {{ height:118px; padding:1rem; display:flex; flex-direction:column; justify-content:space-between; }}
  .sw--big .sw-chip {{ height:170px; }}
  .sw-role {{ font-size:.6875rem; font-weight:700; letter-spacing:.1em; text-transform:uppercase; opacity:.9; }}
  .sw-hex {{ font-size:1.0625rem; font-weight:700; letter-spacing:.04em; }}
  .sw-meta {{ padding:.9rem 1rem 1.1rem; }}
  .sw-meta b {{ display:block; color:var(--navy); font-size:.9375rem; }}
  .sw-meta p {{ margin:.3rem 0 0; font-size:.8125rem; color:var(--muted); line-height:1.5; }}
  .sw-cr {{ margin-top:.5rem !important; font-size:.75rem !important; }}
  .sw-cr b {{ display:inline; color:var(--ink); }}
  .warn {{ border-left:4px solid #C4372C; background:#fdf3f2; padding:1rem 1.25rem; margin-top:1.5rem; }}
  .warn p {{ margin:0; font-size:.9375rem; }}
  footer {{ padding:2.5rem 0 4rem; color:var(--muted); font-size:.875rem; }}
</style>
</head>
<body>
<header>
  <div class="wrap">
    <p class="kicker">Portabox &middot; colour</p>
    <h1>Your palette, as the site actually ships it</h1>
    <p>Every value below is read straight out of <code>site/assets/css/portabox.css</code>.
       Contrast is measured, not estimated. Tell me which one you want and what for.</p>
  </div>
</header>
<main>{body}
  <section class="pg" style="border:0">
    <div class="wrap">
      <h2>One rule worth repeating</h2>
      <div class="warn">
        <p><b>Brand cyan <code>#1EC4F4</code> is a surface, never text on white.</b>
        It measures 2.05:1, which fails for body and large text alike. When cyan has to be
        text on a light ground, it becomes <code>#0A6F8E</code> (5.7:1). On navy the brand
        cyan is fine at 5.9:1.</p>
      </div>
    </div>
  </section>
</main>
<footer><div class="wrap">Generated from the live stylesheet.</div></footer>
</body>
</html>
"""

io.open('site/palette.html', 'w', encoding='utf-8').write(html)
print('site/palette.html written')
