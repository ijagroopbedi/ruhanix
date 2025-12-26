/* =========================================================
   Minimal Apple-style Fashion Frontend (Vanilla JS)
   - Multi-page: index/shop/product/cart/auth
   - Cart + user stored in localStorage
   - Data-driven (easy to convert into JSON editing later)
========================================================= */

const KEYS = {
  CART: "RC_FASHION_CART_V1",
  USER: "RC_FASHION_USER_V1"
};

const STORE = {
  brand: { name: "Crème Studio", tagline: "Minimal fashion, clean fits" },
  nav: [
    { label: "Home", href: "index.html" },
    { label: "Shop", href: "shop.html" },
    { label: "Cart", href: "cart.html" },
    { label: "Account", href: "auth.html" }
  ],
  footerLinks: [
    { label: "Shipping", href: "#" },
    { label: "Returns", href: "#" },
    { label: "Contact", href: "#" },
    { label: "Instagram", href: "#" }
  ],
  categories: ["New", "Essentials", "Dresses", "Outerwear", "Work", "Sets"],
  currency: "INR"
};

const PRODUCTS = makeProducts();

/* ===================== Init ===================== */
document.addEventListener("DOMContentLoaded", () => {
  renderHeader();
  renderFooter();
  setupDrawer();
  setupModal();

  // Page boot
  const page = document.body.getAttribute("data-page") || "";
  if (page === "home") initHome();
  if (page === "shop") initShop();
  if (page === "product") initProduct();
  if (page === "cart") initCart();
  if (page === "auth") initAuth();

  updateCartBadge();
});

/* ===================== Header/Footer ===================== */
function renderHeader(){
  const host = document.getElementById("rc-header");
  if(!host) return;

  const user = getUser();
  const accountLabel = user ? `Hi, ${safeText(user.name || "User")}` : "Sign in";

  host.innerHTML = `
    <header class="rc-top">
      <div class="wrap">
        <div class="row">
          <a class="brand" href="index.html" aria-label="Home">
            <div class="mark" aria-hidden="true"></div>
            <div>
              <b>${safeText(STORE.brand.name)}</b>
              <span>${safeText(STORE.brand.tagline)}</span>
            </div>
          </a>

          <nav class="nav" aria-label="Primary">
            ${STORE.nav.map(n => `<a href="${n.href}">${safeText(n.label)}</a>`).join("")}
          </nav>

          <div class="actions">
            <a class="btn" href="shop.html" title="Browse">
              Browse
            </a>

            <a class="btn" href="cart.html" title="Cart">
              Cart <span class="badge" id="cartBadge">0</span>
            </a>

            <a class="btn primary" href="auth.html" title="Account">
              ${accountLabel}
            </a>

            <button class="burger" id="burger" type="button" aria-label="Open menu">
              <span></span><span></span><span></span>
            </button>
          </div>
        </div>
      </div>
    </header>

    <div class="drawer" id="drawer" aria-hidden="true">
      <div class="panel" role="dialog" aria-modal="true" aria-label="Menu">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;padding:6px 6px 10px;">
          <div class="brand" style="min-width:auto;">
            <div class="mark" aria-hidden="true"></div>
            <div>
              <b>${safeText(STORE.brand.name)}</b>
              <span>${safeText(STORE.brand.tagline)}</span>
            </div>
          </div>
          <button class="iconBtn" id="drawerClose" type="button" aria-label="Close">✕</button>
        </div>

        <div id="drawerLinks">
          ${STORE.nav.map(n => `
            <a href="${n.href}">
              <span>${safeText(n.label)}</span>
              <span style="opacity:.5;">›</span>
            </a>
          `).join("")}
        </div>

        <div class="row2">
          <a class="btn" href="shop.html">Shop</a>
          <a class="btn red" href="shop.html?cat=New">New Drop</a>
        </div>
      </div>
    </div>
  `;
}

function renderFooter(){
  const host = document.getElementById("rc-footer");
  if(!host) return;

  host.innerHTML = `
    <footer class="rc-foot">
      <div class="wrap">
        <div class="footRow">
          <div>© ${new Date().getFullYear()} ${safeText(STORE.brand.name)} • Frontend demo for Ruhanix-style JSON editing</div>
          <div class="footLinks">
            ${STORE.footerLinks.map(l => `<a href="${l.href}">${safeText(l.label)}</a>`).join("")}
          </div>
        </div>
      </div>
    </footer>
  `;
}

function setupDrawer(){
  const burger = document.getElementById("burger");
  const drawer = document.getElementById("drawer");
  const close = document.getElementById("drawerClose");

  burger?.addEventListener("click", () => {
    const open = document.body.classList.toggle("menu-open");
    drawer?.setAttribute("aria-hidden", open ? "false" : "true");
  });

  close?.addEventListener("click", () => {
    document.body.classList.remove("menu-open");
    drawer?.setAttribute("aria-hidden", "true");
  });

  drawer?.addEventListener("click", (e) => {
    if(e.target === drawer){
      document.body.classList.remove("menu-open");
      drawer.setAttribute("aria-hidden", "true");
    }
  });

  window.addEventListener("keydown", (e) => {
    if(e.key === "Escape"){
      document.body.classList.remove("menu-open");
      drawer?.setAttribute("aria-hidden", "true");
      closeModal();
    }
  });
}

/* ===================== Modal (Quick View) ===================== */
function setupModal(){
  const modal = document.getElementById("modal");
  const close = document.getElementById("modalClose");
  close?.addEventListener("click", closeModal);
  modal?.addEventListener("click", (e)=>{ if(e.target === modal) closeModal(); });
}
function openModal(payload){
  const modal = document.getElementById("modal");
  if(!modal) return;

  modal.classList.add("open");
  modal.setAttribute("aria-hidden","false");
  document.body.style.overflow = "hidden";

  $("#modalTitle").textContent = payload.title || "Quick view";
  $("#modalH").textContent = payload.h || "";
  $("#modalP").textContent = payload.p || "";
  $("#modalImg").src = payload.img || "";
  $("#modalImg").alt = payload.title || "Preview";
  $("#modalChips").innerHTML = (payload.chips || []).map(c => `<span class="chip" style="cursor:default;">${safeText(c)}</span>`).join("");

  const primary = $("#modalPrimary");
  const secondary = $("#modalSecondary");
  primary.textContent = payload.primaryText || "Add to cart";
  secondary.textContent = payload.secondaryText || "View product";

  primary.onclick = payload.onPrimary || (() => {});
  secondary.onclick = payload.onSecondary || (() => {});
}
function closeModal(){
  const modal = document.getElementById("modal");
  if(!modal || !modal.classList.contains("open")) return;
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden","true");
  document.body.style.overflow = "";
}

/* ===================== Pages ===================== */
function initHome(){
  // Featured products
  const host = document.getElementById("featuredGrid");
  if(host){
    const featured = PRODUCTS.slice(0, 4);
    host.innerHTML = featured.map(p => productCardHTML(p)).join("");
    bindProductCardActions(host);
  }

  // Category cards (simple)
  const cats = document.getElementById("homeCats");
  if(cats){
    cats.innerHTML = STORE.categories.slice(0,6).map(cat => `
      <a class="card pad" href="shop.html?cat=${encodeURIComponent(cat)}" style="display:flex;align-items:center;justify-content:space-between;gap:10px;">
        <div>
          <div class="pill"><span class="dot"></span><span>${safeText(cat)}</span></div>
          <div class="small" style="margin-top:8px;">Tap to filter shop</div>
        </div>
        <div class="btn ghost" style="border-color:transparent;">→</div>
      </a>
    `).join("");
  }
}

function initShop(){
  const grid = document.getElementById("shopGrid");
  const qInput = document.getElementById("q");
  const sort = document.getElementById("sort");
  const chipHost = document.getElementById("catChips");

  const params = new URLSearchParams(location.search);
  let state = {
    cat: params.get("cat") || "All",
    q: params.get("q") || "",
    sort: params.get("sort") || "featured"
  };

  if(qInput) qInput.value = state.q;
  if(sort) sort.value = state.sort;

  // Render category chips
  if(chipHost){
    const cats = ["All", ...STORE.categories];
    chipHost.innerHTML = cats.map(c => `
      <button class="chip ${c === state.cat ? "active" : ""}" type="button" data-cat="${safeAttr(c)}">${safeText(c)}</button>
    `).join("");

    chipHost.querySelectorAll("[data-cat]").forEach(btn => {
      btn.addEventListener("click", () => {
        state.cat = btn.getAttribute("data-cat") || "All";
        updateShopURL(state);
        renderShop();
      });
    });
  }

  qInput?.addEventListener("input", () => {
    state.q = qInput.value.trim();
    updateShopURL(state);
    renderShop();
  });

  sort?.addEventListener("change", () => {
    state.sort = sort.value;
    updateShopURL(state);
    renderShop();
  });

  function renderShop(){
    // set active chip
    chipHost?.querySelectorAll(".chip").forEach(ch => {
      ch.classList.toggle("active", (ch.getAttribute("data-cat") || "") === state.cat);
    });

    const list = filterProducts(PRODUCTS, state);
    if(!grid) return;

    grid.innerHTML = list.length
      ? list.map(p => productCardHTML(p)).join("")
      : `<div class="card pad"><b>No results</b><p class="p" style="margin-top:6px;">Try a different search or category.</p></div>`;

    bindProductCardActions(grid);
  }

  renderShop();
}

function initProduct(){
  const host = document.getElementById("productView");
  if(!host) return;

  const params = new URLSearchParams(location.search);
  const id = params.get("id");
  const p = PRODUCTS.find(x => x.id === id);

  if(!p){
    host.innerHTML = `
      <div class="card pad">
        <b>Product not found</b>
        <p class="p" style="margin-top:6px;">Go back to <a href="shop.html" style="text-decoration:underline;">Shop</a>.</p>
      </div>
    `;
    return;
  }

  host.innerHTML = `
    <div class="grid-2">
      <div class="card" style="overflow:hidden;">
        <div class="pthumb" style="aspect-ratio: 1/1;">
          <img src="${p.image}" alt="${safeAttr(p.name)}">
          <div class="priceTag">${formatMoney(p.price)}</div>
        </div>
      </div>

      <div class="card pad">
        <div class="pill"><span class="dot"></span><span>${safeText(p.category)}</span></div>
        <h1 class="h2" style="margin-top:12px;font-size:22px;">${safeText(p.name)}</h1>
        <p class="p" style="margin-top:6px;">${safeText(p.desc)}</p>

        <div style="margin-top:12px;" class="chips">
          ${p.tags.map(t => `<span class="chip" style="cursor:default;">${safeText(t)}</span>`).join("")}
        </div>

        <hr class="sep">

        <div class="grid-2">
          <div>
            <label class="small">Size</label>
            <select class="select" id="size">
              <option>S</option><option>M</option><option>L</option><option>XL</option>
            </select>
          </div>
          <div>
            <label class="small">Qty</label>
            <input class="input" id="qty" type="number" min="1" value="1">
          </div>
        </div>

        <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:12px;">
          <button class="btn primary" id="addToCart">Add to cart</button>
          <a class="btn" href="shop.html">Back to shop</a>
        </div>

        <p class="small" style="margin-top:10px;">This is frontend-only. Hook your backend checkout later.</p>
      </div>
    </div>

    <div class="section">
      <div style="display:flex;align-items:flex-end;justify-content:space-between;gap:12px;margin-bottom:12px;">
        <div>
          <h2 class="h2">Related</h2>
          <p class="p">Same vibe, minimal picks.</p>
        </div>
      </div>
      <div class="grid-4" id="relatedGrid"></div>
    </div>
  `;

  $("#addToCart").addEventListener("click", () => {
    const qty = Math.max(1, parseInt($("#qty").value || "1", 10));
    addToCart(p.id, qty);
    toast("Added to cart");
    updateCartBadge();
  });

  // Related
  const related = PRODUCTS
    .filter(x => x.category === p.category && x.id !== p.id)
    .slice(0, 4);

  const relatedGrid = $("#relatedGrid");
  relatedGrid.innerHTML = related.map(x => productCardHTML(x)).join("");
  bindProductCardActions(relatedGrid);
}

function initCart(){
  const host = document.getElementById("cartView");
  if(!host) return;

  function render(){
    const cart = getCart();
    const entries = Object.entries(cart.items);
    if(entries.length === 0){
      host.innerHTML = `
        <div class="card pad">
          <b>Your cart is empty</b>
          <p class="p" style="margin-top:6px;">Go to <a href="shop.html" style="text-decoration:underline;">Shop</a> and add something clean.</p>
        </div>
      `;
      updateCartBadge();
      return;
    }

    const lines = entries.map(([id, qty]) => {
      const p = PRODUCTS.find(x => x.id === id);
      if(!p) return "";
      return `
        <div class="cartRow">
          <img src="${p.image}" alt="${safeAttr(p.name)}">
          <div class="meta">
            <b>${safeText(p.name)}</b>
            <div class="small">${safeText(p.category)} • ${formatMoney(p.price)}</div>
            <div class="small" style="margin-top:6px;">
              <a href="product.html?id=${encodeURIComponent(p.id)}" style="text-decoration:underline;">View product</a>
            </div>
          </div>

          <div style="display:flex;flex-direction:column;align-items:flex-end;gap:10px;">
            <div class="qty">
              <button type="button" data-dec="${p.id}">−</button>
              <input class="input" style="padding:10px 10px;" type="number" min="1" value="${qty}" data-qty="${p.id}">
              <button type="button" data-inc="${p.id}">+</button>
            </div>
            <button class="btn" type="button" data-remove="${p.id}">Remove</button>
          </div>
        </div>
      `;
    }).join("");

    const subtotal = cartSubtotal();
    const shipping = subtotal >= 2499 ? 0 : 149;
    const total = subtotal + shipping;

    host.innerHTML = `
      <div class="grid-2">
        <div class="card pad">
          <h2 class="h2">Cart</h2>
          <p class="p" style="margin-top:6px;">Update quantities, then checkout (demo).</p>
          <div style="display:flex;flex-direction:column;gap:12px;margin-top:12px;">
            ${lines}
          </div>
        </div>

        <div class="card pad">
          <h2 class="h2">Checkout (Demo)</h2>
          <p class="p" style="margin-top:6px;">Frontend only — clears cart on success.</p>

          <hr class="sep">

          <div style="display:flex;justify-content:space-between;gap:12px;">
            <span class="small">Subtotal</span>
            <b>${formatMoney(subtotal)}</b>
          </div>
          <div style="display:flex;justify-content:space-between;gap:12px;margin-top:8px;">
            <span class="small">Shipping</span>
            <b>${shipping === 0 ? "Free" : formatMoney(shipping)}</b>
          </div>

          <hr class="sep">

          <div style="display:flex;justify-content:space-between;gap:12px;">
            <span class="small">Total</span>
            <b>${formatMoney(total)}</b>
          </div>

          <div class="grid-2" style="margin-top:14px;">
            <div>
              <label class="small">Name</label>
              <input class="input" id="coName" placeholder="Full name">
            </div>
            <div>
              <label class="small">Phone</label>
              <input class="input" id="coPhone" placeholder="10-digit phone">
            </div>
          </div>

          <div style="margin-top:12px;">
            <label class="small">Address</label>
            <input class="input" id="coAddr" placeholder="House, street, city">
          </div>

          <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:14px;">
            <button class="btn primary" id="placeOrder">Place order</button>
            <a class="btn" href="shop.html">Continue shopping</a>
          </div>

          <p class="small" style="margin-top:10px;">Free shipping over ₹2,499 (demo rule).</p>
        </div>
      </div>
    `;

    // Bind qty buttons
    host.querySelectorAll("[data-inc]").forEach(b=>{
      b.addEventListener("click", ()=>{ changeQty(b.getAttribute("data-inc"), +1); });
    });
    host.querySelectorAll("[data-dec]").forEach(b=>{
      b.addEventListener("click", ()=>{ changeQty(b.getAttribute("data-dec"), -1); });
    });
    host.querySelectorAll("[data-remove]").forEach(b=>{
      b.addEventListener("click", ()=>{ removeFromCart(b.getAttribute("data-remove")); toast("Removed"); render(); });
    });
    host.querySelectorAll("[data-qty]").forEach(inp=>{
      inp.addEventListener("change", ()=>{
        const id = inp.getAttribute("data-qty");
        const val = Math.max(1, parseInt(inp.value || "1", 10));
        setQty(id, val);
        render();
      });
    });

    $("#placeOrder").addEventListener("click", () => {
      const name = ($("#coName").value || "").trim();
      const phone = ($("#coPhone").value || "").trim();
      const addr = ($("#coAddr").value || "").trim();
      if(!name || phone.length < 10 || !addr){
        toast("Fill name, phone, and address");
        return;
      }
      setCart({ items:{} });
      updateCartBadge();
      host.innerHTML = `
        <div class="card pad">
          <div class="pill"><span class="dot"></span><span>Order placed</span></div>
          <h2 class="h2" style="margin-top:12px;">Success ✅</h2>
          <p class="p" style="margin-top:6px;">This is a demo checkout. Cart cleared.</p>
          <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:14px;">
            <a class="btn primary" href="shop.html">Shop more</a>
            <a class="btn" href="index.html">Back home</a>
          </div>
        </div>
      `;
    });

    updateCartBadge();
  }

  function changeQty(id, delta){
    if(!id) return;
    const cart = getCart();
    const cur = cart.items[id] || 1;
    const next = Math.max(1, cur + delta);
    cart.items[id] = next;
    setCart(cart);
    render();
  }

  render();
}

function initAuth(){
  const host = document.getElementById("authView");
  if(!host) return;

  const user = getUser();

  host.innerHTML = `
    <div class="grid-2">
      <div class="card pad">
        <div class="pill"><span class="dot"></span><span>Account</span></div>
        <h2 class="h2" style="margin-top:12px;">Sign in / Sign up (Demo)</h2>
        <p class="p" style="margin-top:6px;">Stores a fake user in localStorage so you can see how auth flows work.</p>

        <hr class="sep">

        <div class="grid-2">
          <div>
            <label class="small">Name</label>
            <input class="input" id="aName" placeholder="Your name" value="${user ? safeAttr(user.name||"") : ""}">
          </div>
          <div>
            <label class="small">Email</label>
            <input class="input" id="aEmail" placeholder="you@email.com" value="${user ? safeAttr(user.email||"") : ""}">
          </div>
        </div>

        <div style="margin-top:12px;">
          <label class="small">Password</label>
          <input class="input" id="aPass" type="password" placeholder="••••••••">
        </div>

        <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:14px;">
          <button class="btn primary" id="saveUser">${user ? "Update" : "Sign in"}</button>
          <button class="btn" id="logout" ${user ? "" : "disabled"}>Log out</button>
        </div>

        <p class="small" style="margin-top:10px;">Replace this with real API auth later.</p>
      </div>

      <div class="card pad">
        <h2 class="h2">How it works (Frontend)</h2>
        <p class="p" style="margin-top:6px;">
          • Auth stored as JSON in localStorage<br>
          • Header updates to show “Hi, Name”<br>
          • Cart persists across pages<br>
          • Product page uses ?id=...<br>
          • Shop supports search + filter + sort
        </p>

        <hr class="sep">

        <button class="btn red" id="goShop">Go to Shop</button>
      </div>
    </div>
  `;

  $("#saveUser").addEventListener("click", () => {
    const name = ($("#aName").value || "").trim();
    const email = ($("#aEmail").value || "").trim();
    const pass = ($("#aPass").value || "").trim();
    if(!name || !email.includes("@") || pass.length < 4){
      toast("Enter name, valid email, and 4+ char password");
      return;
    }
    setUser({ name, email });
    toast("Signed in (demo)");
    renderHeader();
    updateCartBadge();
    initAuth(); // re-render
  });

  $("#logout").addEventListener("click", () => {
    setUser(null);
    toast("Logged out");
    renderHeader();
    updateCartBadge();
    initAuth();
  });

  $("#goShop").addEventListener("click", ()=> location.href = "shop.html");
}

/* ===================== Cards / Bindings ===================== */
function productCardHTML(p){
  return `
    <article class="pcard" aria-label="${safeAttr(p.name)}">
      <a class="pthumb" href="product.html?id=${encodeURIComponent(p.id)}" aria-label="Open ${safeAttr(p.name)}">
        <img src="${p.image}" alt="${safeAttr(p.name)}">
        <div class="priceTag">${formatMoney(p.price)}</div>
      </a>
      <div class="pinfo">
        <b>${safeText(p.name)}</b>
        <p>${safeText(p.short)}</p>
        <div class="row">
          <button class="btn" type="button" data-quick="${safeAttr(p.id)}">Quick view</button>
          <button class="btn primary" type="button" data-add="${safeAttr(p.id)}">Add</button>
        </div>
      </div>
    </article>
  `;
}

function bindProductCardActions(container){
  container.querySelectorAll("[data-add]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const id = btn.getAttribute("data-add");
      addToCart(id, 1);
      updateCartBadge();
      toast("Added to cart");
    });
  });

  container.querySelectorAll("[data-quick]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const id = btn.getAttribute("data-quick");
      const p = PRODUCTS.find(x => x.id === id);
      if(!p) return;

      openModal({
        title: p.name,
        h: `${p.name} • ${formatMoney(p.price)}`,
        p: p.desc,
        img: p.image,
        chips: [p.category, ...p.tags.slice(0,2)],
        primaryText: "Add to cart",
        secondaryText: "View product",
        onPrimary: ()=>{ addToCart(p.id, 1); updateCartBadge(); toast("Added to cart"); closeModal(); },
        onSecondary: ()=>{ location.href = `product.html?id=${encodeURIComponent(p.id)}`; }
      });
    });
  });
}

/* ===================== Filters ===================== */
function filterProducts(list, state){
  let out = [...list];

  if(state.cat && state.cat !== "All"){
    out = out.filter(p => p.category === state.cat);
  }
  if(state.q){
    const q = state.q.toLowerCase();
    out = out.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.desc.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  }

  if(state.sort === "priceAsc") out.sort((a,b)=>a.price-b.price);
  if(state.sort === "priceDesc") out.sort((a,b)=>b.price-a.price);
  if(state.sort === "name") out.sort((a,b)=>a.name.localeCompare(b.name));
  // featured = default ordering
  return out;
}

function updateShopURL(state){
  const p = new URLSearchParams();
  if(state.cat && state.cat !== "All") p.set("cat", state.cat);
  if(state.q) p.set("q", state.q);
  if(state.sort && state.sort !== "featured") p.set("sort", state.sort);
  const qs = p.toString();
  history.replaceState({}, "", qs ? `shop.html?${qs}` : "shop.html");
}

/* ===================== Cart ===================== */
function getCart(){
  try{
    return JSON.parse(localStorage.getItem(KEYS.CART)) || { items:{} };
  }catch{ return { items:{} }; }
}
function setCart(cart){
  localStorage.setItem(KEYS.CART, JSON.stringify(cart));
}
function addToCart(id, qty=1){
  if(!id) return;
  const cart = getCart();
  cart.items[id] = (cart.items[id] || 0) + qty;
  setCart(cart);
}
function removeFromCart(id){
  const cart = getCart();
  delete cart.items[id];
  setCart(cart);
}
function setQty(id, qty){
  const cart = getCart();
  cart.items[id] = Math.max(1, qty);
  setCart(cart);
}
function cartCount(){
  const cart = getCart();
  return Object.values(cart.items).reduce((a,b)=>a + (Number(b)||0), 0);
}
function cartSubtotal(){
  const cart = getCart();
  let sum = 0;
  for(const [id, qty] of Object.entries(cart.items)){
    const p = PRODUCTS.find(x => x.id === id);
    if(p) sum += p.price * (Number(qty)||0);
  }
  return sum;
}
function updateCartBadge(){
  const badge = document.getElementById("cartBadge");
  if(badge) badge.textContent = String(cartCount());
}

/* ===================== User (Demo Auth) ===================== */
function getUser(){
  try{
    return JSON.parse(localStorage.getItem(KEYS.USER)) || null;
  }catch{ return null; }
}
function setUser(user){
  if(!user) localStorage.removeItem(KEYS.USER);
  else localStorage.setItem(KEYS.USER, JSON.stringify(user));
}

/* ===================== Helpers ===================== */
function $(sel){ return document.querySelector(sel); }

function toast(msg){
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(()=> t.classList.add("fade"), 1300);
  setTimeout(()=> t.remove(), 1700);
}

function formatMoney(amount){
  try{
    return new Intl.NumberFormat("en-IN", {
      style:"currency",
      currency: STORE.currency,
      maximumFractionDigits: 0
    }).format(amount);
  }catch{
    return "₹" + String(Math.round(amount));
  }
}

function safeText(s){
  return String(s ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}
function safeAttr(s){ return safeText(s).replaceAll("\n"," "); }

/* ===================== Data / Images ===================== */
function makeProducts(){
  const base = [
    { id:"p1", name:"Rouge Knit Top", category:"Essentials", price:1799, tags:["Soft knit","New"], short:"Clean neck, easy layer.", desc:"Soft knit with a minimal neckline. Looks premium with cream trousers or denim." },
    { id:"p2", name:"Crème Wide Pants", category:"Work", price:2299, tags:["Drape fit","Best"], short:"High-rise, relaxed drape.", desc:"High-rise wide leg with a studio-grade drape. Easy to dress up or down." },
    { id:"p3", name:"Minimal Red Dress", category:"Dresses", price:2899, tags:["Evening","Hot"], short:"No-fuss silhouette.", desc:"Minimal silhouette with maximum impact. Designed to look expensive in photos." },
    { id:"p4", name:"Cream Overshirt", category:"Outerwear", price:2499, tags:["Layer","Studio"], short:"Structured, comfy.", desc:"Structured overshirt that works as a light jacket. Clean lines, soft finish." },
    { id:"p5", name:"Red Mini Tote", category:"Sets", price:1399, tags:["Accessory","Gift"], short:"Small, bold, clean.", desc:"Minimal mini tote in signature red. Adds a sharp accent to neutral fits." },
    { id:"p6", name:"Cream Polo Tee", category:"Essentials", price:1299, tags:["Everyday","Soft"], short:"Classic, modern fit.", desc:"A clean polo tee with a modern fit. Breathable, soft, and easy to style." },
    { id:"p7", name:"Studio Blazer", category:"Work", price:3499, tags:["Sharp","Premium"], short:"Tailored minimal.", desc:"Tailored minimal blazer — sharp shoulders, clean front, premium finish." },
    { id:"p8", name:"Red Set Co-ord", category:"Sets", price:3299, tags:["Set","Trending"], short:"Matching set, no effort.", desc:"Co-ord set that looks styled instantly. Wear together or split into separates." },
    { id:"p9", name:"Cream Midi Skirt", category:"Work", price:1899, tags:["Flow","Minimal"], short:"Clean midi line.", desc:"Minimal midi skirt with an elegant line. Works with tees or blazers." },
    { id:"p10", name:"Red Scarf", category:"New", price:799, tags:["Accent","Light"], short:"Instant pop.", desc:"Light scarf in signature red — the easiest way to add contrast to cream fits." }
  ];

  return base.map((p, i) => ({
    ...p,
    image: placeholderSVG(`${p.name}`, `${p.category}`, i)
  }));
}

function placeholderSVG(title, subtitle, seed=0){
  const w = 1200, h = 900;
  const a = 0.06 + (seed % 3) * 0.02;
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#ffffff"/>
        <stop offset="1" stop-color="#fbfbfc"/>
      </linearGradient>
      <radialGradient id="r1" cx="25%" cy="30%" r="65%">
        <stop offset="0" stop-color="#d12a2f" stop-opacity="${a}"/>
        <stop offset="1" stop-color="#d12a2f" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="r2" cx="78%" cy="72%" r="65%">
        <stop offset="0" stop-color="#d12a2f" stop-opacity="${a*0.7}"/>
        <stop offset="1" stop-color="#d12a2f" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
    <rect width="100%" height="100%" fill="url(#r1)"/>
    <rect width="100%" height="100%" fill="url(#r2)"/>
    <rect x="70" y="70" width="${w-140}" height="${h-140}" rx="42" fill="none" stroke="#101114" stroke-opacity=".10"/>
    <text x="110" y="240" font-family="ui-sans-serif, system-ui, -apple-system" font-size="72" fill="#101114" fill-opacity=".88" font-weight="700">${escapeXML(title)}</text>
    <text x="110" y="310" font-family="ui-sans-serif, system-ui, -apple-system" font-size="32" fill="#101114" fill-opacity=".50">${escapeXML(subtitle)}</text>
    <text x="110" y="${h-120}" font-family="ui-sans-serif, system-ui, -apple-system" font-size="24" fill="#101114" fill-opacity=".40">Replace with real product image later</text>
  </svg>`;
  return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg.trim());
}
function escapeXML(s){
  return String(s ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&apos;");
}
