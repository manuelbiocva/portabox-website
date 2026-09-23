"""Splice homepage variant B into the generator and add its CSS."""
import io

# ---------- 1. Insert the variant into build.js before the emit step ----------
b = 'build/build.js'
s = io.open(b, encoding='utf-8').read()
marker = "/* ---------- Emit ---------- */"
block = io.open('build/variant-b.js.txt', encoding='utf-8').read()

if "VARIANT B" in s:
    # replace the previously inserted block so this script is re-runnable
    start = s.index("/* =================================================================\n   HOMEPAGE VARIANT B")
    end = s.index(marker)
    s = s[:start] + block + "\n" + s[end:]
    print('build.js: variant B block replaced')
else:
    assert marker in s, 'emit marker not found'
    s = s.replace(marker, block + "\n" + marker)
    print('build.js: variant B block inserted')
io.open(b, 'w', encoding='utf-8').write(s)

# ---------- 2. CSS for the variant-only components ----------
c = 'site/assets/css/portabox.css'
css = io.open(c, encoding='utf-8').read()

ADD = """

/* =================================================================
   18. Homepage variant B — split hero, figure table, service list
   ================================================================= */

/* --- Split hero: type panel beside a full-bleed photograph --- */
.hero-b { display:grid; grid-template-columns:1fr; min-height:100dvh; }
@media (min-width:1000px){
  .hero-b { grid-template-columns:1.02fr .98fr; min-height:clamp(620px,92vh,960px); }
}
.hero-b-copy {
  background:var(--navy-deep); display:flex; align-items:center;
  padding:calc(var(--nav-h) + 3rem) var(--gutter) 3rem;
}
@media (min-width:1280px){ .hero-b-copy { padding-left:calc(var(--gutter) + var(--rail, 0px)); } }
.hero-b-inner { width:100%; max-width:640px; margin-left:auto; padding-right:clamp(0rem,3vw,3rem); }
@media (max-width:999px){ .hero-b-inner { margin-left:0; max-width:none; padding-right:0; } }

.hero-b-media { position:relative; min-height:56vw; background:var(--navy); }
@media (min-width:1000px){ .hero-b-media { min-height:0; } }
.hero-b-media img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
/* Only enough scrim to seam the photo into the panel, never over the type. */
.hero-b-media::after {
  content:""; position:absolute; inset:0;
  background:linear-gradient(90deg, rgba(10,42,71,.55) 0%, rgba(10,42,71,0) 28%);
}
@media (max-width:999px){
  .hero-b-media::after { background:linear-gradient(180deg, rgba(10,42,71,.55) 0%, rgba(10,42,71,0) 32%); }
}

.hero-b-meta {
  display:grid; grid-template-columns:repeat(3,auto); gap:1.5rem 2.5rem;
  margin-top:2.5rem; padding-top:1.75rem; border-top:1px solid var(--hairline-dark);
  justify-content:start;
}
@media (max-width:420px){ .hero-b-meta { grid-template-columns:repeat(2,auto); } }
.hero-b-fig { font-size:clamp(1.5rem,2.4vw,2rem); font-weight:800; color:#fff; line-height:1; letter-spacing:-.02em; }
.hero-b-fig span { font-size:.6em; font-weight:700; color:var(--cyan); }
.hero-b-meta .label { color:var(--cyan); }

/* --- Figure table: the per-cubic-metre argument as a comparison --- */
.fig-table { border-top:1px solid var(--hairline); }
.fig-row {
  display:grid; gap:.75rem 1.5rem; padding-block:1.6rem;
  border-bottom:1px solid var(--hairline); align-items:center;
  grid-template-columns:1fr;
}
@media (min-width:760px){ .fig-row { grid-template-columns:1.4fr .8fr .8fr 1fr; } }
.fig-row.is-best { background:var(--tint-yellow); box-shadow:inset 3px 0 0 0 var(--yellow); padding-inline:1.25rem; }
.fig-name { font-size:1.25rem; font-weight:800; color:var(--navy); letter-spacing:-.01em; }
.fig-val { font-size:1.375rem; font-weight:700; color:var(--navy); line-height:1.1; }
.fig-hero { font-size:clamp(1.75rem,3vw,2.5rem); font-weight:800; color:var(--cyan-text); letter-spacing:-.02em; }
.fig-row .label { margin-top:.15rem; }

/* --- Service list: numbered editorial rows --- */
.svc-list { border-top:1px solid var(--hairline); }
.svc-row {
  display:grid; gap:.75rem 1.5rem; align-items:center;
  grid-template-columns:auto 1fr auto;
  padding-block:1.5rem; border-bottom:1px solid var(--hairline);
  text-decoration:none; transition:transform var(--base) var(--ease);
}
@media (min-width:820px){ .svc-row { grid-template-columns:3.5rem 140px 1fr auto; } }
.svc-row:hover { transform:translateX(10px); }
.svc-n { font-family:var(--font); font-weight:800; font-size:1rem; color:var(--cyan-text); }
.svc-thumb { display:none; }
@media (min-width:820px){
  .svc-thumb { display:block; aspect-ratio:16/10; overflow:hidden; border:1px solid var(--hairline); }
  .svc-thumb img { width:100%; height:100%; object-fit:cover; }
}
.svc-body { display:block; }
.svc-title { display:block; font-size:clamp(1.25rem,2.2vw,1.625rem); font-weight:800; color:var(--navy); letter-spacing:-.015em; line-height:1.2; }
.svc-blurb { display:block; margin-top:.4rem; font-size:.9375rem; color:var(--ink-muted); max-width:62ch; }
.svc-go { color:var(--navy); display:flex; align-items:center; }
.svc-go svg { width:22px; height:22px; transition:transform var(--base) var(--ease); }
.svc-row:hover .svc-go svg { transform:translateX(5px); }

/* --- Tags on a light ground --- */
.tag--bad-l  { background:rgba(196,55,44,.12); color:#9E2B22; }
.tag--good-l { background:var(--tint-cyan); color:var(--cyan-text); }

/* --- Featured testimonial --- */
.feature-q { max-width:64rem; }
.feature-q-text {
  font-size:clamp(1.375rem,3.2vw,2.25rem); font-weight:700; line-height:1.28;
  letter-spacing:-.02em; color:#fff; max-width:22ch;
}
@media (min-width:900px){ .feature-q-text { max-width:26ch; } }
.on-dark .feature-q .quote-who b { color:#fff; }

@media (prefers-reduced-motion:reduce){
  .svc-row:hover, .hero-b-media img { transform:none !important; }
}
"""

if "18. Homepage variant B" not in css:
    io.open(c, 'a', encoding='utf-8').write(ADD)
    print('css: variant B styles appended')
else:
    print('css: variant B styles already present')
