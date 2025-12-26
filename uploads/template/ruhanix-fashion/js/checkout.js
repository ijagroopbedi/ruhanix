function computeTotals(cart){
  let mrp=0, total=0, items=0;
  cart.lines.forEach(line=>{
    const p = findProduct(line.sku);
    items += line.qty;
    mrp += p.priceWas * line.qty;
    total += p.priceNow * line.qty;
  });
  const discount = mrp - total;
  const shipping = total >= 999 || total===0 ? 0 : 49;
  return { items, mrp, discount, shipping, payable: total + shipping };
}

function renderSummary(){
  const cart = getCart();
  const t = computeTotals(cart);

  qs("#totalPayable").textContent = INR(t.payable);
  qs("#summary").innerHTML = `
    <div class="pr-line"><span>Total MRP</span><span>${INR(t.mrp)}</span></div>
    <div class="pr-line"><span>Discount</span><span>- ${INR(t.discount)}</span></div>
    <div class="pr-line"><span>Shipping</span><span>${t.shipping===0 ? "Free" : INR(t.shipping)}</span></div>
    <div class="pr-line"><span><b>Payable</b></span><span><b>${INR(t.payable)}</b></span></div>
  `;
}

document.addEventListener("DOMContentLoaded", ()=>{
  const cart = getCart();
  if(cart.lines.length === 0){
    toast("Cart is empty");
    setTimeout(()=> location.href="./index.html#new", 700);
    return;
  }
  renderSummary();

  qs("#addressForm").addEventListener("submit",(e)=>{
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = Object.fromEntries(fd.entries());

    if(!/^\d{10}$/.test(data.phone || "")) return toast("Enter valid phone (10 digits)");
    if(!/^\d{6}$/.test(data.pincode || "")) return toast("Enter valid pincode (6 digits)");

    localStorage.setItem("rf_address_v1", JSON.stringify(data));

    // Demo: complete payment and clear cart
    clearCart();
    location.href="./success.html";
  });
});
