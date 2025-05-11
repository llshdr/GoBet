/**
 * GoBet - Auth Routes
 * Rutter för autentisering (login, registrering, etc)
 */

const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  logout,
  getMe 
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Auth-rutter
router.post('/register', register);
router.post('/login', login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

module.exports = router;
