const mongoose = require('mongoose');

const GiveawaySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Titel krävs'],
    trim: true,
    maxlength: [100, 'Titeln får inte vara längre än 100 tecken']
  },
  description: {
    type: String,
    required: [true, 'Beskrivning krävs'],
    maxlength: [1000, 'Beskrivningen får inte vara längre än 1000 tecken']
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  prizes: [{
    type: {
      type: String,
      enum: ['gocoins', 'item'],
      required: true
    },
    amount: {
      type: Number,
      default: 0
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      default: null
    },
    winnerIndex: {
      type: Number,
      default: -1 // -1 betyder att ingen vinnare har valts
    }
  }],
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  requirements: {
    minLevel: {
      type: Number,
      default: 0
    },
    followRequired: {
      type: Boolean,
      default: false
    },
    entryFee: {
      type: Number,
      default: 0 // 0 betyder gratis
    }
  },
  maxParticipants: {
    type: Number,
    default: null // null betyder obegränsat
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  visibleTo: {
    type: String,
    enum: ['all', 'friends'],
    default: 'all'
  },
  winners: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    prizeIndex: {
      type: Number
    },
    claimed: {
      type: Boolean,
      default: false
    }
  }],
  endsAt: {
    type: Date,
    required: [true, 'Slutdatum krävs']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Uppdatera updatedAt-fältet automatiskt
GiveawaySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Kontrollera om en giveaway är aktiv
GiveawaySchema.methods.isActive = function() {
  return (
    this.status === 'active' &&
    (this.maxParticipants === null || this.participants.length < this.maxParticipants) &&
    new Date() < this.endsAt
  );
};

// Välj slumpmässiga vinnare för giveaway
GiveawaySchema.methods.selectWinners = function() {
  if (this.participants.length === 0) {
    return [];
  }
  
  const winners = [];
  const selectedUsers = new Set();
  
  // För varje pris, välj en vinnare
  for (let i = 0; i < this.prizes.length; i++) {
    // Om det inte finns fler deltagare att välja
    if (selectedUsers.size >= this.participants.length) {
      break;
    }
    
    let randomIndex;
    let attempts = 0;
    const maxAttempts = this.participants.length * 2;
    
    // Försök hitta en ny användare som inte redan är vald
    do {
      randomIndex = Math.floor(Math.random() * this.participants.length);
      attempts++;
    } while (
      selectedUsers.has(randomIndex) && 
      attempts < maxAttempts
    );
    
    // Om vi inte kunde hitta en ny användare efter många försök, bryt loopen
    if (attempts >= maxAttempts) {
      break;
    }
    
    selectedUsers.add(randomIndex);
    
    // Lägg till vinnaren
    winners.push({
      user: this.participants[randomIndex].user,
      prizeIndex: i,
      claimed: false
    });
    
    // Uppdatera även priset med vinnarindex
    this.prizes[i].winnerIndex = randomIndex;
  }
  
  this.winners = winners;
  this.status = 'completed';
  
  return winners;
};

module.exports = mongoose.model('Giveaway', GiveawaySchema); 