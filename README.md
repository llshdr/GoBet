# GoBet

GoBet är en plattform för vänskapliga vadslagningar med virtuell valuta.

## Installation

### Förutsättningar

För att köra GoBet behöver du:

- Node.js (v14 eller senare)
- MySQL (v8 eller senare)

### Steg för att installera

1. Klona repot:
```bash
git clone https://github.com/llshdr/GoBet.git
cd GoBet
```

2. Installera frontend-beroenden:
```bash
npm install
```

3. Installera backend-beroenden:
```bash
cd server
npm install
```

4. Konfigurera MySQL:
   - Skapa en databas och användare för GoBet
   - Uppdatera inställningarna i `server/.env`

```
DB_HOST=localhost
DB_USER=gobet_user
DB_PASSWORD=ditt_lösenord
DB_NAME=gobet
```

5. Kör databas-setup:
```bash
npm run setup-db
```

Detta kommer att skapa databasen, tabellerna och lägga till exempeldata.

## Starta applikationen

### Utvecklingsläge

1. Starta backend-servern:
```bash
cd server
npm run dev
```

2. Öppna en annan terminal och starta frontend-servern:
```bash
npm run dev
```

3. Besök applikationen på http://localhost:3000

### Produktionsläge

1. Bygg frontend:
```bash
npm run build
```

2. Starta servern:
```bash
cd server
npm start
```

## Inloggningsuppgifter för testanvändare

Du kan använda följande inloggningsuppgifter för att testa:

- Admin: `admin@gobet.com` / `admin123`
- Testanvändare: `kalle@exempel.se` / `password123`

## API-dokumentation

### Autentisering

#### Registrera användare
```
POST /api/auth/register
```

Parametrar:
- `username`: Användarnamn
- `email`: E-post
- `password`: Lösenord
- `firstName`: (valfritt) Förnamn
- `lastName`: (valfritt) Efternamn

#### Logga in
```
POST /api/auth/login
```

Parametrar:
- `email`: E-post
- `password`: Lösenord

#### Logga ut
```
POST /api/auth/logout
```

#### Hämta inloggad användare
```
GET /api/auth/me
```

## Utveckling

### Mappstruktur

- `public/` - Frontend-filer
  - `css/` - Stilmallar
  - `js/` - JavaScript-filer
  - `images/` - Bilder
- `server/` - Backend-kod
  - `config/` - Konfigurationsfiler
  - `controllers/` - API-controllers
  - `middleware/` - Middleware-funktioner
  - `routes/` - API-rutter

## Licens

Denna programvara är skyddad av upphovsrätt. 