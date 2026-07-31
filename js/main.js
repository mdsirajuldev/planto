/* =========================================================================
   main.js — app shell: component injection, theme, nav, overlays, toasts,
   tabs, accordions, forms, lazy loading, cookie notice.
   ========================================================================= */
(function () {
  "use strict";

  const P = (window.PLANTO = window.PLANTO || {});
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  P.$ = $; P.$$ = $$;

  /* ---- Storage helpers -------------------------------------------------- */
  P.store = {
    get(key, fallback) {
      try { const v = localStorage.getItem("planto:" + key); return v ? JSON.parse(v) : fallback; }
      catch (e) { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem("planto:" + key, JSON.stringify(value)); } catch (e) { /* private mode */ }
    }
  };

  /* ---- Toasts ----------------------------------------------------------- */
  P.toast = function (message, icon = "fa-circle-check") {
    const stack = $("#toast-stack");
    if (!stack) return;
    const el = document.createElement("div");
    el.className = "toast";
    el.innerHTML = `<i class="fa-solid ${icon}"></i><span>${message}</span>`;
    stack.appendChild(el);
    setTimeout(() => { el.style.opacity = "0"; setTimeout(() => el.remove(), 300); }, 2600);
  };

  /* ---- Component injection --------------------------------------------- */
  async function injectComponents() {
    const slots = [
      { sel: "#header-slot", url: "components/header.html" },
      { sel: "#footer-slot", url: "components/footer.html" }
    ];
    await Promise.all(slots.map(async ({ sel, url }) => {
      const slot = $(sel);
      if (!slot) return;
      try {
        const res = await fetch(url);
        slot.outerHTML = await res.text();
      } catch (e) { console.error("Component load failed", url, e); }
    }));
  }

  /* ---- Theme ------------------------------------------------------------ */
  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    P.store.set("theme", theme);
    $$("#theme-toggle i").forEach((i) => { i.className = theme === "light" ? "fa-solid fa-sun" : "fa-solid fa-moon"; });
  }
  function initTheme() {
    applyTheme(P.store.get("theme", "dark"));
    ["#theme-toggle", "#theme-toggle-m"].forEach((sel) => {
      const btn = $(sel);
      if (btn) btn.addEventListener("click", () => {
        applyTheme(document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light");
      });
    });
  }

  /* ---- Header behaviour, nav, overlays ---------------------------------- */
  function initShell() {
    const header = $("#site-header");
    const backdrop = $("#backdrop");
    const onScroll = () => {
      if (header) header.classList.toggle("is-stuck", window.scrollY > 24);
      const top = $("#scroll-top");
      if (top) top.classList.toggle("is-visible", window.scrollY > 500);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    const closeAll = () => {
      $$(".mobile-nav, .drawer, .search-panel").forEach((el) => el.classList.remove("is-open"));
      if (backdrop) backdrop.classList.remove("is-open");
      document.body.style.overflow = "";
    };
    const open = (sel) => {
      const el = $(sel);
      if (!el) return;
      el.classList.add("is-open");
      if (backdrop) backdrop.classList.add("is-open");
      document.body.style.overflow = "hidden";
    };
    P.closeOverlays = closeAll;
    P.openOverlay = open;

    on("#nav-toggle", () => open("#mobile-nav"));
    on("#nav-close", closeAll);
    on("#cart-open", () => open("#cart-drawer"));
    on("#cart-close", closeAll);
    on("#search-close", closeAll);
    on("#search-open", () => { open("#search-panel"); setTimeout(() => $("#live-search") && $("#live-search").focus(), 120); });
    on("#backdrop", closeAll);
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") { closeAll(); $$(".modal").forEach((m) => m.classList.remove("is-open")); } });

    on("#scroll-top", () => window.scrollTo({ top: 0, behavior: "smooth" }));

    // Mega menu keyboard/tap support
    $$(".mega-toggle").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const menu = btn.nextElementSibling;
        const isOpen = menu.classList.toggle("is-open");
        btn.setAttribute("aria-expanded", String(isOpen));
      });
    });

    // Active nav state
    const file = location.pathname.split("/").pop() || "index.html";
    $$(".main-nav a, .mobile-nav a").forEach((a) => {
      if ((a.getAttribute("href") || "").split("/").pop().split("?")[0] === file) a.classList.add("is-active");
    });

    // Auth-aware header link
    const user = P.store.get("user", null);
    const link = $("[data-auth-link]");
    if (link && user) { link.textContent = "Account"; link.setAttribute("href", "dashboard.html"); }
  }

  function on(sel, handler) {
    const el = $(sel);
    if (el) el.addEventListener("click", handler);
  }

  /* ---- Tabs / accordion / modal / switch -------------------------------- */
  function initInteractive() {
    $$("[data-tabs]").forEach((group) => {
      group.addEventListener("click", (e) => {
        const btn = e.target.closest(".tab-btn");
        if (!btn) return;
        const scope = group.closest("[data-tab-scope]") || document;
        $$(".tab-btn", group).forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        $$(".tab-panel", scope).forEach((p) => p.classList.toggle("is-active", p.id === btn.dataset.tab));
      });
    });

    $$(".accordion-head").forEach((head) => {
      head.addEventListener("click", () => {
        const item = head.parentElement;
        const body = head.nextElementSibling;
        const open = item.classList.toggle("is-open");
        body.style.maxHeight = open ? body.scrollHeight + "px" : "0px";
      });
    });

    $$("[data-modal-open]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const m = $("#" + btn.dataset.modalOpen);
        if (m) m.classList.add("is-open");
      });
    });
    $$("[data-modal-close]").forEach((btn) => {
      btn.addEventListener("click", () => btn.closest(".modal").classList.remove("is-open"));
    });

    $$(".switch").forEach((sw) => sw.addEventListener("click", () => sw.classList.toggle("is-on")));

    // Show / hide password
    $$(".toggle-pass").forEach((btn) => {
      btn.addEventListener("click", () => {
        const input = btn.parentElement.querySelector("input");
        const show = input.type === "password";
        input.type = show ? "text" : "password";
        btn.innerHTML = `<i class="fa-solid fa-eye${show ? "-slash" : ""}"></i>`;
      });
    });
  }

  /* ---- Generic form validation ------------------------------------------ */
  P.validate = function (form) {
    let ok = true;
    $$("[required]", form).forEach((input) => {
      const field = input.closest(".field") || input.parentElement;
      let bad = !input.value.trim();
      if (!bad && input.type === "email") bad = !/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(input.value);
      if (!bad && input.type === "password") bad = input.value.length < 8;
      if (!bad && input.dataset.match) bad = input.value !== $("#" + input.dataset.match).value;
      field.classList.toggle("has-error", bad);
      if (bad) ok = false;
    });
    return ok;
  };

  function initForms() {
    $$("form[data-validate]").forEach((form) => {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const ok = P.validate(form);
        const okBox = $("[data-success]", form);
        const errBox = $("[data-error]", form);
        if (okBox) okBox.classList.toggle("hidden", !ok);
        if (errBox) errBox.classList.toggle("hidden", ok);
        if (ok) {
          P.toast(form.dataset.message || "Sent successfully.");
          if (form.dataset.redirect) setTimeout(() => (location.href = form.dataset.redirect), 900);
          else form.reset();
        }
      });
    });

    $$("form[data-newsletter]").forEach((form) => {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = form.querySelector("input").value.trim();
        if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email)) return P.toast("Enter a valid email address.", "fa-circle-exclamation");
        form.reset();
        P.toast("You're subscribed. Welcome to Planto!");
      });
    });
  }

  /* ---- Cookie notice ---------------------------------------------------- */
  function initCookies() {
    if (P.store.get("cookies", false)) return;
    const bar = document.createElement("div");
    bar.className = "card";
    bar.style.cssText = "position:fixed;left:20px;bottom:20px;z-index:1150;max-width:360px";
    bar.innerHTML = `<p class="text-sm mb-4">We use cookies to keep your cart, wishlist and preferences working. See our <a class="text-accent" href="cookie-policy.html">cookie policy</a>.</p>
      <div class="flex gap-2"><button class="btn btn-primary btn-sm" id="ck-ok">Accept</button><a class="btn btn-sm" href="cookie-policy.html">Manage</a></div>`;
    document.body.appendChild(bar);
    bar.querySelector("#ck-ok").addEventListener("click", () => { P.store.set("cookies", true); bar.remove(); });
  }

  /* ---- Native lazy-loading fallback ------------------------------------- */
  function initLazy() {
    $$("img:not([loading])").forEach((img) => img.setAttribute("loading", "lazy"));
  }

  /* ---- Boot ------------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", async () => {
    await injectComponents();
    initTheme();
    initShell();
    initInteractive();
    initForms();
    initLazy();
    initCookies();
    document.dispatchEvent(new CustomEvent("planto:ready"));
    const loader = $("#page-loader");
    if (loader) setTimeout(() => loader.classList.add("is-hidden"), 250);
  });
})();
