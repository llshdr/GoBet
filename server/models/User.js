const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Användarnamn krävs'],
    unique: true,
    trim: true,
    minlength: [3, 'Användarnamnet måste vara minst 3 tecken långt'],
    maxlength: [20, 'Användarnamnet får inte vara längre än 20 tecken']
  },
  email: {
    type: String,
    required: [true, 'E-post krävs'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Ange en giltig e-postadress'
    ]
  },
  password: {
    type: String,
    required: [true, 'Lösenord krävs'],
    minlength: [6, 'Lösenordet måste vara minst 6 tecken långt'],
    select: false
  },
  avatar: {
    type: String,
    default: 'default-avatar.png'
  },
  goCoins: {
    type: Number,
    default: 1000 // Nya användare får 1000 GoCoins att starta med
  },
  steamId: {
    type: String,
    default: null
  },
  epicId: {
    type: String,
    default: null
  },
  friends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  friendRequests: [{
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  inventory: [{
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item'
    },
    quantity: {
      type: Number,
      default: 1
    }
  }],
  betsCreated: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bet'
  }],
  betsJoined: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bet'
  }],
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
});

// Kryptera lösenord innan det sparas
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Metod för att jämföra lösenord
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Metod för att lägga till GoCoins
UserSchema.methods.addGoCoins = function(amount) {
  this.goCoins += amount;
  return this.save();
};

// Metod för att dra av GoCoins
UserSchema.methods.subtractGoCoins = function(amount) {
  if (this.goCoins < amount) {
    throw new Error('Otillräckligt saldo');
  }
  
  this.goCoins -= amount;
  return this.save();
};

module.exports = mongoose.model('User', UserSchema); 