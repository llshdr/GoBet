/**
 * GoBet - Databasanslutning
 * Ansvarar för databasanslutning och tillhandahåller en pool av anslutningar
 */

const mysql = require("mysql2/promise");
require("dotenv").config();

// Skapa connection pool
const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "gobet",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Testa databasanslutningen
async function testConnection() {
  try {
    const connection = await db.getConnection();
    console.log("✅ Databasanslutning OK");
    connection.release();
    return true;
  } catch (error) {
    console.error("❌ Kunde inte ansluta till databasen:", error.message);
    return false;
  }
}

// Skapa tabeller om de inte finns
async function setupDatabase() {
  try {
    // Skapa users-tabell
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('user', 'admin') DEFAULT 'user',
        balance INT DEFAULT 100,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Skapa sessions-tabell
    await db.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        session_id VARCHAR(255) NOT NULL UNIQUE,
        user_agent VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Skapa bets-tabell
    await db.query(`
      CREATE TABLE IF NOT EXISTS bets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        creator_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        amount INT NOT NULL,
        is_private BOOLEAN DEFAULT FALSE,
        status ENUM('open', 'closed', 'settled') DEFAULT 'open',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        closes_at TIMESTAMP NOT NULL,
        FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Skapa bet_options-tabell
    await db.query(`
      CREATE TABLE IF NOT EXISTS bet_options (
        id INT AUTO_INCREMENT PRIMARY KEY,
        bet_id INT NOT NULL,
        option_text VARCHAR(255) NOT NULL,
        is_winner BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (bet_id) REFERENCES bets(id) ON DELETE CASCADE
      )
    `);

    // Skapa bet_participants-tabell
    await db.query(`
      CREATE TABLE IF NOT EXISTS bet_participants (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        bet_id INT NOT NULL,
        option_id INT NOT NULL,
        amount INT NOT NULL,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (bet_id) REFERENCES bets(id) ON DELETE CASCADE,
        FOREIGN KEY (option_id) REFERENCES bet_options(id) ON DELETE CASCADE,
        UNIQUE KEY unique_bet_user (bet_id, user_id)
      )
    `);

    // Skapa friends-tabell
    await db.query(`
      CREATE TABLE IF NOT EXISTS friends (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        friend_id INT NOT NULL,
        status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_friendship (user_id, friend_id)
      )
    `);
    
    // Skapa transactions-tabell
    await db.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        amount INT NOT NULL,
        type ENUM('bet', 'win', 'bonus', 'purchase') NOT NULL,
        description VARCHAR(255),
        reference_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    console.log('Databastabeller är uppdaterade!');
    return true;
  } catch (error) {
    console.error('Fel vid databasuppsättning:', error);
    return false;
  }
}

// Exportera databasanslutning och hjälpfunktioner
module.exports = db;
module.exports.testConnection = testConnection;
module.exports.setupDatabase = setupDatabase;
