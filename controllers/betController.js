const Bet = require('../models/Bet');
const User = require('../models/User');

// @desc    Placera ett spel
// @route   POST /api/bets
// @access  Private
exports.placeBet = async (req, res) => {
  try {
    const { matchId, team1, team2, prediction, odds, stake } = req.body;

    if (!matchId || !team1 || !team2 || !prediction || !odds || !stake) {
      return res.status(400).json({
        success: false,
        message: 'Alla fält är obligatoriska'
      });
    }

    // Kontrollera att användaren har tillräckligt med saldo
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Användare inte hittad'
      });
    }

    if (user.balance < stake) {
      return res.status(400).json({
        success: false,
        message: 'Otillräckligt saldo'
      });
    }

    // Beräkna potentiell vinst
    const potentialWinnings = (parseFloat(stake) * parseFloat(odds)).toFixed(2);

    // Skapa spelet
    const bet = await Bet.create({
      user: req.user.id,
      match: {
        matchId,
        team1,
        team2
      },
      prediction,
      odds,
      stake,
      potentialWinnings
    });

    // Uppdatera användarens saldo
    user.balance -= parseFloat(stake);
    user.bets.push(bet._id);
    await user.save();

    res.status(201).json({
      success: true,
      bet,
      balance: user.balance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Serverfel',
      error: error.message
    });
  }
};

// @desc    Hämta användarens spel
// @route   GET /api/bets
// @access  Private
exports.getUserBets = async (req, res) => {
  try {
    const bets = await Bet.find({ user: req.user.id }).sort({ placedAt: -1 });

    res.status(200).json({
      success: true,
      count: bets.length,
      bets
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Serverfel',
      error: error.message
    });
  }
};

// @desc    Hämta ett specifikt spel
// @route   GET /api/bets/:id
// @access  Private
exports.getBetById = async (req, res) => {
  try {
    const bet = await Bet.findById(req.params.id);

    if (!bet) {
      return res.status(404).json({
        success: false,
        message: 'Spel inte hittat'
      });
    }

    // Kontrollera att spelet tillhör användaren
    if (bet.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Du har inte behörighet att se detta spel'
      });
    }

    res.status(200).json({
      success: true,
      bet
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Serverfel',
      error: error.message
    });
  }
};

// @desc    Uppdatera spel (endast för administratörer)
// @route   PUT /api/bets/:id
// @access  Private (Admin)
exports.updateBet = async (req, res) => {
  try {
    let bet = await Bet.findById(req.params.id);

    if (!bet) {
      return res.status(404).json({
        success: false,
        message: 'Spel inte hittat'
      });
    }

    // Kontrollera admin-behörighet
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Du har inte behörighet att uppdatera spel'
      });
    }

    const { status, result } = req.body;

    // Uppdatera spelet
    bet.status = status || bet.status;
    bet.result = result || bet.result;

    await bet.save();

    // Om spelet är vunnet, uppdatera användarens saldo
    if (status === 'won') {
      const user = await User.findById(bet.user);
      user.balance += parseFloat(bet.potentialWinnings);
      await user.save();
    }

    res.status(200).json({
      success: true,
      bet
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Serverfel',
      error: error.message
    });
  }
}; 