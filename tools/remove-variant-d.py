"""Remove homepage variant D and every hook it added."""
import io, os

b = 'build/build.js'
s = io.open(b, encoding='utf-8').read()
marker = "/* ---------- Emit ---------- */"

# ---- 1. Cut the variant D block ----
tag = "/* =================================================================\n   HOMEPAGE VARIANT D"
if tag in s:
    start = s.index(tag)
    end = s.index(marker)
    s = s[:start] + s[end:]
    print('build.js: variant D block removed')
else:
    print('build.js: variant D block already gone')

# ---- 2. Revert the per-page stylesheet + body class hook ----
new_head = ('<link rel="stylesheet" href="assets/css/portabox.css">\n'
            '${p.bodyClass === "pf" ? \'<link rel="stylesheet" href="assets/css/primefold.css">\\n\' : ""}'
            '</head>\n<body${p.bodyClass ? ` class="${p.bodyClass}"` : ""}>')
old_head = '<link rel="stylesheet" href="assets/css/portabox.css">\n</head>\n<body>'
if new_head in s:
    s = s.replace(new_head, old_head)
    print('build.js: head hook reverted')

# ---- 3. Revert the extra-script hook ----
if 'extraJs' in s:
    s = s.replace('<script src="assets/js/site.js"></script>${extraJs || ""}',
                  '<script src="assets/js/site.js"></script>')
    s = s.replace('function footer(extraJs) {', 'function footer() {')
    s = s.replace('const html = head(p) + nav(p.active) + p.body + '
                  'footer(p.bodyClass === "pf" ? \'\\n<script src="assets/js/primefold.js"></script>\' : "");',
                  'const html = head(p) + nav(p.active) + p.body + footer();')
    print('build.js: footer hook reverted')

io.open(b, 'w', encoding='utf-8').write(s)

# ---- 4. Delete the shipped artefacts and the source block ----
for f in ['site/index-d.html',
          'site/assets/css/primefold.css',
          'site/assets/js/primefold.js',
          'build/variant-d.js.txt']:
    if os.path.exists(f):
        os.remove(f); print('deleted:', f)

# ---- 5. Delete the dev scripts that only served variant D ----
for f in ['tools/study-primefold.cjs', 'tools/pf-scroll.cjs', 'tools/shoot-d.cjs',
          'tools/d-weights.cjs', 'tools/d-trace.cjs', 'tools/d-rules.cjs',
          'tools/d-rules2.cjs', 'tools/d-bisect.cjs', 'tools/d-contrast.cjs',
          'tools/add-variant-d.py']:
    if os.path.exists(f):
        os.remove(f); print('deleted:', f)
