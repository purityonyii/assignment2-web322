// name: onyinyechi rita ngaokere
// email: orngaokere@myseneca.ca
// date: november 2025
//
// this is my main express app file for assignment 2.
// here i set up ejs, static files, sessions, routes and (optional) mongo atlas.

require("dotenv").config();
const express = require("express");
const path = require("path");
const expressLayouts = require("express-ejs-layouts");
const bodyParser = require("body-parser");
const session = require("express-session");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 8080;

// =================== view engine stuff ===================
// here i tell express that i am using ejs and layouts
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(expressLayouts);
app.set("layout", "layouts/main"); // this is my main layout file

// =================== static files ===================
// here i serve css, images, js from public folder
app.use(express.static(path.join(__dirname, "public")));

// =================== body parser ===================
// here i parse form data from POST requests
app.use(bodyParser.urlencoded({ extended: true }));

// =================== sessions ===================
// here i set up session so i can remember who is logged in
app.use(
  session({
    secret: process.env.SESSION_SECRET || "simple-secret", // my secret for cookies
    resave: false,
    saveUninitialized: false,
  })
);

// here i make the user available in all ejs views as "user"
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// =================== routes ===================
// here i pull in my controllers and routes
const generalController = require("./controllers/generalController");
app.use("/", generalController); // general pages like home, about, etc.

const mealkitsController = require("./controllers/mealkitsController");
app.use("/mealkits", mealkitsController); // for /mealkits routes

const authRoutes = require("./routes/auth");
// here i mount auth routes (login, register, etc.) on root
app.use("/", authRoutes);

// if for some reason generalController does not handle "/",
// i can uncomment this small home route:
//
// app.get("/", (req, res) => {
//   res.render("general/home", { title: "Home" });
// });

// =================== mongo atlas (optional) ===================
// here i read my mongo uri from .env
// i DO NOT push .env to github (i add ".env" to .gitignore)
const myURI = (process.env.MONGO_URI || "").trim();

if (myURI) {
  // here i only try to connect if uri exists (on my laptop)
  console.log("[mongo] trying to connect...");
  mongoose
    .connect(myURI)
    .then(() => {
      console.log("✅ connected to mongodb atlas ✔️");
    })
    .catch((err) => {
      console.log("❌ mongodb connection error:", err.message);
    });
} else {
  // on my prof's machine there is no uri and that is ok
  console.log("[mongo] atlas connection skipped (no MONGO_URI in env)");
}

// =================== start server ===================
app.listen(PORT, () => {
  console.log("✅ server now running on http://localhost:" + PORT);
});
