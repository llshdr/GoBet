/**
 * GoBet - Bet-hantering
 * Script för att hantera bet-skapande, deltagande och administration
 */

document.addEventListener('DOMContentLoaded', () => {
  console.log('Bet-hantering initialiserad');

  // Initialisera komponenter
  initBetCreation();
  initBetParticipation();
  initBetAdministration();
  initBetStatsUpdates();
});

/**
 * Initialisera bet-skapande
 */
function initBetCreation() {
  const createBetForm = document.querySelector('.create-bet-form');
  
  if (!createBetForm) return;
  
  createBetForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Hämta formulärvärden
    const title = document.getElementById('bet-title').value;
    const description = document.getElementById('bet-description').value;
    const amount = parseInt(document.getElementById('bet-amount').value);
    const endDate = new Date(document.getElementById('bet-end-date').value);
    
    // Hämta synlighet
    const visibilityInputs = document.querySelectorAll('input[name="bet-visibility"]');
    let visibility = '';
    visibilityInputs.forEach(input => {
      if (input.checked) {
        visibility = input.value;
      }
    });
    
    // Kontrollera om "Winner Takes All" är valt
    const isWinnerTakesAll = document.querySelector('.bet-type-button[data-bet-type="winner-takes-all"]').classList.contains('active');
    
    // Hämta alternativ
    const options = [];
    const optionInputs = document.querySelectorAll('.option-input');
    const oddsInputs = document.querySelectorAll('.odds-input');
    
    optionInputs.forEach((input, index) => {
      const optionText = input.value;
      const odds = isWinnerTakesAll ? 0 : parseFloat(oddsInputs[index].value);
      
      options.push({
        text: optionText,
        odds: odds
      });
    });
    
    // Validera formuläret
    if (!title || !description || !amount || !endDate) {
      showNotification('Vänligen fyll i alla obligatoriska fält.', 'error');
      return;
    }
    
    if (options.length < 2) {
      showNotification('Lägg till minst två alternativ för ditt bet.', 'error');
      return;
    }
    
    if (endDate <= new Date()) {
      showNotification('Slutdatumet måste vara i framtiden.', 'error');
      return;
    }
    
    // Skapa bet-objekt
    const newBet = {
      id: generateUniqueId(),
      title: title,
      description: description,
      amount: amount,
      endDate: endDate.toISOString(),
      creationDate: new Date().toISOString(),
      visibility: visibility,
      isWinnerTakesAll: isWinnerTakesAll,
      options: options,
      creatorId: getUserId(),
      creatorName: getUserDisplayName(),
      participants: [],
      status: 'active',
      winningOption: null
    };
    
    // Spara bettet i localStorage
    saveBet(newBet);
    
    // Uppdatera skaparens statistik
    updateUserStats('created', 0);
    
    // Visa bekräftelse
    showNotification('Bettet har skapats!', 'success');
    
    // Omdirigera till hemsidan efter en kort fördröjning
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1500);
  });
}

/**
 * Initialisera bet-deltagande
 */
function initBetParticipation() {
  const joinButtons = document.querySelectorAll('.btn-join');
  
  if (!joinButtons.length) return;
  
  joinButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Kontrollera om användaren är inloggad
      if (!isUserLoggedIn()) {
        showLoginPrompt();
        return;
      }
      
      const betCard = this.closest('.bet-card');
      if (!betCard) return;
      
      const betId = betCard.getAttribute('data-bet-id');
      const selectedOption = betCard.querySelector('.option.selected');
      
      if (!selectedOption) {
        showNotification('Välj ett alternativ först.', 'warning');
        return;
      }
      
      // Hämta bettet från localStorage
      const bet = getBetById(betId);
      if (!bet) {
        showNotification('Bettet kunde inte hittas.', 'error');
        return;
      }
      
      // Kontrollera om användaren redan har deltagit
      const userId = getUserId();
      if (bet.participants.some(p => p.userId === userId)) {
        showNotification('Du har redan deltagit i detta bet.', 'warning');
        return;
      }
      
      // Kontrollera saldo
      const userCoins = getUserCoins();
      if (userCoins < bet.amount) {
        showNotification('Du har inte tillräckligt med GoCoins för att delta.', 'error');
        return;
      }
      
      // Lägg till användaren som deltagare
      const optionIndex = parseInt(selectedOption.getAttribute('data-option-index'));
      const selectedOptionText = bet.options[optionIndex].text;
      
      bet.participants.push({
        userId: userId,
        username: getUserDisplayName(),
        optionIndex: optionIndex,
        optionText: selectedOptionText,
        amount: bet.amount,
        participationDate: new Date().toISOString()
      });
      
      // Uppdatera bettet i localStorage
      saveBet(bet);
      
      // Dra av kostnaden från användarens saldo
      updateUserCoins(-bet.amount);
      
      // Uppdatera användarens statistik
      updateUserStats('joined', 0);
      
      // Visa bekräftelse
      showNotification(`Du har satsat ${bet.amount} GoCoins på "${selectedOptionText}"!`, 'success');
      
      // Uppdatera gränssnittet
      updateBetCardUI(betCard, bet);
    });
  });
}

/**
 * Initialisera bet-administration
 */
function initBetAdministration() {
  // Hantera slutförande av bets (endast för skaparen)
  const completeButtons = document.querySelectorAll('.btn-complete-bet');
  
  if (!completeButtons.length) return;
  
  completeButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      
      const betCard = this.closest('.bet-card');
      if (!betCard) return;
      
      const betId = betCard.getAttribute('data-bet-id');
      
      // Visa dialog för att välja vinnande alternativ
      showCompleteDialog(betId);
    });
  });
}

/**
 * Visa dialog för att slutföra bet
 */
function showCompleteDialog(betId) {
  // Hämta bettet från localStorage
  const bet = getBetById(betId);
  if (!bet) {
    showNotification('Bettet kunde inte hittas.', 'error');
    return;
  }
  
  // Kontrollera att användaren är skapare av bettet
  if (bet.creatorId !== getUserId()) {
    showNotification('Endast skaparen av bettet kan slutföra det.', 'error');
    return;
  }
  
  // Skapa dialog
  const dialog = document.createElement('div');
  dialog.className = 'complete-bet-dialog';
  
  let optionsHtml = '';
  bet.options.forEach((option, index) => {
    optionsHtml += `
      <div class="dialog-option">
        <input type="radio" id="option-${index}" name="winning-option" value="${index}">
        <label for="option-${index}">${option.text}</label>
      </div>
    `;
  });
  
  dialog.innerHTML = `
    <div class="dialog-content">
      <h3>Slutför bet: ${bet.title}</h3>
      <p>Välj det vinnande alternativet:</p>
      
      <div class="dialog-options">
        ${optionsHtml}
      </div>
      
      <div class="dialog-actions">
        <button type="button" class="btn-cancel">Avbryt</button>
        <button type="button" class="btn-confirm">Bekräfta vinnare</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(dialog);
  
  // Hantera knapptryck
  dialog.querySelector('.btn-cancel').addEventListener('click', () => {
    dialog.remove();
  });
  
  dialog.querySelector('.btn-confirm').addEventListener('click', () => {
    const selectedOption = dialog.querySelector('input[name="winning-option"]:checked');
    
    if (!selectedOption) {
      showNotification('Välj ett vinnande alternativ.', 'warning');
      return;
    }
    
    const winningOptionIndex = parseInt(selectedOption.value);
    completeBet(betId, winningOptionIndex);
    
    dialog.remove();
  });
}

/**
 * Slutför ett bet och distribuera vinster
 */
function completeBet(betId, winningOptionIndex) {
  // Hämta bettet från localStorage
  const bet = getBetById(betId);
  if (!bet) {
    showNotification('Bettet kunde inte hittas.', 'error');
    return;
  }
  
  // Uppdatera bettets status
  bet.status = 'completed';
  bet.winningOption = winningOptionIndex;
  bet.completionDate = new Date().toISOString();
  
  // Distribuera vinster
  const winners = bet.participants.filter(p => p.optionIndex === winningOptionIndex);
  const totalParticipants = bet.participants.length;
  const totalPot = totalParticipants * bet.amount;
  
  if (winners.length > 0) {
    if (bet.isWinnerTakesAll) {
      // Winner Takes All: Dela potten lika mellan alla vinnare
      const winPerPerson = Math.floor(totalPot / winners.length);
      
      winners.forEach(winner => {
        // Ge vinsterna till användarna
        const userId = winner.userId;
        distributeWinnings(userId, winPerPerson);
        
        // Uppdatera användarens statistik
        updateUserStatsByUserId(userId, 'win', winPerPerson);
      });
    } else {
      // Standard bet: Varje vinnare får sin insats × odds
      winners.forEach(winner => {
        const userId = winner.userId;
        const winningOption = bet.options[winningOptionIndex];
        const winAmount = Math.floor(winner.amount * winningOption.odds);
        
        // Ge vinsterna till användarna
        distributeWinnings(userId, winAmount);
        
        // Uppdatera användarens statistik
        updateUserStatsByUserId(userId, 'win', winAmount);
      });
    }
    
    // Uppdatera statistik för förlorare
    const losers = bet.participants.filter(p => p.optionIndex !== winningOptionIndex);
    losers.forEach(loser => {
      updateUserStatsByUserId(loser.userId, 'loss', 0);
    });
  } else {
    // Ingen vann, återbetala insatserna
    bet.participants.forEach(participant => {
      distributeWinnings(participant.userId, participant.amount);
    });
  }
  
  // Spara uppdaterat bet
  saveBet(bet);
  
  // Visa bekräftelse
  showNotification('Bettet har slutförts och vinsterna har distribuerats!', 'success');
  
  // Uppdatera gränssnittet
  updateAllBetCardsUI();
}

/**
 * Uppdatera användarstatistik
 */
function initBetStatsUpdates() {
  // Uppdatera statistikvisning om vi är på profilsidan
  const statsElements = document.querySelectorAll('.profile-stats .stat-value');
  
  if (!statsElements.length) return;
  
  // Hämta användarens statistik
  const stats = getUserStats();
  
  // Uppdatera statistikvisning
  statsElements.forEach(element => {
    const statType = element.getAttribute('data-stat-type');
    
    if (statType && stats[statType] !== undefined) {
      element.textContent = stats[statType];
    }
  });
}

/**
 * Hjälpfunktioner för att hantera bets i localStorage
 */

function saveBet(bet) {
  // Hämta befintliga bets från localStorage
  const bets = JSON.parse(localStorage.getItem('gobet_bets') || '[]');
  
  // Kontrollera om bettet redan finns
  const existingIndex = bets.findIndex(b => b.id === bet.id);
  
  if (existingIndex !== -1) {
    // Uppdatera existerande bet
    bets[existingIndex] = bet;
  } else {
    // Lägg till nytt bet
    bets.push(bet);
  }
  
  // Spara tillbaka till localStorage
  localStorage.setItem('gobet_bets', JSON.stringify(bets));
}

function getBetById(betId) {
  const bets = JSON.parse(localStorage.getItem('gobet_bets') || '[]');
  return bets.find(b => b.id === betId);
}

function getAllBets() {
  return JSON.parse(localStorage.getItem('gobet_bets') || '[]');
}

function updateBetCardUI(betCard, bet) {
  // Denna funktion uppdaterar UI för ett bet-kort efter att en användare har deltagit
  if (!betCard) return;
  
  // Uppdatera antal deltagare
  const participantsCounter = betCard.querySelector('.participants-count');
  if (participantsCounter) {
    participantsCounter.textContent = bet.participants.length;
  }
  
  // Om det är Winner Takes All, uppdatera potentiell vinst
  if (bet.isWinnerTakesAll) {
    const potentialWinSpan = betCard.querySelector('.potential-win-amount');
    if (potentialWinSpan) {
      const totalPot = bet.participants.length * bet.amount;
      
      // Uppskatta antal vinnare (generellt 1, men kan vara fler)
      const selectedOption = betCard.querySelector('.option.selected');
      if (selectedOption) {
        const optionIndex = parseInt(selectedOption.getAttribute('data-option-index'));
        
        // Räkna deltagare som valt samma alternativ
        const sameChoiceCount = bet.participants.filter(p => p.optionIndex === optionIndex).length;
        
        // Beräkna potentiell vinst baserat på nuvarande deltagare
        // Om ingen annan har valt samma, anta att det bara är nuvarande användare
        const estimatedWinners = Math.max(1, sameChoiceCount);
        const potentialWin = Math.floor(totalPot / estimatedWinners);
        
        potentialWinSpan.textContent = potentialWin;
      }
    }
  }
  
  // Ändra knappen till "Du har satsat"
  const joinButton = betCard.querySelector('.btn-join');
  if (joinButton) {
    joinButton.textContent = 'Du har satsat';
    joinButton.classList.add('disabled');
    joinButton.disabled = true;
  }
}

function updateAllBetCardsUI() {
  // Uppdatera alla bet-kort på sidan
  const betCards = document.querySelectorAll('.bet-card');
  
  betCards.forEach(card => {
    const betId = card.getAttribute('data-bet-id');
    if (betId) {
      const bet = getBetById(betId);
      if (bet) {
        updateBetCardUI(card, bet);
      }
    }
  });
}

/**
 * Hjälpfunktioner för användarhantering
 */

function isUserLoggedIn() {
  return localStorage.getItem('gobet_logged_in') === 'true';
}

function getUserId() {
  const userData = JSON.parse(localStorage.getItem('gobet_user') || '{}');
  return userData.id || 'guest';
}

function getUserDisplayName() {
  const userData = JSON.parse(localStorage.getItem('gobet_user') || '{}');
  return userData.displayName || userData.username || 'Gäst';
}

function getUserCoins() {
  return parseInt(localStorage.getItem('gobet_user_coins') || '0');
}

function updateUserCoins(amount) {
  const currentCoins = getUserCoins();
  const newCoins = currentCoins + amount;
  localStorage.setItem('gobet_user_coins', newCoins.toString());
}

function getUserStats() {
  return JSON.parse(localStorage.getItem('gobet_user_stats') || '{}');
}

function updateUserStats(action, amount) {
  // Hämta nuvarande statistik
  const stats = getUserStats();
  
  // Uppdatera statistik baserat på action
  switch (action) {
    case 'created':
      stats.betsCreated = (stats.betsCreated || 0) + 1;
      break;
    case 'joined':
      stats.betsJoined = (stats.betsJoined || 0) + 1;
      break;
    case 'win':
      stats.betsWon = (stats.betsWon || 0) + 1;
      stats.totalWinnings = (stats.totalWinnings || 0) + amount;
      break;
    case 'loss':
      stats.betsLost = (stats.betsLost || 0) + 1;
      break;
  }
  
  // Räkna om vinstprocent
  const totalBets = (stats.betsWon || 0) + (stats.betsLost || 0);
  if (totalBets > 0) {
    stats.winPercentage = Math.round(((stats.betsWon || 0) / totalBets) * 100);
  }
  
  // Spara uppdaterad statistik
  localStorage.setItem('gobet_user_stats', JSON.stringify(stats));
}

function updateUserStatsByUserId(userId, action, amount) {
  // Om det är den aktuella användaren, använd den vanliga funktionen
  if (userId === getUserId()) {
    updateUserStats(action, amount);
    return;
  }
  
  // Annars behöver vi uppdatera statistik för en annan användare
  // Detta är en förenklad version, i en riktig app skulle detta hanteras av en server
  const allUsers = JSON.parse(localStorage.getItem('gobet_registered_users') || '[]');
  const userIndex = allUsers.findIndex(u => u.userData.id === userId);
  
  if (userIndex !== -1) {
    const user = allUsers[userIndex];
    
    // Hämta eller skapa statistik
    const stats = JSON.parse(localStorage.getItem(`gobet_user_stats_${userId}`) || '{}');
    
    // Uppdatera statistik baserat på action
    switch (action) {
      case 'win':
        stats.betsWon = (stats.betsWon || 0) + 1;
        stats.totalWinnings = (stats.totalWinnings || 0) + amount;
        break;
      case 'loss':
        stats.betsLost = (stats.betsLost || 0) + 1;
        break;
    }
    
    // Räkna om vinstprocent
    const totalBets = (stats.betsWon || 0) + (stats.betsLost || 0);
    if (totalBets > 0) {
      stats.winPercentage = Math.round(((stats.betsWon || 0) / totalBets) * 100);
    }
    
    // Spara uppdaterad statistik
    localStorage.setItem(`gobet_user_stats_${userId}`, JSON.stringify(stats));
  }
}

function distributeWinnings(userId, amount) {
  // Om det är den aktuella användaren, använd den vanliga funktionen
  if (userId === getUserId()) {
    updateUserCoins(amount);
    return;
  }
  
  // Annars behöver vi uppdatera saldo för en annan användare
  // Detta är en förenklad version, i en riktig app skulle detta hanteras av en server
  const allUsers = JSON.parse(localStorage.getItem('gobet_registered_users') || '[]');
  const userIndex = allUsers.findIndex(u => u.userData.id === userId);
  
  if (userIndex !== -1) {
    // Uppdatera användarens saldo
    const currentCoins = parseInt(localStorage.getItem(`gobet_user_coins_${userId}`) || '0');
    const newCoins = currentCoins + amount;
    localStorage.setItem(`gobet_user_coins_${userId}`, newCoins.toString());
  }
}

function showLoginPrompt() {
  showNotification('Du måste vara inloggad för att delta i bets.', 'warning');
  
  // Omdirigera till inloggningssidan efter en kort fördröjning
  setTimeout(() => {
    window.location.href = 'login.html';
  }, 1500);
}

function generateUniqueId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function showNotification(message, type = 'info') {
  // Visa en notifikation på skärmen
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  
  notification.innerHTML = `
    <div class="notification-icon">
      <i class="fa-solid ${getIconForType(type)}"></i>
    </div>
    <div class="notification-content">
      <p>${message}</p>
    </div>
    <button class="notification-close">
      <i class="fa-solid fa-xmark"></i>
    </button>
  `;
  
  document.body.appendChild(notification);
  
  // Animera in
  setTimeout(() => {
    notification.classList.add('active');
  }, 10);
  
  // Stängknapp
  const closeBtn = notification.querySelector('.notification-close');
  closeBtn.addEventListener('click', () => {
    notification.classList.remove('active');
    setTimeout(() => {
      notification.remove();
    }, 300);
  });
  
  // Auto-hide efter 5 sekunder
  setTimeout(() => {
    if (document.body.contains(notification)) {
      notification.classList.remove('active');
      setTimeout(() => {
        if (document.body.contains(notification)) {
          notification.remove();
        }
      }, 300);
    }
  }, 5000);
}

function getIconForType(type) {
  switch (type) {
    case 'success':
      return 'fa-circle-check';
    case 'error':
      return 'fa-circle-xmark';
    case 'warning':
      return 'fa-triangle-exclamation';
    case 'info':
    default:
      return 'fa-circle-info';
  }
} 