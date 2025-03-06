const mongoose = require('mongoose');

const BetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  match: {
    matchId: {
      type: Number,
      required: true
    },
    team1: {
      type: String,
      required: true
    },
    team2: {
      type: String,
      required: true
    },
    league: {
      type: String,
      default: 'Okänd liga'
    },
    startTime: {
      type: Date,
      default: Date.now
    }
  },
  stake: {
    type: Number,
    required: [true, 'Insats krävs'],
    min: [10, 'Minsta insats är 10 kr']
  },
  odds: {
    type: Number,
    required: true,
    min: [1.01, 'Lägsta odds är 1.01']
  },
  prediction: {
    type: String,
    enum: ['1', 'X', '2'],
    required: true
  },
  potentialWinnings: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'won', 'lost', 'cancelled'],
    default: 'pending'
  },
  result: {
    type: String,
    enum: ['1', 'X', '2', null],
    default: null
  },
  placedAt: {
    type: Date,
    default: Date.now
  }
});

// Beräkna potentiell vinst
BetSchema.pre('save', function(next) {
  if (this.isModified('stake') || this.isModified('odds')) {
    this.potentialWinnings = (this.stake * this.odds).toFixed(2);
  }
  next();
});

module.exports = mongoose.model('Bet', BetSchema); 