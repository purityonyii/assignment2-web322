// Rita - routes for signup / login / logout

const express = require("express");
const router = express.Router();

const auth = require("../controllers/authController");
const guard = require("../middleware/auth");

// show signup and login pages
router.get("/sign-up", auth.showSignup);
router.get("/login", auth.showLogin);

// handle form submits
router.post("/sign-up", auth.doSignup);
router.post("/login", auth.doLogin);

// logout button
router.get("/logout", auth.logout);

// test page for logged in users only
router.get("/dashboard", guard.requireLogin, (req, res) => {
    res.render("auth/dashboard", {
        title: "Dashboard",
        user: req.session.user
    });
});

module.exports = router;
