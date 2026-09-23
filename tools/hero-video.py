"""Hero background becomes banner.mp4, and the nav/footer go back to the original logo."""
import io

# ------------------------------------------------------------------ build.js
b = 'build/build.js'
t = io.open(b, encoding='utf-8').read()

# --- 1. Hero C: full-bleed video behind the whole section ---
old = '''  <div class="hero-c-media">
    <img src="${IMG}${o.img}" alt="${o.alt}" fetchpriority="high">
  </div>
</section>`;'''
new = '''  <div class="hero-c-media" aria-hidden="true">
    <video class="hero-video" playsinline muted loop preload="none"
           poster="${IMG}banner-poster.jpg" data-src="assets/video/banner.mp4"></video>
  </div>
</section>`;'''
assert old in t, 'hero media block not found'
t = t.replace(old, new)
print('build.js: hero media -> video')

# The hero copy panel now sits over the video, so it needs its own layer.
t = t.replace('<section class="hero-c">', '<section class="hero-c hero-c--video">')

# --- 2. Original logo back in the nav and footer ---
t = t.replace('<img src="${IMG}logo-white.png" alt="Portabox — moving and storage containers" width="132" height="34">',
              '<img src="${IMG}logo.png" alt="Portabox — moving and storage containers" width="132" height="38">')
t = t.replace('<img src="${IMG}logo-white.png" alt="Portabox" width="155" height="40">',
              '<img src="${IMG}logo.png" alt="Portabox" width="155" height="45">')
print('build.js: logo -> original logo.png')

io.open(b, 'w', encoding='utf-8').write(t)

# ------------------------------------------------------------------ CSS
c = 'site/assets/css/portabox.css'
s = io.open(c, encoding='utf-8').read()

ADD = """

/* =================================================================
   21. Video hero
   The whole hero sits on banner.mp4. The copy panel keeps its dark
   ground as a gradient scrim, so the split still reads while the
   background is genuinely video.
   ================================================================= */

.hero-c--video { position:relative; isolation:isolate; }

/* The video fills the section, behind everything. */
.hero-c--video .hero-c-media {
  position:absolute; inset:0; z-index:0; min-height:0; background:var(--coal);
}
.hero-video {
  width:100%; height:100%; object-fit:cover; object-position:62% 50%;
  display:block;
}

/* The copy panel: opaque where the text sits, clearing to nothing over
   the footage. On narrow screens the gradient runs vertically instead. */
.hero-c--video .hero-c-copy {
  position:relative; z-index:1; background:none;
}
.hero-c--video .hero-c-copy::before {
  content:""; position:absolute; inset:0; z-index:-1;
  background:linear-gradient(90deg,
    rgba(7,30,51,.97) 0%, rgba(7,30,51,.95) 46%,
    rgba(7,30,51,.72) 72%, rgba(7,30,51,0) 100%);
}
@media (max-width:1019px){
  .hero-c--video { display:block; min-height:clamp(620px,92vh,900px); }
  .hero-c--video .hero-c-copy { min-height:clamp(620px,92vh,900px); display:flex; align-items:center; }
  .hero-c--video .hero-c-copy::before {
    background:linear-gradient(180deg,
      rgba(7,30,51,.92) 0%, rgba(7,30,51,.86) 55%, rgba(7,30,51,.94) 100%);
  }
}

/* The original logo carries its own cyan field, so it needs a little air
   rather than sitting hard against the nav edge. */
.brand img { height:38px; width:auto; border-radius:2px; }
.foot-brand img { height:44px; width:auto; border-radius:2px; }

@media (prefers-reduced-motion:reduce){
  /* The poster frame stands in; the script never starts playback. */
  .hero-video { object-position:62% 50%; }
}
"""
if "21. Video hero" not in s:
    io.open(c, 'a', encoding='utf-8').write(ADD)
    print('css: video hero added')

# ------------------------------------------------------------------ site.js
j = 'site/assets/js/site.js'
js = io.open(j, encoding='utf-8').read()

VIDEO_JS = '''
  /* ---------- Hero video ----------
     The source is attached in script rather than in markup so that phones and
     anyone on reduced-motion never download 7 MB they are not going to watch —
     they get the poster frame instead. Playback also stops while the tab is
     hidden. */
  function heroVideo() {
    var v = document.querySelector(".hero-video");
    if (!v) return;

    var small = window.matchMedia("(max-width: 767px)").matches;
    var saveData = navigator.connection && navigator.connection.saveData;
    if (reduce || small || saveData) return;   // poster only

    var src = v.getAttribute("data-src");
    if (!src) return;
    v.setAttribute("src", src);
    v.load();

    var play = function () {
      var t = v.play();
      if (t && t.catch) t.catch(function () { /* autoplay refused; poster stands in */ });
    };
    if (v.readyState >= 2) play();
    else v.addEventListener("loadeddata", play, { once: true });

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) v.pause(); else play();
    });
  }

'''

if "function heroVideo" not in js:
    js = js.replace("  function year() {", VIDEO_JS + "  function year() {", 1)
    js = js.replace("function boot() { nav(); reveals(); faq(); quotes(); year(); }",
                    "function boot() { nav(); reveals(); faq(); quotes(); heroVideo(); year(); }")
    io.open(j, 'w', encoding='utf-8').write(js)
    print('site.js: heroVideo() added')
