/**
 * GoBet - Database Setup Script
 * Kör detta skript för att skapa databasen och initiera tabeller
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setupDatabase() {
  console.log('🔄 Initierar databasinstallation...');
  
  let connection;
  
  try {
    // Anslut till MySQL-servern (utan att specificera databas)
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'gobet_user',
      password: process.env.DB_PASSWORD || 'gobet_password',
      multipleStatements: true // Viktig för att köra flera SQL-statements
    });
    
    console.log('✅ Ansluten till MySQL-servern');
    
    // Läs in SQL-skriptet
    const sqlScript = fs.readFileSync(
      path.join(__dirname, 'database.sql'),
      'utf8'
    );
    
    // Kör SQL-skriptet
    console.log('🔄 Kör SQL-skript...');
    await connection.query(sqlScript);
    console.log('✅ Databas och tabeller skapade');
    
    // Anslut till den nya databasen
    await connection.query(`USE ${process.env.DB_NAME || 'gobet'}`);
    
    // Skapa exempeldata om det finns en stored procedure för det
    try {
      console.log('🔄 Lägger till exempeldata...');
      await connection.query('CALL create_sample_data()');
      console.log('✅ Exempeldata tillagd');
    } catch (error) {
      console.warn('⚠️ Kunde inte lägga till exempeldata (kanske finns den redan):', error.message);
    }
    
    console.log('🎉 Databasinstallation slutförd!');
    console.log('\nDatabasen är nu redo för användning.');
    console.log('Du kan nu köra servern med: npm start');
    
  } catch (error) {
    console.error('❌ Fel vid databasinstallation:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('📌 Databasanslutning stängd');
    }
  }
}

// Kör installationsfunktionen
setupDatabase(); 