/**
 * Ruhanix Kitchen — demo catalog data
 * Images: Unsplash Source (always live, non-broken)
 * NOTE: Replace with your real product data + images when integrating with backend.
 */
window.RK_DATA = (() => {
  const categories = [
    { id: "all", name: "All", img: "https://source.unsplash.com/120x120/?indian-food" },
    { id: "veg-main", name: "Veg Main Course", img: "https://source.unsplash.com/120x120/?paneer,curry" },
    { id: "nonveg-main", name: "Non-Veg Main", img: "https://source.unsplash.com/120x120/?chicken,curry" },
    { id: "breads", name: "Breads", img: "https://source.unsplash.com/120x120/?naan,roti" },
    { id: "bowls", name: "Bowls", img: "https://source.unsplash.com/120x120/?dal,bowl" },
    { id: "beverages", name: "Beverages", img: "https://source.unsplash.com/120x120/?mocktail,drink" },
    { id: "combos", name: "Combos", img: "https://source.unsplash.com/120x120/?thali,indian" },
    { id: "desserts", name: "Desserts", img: "https://source.unsplash.com/120x120/?dessert,indian" }
  ];

  const products = [
    // Veg
    mk("achari-aloo-gobi", "Achari Aloo Gobi", "veg-main", "veg", 180, 4.5, 325, "A tangy, mustard-forward aloo gobi with achari spices."),
    mk("paneer-pasanda", "Paneer Pasanda", "veg-main", "veg", 220, 4.6, 380, "Stuffed paneer, silky gravy — rich but balanced."),
    mk("paneer-do-pyaza", "Paneer Do Pyaza", "veg-main", "veg", 200, 4.4, 370, "Paneer with caramelized onions and a tomato-forward gravy."),
    mk("dal-makhani", "Dal Makhani", "bowls", "veg", 180, 4.7, 315, "Slow-cooked black lentils, butter, cream — the classic."),
    mk("bhindi-masala", "Bhindi Masala", "veg-main", "veg", 180, 4.2, 275, "Crisp okra with masala onions and tomatoes."),
    mk("aloo-matar", "Aloo Matar", "veg-main", "veg", 160, 4.1, 260, "Comfort curry with potatoes + green peas."),
    mk("palak-paneer", "Palak Paneer", "veg-main", "veg", 200, 4.5, 360, "Spinach gravy with paneer, garlic and a gentle heat."),
    mk("chole-masala", "Chole Masala", "bowls", "veg", 170, 4.3, 300, "Chickpeas simmered in aromatic roasted spices."),

    // Non-veg
    mk("butter-chicken", "Butter Chicken", "nonveg-main", "nonveg", 250, 4.8, 600, "Creamy tomato butter gravy with tender chicken."),
    mk("afghani-chicken-gravy", "Afghani Chicken Gravy", "nonveg-main", "nonveg", 250, 4.6, 600, "Mild, creamy, and smoky with a nutty finish."),
    mk("achari-chicken-gravy", "Achari Chicken Gravy", "nonveg-main", "nonveg", 250, 4.4, 600, "Pickle-spice kick with a thick, glossy gravy."),
    mk("chicken-tikka-masala", "Chicken Tikka Masala", "nonveg-main", "nonveg", 260, 4.6, 620, "Charred tikka pieces with a bold masala sauce."),

    // Breads
    mk("butter-naan", "Butter Naan", "breads", "veg", 50, 4.6, 90, "Soft tandoori naan finished with butter."),
    mk("lachha-paratha", "Lachha Paratha", "breads", "veg", 55, 4.5, 95, "Crisp, flaky layers — best with gravies."),
    mk("tandoori-roti", "Tandoori Roti", "breads", "veg", 25, 4.2, 50, "Whole-wheat roti with a smoky tandoor char."),

    // Beverages
    mk("oreo-thick-shake", "Oreo Thick Shake", "beverages", "veg", 195, 4.5, 390, "Dessert-in-a-glass with Oreo crunch."),
    mk("blue-ocean-mocktail", "Blue Ocean Magic Mocktail", "beverages", "veg", 70, 4.3, 150, "Fresh citrus + soda with a fun ocean hue."),
    mk("masala-lemonade", "Masala Lemonade", "beverages", "veg", 60, 4.2, 120, "Classic nimbu with chaat masala sparkle."),
    mk("cold-coffee", "Cold Coffee", "beverages", "veg", 120, 4.4, 220, "Frothy, smooth, and lightly sweet."),

    // Combos
    mk("veg-thali", "Veg Thali Combo", "combos", "veg", 320, 4.6, 650, "1 curry + dal + rice + bread + salad."),
    mk("nonveg-thali", "Non-Veg Thali Combo", "combos", "nonveg", 380, 4.7, 700, "Chicken curry + dal + rice + bread + salad."),
    mk("office-lunch-box", "Office Lunch Box", "combos", "veg", 260, 4.4, 520, "Balanced portioned meal for busy days."),

    // Desserts
    mk("gulab-jamun", "Gulab Jamun", "desserts", "veg", 120, 4.6, 240, "Soft syrupy dumplings, served warm."),
    mk("rasmalai", "Rasmalai", "desserts", "veg", 140, 4.5, 260, "Chilled milk dessert with saffron notes."),
    mk("kesar-kulfi", "Kesar Kulfi", "desserts", "veg", 110, 4.4, 220, "Saffron kulfi with crunchy nuts.")
  ];

  function mk(id, name, category, type, price, rating, points, desc){
    const q = encodeURIComponent(`${name},indian food`);
    return {
      id,
      name,
      category,
      type, // veg | nonveg
      price,
      rating,
      points,
      desc,
      img: `https://source.unsplash.com/900x700/?${q}`,
      imgWide: `https://source.unsplash.com/1400x900/?${q}`,
      options: {
        quantity: ["Regular", "Large"],
        spice: ["Mild", "Medium", "Spicy"],
        gravy: ["Light", "Regular", "Extra"]
      }
    };
  }

  const featuredIds = ["butter-chicken","paneer-pasanda","dal-makhani","veg-thali","oreo-thick-shake","achari-aloo-gobi"];
  const featured = featuredIds.map(id => products.find(p => p.id === id)).filter(Boolean);

  return { categories, products, featured };
})();
