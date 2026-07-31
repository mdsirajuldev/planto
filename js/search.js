/* =========================================================================
   search.js — live search, search results page, shop filtering/sorting/paging
   ========================================================================= */
(function () {
  "use strict";
  const P = (window.PLANTO = window.PLANTO || {});
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  const match = (p, q) =>
    !q || (p.name + " " + p.cat + " " + p.desc).toLowerCase().includes(q.toLowerCase());

  /* ---- Header live search ------------------------------------------------ */
  function initLiveSearch() {
    const input = $("#live-search");
    const out = $("#live-results");
    if (!input || !out) return;
    let t;
    input.addEventListener("input", () => {
      clearTimeout(t);
      out.innerHTML = `<div class="skeleton" style="height:56px"></div>`;
      t = setTimeout(() => {
        const q = input.value.trim();
        if (!q) { out.innerHTML = ""; return; }
        const hits = P.PRODUCTS.filter((p) => match(p, q)).slice(0, 6);
        out.innerHTML = hits.length
          ? hits.map((p) => `<a class="live-result" href="product-details.html?id=${p.id}">
              <img src="${p.img}" alt="${p.name}" />
              <span class="flex-1"><strong class="text-sm">${p.name}</strong><span class="text-xs text-dim" style="display:block">${p.cat}</span></span>
              <span class="price text-sm">${P.money(p.price)}</span></a>`).join("")
          : `<p class="text-sm text-dim">No matches for "${q}". Try "cactus" or "indoor".</p>`;
      }, 220);
    });
  }

  /* ---- Search results page ---------------------------------------------- */
  function initSearchPage() {
    const grid = $("#search-grid");
    if (!grid) return;
    const q = new URLSearchParams(location.search).get("q") || "";
    const box = $("#search-page-input");
    if (box) box.value = q;
    const run = (term) => {
      const hits = P.PRODUCTS.filter((p) => match(p, term));
      $$("[data-search-term]").forEach((el) => (el.textContent = term || "everything"));
      $$("[data-search-count]").forEach((el) => (el.textContent = hits.length));
      P.renderProducts(grid, hits);
      document.dispatchEvent(new CustomEvent("planto:rendered"));
    };
    run(q);
    const form = $("#search-page-form");
    if (form) form.addEventListener("submit", (e) => { e.preventDefault(); run(box.value.trim()); });
  }

  /* ---- Shop page: filters, sorting, pagination --------------------------- */
  function initShop() {
    const grid = $("#shop-grid");
    if (!grid) return;
    const perPage = 6;
    let page = 1;

    const params = new URLSearchParams(location.search);
    const preCat = params.get("cat");
    if (preCat) {
      const cb = $(`input[name=cat][value="${preCat}"]`);
      if (cb) cb.checked = true;
    }

    function current() {
      const cats = $$("input[name=cat]:checked").map((i) => i.value);
      const maxPrice = parseInt(($("#price-range") || {}).value || "1000", 10);
      const minRating = parseInt(($$("input[name=rating]:checked")[0] || {}).value || "0", 10);
      const inStock = $("#in-stock") && $("#in-stock").checked;
      const q = ($("#shop-search") && $("#shop-search").value.trim()) || "";
      let list = P.PRODUCTS.filter((p) =>
        (!cats.length || cats.includes(p.cat)) &&
        p.price <= maxPrice &&
        p.rating >= minRating &&
        (!inStock || p.stock > 0) &&
        match(p, q));

      const sort = ($("#sort-by") || {}).value || "featured";
      if (sort === "low") list.sort((a, b) => a.price - b.price);
      if (sort === "high") list.sort((a, b) => b.price - a.price);
      if (sort === "rating") list.sort((a, b) => b.rating - a.rating);
      if (sort === "name") list.sort((a, b) => a.name.localeCompare(b.name));
      return list;
    }

    function render() {
      const list = current();
      const pages = Math.max(1, Math.ceil(list.length / perPage));
      page = Math.min(page, pages);
      const slice = list.slice((page - 1) * perPage, page * perPage);

      grid.innerHTML = `<div class="skeleton" style="height:320px"></div>`.repeat(3);
      setTimeout(() => {
        P.renderProducts(grid, slice);
        document.dispatchEvent(new CustomEvent("planto:rendered"));
      }, 180);

      const count = $("#shop-count");
      if (count) count.textContent = `${list.length} plants`;

      const pag = $("#shop-pagination");
      if (pag) {
        pag.innerHTML = Array.from({ length: pages }, (_, i) =>
          `<button class="${i + 1 === page ? "is-active" : ""}" data-page="${i + 1}">${i + 1}</button>`).join("");
        $$("button", pag).forEach((b) => b.addEventListener("click", () => {
          page = parseInt(b.dataset.page, 10);
          render();
          window.scrollTo({ top: grid.offsetTop - 120, behavior: "smooth" });
        }));
      }
    }

    $$("input[name=cat], input[name=rating], #in-stock, #sort-by, #price-range").forEach((el) =>
      el.addEventListener("input", () => { page = 1; render(); }));
    const priceOut = $("#price-out");
    const range = $("#price-range");
    if (range && priceOut) {
      const sync = () => (priceOut.textContent = P.money(range.value));
      range.addEventListener("input", sync); sync();
    }
    const shopSearch = $("#shop-search");
    if (shopSearch) shopSearch.addEventListener("input", () => { page = 1; render(); });
    const reset = $("#filter-reset");
    if (reset) reset.addEventListener("click", () => {
      $$("input[name=cat], input[name=rating]").forEach((i) => (i.checked = false));
      if ($("#in-stock")) $("#in-stock").checked = false;
      if (range) { range.value = range.max; range.dispatchEvent(new Event("input")); }
      if (shopSearch) shopSearch.value = "";
      page = 1; render();
    });

    render();
  }

  document.addEventListener("planto:ready", () => { initLiveSearch(); initSearchPage(); initShop(); });
})();
