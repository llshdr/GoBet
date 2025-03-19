/**
 * GoBet - Databasanslutning
 * Ansvarar för databasanslutning och tillhandahåller en pool av anslutningar
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

// Skapa en pool av anslutningar
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'gobet_user',
  password: process.env.DB_PASSWORD || 'gobet_password',
  database: process.env.DB_NAME || 'gobet',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Testa anslutningen vid start
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Databasanslutning OK');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Kunde inte ansluta till databasen:', error.message);
    return false;
  }
}

module.exports = {
  pool,
  testConnection
}; 