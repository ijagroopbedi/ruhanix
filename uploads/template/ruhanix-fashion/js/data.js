const IMG = {
  // HERO (Unsplash live links)
  hero: "https://images.unsplash.com/photo-1520975916090-3105956dac38?auto=format&fit=crop&w=1600&q=80",

  // Categories
  catTopwear: "https://images.unsplash.com/photo-1759365485726-cfe4166bbfe7?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  catBottomwear: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1400&q=80",
  catWinter: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1400&q=80",
  catAccessories: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=1400&q=80",
};

// Categories (links are working)
const CATEGORIES = [
  { id:"topwear", title:"TOPWEAR", img: IMG.catTopwear, href:"./index.html#new" },
  { id:"bottomwear", title:"BOTTOMWEAR", img: IMG.catBottomwear, href:"./index.html#new" },
  { id:"winterwear", title:"WINTERWEAR", img: IMG.catWinter, href:"./index.html#new" },
  { id:"accessories", title:"ACCESSORIES", img: IMG.catAccessories, href:"./index.html#new" },
];

// Products (LIVE images + multi-image gallery)
const PRODUCTS = [
  {
    sku:"RF-SHIRT-001",
    name:"Maroon Oxford Shirt",
    category:"Shirt",
    priceNow:1299, priceWas:2599, off:50,
    tag:"New Arrival",
    sizes:["S","M","L","XL","XXL"],
    colors:[
      {
        name:"Maroon",
        thumb:"https://images.unsplash.com/photo-1516826957135-700dedea698c?auto=format&fit=crop&w=900&q=80",
        images:[
          "https://images.unsplash.com/photo-1516826957135-700dedea698c?auto=format&fit=crop&w=1400&q=80",
          "https://images.unsplash.com/photo-1520975916090-3105956dac38?auto=format&fit=crop&w=1400&q=80",
          "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1400&q=80"
        ]
      }
    ]
  },
  {
    sku:"RF-HOOD-002",
    name:"Classic Hoodie - Deep Olive",
    category:"Hoodie",
    priceNow:1499, priceWas:3499, off:57,
    tag:"Trending",
    sizes:["S","M","L","XL"],
    colors:[
      {
        name:"Olive",
        thumb:"https://images.unsplash.com/photo-1520975661595-6453be3f7070?auto=format&fit=crop&w=900&q=80",
        images:[
          "https://images.unsplash.com/photo-1520975661595-6453be3f7070?auto=format&fit=crop&w=1400&q=80",
          "https://images.unsplash.com/photo-1520975682031-aed2b2b76d09?auto=format&fit=crop&w=1400&q=80"
        ]
      }
    ]
  },
  {
    sku:"RF-PANT-003",
    name:"Everyday Comfort Trousers",
    category:"Trousers",
    priceNow:1399, priceWas:2799, off:50,
    tag:"Best Seller",
    sizes:["28","30","32","34","36"],
    colors:[
      {
        name:"Charcoal",
        thumb:"https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=900&q=80",
        images:[
          "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=1400&q=80",
          "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1400&q=80"
        ]
      }
    ]
  },
  {
    sku:"RF-JKT-004",
    name:"Winter Fleece Jacket",
    category:"Jacket",
    priceNow:1999, priceWas:4999, off:60,
    tag:"New Arrival",
    sizes:["S","M","L","XL"],
    colors:[
      {
        name:"Stone",
        thumb:"https://images.unsplash.com/photo-1624832145301-9c1f053d9419?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        images:[
          "https://images.unsplash.com/photo-1624832144743-539b3ffbbfa3?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          "https://images.unsplash.com/photo-1713480867524-a984d8943505?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        ]
      }
    ]
  },
  {
    sku:"RF-POLO-005",
    name:"Minimal Polo T-Shirt",
    category:"Polo",
    priceNow:999, priceWas:1999, off:50,
    tag:"Hot Deal",
    sizes:["S","M","L","XL","XXL"],
    colors:[
      {
        name:"Black",
        thumb:"https://images.unsplash.com/photo-1520975958225-9e0ce82759c3?auto=format&fit=crop&w=900&q=80",
        images:[
          "https://images.unsplash.com/photo-1520975958225-9e0ce82759c3?auto=format&fit=crop&w=1400&q=80",
          "https://images.unsplash.com/photo-1520975682031-aed2b2b76d09?auto=format&fit=crop&w=1400&q=80"
        ]
      }
    ]
  },
  {
    sku:"RF-CARGO-006",
    name:"Utility Cargo Pants",
    category:"Cargos",
    priceNow:1599, priceWas:3199, off:50,
    tag:"Trending",
    sizes:["28","30","32","34","36"],
    colors:[
      {
        name:"Khaki",
        thumb:"https://images.unsplash.com/photo-1593032465175-481ac7f401a0?auto=format&fit=crop&w=900&q=80",
        images:[
          "https://images.unsplash.com/photo-1593032465175-481ac7f401a0?auto=format&fit=crop&w=1400&q=80",
          "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1400&q=80"
        ]
      }
    ]
  }
];

function findProduct(sku){
  return PRODUCTS.find(p => p.sku === sku) || PRODUCTS[0];
}
