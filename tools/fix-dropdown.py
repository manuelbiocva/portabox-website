"""A floating menu is genuinely elevated, so keep the shadow and drop the
border. Declaring both is the ghost-card antipattern."""
import io

c = 'site/assets/css/portabox.css'
s = io.open(c, encoding='utf-8').read()

old = """  background:var(--canvas); border-radius:var(--r-btn); border:1px solid var(--hairline);
  box-shadow:0 30px 60px -20px rgba(7,30,51,.45);"""
new = """  background:var(--canvas); border-radius:var(--r-btn);
  box-shadow:0 24px 48px -18px rgba(7,30,51,.42);"""

assert old in s, 'dropdown block not found'
io.open(c, 'w', encoding='utf-8').write(s.replace(old, new))
print('dropdown: elevation declared once (shadow, no border)')
