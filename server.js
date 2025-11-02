// Rita - Assignment2 main server file

require("dotenv").config();
const express = require("express");
const path = require("path");
const expressLayouts = require("express-ejs-layouts");
const bodyParser = require("body-parser");
const session = require("express-session");
const mongoose = require("mongoose");

const app = express();

// port number
const PORT = process.env.PORT || 8080;

// views and layouts setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(expressLayouts);
app.set("layout", "layouts/main"); // my main layout

// static folder
app.use(express.static(path.join(__dirname, "public")));

// form reading
app.use(bodyParser.urlencoded({ extended: true }));

// sessions (remember who is logged in)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "simple-secret",
    resave: false,
    saveUninitialized: false,
  })
);

// >>> make user variable available in all ejs views (important for layout)
app.use((req, res, next) => {
  res.locals.user = req.session.user || null; // now <%- user %> works everywhere
  next();
});

// routes (controllers)
const generalController = require("./controllers/generalController");
app.use("/", generalController);

const mealkitsController = require("./controllers/mealkitsController");
app.use("/mealkits", mealkitsController);

const authRoutes = require("./routes/auth");
app.use(authRoutes);

// simple home (ok if your generalController already serves "/")
app.get("/", (req, res) => {
  res.render("general/home", { title: "Home" });
});

// Rita - mongodb connect and start server here

// i use the MONGO_URI from my .env file
const myURI = (process.env.MONGO_URI || "").trim();

// async function to connect and start
(async () => {
  try {
    if (!myURI) {
      throw new Error("MONGO_URI not found in .env file");
    }

    console.log("[Mongo] connecting...");
    await mongoose.connect(myURI);
    console.log("✅ Connected to MongoDB Atlas ✔️");

    // now start express server
    app.listen(PORT, () => {
      console.log("✅ server now running on http://localhost:" + PORT);
    });
  } catch (err) {
    console.log("❌ MongoDB connection error:", err.message);
  }
})();
