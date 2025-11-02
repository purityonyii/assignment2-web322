

function getAllMealKits() {
  return [
    {
      name: "Jollof Rice with Chicken",
      category: "Rice Dish",
      price: 19,
      imageUrl: "/images/jollof-rice.jpg",
      featured: true
    },
    {
      name: "Porridge Yam",
      category: "Traditional",
      price: 18,
      imageUrl: "/images/porridge-yam.jpg",
      featured: true
    },
    {
      name: "Isi Ewu",
      category: "Spicy Meat",
      price: 20,
      imageUrl: "/images/isi-ewu.jpg",
      featured: false
    },
  ];
}

// pick featured cards (if none flagged, fallback to first 3)
function getFeaturedMealKits(all) {
  const flagged = all.filter(m => m.featured);
  return (flagged.length ? flagged : all).slice(0, 3);
}

// group by category -> returns object: { "Rice Dish": [..], "Traditional":[..], ... }
function getMealKitsByCategory(kits) {
  const map = {};
  kits.forEach(k => {
    if (!map[k.category]) map[k.category] = [];
    map[k.category].push(k);
  });
  return map;
}

module.exports = { getAllMealKits, getFeaturedMealKits, getMealKitsByCategory };
