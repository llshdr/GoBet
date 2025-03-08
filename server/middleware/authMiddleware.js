const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Skydda routes - kräver inloggning
exports.protect = async (req, res, next) => {
  let token;

  // Kontrollera om token finns i header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Hämta token från header
      token = req.headers.authorization.split(' ')[1];

      // Verifiera token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Hämta användare från databasen och lägg till i req-objektet
      req.user = await User.findById(decoded.id).select('-password');

      // Uppdatera användarens senaste aktivitet
      if (req.user) {
        req.user.lastActive = Date.now();
        await req.user.save({ validateBeforeSave: false });
      } else {
        return res.status(401).json({
          success: false,
          message: 'Användaren hittades inte'
        });
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({
        success: false,
        message: 'Du är inte behörig, ogiltigt token'
      });
    }
  } else {
    return res.status(401).json({
      success: false,
      message: 'Du är inte behörig, inget token tillhandahållet'
    });
  }
};

// Admin middleware
exports.admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Endast administratörer har behörighet att utföra denna åtgärd'
    });
  }
};

// Hantera frivillig autentisering (för offentliga rutter där användaruppgifter är valfri)
exports.optionalAuth = async (req, res, next) => {
  let token;

  // Kontrollera om token finns i header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Hämta token från header
      token = req.headers.authorization.split(' ')[1];

      // Verifiera token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Hämta användare från databasen och lägg till i req-objektet
      req.user = await User.findById(decoded.id).select('-password');

      // Uppdatera användarens senaste aktivitet
      if (req.user) {
        req.user.lastActive = Date.now();
        await req.user.save({ validateBeforeSave: false });
      }
    } catch (error) {
      // Ignorera fel - auktorisering är valfri
      console.log('Valfritt auth fel:', error.message);
    }
  }

  next();
}; 