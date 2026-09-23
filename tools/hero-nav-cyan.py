"""1. Hero video gets one even overlay instead of a side gradient.
   2. The gradient survives only behind the navigation.
   3. Solid navbar becomes cyan, with navy links (white on cyan is 2.05:1).
   4. Logo swaps: white knockout while transparent, original on the cyan bar.
"""
import io

# ------------------------------------------------------------------ CSS
c = 'site/assets/css/portabox.css'
s = io.open(c, encoding='utf-8').read()

# ---- 1. Even overlay on the video; drop the copy-panel gradient ----
old = """.hero-c--video .hero-c-copy::before {
  content:""; position:absolute; inset:0 -30% 0 0; z-index:-1;
  /* Held near-opaque across the full width of the text, then given room to
     fade past the column. Measured against the brightest video frames. */
  background:linear-gradient(90deg,
    rgba(7,30,51,.97) 0%, rgba(7,30,51,.96) 64%,
    rgba(7,30,51,.62) 82%, rgba(7,30,51,0) 100%);
}"""
new = """/* One even overlay across the whole frame rather than a side gradient, so the
   footage reads at the same strength everywhere. 0.62 is the lightest value
   that still clears 4.5:1 for white body copy over the brightest frames. */
.hero-c--video .hero-c-media::after {
  content:""; position:absolute; inset:0; background:rgba(7,30,51,.62);
}
.hero-c--video .hero-c-copy::before { content:none; }"""
assert old in s, 'hero gradient block not found'
s = s.replace(old, new)

# Mobile: same even overlay, no separate gradient.
old_m = """  .hero-c--video .hero-c-copy::before {
    inset:0;   /* the -30% bleed is for the desktop side-fade only */
    background:linear-gradient(180deg,
      rgba(7,30,51,.93) 0%, rgba(7,30,51,.88) 55%, rgba(7,30,51,.95) 100%);
  }"""
new_m = """  .hero-c--video .hero-c-media::after { background:rgba(7,30,51,.70); }"""
assert old_m in s
s = s.replace(old_m, new_m)

ADD = """

/* =================================================================
   22. Cyan navbar, and the hero's single overlay
   ================================================================= */

/* The only gradient left on the page sits behind the navigation, so the
   menu stays legible over the top of the footage. */
.nav::before {
  background:linear-gradient(180deg,
    rgba(7,30,51,.80) 0%, rgba(7,30,51,.46) 66%, rgba(7,30,51,0) 100%);
}

/* ---- Solid state: the cyan bar portabox.au uses ---- */
.nav.is-solid { background:var(--cyan); backdrop-filter:none; border-bottom-color:rgba(14,56,93,.22); }

/* White on cyan is 2.05:1, so everything in the solid bar turns navy. */
.nav.is-solid .nav-link,
.nav.is-solid .nav-phone { color:var(--navy); }
.nav.is-solid .nav-link:hover,
.nav.is-solid .nav-item.is-open > .nav-link { background:rgba(14,56,93,.12); }

/* Yellow on cyan is 1.5:1, so the current page is marked by weight and a rule. */
.nav.is-solid .nav-link[aria-current="page"] {
  color:var(--navy); font-weight:700; box-shadow:inset 0 -2px 0 0 var(--navy);
  border-radius:0;
}

.nav.is-solid .burger { color:var(--navy); border-color:rgba(14,56,93,.32); }
.nav.is-solid :focus-visible { outline-color:var(--navy); }

/* ---- Logo swap ----
   Transparent over the video: the white knockout, no background block.
   On the cyan bar: the original two-tone logo, whose own cyan field
   disappears into the bar exactly as it does on portabox.au. */
.brand img { display:block; height:38px; width:auto; border-radius:0; }
.brand .brand-solid { display:none; }
.nav.is-solid .brand .brand-light { display:none; }
.nav.is-solid .brand .brand-solid { display:block; }
"""
if "22. Cyan navbar" not in s:
    s += ADD

io.open(c, 'w', encoding='utf-8').write(s)
print('css: even hero overlay, gradient only behind nav, cyan solid navbar')

# ------------------------------------------------------------------ build.js
b = 'build/build.js'
t = io.open(b, encoding='utf-8').read()

old_logo = '<img src="${IMG}logo.png" alt="Portabox — moving and storage containers" width="132" height="38">'
new_logo = ('<img class="brand-light" src="${IMG}logo-white.png" alt="Portabox — moving and storage containers" width="132" height="38">\n'
            '      <img class="brand-solid" src="${IMG}logo.png" alt="" aria-hidden="true" width="132" height="38">')
assert old_logo in t, 'nav logo not found'
t = t.replace(old_logo, new_logo)
print('build.js: nav logo swaps on scroll')

io.open(b, 'w', encoding='utf-8').write(t)
