function getSkuFromUrl(){
  const p = new URLSearchParams(location.search);
  return p.get("sku") || PRODUCTS[0].sku;
}

let selectedColor = null;
let selectedSize = null;
let activeImages = [];
let imgIndex = 0;

function setMain(src){
  const img = qs("#mainImg");
  img.src = src;
}

function renderThumbs(){
  const host = qs("#thumbs");
  host.innerHTML = activeImages.map((src,i)=>`
    <div class="thumb ${i===0?"is-active":""}" data-i="${i}">
      <img src="${src}" alt="thumb ${i+1}" loading="lazy">
    </div>
  `).join("");

  qsa(".thumb", host).forEach(t=>{
    t.addEventListener("click", ()=>{
      qsa(".thumb", host).forEach(x=>x.classList.remove("is-active"));
      t.classList.add("is-active");
      imgIndex = Number(t.dataset.i);
      setMain(activeImages[imgIndex]);
    });
  });
}

function setColor(colorObj){
  selectedColor = colorObj;
  qs("#colorLabel").textContent = `(${colorObj.name})`;
  activeImages = colorObj.images;
  imgIndex = 0;
  renderThumbs();
  setMain(activeImages[0]);
}

function renderProduct(){
  const sku = getSkuFromUrl();
  const product = findProduct(sku);

  qs("#pTitle").textContent = product.name;
  qs("#pMeta").textContent  = product.category;
  qs("#pNow").textContent   = INR(product.priceNow);
  qs("#pWas").textContent   = INR(product.priceWas);
  qs("#pOff").textContent   = `${product.off}% OFF`;
  qs("#badgeFloat").textContent = product.tag || "New";

  qs("#breadcrumb").innerHTML = `
    <a href="./index.html">HOME</a> &nbsp;›&nbsp;
    <a href="./index.html#new">NEW ARRIVALS</a> &nbsp;›&nbsp;
    <span>${product.name}</span>
  `;

  selectedColor = product.colors[0];
  selectedSize  = product.sizes[0];

  // Swatches
  const sw = qs("#colorSwatches");
  sw.innerHTML = product.colors.map((c,i)=>`
    <button class="swatch ${i===0?"is-active":""}" data-color="${c.name}" type="button" aria-label="${c.name}">
      <img src="${c.thumb}" alt="${c.name}" loading="lazy">
    </button>
  `).join("");
  qsa(".swatch", sw).forEach(btn=>{
    btn.addEventListener("click", ()=>{
      qsa(".swatch", sw).forEach(x=>x.classList.remove("is-active"));
      btn.classList.add("is-active");
      const c = product.colors.find(x=>x.name===btn.dataset.color);
      setColor(c);
    });
  });

  // Sizes
  const sz = qs("#sizes");
  sz.innerHTML = product.sizes.map((s,i)=>`
    <button class="size ${i===0?"is-active":""}" data-size="${s}" type="button">${s}</button>
  `).join("");
  qsa(".size", sz).forEach(btn=>{
    btn.addEventListener("click", ()=>{
      qsa(".size", sz).forEach(x=>x.classList.remove("is-active"));
      btn.classList.add("is-active");
      selectedSize = btn.dataset.size;
    });
  });

  setColor(selectedColor);

  // Actions
  qs("#addToCart").addEventListener("click", ()=>{
    addToCart({ sku: product.sku, color: selectedColor.name, size: selectedSize, qty:1 });
    refreshCartBadge();
    toast("Added to cart");
  });

  qs("#buyNow").addEventListener("click", ()=>{
    addToCart({ sku: product.sku, color: selectedColor.name, size: selectedSize, qty:1 });
    location.href = "./cart.html";
  });

  qs("#wishBtn").addEventListener("click", ()=>{
    qs("#wishBtn").textContent = (qs("#wishBtn").textContent === "♡") ? "♥" : "♡";
    toast("Wishlist (demo)");
  });

  qs("#checkPin").addEventListener("click", ()=>{
    const pin = (qs("#pincode").value || "").trim();
    const msg = qs("#pinMsg");
    if(!/^\d{6}$/.test(pin)){
      msg.style.color = "#b91c1c";
      msg.textContent = "Enter a valid 6-digit pincode.";
      return;
    }
    msg.style.color = "#166534";
    msg.textContent = `Delivery available to ${pin}. ETA 3-5 days.`;
  });
}

document.addEventListener("DOMContentLoaded", renderProduct);
