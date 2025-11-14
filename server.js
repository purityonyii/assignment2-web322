// declare that this assignment is my own work in accordance with Seneca Academic Policy.
// No part of this assignment has been copied manually or electronically from any other source
// (including web sites) or distributed to other students.// i got a little idea from ai because i was getting errors
//and i took most of my code from my assignment1
  //Name: Ngaokere Onyinyechi Rita
 //Student ID: 173949231
// Date: 2025-10-05
//  Course/Section: WEB322

// here i load all the things i need
require("dotenv").config();
const express = require("express");
const path = require("path");
const ejsLayouts = require("express-ejs-layouts");
const bodyParser = require("body-parser");
const session = require("express-session");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 8080;

// here i set my view engine and layout
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(ejsLayouts);
app.set("layout","layouts/main");

// here i load static files (css, images, js)
app.use(express.static(path.join(__dirname,"public")));

// here i read form data
app.use(bodyParser.urlencoded({extended:true}));

// here i set up session so i can remember user
app.use(session({
    secret: process.env.SESSION_SECRET || "simple-secret",
    resave:false,
    saveUninitialized:false
}));

// this one makes user available in all views
app.use((req,res,next)=>{
    res.locals.user = req.session.user || null;
    next();
});

// here i load my routes
const generalController = require("./controllers/generalController");
app.use("/",generalController);

const mealkitsController = require("./controllers/mealkitsController");
app.use("/mealkits",mealkitsController);

const authRoutes = require("./routes/auth");
app.use("/",authRoutes);

// here i check if mongo uri exists (only on my own laptop)
const myURI = (process.env.MONGO_URI || "").trim();

if(myURI){
    console.log("[mongo] trying to connect...");
    mongoose.connect(myURI)
    .then(()=>{
        console.log("connected to mongodb atlas");
    })
    .catch((err)=>{
        console.log("mongo error:", err.message);
    });
}else{
    console.log("[mongo] atlas connection skipped (no uri found)");
}

// here i start my server
app.listen(PORT, ()=>{
    console.log("server is running on http://localhost:" + PORT);
});
//i got a little idea from ai in this assignment but mainly from my assignment1