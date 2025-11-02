// models/mealkitsData.js  (Rita - static mealkits for now)

const mealkits = [
  {
    title: "Jollof Rice with Chicken",
    includes: "Tomato stew base, spiced chicken, fried plantain",
    description: "Classic West African rice cooked in spicy tomato sauce and served with juicy chicken.",
    category: "Classic Meals",
    price: 19.99,
    cookingTime: 40,
    servings: 2,
    // use file that exists: public/images/jollof-rice.jpg
    imageUrl: "/images/jollof-rice.jpg",
    featuredMealKit: true
  },
  {
    title: "Porridge Yam",
    includes: "Soft yam cubes, palm oil, crayfish, vegetables",
    description: "Rich and hearty yam porridge seasoned with local spices for a comforting taste.",
    category: "Classic Meals",
    price: 17.49,
    cookingTime: 35,
    servings: 2,
    // use file that exists: public/images/porridge-yam.jpg
    imageUrl: "/images/porridge-yam.jpg",
    featuredMealKit: true
  },
  {
    title: "Fried Rice with Shrimp",
    includes: "Shrimp, mixed vegetables, soy sauce, fried rice base",
    description: "Colourful and tasty fried rice cooked with juicy shrimp and veggies.",
    category: "Classic Meals",
    price: 20.99,
    cookingTime: 30,
    servings: 2,
    // TODO: add this file to /public/images or change name
    imageUrl: "/images/shrimpfriedrice.jpg",
    featuredMealKit: false
  },
  {
    title: "Spaghetti Jollof",
    includes: "Spaghetti, tomato sauce, beef, vegetables",
    description: "A twist on classic Jollof, this spaghetti version is packed with flavour.",
    category: "Classic Meals",
    price: 18.99,
    cookingTime: 35,
    servings: 2,
    // TODO: add this file to /public/images or change name
    imageUrl: "/images/jollof-spaghetti.jpg",
    featuredMealKit: true
  },
  {
    title: "Breadfruit (Ukwa) Delight",
    includes: "Cooked ukwa, palm oil, scent leaf, fish",
    description: "Deliciously soft breadfruit dish mixed with palm oil and smoked fish flavor.",
    category: "Traditional Dishes",
    price: 18.99,
    cookingTime: 45,
    servings: 2,
    // TODO: add this file to /public/images or change name
    imageUrl: "/images/breadfruit.jpg",
    featuredMealKit: false
  },
  {
    title: "Spicy Beef Suya",
    includes: "Grilled beef skewers, onions, suya pepper mix",
    description: "Street-style spicy suya with crunchy onions and a smoky aroma.",
    category: "Traditional Dishes",
    price: 21.99,
    cookingTime: 25,
    servings: 2,
    // TODO: add this file to /public/images or change name
    imageUrl: "/images/spicy-beef-suya.jpg",
    featuredMealKit: true
  },
  {
    title: "Egusi Soup",
    includes: "Ground melon seed soup, spinach, assorted meat",
    description: "Rich Nigerian soup made with melon seeds and served with soft fufu.",
    category: "Soups & Stews",
    price: 22.49,
    cookingTime: 50,
    servings: 2,
    // TODO: add this file to /public/images or change name
    imageUrl: "/images/egusi-soup.jpg",
    featuredMealKit: false
  },
  {
    title: "Isi Ewu (Goat Head)",
    includes: "Boiled goat head, palm oil, utazi, spices",
    description: "Spicy delicacy from Eastern Nigeria cooked in palm oil and traditional spices.",
    category: "Soups & Stews",
    price: 24.99,
    cookingTime: 60,
    servings: 2,
    // use file that exists: public/images/isi-ewu.jpg
    imageUrl: "/images/isi-ewu.jpg",
    featuredMealKit: true
  }
];

// return all
module.exports.getAllMealKits = function () {
  return mealkits;
};

// only featured
module.exports.getFeaturedMealKits = function (kits) {
  const arr = Array.isArray(kits) ? kits : [];
  return arr.filter(k => k.featuredMealKit === true);
};

// group by category -> [{ title: "Classic Meals", mealKits: [...] }, ...]
module.exports.getMealKitsByCategory = function (kits) {
  const arr = Array.isArray(kits) ? kits : [];
  const grouped = {};

  for (const k of arr) {
    const cat = k.category || "Other";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(k);
  }

  const out = [];
  for (const catName in grouped) {
    out.push({ title: catName, mealKits: grouped[catName] }); // note: title (not categoryName)
  }
  return out;
};
