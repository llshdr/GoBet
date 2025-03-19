# GoBet Server

Backend-servern för GoBet-plattformen.

## Installation och konfiguration

### 1. Installera beroenden

```bash
npm install
```

### 2. Konfigurera .env-filen

Kopiera `.env.example` till `.env` och ange dina DB-uppgifter:

```
# Server-inställningar
PORT=3000
NODE_ENV=development

# Databasanslutning
DB_HOST=localhost
DB_USER=gobet_user
DB_PASSWORD=ditt_lösenord  # Ändra detta
DB_NAME=gobet

# JWT (JSON Web Tokens)
JWT_SECRET=ändra_detta_till_en_säker_slumpmässig_sträng  # Ändra detta
JWT_EXPIRE=7d

# Session
SESSION_SECRET=ändra_även_denna_till_en_säker_slumpmässig_sträng  # Ändra detta
SESSION_EXPIRE=86400000 # 24 timmar i millisekunder
```

För produktion, generera säkra slumpmässiga strängar för hemligheterna.

### 3. Skapa databas och användare

Logga in på MySQL och kör:

```sql
CREATE USER 'gobet_user'@'localhost' IDENTIFIED BY 'ditt_lösenord';
CREATE DATABASE gobet CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
GRANT ALL PRIVILEGES ON gobet.* TO 'gobet_user'@'localhost';
FLUSH PRIVILEGES;
```

### 4. Kör setup-scriptet

För att skapa tabeller och lägga till exempeldata:

```bash
npm run setup-db
```

## API-rutter

### Autentisering

| Metod | Rutt | Beskrivning |
|-------|------|-------------|
| POST | /api/auth/register | Registrera ny användare |
| POST | /api/auth/login | Logga in användare |
| POST | /api/auth/logout | Logga ut användare |
| GET | /api/auth/me | Hämta inloggad användare |

### Användare

| Metod | Rutt | Beskrivning |
|-------|------|-------------|
| GET | /api/users | Hämta alla användare (admin) |
| GET | /api/users/:id | Hämta specifik användare |
| PUT | /api/users/:id | Uppdatera användare (endast egen profil eller admin) |

### Vad (bets)

| Metod | Rutt | Beskrivning |
|-------|------|-------------|
| POST | /api/bets | Skapa nytt vad |
| GET | /api/bets | Hämta alla vad |
| GET | /api/bets/:id | Hämta specifikt vad |
| PUT | /api/bets/:id | Uppdatera vad (endast skapare eller admin) |
| POST | /api/bets/:id/place | Lägg vad |

## Databasstruktur

### users
- id - AUTO_INCREMENT PRIMARY KEY
- username - VARCHAR(50) UNIQUE
- email - VARCHAR(100) UNIQUE
- password_hash - VARCHAR(255)
- display_name - VARCHAR(100)
- first_name - VARCHAR(50)
- last_name - VARCHAR(50)
- avatar_url - VARCHAR(255)
- coins - INT
- account_type - ENUM('user', 'admin', 'moderator')
- created_at - TIMESTAMP
- updated_at - TIMESTAMP

### sessions
- id - VARCHAR(191) PRIMARY KEY
- user_id - INT (FK to users.id)
- ip_address - VARCHAR(45)
- user_agent - TEXT
- payload - TEXT
- last_activity - INT
- expires_at - DATETIME
- created_at - TIMESTAMP

### bets
- id - AUTO_INCREMENT PRIMARY KEY
- title - VARCHAR(255)
- description - TEXT
- creator_id - INT (FK to users.id)
- status - ENUM('active', 'resolved', 'cancelled')
- category - VARCHAR(50)
- odds - DECIMAL(5,2)
- min_bet - INT
- max_bet - INT
- total_pool - INT
- total_bets - INT
- created_at - TIMESTAMP
- expires_at - DATETIME
- resolved_at - DATETIME
- result - VARCHAR(255)

### user_bets
- id - AUTO_INCREMENT PRIMARY KEY
- user_id - INT (FK to users.id)
- bet_id - INT (FK to bets.id)
- amount - INT
- prediction - VARCHAR(255)
- status - ENUM('pending', 'won', 'lost', 'returned')
- created_at - TIMESTAMP

### transactions
- id - AUTO_INCREMENT PRIMARY KEY
- user_id - INT (FK to users.id)
- amount - INT
- balance_after - INT
- type - ENUM('bet', 'win', 'deposit', 'withdraw', 'bonus', 'wheel')
- reference_id - INT
- description - VARCHAR(255)
- created_at - TIMESTAMP

## Development

Starta utvecklingsservern med:

```bash
npm run dev
```

Detta använder nodemon för att automatiskt starta om servern när du gör ändringar. 