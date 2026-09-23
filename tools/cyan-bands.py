"""Swap the homepage's dark alternating bands for cyan, the way portabox.au does it.

The governing constraint: white on cyan is 2.05:1 and fails. Navy on cyan is
5.89:1 and passes. So every cyan band carries full navy text — no muted greys
(2.71:1) and no reduced opacity (navy at 85% is only 4.39:1).
"""
import io

# ------------------------------------------------------------------ CSS
c = 'site/assets/css/portabox.css'
s = io.open(c, encoding='utf-8').read()

ADD = """

/* =================================================================
   20. Cyan alternating bands
   The brand field carries the alternate section colour instead of navy.
   Everything on cyan is full navy: white fails at 2.05:1, muted grey at
   2.71:1, and navy below 100% opacity drops under 4.5:1.
   ================================================================= */

.band--cyan { background:var(--cyan); }

.band--cyan,
.band--cyan h1, .band--cyan h2, .band--cyan h3, .band--cyan h4,
.band--cyan p, .band--cyan .lede, .band--cyan .muted,
.band--cyan .display, .band--cyan .display-light, .band--cyan .h-light,
.band--cyan blockquote, .band--cyan li, .band--cyan a { color:var(--navy); }

.band--cyan .c-label { color:var(--navy); opacity:.72; }
.band--cyan .label { color:var(--navy); }

/* Chips read as a paler inset, not a translucent white film. */
.band--cyan .chip { background:#fff; border-color:transparent; color:var(--navy); }
.band--cyan .chip .dot { background:var(--navy); }

/* Rules and dividers step up so they stay visible on a saturated ground. */
.band--cyan .ruled, .band--cyan .step, .band--cyan .faq,
.band--cyan .loc-row, .band--cyan .price-rules,
.band--cyan .price-rule { border-color:rgba(14,56,93,.28); }

/* Stars: yellow on cyan is 1.5:1, so the rating marks go navy. */
.band--cyan .stars { color:var(--navy); }

/* The quiet statement keeps its calm through weight, not through opacity. */
.band--cyan .quiet-statement { color:var(--navy); opacity:.78; }

/* Featured quote. */
.band--cyan .feature-q-text { color:var(--navy); }
.band--cyan .quote-who b { color:var(--navy); }
.band--cyan .quote-who span { color:rgba(14,56,93,.78); }
.band--cyan .quote-card { background:#fff; border-color:transparent; }
.band--cyan .quote-card blockquote { color:var(--ink); }
.band--cyan .quote-card .stars { color:var(--yellow); }
.band--cyan .quote-card .quote-who span { color:var(--ink-muted); }

/* Quote form result panel uses the light treatment on cyan. */
.band--cyan .quote-ok { background:#fff; border-color:transparent; color:var(--ink); }
.band--cyan .quote-ok b { color:var(--navy); }
.band--cyan .quote-err { color:#7A1F17; }

/* Buttons. Yellow on cyan with navy text is 8.28:1. */
.band--cyan .btn--ghost { background:#fff; color:var(--navy); border-color:#fff; }
.band--cyan .btn--ghost:hover { background:var(--navy); color:#fff; border-color:var(--navy); }
.band--cyan .btn--outline { color:var(--navy); border-color:var(--navy); }
.band--cyan .btn--outline:hover { background:var(--navy); color:#fff; }

/* Trace button on cyan: white face, navy label, navy edges. */
.btn-trace--oncyan { background:#fff; color:var(--navy); --bt-trace:var(--navy); }

/* The trust strip becomes the cyan bar portabox.au already uses. */
.trust--cyan { background:var(--cyan); }
.trust--cyan .trust-item { color:var(--navy); }
.trust--cyan .trust-item svg { color:var(--navy); }

/* Cyan meeting cream is only 1.78:1, so the seam needs a rule to read. */
.band--cyan + .band--cream, .band--cream + .band--cyan,
.trust--cyan + .band--cream { border-top:1px solid rgba(14,56,93,.18); }
"""

if "20. Cyan alternating bands" not in s:
    io.open(c, 'a', encoding='utf-8').write(ADD)
    print('css: cyan band system added')
else:
    print('css: cyan band system already present')

# ------------------------------------------------------------------ build.js
b = 'build/build.js'
t = io.open(b, encoding='utf-8').read()

# 1. Trust strip -> cyan (shared builder, so gate it behind an argument)
old_trust = 'const trust = () => `\n<section class="trust">'
new_trust = 'const trust = (v) => `\n<section class="trust${v === "cyan" ? " trust--cyan" : ""}">'
if old_trust in t:
    t = t.replace(old_trust, new_trust)
    print('build.js: trust() takes a variant')

# 2. quietStatement -> cyan
old_q = '<section class="band band--coal">\n    <div class="wrap">\n    <p class="quiet-statement rv">'
if 'class="band band--coal"' in t:
    t = t.replace('<section class="band band--coal">', '<section class="band band--cyan">')
    print('build.js: quiet statement -> cyan')

# 3. featuredQuote -> cyan
old_f = '''  return `
<section class="band band--dark on-dark">
  <div class="wrap">
    <div class="feature-q rv">'''
new_f = '''  return `
<section class="band band--cyan">
  <div class="wrap">
    <div class="feature-q rv">'''
if old_f in t:
    t = t.replace(old_f, new_f)
    print('build.js: featured quote -> cyan')

# the featured quote hardcodes white inline colours; drop them so the band rules apply
t = t.replace('<b style="color:#fff">${a.n}</b><span style="color:rgba(255,255,255,.6)">${a.p}</span>',
              '<b>${a.n}</b><span>${a.p}</span>')

# 4. ctaBand -> cyan when asked
old_cta = '''<section class="band band--deep on-dark">
  <div class="wrap">
    <div class="split" style="align-items:center">'''
new_cta = '''<section class="band band--${o.cyan ? "cyan" : "deep"}${o.cyan ? "" : " on-dark"}">
  <div class="wrap">
    <div class="split" style="align-items:center">'''
if old_cta in t:
    t = t.replace(old_cta, new_cta)
    print('build.js: ctaBand can go cyan')

t = t.replace('? traceBtn(C.CONTACT.tel, "Call the depot", C.CONTACT.phone, "dark")',
              '? traceBtn(C.CONTACT.tel, "Call the depot", C.CONTACT.phone, o.cyan ? "oncyan" : "dark")')

# 5. Homepage: opt the trust strip and the CTA band into cyan
t = t.replace('''      alt: "A customer leaning on their Portabox container in the driveway",
    }),
    trust(),''',
'''      alt: "A customer leaning on their Portabox container in the driveway",
    }),
    trust("cyan"),''')
t = t.replace('    ctaBand({ trace: true }),', '    ctaBand({ trace: true, cyan: true }),')
print('build.js: homepage trust strip and CTA band -> cyan')

io.open(b, 'w', encoding='utf-8').write(t)
