const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');

// Routes
const userRoutes = require('./routes/userRoutes');
const friendRoutes = require('./routes/friendRoutes');

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

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

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
  res.sendFile(path.resolve(__dirname, '../public', 'index.html'));
});

// Starta servern
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`GoBet-servern körs på port ${PORT}`);
}); 