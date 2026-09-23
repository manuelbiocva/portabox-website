"""Drive the tracing edges with transform instead of width/height.
Identical visual, but composited rather than animating layout properties."""
import io

c = 'site/assets/css/portabox.css'
s = io.open(c, encoding='utf-8').read()

old = """.btn-trace::before, .btn-trace::after {
  content:""; position:absolute; width:0; height:2px;
  background:var(--bt-trace, var(--cyan-text));
  transition:width .3s cubic-bezier(.35,.1,.25,1);
}
.btn-trace::before { right:0; top:0; transition-duration:.5s; }
.btn-trace::after  { left:0; bottom:0; }"""

new = """.btn-trace::before, .btn-trace::after {
  content:""; position:absolute; width:100%; height:2px;
  background:var(--bt-trace, var(--cyan-text));
  transform:scaleX(0);
  transition:transform .3s cubic-bezier(.35,.1,.25,1);
}
.btn-trace::before { right:0; top:0; transform-origin:right; transition-duration:.5s; }
.btn-trace::after  { left:0; bottom:0; transform-origin:left; }"""

assert old in s
s = s.replace(old, new)

old2 = """.bt-edge::before, .bt-edge::after {
  content:""; position:absolute; width:2px; height:0;
  background:var(--bt-trace, var(--cyan-text));
  transition:height .3s cubic-bezier(.35,.1,.25,1);
}
.bt-edge::before { right:0; top:0; transition-duration:.5s; }
.bt-edge::after  { left:0; bottom:0; }"""

new2 = """.bt-edge::before, .bt-edge::after {
  content:""; position:absolute; width:2px; height:100%;
  background:var(--bt-trace, var(--cyan-text));
  transform:scaleY(0);
  transition:transform .3s cubic-bezier(.35,.1,.25,1);
}
.bt-edge::before { right:0; top:0; transform-origin:top; transition-duration:.5s; }
.bt-edge::after  { left:0; bottom:0; transform-origin:bottom; }"""

assert old2 in s
s = s.replace(old2, new2)

s = s.replace(".btn-trace:hover::before, .btn-trace:hover::after { width:100%; }",
              ".btn-trace:hover::before, .btn-trace:hover::after { transform:scaleX(1); }")
s = s.replace(".btn-trace:hover .bt-edge::before, .btn-trace:hover .bt-edge::after { height:100%; }",
              ".btn-trace:hover .bt-edge::before, .btn-trace:hover .bt-edge::after { transform:scaleY(1); }")
s = s.replace(".btn-trace.is-done:hover::before, .btn-trace.is-done:hover::after { width:0; }",
              ".btn-trace.is-done:hover::before, .btn-trace.is-done:hover::after { transform:scaleX(0); }")
s = s.replace(".btn-trace.is-done:hover .bt-edge::before, .btn-trace.is-done:hover .bt-edge::after { height:0; }",
              ".btn-trace.is-done:hover .bt-edge::before, .btn-trace.is-done:hover .bt-edge::after { transform:scaleY(0); }")

io.open(c, 'w', encoding='utf-8').write(s)
print('trace edges now animate transform, not layout')
