/**
 * GoBet - Auth Controller
 * Hanterar autentisering (login, registrering, etc)
 */

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const { createToken, sanitizeUser } = require('../middleware/auth');
require('dotenv').config();

// Registrera ny användare
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Validera input
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vänligen fyll i alla obligatoriska fält'
      });
    }
    
    // Kolla om användaren redan finns
    const [existingUsers] = await pool.query(
      'SELECT * FROM users WHERE email = ? OR username = ?',
      [email, username]
    );
    
    if (existingUsers.length > 0) {
      if (existingUsers[0].email === email) {
        return res.status(400).json({
          success: false,
          message: 'En användare med denna e-postadress finns redan'
        });
      } else {
        return res.status(400).json({
          success: false,
          message: 'Detta användarnamn är redan taget'
        });
      }
    }
    
    // Hasha lösenordet
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Skapa användaren i databasen
    const [result] = await pool.query(
      'INSERT INTO users (username, email, password, role, balance) VALUES (?, ?, ?, ?, ?)',
      [username, email, hashedPassword, 'user', 100] // Ge 100 GoCoins till nya användare
    );
    
    // Skapa JWT-token
    const token = createToken(result.insertId);
    
    // Skapa session
    const sessionId = await createSession(result.insertId, req.headers['user-agent']);
    
    // Sätt session cookie
    req.session.userId = result.insertId;
    
    // Hämta den nya användaren (utan lösenord)
    const [newUser] = await pool.query(
      'SELECT id, username, email, role, balance, created_at FROM users WHERE id = ?',
      [result.insertId]
    );
    
    // Skicka respons
    res.status(201).json({
      success: true,
      message: 'Registrering lyckades!',
      token,
      user: sanitizeUser(newUser[0])
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Ett fel uppstod vid registrering. Vänligen försök igen.'
    });
  }
};

// Logga in användare
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validera input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vänligen ange e-post och lösenord'
      });
    }
    
    // Hämta användaren
    const [users] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    
    // Kolla om användaren finns
    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Ogiltiga inloggningsuppgifter'
      });
    }
    
    const user = users[0];
    
    // Verifiera lösenordet
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Ogiltiga inloggningsuppgifter'
      });
    }
    
    // Skapa JWT-token
    const token = createToken(user.id);
    
    // Skapa session
    const sessionId = await createSession(user.id, req.headers['user-agent']);
    
    // Sätt session cookie
    req.session.userId = user.id;
    
    // Skicka respons
    res.status(200).json({
      success: true,
      message: 'Inloggning lyckades!',
      token,
      user: sanitizeUser(user)
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Ett fel uppstod vid inloggning. Vänligen försök igen.'
    });
  }
};

// Logga ut användare
exports.logout = async (req, res) => {
  try {
    // Rensa session
    if (req.session) {
      // Ta bort sessionen från databasen om vi har en användare
      if (req.user && req.user.id) {
        await pool.query(
          'DELETE FROM sessions WHERE user_id = ? AND user_agent = ?',
          [req.user.id, req.headers['user-agent'].substring(0, 255)]
        );
      }
      
      // Förstör sessionen
      req.session.destroy(err => {
        if (err) {
          console.error('Session destroy error:', err);
        }
      });
    }
    
    // Rensa cookies
    res.clearCookie('token');
    
    // Skicka respons
    res.status(200).json({
      success: true,
      message: 'Du har loggats ut'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Ett fel uppstod vid utloggning. Vänligen försök igen.'
    });
  }
};

// Hämta inloggad användare
exports.getMe = async (req, res) => {
  try {
    // req.user sätts av auth middleware
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Du är inte inloggad. Vänligen logga in.'
      });
    }
    
    // Hämta aktuell användardata
    const [users] = await pool.query(
      'SELECT id, username, email, role, balance, created_at FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Användaren hittades inte'
      });
    }
    
    // Skicka respons
    res.status(200).json({
      success: true,
      user: sanitizeUser(users[0])
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Ett fel uppstod vid hämtning av användardata'
    });
  }
};

/**
 * Skapa en ny session för en användare
 * @param {number} userId - Användarens ID
 * @param {string} userAgent - Användarens browser user agent
 * @return {Promise<string>} Session ID
 */
async function createSession(userId, userAgent = 'unknown') {
  try {
    // Generera ett unikt session ID
    const sessionId = require('crypto').randomBytes(64).toString('hex');
    
    // Sätt utgångsdatum till SESSION_EXPIRE dagar från nu
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + parseInt(process.env.SESSION_EXPIRE || 30));
    
    // Spara sessionen i databasen
    await pool.query(
      'INSERT INTO sessions (user_id, session_id, user_agent, expires_at) VALUES (?, ?, ?, ?)',
      [userId, sessionId, userAgent.substring(0, 255), expiresAt]
    );
    
    return sessionId;
  } catch (error) {
    console.error('Fel vid skapande av session:', error);
    throw new Error('Kunde inte skapa användarsession');
  }
}
