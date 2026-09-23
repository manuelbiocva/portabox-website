"""Promote homepage variant C to index.html and remove variants A and B.

Inner pages are deliberately left untouched — they still use the version-A
section builders (hero, cards, pricing cards, dark EARL), which therefore stay
in the generator and in the stylesheet.
"""
import io, os, shutil

b = 'build/build.js'
s = io.open(b, encoding='utf-8').read()

# ---- 1. Rescue the two builders variant C borrows from variant B ----
start_shared = s.index("/* EARL on a light ground")
end_shared = s.index("/* ---- Variant B page ---- */")
shared = s[start_shared:end_shared].rstrip() + "\n"
shared = shared.replace(
    "/* EARL on a light ground, so variant B does not repeat A's dark band here. */",
    "/* EARL on a light ground. The dark-band version, earl(), is still used by\n   the inner pages. */")
shared = shared.replace(
    "/* One quote given real weight, with two supporting it. */",
    "/* One quote given real weight, with two supporting it. */")
assert "function earlLight" in shared and "function featuredQuote" in shared

# ---- 2. Cut the whole variant B block ----
b_start = s.index("/* =================================================================\n   HOMEPAGE VARIANT B")
c_start = s.index("/* =================================================================\n   HOMEPAGE VARIANT C")
s = s[:b_start] + s[c_start:]
print('removed: variant B block')

# ---- 3. Cut version A's homepage page definition ----
a_start = s.index("/* Home */\nPAGES.push({")
a_end = s.index("/* Service hubs */")
removed_a = s[a_start:a_end]
assert 'file: "index.html"' in removed_a, 'expected version A homepage here'
s = s[:a_start] + s[a_end:]
print('removed: version A homepage definition')

# ---- 4. Put the shared builders back, inside the variant C block ----
anchor = "/* Split hero with the quote widget as a real card, stivio-style. */"
assert anchor in s
s = s.replace(anchor, shared + "\n" + anchor, 1)
print('restored: earlLight() and featuredQuote()')

# ---- 5. Variant C becomes the homepage ----
s = s.replace('  file: "index-c.html", active: "index.html",',
              '  file: "index.html", active: "index.html",')
s = s.replace('   HOMEPAGE VARIANT C — "warm editorial", after stivio.ai',
              '   HOMEPAGE — "warm editorial", after stivio.ai')
s = s.replace('/* ---- Variant C page ---- */', '/* ---- Homepage ---- */')
print('promoted: variant C -> index.html')

io.open(b, 'w', encoding='utf-8').write(s)

# ---- 6. Remove the dead CSS that only variant B used ----
c = 'site/assets/css/portabox.css'
css = io.open(c, encoding='utf-8').read()

vb_start = css.find("/* =================================================================\n   18. Homepage variant B")
vc_start = css.find("/* =================================================================\n   19. Homepage variant C")
if vb_start != -1 and vc_start != -1:
    block = css[vb_start:vc_start]
    # keep the pieces variant C still depends on
    keep = []
    for marker, upto in [("/* --- Tags on a light ground --- */", "/* --- Featured testimonial --- */"),
                         ("/* --- Featured testimonial --- */", "@media (prefers-reduced-motion:reduce){")]:
        i = block.find(marker)
        j = block.find(upto, i + 1)
        if i != -1 and j != -1:
            keep.append(block[i:j].rstrip())
    kept = ("\n\n/* ---------- Shared with the homepage: light-ground tags and the\n"
            "     featured testimonial ---------- */\n\n" + "\n\n".join(keep) + "\n")
    css = css[:vb_start] + kept + css[vc_start:]
    css = css.replace("   19. Homepage variant C — warm editorial, after stivio.ai",
                      "   18. Homepage — warm editorial, after stivio.ai")
    print('css: variant B styles removed, shared pieces kept')

# ---- 7. Remove the chooser styles ----
i = css.find("/* ---------- Chooser page (internal, not part of the site) ---------- */")
if i != -1:
    css = css[:i].rstrip() + "\n"
    print('css: chooser styles removed')

io.open(c, 'w', encoding='utf-8').write(css)

# ---- 8. Delete the generated artefacts ----
for f in ['site/index-b.html', 'site/index-c.html', 'site/choose.html']:
    if os.path.exists(f):
        os.remove(f); print('deleted:', f)
if os.path.isdir('site/assets/img/preview'):
    shutil.rmtree('site/assets/img/preview'); print('deleted: site/assets/img/preview/')
for f in ['build/variant-b.js.txt', 'build/variant-c.js.txt']:
    if os.path.exists(f):
        os.remove(f); print('deleted:', f)
