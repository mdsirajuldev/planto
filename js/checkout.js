/* =========================================================================
   checkout.js — billing/shipping forms, payment selection, order simulation
   ========================================================================= */
(function () {
  "use strict";
  const P = (window.PLANTO = window.PLANTO || {});
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  function orderId() {
    return "PLT-" + Math.floor(100000 + Math.random() * 899999);
  }

  function saveOrder(payment) {
    const t = P.cart.totals();
    const order = {
      id: orderId(),
      date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      status: "Processing",
      payment,
      items: t.items.map((i) => ({ id: i.id, name: i.product.name, qty: i.qty, price: i.product.price, img: i.product.img })),
      subtotal: t.subtotal, discount: t.discount, shipping: t.shipping, tax: t.tax, total: t.total,
      address: P.store.get("checkout", {})
    };
    const orders = P.store.get("orders", []);
    orders.unshift(order);
    P.store.set("orders", orders);
    P.store.set("lastOrder", order);
    P.cart.clear();
    P.store.set("coupon", null);
    return order;
  }

  function initCheckout() {
    const form = $("#checkout-form");
    if (!form) return;

    // Copy billing → shipping toggle
    const same = $("#same-address");
    const shipBlock = $("#shipping-block");
    if (same && shipBlock) {
      const sync = () => shipBlock.classList.toggle("hidden", same.checked);
      same.addEventListener("change", sync); sync();
    }

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!P.validate(form)) return P.toast("Please complete the highlighted fields.", "fa-circle-exclamation");
      const data = {};
      new FormData(form).forEach((v, k) => (data[k] = v));
      P.store.set("checkout", data);
      location.href = "payment.html";
    });
  }

  function initPayment() {
    const wrap = $("#payment-page");
    if (!wrap) return;

    $$(".pay-option").forEach((opt) => {
      opt.addEventListener("click", () => {
        $$(".pay-option").forEach((o) => o.classList.remove("is-selected"));
        opt.classList.add("is-selected");
        opt.querySelector("input").checked = true;
        const card = $("#card-fields");
        if (card) card.classList.toggle("hidden", opt.querySelector("input").value !== "stripe");
      });
    });
    const first = $(".pay-option");
    if (first) first.click();

    const form = $("#payment-form");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const method = ($("input[name=payment]:checked") || {}).value || "cod";
      if (method === "stripe" && !P.validate(form)) return P.toast("Check your card details.", "fa-circle-exclamation");
      const btn = $("#place-order");
      btn.disabled = true;
      btn.innerHTML = `<span class="spinner"></span> Processing…`;
      setTimeout(() => {
        // Frontend simulation: 'fail' card number demonstrates the failed state.
        const cardNo = ($("#card-number") || {}).value || "";
        if (cardNo.replace(/\s/g, "") === "4000000000000002") {
          btn.disabled = false;
          btn.textContent = "Place Order";
          $("#pay-failed").classList.remove("hidden");
          P.toast("Payment declined by the issuer.", "fa-circle-xmark");
          return;
        }
        const order = saveOrder(method);
        location.href = "order-success.html?order=" + order.id;
      }, 1400);
    });
  }

  function initSuccess() {
    const wrap = $("#order-success");
    if (!wrap) return;
    const order = P.store.get("lastOrder", null);
    if (!order) return;
    $$("[data-order-id]").forEach((el) => (el.textContent = order.id));
    $$("[data-order-total]").forEach((el) => (el.textContent = P.money(order.total)));
    $$("[data-order-date]").forEach((el) => (el.textContent = order.date));
    $$("[data-order-payment]").forEach((el) => (el.textContent = order.payment.toUpperCase()));
    const list = $("#success-items");
    if (list) list.innerHTML = order.items.map((i) =>
      `<div class="summary-row"><span>${i.name} × ${i.qty}</span><span>${P.money(i.price * i.qty)}</span></div>`).join("");
  }

  document.addEventListener("planto:ready", () => { initCheckout(); initPayment(); initSuccess(); });
})();
