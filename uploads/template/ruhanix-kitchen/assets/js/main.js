/* Ruhanix Kitchen — main UI + pages (no framework, ready to deploy) */
(() => {
  const DATA = window.RK_DATA;
  if (!DATA) return;

  // ---------- Utils ----------
  const qs = (sel, el = document) => el.querySelector(sel);
  const qsa = (sel, el = document) => [...el.querySelectorAll(sel)];
  const fmtINR = (n) => `₹${Number(n).toFixed(2)}`;
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

  // ---------- Cart (localStorage) ----------
  const CART_KEY = "rk_cart_v1";
  const Cart = {
    get(){
      try { return JSON.parse(localStorage.getItem(CART_KEY) || "[]"); }
      catch { return []; }
    },
    set(items){ localStorage.setItem(CART_KEY, JSON.stringify(items)); },
    count(){ return this.get().reduce((s, it) => s + (it.qty || 0), 0); },
    add(id, qty = 1){
      const items = this.get();
      const ix = items.findIndex(x => x.id === id);
      if (ix >= 0) items[ix].qty += qty;
      else items.push({ id, qty });
      this.set(items);
      UI.refreshCartBadge();
    },
    setQty(id, qty){
      const items = this.get();
      const ix = items.findIndex(x => x.id === id);
      if (ix < 0) return;
      items[ix].qty = clamp(qty, 1, 99);
      this.set(items);
      UI.refreshCartBadge();
    },
    remove(id){
      this.set(this.get().filter(x => x.id !== id));
      UI.refreshCartBadge();
    },
    clear(){
      this.set([]);
      UI.refreshCartBadge();
    },
    subtotal(){
      const items = this.get();
      return items.reduce((sum, it) => {
        const p = DATA.products.find(x => x.id === it.id);
        return sum + (p ? p.price * it.qty : 0);
      }, 0);
    }
  };

  // ---------- Toast ----------
  const Toast = {
    el: null,
    t: null,
    init(){
      this.el = qs("#toast");
    },
    show(title, msg){
      if (!this.el) return;
      qs(".toast__title", this.el).textContent = title;
      qs(".toast__msg", this.el).textContent = msg;
      this.el.classList.add("is-show");
      clearTimeout(this.t);
      this.t = setTimeout(() => this.el.classList.remove("is-show"), 2400);
    }
  };

  // ---------- Global UI ----------
  const UI = {
    init(){
      // Active link in header + sidebar
      const path = location.pathname.split("/").pop() || "index.html";
      qsa(`[data-nav-link]`).forEach(a => {
        const href = a.getAttribute("href") || "";
        if (href.endsWith(path)) a.setAttribute("aria-current", "page");
        else a.removeAttribute("aria-current");
      });

      // Sidebar
      const sidebar = qs("#sidebar");
      const overlay = qs("#overlaySidebar");
      const openBtns = qsa("[data-open-sidebar]");
      const closeBtns = qsa("[data-close-sidebar]");
      const openSidebar = () => { sidebar?.classList.add("is-open"); overlay?.classList.add("is-open"); sidebar?.setAttribute("aria-hidden", "false"); };
      const closeSidebar = () => { sidebar?.classList.remove("is-open"); overlay?.classList.remove("is-open"); sidebar?.setAttribute("aria-hidden", "true"); };
      openBtns.forEach(b => b.addEventListener("click", openSidebar));
      closeBtns.forEach(b => b.addEventListener("click", closeSidebar));
      overlay?.addEventListener("click", closeSidebar);
      document.addEventListener("keydown", (e) => { if (e.key === "Escape") { closeSidebar(); closeCart(); } });

      // Cart drawer
      const drawer = qs("#cartDrawer");
      const overlayCart = qs("#overlayCart");
      const openCartBtns = qsa("[data-open-cart]");
      const closeCartBtns = qsa("[data-close-cart]");
      const openCart = () => { drawer?.classList.add("is-open"); overlayCart?.classList.add("is-open"); drawer?.setAttribute("aria-hidden", "false"); this.renderCartDrawer(); };
      const closeCart = () => { drawer?.classList.remove("is-open"); overlayCart?.classList.remove("is-open"); drawer?.setAttribute("aria-hidden", "true"); };
      window.closeCart = closeCart; // used by ESC handler
      openCartBtns.forEach(b => b.addEventListener("click", openCart));
      closeCartBtns.forEach(b => b.addEventListener("click", closeCart));
      overlayCart?.addEventListener("click", closeCart);

      // Prevent body horizontal overflow by ensuring drawers don't create layout shifts
      // (they're fixed, but keep just in case)
      document.documentElement.style.overflowX = "hidden";

      // Footer year
      const y = qs("[data-year]");
      if (y) y.textContent = String(new Date().getFullYear());

      // Scroll reveal
      this.initReveal();

      // Cart badge
      this.refreshCartBadge();
      // Add-to-cart delegation
      document.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-add-to-cart]");
        if (!btn) return;
        const id = btn.getAttribute("data-add-to-cart");
        Cart.add(id, 1);
        Toast.show("Added to cart", "Item added successfully.");
        // Optional: open cart if user wants instant feedback
      });
    },

    refreshCartBadge(){
      qsa("[data-cart-count]").forEach(el => {
        const c = Cart.count();
        el.textContent = String(c);
        el.style.display = c > 0 ? "grid" : "none";
      });
    },

    renderStars(rating){
      const full = Math.floor(rating);
      const half = (rating - full) >= 0.5;
      let html = "";
      for (let i=0;i<5;i++){
        if (i < full) html += `<i class="ri-star-fill"></i>`;
        else if (i === full && half) html += `<i class="ri-star-half-fill"></i>`;
        else html += `<i class="ri-star-line"></i>`;
      }
      return `<div class="stars" aria-label="${rating} stars">${html}</div>`;
    },

    renderProductCard(p){
      return `
        <article class="product" data-animate>
          <a class="product__img" href="product.html?id=${encodeURIComponent(p.id)}" aria-label="Open ${escapeHtml(p.name)}">
            <img loading="lazy" src="${p.img}" alt="${escapeHtml(p.name)}" />
          </a>
          <div class="product__body">
            <h3 class="product__title">${escapeHtml(p.name)}</h3>
            ${this.renderStars(p.rating)}
            <div class="meta">
              <span class="tag"><i class="ri-leaf-line"></i>${p.type === "veg" ? "Veg" : "Non-Veg"}</span>
              <span>${categoryName(p.category)}</span>
            </div>
            <div class="price">From ${fmtINR(p.price)}</div>
            <div class="points">Earn up to ${p.points} loyalty points.</div>
          </div>
          <div class="product__actions">
            <a class="btn btn--ghost btn--small" href="product.html?id=${encodeURIComponent(p.id)}"><i class="ri-eye-line"></i>View</a>
            <button class="btn btn--primary btn--small" data-add-to-cart="${p.id}"><i class="ri-shopping-cart-2-line"></i>Add</button>
          </div>
        </article>
      `;
    },

    renderCartDrawer(){
      const items = Cart.get();
      const list = qs("#cartItems");
      const subtotalEl = qs("#cartSubtotal");
      const emptyEl = qs("#cartEmpty");

      if (!list || !subtotalEl) return;

      if (items.length === 0){
        list.innerHTML = "";
        emptyEl?.classList.remove("sr-only");
      } else {
        emptyEl?.classList.add("sr-only");
        list.innerHTML = items.map(it => {
          const p = DATA.products.find(x => x.id === it.id);
          if (!p) return "";
          return `
            <div class="cart-item">
              <img src="${p.img}" alt="${escapeHtml(p.name)}" />
              <div>
                <div class="cart-item__title">${escapeHtml(p.name)}</div>
                <div class="cart-item__meta">${fmtINR(p.price)} • ${p.type === "veg" ? "Veg" : "Non-Veg"}</div>
                <div class="qty-row" style="margin-top:10px">
                  <div class="stepper" role="group" aria-label="Quantity selector">
                    <button class="cart-dec" data-id="${p.id}" aria-label="Decrease quantity"><i class="ri-subtract-line"></i></button>
                    <span>${it.qty}</span>
                    <button class="cart-inc" data-id="${p.id}" aria-label="Increase quantity"><i class="ri-add-line"></i></button>
                  </div>
                  <button class="icon-link cart-remove" data-id="${p.id}" aria-label="Remove item"><i class="ri-close-line"></i></button>
                </div>
              </div>
              <div style="text-align:right; font-weight:800">${fmtINR(p.price * it.qty)}</div>
            </div>
          `;
        }).join("");
      }

      subtotalEl.textContent = fmtINR(Cart.subtotal());

      // bind qty handlers (rebind per render)
      qsa(".cart-inc", list).forEach(b => b.addEventListener("click", () => {
        const id = b.getAttribute("data-id");
        const it = Cart.get().find(x => x.id === id);
        if (it) Cart.setQty(id, it.qty + 1);
        this.renderCartDrawer();
      }));
      qsa(".cart-dec", list).forEach(b => b.addEventListener("click", () => {
        const id = b.getAttribute("data-id");
        const it = Cart.get().find(x => x.id === id);
        if (it) Cart.setQty(id, it.qty - 1);
        this.renderCartDrawer();
      }));
      qsa(".cart-remove", list).forEach(b => b.addEventListener("click", () => {
        Cart.remove(b.getAttribute("data-id"));
        Toast.show("Removed", "Item removed from cart.");
        this.renderCartDrawer();
      }));
    },

    initReveal(){
      const els = qsa("[data-animate]");
      if (els.length === 0) return;
      const io = new IntersectionObserver((entries) => {
        entries.forEach(en => {
          if (en.isIntersecting) en.target.classList.add("is-in");
        });
      }, { threshold: 0.12 });
      els.forEach(el => io.observe(el));
    }
  };

  // ---------- Helpers ----------
  function categoryName(id){
    const c = DATA.categories.find(x => x.id === id);
    return c ? c.name : "Category";
  }
  function escapeHtml(str){
    return String(str).replace(/[&<>"']/g, (m) => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
    }[m]));
  }
  function getParam(key){
    return new URLSearchParams(location.search).get(key);
  }

  // ---------- Category Carousel ----------
  function initCategoryCarousel(containerSel, activeId, onSelect){
    const wrap = qs(containerSel);
    if (!wrap) return;

    const scroller = qs(".cat-carousel", wrap);
    const prev = qs("[data-carousel-prev]", wrap);
    const next = qs("[data-carousel-next]", wrap);

    scroller.innerHTML = DATA.categories.map(c => `
      <div class="cat ${c.id === activeId ? "is-active" : ""}" role="button" tabindex="0" data-cat="${c.id}">
        <div class="cat__img"><img loading="lazy" src="${c.img}" alt="${escapeHtml(c.name)}"/></div>
        <div class="cat__title">${escapeHtml(c.name)}</div>
      </div>
    `).join("");

    const select = (id) => {
      qsa(".cat", scroller).forEach(el => el.classList.toggle("is-active", el.getAttribute("data-cat") === id));
      onSelect?.(id);
    };

    scroller.addEventListener("click", (e) => {
      const el = e.target.closest(".cat");
      if (!el) return;
      select(el.getAttribute("data-cat"));
    });
    scroller.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      const el = e.target.closest(".cat");
      if (!el) return;
      e.preventDefault();
      select(el.getAttribute("data-cat"));
    });

    const scrollByAmt = (dir) => {
      const amt = Math.min(scroller.clientWidth * 0.85, 520);
      scroller.scrollBy({ left: dir * amt, behavior: "smooth" });
    };
    prev?.addEventListener("click", () => scrollByAmt(-1));
    next?.addEventListener("click", () => scrollByAmt(1));
  }

  // ---------- Pages ----------
  function initHome(){
    const featured = qs("#featuredGrid");
    if (featured){
      featured.innerHTML = DATA.featured.map(p => UI.renderProductCard(p)).join("");
      UI.initReveal();
    }

    initCategoryCarousel("#homeCats", "all", (id) => {
      location.href = `menu.html?cat=${encodeURIComponent(id)}`;
    });
  }

  function initMenu(){
    const grid = qs("#menuGrid");
    if (!grid) return;

    let activeCat = getParam("cat") || "all";

    const searchInput = qs("#searchInput");
    const vegOnly = qs("#vegOnly");
    const nonvegOnly = qs("#nonvegOnly");
    const sortSel = qs("#sortSelect");
    const countEl = qs("#resultCount");

    initCategoryCarousel("#menuCats", activeCat, (id) => {
      activeCat = id;
      render();
    });

    const applyFilters = () => {
      const q = (searchInput?.value || "").trim().toLowerCase();
      const onlyVeg = !!vegOnly?.checked;
      const onlyNonVeg = !!nonvegOnly?.checked;

      let items = DATA.products.slice();

      if (activeCat !== "all") items = items.filter(p => p.category === activeCat);
      if (onlyVeg && !onlyNonVeg) items = items.filter(p => p.type === "veg");
      if (onlyNonVeg && !onlyVeg) items = items.filter(p => p.type === "nonveg");
      if (q) items = items.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.desc.toLowerCase().includes(q)
      );

      const sort = sortSel?.value || "popular";
      items.sort((a,b) => {
        if (sort === "rating") return b.rating - a.rating;
        if (sort === "price-asc") return a.price - b.price;
        if (sort === "price-desc") return b.price - a.price;
        return b.points - a.points; // "popular"
      });

      return items;
    };

    const render = () => {
      const items = applyFilters();
      if (countEl) countEl.textContent = `${items.length} dishes`;
      grid.innerHTML = items.map(p => UI.renderProductCard(p)).join("");
      UI.initReveal();
    };

    ["input","change"].forEach(evt => {
      searchInput?.addEventListener(evt, render);
      vegOnly?.addEventListener(evt, render);
      nonvegOnly?.addEventListener(evt, render);
      sortSel?.addEventListener(evt, render);
    });

    // Reset
    qs("#resetBtn")?.addEventListener("click", () => {
      if (searchInput) searchInput.value = "";
      if (vegOnly) vegOnly.checked = false;
      if (nonvegOnly) nonvegOnly.checked = false;
      if (sortSel) sortSel.value = "popular";
      activeCat = "all";
      initCategoryCarousel("#menuCats", activeCat, (id) => { activeCat = id; render(); });
      render();
    });

    render();
  }

  function initProduct(){
    const host = qs("#productHost");
    if (!host) return;

    const id = getParam("id") || DATA.products[0]?.id;
    const p = DATA.products.find(x => x.id === id) || DATA.products[0];
    if (!p) return;

    // Breadcrumb
    const bc = qs("#productBreadcrumb");
    if (bc){
      bc.innerHTML = `
        <a href="index.html">Home</a> <i class="ri-arrow-right-s-line"></i>
        <a href="menu.html">Menu</a> <i class="ri-arrow-right-s-line"></i>
        <a href="menu.html?cat=${encodeURIComponent(p.category)}">${escapeHtml(categoryName(p.category))}</a>
        <i class="ri-arrow-right-s-line"></i>
        <span>${escapeHtml(p.name)}</span>
      `;
    }

    host.innerHTML = `
      <div class="product-page">
        <div class="gallery" data-animate>
          <img src="${p.imgWide}" alt="${escapeHtml(p.name)}"/>
        </div>
        <div class="panel" data-animate>
          <div class="tag"><i class="ri-fire-line"></i> Freshly prepared</div>
          <h1>${escapeHtml(p.name)}</h1>
          ${UI.renderStars(p.rating)}
          <div class="price">From ${fmtINR(p.price)}</div>
          <div class="points">Earn up to ${p.points} loyalty points.</div>

          <div class="form-row">
            ${selectRow("Quantity", "optQty", p.options.quantity)}
            ${selectRow("Spicy Level", "optSpice", p.options.spice)}
            ${selectRow("Gravy Level", "optGravy", p.options.gravy)}
          </div>

          <div class="qty-row">
            <div class="stepper" role="group" aria-label="Quantity selector">
              <button id="pDec" aria-label="Decrease quantity"><i class="ri-subtract-line"></i></button>
              <span id="pQty">1</span>
              <button id="pInc" aria-label="Increase quantity"><i class="ri-add-line"></i></button>
            </div>
            <button class="btn btn--primary" id="pAdd"><i class="ri-shopping-cart-2-line"></i>Add To Cart</button>
          </div>

          <div class="notice">
            <i class="ri-time-line"></i>
            <div>
              <div style="font-weight:800">Prepared fresh</div>
              <div style="color:#0c6e4c">We start cooking after you order to ensure best quality.</div>
            </div>
          </div>
        </div>
      </div>

      <div class="section section--tight">
        <div class="panel" data-animate>
          <h3 style="margin:0 0 10px">A bit about the dish</h3>
          <p style="margin:0; color:var(--muted); line-height:1.75">${escapeHtml(p.desc)}</p>
          <div style="height:10px"></div>
          <h3 style="margin:0 0 10px">Reviews</h3>
          <p style="margin:0; color:var(--muted)">There are no reviews yet. (Demo template)</p>
        </div>
      </div>
    `;

    // Qty
    let qty = 1;
    const qtyEl = qs("#pQty");
    qs("#pInc")?.addEventListener("click", () => { qty = clamp(qty+1, 1, 99); qtyEl.textContent = String(qty); });
    qs("#pDec")?.addEventListener("click", () => { qty = clamp(qty-1, 1, 99); qtyEl.textContent = String(qty); });

    // Add
    qs("#pAdd")?.addEventListener("click", () => {
      Cart.add(p.id, qty);
      Toast.show("Added to cart", `${p.name} × ${qty}`);
      UI.renderCartDrawer();
    });

    // You might like
    const related = DATA.products.filter(x => x.category === p.category && x.id !== p.id).slice(0, 8);
    const like = qs("#youMightLike");
    if (like){
      like.innerHTML = related.map(r => `
        <div style="min-width:260px">
          ${UI.renderProductCard(r)}
        </div>
      `).join("");
      UI.initReveal();
    }

    function selectRow(label, id, opts){
      return `
        <div>
          <label for="${id}">${label}</label>
          <div class="selectbox">
            <select id="${id}">
              ${opts.map(o => `<option>${escapeHtml(o)}</option>`).join("")}
            </select>
            <i class="ri-arrow-down-s-line" style="color:var(--muted)"></i>
          </div>
        </div>
      `;
    }
  }

  function initCheckout(){
    const host = qs("#checkoutHost");
    if (!host) return;

    const items = Cart.get().map(it => {
      const p = DATA.products.find(x => x.id === it.id);
      return p ? { ...p, qty: it.qty } : null;
    }).filter(Boolean);

    if (items.length === 0){
      host.innerHTML = `
        <div class="panel" data-animate style="text-align:center">
          <h2 style="margin:0 0 10px">Your cart is empty</h2>
          <p style="margin:0; color:var(--muted)">Pick a few dishes and come back to checkout.</p>
          <div style="height:14px"></div>
          <a class="btn btn--primary" href="menu.html"><i class="ri-restaurant-line"></i>Browse Menu</a>
        </div>
      `;
      UI.initReveal();
      return;
    }

    const subtotal = Cart.subtotal();
    const cgst = +(subtotal * 0.025).toFixed(2);
    const igst = +(subtotal * 0.025).toFixed(2);
    const total = +(subtotal + cgst + igst).toFixed(2);

    host.innerHTML = `
      <div class="product-page" style="grid-template-columns: 1fr .75fr">
        <div class="panel" data-animate>
          <h2 style="margin:0 0 8px">Checkout</h2>
          <p style="margin:0; color:var(--muted)">Enter your delivery details and place the order.</p>

          <div style="height:14px"></div>

          <div class="panel" style="padding:14px; background:rgba(198,146,27,.06); box-shadow:none" data-animate>
            <div class="row-between">
              <strong>Coupon code</strong>
              <button class="icon-link" id="couponToggle" aria-label="Toggle coupon"><i class="ri-arrow-down-s-line"></i></button>
            </div>
            <div id="couponBox" style="display:none; margin-top:12px">
              <div class="field" style="border-radius:14px">
                <i class="ri-coupon-3-line"></i>
                <input id="couponInput" placeholder="Enter code (demo)" />
              </div>
              <div style="height:10px"></div>
              <button class="btn btn--primary btn--small" id="applyCoupon"><i class="ri-check-line"></i>Apply</button>
              <div id="couponMsg" style="margin-top:10px; color:var(--muted); font-size:13px"></div>
            </div>
          </div>

          <div style="height:14px"></div>

          <form id="orderForm">
            <div class="form-row" style="grid-template-columns:1fr 1fr">
              <div>
                <label>Full Name</label>
                <div class="selectbox"><input required name="name" style="border:none;background:transparent;outline:none;width:100%" placeholder="Your name"/></div>
              </div>
              <div>
                <label>Phone</label>
                <div class="selectbox"><input required name="phone" style="border:none;background:transparent;outline:none;width:100%" placeholder="10-digit number"/></div>
              </div>
            </div>
            <div class="form-row">
              <div>
                <label>Address</label>
                <div class="selectbox" style="border-radius:14px">
                  <textarea required name="address" rows="3" style="border:none;background:transparent;outline:none;width:100%;resize:vertical" placeholder="House no, street, area, city"></textarea>
                </div>
              </div>
            </div>
            <div class="form-row" style="grid-template-columns:1fr 1fr">
              <div>
                <label>Payment Method</label>
                <div class="selectbox">
                  <select name="pay">
                    <option>Cash on Delivery</option>
                    <option>UPI</option>
                    <option>Card</option>
                  </select>
                  <i class="ri-arrow-down-s-line" style="color:var(--muted)"></i>
                </div>
              </div>
              <div>
                <label>Delivery Time</label>
                <div class="selectbox">
                  <select name="time">
                    <option>ASAP (30–45 mins)</option>
                    <option>In 1 hour</option>
                    <option>In 2 hours</option>
                  </select>
                  <i class="ri-arrow-down-s-line" style="color:var(--muted)"></i>
                </div>
              </div>
            </div>
            <div style="height:8px"></div>
            <button class="btn btn--primary btn--full" type="submit"><i class="ri-secure-payment-line"></i>Place Order</button>
          </form>
        </div>

        <div class="panel" data-animate>
          <h3 style="margin:0 0 12px">Your order</h3>
          <div style="display:flex; flex-direction:column; gap:12px">
            ${items.map(it => `
              <div class="row-between" style="align-items:flex-start">
                <div>
                  <div style="font-weight:800">${escapeHtml(it.name)} <span style="color:var(--muted); font-weight:700">× ${it.qty}</span></div>
                  <div style="color:var(--muted); font-size:13px">${escapeHtml(categoryName(it.category))}</div>
                </div>
                <div style="font-weight:800">${fmtINR(it.price * it.qty)}</div>
              </div>
            `).join("")}
            <hr style="border:none;border-top:1px solid rgba(0,0,0,.08); margin:8px 0">
            <div class="row-between"><span style="font-weight:700">Subtotal</span><strong>${fmtINR(subtotal)}</strong></div>
            <div class="row-between"><span style="font-weight:700">CGST</span><strong>${fmtINR(cgst)}</strong></div>
            <div class="row-between"><span style="font-weight:700">IGST</span><strong>${fmtINR(igst)}</strong></div>
            <div class="row-between" style="font-size:18px"><span style="font-weight:900">Total</span><strong style="color:var(--accent)">${fmtINR(total)}</strong></div>
          </div>
        </div>
      </div>
    `;

    UI.initReveal();

    qs("#couponToggle")?.addEventListener("click", () => {
      const box = qs("#couponBox");
      const open = box.style.display !== "none";
      box.style.display = open ? "none" : "block";
    });
    qs("#applyCoupon")?.addEventListener("click", () => {
      const code = (qs("#couponInput")?.value || "").trim().toUpperCase();
      const msg = qs("#couponMsg");
      if (!msg) return;
      if (code === "RUHANIX10") msg.textContent = "Demo applied: 10% off (UI only). Integrate backend for real discounts.";
      else msg.textContent = "Invalid code (demo). Try RUHANIX10.";
    });

    qs("#orderForm")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const orderId = `RK${Date.now().toString().slice(-8)}`;
      Cart.clear();
      location.href = `order-success.html?order=${encodeURIComponent(orderId)}`;
    });
  }

  function initOrderSuccess(){
    const host = qs("#successHost");
    if (!host) return;
    const id = getParam("order") || "RK00000000";
    host.innerHTML = `
      <div class="panel" data-animate style="text-align:center">
        <div style="display:inline-grid; place-items:center; width:72px; height:72px; border-radius:999px; background:rgba(14,159,110,.12); margin:0 auto 12px">
          <i class="ri-checkbox-circle-line" style="font-size:34px; color:var(--success)"></i>
        </div>
        <h2 style="margin:0 0 6px">Order confirmed!</h2>
        <p style="margin:0; color:var(--muted)">Thanks for ordering from <strong>Ruhanix Kitchen</strong>. Your order number is:</p>
        <div style="margin:14px auto 0; display:inline-flex; gap:10px; align-items:center; padding:12px 14px; border-radius:999px; background:rgba(198,146,27,.10); border:1px solid rgba(0,0,0,.06); font-weight:900">
          <i class="ri-file-list-3-line"></i> ${escapeHtml(id)}
        </div>
        <div style="height:14px"></div>
        <p style="margin:0; color:var(--muted)">We’ll start preparing your meal right away.</p>
        <div style="height:16px"></div>
        <div class="btns" style="justify-content:center">
          <a class="btn btn--primary" href="menu.html"><i class="ri-restaurant-line"></i>Order more</a>
          <a class="btn" href="index.html"><i class="ri-home-5-line"></i>Back to home</a>
        </div>
      </div>
    `;
    UI.initReveal();
  }

  function initAwards(){
    const host = qs("#awardsGrid");
    if (!host) return;

    const awards = [
      { title: "Zomato Awards 2024", note: "Best Chinese food in Dehradun", img: "https://source.unsplash.com/700x700/?award,trophy" },
      { title: "Community Impact", note: "Recognized for social innovation", img: "https://source.unsplash.com/700x700/?community,team" },
      { title: "Top Rated Kitchen", note: "Customer favorite this season", img: "https://source.unsplash.com/700x700/?restaurant,kitchen" },
      { title: "Hygiene Excellence", note: "Consistent quality & safety", img: "https://source.unsplash.com/700x700/?chef,clean" }
    ];

    host.innerHTML = awards.map(a => `
      <article class="product" data-animate>
        <div class="product__img" style="height:200px">
          <img src="${a.img}" alt="${escapeHtml(a.title)}">
        </div>
        <div class="product__body">
          <h3 class="product__title">${escapeHtml(a.title)}</h3>
          <p style="margin:0; color:var(--muted); line-height:1.7">${escapeHtml(a.note)}</p>
        </div>
      </article>
    `).join("");

    UI.initReveal();
  }

  function initContact(){
    const form = qs("#contactForm");
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      Toast.show("Message sent", "We’ll get back to you soon. (Demo)");
      form.reset();
    });
  }

  // ---------- Boot ----------
  document.addEventListener("DOMContentLoaded", () => {
    Toast.init();
    UI.init();

    const page = document.body.getAttribute("data-page");
    if (page === "home") initHome();
    if (page === "menu") initMenu();
    if (page === "product") initProduct();
    if (page === "checkout") initCheckout();
    if (page === "order-success") initOrderSuccess();
    if (page === "awards") initAwards();
    if (page === "contact") initContact();
  });

})();
