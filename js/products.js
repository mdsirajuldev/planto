/* =========================================================================
   products.js — product catalogue + card rendering helpers (vanilla ES6+)
   Exposed globally as window.PLANTO
   ========================================================================= */
(function () {
  "use strict";

  const IMG = "assets/images/";

  const PRODUCTS = [
    { id: "p1", name: "Calathea Plant",   cat: "indoor",    price: 359, old: 429, rating: 5, img: IMG + "plant-1.png", tag: "Best Seller", stock: 12, desc: "Bright patterned foliage that thrives in soft indirect light." },
    { id: "p2", name: "Peace Lily",       cat: "indoor",    price: 429, old: 499, rating: 4, img: IMG + "plant-2.png", tag: "New",         stock: 8,  desc: "A calm air-purifying classic for living rooms and studios." },
    { id: "p3", name: "Golden Cactus",    cat: "cactus",    price: 259, old: 0,   rating: 4, img: IMG + "plant-3.png", tag: "Trending",    stock: 24, desc: "Low maintenance desert charm in a warm terracotta pot." },
    { id: "p4", name: "Alocasia Round",   cat: "indoor",    price: 599, old: 699, rating: 5, img: IMG + "plant-4.png", tag: "Flash Sale",  stock: 5,  desc: "Deep glossy leaves with a sculptural black ceramic base." },
    { id: "p5", name: "Dracaena Palm",    cat: "outdoor",   price: 479, old: 0,   rating: 4, img: IMG + "plant-5.png", tag: "",            stock: 17, desc: "Architectural spikes that add height to balconies and patios." },
    { id: "p6", name: "Zebra Haworthia",  cat: "succulent", price: 329, old: 379, rating: 5, img: IMG + "plant-6.png", tag: "Best Seller", stock: 0,  desc: "A tiny striped succulent in a mint glazed pot. Desk sized." },
    { id: "p7", name: "Calathea Mini",    cat: "indoor",    price: 299, old: 0,   rating: 4, img: IMG + "plant-1.png", tag: "",            stock: 21, desc: "The compact version of our bestseller, perfect for shelves." },
    { id: "p8", name: "Cactus Duo",       cat: "cactus",    price: 389, old: 449, rating: 3, img: IMG + "plant-3.png", tag: "New",         stock: 9,  desc: "Two hardy cacti paired in matching glazed planters." },
    { id: "p9", name: "Fresh Deco Plant", cat: "outdoor",   price: 579, old: 649, rating: 5, img: IMG + "plant-2.png", tag: "Trending",    stock: 6,  desc: "A generous leafy statement piece for entrances." },
    { id: "p10", name: "Succulent Trio",  cat: "succulent", price: 449, old: 0,   rating: 4, img: IMG + "plant-6.png", tag: "",            stock: 14, desc: "Three easy-care succulents curated for beginners." },
    { id: "p11", name: "Black Pot Ficus", cat: "indoor",    price: 649, old: 749, rating: 5, img: IMG + "plant-4.png", tag: "Best Seller", stock: 4,  desc: "Elegant dark foliage with a polished matte black pot." },
    { id: "p12", name: "Palm Small",      cat: "outdoor",   price: 399, old: 0,   rating: 4, img: IMG + "plant-5.png", tag: "",            stock: 19, desc: "A pocket-sized palm that loves bright morning light." }
  ];

  const CATEGORIES = [
    { slug: "indoor",    name: "Indoor Plants", img: IMG + "plant-1.png", count: 42 },
    { slug: "succulent", name: "Succulents",    img: IMG + "plant-6.png", count: 28 },
    { slug: "cactus",    name: "Cactus",        img: IMG + "plant-3.png", count: 19 },
    { slug: "outdoor",   name: "Outdoor Plants",img: IMG + "plant-5.png", count: 33 }
  ];

  const POSTS = [
    { slug: "watering-guide",  title: "The Honest Watering Guide For Indoor Plants", date: "12 Mar 2026", cat: "Care", img: IMG + "plant-2.png", excerpt: "Most plants die from love, not neglect. Here is how to read soil instead of a calendar." },
    { slug: "low-light",       title: "Nine Plants That Actually Thrive In Low Light", date: "28 Feb 2026", cat: "Guides", img: IMG + "plant-4.png", excerpt: "North-facing room? These nine picks stay lush without direct sun." },
    { slug: "repotting",       title: "Repotting Without The Transplant Shock", date: "09 Feb 2026", cat: "Care", img: IMG + "plant-1.png", excerpt: "A calm five-step method for moving a plant into a bigger home." },
    { slug: "styling",         title: "Styling Plants Like An Interior Designer", date: "21 Jan 2026", cat: "Interior", img: IMG + "plant-5.png", excerpt: "Grouping, height layering and pot palettes that make rooms feel finished." },
    { slug: "succulent-soil",  title: "Getting Succulent Soil Right The First Time", date: "05 Jan 2026", cat: "Guides", img: IMG + "plant-6.png", excerpt: "Drainage beats fertiliser. Our house mix, measured out for you." },
    { slug: "winter-care",     title: "Winter Care: Slowing Down With Your Plants", date: "18 Dec 2025", cat: "Seasonal", img: IMG + "plant-3.png", excerpt: "Shorter days change everything. Adjust light, water and feeding." }
  ];

  const REVIEWS = [
    { name: "Maxn Raval",  rating: 5, text: "Delivery was quick and the Calathea arrived in perfect condition. The pot quality genuinely surprised me for the price." },
    { name: "Venely K",    rating: 5, text: "I have killed every plant I owned before Planto. Their care card and reminder emails changed that completely." },
    { name: "Lii Thakur",  rating: 4, text: "Beautiful packaging, healthy roots and a helpful team on chat. My second order arrived even better than the first." },
    { name: "Jekna Patel", rating: 5, text: "The styling advice they sent with my order made my apartment look like a magazine spread." },
    { name: "Rohan M.",    rating: 5, text: "Ordered six plants for our office. Three months in and every single one is thriving." }
  ];

  /* ---- formatting + rendering ------------------------------------------ */
  const money = (n) => "Rs. " + Number(n).toLocaleString("en-IN") + "/-";
  const starsHtml = (n) => "★★★★★".slice(0, n) + "<span style='opacity:.3'>" + "★★★★★".slice(0, 5 - n) + "</span>";

  function productCard(p, index = 0) {
    const soldOut = p.stock === 0;
    return `
    <article class="card product-card reveal" data-delay="${index % 4}" data-id="${p.id}">
      ${p.tag ? `<span class="badge product-tag">${p.tag}</span>` : ""}
      <a class="product-media" href="product-details.html?id=${p.id}" aria-label="${p.name}">
        <img src="${p.img}" alt="${p.name} in a decorative pot" loading="lazy" width="768" height="768" />
      </a>
      <div class="stars">${starsHtml(p.rating)}</div>
      <h3 class="product-title"><a href="product-details.html?id=${p.id}">${p.name}</a></h3>
      <p class="product-desc">${p.desc}</p>
      <div class="product-foot">
        <span class="price">${money(p.price)} ${p.old ? `<span class="price-old">${money(p.old)}</span>` : ""}</span>
        <span class="flex gap-2">
          <button class="icon-btn" data-wish="${p.id}" aria-label="Add ${p.name} to wishlist"><i class="fa-regular fa-heart"></i></button>
          <button class="icon-btn" data-compare="${p.id}" aria-label="Compare ${p.name}"><i class="fa-solid fa-code-compare"></i></button>
          <button class="icon-btn" data-add="${p.id}" aria-label="Add ${p.name} to cart" ${soldOut ? "disabled" : ""}><i class="fa-solid fa-bag-shopping"></i></button>
        </span>
      </div>
      <span class="text-xs ${soldOut ? "text-danger" : "text-accent"}">${soldOut ? "Out of stock" : "In stock · " + p.stock + " left"}</span>
    </article>`;
  }

  function renderProducts(target, list) {
    const el = typeof target === "string" ? document.querySelector(target) : target;
    if (!el) return;
    el.innerHTML = list.length
      ? list.map(productCard).join("")
      : `<div class="empty-state" style="grid-column:1/-1"><i class="fa-solid fa-leaf"></i><h3>No plants found</h3><p>Try clearing a filter or searching a different term.</p></div>`;
    if (window.PLANTO.observeReveals) window.PLANTO.observeReveals();
  }

  function postCard(post, i = 0) {
    return `
    <article class="card post-card reveal" data-delay="${i % 3}">
      <a class="post-media" href="blog-details.html?post=${post.slug}">
        <img src="${post.img}" alt="${post.title}" loading="lazy" />
      </a>
      <div class="post-meta"><span><i class="fa-regular fa-calendar"></i> ${post.date}</span><span><i class="fa-solid fa-tag"></i> ${post.cat}</span></div>
      <h3 class="product-title"><a href="blog-details.html?post=${post.slug}">${post.title}</a></h3>
      <p class="product-desc">${post.excerpt}</p>
      <a class="text-accent text-sm" href="blog-details.html?post=${post.slug}">Read article <i class="fa-solid fa-arrow-right"></i></a>
    </article>`;
  }

  function reviewCard(r) {
    return `
    <article class="card testimonial-card">
      <div class="testimonial-head">
        <span class="avatar" aria-hidden="true" style="display:grid;place-items:center;color:var(--c-accent)"><i class="fa-solid fa-user"></i></span>
        <span>
          <strong>${r.name}</strong>
          <span class="stars" style="display:block">${starsHtml(r.rating)}</span>
        </span>
      </div>
      <p class="text-sm">${r.text}</p>
    </article>`;
  }

  const byId = (id) => PRODUCTS.find((p) => p.id === id);

  window.PLANTO = Object.assign(window.PLANTO || {}, {
    PRODUCTS, CATEGORIES, POSTS, REVIEWS,
    money, starsHtml, productCard, renderProducts, postCard, reviewCard, byId
  });
})();
