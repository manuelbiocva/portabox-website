/* Portabox — gigaenergy-style homepage behaviour.
   Standalone: this page loads only this script.
   Reproduces the reference's Lenis smooth scroll, ScrollTrigger-style
   reveals and stat counters without pulling in GSAP or Lenis. */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var coarse = window.matchMedia("(pointer: coarse)").matches;
  var OUT = 0.115;   // lerp factor; matches the reference's unhurried feel

  /* ---------- Smooth scroll ----------
     Wheel only. Touch keeps native momentum — re-implementing it is always
     worse, and hijacking it breaks pull-to-refresh. */
  function smooth() {
    if (reduce || coarse) return;
    var target = window.scrollY, current = target, running = false;

    function limit() { return document.documentElement.scrollHeight - window.innerHeight; }
    function tick() {
      current += (target - current) * OUT;
      if (Math.abs(target - current) < 0.4) { current = target; running = false; }
      window.scrollTo(0, current);
      if (running) requestAnimationFrame(tick);
    }
    window.addEventListener("wheel", function (e) {
      if (e.ctrlKey) return;
      e.preventDefault();
      target = Math.max(0, Math.min(limit(), target + e.deltaY));
      if (!running) { running = true; requestAnimationFrame(tick); }
    }, { passive: false });

    ["keydown", "mousedown", "touchstart"].forEach(function (ev) {
      window.addEventListener(ev, function () { target = current = window.scrollY; }, { passive: true });
    });
    window.addEventListener("resize", function () { target = current = window.scrollY; });
  }

  /* ---------- Nav ---------- */
  function nav() {
    var bar = document.querySelector(".g-nav");
    var hero = document.querySelector(".g-hero");
    if (!bar) return;

    function onScroll() {
      var t = hero ? hero.offsetHeight - 80 : 10;
      bar.classList.toggle("is-stuck", window.scrollY > t);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    var burger = document.querySelector(".g-burger");
    var drawer = document.getElementById("g-drawer");
    if (!burger || !drawer) return;
    burger.addEventListener("click", function () {
      var open = burger.getAttribute("aria-expanded") === "true";
      burger.setAttribute("aria-expanded", String(!open));
      burger.setAttribute("aria-label", open ? "Open menu" : "Close menu");
      drawer.classList.toggle("is-open", !open);
      document.body.style.overflow = !open ? "hidden" : "";
      if (!open) bar.classList.add("is-stuck"); else onScroll();
    });
    drawer.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        burger.setAttribute("aria-expanded", "false");
        drawer.classList.remove("is-open");
        document.body.style.overflow = "";
      }
    });
  }

  /* ---------- Mega menu ----------
     Pointer opens on hover, everyone else toggles with the button. The panel
     is a DOM child of .g-mi even though it renders fixed, so moving the mouse
     into it does not fire mouseleave; the short delay covers the strip of nav
     between the button and the panel edge. */
  function mega() {
    var items = [].slice.call(document.querySelectorAll(".g-mi"));
    if (!items.length) return;
    var fine = window.matchMedia("(hover:hover) and (pointer:fine)").matches;
    var current = null, closeTimer = 0;

    var panelOf = function (mi) { return mi.querySelector(".g-mega"); };
    var btnOf = function (mi) { return mi.querySelector(".g-menu-t"); };

    function open(mi) {
      if (current === mi) return;
      if (current) close(current, true);
      window.clearTimeout(closeTimer);
      var p = panelOf(mi);
      p.hidden = false;
      void p.offsetWidth;          // start the transition from the closed state
      p.classList.add("is-open");
      btnOf(mi).setAttribute("aria-expanded", "true");
      current = mi;
    }

    function close(mi, now) {
      var p = panelOf(mi);
      if (!p || p.hidden) return;
      p.classList.remove("is-open");
      btnOf(mi).setAttribute("aria-expanded", "false");
      if (current === mi) current = null;
      var finish = function () { if (!p.classList.contains("is-open")) p.hidden = true; };
      if (now || reduce) finish(); else window.setTimeout(finish, 450);
    }

    function later(mi) {
      window.clearTimeout(closeTimer);
      closeTimer = window.setTimeout(function () { close(mi); }, 180);
    }

    items.forEach(function (mi) {
      var btn = btnOf(mi), p = panelOf(mi);
      if (!btn || !p) return;

      btn.addEventListener("click", function (e) {
        e.preventDefault();
        if (current === mi) close(mi, true); else open(mi);
      });

      if (fine) {
        mi.addEventListener("mouseenter", function () { window.clearTimeout(closeTimer); open(mi); });
        mi.addEventListener("mouseleave", function () { later(mi); });
      }

      // tabbing out of the group closes it
      mi.addEventListener("focusout", function (e) {
        if (!mi.contains(e.relatedTarget)) close(mi, true);
      });
    });

    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape" || !current) return;
      var btn = btnOf(current);
      close(current, true);
      if (btn) btn.focus();
    });

    document.addEventListener("click", function (e) {
      if (current && !current.contains(e.target)) close(current, true);
    });

    window.addEventListener("scroll", function () {
      if (current) close(current, true);
    }, { passive: true });
  }

  /* ---------- Contact form ----------
     Validates in the browser. There is no endpoint behind it yet, so the
     confirmation says so rather than claiming a message was sent — point the
     form at a real handler (or a WordPress form plugin) before launch. */
  function contactForm() {
    Array.prototype.forEach.call(document.querySelectorAll(".g-cform"), bindValidated);
  }

  var EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

  function bindValidated(form) {
    var msg = form.querySelector(".g-cform-msg");
    if (!msg) return;

    function check(f) {
      if (f.type === "radio") {
        return !!form.querySelector('input[name="' + f.name + '"]:checked');
      }
      var v = f.value.trim();
      if (!v) return false;
      if (f.type === "email") {
        if (!EMAIL.test(v)) return false;
        var m = f.getAttribute("data-match");
        if (m) { var other = document.getElementById(m); if (other && other.value.trim() !== v) return false; }
        return true;
      }
      if (f.type === "tel") return v.replace(/\D/g, "").length >= 8;
      return true;
    }

    form.addEventListener("input", function (e) {
      if (e.target.getAttribute("aria-invalid") === "true" && check(e.target)) {
        e.target.setAttribute("aria-invalid", "false");
      }
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var bad = [], seen = {};
      Array.prototype.forEach.call(form.querySelectorAll("[required]"), function (f) {
        if (f.type === "radio") {
          if (seen[f.name]) return;
          seen[f.name] = 1;
          var ok = check(f);
          var box = f.closest(".g-radios");
          if (box) box.setAttribute("aria-invalid", ok ? "false" : "true");
          if (!ok) bad.push(f);
          return;
        }
        var good = check(f);
        f.setAttribute("aria-invalid", good ? "false" : "true");
        if (!good) bad.push(f);
      });

      if (bad.length) {
        msg.className = "g-cform-msg is-err";
        msg.textContent = bad.length === 1
          ? "One field still needs attention before this can go."
          : bad.length + " fields still need attention before this can go.";
        bad[0].focus();
        return;
      }

      msg.className = "g-cform-msg";
      msg.innerHTML = "<b>" + (form.classList.contains("g-qform") ? "Your quote request is ready." : "Your message is ready.") +
        "</b> This form is not connected to a mailbox yet, " +
        "so nothing has been sent. Call <b>1800 467 637</b> or email " +
        "<a href=\"mailto:sales@portabox.au\" style=\"color:inherit\">sales@portabox.au</a> and we will pick it up straight away.";
    });
  }

  /* ---------- Quote form helpers ----------
     Carries a postcode handed over from a small form, and names the depot as
     soon as a postcode is typed. */
  function quoteHelpers() {
    var form = document.querySelector(".g-qform");
    if (!form) return;

    function say(input) {
      var help = form.querySelector('[data-depot-for="' + input.id + '"]');
      if (!help) return;
      var v = input.value.trim();
      if (!/^\d{4}$/.test(v)) { help.textContent = ""; help.className = "g-field-help"; return; }
      var d = depotFor(Number(v));
      if (!d) { help.textContent = "We could not match " + v + " to an Australian postcode."; help.className = "g-field-help is-regional"; return; }
      help.className = "g-field-help" + (d.regional ? " is-regional" : "");
      help.textContent = d.regional
        ? d.hub + " sits outside the four depots, so this runs as a regional job we quote individually."
        : "Nearest depot: " + d.hub + ".";
    }

    Array.prototype.forEach.call(form.querySelectorAll("[data-depot-for]"), function (help) {
      var input = document.getElementById(help.getAttribute("data-depot-for"));
      if (!input) return;
      input.addEventListener("input", function () {
        input.value = input.value.replace(/\D/g, "").slice(0, 4);
        say(input);
      });
    });

    var pc = (location.search.match(/[?&]postcode=(\d{1,4})/) || [])[1];
    if (!pc) return;
    var from = document.getElementById("q-from");
    if (!from) return;
    from.value = pc;
    say(from);
  }

  /* ---------- Reveals ---------- */
  function reveals() {
    var els = document.querySelectorAll(".g-rise, .g-wipe");
    if (reduce || !("IntersectionObserver" in window)) {
      Array.prototype.forEach.call(els, function (e) { e.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add("in");
        io.unobserve(en.target);
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -8% 0px" });
    Array.prototype.forEach.call(els, function (e) { io.observe(e); });
  }

  /* ---------- Stat counters ----------
     Only the numeric part animates; prefixes and ranges are left alone so
     "$8.76" and "150–200" still read correctly. */
  function counters() {
    var stats = document.querySelectorAll(".g-stat b");
    if (!stats.length || reduce || !("IntersectionObserver" in window)) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        var el = en.target, raw = el.textContent.trim();
        var m = raw.match(/^(\D*)(\d+(?:\.\d+)?)(\D*)$/);
        if (!m) return;                       // ranges like 150–200 stay put
        var pre = m[1], end = parseFloat(m[2]), post = m[3];
        var dp = (m[2].split(".")[1] || "").length;
        var start = performance.now(), dur = 1100;
        (function step(now) {
          var p = Math.min(1, (now - start) / dur);
          var e = 1 - Math.pow(1 - p, 4);     // expo-out, matching the CSS easing
          el.textContent = pre + (end * e).toFixed(dp) + post;
          if (p < 1) requestAnimationFrame(step);
          else el.textContent = raw;
        })(start);
      });
    }, { threshold: 0.5 });
    Array.prototype.forEach.call(stats, function (s) { io.observe(s); });
  }

  /* ---------- Hero video ----------
     Attached in script so phones and reduced-motion users never download it. */
  function heroVideo() {
    var v = document.querySelector(".hero-video");
    if (!v) return;
    var small = window.matchMedia("(max-width: 767px), (max-height: 520px)").matches;
    var save = navigator.connection && navigator.connection.saveData;
    if (reduce || small || save) return;

    var src = v.getAttribute("data-src");
    if (!src) return;
    v.setAttribute("src", src);
    v.load();
    var play = function () { var t = v.play(); if (t && t.catch) t.catch(function () {}); };
    if (v.readyState >= 2) play(); else v.addEventListener("loadeddata", play, { once: true });
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) v.pause(); else play();
    });
  }

  /* ---------- Quote form ---------- */
  function depotFor(pc) {
    var hit = function (rs) {
      for (var i = 0; i < rs.length; i++) if (pc >= rs[i][0] && pc <= rs[i][1]) return true;
      return false;
    };
    if (hit([[1000,2599],[2619,2899],[2921,2999],[200,299],[2600,2618],[2900,2920]]))
      return { hub: "Sydney", href: "/locations/sydney/", regional: false };
    if (hit([[3000,3999],[8000,8999]])) return { hub: "Melbourne", href: "/locations/melbourne/", regional: false };
    if (hit([[4000,4999],[9000,9999]])) return { hub: "Brisbane", href: "/locations/brisbane/", regional: false };
    if (hit([[5000,5999]]))             return { hub: "Adelaide", href: "/locations/adelaide/", regional: false };
    if (hit([[6000,6999]])) return { hub: "Western Australia", href: "/locations/regional-australia/", regional: true };
    if (hit([[7000,7999]])) return { hub: "Tasmania",          href: "/locations/regional-australia/", regional: true };
    if (hit([[800,999]]))   return { hub: "Northern Territory", href: "/locations/regional-australia/", regional: true };
    return null;
  }

  function quote() {
    Array.prototype.forEach.call(document.querySelectorAll(".quote-form"), bindQuote);
  }

  /* There are two of these now, so each resolves its own result node: the
     hero's sits beside the form, the journey's sits inside it. */
  function bindQuote(form) {
    var input = form.querySelector("input");
    var btn = form.querySelector("button");
    var out = form.querySelector(".quote-out") ||
              (form.parentElement && form.parentElement.querySelector(".quote-out"));
    if (!input || !btn || !out) return;

    var label = btn.querySelector("span");

    input.addEventListener("input", function () {
      input.value = input.value.replace(/\D/g, "").slice(0, 4);
      input.removeAttribute("aria-invalid");
      out.innerHTML = "";
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var v = input.value.trim();
      if (!/^\d{4}$/.test(v)) {
        input.setAttribute("aria-invalid", "true");
        out.innerHTML = '<p class="quote-err">An Australian postcode is four digits — try 3121.</p>';
        input.focus();
        return;
      }
      // The postcode boxes are a lead-in: they carry the postcode over to the
      // full quote form rather than answering in place.
      if (!/\/get-a-quote\/?$/.test(location.pathname)) {
        location.href = "/get-a-quote/?postcode=" + encodeURIComponent(v) + "#quote-form";
        return;
      }

      var was = label.textContent;
      label.textContent = "Checking…";
      btn.disabled = true;

      window.setTimeout(function () {
        label.textContent = was;
        btn.disabled = false;
        var d = depotFor(Number(v));
        if (!d) {
          input.setAttribute("aria-invalid", "true");
          out.innerHTML = '<p class="quote-err">We could not match ' + v + ' to an Australian postcode.</p>';
          return;
        }
        out.innerHTML = d.regional
          ? '<div class="quote-ok"><b>' + v + '</b> sits outside our four depots, so ' + d.hub +
            ' runs as a regional job. We quote those individually — call <b>1800 467 637</b>.</div>'
          : '<div class="quote-ok">Your nearest depot is <b>' + d.hub + '</b>. We deliver to <b>' + v +
            '</b> on a standard run. <a href="' + d.href + '" style="color:inherit;text-decoration:underline">See coverage</a></div>';
      }, 620);
    });
  }

  /* ---------- How it works: scroll-driven journey ----------
     The tall #pj-journey is a scroll track; the page's progress through it
     drives one render() that positions every part of the SVG. Ported from the
     reference implementation, retimed against this page's own fixed nav. */
  function journey() {
    var track = document.getElementById("pj-journey");
    if (!track) return;
    var q = function (sel) { return document.querySelector(sel); };
    var el = {
      world: q("#pj-world"), clouds: q("#pj-clouds"), hills: q("#pj-hills"),
      truck: q("#pj-truck"), truckBody: q("#pj-truckBody"),
      wheels: [].slice.call(document.querySelectorAll(".pj-wheel")),
      puffs: q("#pj-puffs"), arms: q("#pj-arms"), cont: q("#pj-container"),
      legs: q("#pj-legs"), legL: q("#pj-legL"), legR: q("#pj-legR"),
      footL: q("#pj-footL"), footR: q("#pj-footR"),
      door: q("#pj-door"), lock: q("#pj-lock"), shackle: q("#pj-shackle"),
      items: [].slice.call(document.querySelectorAll("#pj-items use")),
      facility: q("#pj-facility"), newhome: q("#pj-newhome"),
      rail: q("#pj-rail"), steps: [].slice.call(document.querySelectorAll(".g-pj-step")),
      chipStep: q("#pj-chipStep"), chipPrice: q("#pj-chipPrice"),
      quote: q("#pj-quote"), stepsCol: q("#pj-stepsCol")
    };
    if (!el.world || !el.cont) return;

    var mode = "storage";
    var bar = document.querySelector(".g-nav");
    function navH() { return bar ? bar.offsetHeight : 0; }

    var clamp = function (v) { return v < 0 ? 0 : v > 1 ? 1 : v; };
    var seg = function (p, a, b) { return clamp((p - a) / (b - a)); };
    var eo = function (t) { return 1 - Math.pow(1 - t, 3); };
    var eio = function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
    var ei = function (t) { return t * t * t; };
    var lerp = function (a, b, t) { return a + (b - a) * t; };
    var backOut = function (t) { var c = 2.2; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
    function tr(node, v) { node.setAttribute("transform", v); }

    var T = { drive: [0, .14], lift1: [.14, .19], out1: [.19, .25], lower1: [.25, .32],
              doorUp: [.34, .38], items: .38, itemStep: .04, itemDur: .07,
              doorDown: [.57, .61], lock: [.59, .63], legsUp: [.66, .70],
              back: [.66, .74], onto: [.74, .77], off: [.78, .88], quote: [.89, .95] };
    var PARK = 370, GROUND = 440, BED = 380, HIGH = 318;
    var DOOR = { x: 202, y: 410 };

    function render(p) {
      var tx, moving = false;
      if (p < T.out1[0]) { tx = lerp(-460, PARK, eo(seg(p, T.drive[0], T.drive[1]))); moving = p < T.drive[1]; }
      else if (p < T.back[0]) { var o = seg(p, T.out1[0], T.out1[1]); tx = lerp(PARK, 1250, ei(o)); moving = o > 0 && o < 1; }
      else if (p < T.off[0]) { var bk = seg(p, T.back[0], T.back[1]); tx = lerp(1250, PARK, eo(bk)); moving = bk > 0 && bk < 1; }
      else { var fw = seg(p, T.off[0], T.off[1]); tx = lerp(PARK, 1560, eio(fw)); moving = fw > 0 && fw < 1; }

      var cam = 1000 * eio(seg(p, T.off[0] + .01, T.off[1]));
      tr(el.world, "translate(" + (-cam).toFixed(1) + ",0)");
      tr(el.clouds, "translate(" + (-cam * .25).toFixed(1) + ",0)");
      tr(el.hills, "translate(" + (-cam * .5).toFixed(1) + ",0)");

      var bounce = moving ? Math.abs(Math.sin(tx * .09)) * -3 : 0;
      tr(el.truck, "translate(" + tx.toFixed(1) + ",0)");
      tr(el.truckBody, "translate(0," + bounce.toFixed(1) + ")");
      el.puffs.style.opacity = moving ? 1 : 0;
      tr(el.puffs, "translate(" + (Math.sin(tx * .05) * 4).toFixed(1) + ",0)");
      el.wheels.forEach(function (w) {
        var bx = w.transform.baseVal.getItem(0).matrix.e;
        tr(w, "translate(" + bx + ",420) rotate(" + (tx * 2.4).toFixed(1) + ")");
      });

      var cx, cy, legsOn = false, armsUp = 0;
      if (p < T.lift1[0]) { cx = tx + 20; cy = BED + bounce; }
      else if (p < T.lower1[0]) {
        cx = PARK + 20; cy = lerp(BED, HIGH, eo(seg(p, T.lift1[0], T.lift1[1]))); legsOn = true;
        armsUp = seg(p, T.lift1[0], T.lift1[1]) * (1 - seg(p, T.out1[0], T.out1[0] + .01));
      }
      else if (p < T.legsUp[0]) { var lw = seg(p, T.lower1[0], T.lower1[1]); cx = PARK + 20; cy = lerp(HIGH, GROUND, eio(lw)); legsOn = lw < 1; }
      else if (p < T.onto[0]) { cx = PARK + 20; cy = lerp(GROUND, HIGH, eo(seg(p, T.legsUp[0], T.legsUp[1]))); legsOn = true; }
      else if (p < T.off[0]) { var on = seg(p, T.onto[0], T.onto[1]); cx = PARK + 20; cy = lerp(HIGH, BED, eio(on)); armsUp = 1 - on; }
      else { cx = tx + 20; cy = BED + bounce; }

      var land = seg(p, T.lower1[1] - .005, T.lower1[1] + .02), sq = 1 - Math.sin(land * Math.PI) * .05;
      tr(el.cont, "translate(" + cx.toFixed(1) + "," + (cy - 150 * sq).toFixed(1) + ") scale(" + (2 - sq).toFixed(3) + "," + sq.toFixed(3) + ")");
      tr(el.arms, "translate(0," + (-armsUp * (BED - HIGH)).toFixed(1) + ")");

      el.legs.style.opacity = legsOn ? 1 : 0;
      var legLen = Math.max(0, GROUND - cy);
      [el.legL, el.legR].forEach(function (l) { l.setAttribute("height", legLen.toFixed(1)); });
      [el.footL, el.footR].forEach(function (ft) { ft.setAttribute("y", (150 + legLen - 5).toFixed(1)); });

      var open = eo(seg(p, T.doorUp[0], T.doorUp[1])) - eio(seg(p, T.doorDown[0], T.doorDown[1]));
      tr(el.door, "translate(0," + (-122 * open).toFixed(1) + ")");

      var groundTop = GROUND - 150;
      el.items.forEach(function (u, i) {
        var a = T.items + i * T.itemStep, t = seg(p, a, a + T.itemDur);
        var ex = +u.dataset.x, ey = +u.dataset.y;
        var sx = DOOR.x - (PARK + 20) - 22, sy = DOOR.y - groundTop - 20;
        var x = lerp(sx, ex, eio(t)), y = lerp(sy, ey, eio(t)) - Math.sin(t * Math.PI) * 150;
        var rot = (1 - t) * -160 * (i % 2 ? 1 : -1);
        u.setAttribute("x", 0); u.setAttribute("y", 0);
        tr(u, "translate(" + x.toFixed(1) + "," + y.toFixed(1) + ") rotate(" + rot.toFixed(1) + " 22 20)");
        u.style.opacity = t > 0 ? 1 : 0;
      });

      var lk = seg(p, T.lock[0], T.lock[1]);
      tr(el.lock, "translate(120,128) scale(" + (lk > 0 ? backOut(lk) : 0).toFixed(3) + ")");
      tr(el.shackle, "translate(0," + (-7 * (1 - eo(seg(p, T.lock[0] + .015, T.lock[1])))).toFixed(1) + ")");

      var active = p < .33 ? 0 : p < .655 ? 1 : 2;
      el.steps.forEach(function (st, i) { st.classList.toggle("on", i === active); st.classList.toggle("done", i < active); });
      el.rail.style.transform = "scaleY(" + clamp(p / T.off[1]) + ")";

      /* Reduced motion, and short landscape, both make the form a static
         block in CSS — the timeline must not drive its opacity or the reveal
         would undo that. */
      // Matches the CSS that unpins the section: short landscape, and short
      // phones. In both the quote panel is a static block owned by CSS.
      var flat = (window.innerHeight <= 520 && window.innerWidth > window.innerHeight) ||
                 (window.innerWidth <= 860 && window.innerHeight <= 760);
      if (reduce || flat) {
        el.chipStep.textContent = "Step " + (active + 1) + " of 3";
      } else {
        var qp = eo(seg(p, T.quote[0], T.quote[1]));
        var narrow = window.innerWidth <= 860 || window.innerHeight <= 520;
        el.quote.style.opacity = qp;
        el.quote.style.transform = narrow
          ? "translateY(" + (120 * (1 - qp)) + "%)"
          : "translateY(calc(-50% + " + (40 * (1 - qp)).toFixed(1) + "px))";
        el.quote.style.pointerEvents = qp > .6 ? "auto" : "none";
        el.stepsCol.style.opacity = narrow ? 1 : 1 - qp;
        el.chipPrice.style.opacity = 1 - qp;
        el.chipStep.textContent = qp > .5 ? "Ready when you are" : "Step " + (active + 1) + " of 3";
      }

      el.facility.style.opacity = mode === "storage" ? 1 : 0;
      el.newhome.style.opacity = mode === "moving" ? 1 : 0;
    }

    function progress() {
      var r = track.getBoundingClientRect(), top = navH();
      var total = r.height - (window.innerHeight - top);
      return total > 0 ? clamp((top - r.top) / total) : 1;
    }

    var raf = 0;
    function tick() { raf = 0; render(progress()); }

    if (reduce) {
      /* One representative frame: container delivered and packed, door open. */
      render(0.57);
    } else {
      window.addEventListener("scroll", function () { if (!raf) raf = requestAnimationFrame(tick); }, { passive: true });
      window.addEventListener("resize", tick);
      tick();
    }

    var copy = {
      storage: { h: "We store it", p: "We collect it level and take it to our secure Portabox facility.",
                 proof: "Adelaide, Melbourne, Brisbane, Sydney", q: "Where should we drop your Portabox?" },
      moving: { h: "We move it", p: "We collect it level and deliver it to your new home. No double handling.",
                proof: "Load once, unload once", q: "Where are you moving from?" }
    };
    Array.prototype.forEach.call(document.querySelectorAll(".g-pj-tabs button"), function (btn) {
      btn.addEventListener("click", function () {
        mode = btn.dataset.mode;
        Array.prototype.forEach.call(document.querySelectorAll(".g-pj-tabs button"), function (o) {
          o.setAttribute("aria-pressed", String(o === btn));
        });
        q("#pj-s3h").textContent = copy[mode].h;
        q("#pj-s3p").textContent = copy[mode].p;
        q("#pj-s3proof").textContent = copy[mode].proof;
        q("#pj-qh").textContent = copy[mode].q;
        if (reduce) render(0.57); else tick();
      });
    });
  }

  function year() {
    Array.prototype.forEach.call(document.querySelectorAll(".yr"), function (e) {
      e.textContent = String(new Date().getFullYear());
    });
  }

  function boot() { smooth(); nav(); mega(); reveals(); counters(); heroVideo(); quote(); contactForm(); quoteHelpers(); journey(); year(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
