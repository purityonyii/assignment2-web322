

const User = require("../models/userModel"); 


exports.showSignup = (req, res) => {
    res.render("auth/signup", {
        title: "Create Account",
        errors: {},
        values: {}
    });
};


exports.doSignup = async (req, res) => {
    
    const { firstName, lastName, email, password, role } = req.body;
    const errors = {};
    if (!firstName) errors.firstName = "first name required";
    if (!lastName)  errors.lastName  = "last name required";
    if (!email)     errors.email     = "email required";
    if (!password || password.length < 6) errors.password = "min 6 chars";

   
    if (Object.keys(errors).length) {
        return res.status(400).render("auth/signup", {
            title: "Create Account",
            errors,
            values: req.body
        });
    }

    try {
        
        const used = await User.findOne({ email });
        if (used) {
            return res.status(400).render("auth/signup", {
                title: "Create Account",
                errors: { email: "email already exists" },
                values: req.body
            });
        }
        await User.create({ firstName, lastName, email, password, role });
        res.redirect("/login");

    } catch (err) {
        console.log("signup error:", err.message);
        res.status(500).render("error", { code: 500, message: "signup failed (server problem)" });
    }
};
exports.showLogin = (req, res) => {
    res.render("auth/login", {
        title: "Log In",
        errors: {},
        values: {}
    });
};

exports.doLogin = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).render("auth/login", {
            title: "Log In",
            errors: { form: "enter email and password" },
            values: { email }
        });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).render("auth/login", {
                title: "Log In",
                errors: { form: "invalid email or password" },
                values: { email }
            });
        }
        const ok = await user.comparePassword(password);
        if (!ok) {
            return res.status(401).render("auth/login", {
                title: "Log In",
                errors: { form: "invalid email or password" },
                values: { email }
            });
        }
        req.session.user = {
            _id: String(user._id),
            name: user.firstName,
            role: user.role
        };
        res.redirect("/dashboard");

    } catch (err) {
        console.log("login error:", err.message);
        res.status(500).render("error", { code: 500, message: "login failed (server problem)" });
    }
};


exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect("/login");
    });
};
