"""Splice homepage variant C (stivio-style) in, add its CSS, and tighten B's headline."""
import io

# ---------- 1. Insert variant C before the emit step ----------
b = 'build/build.js'
s = io.open(b, encoding='utf-8').read()
marker = "/* ---------- Emit ---------- */"
block = io.open('build/variant-c.js.txt', encoding='utf-8').read()

tag = "HOMEPAGE VARIANT C"
if tag in s:
    start = s.index("/* =================================================================\n   HOMEPAGE VARIANT C")
    end = s.index(marker)
    s = s[:start] + block + "\n" + s[end:]
    print('build.js: variant C replaced')
else:
    assert marker in s
    s = s.replace(marker, block + "\n" + marker)
    print('build.js: variant C inserted')

# ---------- 2. Variant B headline was too long; it pushed the stats off ----------
old_b = '      h1: "Your driveway is the cheapest storage unit in the country.",'
new_b = '      h1: "The storage unit that comes to you.",'
if old_b in s:
    s = s.replace(old_b, new_b)
    print('build.js: variant B headline tightened')

io.open(b, 'w', encoding='utf-8').write(s)

# ---------- 3. CSS ----------
c = 'site/assets/css/portabox.css'
css = io.open(c, encoding='utf-8').read()

ADD = """

/* =================================================================
   19. Homepage variant C — warm editorial, after stivio.ai
   Portabox colour and typeface; stivio's structure, weight and rhythm.
   ================================================================= */

:root {
  --cream:      #F1EFEA;   /* warm paper ground */
  --cream-2:    #E9E6DF;
  --line-warm:  #D8D3C9;
  --coal:       #071E33;   /* the deep band; navy family, not stivio's brown */
}

.band--cream { background:var(--cream); }
.band--cream .chip { background:var(--cream-2); border-color:transparent; color:var(--navy); }
.band--coal  { background:var(--coal); }

/* --- Light-weight display: the stivio signature move --- */
.display-light {
  font-family:var(--font); font-weight:500;
  font-size:clamp(2.25rem,5.2vw,4.25rem);
  line-height:1.02; letter-spacing:-.032em;
  color:#fff; text-wrap:balance;
}
.h-light {
  font-weight:500; letter-spacing:-.028em; line-height:1.06;
  font-size:clamp(1.75rem,3.6vw,3rem);
}

/* Small tracked label, stivio's caption register. */
.c-label {
  font-size:.75rem; font-weight:600; letter-spacing:.09em;
  text-transform:uppercase; color:var(--ink-muted);
}
.band--coal .c-label { color:rgba(255,255,255,.45); }

/* --- Hero C: split, tool card inside --- */
.hero-c { display:grid; grid-template-columns:1fr; }
@media (min-width:1020px){
  .hero-c { grid-template-columns:1.05fr .95fr; min-height:clamp(640px,94vh,980px); }
}
.hero-c-copy {
  background:var(--coal); display:flex; align-items:center;
  padding:calc(var(--nav-h) + 3.5rem) var(--gutter) 3.5rem;
}
.hero-c-inner { width:100%; max-width:660px; margin-left:auto; padding-right:clamp(0rem,3.5vw,3.5rem); }
@media (max-width:1019px){ .hero-c-inner { margin-left:0; max-width:none; padding-right:0; } }

.hero-c-sub {
  margin-top:1.5rem; max-width:52ch;
  font-size:clamp(1rem,1.35vw,1.125rem); line-height:1.62;
  color:rgba(255,255,255,.68);
}
.hero-c-fine { margin-top:1.75rem; font-size:.8125rem; color:rgba(255,255,255,.45); max-width:none; }

.hero-c-media { position:relative; min-height:58vw; background:var(--navy); }
@media (min-width:1020px){ .hero-c-media { min-height:0; } }
.hero-c-media img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }

/* The inline tool card — stivio puts the product's first action right here. */
.tool-card {
  margin-top:2.25rem; background:var(--cream); border-radius:12px;
  padding:1.25rem; max-width:34rem;
}
.tool-card-lead { display:flex; flex-wrap:wrap; gap:.25rem 1rem; align-items:baseline; margin-bottom:.85rem; }
.tool-eyebrow { font-size:.75rem; font-weight:700; letter-spacing:.09em; text-transform:uppercase; color:var(--navy); }
.tool-note { font-size:.8125rem; color:var(--ink-muted); margin:0; }
.tool-card-form { display:flex; gap:.6rem; flex-wrap:wrap; }
.tool-card-form input {
  flex:1 1 11rem; min-width:0; height:48px; padding:0 1rem;
  border:1px solid var(--line-warm); border-radius:8px; background:#fff;
  font:inherit; font-size:1rem; color:var(--ink);
}
.tool-card-form input::placeholder { color:var(--ink-muted); }
.tool-card-form input:focus { outline:none; border-color:var(--navy); }
.tool-card-form input[aria-invalid="true"] { border-color:var(--error); }
.tool-card-form .btn { flex:0 0 auto; }
.tool-card-form .btn svg { width:16px; height:16px; }
.tool-card .quote-out .quote-ok { background:#fff; border:1px solid var(--line-warm); color:var(--ink); }
.tool-card .quote-out .quote-ok b { color:var(--navy); }
.tool-card .quote-err { color:var(--error); }
@media (max-width:520px){ .tool-card-form .btn { width:100%; } }

/* --- Ruled columns: a hairline above every title --- */
.ruled-grid { display:grid; gap:2.5rem 2.5rem; grid-template-columns:1fr; }
@media (min-width:700px){ .ruled-grid { grid-template-columns:repeat(2,1fr); } }
@media (min-width:1040px){ .ruled-grid { grid-template-columns:repeat(3,1fr); } }

.ruled { border-top:1px solid var(--line-warm); padding-top:1.25rem; }
.ruled-t { font-size:1rem; font-weight:700; letter-spacing:-.005em; line-height:1.35; color:var(--navy); }
.ruled-b { margin-top:.6rem; font-size:.9375rem; line-height:1.62; color:var(--ink-muted); max-width:42ch; }

a.ruled--link { text-decoration:none; display:block; transition:border-color var(--base) var(--ease); }
a.ruled--link:hover { border-top-color:var(--navy); }
.ruled-media { display:block; aspect-ratio:16/10; overflow:hidden; border-radius:8px; margin-top:1.25rem; }
.ruled-media img { width:100%; height:100%; object-fit:cover; transition:transform var(--slow,420ms) var(--ease); }
a.ruled--link:hover .ruled-media img { transform:scale(1.03); }
.ruled-go {
  display:inline-flex; align-items:center; gap:.4rem; margin-top:1rem;
  font-size:.875rem; font-weight:700; color:var(--navy);
}
.ruled-go svg { width:15px; height:15px; transition:transform var(--base) var(--ease); }
a.ruled--link:hover .ruled-go svg { transform:translateX(4px); }

/* --- Quiet statement: large, low-contrast, deliberately understated --- */
.quiet-statement {
  max-width:24ch; margin-inline:auto; text-align:center;
  font-size:clamp(1.5rem,3.6vw,3rem); font-weight:500;
  line-height:1.16; letter-spacing:-.028em;
  color:rgba(255,255,255,.34);
}
@media (min-width:900px){ .quiet-statement { max-width:26ch; } }

/* --- Pricing as ruled rows --- */
.price-rules { border-bottom:1px solid var(--line-warm); }
.price-rule {
  display:grid; gap:1.25rem 2rem; align-items:center;
  grid-template-columns:1fr; padding-block:2rem;
  border-top:1px solid var(--line-warm);
}
@media (min-width:920px){ .price-rule { grid-template-columns:1.3fr 1.5fr auto; } }
.price-rule-figs { display:grid; grid-template-columns:repeat(3,1fr); gap:1rem; }
.pf { font-size:1.25rem; font-weight:700; color:var(--navy); line-height:1.1; }
.pf--hero { font-size:clamp(1.5rem,2.4vw,2rem); font-weight:800; color:var(--cyan-text); letter-spacing:-.02em; }
.price-rule .c-label { margin-top:.2rem; }
.pill-note {
  display:inline-block; margin-left:.4rem; padding:.15rem .55rem; border-radius:999px;
  background:var(--yellow); color:var(--navy);
  font-size:.625rem; font-weight:800; letter-spacing:.06em; text-transform:uppercase;
  vertical-align:middle;
}

/* Variant C reuses the shared step + faq blocks on the cream ground. */
.band--cream .step { border-top-color:var(--line-warm); }
.band--cream .faq { border-top-color:var(--line-warm); }
.band--cream .loc-row { border-top-color:var(--line-warm); }
.band--cream .fig-table, .band--cream .svc-list { border-top-color:var(--line-warm); }

@media (prefers-reduced-motion:reduce){
  a.ruled--link:hover .ruled-media img { transform:none !important; }
}
"""

if "19. Homepage variant C" not in css:
    io.open(c, 'a', encoding='utf-8').write(ADD)
    print('css: variant C styles appended')
else:
    print('css: variant C styles already present')
