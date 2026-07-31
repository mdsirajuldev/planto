/* =========================================================================
   dashboard.js — account overview, profile, orders, order details, invoice,
   notifications, reviews, avatar upload, address book.
   ========================================================================= */
(function () {
  "use strict";
  const P = (window.PLANTO = window.PLANTO || {});
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  const DEMO_ORDERS = [
    { id: "PLT-284517", date: "02 Jul 2026", status: "Delivered", payment: "stripe", total: 1288, items: [{ id: "p1", name: "Calathea Plant", qty: 2, price: 359, img: "assets/images/plant-1.png" }, { id: "p3", name: "Golden Cactus", qty: 1, price: 259, img: "assets/images/plant-3.png" }], subtotal: 977, discount: 0, shipping: 79, tax: 49 },
    { id: "PLT-284102", date: "18 Jun 2026", status: "Shipped", payment: "paypal", total: 699, items: [{ id: "p4", name: "Alocasia Round", qty: 1, price: 599, img: "assets/images/plant-4.png" }], subtotal: 599, discount: 0, shipping: 79, tax: 21 },
    { id: "PLT-283664", date: "27 May 2026", status: "Cancelled", payment: "cod", total: 329, items: [{ id: "p6", name: "Zebra Haworthia", qty: 1, price: 329, img: "assets/images/plant-6.png" }], subtotal: 329, discount: 0, shipping: 0, tax: 0 }
  ];

  const allOrders = () => P.store.get("orders", []).concat(DEMO_ORDERS);

  const statusBadge = (s) =>
    `<span class="badge ${s === "Delivered" ? "badge-success" : s === "Cancelled" ? "badge-danger" : ""}">${s}</span>`;

  function greet() {
    const user = P.store.get("user", { name: "Plant Lover", email: "hello@planto.com" });
    $$("[data-user-name]").forEach((el) => (el.textContent = user ? user.name : "Guest"));
    $$("[data-user-email]").forEach((el) => (el.textContent = user ? user.email : "—"));
    $$("input[data-user-fill=name]").forEach((el) => (el.value = user ? user.name : ""));
    $$("input[data-user-fill=email]").forEach((el) => (el.value = user ? user.email : ""));
  }

  function initStats() {
    const wrap = $("#dash-stats");
    if (!wrap) return;
    const orders = allOrders();
    const spent = orders.reduce((s, o) => s + o.total, 0);
    const stats = [
      { label: "Total Orders", value: orders.length, icon: "fa-box" },
      { label: "Total Spent", value: P.money(spent), icon: "fa-wallet" },
      { label: "Wishlist Items", value: P.wishlist.items().length, icon: "fa-heart" },
      { label: "Reward Points", value: Math.round(spent / 10), icon: "fa-leaf" }
    ];
    wrap.innerHTML = stats.map((s, i) => `
      <div class="card stat-card reveal" data-delay="${i}">
        <span class="feature-icon"><i class="fa-solid ${s.icon}"></i></span>
        <span class="stat-value">${s.value}</span>
        <span class="text-sm text-dim">${s.label}</span>
      </div>`).join("");
    P.observeReveals();
  }

  function initOrders() {
    const body = $("#orders-body");
    if (!body) return;
    const render = (filter = "all") => {
      const list = allOrders().filter((o) => filter === "all" || o.status.toLowerCase() === filter);
      body.innerHTML = list.length ? list.map((o) => `
        <tr>
          <td><a class="text-accent" href="order-details.html?order=${o.id}">${o.id}</a></td>
          <td>${o.date}</td>
          <td>${o.items.length} item${o.items.length > 1 ? "s" : ""}</td>
          <td>${statusBadge(o.status)}</td>
          <td class="fw-600">${P.money(o.total)}</td>
          <td><a class="btn btn-sm" href="order-details.html?order=${o.id}">View</a></td>
        </tr>`).join("")
        : `<tr><td colspan="6"><div class="empty-state"><i class="fa-solid fa-box-open"></i><h3>No orders here</h3><p>When you place an order it will appear in this list.</p></div></td></tr>`;
    };
    render();
    $$("[data-order-filter]").forEach((btn) => btn.addEventListener("click", () => {
      $$("[data-order-filter]").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      render(btn.dataset.orderFilter);
    }));

    const recent = $("#recent-orders");
    if (recent) recent.innerHTML = allOrders().slice(0, 3).map((o) => `
      <tr><td><a class="text-accent" href="order-details.html?order=${o.id}">${o.id}</a></td>
      <td>${o.date}</td><td>${statusBadge(o.status)}</td><td class="fw-600">${P.money(o.total)}</td></tr>`).join("");
  }

  function initOrderDetails() {
    const wrap = $("#order-details");
    if (!wrap) return;
    const id = new URLSearchParams(location.search).get("order");
    const order = allOrders().find((o) => o.id === id) || allOrders()[0];
    if (!order) return;
    $$("[data-order-id]").forEach((el) => (el.textContent = order.id));
    $$("[data-order-date]").forEach((el) => (el.textContent = order.date));
    $$("[data-order-status]").forEach((el) => (el.innerHTML = statusBadge(order.status)));
    $$("[data-order-payment]").forEach((el) => (el.textContent = order.payment.toUpperCase()));
    const rows = $("#order-items");
    if (rows) rows.innerHTML = order.items.map((i) => `
      <tr>
        <td><span class="flex items-center gap-3"><img class="cart-thumb" src="${i.img}" alt="${i.name}" /><strong>${i.name}</strong></span></td>
        <td>${P.money(i.price)}</td><td>${i.qty}</td><td class="fw-600">${P.money(i.price * i.qty)}</td>
      </tr>`).join("");
    setAll("[data-o-subtotal]", P.money(order.subtotal));
    setAll("[data-o-shipping]", order.shipping ? P.money(order.shipping) : "Free");
    setAll("[data-o-tax]", P.money(order.tax));
    setAll("[data-o-total]", P.money(order.total));
    const print = $("#print-invoice");
    if (print) print.addEventListener("click", () => window.print());
  }
  function setAll(sel, v) { $$(sel).forEach((el) => (el.textContent = v)); }

  function initAvatar() {
    const input = $("#avatar-input");
    const preview = $("#avatar-preview");
    if (!input || !preview) return;
    input.addEventListener("change", () => {
      const file = input.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => { preview.src = e.target.result; P.toast("Profile picture updated."); };
      reader.readAsDataURL(file);
    });
  }

  function initNotifications() {
    const list = $("#notifications");
    if (!list) return;
    const items = [
      { icon: "fa-truck-fast", text: "Order PLT-284102 is out for delivery.", time: "2 hours ago" },
      { icon: "fa-tag", text: "Flash sale: 20% off all succulents with GREEN20.", time: "Yesterday" },
      { icon: "fa-droplet", text: "Watering reminder for your Calathea Plant.", time: "3 days ago" },
      { icon: "fa-star", text: "Leave a review for Golden Cactus and earn points.", time: "1 week ago" }
    ];
    list.innerHTML = items.map((n) => `
      <div class="card flex items-center gap-4">
        <span class="feature-icon mb-0"><i class="fa-solid ${n.icon}"></i></span>
        <span class="flex-1"><strong class="text-sm">${n.text}</strong><span class="text-xs text-dim" style="display:block">${n.time}</span></span>
        <button class="icon-btn" aria-label="Dismiss" onclick="this.closest('.card').remove()"><i class="fa-solid fa-xmark"></i></button>
      </div>`).join("");
  }

  function initRating() {
    $$("[data-rating-input]").forEach((wrap) => {
      wrap.innerHTML = [1, 2, 3, 4, 5].map((n) => `<button type="button" class="icon-btn" data-star="${n}">★</button>`).join("");
      wrap.addEventListener("click", (e) => {
        const b = e.target.closest("[data-star]");
        if (!b) return;
        const v = +b.dataset.star;
        $$("[data-star]", wrap).forEach((s) => (s.style.color = +s.dataset.star <= v ? "var(--c-star)" : ""));
        wrap.dataset.value = v;
      });
    });
  }

  document.addEventListener("planto:ready", () => {
    greet(); initStats(); initOrders(); initOrderDetails(); initAvatar(); initNotifications(); initRating();
  });
})();
