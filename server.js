

require("dotenv").config();
const express = require("express");
const path = require("path");
const expressLayouts = require("express-ejs-layouts");
const bodyParser = require("body-parser");
const session = require("express-session");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 8080;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(expressLayouts);
app.set("layout", "layouts/main"); 

app.use(express.static(path.join(__dirname, "public")));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "simple-secret",
    resave: false,
    saveUninitialized: false,
  })
);
app.use((req, res, next) => {
  res.locals.user = req.session.user || null; 
  next();
});
const generalController = require("./controllers/generalController");
app.use("/", generalController);

const mealkitsController = require("./controllers/mealkitsController");
app.use("/mealkits", mealkitsController);

const authRoutes = require("./routes/auth");
app.use(authRoutes);
app.get("/", (req, res) => {
  res.render("general/home", { title: "Home" });
});

const myURI = (process.env.MONGO_URI || "").trim();

(async () => {
  try {
    if (!myURI) {
      throw new Error("MONGO_URI not found in .env file");
    }

    console.log("[Mongo] connecting...");
    await mongoose.connect(myURI);
    console.log("✅ Connected to MongoDB Atlas ✔️");
    app.listen(PORT, () => {
      console.log("✅ server now running on http://localhost:" + PORT);
    });
  } catch (err) {
    console.log("❌ MongoDB connection error:", err.message);
  }
})();
