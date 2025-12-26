const CART_KEY = "rf_cart_v1";

function getCart(){
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || { lines: [] }; }
  catch { return { lines: [] }; }
}
function setCart(cart){
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}
function makeLineId(sku, color, size){
  return `${sku}__${color}__${size}`;
}
function addToCart({ sku, color, size, qty=1 }){
  const cart = getCart();
  const id = makeLineId(sku, color, size);
  const existing = cart.lines.find(l => l.id === id);
  if(existing) existing.qty += qty;
  else cart.lines.push({ id, sku, color, size, qty });
  setCart(cart);
  return cart;
}
function updateQty(lineId, qty){
  const cart = getCart();
  const line = cart.lines.find(l => l.id === lineId);
  if(line){
    line.qty = Math.max(1, Number(qty) || 1);
    setCart(cart);
  }
  return cart;
}
function removeLine(lineId){
  const cart = getCart();
  cart.lines = cart.lines.filter(l => l.id !== lineId);
  setCart(cart);
  return cart;
}
function clearCart(){ setCart({ lines: [] }); }
function cartCount(){ return getCart().lines.reduce((sum,l)=> sum + (l.qty||0), 0); }
