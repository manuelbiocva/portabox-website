"""Square off cards, buttons and controls after concourse.ai.

Measured from the reference:
  cards   border-radius 0px, 1px hairline border, box-shadow none
  buttons border-radius 8px, height 48px, padding 8-12px / 28px
This deliberately overrides the pill buttons recorded in brand/DESIGN.md.
"""
import io

c = 'site/assets/css/portabox.css'
s = io.open(c, encoding='utf-8').read()
orig = s
misses = []


def sub(old, new):
    global s
    if old not in s:
        misses.append(old[:64])
        return
    s = s.replace(old, new)


# ---------- 1. Shape scale ----------
sub("""  /* Shape */
  --r-pill:    999px;
  --r-card:    16px;
  --r-media:   24px;
  --r-ctl:     4px;""",
    """  /* Shape - squared off, after concourse.ai.
     Cards are 0px with a hairline border and no shadow; buttons are 8px.
     This deliberately overrides the pill buttons in brand/DESIGN.md. */
  --r-btn:     8px;
  --r-card:    0px;
  --r-media:   0px;
  --r-ctl:     4px;
  --r-chip:    4px;
  --r-pill:    8px;   /* legacy alias: nothing is a pill any more */""")

# ---------- 2. Elevation ----------
sub("""  --sh-card:   0 18px 40px -24px rgba(14,56,93,.35);
  --sh-lift:   0 24px 50px -28px rgba(14,56,93,.55);""",
    """  --sh-card:   none;
  --sh-lift:   0 20px 44px -30px rgba(7,30,51,.45);""")

# ---------- 3. Buttons ----------
sub("""  min-height:52px; padding:14px 30px;
  border:2px solid transparent; border-radius:var(--r-pill);""",
    """  min-height:48px; padding:12px 28px;
  border:1px solid transparent; border-radius:var(--r-btn);""")
sub(".btn--sm { min-height:42px; padding:10px 20px; font-size:.875rem; }",
    ".btn--sm { min-height:40px; padding:9px 20px; font-size:.875rem; }")
sub(".btn--outline { color:var(--navy); border-color:var(--navy); }",
    ".btn--outline { color:var(--navy); border-color:var(--navy); border-width:1.5px; }")
sub(".btn--ghost { color:#fff; border-color:rgba(255,255,255,.45); }",
    ".btn--ghost { color:#fff; background:rgba(255,255,255,.10); border-color:rgba(255,255,255,.22); }")

# ---------- 4. Cards ----------
sub("""  background:var(--canvas); border-radius:var(--r-card); overflow:hidden;
  box-shadow:var(--sh-card);
  transition:transform var(--base) var(--ease), box-shadow var(--base) var(--ease);""",
    """  background:var(--canvas); border-radius:var(--r-card); overflow:hidden;
  border:1px solid var(--hairline);
  transition:transform var(--base) var(--ease), border-color var(--base) var(--ease),
             background-color var(--base) var(--ease);""")
sub("a.card:hover { transform:translateY(-6px); box-shadow:var(--sh-lift); }",
    "a.card:hover { transform:translateY(-4px); border-color:var(--navy); }")
sub(".on-dark .card { background:rgba(255,255,255,.055); box-shadow:none; border:1px solid var(--hairline-dark); }",
    """.on-dark .card { background:rgba(255,255,255,.055); border-color:var(--hairline-dark); }
.on-dark a.card:hover { background:rgba(255,255,255,.085); border-color:rgba(255,255,255,.34); }""")

# ---------- 5. Icon tiles ----------
sub("""  flex-shrink:0; width:46px; height:46px; border-radius:var(--r-pill);
  background:var(--tint-cyan); display:flex; align-items:center; justify-content:center;""",
    """  flex-shrink:0; width:46px; height:46px; border-radius:var(--r-ctl);
  background:var(--tint-cyan); display:flex; align-items:center; justify-content:center;""")

# ---------- 6. Chip ----------
sub("""  padding:.5rem 1.1rem; border-radius:var(--r-pill);
  background:rgba(255,255,255,.08); border:1px solid var(--hairline-dark);""",
    """  padding:.45rem 1rem; border-radius:var(--r-chip);
  background:rgba(255,255,255,.08); border:1px solid var(--hairline-dark);""")
sub(".chip .dot { width:7px; height:7px; border-radius:50%; background:var(--yellow); }",
    ".chip .dot { width:7px; height:7px; border-radius:1px; background:var(--yellow); }")

# ---------- 7. Pricing ----------
sub(".price-card { position:relative; display:flex; flex-direction:column; background:#fff; border-radius:var(--r-card); padding:2rem; box-shadow:var(--sh-card); }",
    ".price-card { position:relative; display:flex; flex-direction:column; background:#fff; border-radius:var(--r-card); padding:2rem; border:1px solid var(--hairline); }")
sub(".price-card.is-best { outline:3px solid var(--yellow); }",
    ".price-card.is-best { border-color:var(--yellow); border-width:2px; }")
sub("""  position:absolute; top:-13px; left:2rem; padding:.3rem .8rem; border-radius:var(--r-pill);""",
    """  position:absolute; top:-13px; left:2rem; padding:.3rem .75rem; border-radius:var(--r-chip);""")

# ---------- 8. Quote form ----------
sub("""  padding:7px 7px 7px 1.5rem; background:#fff;
  border-radius:var(--r-pill); box-shadow:var(--sh-lift); max-width:35rem;""",
    """  padding:7px 7px 7px 1.25rem; background:#fff;
  border-radius:var(--r-btn); box-shadow:var(--sh-lift); max-width:35rem;""")
sub("  .quote { flex-direction:column; align-items:stretch; padding:1rem; border-radius:var(--r-card); gap:.75rem; }",
    "  .quote { flex-direction:column; align-items:stretch; padding:1rem; border-radius:var(--r-btn); gap:.75rem; }")
sub("  .quote input { padding:.75rem 1rem; border:2px solid var(--hairline); border-radius:var(--r-pill); }",
    "  .quote input { padding:.75rem 1rem; border:1.5px solid var(--hairline); border-radius:var(--r-btn); }")
sub("""  border-radius:var(--r-card); padding:1rem 1.25rem; font-size:.9375rem; color:#fff;""",
    """  border-radius:var(--r-btn); padding:1rem 1.25rem; font-size:.9375rem; color:#fff;""")
sub(".band--light .quote-ok, .band--tint .quote-ok { background:#fff; border-color:var(--hairline); color:var(--ink); box-shadow:var(--sh-card); }",
    ".band--light .quote-ok, .band--tint .quote-ok { background:#fff; border-color:var(--hairline); color:var(--ink); }")

# ---------- 9. Testimonials ----------
sub(".quote-card { background:#fff; border-radius:var(--r-card); padding:2rem; box-shadow:var(--sh-card); display:flex; flex-direction:column; gap:1rem; }",
    ".quote-card { background:#fff; border-radius:var(--r-card); padding:2rem; border:1px solid var(--hairline); display:flex; flex-direction:column; gap:1rem; }")
sub(".quote-who img { width:46px; height:46px; border-radius:var(--r-pill); object-fit:cover; }",
    ".quote-who img { width:46px; height:46px; border-radius:var(--r-ctl); object-fit:cover; }")

# ---------- 10. Media, nav, misc ----------
sub(".media { border-radius:var(--r-media); overflow:hidden; box-shadow:var(--sh-card); }",
    ".media { border-radius:var(--r-media); overflow:hidden; border:1px solid var(--hairline); }")
sub(".on-dark .media { box-shadow:none; }",
    ".on-dark .media { border-color:var(--hairline-dark); }")
sub("""  padding:.6rem .9rem; border-radius:var(--r-pill);
  font-size:.9375rem; font-weight:600; color:var(--ink-inverse);""",
    """  padding:.6rem .9rem; border-radius:var(--r-ctl);
  font-size:.9375rem; font-weight:600; color:var(--ink-inverse);""")
sub("""  background:var(--canvas); border-radius:var(--r-card);
  box-shadow:0 30px 60px -20px rgba(7,30,51,.45);""",
    """  background:var(--canvas); border-radius:var(--r-btn); border:1px solid var(--hairline);
  box-shadow:0 30px 60px -20px rgba(7,30,51,.45);""")
sub("  display:block; padding:.7rem .85rem; border-radius:10px;",
    "  display:block; padding:.7rem .85rem; border-radius:var(--r-ctl);")
sub("""  width:46px; height:46px; border-radius:var(--r-pill);
  border:1px solid var(--hairline-dark); color:var(--ink-inverse); cursor:pointer;""",
    """  width:46px; height:46px; border-radius:var(--r-ctl);
  border:1px solid var(--hairline-dark); color:var(--ink-inverse); cursor:pointer;""")
sub("padding:.85rem 1.4rem;border-radius:var(--r-pill);font-weight:700",
    "padding:.85rem 1.4rem;border-radius:var(--r-btn);font-weight:700")
sub(".tag { display:inline-block; padding:.25rem .7rem; border-radius:var(--r-pill);",
    ".tag { display:inline-block; padding:.25rem .7rem; border-radius:var(--r-chip);")

io.open(c, 'w', encoding='utf-8').write(s)

print('changed        :', orig != s)
print('r-pill left    :', s.count('var(--r-pill)'))
print('sh-card left   :', s.count('var(--sh-card)'))
if misses:
    print('MISSED PATTERNS:')
    for m in misses:
        print('   !', m)
else:
    print('all patterns matched')
