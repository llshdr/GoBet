/**
 * GoBet - Auth Controller
 * Hanterar autentisering (login, registrering, etc)
 */

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// Registrera ny användare
exports.register = async (req, res) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;
    
    // Kontrollera om användaren redan finns
    const [existingUsers] = await pool.query(
      'SELECT id FROM users WHERE username = ? OR email = ?', 
      [username, email]
    );
    
    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Användarnamn eller e-post används redan'
      });
    }
    
    // Kryptera lösenord
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Skapa display name
    const displayName = firstName && lastName 
      ? `${firstName} ${lastName}`
      : username;
    
    // Skapa användare
    const [result] = await pool.query(
      `INSERT INTO users (username, email, password_hash, first_name, last_name, display_name) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [username, email, hashedPassword, firstName || null, lastName || null, displayName]
    );
    
    // Skapa JWT token
    const token = jwt.sign(
      { id: result.insertId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );
    
    // Hämta användarinfo (utan lösenord)
    const [newUser] = await pool.query(
      'SELECT id, username, email, display_name, avatar_url, coins, account_type FROM users WHERE id = ?',
      [result.insertId]
    );
    
    // Sätt session
    await createSession(req, newUser[0].id);
    
    res.status(201).json({
      success: true,
      message: 'Konto skapat',
      data: {
        user: newUser[0],
        token
      }
    });
  } catch (error) {
    console.error('Registreringsfel:', error);
    res.status(500).json({
      success: false,
      message: 'Ett serverfel inträffade vid registrering',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Logga in användare
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Hämta användare
    const [users] = await pool.query(
      'SELECT id, username, email, display_name, password_hash, avatar_url, coins, account_type FROM users WHERE email = ?',
      [email]
    );
    
    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Ogiltiga inloggningsuppgifter'
      });
    }
    
    const user = users[0];
    
    // Verifiera lösenord
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Ogiltiga inloggningsuppgifter'
      });
    }
    
    // Skapa token
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );
    
    // Ta bort lösenord från respons
    delete user.password_hash;
    
    // Sätt session
    await createSession(req, user.id);
    
    res.status(200).json({
      success: true,
      message: 'Inloggning lyckades',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    console.error('Inloggningsfel:', error);
    res.status(500).json({
      success: false,
      message: 'Ett serverfel inträffade vid inloggning',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Logga ut användare
exports.logout = async (req, res) => {
  try {
    // Rensa sessionen
    if (req.session) {
      const sessionId = req.session.id;
      await pool.query('DELETE FROM sessions WHERE id = ?', [sessionId]);
      req.session.destroy();
    }
    
    res.status(200).json({
      success: true,
      message: 'Utloggning lyckades'
    });
  } catch (error) {
    console.error('Utloggningsfel:', error);
    res.status(500).json({
      success: false,
      message: 'Ett serverfel inträffade vid utloggning',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Hämta inloggad användare
exports.getMe = async (req, res) => {
  try {
    // Om användaren är inloggad via JWT hämtas användar-ID från req.user
    // annars från sessionen
    const userId = req.user?.id || (req.session?.userId);
    
    if (!userId) {
      return res.status(200).json({
        success: true,
        loggedIn: false
      });
    }
    
    // Hämta användare från databasen
    const [users] = await pool.query(
      'SELECT id, username, email, display_name, avatar_url, coins, account_type FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(200).json({
        success: true,
        loggedIn: false
      });
    }
    
    res.status(200).json({
      success: true,
      loggedIn: true,
      data: {
        user: users[0]
      }
    });
  } catch (error) {
    console.error('Fel vid hämtning av användare:', error);
    res.status(500).json({
      success: false,
      message: 'Ett serverfel inträffade',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Skapa session i databasen
async function createSession(req, userId) {
  if (!req.session) return;
  
  const sessionId = req.session.id || uuidv4();
  const expires = new Date(Date.now() + parseInt(process.env.SESSION_EXPIRE || 86400000));
  
  // Spara session i databasen
  await pool.query(
    `INSERT INTO sessions (id, user_id, ip_address, user_agent, payload, last_activity, expires_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE 
     user_id = VALUES(user_id), 
     ip_address = VALUES(ip_address),
     user_agent = VALUES(user_agent),
     payload = VALUES(payload),
     last_activity = VALUES(last_activity),
     expires_at = VALUES(expires_at)`,
    [
      sessionId,
      userId,
      req.ip || '',
      req.get('user-agent') || '',
      JSON.stringify(req.session),
      Math.floor(Date.now() / 1000),
      expires
    ]
  );
  
  // Sätt användar-ID i sessionen
  req.session.userId = userId;
} 