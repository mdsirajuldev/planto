/* =========================================================================
   animations.js — scroll reveal, counters, parallax hero
   ========================================================================= */
(function () {
  "use strict";
  const P = (window.PLANTO = window.PLANTO || {});

  let observer;
  P.observeReveals = function () {
    const nodes = document.querySelectorAll(".reveal:not(.is-visible)");
    if (!("IntersectionObserver" in window)) {
      nodes.forEach((n) => n.classList.add("is-visible"));
      return;
    }
    if (!observer) {
      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    }
    nodes.forEach((n) => observer.observe(n));
  };

  function counters() {
    document.querySelectorAll("[data-count]").forEach((el) => {
      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || "";
      let current = 0;
      const step = target / 45;
      const io = new IntersectionObserver((entries) => {
        if (!entries[0].isIntersecting) return;
        io.disconnect();
        const tick = () => {
          current += step;
          if (current >= target) { el.textContent = target + suffix; return; }
          el.textContent = Math.floor(current) + suffix;
          requestAnimationFrame(tick);
        };
        tick();
      }, { threshold: 0.4 });
      io.observe(el);
    });
  }

  function parallax() {
    const bg = document.querySelector(".hero-bg");
    if (!bg) return;
    window.addEventListener("scroll", () => {
      bg.style.transform = `translateY(${window.scrollY * 0.16}px)`;
    }, { passive: true });
  }

  document.addEventListener("planto:ready", () => { P.observeReveals(); counters(); parallax(); });
})();
