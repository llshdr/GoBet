const User = require('../models/User');
const jwt = require('jsonwebtoken');

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
        message: 'Användarnamn eller e-post finns redan'
      });
    }

    // Skapa användare
    const user = await User.create({
      username,
      email,
      password,
      balance: 100 // Startbonus
    });

    // Skapa token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        balance: user.balance,
        role: user.role
      },
      token
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Serverfel',
      error: error.message
    });
  }
};

// @desc    Logga in användare
// @route   POST /api/users/login
// @access  Public
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Kontrollera att alla fält finns
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vänligen ange e-post och lösenord'
      });
    }

    // Kontrollera om användaren finns
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Ogiltiga inloggningsuppgifter'
      });
    }

    // Kontrollera om lösenordet är korrekt
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Ogiltiga inloggningsuppgifter'
      });
    }

    // Skapa token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        balance: user.balance,
        role: user.role
      },
      token
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Serverfel',
      error: error.message
    });
  }
};

// @desc    Hämta användarprofil
// @route   GET /api/users/profile
// @access  Private
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('bets');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Användare inte hittad'
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        balance: user.balance,
        role: user.role,
        bets: user.bets
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Serverfel',
      error: error.message
    });
  }
};

// @desc    Uppdatera saldo
// @route   PUT /api/users/balance
// @access  Private
exports.updateBalance = async (req, res) => {
  try {
    const { amount, type } = req.body;

    if (!amount || !type || !['deposit', 'withdraw'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Vänligen ange belopp och typ (deposit eller withdraw)'
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Användare inte hittad'
      });
    }

    if (type === 'deposit') {
      user.balance += Number(amount);
    } else if (type === 'withdraw') {
      if (user.balance < amount) {
        return res.status(400).json({
          success: false,
          message: 'Otillräckligt saldo'
        });
      }
      user.balance -= Number(amount);
    }

    await user.save();

    res.status(200).json({
      success: true,
      balance: user.balance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Serverfel',
      error: error.message
    });
  }
};

// Generera JWT-token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'devsecret', {
    expiresIn: '30d'
  });
}; 