const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// @desc    Registrera användare
// @route   POST /api/users/register
// @access  Public
exports.registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Kontrollera om användaren redan finns
    const userExists = await User.findOne({ $or: [{ email }, { username }] });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: userExists.email === email 
          ? 'E-postadressen är redan registrerad' 
          : 'Användarnamnet är redan taget'
      });
    }

    // Skapa användare
    const user = await User.create({
      username,
      email,
      password
    });

    // Skapa JWT
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        goCoins: user.goCoins,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Registeringsfel:', error);
    res.status(500).json({
      success: false,
      message: 'Serverfel vid registrering',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Logga in användare
// @route   POST /api/users/login
// @access  Public
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validera indata
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Var god ange både e-postadress och lösenord'
      });
    }

    // Hitta användaren
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Felaktig e-postadress eller lösenord'
      });
    }

    // Verifiera lösenord
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Felaktig e-postadress eller lösenord'
      });
    }

    // Uppdatera senaste aktivitet
    user.lastActive = Date.now();
    await user.save();

    // Skapa JWT
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        goCoins: user.goCoins,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Inloggningsfel:', error);
    res.status(500).json({
      success: false,
      message: 'Serverfel vid inloggning',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Hämta aktuell användares profil
// @route   GET /api/users/profile
// @access  Private
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-__v')
      .populate('friends', 'username avatar lastActive');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Användare hittades inte'
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        goCoins: user.goCoins,
        avatar: user.avatar,
        friends: user.friends,
        steamId: user.steamId,
        epicId: user.epicId,
        betsCreated: user.betsCreated,
        betsJoined: user.betsJoined,
        createdAt: user.createdAt,
        lastActive: user.lastActive
      }
    });
  } catch (error) {
    console.error('Fel vid hämtning av profil:', error);
    res.status(500).json({
      success: false,
      message: 'Serverfel vid hämtning av profil',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Uppdatera användarprofil
// @route   PUT /api/users/profile
// @access  Private
exports.updateUserProfile = async (req, res) => {
  try {
    const { username, email, avatar } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Användare hittades inte'
      });
    }

    // Kontrollera om användarnamnet är taget (om användaren försöker byta)
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Användarnamnet är redan taget'
        });
      }
      user.username = username;
    }

    // Kontrollera om e-postadressen är tagen (om användaren försöker byta)
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'E-postadressen är redan registrerad'
        });
      }
      user.email = email;
    }

    if (avatar) {
      user.avatar = avatar;
    }

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        goCoins: updatedUser.goCoins,
        avatar: updatedUser.avatar
      }
    });
  } catch (error) {
    console.error('Fel vid uppdatering av profil:', error);
    res.status(500).json({
      success: false,
      message: 'Serverfel vid uppdatering av profil',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Koppla Steam-konto
// @route   POST /api/users/connect/steam
// @access  Private
exports.connectSteam = async (req, res) => {
  try {
    const { steamId } = req.body;

    if (!steamId) {
      return res.status(400).json({
        success: false,
        message: 'Steam-ID krävs'
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Användare hittades inte'
      });
    }

    user.steamId = steamId;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Steam-konto kopplat framgångsrikt',
      steamId
    });
  } catch (error) {
    console.error('Fel vid koppling av Steam-konto:', error);
    res.status(500).json({
      success: false,
      message: 'Serverfel vid koppling av Steam-konto',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Koppla Epic Games-konto
// @route   POST /api/users/connect/epic
// @access  Private
exports.connectEpic = async (req, res) => {
  try {
    const { epicId } = req.body;

    if (!epicId) {
      return res.status(400).json({
        success: false,
        message: 'Epic Games-ID krävs'
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Användare hittades inte'
      });
    }

    user.epicId = epicId;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Epic Games-konto kopplat framgångsrikt',
      epicId
    });
  } catch (error) {
    console.error('Fel vid koppling av Epic Games-konto:', error);
    res.status(500).json({
      success: false,
      message: 'Serverfel vid koppling av Epic Games-konto',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Generera JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
}; 