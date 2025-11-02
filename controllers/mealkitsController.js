const express = require("express");
const router = express.Router();

const mealData = require("../models/mealkitsData");

function requireClerk(req, res, next) {
  if (!req.session.user || req.session.user.role !== "clerk") {
    return res.status(401).render("error", {
      code: 401,
      message: "You are not authorized to view this page",
    });
  }
  next();
}

router.get("/", (req, res) => {
  const allKits = mealData.getAllMealKits();

  const byCat = mealData.getMealKitsByCategory(allKits);
  const groups = Array.isArray(byCat)
    ? byCat
    : Object.keys(byCat).map(cat => ({ title: cat, mealKits: byCat[cat] }));

  console.log("[/mealkits] kits:", allKits.length, "categories:", groups.length);

  res.render("mealkits/on-the-menu", {
    title: "On The Menu",
    groups,   
  });
});

router.get("/list", requireClerk, (req, res) => {
  const kits = mealData.getAllMealKits();
  res.render("mealkits/list", { title: "Meal Kits List", kits });
});

module.exports = router;
