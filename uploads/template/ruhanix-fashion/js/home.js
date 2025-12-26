document.addEventListener("DOMContentLoaded", ()=>{
  // Hero BG
  const heroBg = qs("#heroBg");
  if(heroBg) heroBg.style.backgroundImage = `url('${IMG.hero}')`;

  // Footer email
  const email = qs("#supportEmail");
  if(email) email.textContent = (window.SITE_CONFIG?.supportEmail || "support@ruhanixfashions.com");

  // Categories
  const catHost = qs("#categoryGrid");
  if(catHost){
    catHost.innerHTML = CATEGORIES.map(c => `
      <a class="cat" href="${c.href}" aria-label="${c.title}">
        <img src="${c.img}" alt="${c.title}" loading="lazy">
        <div class="cat__label">${c.title}</div>
      </a>
    `).join("");
  }

  // Products
  const pHost = qs("#productGrid");
  if(pHost){
    pHost.innerHTML = PRODUCTS.map(p => {
      const img = p.colors[0]?.thumb;
      return `
        <article class="card">
          <a href="./product.html?sku=${encodeURIComponent(p.sku)}" aria-label="${p.name}">
            <div class="card__media">
              <img src="${img}" alt="${p.name}" loading="lazy">
              <div class="tag">${p.tag}</div>
              <div class="heart" aria-hidden="true">♡</div>
            </div>
          </a>
          <div class="card__body">
            <div class="card__title">${p.name}</div>
            <p class="card__meta">${p.category}</p>
            <div class="price">
              <div class="price__now">${INR(p.priceNow)}</div>
              <div class="price__was">${INR(p.priceWas)}</div>
              <div class="price__off">(${p.off}% off)</div>
            </div>
            <div style="margin-top:12px; display:flex; gap:10px; flex-wrap:wrap">
              <a class="btn btn--ghost" href="./product.html?sku=${encodeURIComponent(p.sku)}">View</a>
              <button class="btn btn--primary" data-quickadd="${p.sku}">Quick Add</button>
            </div>
          </div>
        </article>
      `;
    }).join("");

    qsa("[data-quickadd]").forEach(btn=>{
      btn.addEventListener("click", ()=>{
        const sku = btn.dataset.quickadd;
        const pr = findProduct(sku);
        const color = pr.colors[0].name;
        const size  = pr.sizes[0];
        addToCart({ sku, color, size, qty: 1 });
        refreshCartBadge();
        toast("Added to cart");
      });
    });
  }
});
