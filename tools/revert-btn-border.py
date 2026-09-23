"""Back to the original button behaviour: no border at rest, edges trace in on hover.
Also fixes the mobile overflow the widened hero scrim introduced."""
import io

c = 'site/assets/css/portabox.css'
s = io.open(c, encoding='utf-8').read()

# ---- 1. No resting border on any variant ----
old = """/* The resting border. Inset shadow rather than a real border so adding it
   cannot change the button's box size. */
.btn-trace { box-shadow:inset 0 0 0 2px var(--bt-rest, rgba(14,56,93,.32)); }
"""
new = """/* No border at rest — the edges only exist once they trace in on hover.
   A variant can opt into a resting outline by setting --bt-rest. */
.btn-trace { box-shadow:inset 0 0 0 2px var(--bt-rest, transparent); }
"""
assert old in s, 'resting border block not found'
s = s.replace(old, new)

# Drop the per-variant resting colours.
s = s.replace(".btn-trace--primary { background:var(--yellow); color:var(--navy);\n"
              "  --bt-trace:var(--navy); --bt-rest:var(--navy); }",
              ".btn-trace--primary { background:var(--yellow); color:var(--navy); --bt-trace:var(--navy); }")
s = s.replace(".btn-trace--light { background:var(--canvas); color:var(--navy);\n"
              "  --bt-trace:var(--cyan-text); --bt-rest:rgba(14,56,93,.28); }",
              ".btn-trace--light { background:var(--canvas); color:var(--navy); --bt-trace:var(--cyan-text); }")
s = s.replace(".btn-trace--oncyan { background:#fff; color:var(--navy);\n"
              "  --bt-trace:var(--navy); --bt-rest:var(--navy); }",
              ".btn-trace--oncyan { background:#fff; color:var(--navy); --bt-trace:var(--navy); }")
s = s.replace("""  background:transparent; color:#fff;
  --bt-trace:var(--cyan); --bt-rest:rgba(255,255,255,.28);
}""",
"""  background:transparent; color:#fff; --bt-trace:var(--cyan);
  --bt-rest:rgba(255,255,255,.22);   /* ghost on dark needs an edge to be findable */
}""")
s = s.replace(""".btn-trace--outline {
  background:transparent; color:var(--navy);
  --bt-trace:var(--navy); --bt-rest:rgba(14,56,93,.42);
}""",
""".btn-trace--outline {
  background:transparent; color:var(--navy);
  --bt-trace:var(--navy); --bt-rest:rgba(14,56,93,.38);   /* outline needs its outline */
}""")

# ---- 2. Mobile overflow: the scrim extended 30% past a full-width panel ----
old_m = """  .hero-c--video .hero-c-copy::before {
    background:linear-gradient(180deg,
      rgba(7,30,51,.92) 0%, rgba(7,30,51,.86) 55%, rgba(7,30,51,.94) 100%);
  }"""
new_m = """  .hero-c--video .hero-c-copy::before {
    inset:0;   /* the -30% bleed is for the desktop side-fade only */
    background:linear-gradient(180deg,
      rgba(7,30,51,.93) 0%, rgba(7,30,51,.88) 55%, rgba(7,30,51,.95) 100%);
  }"""
assert old_m in s, 'mobile gradient block not found'
s = s.replace(old_m, new_m)

# Belt and braces: the hero must never leak horizontally.
s = s.replace(".hero-c--video { position:relative; isolation:isolate; }",
              ".hero-c--video { position:relative; isolation:isolate; overflow:hidden; }")

io.open(c, 'w', encoding='utf-8').write(s)
print('buttons: no resting border (outline + ghost keep theirs)')
print('hero: mobile scrim bleed removed, overflow clipped')
