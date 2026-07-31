/* =========================================================================
   wishlist.js — wishlist, compare list and recently viewed items
   ========================================================================= */
(function () {
  "use strict";
  const P = (window.PLANTO = window.PLANTO || {});
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  /* ---- Wishlist ---------------------------------------------------------- */
  P.wishlist = {
    items: () => P.store.get("wishlist", []),
    toggle(id) {
      const list = P.wishlist.items();
      const i = list.indexOf(id);
      if (i > -1) { list.splice(i, 1); P.toast("Removed from wishlist.", "fa-heart-crack"); }
      else { list.push(id); P.toast("Saved to wishlist.", "fa-heart"); }
      P.store.set("wishlist", list);
      paint();
    },
    remove(id) {
      P.store.set("wishlist", P.wishlist.items().filter((x) => x !== id));
      paint();
    }
  };

  /* ---- Compare (max 4) --------------------------------------------------- */
  P.compare = {
    items: () => P.store.get("compare", []),
    toggle(id) {
      const list = P.compare.items();
      const i = list.indexOf(id);
      if (i > -1) list.splice(i, 1);
      else {
        if (list.length >= 4) return P.toast("You can compare up to 4 plants.", "fa-circle-exclamation");
        list.push(id);
        P.toast("Added to compare.", "fa-code-compare");
      }
      P.store.set("compare", list);
      paint();
    }
  };

  /* ---- Recently viewed --------------------------------------------------- */
  P.recentlyViewed = function (id) {
    const list = P.store.get("recent", []).filter((x) => x !== id);
    list.unshift(id);
    P.store.set("recent", list.slice(0, 8));
  };

  /* ---- Rendering --------------------------------------------------------- */
  function paint() {
    const wish = P.wishlist.items();
    $$("[data-wish-count]").forEach((el) => (el.textContent = wish.length));
    $$("[data-wish]").forEach((btn) => {
      const on = wish.includes(btn.dataset.wish);
      btn.classList.toggle("is-active", on);
      btn.innerHTML = `<i class="fa-${on ? "solid" : "regular"} fa-heart"></i>`;
    });
    $$("[data-compare]").forEach((btn) => btn.classList.toggle("is-active", P.compare.items().includes(btn.dataset.compare)));

    const grid = $("#wishlist-grid");
    if (grid) {
      const items = wish.map(P.byId).filter(Boolean);
      if (!items.length) {
        grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><i class="fa-regular fa-heart"></i><h3>No saved plants yet</h3><p>Tap the heart on any plant to save it for later.</p><a class="btn btn-primary mt-4" href="shop.html">Browse shop</a></div>`;
      } else {
        P.renderProducts(grid, items);
      }
    }

    const table = $("#compare-table");
    if (table) {
      const items = P.compare.items().map(P.byId).filter(Boolean);
      if (!items.length) {
        table.innerHTML = `<div class="empty-state"><i class="fa-solid fa-code-compare"></i><h3>Nothing to compare</h3><p>Add up to four plants from the shop to see them side by side.</p><a class="btn btn-primary mt-4" href="shop.html">Browse shop</a></div>`;
      } else {
        const row = (label, fn) => `<tr><th>${label}</th>${items.map((p) => `<td>${fn(p)}</td>`).join("")}</tr>`;
        table.innerHTML = `<div class="table-wrap"><table class="data-table">
          <tr><th></th>${items.map((p) => `<td><img class="cart-thumb" src="${p.img}" alt="${p.name}" /></td>`).join("")}</tr>
          ${row("Plant", (p) => `<strong>${p.name}</strong>`)}
          ${row("Price", (p) => P.money(p.price))}
          ${row("Category", (p) => p.cat)}
          ${row("Rating", (p) => `<span class="stars">${P.starsHtml(p.rating)}</span>`)}
          ${row("Availability", (p) => (p.stock ? `<span class="badge badge-success">In stock</span>` : `<span class="badge badge-danger">Out of stock</span>`))}
          ${row("Description", (p) => `<span class="text-sm">${p.desc}</span>`)}
          ${row("", (p) => `<button class="btn btn-primary btn-sm" data-add="${p.id}">Add to cart</button> <button class="btn btn-sm" data-compare="${p.id}">Remove</button>`)}
        </table></div>`;
      }
    }

    const recent = $("#recent-grid");
    if (recent) {
      const items = P.store.get("recent", []).map(P.byId).filter(Boolean).slice(0, 4);
      if (items.length) P.renderProducts(recent, items);
      else recent.innerHTML = `<p class="text-sm text-dim">Plants you view will appear here.</p>`;
    }
  }
  P.paintWishlist = paint;

  document.addEventListener("click", (e) => {
    const w = e.target.closest("[data-wish]");
    if (w) { e.preventDefault(); P.wishlist.toggle(w.dataset.wish); }
    const c = e.target.closest("[data-compare]");
    if (c) { e.preventDefault(); P.compare.toggle(c.dataset.compare); }
  });

  document.addEventListener("planto:ready", paint);
  // Re-sync badges whenever product grids are re-rendered
  document.addEventListener("planto:rendered", paint);
})();
