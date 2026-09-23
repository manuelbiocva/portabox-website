"""Use the trace button for every CTA, with a hover line for each.

Note: the nav, drawer, footer, FAQ and CTA band are shared chrome, so the
inner pages inherit the new button styling too. Their layouts are untouched.
"""
import io

# ------------------------------------------------------------------ CSS
c = 'site/assets/css/portabox.css'
s = io.open(c, encoding='utf-8').read()

ADD = """

/* ---- Trace button: size and ground variants ---- */
.btn-trace--sm { min-height:40px; padding:9px 20px; font-size:.8125rem; letter-spacing:.07em; }
.btn-trace--lg { min-height:52px; padding:14px 34px; }
.btn-trace--full { width:100%; }

/* Outline face for secondary actions on light grounds. */
.btn-trace--outline {
  background:transparent; color:var(--navy);
  --bt-trace:var(--navy); --bt-rest:rgba(14,56,93,.42);
}
.btn-trace--outline:hover { background:rgba(14,56,93,.04); }

/* Inside the hero tool card and the quote pill the button sits on cream. */
.tool-card-form .btn-trace, .quote .btn-trace { flex:0 0 auto; }

/* Busy state while the postcode lookup runs. */
.btn-trace.is-busy { pointer-events:none; opacity:.82; }
.btn-trace.is-busy .bt-label::after { top:150%; }

@media (max-width:520px){
  .tool-card-form .btn-trace, .quote .btn-trace { width:100%; }
}
"""
if "Trace button: size and ground variants" not in s:
    io.open(c, 'a', encoding='utf-8').write(ADD)
    print('css: trace variants added')

# ------------------------------------------------------------------ build.js
b = 'build/build.js'
t = io.open(b, encoding='utf-8').read()

# 1. A submit-button flavour of the helper.
HELPER = '''
/* Submit flavour of the trace button. Carries a third line, `done`, that the
   quote script reveals on success using the .is-done state. */
function traceSubmit(title, text, done, variant, extra) {
  const sizer = [title, text, done].sort((a, b) => b.length - a.length)[0];
  return `<button class="btn-trace btn-trace--${variant || "primary"}${extra ? " " + extra : ""}" type="submit">
        <span class="bt-edge" aria-hidden="true"></span>
        <span class="bt-size" aria-hidden="true">${sizer}</span>
        <span class="sr-only">${title}</span>
        <span class="bt-label" aria-hidden="true" data-title="${title}" data-text="${text}" data-done="${done}"></span>
      </button>`;
}

'''
if "function traceSubmit" not in t:
    t = t.replace("/* Edge-tracing CTA.", HELPER + "/* Edge-tracing CTA.", 1)
    print('build.js: traceSubmit() added')

swaps = [
    # --- nav ---
    ('<a class="btn btn--primary btn--sm" href="${C.CONTACT.quote}">Instant Quote</a>\n    </div>\n    <button class="burger"',
     '${traceBtn(C.CONTACT.quote, "Instant Quote", "One field", "primary", "btn-trace--sm")}\n    </div>\n    <button class="burger"'),

    # --- mobile drawer ---
    ('''      <a class="btn btn--primary" href="${C.CONTACT.quote}">Instant Quote</a>
      <a class="btn btn--ghost" href="${C.CONTACT.tel}">Call ${C.CONTACT.phone}</a>''',
     '''      ${traceBtn(C.CONTACT.quote, "Instant Quote", "One field", "primary", "btn-trace--full")}
      ${traceBtn(C.CONTACT.tel, "Call the depot", C.CONTACT.phone, "dark", "btn-trace--full")}'''),

    # --- footer ---
    ('<a class="btn btn--primary btn--sm" href="${C.CONTACT.quote}">Instant Quote</a>',
     '${traceBtn(C.CONTACT.quote, "Instant Quote", "One field", "primary", "btn-trace--sm")}'),

    # --- shared quote pill ---
    ('<button class="btn btn--primary" type="submit">Get my price</button>',
     '${traceSubmit("Get my price", "Let\\u2019s go", "Depot found", "primary")}'),

    # --- hero tool card ---
    ('<button class="btn btn--primary" type="submit">Get my price ${ICON.arrow}</button>',
     '${traceSubmit("Get my price", "Let\\u2019s go", "Depot found", "primary")}'),

    # --- pricing rows: the hover reveals the monthly rate ---
    ('<a class="btn ${s.best ? "btn--primary" : "btn--outline"} btn--sm" href="${C.CONTACT.quote}">Choose ${s.name}</a>',
     '${traceBtn(C.CONTACT.quote, `Choose ${s.name}`, `$${s.rate} a month`, s.best ? "primary" : "outline", "btn-trace--sm")}'),

    # --- pricing cards on the inner pages ---
    ('<a class="btn ${s.best ? "btn--primary" : "btn--outline"}" href="${C.CONTACT.quote}">Choose ${s.name}</a>',
     '${traceBtn(C.CONTACT.quote, `Choose ${s.name}`, `$${s.rate} a month`, s.best ? "primary" : "outline", "btn-trace--full")}'),

    # --- FAQ phone button ---
    ('<div class="btn-row" style="margin-top:1.75rem"><a class="btn btn--outline" href="${C.CONTACT.tel}">${ICON.phone}${C.CONTACT.phone}</a></div>',
     '<div class="btn-row" style="margin-top:1.75rem">${traceBtn(C.CONTACT.tel, "Call the depot", C.CONTACT.phone, "outline")}</div>'),
]

for old, new in swaps:
    if old in t:
        t = t.replace(old, new)
        print('  swapped:', old[:56].replace('\n', ' '), '...')
    else:
        print('  MISS   :', old[:56].replace('\n', ' '), '...')

io.open(b, 'w', encoding='utf-8').write(t)

# ------------------------------------------------------------------ site.js
j = 'site/assets/js/site.js'
js = io.open(j, encoding='utf-8').read()

OLD = """        btn.classList.add("is-busy");
        var label = btn.textContent;
        btn.textContent = "Checking\\u2026";"""
NEW = """        btn.classList.add("is-busy");
        var label = setTraceLabel(btn, "Checking\\u2026");"""

OLD2 = """          btn.classList.remove("is-busy");
          btn.textContent = label;"""
NEW2 = """          btn.classList.remove("is-busy");
          setTraceLabel(btn, label);"""

HELPER_JS = '''
  /* The trace button renders its label from data-attributes, so swapping text
     means updating those plus the screen-reader copy — not textContent, which
     would wipe the button's structure. Returns the previous title. */
  function setTraceLabel(btn, title) {
    var lab = btn.querySelector(".bt-label");
    var sr = btn.querySelector(".sr-only");
    if (!lab) { var prev = btn.textContent; btn.textContent = title; return prev; }
    var was = lab.getAttribute("data-title");
    lab.setAttribute("data-title", title);
    if (sr) sr.textContent = title;
    return was;
  }

'''

if "function setTraceLabel" not in js:
    js = js.replace("  function quotes() {", HELPER_JS + "  function quotes() {", 1)
    print('site.js: setTraceLabel() added')

if OLD in js:
    js = js.replace(OLD, NEW); print('site.js: busy state uses the trace label')
if OLD2 in js:
    js = js.replace(OLD2, NEW2); print('site.js: reset uses the trace label')

# Flash the success state on a good lookup.
OLD3 = """          out.innerHTML = d.regional"""
NEW3 = """          if (btn.querySelector(".bt-label")) {
            btn.classList.add("is-done");
            window.setTimeout(function () { btn.classList.remove("is-done"); }, 2600);
          }
          out.innerHTML = d.regional"""
if OLD3 in js and "is-done" not in js:
    js = js.replace(OLD3, NEW3, 1); print('site.js: success flashes the done state')

io.open(j, 'w', encoding='utf-8').write(js)
