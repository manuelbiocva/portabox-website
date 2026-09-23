"""Add the edge-tracing CTA button (after Uiverse.io / Nawsome) on Portabox colour,
and use it for the homepage CTAs only — inner pages are left alone for now."""
import io

# ---------------------------------------------------------------- CSS
c = 'site/assets/css/portabox.css'
css = io.open(c, encoding='utf-8').read()

ADD = """

/* =================================================================
   19. Edge-tracing CTA button
   Effect after Uiverse.io by Nawsome, rebuilt on the Portabox palette.
   Four 2px edges draw inward on hover, then the label rotates out and a
   second line rises into its place.

   Accessibility note: the original renders its text from data-attributes
   through ::before/::after, which screen readers do not reliably announce
   and nobody can select. Here the visible animation stays in the pseudo
   elements, a hidden sizer gives the button its width, and a real .sr-only
   label carries the text to assistive tech.
   ================================================================= */

.btn-trace {
  position:relative; display:inline-flex; align-items:center; justify-content:center;
  min-height:48px; padding:12px 30px; border:0; border-radius:var(--r-ctl);
  background:var(--canvas); color:var(--navy);
  font-family:var(--font); font-size:.875rem; font-weight:600;
  letter-spacing:.08em; text-transform:uppercase; text-decoration:none;
  overflow:hidden; cursor:pointer; isolation:isolate;
  transition:background-color var(--base) var(--ease), color var(--base) var(--ease);
}

/* The sizer holds the box open; it is never seen. */
.bt-size { visibility:hidden; white-space:nowrap; }

/* Horizontal edges: top-right sweeping left, bottom-left sweeping right. */
.btn-trace::before, .btn-trace::after {
  content:""; position:absolute; width:0; height:2px;
  background:var(--bt-trace, var(--cyan-text));
  transition:width .3s cubic-bezier(.35,.1,.25,1);
}
.btn-trace::before { right:0; top:0; transition-duration:.5s; }
.btn-trace::after  { left:0; bottom:0; }

/* Vertical edges. */
.bt-edge { position:absolute; inset:0; pointer-events:none; }
.bt-edge::before, .bt-edge::after {
  content:""; position:absolute; width:2px; height:0;
  background:var(--bt-trace, var(--cyan-text));
  transition:height .3s cubic-bezier(.35,.1,.25,1);
}
.bt-edge::before { right:0; top:0; transition-duration:.5s; }
.bt-edge::after  { left:0; bottom:0; }

/* The two label lines. */
.bt-label { position:absolute; inset:0; pointer-events:none; }
.bt-label::before, .bt-label::after {
  position:absolute; left:0; width:100%;
  transition:all .4s cubic-bezier(.35,.1,.25,1);
}
.bt-label::before { content:attr(data-title); top:50%; transform:translateY(-50%); }
.bt-label::after  { content:attr(data-text);  top:150%; color:var(--bt-trace, var(--cyan-text)); }

.btn-trace:hover::before, .btn-trace:hover::after { width:100%; }
.btn-trace:hover .bt-edge::before, .btn-trace:hover .bt-edge::after { height:100%; }
.btn-trace:hover .bt-label::before { top:-50%; transform:rotate(5deg); }
.btn-trace:hover .bt-label::after  { top:50%; transform:translateY(-50%); }

.btn-trace:active { transform:translateY(1px); }
.btn-trace:focus-visible { outline:3px solid var(--yellow); outline-offset:3px; }

/* ---- Variants on the brand palette ---- */

/* Primary: the yellow action. Navy traces it, because cyan on yellow is mud. */
.btn-trace--primary { background:var(--yellow); color:var(--navy); --bt-trace:var(--navy); }

/* On white or cream: navy label, cyan trace (--cyan-text is 5.71:1 on white). */
.btn-trace--light { background:var(--canvas); color:var(--navy); --bt-trace:var(--cyan-text); }
.band--cream .btn-trace--light { background:#fff; }

/* On navy or coal: white label, brand cyan trace (5.89:1 on navy). */
.btn-trace--dark {
  background:transparent; color:#fff; --bt-trace:var(--cyan);
  box-shadow:inset 0 0 0 1px rgba(255,255,255,.22);
}
.btn-trace--dark:hover { box-shadow:none; }

/* ---- Success state, from the original's .start ---- */
.btn-trace.is-done { background:var(--success); color:#fff; --bt-trace:transparent; }
.btn-trace.is-done .bt-label::before { top:-50%; transform:rotate(5deg); }
.btn-trace.is-done .bt-label::after {
  content:attr(data-done); color:#fff; top:50%; transform:translateY(-50%);
  transition:none; animation:bt-rise .3s var(--ease) forwards;
}
@keyframes bt-rise { from { top:-50%; } }
.btn-trace.is-done:hover::before, .btn-trace.is-done:hover::after { width:0; }
.btn-trace.is-done:hover .bt-edge::before, .btn-trace.is-done:hover .bt-edge::after { height:0; }

/* Motion is the whole point of this control, so reduced-motion keeps the
   affordance but drops the travel: the edges and the swap become instant. */
@media (prefers-reduced-motion:reduce) {
  .btn-trace::before, .btn-trace::after,
  .bt-edge::before, .bt-edge::after,
  .bt-label::before, .bt-label::after { transition:none !important; }
  .btn-trace:hover .bt-label::before { top:50%; transform:translateY(-50%); }
  .btn-trace:hover .bt-label::after  { top:150%; }
  .btn-trace:hover { text-decoration:underline; }
}
"""

if "19. Edge-tracing CTA button" not in css:
    io.open(c, 'a', encoding='utf-8').write(ADD)
    print('css: edge-tracing button added')
else:
    print('css: already present')

# ---------------------------------------------------------------- build.js
b = 'build/build.js'
s = io.open(b, encoding='utf-8').read()

HELPER = '''
/* Edge-tracing CTA. `title` is the resting label, `text` the one that rises
   in on hover. The sizer carries whichever string is longer so the button
   never resizes mid-animation. */
function traceBtn(href, title, text, variant) {
  const sizer = (title.length >= text.length ? title : text);
  return `<a class="btn-trace btn-trace--${variant || "light"}" href="${href}">
        <span class="bt-edge" aria-hidden="true"></span>
        <span class="bt-size" aria-hidden="true">${sizer}</span>
        <span class="sr-only">${title}</span>
        <span class="bt-label" aria-hidden="true" data-title="${title}" data-text="${text}"></span>
      </a>`;
}

'''

if "function traceBtn" not in s:
    anchor = "/* ---------- Section builders ---------- */"
    assert anchor in s
    s = s.replace(anchor, anchor + "\n" + HELPER, 1)
    print('build.js: traceBtn() helper added')

# ---- Use it for the homepage CTAs only ----
swaps = [
    # quiet statement band, on coal
    ('''    quietStatement({
      h: "Self-storage was designed around the warehouse. The drive, the trolley, the roller door, the spare key behind the counter — all of it exists because the box cannot come to you. Ours can.",
      btns: `<a class="btn btn--primary" href="${C.CONTACT.quote}">Get a price</a>`,
    }),''',
     '''    quietStatement({
      h: "Self-storage was designed around the warehouse. The drive, the trolley, the roller door, the spare key behind the counter — all of it exists because the box cannot come to you. Ours can.",
      btns: traceBtn(C.CONTACT.quote, "Get a price", "Let's go", "primary"),
    }),'''),
]
for old, new in swaps:
    if old in s:
        s = s.replace(old, new)
        print('build.js: quiet-statement CTA -> trace button')

io.open(b, 'w', encoding='utf-8').write(s)
