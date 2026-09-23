"""1. Phone number becomes a secondary button in the nav.
   2. Dropdowns become a proper mega menu with a promo panel.
   3. Better hover line on the Instant Quote button.
"""
import io

# ------------------------------------------------------------------ build.js
b = 'build/build.js'
t = io.open(b, encoding='utf-8').read()

# ---- 1. Better hover copy: the reveal should add information ----
t = t.replace('"Instant Quote", "One field"', '"Instant Quote", "No email needed"')
print('build.js: Instant Quote hover -> "No email needed"')

# ---- 2. Mega menu markup ----
old_nav = '''  const groups = C.NAV.map((g) => {
    const links = g.items
      .map((i) => `<a href="${i.slug}.html"><b>${i.title}</b><span>${i.blurb || i.intro || ""}</span></a>`)
      .join("\\n            ");
    const cur = active === g.href ? ' aria-current="page"' : "";
    return `<li class="nav-item">
            <a class="nav-link" href="${g.href}"${cur} aria-expanded="false">${g.title}<svg class="caret" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m2.5 4.5 3.5 3.5 3.5-3.5"/></svg></a>
            <div class="dropdown">
            ${links}
            </div>
          </li>`;
  }).join("\\n          ");'''

new_nav = '''  const PROMO = {
    "storage-services.html": { img: "facility-lot.png", t: "Not sure which one?",
      b: "All four storage options side by side, with what each one suits." },
    "moving-services.html": { img: "two-containers.jpeg", t: "Moving soon?",
      b: "Local, interstate or regional — see how a container move runs." },
    "locations.html": { img: "truck-coastal.png", t: "Check your postcode",
      b: "Four depots, 150–200 km each, plus regional runs anywhere." },
  };

  const groups = C.NAV.map((g) => {
    const links = g.items
      .map((i) => `<a class="mega-link" href="${i.slug}.html">
                <b>${i.title}</b>
                <span>${i.blurb || i.intro || ""}</span>
                <em>${ICON.arrow}</em>
              </a>`)
      .join("\\n              ");
    const p = PROMO[g.href];
    const cur = active === g.href ? ' aria-current="page"' : "";
    return `<li class="nav-item">
            <a class="nav-link" href="${g.href}"${cur} aria-expanded="false">${g.title}<svg class="caret" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m2.5 4.5 3.5 3.5 3.5-3.5"/></svg></a>
            <div class="dropdown mega">
              <div class="mega-in">
                <div class="mega-col">
                  <p class="mega-head">${g.title}</p>
                  <div class="mega-links">
              ${links}
                  </div>
                </div>
                <a class="mega-promo" href="${g.href}">
                  <span class="mega-promo-img"><img src="${IMG}${p.img}" alt="" loading="lazy"></span>
                  <span class="mega-promo-body">
                    <b>${p.t}</b>
                    <span>${p.b}</span>
                    <em>See all ${g.title.toLowerCase()} ${ICON.arrow}</em>
                  </span>
                </a>
              </div>
            </div>
          </li>`;
  }).join("\\n          ");'''

assert old_nav in t, 'nav groups block not found'
t = t.replace(old_nav, new_nav)
print('build.js: mega menu markup')

# ---- 3. Phone becomes a secondary button ----
old_phone = '<a class="nav-phone" href="${C.CONTACT.tel}">${C.CONTACT.phone}</a>'
new_phone = '${traceBtn(C.CONTACT.tel, C.CONTACT.phone, "Talk to a depot", "navsec", "btn-trace--sm")}'
assert old_phone in t, 'nav phone not found'
t = t.replace(old_phone, new_phone)
print('build.js: nav phone -> secondary button')

io.open(b, 'w', encoding='utf-8').write(t)

# ------------------------------------------------------------------ CSS
c = 'site/assets/css/portabox.css'
s = io.open(c, encoding='utf-8').read()

ADD = """

/* =================================================================
   23. Mega menu and the nav secondary button
   ================================================================= */

/* The panel escapes the nav item so it can span the container width.
   position:fixed works because the bar itself is fixed to the top. */
.mega {
  position:fixed; top:var(--nav-h); left:50%; right:auto;
  width:min(var(--container), calc(100vw - 2 * var(--gutter)));
  transform:translateX(-50%) translateY(-8px);
  min-width:0; padding:0; border-radius:var(--r-card);
  background:var(--canvas);
  box-shadow:0 30px 70px -24px rgba(7,30,51,.45);
  overflow:hidden;
}
.nav-item.is-open .mega { transform:translateX(-50%) translateY(0); }

.mega-in { display:grid; grid-template-columns:1fr; }
@media (min-width:900px){ .mega-in { grid-template-columns:1.6fr .9fr; } }

.mega-col { padding:1.75rem 1.75rem 1.5rem; }
.mega-head {
  font-size:.6875rem; font-weight:700; letter-spacing:.1em; text-transform:uppercase;
  color:var(--cyan-text); margin-bottom:1rem;
}
.mega-links { display:grid; gap:.25rem; grid-template-columns:1fr; }
@media (min-width:720px){ .mega-links { grid-template-columns:1fr 1fr; gap:.25rem 1.25rem; } }

.mega-link {
  display:block; position:relative; padding:.85rem 2rem .85rem .9rem;
  border-radius:var(--r-ctl); text-decoration:none;
  transition:background-color var(--fast) var(--ease);
}
.mega-link:hover { background:var(--tint-cyan); }
.mega-link b { display:block; font-size:.9375rem; font-weight:700; color:var(--navy); line-height:1.3; }
.mega-link span {
  display:block; margin-top:.2rem; font-size:.8125rem; line-height:1.45;
  color:var(--ink-muted);
}
.mega-link em {
  position:absolute; right:.7rem; top:1rem; font-style:normal;
  opacity:0; transform:translateX(-4px);
  transition:opacity var(--fast) var(--ease), transform var(--fast) var(--ease);
}
.mega-link em svg { width:15px; height:15px; color:var(--cyan-text); }
.mega-link:hover em { opacity:1; transform:none; }

/* Promo panel */
.mega-promo {
  display:flex; flex-direction:column; text-decoration:none;
  background:var(--cream); border-left:1px solid var(--line-warm);
}
@media (max-width:899px){ .mega-promo { border-left:0; border-top:1px solid var(--line-warm); } }
.mega-promo-img { display:block; aspect-ratio:16/9; overflow:hidden; }
.mega-promo-img img { width:100%; height:100%; object-fit:cover; transition:transform .5s var(--ease); }
.mega-promo:hover .mega-promo-img img { transform:scale(1.04); }
.mega-promo-body { display:block; padding:1.25rem 1.5rem 1.5rem; }
.mega-promo-body b { display:block; font-size:1rem; font-weight:700; color:var(--navy); }
.mega-promo-body > span { display:block; margin-top:.35rem; font-size:.8125rem; line-height:1.5; color:var(--ink-muted); }
.mega-promo-body em {
  display:inline-flex; align-items:center; gap:.35rem; margin-top:.85rem; font-style:normal;
  font-size:.8125rem; font-weight:700; color:var(--navy);
}
.mega-promo-body em svg { width:14px; height:14px; transition:transform var(--base) var(--ease); }
.mega-promo:hover .mega-promo-body em svg { transform:translateX(4px); }

/* ---- Secondary button in the nav (the phone number) ---- */
.btn-trace--navsec {
  background:transparent; color:#fff;
  --bt-trace:var(--cyan); --bt-rest:rgba(255,255,255,.34);
  letter-spacing:.04em;
}
.nav.is-solid .btn-trace--navsec {
  color:var(--navy); --bt-trace:var(--navy); --bt-rest:rgba(14,56,93,.42);
}
.nav-cta { gap:.5rem; }

@media (prefers-reduced-motion:reduce){
  .mega-promo:hover .mega-promo-img img { transform:none !important; }
}
"""
if "23. Mega menu" not in s:
    s += ADD
io.open(c, 'w', encoding='utf-8').write(s)
print('css: mega menu + nav secondary button')
