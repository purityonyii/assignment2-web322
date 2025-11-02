// Rita - auth stuff (signup, login, logout)

const User = require("../models/userModel"); // <-- fix: use your actual file name

// show signup page
exports.showSignup = (req, res) => {
    res.render("auth/signup", {
        title: "Create Account",
        errors: {},
        values: {}
    });
};

// handle signup submit
exports.doSignup = async (req, res) => {
    // I grab fields from form
    const { firstName, lastName, email, password, role } = req.body;
    const errors = {};

    // small checks (simple)
    if (!firstName) errors.firstName = "first name required";
    if (!lastName)  errors.lastName  = "last name required";
    if (!email)     errors.email     = "email required";
    if (!password || password.length < 6) errors.password = "min 6 chars";

    // if any error then go back to form
    if (Object.keys(errors).length) {
        return res.status(400).render("auth/signup", {
            title: "Create Account",
            errors,
            values: req.body
        });
    }

    try {
        // check if email already used before
        const used = await User.findOne({ email });
        if (used) {
            return res.status(400).render("auth/signup", {
                title: "Create Account",
                errors: { email: "email already exists" },
                values: req.body
            });
        }

        // create the new user (model will hash password automatically)
        await User.create({ firstName, lastName, email, password, role });

        // after ok, send them to login page
        res.redirect("/login");

    } catch (err) {
        console.log("signup error:", err.message);
        res.status(500).render("error", { code: 500, message: "signup failed (server problem)" });
    }
};

// show login page
exports.showLogin = (req, res) => {
    res.render("auth/login", {
        title: "Log In",
        errors: {},
        values: {}
    });
};

// handle login submit
exports.doLogin = async (req, res) => {
    const { email, password } = req.body;

    // must enter both
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

        // check password using method from model
        const ok = await user.comparePassword(password);
        if (!ok) {
            return res.status(401).render("auth/login", {
                title: "Log In",
                errors: { form: "invalid email or password" },
                values: { email }
            });
        }

        // keep small info in session (so I know who is logged in)
        req.session.user = {
            _id: String(user._id),
            name: user.firstName,
            role: user.role
        };

        // go to dashboard (you can change to home if you want)
        res.redirect("/dashboard");

    } catch (err) {
        console.log("login error:", err.message);
        res.status(500).render("error", { code: 500, message: "login failed (server problem)" });
    }
};

// logout (clear session)
exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect("/login");
    });
};
