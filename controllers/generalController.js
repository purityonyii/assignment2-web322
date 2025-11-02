
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

const mealData = require('../models/mealkitsData');

const { userModel } = require('../models/userModel');

let sendWelcomeEmail = async () => {};
try {
  ({ sendWelcomeEmail } = require('../services/email'));
} catch (e) {
  console.warn('email service not found (ok for now)');
}

function isEmpty(v){ return !v || (typeof v === 'string' && v.trim() === ''); }
function trimAll(obj){ const o={}; for(const k in obj){ o[k]=typeof obj[k]==='string'?obj[k].trim():obj[k]; } return o; }
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const passRegex  = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,12}$/;

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
router.post('/sign-up', async (req, res) => {
  const body = trimAll(req.body || {});
  const firstName = body.firstName || '';
  const lastName  = body.lastName  || '';
  const email     = (body.email    || '').toLowerCase();
  const password  = body.password  || '';

  const errors = {};
  if (isEmpty(firstName)) errors.firstName = 'first name required';
  if (isEmpty(lastName))  errors.lastName  = 'last name required';
  if (isEmpty(email))     errors.email     = 'email required';
  if (isEmpty(password))  errors.password  = 'password required';

  if (!isEmpty(email) && !emailRegex.test(email)) {
    errors.email = 'email format is wrong';
  }
  if (!isEmpty(password) && !passRegex.test(password)) {
    errors.password = '8–12 chars, include lower, upper, number, symbol';
  }

  if (Object.keys(errors).length) {
    return res.status(400).render('general/sign-up', {
      title: 'Create Account',
      errors,
      values: { firstName, lastName, email }
    });
  }

  try {
    const exists = await userModel.findOne({ email }).lean();
    if (exists) {
      return res.status(400).render('general/sign-up', {
        title: 'Create Account',
        errors: { email: 'email already registered' },
        values: { firstName, lastName, email }
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await userModel.create({
      firstName,
      lastName,
      email,
      // if your schema field is "passwordHash", keep this:
      passwordHash,
      // if your schema field is "password" instead, use:
      // password: passwordHash,
      role: 'customer'
    });

    try { await sendWelcomeEmail(email, firstName); } catch (e) {
      console.error('Mail error:', e?.message || e);
    }

    return res.redirect('/welcome');

  } catch (err) {
    if (err && err.code === 11000) {
      return res.status(400).render('general/sign-up', {
        title: 'Create Account',
        errors: { email: 'email already registered' },
        values: { firstName, lastName, email }
      });
    }
    console.error('Sign-up error:', err);
    return res.status(500).render('error', {
      title: 'Error',
      code: 500,
      message: 'Server Error'
    });
  }
});

router.post('/log-in', async (req, res) => {
  const body = trimAll(req.body || {});
  const email = (body.email || '').toLowerCase();
  const password = body.password || '';
  const role = body.role || '';  

  const errors = {};
  if (isEmpty(email))    errors.email = 'email required';
  if (isEmpty(password)) errors.password = 'password required';
  if (isEmpty(role))     errors.role = 'choose one option';

  if (Object.keys(errors).length > 0) {
    return res.status(400).render('general/log-in', {
      title: 'Log In',
      errors,
      values: { email, role }
    });
  }
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(401).render('general/log-in', {
        title: 'Log In',
        errors: { form: 'invalid email or password' },
        values: { email, role }
      });
    }
    const hashed = user.passwordHash || user.password;
    const ok = await bcrypt.compare(password, hashed);
    if (!ok) {
      return res.status(401).render('general/log-in', {
        title: 'Log In',
        errors: { form: 'invalid email or password' },
        values: { email, role }
      });
    }

    req.session.user = {
      _id: String(user._id),
      name: user.firstName || 'User',
      role: role
    };

    if (role === 'clerk')  return res.redirect('/mealkits/list');
    else                   return res.redirect('/cart');

  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).render('error', {
      title: 'Error',
      code: 500,
      message: 'Server Error'
    });
  }
});

// logout destroys session (spec)
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/log-in');
  });
});

module.exports = router;
