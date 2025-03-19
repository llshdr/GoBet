-- GoBet Databasschemat
-- Skapar databasen och alla tabeller som behövs för GoBet-plattformen

-- Skapa databasen om den inte finns
CREATE DATABASE IF NOT EXISTS gobet CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Använd databasen
USE gobet;

-- Användartabell
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(100),
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  avatar_url VARCHAR(255),
  coins INT NOT NULL DEFAULT 1000,
  account_type ENUM('user', 'admin', 'moderator') NOT NULL DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Sessionstabell för att spara användarsessioner
CREATE TABLE IF NOT EXISTS sessions (
  id VARCHAR(191) PRIMARY KEY,
  user_id INT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  payload TEXT NOT NULL,
  last_activity INT NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Vad (bet) tabell
CREATE TABLE IF NOT EXISTS bets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  creator_id INT NOT NULL,
  status ENUM('active', 'resolved', 'cancelled') NOT NULL DEFAULT 'active',
  category VARCHAR(50),
  odds DECIMAL(5,2) NOT NULL,
  min_bet INT NOT NULL DEFAULT 100,
  max_bet INT NOT NULL DEFAULT 5000,
  total_pool INT NOT NULL DEFAULT 0,
  total_bets INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME,
  resolved_at DATETIME,
  result VARCHAR(255),
  FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Vadslagningar från användare
CREATE TABLE IF NOT EXISTS user_bets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  bet_id INT NOT NULL,
  amount INT NOT NULL,
  prediction VARCHAR(255) NOT NULL,
  status ENUM('pending', 'won', 'lost', 'returned') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (bet_id) REFERENCES bets(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Transaktionstabell för att spåra alla ändringar i coins
CREATE TABLE IF NOT EXISTS transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  amount INT NOT NULL,
  balance_after INT NOT NULL,
  type ENUM('bet', 'win', 'deposit', 'withdraw', 'bonus', 'wheel') NOT NULL,
  reference_id INT,
  description VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Storad procedure för att lägga till exempeldata
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS create_sample_data()
BEGIN
  -- Kontrollera om det redan finns användare
  DECLARE user_count INT;
  SELECT COUNT(*) INTO user_count FROM users;
  
  -- Endast lägg till exempeldata om det inte finns användare
  IF user_count = 0 THEN
    -- Skapa admin-användare (lösenord: admin123)
    INSERT INTO users (username, email, password_hash, display_name, account_type, coins) VALUES 
    ('admin', 'admin@gobet.com', '$2b$10$RMxA3k4kGpK1WKA5GQFi5.rqdDkaQ1MG.RFN4OAPzXb.gn7.tg.G.', 'Admin', 'admin', 10000);
    
    -- Skapa några exempelanvändare (lösenord: password123)
    INSERT INTO users (username, email, password_hash, display_name, coins) VALUES 
    ('kalle', 'kalle@exempel.se', '$2b$10$9i7d7JmVzr.PeaJsW.hxrO5UYc9Yg.K.TrVT83t7SfcRkaY3aP6LC', 'Kalle Anka', 1500),
    ('anna', 'anna@exempel.se', '$2b$10$9i7d7JmVzr.PeaJsW.hxrO5UYc9Yg.K.TrVT83t7SfcRkaY3aP6LC', 'Anna Andersson', 2500),
    ('erik', 'erik@exempel.se', '$2b$10$9i7d7JmVzr.PeaJsW.hxrO5UYc9Yg.K.TrVT83t7SfcRkaY3aP6LC', 'Erik Eriksson', 800);
    
    -- Skapa några exempelvad
    INSERT INTO bets (title, description, creator_id, odds, category, expires_at) VALUES
    ('Sverige vs Finland', 'VM i ishockey, vem vinner matchen?', 1, 1.85, 'sport', DATE_ADD(NOW(), INTERVAL 7 DAY)),
    ('Kommer det regna på midsommarafton?', 'Spela på om det kommer regna i Stockholm på midsommarafton', 1, 2.10, 'väder', DATE_ADD(NOW(), INTERVAL 30 DAY)),
    ('Nobel 2023 - Litteratur', 'Vem kommer att vinna Nobelpriset i litteratur 2023?', 1, 3.50, 'kultur', DATE_ADD(NOW(), INTERVAL 60 DAY));
    
    -- Lägg till några vadslagningar
    INSERT INTO user_bets (user_id, bet_id, amount, prediction) VALUES
    (2, 1, 200, 'Sverige'),
    (3, 1, 350, 'Finland'),
    (4, 2, 150, 'Ja'),
    (2, 3, 100, 'Alice Munro');
    
    -- Uppdatera totala pooler
    UPDATE bets SET total_pool = 550, total_bets = 2 WHERE id = 1;
    UPDATE bets SET total_pool = 150, total_bets = 1 WHERE id = 2;
    UPDATE bets SET total_pool = 100, total_bets = 1 WHERE id = 3;
    
    -- Lägg till några transaktioner
    INSERT INTO transactions (user_id, amount, balance_after, type, reference_id, description) VALUES
    (2, -200, 1300, 'bet', 1, 'Vadslagning på Sverige vs Finland'),
    (3, -350, 2150, 'bet', 1, 'Vadslagning på Sverige vs Finland'),
    (4, -150, 650, 'bet', 2, 'Vadslagning på om det kommer regna'),
    (2, -100, 1200, 'bet', 3, 'Vadslagning på Nobelpriset 2023');
  END IF;
END //
DELIMITER ;

-- Kör proceduren för att lägga till exempeldata
CALL create_sample_data(); 