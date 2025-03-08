const User = require('../models/User');

// @desc    Skicka vänförfrågan
// @route   POST /api/friends/request/:userId
// @access  Private
exports.sendFriendRequest = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    const targetUser = await User.findById(req.params.userId);

    // Kontrollera att användaren finns
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'Användaren hittades inte'
      });
    }

    // Kontrollera att användaren inte försöker lägga till sig själv
    if (req.user.id === req.params.userId) {
      return res.status(400).json({
        success: false,
        message: 'Du kan inte lägga till dig själv som vän'
      });
    }

    // Kontrollera om de redan är vänner
    if (currentUser.friends.includes(req.params.userId)) {
      return res.status(400).json({
        success: false,
        message: 'Ni är redan vänner'
      });
    }

    // Kontrollera om förfrågan redan har skickats
    const requestExists = targetUser.friendRequests.find(
      req => req.from.toString() === currentUser._id.toString()
    );

    if (requestExists) {
      return res.status(400).json({
        success: false,
        message: 'Vänförfrågan har redan skickats'
      });
    }

    // Lägg till vänförfrågan
    targetUser.friendRequests.push({
      from: currentUser._id,
      createdAt: Date.now()
    });

    await targetUser.save();

    res.status(200).json({
      success: true,
      message: `Vänförfrågan skickad till ${targetUser.username}`
    });
  } catch (error) {
    console.error('Fel vid skickande av vänförfrågan:', error);
    res.status(500).json({
      success: false,
      message: 'Serverfel vid skickande av vänförfrågan',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Acceptera vänförfrågan
// @route   POST /api/friends/accept/:userId
// @access  Private
exports.acceptFriendRequest = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    const requestingUser = await User.findById(req.params.userId);

    // Kontrollera att användaren finns
    if (!requestingUser) {
      return res.status(404).json({
        success: false,
        message: 'Användaren hittades inte'
      });
    }

    // Hitta vänförfrågan
    const requestIndex = currentUser.friendRequests.findIndex(
      req => req.from.toString() === requestingUser._id.toString()
    );

    // Kontrollera om förfrågan finns
    if (requestIndex === -1) {
      return res.status(400).json({
        success: false,
        message: 'Ingen vänförfrågan hittades från denna användare'
      });
    }

    // Ta bort förfrågan
    currentUser.friendRequests.splice(requestIndex, 1);

    // Lägg till varandra som vänner
    currentUser.friends.push(requestingUser._id);
    requestingUser.friends.push(currentUser._id);

    await Promise.all([currentUser.save(), requestingUser.save()]);

    res.status(200).json({
      success: true,
      message: `Du och ${requestingUser.username} är nu vänner`,
      friend: {
        id: requestingUser._id,
        username: requestingUser.username,
        avatar: requestingUser.avatar,
        lastActive: requestingUser.lastActive
      }
    });
  } catch (error) {
    console.error('Fel vid accepterande av vänförfrågan:', error);
    res.status(500).json({
      success: false,
      message: 'Serverfel vid accepterande av vänförfrågan',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Avvisa vänförfrågan
// @route   POST /api/friends/reject/:userId
// @access  Private
exports.rejectFriendRequest = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    const requestingUser = await User.findById(req.params.userId);

    // Kontrollera att användaren finns
    if (!requestingUser) {
      return res.status(404).json({
        success: false,
        message: 'Användaren hittades inte'
      });
    }

    // Hitta vänförfrågan
    const requestIndex = currentUser.friendRequests.findIndex(
      req => req.from.toString() === requestingUser._id.toString()
    );

    // Kontrollera om förfrågan finns
    if (requestIndex === -1) {
      return res.status(400).json({
        success: false,
        message: 'Ingen vänförfrågan hittades från denna användare'
      });
    }

    // Ta bort förfrågan
    currentUser.friendRequests.splice(requestIndex, 1);
    await currentUser.save();

    res.status(200).json({
      success: true,
      message: `Vänförfrågan från ${requestingUser.username} avvisades`
    });
  } catch (error) {
    console.error('Fel vid avvisande av vänförfrågan:', error);
    res.status(500).json({
      success: false,
      message: 'Serverfel vid avvisande av vänförfrågan',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Ta bort vän
// @route   DELETE /api/friends/:userId
// @access  Private
exports.removeFriend = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    const friendUser = await User.findById(req.params.userId);

    // Kontrollera att användaren finns
    if (!friendUser) {
      return res.status(404).json({
        success: false,
        message: 'Användaren hittades inte'
      });
    }

    // Kontrollera om de är vänner
    if (!currentUser.friends.includes(req.params.userId)) {
      return res.status(400).json({
        success: false,
        message: 'Ni är inte vänner'
      });
    }

    // Ta bort varandra från vänlistor
    currentUser.friends = currentUser.friends.filter(
      friend => friend.toString() !== friendUser._id.toString()
    );
    
    friendUser.friends = friendUser.friends.filter(
      friend => friend.toString() !== currentUser._id.toString()
    );

    await Promise.all([currentUser.save(), friendUser.save()]);

    res.status(200).json({
      success: true,
      message: `${friendUser.username} togs bort från din vänlista`
    });
  } catch (error) {
    console.error('Fel vid borttagning av vän:', error);
    res.status(500).json({
      success: false,
      message: 'Serverfel vid borttagning av vän',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Hämta alla vänner
// @route   GET /api/friends
// @access  Private
exports.getFriends = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('friends', 'username avatar lastActive')
      .select('friends');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Användaren hittades inte'
      });
    }

    res.status(200).json({
      success: true,
      count: user.friends.length,
      friends: user.friends
    });
  } catch (error) {
    console.error('Fel vid hämtning av vänner:', error);
    res.status(500).json({
      success: false,
      message: 'Serverfel vid hämtning av vänner',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Hämta inkommande vänförfrågningar
// @route   GET /api/friends/requests
// @access  Private
exports.getFriendRequests = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('friendRequests.from', 'username avatar')
      .select('friendRequests');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Användaren hittades inte'
      });
    }

    res.status(200).json({
      success: true,
      count: user.friendRequests.length,
      requests: user.friendRequests
    });
  } catch (error) {
    console.error('Fel vid hämtning av vänförfrågningar:', error);
    res.status(500).json({
      success: false,
      message: 'Serverfel vid hämtning av vänförfrågningar',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Sök efter användare
// @route   GET /api/friends/search
// @access  Private
exports.searchUsers = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Sökfråga krävs'
      });
    }

    // Sök efter användare med liknande användarnamn (case-insensitive)
    const users = await User.find({
      username: { $regex: query, $options: 'i' },
      _id: { $ne: req.user.id } // Exkludera den inloggade användaren
    })
      .select('username avatar')
      .limit(10);

    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error('Fel vid sökning efter användare:', error);
    res.status(500).json({
      success: false,
      message: 'Serverfel vid sökning efter användare',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}; 