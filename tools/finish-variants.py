"""Fix variant C's hero crop and generate the chooser page."""
import io, os, shutil

# ---------- 1. Keep the subject in frame on the tall hero panels ----------
c = 'site/assets/css/portabox.css'
css = io.open(c, encoding='utf-8').read()

old = ".hero-c-media img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }"
new = (".hero-c-media img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover;\n"
       "  object-position:34% 50%; }   /* the subject sits left of centre in these frames */")
if old in css:
    css = css.replace(old, new)
    print('css: variant C hero crop anchored')

oldb = ".hero-b-media img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }"
newb = (".hero-b-media img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover;\n"
        "  object-position:42% 50%; }")
if oldb in css:
    css = css.replace(oldb, newb)
    print('css: variant B hero crop anchored')

# ---------- 2. Styles for the chooser page ----------
CHOOSE = """

/* ---------- Chooser page (internal, not part of the site) ---------- */
.pick-head { background:var(--navy-dark); color:#fff; padding:clamp(3rem,7vw,5rem) 0 clamp(2.5rem,5vw,3.5rem); }
.pick-grid { display:grid; gap:2rem; grid-template-columns:1fr; }
@media (min-width:900px){ .pick-grid { grid-template-columns:repeat(3,1fr); } }
.pick-card { display:flex; flex-direction:column; border:1px solid var(--hairline); background:#fff; }
.pick-shot { display:block; border-bottom:1px solid var(--hairline); background:var(--tint-grey); }
.pick-shot img { width:100%; height:auto; display:block; }
.pick-body { padding:1.5rem; display:flex; flex-direction:column; gap:.75rem; flex:1; }
.pick-body h2 { font-size:1.375rem; }
.pick-tag { font-size:.75rem; font-weight:700; letter-spacing:.08em; text-transform:uppercase; color:var(--cyan-text); }
.pick-body ul { display:grid; gap:.4rem; margin-top:.25rem; }
.pick-body li { font-size:.875rem; color:var(--ink-muted); padding-left:1rem; position:relative; }
.pick-body li::before { content:""; position:absolute; left:0; top:.55em; width:5px; height:5px; background:var(--cyan-text); }
.pick-body .btn { margin-top:auto; }
"""
if "Chooser page (internal" not in css:
    css += CHOOSE
io.open(c, 'w', encoding='utf-8').write(css)

# ---------- 3. Copy the latest hero screenshots in as previews ----------
os.makedirs('site/assets/img/preview', exist_ok=True)
for src, dst in [('research/shots/home-0.png', 'a.png'),
                 ('research/shots/b-0.png', 'b.png'),
                 ('research/shots/c-0.png', 'c.png')]:
    if os.path.exists(src):
        shutil.copy(src, 'site/assets/img/preview/' + dst)
        print('preview:', dst)

# ---------- 4. The chooser page ----------
CARDS = [
    ("A", "index.html", "a.png", "Photo-led", "Cinematic",
     ["Full-bleed photograph with the headline set over it",
      "Services as three square cards",
      "Pricing as three cards, EARL on a dark band",
      "Montserrat 800 throughout — loudest of the three"]),
    ("B", "index-b.html", "b.png", "Price-led", "Split / editorial",
     ["Split hero: navy type panel beside the photograph",
      "The per-cubic-metre argument comes first, as a comparison table",
      "Services as a numbered editorial list, not cards",
      "One testimonial given real weight instead of three equal ones"]),
    ("C", "index-c.html", "c.png", "Warm editorial", "After stivio.ai",
     ["Split hero with the quote widget as an inline tool card",
      "Warm cream ground instead of white",
      "Light-weight (500) display type — quietest of the three",
      "Features and pricing as hairline-ruled columns and rows"]),
]

rows = "\n".join(f"""
      <article class="pick-card">
        <a class="pick-shot" href="{href}"><img src="assets/img/preview/{shot}" alt="Homepage version {k} preview" loading="lazy"></a>
        <div class="pick-body">
          <p class="pick-tag">Version {k} &middot; {tag}</p>
          <h2>{name}</h2>
          <ul>{''.join(f'<li>{b}</li>' for b in bullets)}</ul>
          <a class="btn btn--primary" href="{href}">Open version {k}</a>
        </div>
      </article>""" for k, href, shot, name, tag, bullets in CARDS)

html = f"""<!DOCTYPE html>
<html lang="en-AU">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Portabox — choose a homepage</title>
<meta name="robots" content="noindex">
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/portabox.css">
</head>
<body>
<header class="pick-head">
  <div class="wrap">
    <p class="label" style="color:var(--cyan)">Internal &middot; not part of the site</p>
    <h1 style="color:#fff;margin-top:.75rem">Three homepages. Same content, same design system.</h1>
    <p class="lede" style="color:rgba(255,255,255,.72);margin-top:1.25rem;max-width:62ch">
      Every version uses the identical brand palette, Montserrat, real Portabox photography
      and the same squared-off cards and buttons. What differs is composition, narrative
      order and how loud the typography is. Open each, then tell me which to keep — the
      other two get deleted and the rest of the site follows whichever wins.
    </p>
  </div>
</header>

<main class="band band--grey">
  <div class="wrap">
    <div class="pick-grid">{rows}
    </div>
    <p class="small muted" style="margin-top:2.5rem">
      Inner pages (services, locations, pricing) are shared and unchanged — they already
      follow whichever homepage you choose.
    </p>
  </div>
</main>
</body>
</html>
"""
io.open('site/choose.html', 'w', encoding='utf-8').write(html)
print('site/choose.html written')
