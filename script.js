/* =========================================================
   Scroll story engine
   - light -> dark color journey (scrubbed)
   - masked headline reveals
   - signature: word-by-word ignition
   - works sequence + statement reveals
   ========================================================= */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGSAP = typeof window.gsap !== "undefined";

  /* ---------- color journey helpers ---------- */
  function hexToRgb(h) {
    h = h.replace("#", "");
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }
  function lerp(a, b, t) { return Math.round(a + (b - a) * t); }
  function mix(c1, c2, t) {
    return "rgb(" + lerp(c1[0], c2[0], t) + "," + lerp(c1[1], c2[1], t) + "," + lerp(c1[2], c2[2], t) + ")";
  }

  // journey stops (scroll progress 0 -> 1): [bg, fg, muted]
  var PAPER = hexToRgb("#ECEAE3"), VOID = hexToRgb("#07080A");
  var INK = hexToRgb("#0C0D10"), PALE = hexToRgb("#EDEEF0");
  var MUTD = hexToRgb("#6B6B66"), MUTL = hexToRgb("#6E7178");
  var ACID_DEEP = hexToRgb("#8FB300"), ACID_LIVE = hexToRgb("#D6FF3F");

  var root = document.documentElement;
  function applyJourney(p) {
    // ease the crossover so most of the page commits to its theme
    var t = p < 0.32 ? 0 : p > 0.6 ? 1 : (p - 0.32) / 0.28;
    root.style.setProperty("--bg", mix(PAPER, VOID, t));
    root.style.setProperty("--fg", mix(INK, PALE, t));
    root.style.setProperty("--mut", mix(MUTD, MUTL, t));
    root.style.setProperty("--acc", mix(ACID_DEEP, ACID_LIVE, t));
  }

  function setProgress(p) {
    var el = document.querySelector(".progress-fill");
    if (el) el.style.width = (p * 100).toFixed(2) + "%";
  }

  /* ---------- no-GSAP / reduced fallback ---------- */
  if (reduce || !hasGSAP) {
    document.querySelectorAll(".reveal-up, .line-inner").forEach(function (el) {
      el.style.opacity = "1";
      el.style.transform = "none";
    });
    // ignition words just show fully
    var it = document.getElementById("igniteText");
    if (it) {
      var ws = it.textContent.trim().split(/\s+/);
      it.innerHTML = ws.map(function (w) { return '<span class="w on">' + w + "</span>"; }).join(" ");
    }
    if (reduce) {
      // motion off entirely: settle to a fully legible dark theme, no scroll color shifts
      applyJourney(1);
    } else {
      // GSAP missing but motion fine: keep the light->dark journey on plain scroll
      var tick = function () {
        var max = document.body.scrollHeight - window.innerHeight;
        var p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
        applyJourney(p); setProgress(p);
      };
      window.addEventListener("scroll", tick, { passive: true });
      window.addEventListener("resize", tick, { passive: true });
      tick();
    }
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // Some browsers restore scroll position; start the story at the top.
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  window.scrollTo(0, 0);

  /* ---------- global color journey + progress (direct scroll calc) ---------- */
  function journeyTick() {
    var max = document.body.scrollHeight - window.innerHeight;
    var p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    applyJourney(p);
    setProgress(p);
  }
  ScrollTrigger.addEventListener("refresh", journeyTick);
  window.addEventListener("scroll", journeyTick, { passive: true });
  journeyTick();

  /* ---------- hero load sequence ---------- */
  var heroLines = document.querySelectorAll(".hero .line-inner");
  gsap.set(heroLines, { yPercent: 115 });
  gsap.to(heroLines, {
    yPercent: 0, duration: 1.1, ease: "power4.out", stagger: 0.12, delay: 0.2
  });
  gsap.to(".hero .reveal-up", {
    opacity: 1, y: 0, duration: 0.9, ease: "power2.out", stagger: 0.15, delay: 0.9
  });
  gsap.set(".hero .reveal-up", { y: 20 });

  /* ---------- generic reveal-up (non-hero) ---------- */
  gsap.utils.toArray(".reveal-up:not(.hero .reveal-up)").forEach(function (el) {
    gsap.set(el, { y: 30 });
    gsap.to(el, {
      opacity: 1, y: 0, duration: 0.9, ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 85%" }
    });
  });

  /* ---------- statement masked reveals ---------- */
  gsap.utils.toArray(".statement, .bigline, .statement-sub, .result-head .line-inner, .work-title, .work-body, .work-num").forEach(function (el) {
    gsap.from(el, {
      yPercent: 40, opacity: 0, duration: 0.9, ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 88%" }
    });
  });

  /* ---------- strike-throughs ---------- */
  gsap.utils.toArray(".strike").forEach(function (el) {
    ScrollTrigger.create({
      trigger: el, start: "top 70%", once: true,
      onEnter: function () { el.classList.add("is-struck"); }
    });
  });

  /* ---------- SIGNATURE: word-by-word ignition ---------- */
  var igniteText = document.getElementById("igniteText");
  if (igniteText) {
    var words = igniteText.textContent.trim().split(/\s+/);
    igniteText.innerHTML = words.map(function (w) {
      return '<span class="w">' + w + "</span>";
    }).join(" ");
    var spans = igniteText.querySelectorAll(".w");

    ScrollTrigger.create({
      trigger: ".ignite",
      start: "top top",
      end: "+=120%",
      pin: true,
      scrub: 0.4,
      onUpdate: function (self) {
        var n = spans.length;
        var head = self.progress * (n + 6); // moving "ignition" head
        spans.forEach(function (s, i) {
          var d = head - i;
          if (d < 0) { s.className = "w"; }
          else if (d < 1.4) { s.className = "w hot"; }   // igniting = acid
          else { s.className = "w on"; }                  // settled = full
        });
      }
    });
  }

  /* ---------- works rows subtle parallax on the number ---------- */
  gsap.utils.toArray(".work-num").forEach(function (num) {
    gsap.to(num, {
      yPercent: -30, ease: "none",
      scrollTrigger: { trigger: num.closest(".work"), start: "top bottom", end: "bottom top", scrub: true }
    });
  });

  ScrollTrigger.refresh();

  // After all triggers/pins are measured, if we're at the top, force the
  // light starting state (refresh can fire updates that jump the journey).
  requestAnimationFrame(function () {
    if (window.scrollY < 5) { applyJourney(0); setProgress(0); }
  });
})();
