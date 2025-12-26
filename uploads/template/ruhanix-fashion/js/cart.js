function computeTotals(cart){
  let mrp = 0, total = 0, items = 0;
  cart.lines.forEach(line=>{
    const p = findProduct(line.sku);
    items += line.qty;
    mrp += (p.priceWas * line.qty);
    total += (p.priceNow * line.qty);
  });
  const discount = mrp - total;
  const shipping = total >= 999 || total === 0 ? 0 : 49;
  return { items, mrp, discount, shipping, totalWithShip: total + shipping };
}

function renderCart(){
  const host = qs("#cartItems");
  const cart = getCart();

  const email = qs("#supportEmail2");
  if(email) email.textContent = (window.SITE_CONFIG?.supportEmail || "support@ruhanixfashions.com");

  if(cart.lines.length === 0){
    host.innerHTML = `
      <div class="panel">
        <div style="font-weight:900">Your cart is empty</div>
        <p style="margin:10px 0 0; color:#666; font-weight:800">Add items from New Arrivals.</p>
        <div style="margin-top:12px">
          <a class="btn btn--primary" href="./index.html#new">Shop New Arrivals</a>
        </div>
      </div>
    `;
    qs("#itemsCount").textContent = "0";
    qs("#priceDetails").innerHTML = "";
    qs("#totalAmount").textContent = INR(0);
    return;
  }

  host.innerHTML = cart.lines.map(line=>{
    const p = findProduct(line.sku);
    const color = line.color;
    const size  = line.size;
    const img = (p.colors.find(c=>c.name===color)?.thumb) || p.colors[0].thumb;

    return `
      <article class="cart-item">
        <img src="${img}" alt="${p.name}" loading="lazy">
        <div>
          <div class="cart-item__title">${p.name}</div>
          <div class="cart-item__sub">${p.category} • Color: <b>${color}</b> • Size: <b>${size}</b></div>

          <div class="cart-item__price">
            <div style="font-weight:900">${INR(p.priceNow)}</div>
            <div style="font-weight:900; color:rgba(0,0,0,.35); text-decoration:line-through">${INR(p.priceWas)}</div>
            <div style="font-weight:900; color:var(--green)">(${p.off}% off)</div>
          </div>

          <div class="cart-actions">
            <div style="display:flex; align-items:center; gap:10px">
              <span style="font-weight:900; color:#666">Qty:</span>
              <select class="select" data-qty="${line.id}">
                ${[1,2,3,4,5].map(n=>`<option ${n===line.qty?"selected":""}>${n}</option>`).join("")}
              </select>
            </div>

            <button class="link-btn" data-remove="${line.id}">Remove</button>
          </div>
        </div>
      </article>
    `;
  }).join("");

  qsa("[data-qty]").forEach(sel=>{
    sel.addEventListener("change", ()=>{
      updateQty(sel.dataset.qty, sel.value);
      renderCart();
    });
  });

  qsa("[data-remove]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      removeLine(btn.dataset.remove);
      toast("Removed from cart");
      renderCart();
    });
  });

  const t = computeTotals(getCart());
  qs("#itemsCount").textContent = String(t.items);
  qs("#totalAmount").textContent = INR(t.totalWithShip);

  qs("#priceDetails").innerHTML = `
    <div class="pr-line"><span>Total MRP</span><span>${INR(t.mrp)}</span></div>
    <div class="pr-line"><span>Discount</span><span>- ${INR(t.discount)}</span></div>
    <div class="pr-line"><span>Shipping</span><span>${t.shipping===0 ? "Free" : INR(t.shipping)}</span></div>
    <div class="pr-line"><span><b>Payable</b></span><span><b>${INR(t.totalWithShip)}</b></span></div>
  `;
}

document.addEventListener("DOMContentLoaded", ()=>{
  renderCart();
});
