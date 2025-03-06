// GoBet - Betting Application

// Import modules
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Ladda miljövariabler
dotenv.config();

// Importera routes
const userRoutes = require('./routes/userRoutes');
const betRoutes = require('./routes/betRoutes');

// Initialize the app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Anslut till MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/gobet', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB ansluten'))
.catch(err => {
  console.error('MongoDB anslutningsfel:', err);
  // Fortsätt köra appen även utan databas för demosyfte
});

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/bets', betRoutes);

// Demo API-route för odds (används i frontend)
app.get('/api/odds', (req, res) => {
  res.json({
    matches: [
      { id: 1, team1: 'Manchester United', team2: 'Liverpool', odds1: 2.5, oddsX: 3.2, odds2: 2.8 },
      { id: 2, team1: 'Barcelona', team2: 'Real Madrid', odds1: 1.9, oddsX: 3.5, odds2: 3.1 },
      { id: 3, team1: 'Bayern Munich', team2: 'Dortmund', odds1: 1.7, oddsX: 3.8, odds2: 4.2 }
    ]
  });
});

// Servera frontend för icke-API rutter
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
});

// Felhanterare för 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Resursen hittades inte'
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`GoBet server körs på port ${PORT}`);
});