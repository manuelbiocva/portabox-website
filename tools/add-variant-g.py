"""Splice the gigaenergy-style homepage in as a fully standalone page."""
import io

b = 'build/build.js'
s = io.open(b, encoding='utf-8').read()
marker = "/* ---------- Emit ---------- */"
block = io.open('build/variant-g.js.txt', encoding='utf-8').read()

tag = "HOMEPAGE — after gigaenergy.com"
if tag in s:
    start = s.index("/* =================================================================\n   HOMEPAGE — after gigaenergy.com")
    end = s.index(marker)
    s = s[:start] + block + "\n" + s[end:]
    print('build.js: giga page replaced')
else:
    assert marker in s
    s = s.replace(marker, block + "\n" + marker)
    print('build.js: giga page inserted')

# A standalone page brings its own head, body class, stylesheet and script,
# and skips the shared nav/footer entirely.
old_emit = """PAGES.forEach((p) => {
  const html = head(p) + nav(p.active) + p.body + footer();"""
new_emit = """PAGES.forEach((p) => {
  const html = p.standalone
    ? standaloneHead(p) + p.body + `\\n<script src="assets/js/${p.js}"></script>\\n</body>\\n</html>`
    : head(p) + nav(p.active) + p.body + footer();"""
if old_emit in s:
    s = s.replace(old_emit, new_emit)
    print('build.js: emit handles standalone pages')

STANDALONE = '''
/* A standalone page owns its whole document: its own stylesheet, body class
   and script, and none of the shared nav or footer. */
function standaloneHead(p) {
  return `<!DOCTYPE html>
<html lang="en-AU">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${p.title}</title>
<meta name="description" content="${p.desc}">
<meta name="theme-color" content="#0E385D">
<link rel="canonical" href="https://portabox.au/">
<meta property="og:title" content="${p.title}">
<meta property="og:description" content="${p.desc}">
<meta property="og:type" content="website">
<meta property="og:locale" content="en_AU">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/${p.css}">
</head>
<body class="${p.bodyClass}">
<a class="g-skip" href="#main">Skip to content</a>`;
}

'''
if "function standaloneHead" not in s:
    s = s.replace("/* ---------- Chrome ---------- */",
                  "/* ---------- Chrome ---------- */\n" + STANDALONE, 1)
    print('build.js: standaloneHead() added')

io.open(b, 'w', encoding='utf-8').write(s)
