# GoBet

En modern betting-plattform där användare kan lägga spel på sportevenemang.

## Funktioner

- Realtidsoddssystem
- Användarkonton med saldo
- Matchstatistik och resultat
- Mobilvänligt gränssnitt
- Säker betalningsintegration

## Teknisk Stack

- Frontend: React, HTML5, CSS3
- Backend: Node.js, Express
- Databas: MongoDB
- Realtidsuppdateringar: Socket.io

## Installation

1. Klona repositoryt:
   ```
   git clone https://github.com/llshdr/GoBet.git
   ```

2. Installera beroenden:
   ```
   cd GoBet
   npm install
   ```

3. Starta utvecklingsservern:
   ```
   npm start
   ```

4. Besök `http://localhost:3000` i din webbläsare

## API-dokumentation

API-endpoints:
- `GET /api/odds` - Hämta aktuella odds
- `POST /api/bets` - Placera ett spel
- `GET /api/user/balance` - Hämta användarens saldo

## Bidrag

Bidrag till projektet är välkomna! Skapa en fork och skicka en pull request.
