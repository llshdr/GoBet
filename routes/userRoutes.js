const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  getUserProfile, 
  updateBalance 
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Publika rutter
router.post('/register', registerUser);
router.post('/login', loginUser);

// Skyddade rutter (kräver inloggning)
router.get('/profile', protect, getUserProfile);
router.put('/balance', protect, updateBalance);

module.exports = router; 