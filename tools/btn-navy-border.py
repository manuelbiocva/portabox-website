"""Give the trace button a permanent navy border.

The traced edges were already navy (#0E385D), but they only existed on hover.
Now the border is always there as a softer navy outline, and the hover trace
draws over it at full strength — so the effect reads as the border completing
rather than appearing from nothing.
"""
import io

c = 'site/assets/css/portabox.css'
s = io.open(c, encoding='utf-8').read()

# Resting outline, drawn as an inset shadow so it costs no layout.
old = """.btn-trace:active { transform:translateY(1px); }"""
new = """/* The resting border. Inset shadow rather than a real border so adding it
   cannot change the button's box size. */
.btn-trace { box-shadow:inset 0 0 0 2px var(--bt-rest, rgba(14,56,93,.32)); }

.btn-trace:active { transform:translateY(1px); }"""
assert old in s
s = s.replace(old, new, 1)

# Per-variant resting outline colours.
s = s.replace(
    ".btn-trace--primary { background:var(--yellow); color:var(--navy); --bt-trace:var(--navy); }",
    ".btn-trace--primary { background:var(--yellow); color:var(--navy);\n"
    "  --bt-trace:var(--navy); --bt-rest:rgba(14,56,93,.38); }")

s = s.replace(
    ".btn-trace--light { background:var(--canvas); color:var(--navy); --bt-trace:var(--cyan-text); }",
    ".btn-trace--light { background:var(--canvas); color:var(--navy);\n"
    "  --bt-trace:var(--cyan-text); --bt-rest:rgba(14,56,93,.28); }")

s = s.replace(
    ".btn-trace--oncyan { background:#fff; color:var(--navy); --bt-trace:var(--navy); }",
    ".btn-trace--oncyan { background:#fff; color:var(--navy);\n"
    "  --bt-trace:var(--navy); --bt-rest:rgba(14,56,93,.38); }")

# The dark variant already carried its own resting outline; fold it into the token.
s = s.replace(
    """.btn-trace--dark {
  background:transparent; color:#fff; --bt-trace:var(--cyan);
  box-shadow:inset 0 0 0 1px rgba(255,255,255,.22);
}
.btn-trace--dark:hover { box-shadow:none; }""",
    """.btn-trace--dark {
  background:transparent; color:#fff;
  --bt-trace:var(--cyan); --bt-rest:rgba(255,255,255,.28);
}""")

# The success state has no border to complete.
s = s.replace(
    ".btn-trace.is-done { background:var(--success); color:#fff; --bt-trace:transparent; }",
    ".btn-trace.is-done { background:var(--success); color:#fff;\n"
    "  --bt-trace:transparent; --bt-rest:transparent; }")

io.open(c, 'w', encoding='utf-8').write(s)
print('trace buttons now carry a permanent navy outline')
