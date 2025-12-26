const qs = (s, r=document) => r.querySelector(s);
const qsa = (s, r=document) => [...r.querySelectorAll(s)];
const INR = (n) => `${(window.SITE_CONFIG?.currencySymbol || "₹")}${Number(n).toLocaleString("en-IN")}`;

function toast(msg){
  const el = qs("#toast");
  if(!el) return;
  el.textContent = msg;
  el.classList.add("is-show");
  clearTimeout(toast._t);
  toast._t = setTimeout(()=> el.classList.remove("is-show"), 2200);
}

function injectBrand(){
  const cfg = window.SITE_CONFIG || {};
  qsa("[data-brand='name']").forEach(el => el.textContent = cfg.brandName || "Ruhanix Fashions");
  qsa("[data-brand='short']").forEach(el => el.textContent = cfg.brandShort || "RUHANIX");
  qsa("[data-brand='tagline']").forEach(el => el.textContent = cfg.tagline || "Wear what you choose.");

  // Optional: update title if placeholder exists
  const t = document.title;
  if(t.includes("{brand}")) document.title = t.replaceAll("{brand}", cfg.brandName || "Ruhanix Fashions");
}

function refreshCartBadge(){
  const badge = qs("#cartBadge");
  if(badge) badge.textContent = String(cartCount());
}

function setupDrawer(){
  const drawer  = qs("#mobileDrawer");
  const burger  = qs("#burgerBtn");
  const close   = qs("#drawerClose");
  const overlay = qs("#drawerOverlay");
  if(!drawer || !burger || !close || !overlay) return;

  const open = () => {
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden","false");
    burger.setAttribute("aria-expanded","true");
    document.body.classList.add("drawer-open");     // ✅ hides burger
    document.body.style.overflow = "hidden";
  };
  const shut = () => {
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden","true");
    burger.setAttribute("aria-expanded","false");
    document.body.classList.remove("drawer-open");
    document.body.style.overflow = "";
  };

  burger.addEventListener("click", open);
  close.addEventListener("click", shut);
  overlay.addEventListener("click", shut);
  document.addEventListener("keydown", (e)=>{ if(e.key==="Escape") shut(); });
  qsa(".drawer__nav a").forEach(a=>a.addEventListener("click", shut));
}

document.addEventListener("DOMContentLoaded", ()=>{
  injectBrand();
  setupDrawer();
  refreshCartBadge();

  const year = qs("#year");
  if(year) year.textContent = String(new Date().getFullYear());
});
