/**
 * GoBet - Express Server
 * Huvudapplikationsfilen för backend
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');
const morgan = require('morgan');
const helmet = require('helmet');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const { testConnection } = require('./config/db');
const { isLoggedIn } = require('./middleware/auth');

// Routes
const userRoutes = require('./routes/userRoutes');
const friendRoutes = require('./routes/friendRoutes');
const authRoutes = require('./routes/auth');

// Ladda miljövariabler
dotenv.config();

// Initiera Express-app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Testa databasanslutning
testConnection().catch(console.error);

// Middleware
app.use(helmet({ contentSecurityPolicy: false })); // Säkerhetsheaders, CSP av för enklare utveckling
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true // Tillåt cookies med CORS
}));
app.use(express.json()); // Tolka JSON-data
app.use(express.urlencoded({ extended: true })); // Tolka URL-encoded data
app.use(cookieParser()); // Tolka cookies
app.use(morgan('dev')); // Loggning

// Sessionskonfiguration
app.use(session({
  secret: process.env.SESSION_SECRET || 'gobet_session_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production', 
    httpOnly: true,
    maxAge: parseInt(process.env.SESSION_EXPIRE || 30 * 24 * 60 * 60 * 1000) // 30 dagar default
  }
}));

// Anslut till MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/gobet', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB ansluten'))
.catch(err => {
  console.error('MongoDB anslutningsfel:', err);
  // Fortsätt köra appen även utan databas för demo
});

// API-rutter
app.use('/api/users', userRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/auth', authRoutes);

// Temporära demo-API för frontend-utveckling
app.get('/api/bets/public', (req, res) => {
  res.json({
    success: true,
    bets: [
      {
        id: '1',
        title: 'CS2 Turnering Final',
        description: 'Vem kommer att vinna finalen i Stockholm Major?',
        creator: {
          id: '101',
          username: 'BettingKing',
          avatar: 'default-avatar.png'
        },
        betType: 'public',
        options: [
          { name: 'NAVI', odds: 2.5 },
          { name: 'FaZe', odds: 1.8 }
        ],
        prize: {
          type: 'gocoins',
          amount: 5000
        },
        participants: 128,
        expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 dagar från nu
      },
      {
        id: '2',
        title: 'Fortnite Solo Match',
        description: 'Vem kommer få flest elimineringar i nästa match?',
        creator: {
          id: '102',
          username: 'FortniteGuru',
          avatar: 'default-avatar.png'
        },
        betType: 'public',
        options: [
          { name: 'FortniteGuru', odds: 3.2 },
          { name: 'BuildMaster99', odds: 1.5 }
        ],
        prize: {
          type: 'item',
          itemName: 'Legendary Skin'
        },
        participants: 75,
        expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000) // 6 timmar från nu
      }
    ]
  });
});

app.get('/api/giveaways', (req, res) => {
  res.json({
    success: true,
    giveaways: [
      {
        id: '1',
        title: 'CS2 Kniv Giveaway',
        creator: {
          id: '103',
          username: 'GenerousGamer',
          avatar: 'default-avatar.png'
        },
        prize: {
          name: 'Butterfly Knife | Fade',
          value: 15000
        },
        participants: 156,
        expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 dagar från nu
      }
    ]
  });
});

// Socket.io realtidskommunikation
io.on('connection', (socket) => {
  console.log('Ny klient ansluten', socket.id);

  // Hantera anslutning till ett rum (bet eller giveaway)
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`Klient ${socket.id} ansluten till rum ${roomId}`);
  });

  // Skicka uppdateringar när nya bets skapas
  socket.on('new-bet', (betData) => {
    io.emit('bet-added', betData);
  });

  // Hantera uppdatering av odds
  socket.on('update-odds', (data) => {
    io.to(data.betId).emit('odds-updated', data);
  });

  // Hantera när ett bet avslutas
  socket.on('bet-completed', (data) => {
    io.to(data.betId).emit('bet-result', data);
  });

  // Skicka chattmeddelanden i ett rum
  socket.on('chat-message', (data) => {
    io.to(data.roomId).emit('new-message', {
      user: data.user,
      message: data.message,
      timestamp: new Date()
    });
  });

  // Hantera frånkoppling
  socket.on('disconnect', () => {
    console.log('Klient frånkopplad', socket.id);
  });
});

// Servera frontend för alla övriga rutter
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Root-rutt för att kolla att servern är igång
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'GoBet API är igång',
    timestamp: new Date().toISOString()
  });
});

// Hantera 404 för API-rutter
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Resursen kunde inte hittas'
  });
});

// Felhantering
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  
  // Kontrollera om det är en API-route
  if (req.originalUrl.startsWith('/api')) {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: err.message || 'Ett serverfel inträffade',
      error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  } else {
    // För icke-API routes, visa ett enkelt felmeddelande
    res.status(500).send('Ett serverfel inträffade');
  }
});

// Starta servern
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server igång på port ${PORT}`);
  console.log(`API tillgänglig på http://localhost:${PORT}/api`);
}); 