const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const router = express.Router();

// Middleware to protect dashboard
function isAuth(req, res, next) {
  if (req.session.userId) {
    next();
  } else {
    res.redirect('/login');
  }
}

// GET Register
router.get('/register', (req, res) => {
  res.render('register');
});

// POST Register
router.post('/register', async (req, res) => {
  const { fullName, email, password, confirmPassword } = req.body;
  if (password !== confirmPassword) return res.send('Passwords do not match');
  
  const hashedPassword = await bcrypt.hash(password, 12);
  try {
    const user = new User({ fullName, email, password: hashedPassword });
    await user.save();
    res.redirect('/login');
  } catch (err) {
    res.send('User already exists or error occurred');
  }
});

// GET Login
router.get('/login', (req, res) => {
  res.render('login');
});

// POST Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.send('Invalid email');

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.send('Incorrect password');

  req.session.userId = user._id;
  res.redirect('/dashboard');
});

// GET Dashboard
router.get('/dashboard', isAuth, async (req, res) => {
  const user = await User.findById(req.session.userId);
  res.render('dashboard', { user });
});

// GET Logout
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

module.exports = router;
