const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Skydda rutter - kräver inloggning
exports.protect = async (req, res, next) => {
  let token;

  // Kontrollera om token finns i Authorization-headern
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Hämta token från headern
      token = req.headers.authorization.split(' ')[1];

      // Verifiera token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'devsecret');

      // Hämta användarinformation (utan lösenord)
      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({
        success: false,
        message: 'Ej auktoriserad, token ogiltig'
      });
    }
  }

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Ej auktoriserad, ingen token'
    });
  }
};

// Admin-middleware
exports.admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Ej auktoriserad, endast för administratörer'
    });
  }
}; 