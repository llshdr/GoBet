# GoBet

En social plattform för att skapa och delta i betting-utmaningar med dina vänner.

## Funktioner

- Skapa och delta i bets med vänner
- Betta med GoCoins eller in-game-föremål
- Winner-takes-all bets, turneringsbets och mer
- Lyckohjul med priser
- Vänlista
- Användarprofiler
- Olika prenumerationsplaner

## E-postverifiering

GoBet använder nu en äkta e-postverifiering för nya användare. När en användare registrerar sig skickas en 6-siffrig verifikationskod till deras e-postadress.

### Konfigurera e-post (med SendGrid)

För att konfigurera e-postutskick, följ dessa steg:

1. Registrera dig för ett [SendGrid-konto](https://sendgrid.com/) (du får 100 gratis mail per dag)
2. Skapa en API-nyckel i SendGrid-dashboarden
3. Kopiera API-nyckeln och lägg till den i `.env.local` och i Vercel-miljövariablerna:
   ```
   EMAIL_PASSWORD=din_sendgrid_api_nyckel
   ```

4. (Valfritt) Verifiera din egen domän i SendGrid för bättre leveransgrad

### Andra e-posttjänster

Vill du använda en annan e-posttjänst? Ändra följande i `.env.local` och på Vercel:

```
EMAIL_HOST=din_smtp_server
EMAIL_PORT=din_smtp_port
EMAIL_USER=din_smtp_användare
EMAIL_PASSWORD=ditt_smtp_lösenord
EMAIL_FROM=din_från_adress
```

## Driftsätta på Vercel

1. Pusha dina ändringar till GitHub
2. Koppla Vercel till ditt GitHub-repository
3. Lägg till följande miljövariabel i Vercel:
   - `EMAIL_PASSWORD`: Din SendGrid API-nyckel

Vercel kommer automatiskt att bygga och driftsätta din applikation med både frontend och serverless functions.

## Lokal utveckling

1. Klona repository:
   ```
   git clone https://github.com/yourusername/gobet.git
   ```

2. Installera beroenden:
   ```
   npm install
   ```

3. Skapa en `.env.local` fil med dina e-postinställningar

4. Starta utvecklingsservern:
   ```
   npm run dev
   ```

5. Öppna [http://localhost:3000](http://localhost:3000) i din webbläsare

## Licens

Detta projekt är licensierat under MIT-licensen. 