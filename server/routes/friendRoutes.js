const express = require('express');
const router = express.Router();
const {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  getFriends,
  getFriendRequests,
  searchUsers
} = require('../controllers/friendController');
const { protect } = require('../middleware/authMiddleware');

// Alla rutter kräver autentisering
router.use(protect);

// Hämta vänner och skicka förfrågningar
router.route('/')
  .get(getFriends);

// Hantera vänförfrågningar
router.get('/requests', getFriendRequests);
router.post('/request/:userId', sendFriendRequest);
router.post('/accept/:userId', acceptFriendRequest);
router.post('/reject/:userId', rejectFriendRequest);

// Ta bort vän
router.delete('/:userId', removeFriend);

// Sök efter användare
router.get('/search', searchUsers);

module.exports = router; 