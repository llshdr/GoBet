/**
 * GoBet - Auth Middleware
 * Middleware för att skydda rutter som kräver autentisering
 */

const jwt = require('jsonwebtoken');
const db = require('../config/db');
require('dotenv').config();

// Middleware för att skydda routes som kräver inloggning
exports.protect = async (req, res, next) => {
  let token;

  // Kontrollera att token skickades med
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    // Hämta token från Authorization header
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    // Hämta token från cookies
    token = req.cookies.token;
  } else if (req.session && req.session.userId) {
    // Om ingen token men sessionId finns, hämta användardata från session
    try {
      const [user] = await db.query(
        'SELECT id, username, email, role, balance FROM users WHERE id = ?',
        [req.session.userId]
      );

      if (user.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Du är inte inloggad. Vänligen logga in.'
        });
      }

      req.user = user[0];
      return next();
    } catch (error) {
      console.error('Session auth error:', error);
      return res.status(401).json({
        success: false,
        message: 'Du är inte inloggad. Vänligen logga in.'
      });
    }
  }

  // Om ingen autentiseringsmetod finns
  if (!token && !req.session.userId) {
    return res.status(401).json({
      success: false,
      message: 'Du är inte inloggad. Vänligen logga in.'
    });
  }

  // Om JWT token finns, verifiera och hämta användardata
  if (token) {
    try {
      // Verifiera token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Hämta användarinfo från databasen baserat på id i token
      const [user] = await db.query(
        'SELECT id, username, email, role, balance FROM users WHERE id = ?',
        [decoded.id]
      );

      if (user.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Ogiltig token. Vänligen logga in igen.'
        });
      }

      // Spara användardata i request
      req.user = user[0];
      next();
    } catch (error) {
      console.error('JWT auth error:', error);
      return res.status(401).json({
        success: false,
        message: 'Ogiltig token. Vänligen logga in igen.'
      });
    }
  }
};

// Middleware för att kontrollera användarroll
exports.authorize = (...roles) => {
  return (req, res, next) => {
    // Kontrollera om användaren finns och har rätt roll
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Du har inte behörighet att utföra denna åtgärd'
      });
    }
    next();
  };
};

// Middleware för att kontrollera om användaren är inloggad, men fortsätt oavsett
exports.isLoggedIn = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (req.session && req.session.userId) {
    try {
      const [user] = await db.query(
        'SELECT id, username, email, role, balance FROM users WHERE id = ?',
        [req.session.userId]
      );

      if (user.length > 0) {
        req.user = user[0];
        req.isLoggedIn = true;
      } else {
        req.isLoggedIn = false;
      }
      return next();
    } catch (error) {
      req.isLoggedIn = false;
      return next();
    }
  }

  if (!token && !req.session.userId) {
    req.isLoggedIn = false;
    return next();
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const [user] = await db.query(
        'SELECT id, username, email, role, balance FROM users WHERE id = ?',
        [decoded.id]
      );

      if (user.length > 0) {
        req.user = user[0];
        req.isLoggedIn = true;
      } else {
        req.isLoggedIn = false;
      }
    } catch (error) {
      req.isLoggedIn = false;
    }
  }

  next();
};

// Skapa JWT token för användare
exports.createToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// Validera och rensa användarinput (för att förhindra XSS)
exports.sanitizeUser = (user) => {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role || 'user',
    balance: user.balance || 0,
    createdAt: user.created_at
  };
};
