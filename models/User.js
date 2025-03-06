const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Användarnamn krävs'],
    unique: true,
    trim: true,
    minlength: [3, 'Användarnamnet måste vara minst 3 tecken'],
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
    minlength: [6, 'Lösenordet måste vara minst 6 tecken'],
    select: false
  },
  balance: {
    type: Number,
    default: 0
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  bets: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bet'
  }]
});

// Kryptera lösenord före sparande
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Jämför lösenord
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema); 