

const express = require("express");
const router = express.Router();

const auth = require("../controllers/authController");
const guard = require("../middleware/auth");


router.get("/sign-up", auth.showSignup);
router.get("/login", auth.showLogin);

router.post("/sign-up", auth.doSignup);
router.post("/login", auth.doLogin);


router.get("/logout", auth.logout);


router.get("/dashboard", guard.requireLogin, (req, res) => {
    res.render("auth/dashboard", {
        title: "Dashboard",
        user: req.session.user
    });
});

module.exports = router;
