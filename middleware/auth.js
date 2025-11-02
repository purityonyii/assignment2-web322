

exports.requireLogin = (req, res, next) => {
    
    if (!req.session.user) {
        return res.redirect("/login");
    }
    next();
};

exports.requireClerk = (req, res, next) => {
    
    if (!req.session.user || req.session.user.role !== "clerk") {
        return res.status(401).render("error", {
            code: 401,
            message: "This page is only for clerks"
        });
    }
    next();
};
