/**
 * GoBet - Auth Middleware
 * Middleware för att skydda rutter som kräver autentisering
 */

const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

// Middleware som kontrollerar JWT-token
exports.protect = async (req, res, next) => {
  let token;
  
  // Kolla efter Authorization-header (Bearer token)
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Hämta token från header
    token = req.headers.authorization.split(' ')[1];
  } 
  // Kolla efter token i cookies
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  // Kolla sessionen
  else if (req.session && req.session.userId) {
    req.user = { id: req.session.userId };
    return next();
  }
  
  // Om ingen token finns
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Åtkomst nekad, inloggning krävs'
    });
  }
  
  try {
    // Verifiera token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Hämta användaren från databasen
    const [users] = await pool.query(
      'SELECT id FROM users WHERE id = ?',
      [decoded.id]
    );
    
    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Ogiltigt token, användaren finns inte'
      });
    }
    
    // Sätt user på request-objektet
    req.user = { id: users[0].id };
    next();
  } catch (error) {
    console.error('Auth middleware-fel:', error);
    return res.status(401).json({
      success: false,
      message: 'Åtkomst nekad, ogiltigt token'
    });
  }
};

// Middleware som kontrollerar användarroll
exports.authorize = (...roles) => {
  return async (req, res, next) => {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Åtkomst nekad, inloggning krävs'
      });
    }
    
    // Hämta användaren från databasen med rollinfo
    const [users] = await pool.query(
      'SELECT account_type FROM users WHERE id = ?',
      [req.user.id]
    );
    
    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Ogiltigt token, användaren finns inte'
      });
    }
    
    // Kolla om användaren har tillräcklig behörighet
    if (!roles.includes(users[0].account_type)) {
      return res.status(403).json({
        success: false,
        message: `Åtkomst nekad, ${users[0].account_type}-konto har inte tillräcklig behörighet`
      });
    }
    
    next();
  };
}; 