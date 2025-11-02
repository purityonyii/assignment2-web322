// Rita guards (to protect pages)

// user must be logged in
exports.requireLogin = (req, res, next) => {
    // if no session user then go to login page
    if (!req.session.user) {
        return res.redirect("/login");
    }
    next();
};

// user must be clerk
exports.requireClerk = (req, res, next) => {
    // if no session OR wrong role
    if (!req.session.user || req.session.user.role !== "clerk") {
        return res.status(401).render("error", {
            code: 401,
            message: "This page is only for clerks"
        });
    }
    next();
};
