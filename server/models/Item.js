const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Föremålsnamn krävs'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Beskrivning krävs']
  },
  imageUrl: {
    type: String,
    required: [true, 'Bild-URL krävs']
  },
  type: {
    type: String,
    required: [true, 'Föremålstyp krävs'],
    enum: ['skin', 'weapon', 'character', 'accessory', 'emote', 'other']
  },
  game: {
    type: String,
    required: [true, 'Spel krävs'],
    enum: ['cs2', 'fortnite', 'dota2', 'lol', 'valorant', 'other']
  },
  platform: {
    type: String,
    required: [true, 'Plattform krävs'],
    enum: ['steam', 'epic', 'riot', 'origin', 'other']
  },
  rarity: {
    type: String,
    enum: ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic', 'unique'],
    default: 'common'
  },
  marketValue: {
    goCoins: {
      type: Number,
      required: [true, 'Värde i GoCoins krävs'],
      min: [0, 'Värde kan inte vara negativt']
    },
    realCurrency: {
      type: Number,
      default: 0
    }
  },
  externalId: {
    type: String,
    default: null
  },
  tradable: {
    type: Boolean,
    default: true
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
ItemSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Item', ItemSchema); 