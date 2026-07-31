/* =========================================================================
   cart.js — cart state, mini cart, cart page, coupon, shipping, quantities,
   plus product-details page bindings (gallery, zoom, qty, add to cart).
   ========================================================================= */
(function () {
  "use strict";
  const P = (window.PLANTO = window.PLANTO || {});
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  const COUPONS = { PLANTO10: 0.1, GREEN20: 0.2, WELCOME5: 0.05 };
  const TAX_RATE = 0.05;
  const FREE_SHIP_OVER = 999;

  const getCart = () => P.store.get("cart", []);
  const setCart = (items) => { P.store.set("cart", items); paint(); };

  P.cart = {
    items: getCart,
    add(id, qty = 1) {
      const items = getCart();
      const found = items.find((i) => i.id === id);
      if (found) found.qty += qty; else items.push({ id, qty });
      setCart(items);
      const p = P.byId(id);
      P.toast(`${p ? p.name : "Item"} added to cart.`, "fa-bag-shopping");
    },
    remove(id) { setCart(getCart().filter((i) => i.id !== id)); P.toast("Removed from cart.", "fa-trash"); },
    update(id, qty) {
      const items = getCart();
      const it = items.find((i) => i.id === id);
      if (!it) return;
      it.qty = Math.max(1, qty);
      setCart(items);
    },
    clear() { setCart([]); },
    totals() {
      const items = getCart().map((i) => ({ ...i, product: P.byId(i.id) })).filter((i) => i.product);
      const subtotal = items.reduce((s, i) => s + i.product.price * i.qty, 0);
      const coupon = P.store.get("coupon", null);
      const discount = coupon && COUPONS[coupon] ? Math.round(subtotal * COUPONS[coupon]) : 0;
      const shipMethod = P.store.get("shipping", "standard");
      let shipping = subtotal === 0 || subtotal - discount >= FREE_SHIP_OVER ? 0 : 79;
      if (shipMethod === "express") shipping = 149;
      const tax = Math.round((subtotal - discount) * TAX_RATE);
      return { items, subtotal, discount, shipping, tax, coupon, total: Math.max(0, subtotal - discount + shipping + tax) };
    },
    applyCoupon(code) {
      const key = (code || "").trim().toUpperCase();
      if (!COUPONS[key]) { P.toast("That promo code isn't valid.", "fa-circle-exclamation"); return false; }
      P.store.set("coupon", key);
      paint();
      P.toast(`Coupon ${key} applied — ${COUPONS[key] * 100}% off.`);
      return true;
    },
    setShipping(method) { P.store.set("shipping", method); paint(); }
  };

  /* ---- Painting --------------------------------------------------------- */
  function paint() {
    const t = P.cart.totals();
    const count = t.items.reduce((s, i) => s + i.qty, 0);
    $$("[data-cart-count]").forEach((el) => (el.textContent = count));

    const mini = $("#mini-cart");
    if (mini) {
      mini.innerHTML = t.items.length
        ? t.items.map((i) => `
          <div class="mini-item">
            <img src="${i.product.img}" alt="${i.product.name}" />
            <span class="flex-1">
              <strong class="text-sm">${i.product.name}</strong>
              <span class="text-xs text-dim" style="display:block">${i.qty} × ${P.money(i.product.price)}</span>
            </span>
            <button class="icon-btn" data-remove="${i.id}" aria-label="Remove"><i class="fa-solid fa-xmark"></i></button>
          </div>`).join("")
        : `<p class="text-sm text-dim">Your cart is empty. <a class="text-accent" href="shop.html">Start shopping</a>.</p>`;
      const total = $("[data-mini-total]");
      if (total) total.textContent = P.money(t.subtotal);
    }

    const rows = $("#cart-rows");
    if (rows) {
      rows.innerHTML = t.items.length
        ? t.items.map((i) => `
          <tr>
            <td>
              <span class="flex items-center gap-3">
                <img class="cart-thumb" src="${i.product.img}" alt="${i.product.name}" />
                <span><strong>${i.product.name}</strong><br /><span class="text-xs text-dim">${i.product.cat}</span></span>
              </span>
            </td>
            <td>${P.money(i.product.price)}</td>
            <td>
              <span class="qty">
                <button data-dec="${i.id}" aria-label="Decrease">−</button>
                <input type="text" value="${i.qty}" data-qty="${i.id}" aria-label="Quantity" />
                <button data-inc="${i.id}" aria-label="Increase">+</button>
              </span>
            </td>
            <td class="fw-600">${P.money(i.product.price * i.qty)}</td>
            <td><button class="icon-btn" data-remove="${i.id}" aria-label="Remove"><i class="fa-solid fa-trash"></i></button></td>
          </tr>`).join("")
        : `<tr><td colspan="5"><div class="empty-state"><i class="fa-solid fa-bag-shopping"></i><h3>Your cart is empty</h3><p>Add a plant or two and they'll show up here.</p><a class="btn btn-primary mt-4" href="shop.html">Browse shop</a></div></td></tr>`;
    }

    // Every summary block on cart / checkout / payment pages
    setText("[data-sum-subtotal]", P.money(t.subtotal));
    setText("[data-sum-discount]", "− " + P.money(t.discount));
    setText("[data-sum-shipping]", t.shipping === 0 ? "Free" : P.money(t.shipping));
    setText("[data-sum-tax]", P.money(t.tax));
    setText("[data-sum-total]", P.money(t.total));
    setText("[data-sum-count]", String(t.items.reduce((s, i) => s + i.qty, 0)));

    const list = $("[data-sum-items]");
    if (list) {
      list.innerHTML = t.items.map((i) => `
        <div class="summary-row"><span>${i.product.name} × ${i.qty}</span><span>${P.money(i.product.price * i.qty)}</span></div>`).join("")
        || `<p class="text-sm text-dim">No items yet.</p>`;
    }
  }
  function setText(sel, value) { $$(sel).forEach((el) => (el.textContent = value)); }
  P.paintCart = paint;

  /* ---- Delegated events -------------------------------------------------- */
  function bind() {
    document.addEventListener("click", (e) => {
      const add = e.target.closest("[data-add]");
      if (add) { P.cart.add(add.dataset.add, 1); return; }
      const rm = e.target.closest("[data-remove]");
      if (rm) { P.cart.remove(rm.dataset.remove); return; }
      const inc = e.target.closest("[data-inc]");
      if (inc) { const it = getCart().find((i) => i.id === inc.dataset.inc); P.cart.update(inc.dataset.inc, (it ? it.qty : 1) + 1); return; }
      const dec = e.target.closest("[data-dec]");
      if (dec) { const it = getCart().find((i) => i.id === dec.dataset.dec); P.cart.update(dec.dataset.dec, (it ? it.qty : 1) - 1); return; }
      const clear = e.target.closest("[data-clear-cart]");
      if (clear) { P.cart.clear(); return; }
    });

    document.addEventListener("change", (e) => {
      const q = e.target.closest("[data-qty]");
      if (q) P.cart.update(q.dataset.qty, parseInt(q.value, 10) || 1);
      const ship = e.target.closest("[name=shipmethod]");
      if (ship) P.cart.setShipping(ship.value);
    });

    const couponForm = $("#coupon-form");
    if (couponForm) couponForm.addEventListener("submit", (e) => {
      e.preventDefault();
      P.cart.applyCoupon($("#coupon-code").value);
    });
  }

  /* ---- Product details page --------------------------------------------- */
  function initProductDetails() {
    const root = $("#product-detail");
    if (!root) return;
    const id = new URLSearchParams(location.search).get("id") || "p1";
    const p = P.byId(id) || P.PRODUCTS[0];

    root.querySelectorAll("[data-field]").forEach((el) => {
      const key = el.dataset.field;
      if (key === "price") el.innerHTML = P.money(p.price) + (p.old ? ` <span class="price-old">${P.money(p.old)}</span>` : "");
      else if (key === "stars") el.innerHTML = P.starsHtml(p.rating);
      else if (key === "stock") { el.textContent = p.stock ? `In stock · ${p.stock} available` : "Out of stock"; el.className = p.stock ? "badge badge-success" : "badge badge-danger"; }
      else el.textContent = p[key];
    });

    const main = $("#gallery-main img");
    const thumbs = $$(".gallery-thumb");
    if (main) main.src = p.img;
    thumbs.forEach((t, i) => {
      const img = t.querySelector("img");
      img.src = [p.img, "assets/images/plant-2.png", "assets/images/plant-4.png", "assets/images/plant-6.png"][i];
      t.addEventListener("click", () => {
        thumbs.forEach((x) => x.classList.remove("is-active"));
        t.classList.add("is-active");
        main.src = img.src;
      });
    });
    const zoomBox = $("#gallery-main");
    if (zoomBox) zoomBox.addEventListener("click", () => zoomBox.classList.toggle("is-zoomed"));

    const detailAdd = $("#detail-add");
    if (detailAdd) detailAdd.addEventListener("click", () => P.cart.add(p.id, parseInt($("#detail-qty").value, 10) || 1));
    const detailWish = $("#detail-wish");
    if (detailWish) detailWish.addEventListener("click", () => P.wishlist.toggle(p.id));
    const detailQtyWrap = $("#detail-qty-wrap");
    if (detailQtyWrap) detailQtyWrap.addEventListener("click", (e) => {
      const input = $("#detail-qty");
      if (e.target.dataset.step === "up") input.value = (+input.value || 1) + 1;
      if (e.target.dataset.step === "down") input.value = Math.max(1, (+input.value || 1) - 1);
    });

    P.recentlyViewed && P.recentlyViewed(p.id);
    P.renderProducts("#related-products", P.PRODUCTS.filter((x) => x.cat === p.cat && x.id !== p.id).slice(0, 4));
    document.title = `${p.name} — Planto`;
  }

  document.addEventListener("planto:ready", () => { bind(); paint(); initProductDetails(); });
})();
