const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

const mealData = require('../models/mealkitsData');
const userModel = require('../models/userModel');

let sendWelcomeEmail = async () => {};
try {
  ({ sendWelcomeEmail } = require('../services/email'));
} catch (e) {
  console.log("email service not found");
}

// ---------- Helper Functions ----------
function isEmpty(v) {
  return !v || (typeof v === 'string' && v.trim() === '');
}

function trimAll(obj) {
  const cleaned = {};
  for (let key in obj) {
    if (typeof obj[key] === 'string') {
      cleaned[key] = obj[key].trim();
    } else {
      cleaned[key] = obj[key];
    }
  }
  return cleaned;
}

// Very simple student-style email check
function looksLikeEmail(email) {
  if (!email.includes("@")) return false;
  if (!email.includes(".")) return false;
  if (email.startsWith("@") || email.endsWith("@")) return false;
  if (email.startsWith(".") || email.endsWith(".")) return false;
  return true;
}

// Manual password check (8–12, lower, upper, number, symbol)
function goodPassword(p) {
  if (p.length < 8 || p.length > 12) return false;

  let low = false;
  let up = false;
  let num = false;
  let sym = false;

  for (let c of p) {
    if (c >= "a" && c <= "z") low = true;
    else if (c >= "A" && c <= "Z") up = true;
    else if (c >= "0" && c <= "9") num = true;
    else sym = true;
  }

  return (low && up && num && sym);
}

// ---------- Routes ----------

router.get('/', (req, res) => {
  const all = mealData.getAllMealKits ? mealData.getAllMealKits() : [];
  res.render('general/home', {
    title: 'Home',
    mealkits: all
  });
});

router.get('/sign-up', (req, res) => {
  res.render('general/sign-up', { title: 'Create Account', errors: {}, values: {} });
});

router.get('/welcome', (req, res) => {
  res.render('general/welcome', { title: 'Welcome' });
});

router.get('/log-in', (req, res) => {
  res.render('general/log-in', {
    title: 'Log In',
    errors: {},
    values: {}
  });
});

// ---------- SIGN-UP POST ----------
router.post('/sign-up', async (req, res) => {
  const body = trimAll(req.body || {});
  const firstName = body.firstName || "";
  const lastName  = body.lastName  || "";
  const email     = (body.email    || "").toLowerCase();
  const password  = body.password  || "";

  const errors = {};

  if (isEmpty(firstName)) errors.firstName = "first name required";
  if (isEmpty(lastName))  errors.lastName  = "last name required";
  if (isEmpty(email))     errors.email     = "email required";
  if (isEmpty(password))  errors.password  = "password required";

  if (!isEmpty(email) && !looksLikeEmail(email)) {
    errors.email = "email format is wrong";
  }

  if (!isEmpty(password) && !goodPassword(password)) {
    errors.password = "8–12 chars, lower, upper, number, symbol";
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).render("general/sign-up", {
      title: "Create Account",
      errors,
      values: { firstName, lastName, email }
    });
  }

  try {
    const exists = await userModel.findOne({ email }).lean();
    if (exists) {
      return res.status(400).render("general/sign-up", {
        title: "Create Account",
        errors: { email: "email already registered" },
        values: { firstName, lastName, email }
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await userModel.create({
      firstName,
      lastName,
      email,
      password: passwordHash,
      role: "customer"
    });

    try { await sendWelcomeEmail(email, firstName); } catch (e) {}

    res.redirect("/welcome");

  } catch (err) {
    return res.status(500).render("error", {
      title: "Error",
      code: 500,
      message: "Server Error"
    });
  }
});

// ---------- LOGIN POST ----------
router.post('/log-in', async (req, res) => {
  const body = trimAll(req.body || {});
  const email = (body.email || "").toLowerCase();
  const password = body.password || "";
  const role = body.role || "";

  const errors = {};

  if (isEmpty(email))    errors.email = "email required";
  if (isEmpty(password)) errors.password = "password required";
  if (isEmpty(role))     errors.role = "choose one option";

  if (Object.keys(errors).length > 0) {
    return res.status(400).render("general/log-in", {
      title: "Log In",
      errors,
      values: { email, role }
    });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(401).render("general/log-in", {
        title: "Log In",
        errors: { form: "invalid email or password" },
        values: { email, role }
      });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).render("general/log-in", {
        title: "Log In",
        errors: { form: "invalid email or password" },
        values: { email, role }
      });
    }

    req.session.user = {
      _id: String(user._id),
      name: user.firstName,
      role: role
    };

    if (role === "clerk") return res.redirect("/mealkits/list");
    return res.redirect("/cart");

  } catch (err) {
    return res.status(500).render("error", {
      title: "Error",
      code: 500,
      message: "Server Error"
    });
  }
});

// ---------- LOG OUT ----------
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/log-in');
  });
});

module.exports = router;
