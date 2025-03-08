const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  connectSteam,
  connectEpic
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Publika rutter
router.post('/register', registerUser);
router.post('/login', loginUser);

// Skyddade rutter (kräver inloggning)
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// Koppla externa spelkonton
router.post('/connect/steam', protect, connectSteam);
router.post('/connect/epic', protect, connectEpic);

module.exports = router; 