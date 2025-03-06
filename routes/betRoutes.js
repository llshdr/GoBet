const express = require('express');
const router = express.Router();
const { 
  placeBet, 
  getUserBets, 
  getBetById, 
  updateBet 
} = require('../controllers/betController');
const { protect, admin } = require('../middleware/authMiddleware');

// Alla rutter är skyddade (kräver inloggning)
router.use(protect);

router.route('/')
  .post(placeBet)   // Placera ett spel
  .get(getUserBets); // Hämta användarens spel

router.route('/:id')
  .get(getBetById)      // Hämta specifikt spel
  .put(admin, updateBet); // Uppdatera spel (endast admin)

module.exports = router; 