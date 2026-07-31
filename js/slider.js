/* =========================================================================
   slider.js — dependency-free slider (autoplay, dots, prev/next, swipe)
   Markup: [data-slider] > .slider-track > .slider-slide
   ========================================================================= */
(function () {
  "use strict";

  function build(root) {
    const track = root.querySelector(".slider-track");
    const slides = Array.from(track.children);
    const perView = parseInt(root.dataset.perView || "1", 10);
    const total = Math.max(1, Math.ceil(slides.length / perView));
    let index = 0;

    slides.forEach((s) => (s.style.minWidth = 100 / perView + "%"));

    const dotsWrap = root.parentElement.querySelector(".slider-dots");
    if (dotsWrap) {
      dotsWrap.innerHTML = Array.from({ length: total }, (_, i) =>
        `<button class="slider-dot${i === 0 ? " is-active" : ""}" aria-label="Go to slide ${i + 1}"></button>`).join("");
      Array.from(dotsWrap.children).forEach((d, i) => d.addEventListener("click", () => go(i)));
    }

    function go(i) {
      index = (i + total) % total;
      track.style.transform = `translateX(-${index * 100}%)`;
      if (dotsWrap) Array.from(dotsWrap.children).forEach((d, di) => d.classList.toggle("is-active", di === index));
    }

    const scope = root.closest("[data-slider-scope]") || root.parentElement;
    const prev = scope.querySelector("[data-slider-prev]");
    const next = scope.querySelector("[data-slider-next]");
    if (prev) prev.addEventListener("click", () => go(index - 1));
    if (next) next.addEventListener("click", () => go(index + 1));

    // Touch swipe
    let startX = null;
    root.addEventListener("touchstart", (e) => (startX = e.touches[0].clientX), { passive: true });
    root.addEventListener("touchend", (e) => {
      if (startX === null) return;
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 45) go(index + (dx < 0 ? 1 : -1));
      startX = null;
    });

    if (root.dataset.autoplay) {
      let timer = setInterval(() => go(index + 1), parseInt(root.dataset.autoplay, 10));
      root.addEventListener("mouseenter", () => clearInterval(timer));
      root.addEventListener("mouseleave", () => (timer = setInterval(() => go(index + 1), parseInt(root.dataset.autoplay, 10))));
    }
    go(0);
  }

  function initSliders() {
    document.querySelectorAll("[data-slider]").forEach(build);
  }
  document.addEventListener("planto:ready", initSliders);
  window.PLANTO = Object.assign(window.PLANTO || {}, { initSliders });
})();
