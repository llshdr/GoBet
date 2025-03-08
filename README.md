# GoBet

En personlig betting-plattform där du kan betta med GoCoins, skins och andra virtuella föremål från olika spel.

## Funktioner

- **GoCoins-system**: Använd plattformens egen valuta för att betta
- **Vännersystem**: Lägg till vänner och skapa privata bets med dem
- **Spelintegrationer**: Integrerat med Steam, Epic Games och andra spelplattformar
- **Skinn-betting**: Betta med dina CS2-skins, Fortnite-skins och andra virtuella föremål
- **Flera bettyper**:
  - Offentliga bets - öppna för alla
  - Vännerbets - endast för dig och dina vänner
  - Giveaways - dela ut föremål till communityt
- **Flexibla valmöjligheter**: Välj om deltagare behöver betala för att gå med i bets
- **Traditionella bets**: Betta på fotbollsmatcher och andra sportevenemang

## Betting-typer

### Offentliga bets
Skapa bets öppna för hela communityt. Välj om det ska kosta att delta eller om det ska vara gratis.

### Vännerbets
Skapa privata bets med dina vänner. Perfekt för gruppspel eller utmaningar mellan vänner.

### Giveaways
Skapa giveaways för att dela ut föremål till communityt. Ställ in krav för deltagande.

## Integrerade plattformar

- **Steam**: Betta med CS2-skins, Dota 2-föremål, m.m.
- **Epic Games**: Använd Fortnite-skins och andra föremål från Epic Store
- **Esport**: Betta på CS2, League of Legends, Dota 2-matcher och mer
- **Traditionell sport**: Fotboll, basket, tennis och mer

## Teknisk information

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express
- Databas: MongoDB
- Realtidskommunikation: Socket.io
- Autentisering: JWT

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

3. Skapa en .env-fil med följande variabler:
   ```
   MONGO_URI=din_mongodb_connection_string
   JWT_SECRET=din_hemliga_nyckel
   PORT=3000
   ```

4. Starta servern:
   ```
   npm run dev
   ```

5. Besök `http://localhost:3000` i din webbläsare

## Licens

Detta projekt är licensierat under MIT-licensen. 