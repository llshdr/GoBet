const mongoose = require('mongoose');

const BetSchema = new mongoose.Schema({
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
  betType: {
    type: String,
    enum: ['public', 'friends', 'giveaway', 'sport'],
    required: [true, 'Typ av bet krävs']
  },
  entryFee: {
    type: {
      type: String,
      enum: ['free', 'gocoins', 'item'],
      default: 'free'
    },
    amount: {
      type: Number,
      default: 0
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      default: null
    }
  },
  prize: {
    type: {
      type: String,
      enum: ['gocoins', 'item', 'multiple'],
      required: [true, 'Pristyp krävs']
    },
    goCoins: {
      type: Number,
      default: 0
    },
    items: [{
      itemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item'
      },
      quantity: {
        type: Number,
        default: 1
      }
    }]
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    prediction: {
      type: String,
      default: null
    }
  }],
  maxParticipants: {
    type: Number,
    default: null
  },
  status: {
    type: String,
    enum: ['open', 'locked', 'completed', 'cancelled'],
    default: 'open'
  },
  visibleTo: {
    type: String,
    enum: ['all', 'friends', 'invite'],
    default: 'all'
  },
  invitedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  options: [{
    name: {
      type: String,
      required: true
    },
    odds: {
      type: Number,
      default: 1.0
    }
  }],
  outcome: {
    winner: {
      type: String,
      default: null
    },
    winningUsers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  expiresAt: {
    type: Date,
    required: [true, 'Utgångsdatum krävs']
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
BetSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Beräkna totalt prispott
BetSchema.methods.calculateTotalPrize = function() {
  let total = this.prize.goCoins;
  
  // Lägg till värdet av föremål om det finns
  if (this.prize.items && this.prize.items.length > 0) {
    // Notera: Detta skulle kräva en separat funktion för att hämta verkliga värden
    // av föremål, vilket skulle göras i en controller
  }
  
  return total;
};

// Kontrollera om en användare är en deltagare
BetSchema.methods.isParticipant = function(userId) {
  return this.participants.some(p => p.user.toString() === userId.toString());
};

// Kontrollera om betet är öppet för fler deltagare
BetSchema.methods.isOpen = function() {
  return (
    this.status === 'open' && 
    (this.maxParticipants === null || this.participants.length < this.maxParticipants) &&
    new Date() < this.expiresAt
  );
};

module.exports = mongoose.model('Bet', BetSchema); 