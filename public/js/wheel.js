/**
 * GoBet - Wheel of Fortune
 */

document.addEventListener('DOMContentLoaded', () => {
  console.log('Wheel of Fortune initialized');
  
  // Initialisera komponenter
  initializeWheel();
  initializeButtons();
  initializePrizeModal();
  
  // Ladda användardata
  loadUserData();
});

/**
 * Ladda användardata från localStorage (skulle vara från server i en riktig app)
 */
function loadUserData() {
  // Simulera användarplan
  let userPlan = localStorage.getItem('gobet_user_plan') || 'free';
  
  // Uppdatera återstående snurr baserat på plan
  updateRemainingSpins(userPlan);
  
  // Simulera nedräkning till nästa gratis snurr
  simulateNextSpinCountdown();
}

/**
 * Uppdatera visning av återstående snurr
 */
function updateRemainingSpins(plan = 'free') {
  const remainingSpinsElement = document.getElementById('remainingSpins');
  
  // Simulera återstående snurr baserat på plan
  // I en riktig app skulle detta hämtas från servern
  let remainingSpins = localStorage.getItem('gobet_remaining_spins');
  
  if (remainingSpins === null) {
    // Initialisera med standardvärden om inget finns
    if (plan === 'premium') {
      remainingSpins = 3;
    } else if (plan === 'premium-plus') {
      remainingSpins = 5;
    } else {
      remainingSpins = 1;
    }
    localStorage.setItem('gobet_remaining_spins', remainingSpins);
  }
  
  if (remainingSpinsElement) {
    remainingSpinsElement.textContent = remainingSpins;
  }
  
  // Uppdatera knappstatus baserat på om det finns snurr kvar
  const spinButton = document.getElementById('spinButton');
  if (spinButton) {
    if (parseInt(remainingSpins) <= 0) {
      spinButton.disabled = true;
      spinButton.innerHTML = '<i class="fa-solid fa-lock"></i> SNURRA';
    } else {
      spinButton.disabled = false;
      spinButton.innerHTML = '<i class="fa-solid fa-play"></i> SNURRA';
    }
  }
}

/**
 * Simulera nedräkning till nästa gratis snurr
 */
function simulateNextSpinCountdown() {
  const nextSpinElement = document.getElementById('nextSpin');
  
  // Simulera en nedräkning (i en riktig app skulle detta vara kopplat till server-tid)
  // Ställ in en slumpmässig tid för demo
  const days = Math.floor(Math.random() * 6);
  const hours = Math.floor(Math.random() * 24);
  
  if (nextSpinElement) {
    nextSpinElement.textContent = `${days}d ${hours}h`;
  }
}

/**
 * Initialisera lyckohjulet med sektioner
 */
function initializeWheel() {
  const wheel = document.getElementById('wheel');
  if (!wheel) return;
  
  // Prisdata: pris, färg, sannolikhet
  const prizes = [
    { name: '250 GoCoins', color: '#ff7e47', probability: 20 },
    { name: '500 GoCoins', color: '#ffcc00', probability: 15 },
    { name: '1000 GoCoins', color: '#28a745', probability: 8 },
    { name: 'Premium 1 dag', color: '#007bff', probability: 5 },
    { name: 'Premium 1 vecka', color: '#6f42c1', probability: 2 },
    { name: 'Exklusiv Avatar', color: '#e83e8c', probability: 5 },
    { name: 'Sällsynt Item', color: '#dc3545', probability: 3 },
    { name: 'Tyvärr, inget', color: '#6c757d', probability: 42 }
  ];

  // Beräkna totala vikten för sannolikheter
  const totalProbability = prizes.reduce((sum, prize) => sum + prize.probability, 0);
  
  // Skapa sektioner
  prizes.forEach((prize, index) => {
    createWheelSection(wheel, prize, index, prizes.length);
  });
}

/**
 * Skapa en sektion på hjulet
 */
function createWheelSection(wheel, prize, index, totalSections) {
  const sectionAngle = 360 / totalSections;
  const section = document.createElement('div');
  section.className = 'wheel-section';
  section.style.backgroundColor = prize.color;
  section.style.transform = `rotate(${index * sectionAngle}deg)`;
  
  const content = document.createElement('div');
  content.className = 'wheel-section-content';
  content.textContent = prize.name;
  
  section.appendChild(content);
  wheel.appendChild(section);
  
  // Lagra prisdata
  section.dataset.prize = prize.name;
  section.dataset.probability = prize.probability;
}

/**
 * Initiera knappar
 */
function initializeButtons() {
  const spinButton = document.getElementById('spinButton');
  const buySpinButton = document.getElementById('buySpinButton');
  
  if (spinButton) {
    spinButton.addEventListener('click', () => {
      if (!spinButton.disabled) {
        spinWheel();
      }
    });
  }
  
  if (buySpinButton) {
    buySpinButton.addEventListener('click', buyAdditionalSpin);
  }
}

/**
 * Hantera köp av ytterligare snurr
 */
function buyAdditionalSpin() {
  // I en riktig app skulle detta vara kopplat till användarens konto och göra en serverförfrågan
  const userCoins = parseInt(localStorage.getItem('gobet_user_coins') || '5000');
  const userPlan = localStorage.getItem('gobet_user_plan') || 'free';
  
  // Kostnad baserat på plan
  let spinCost = 500; // Standard kostnad för gratisplan
  
  if (userPlan === 'premium') {
    spinCost = 350;
  } else if (userPlan === 'premium-plus') {
    spinCost = 200;
  }
  
  // Kontrollera om användaren har tillräckligt med mynt
  if (userCoins >= spinCost) {
    // Uppdatera användarens mynt
    const newCoinBalance = userCoins - spinCost;
    localStorage.setItem('gobet_user_coins', newCoinBalance);
    
    // Uppdatera återstående snurr
    const currentSpins = parseInt(localStorage.getItem('gobet_remaining_spins') || '0');
    localStorage.setItem('gobet_remaining_spins', currentSpins + 1);
    
    // Uppdatera UI
    updateRemainingSpins(userPlan);
    
    // Visa bekräftelsemeddelande
    alert(`Du har köpt ett extra snurr för ${spinCost} GoCoins!`);
  } else {
    alert('Du har inte tillräckligt med GoCoins för att köpa ett snurr. Köp mer eller uppgradera till Premium för rabatt!');
  }
}

/**
 * Snurra hjulet
 */
function spinWheel() {
  const wheel = document.getElementById('wheel');
  const spinButton = document.getElementById('spinButton');
  
  if (!wheel || !spinButton) return;
  
  // Inaktivera knappen under snurrning
  spinButton.disabled = true;
  
  // Hämta sektioner
  const sections = wheel.querySelectorAll('.wheel-section');
  const prizes = Array.from(sections).map(section => ({
    name: section.dataset.prize,
    probability: parseFloat(section.dataset.probability)
  }));
  
  // Välj en vinnande position baserat på sannolikhet
  const winner = selectWinnerBasedOnProbability(prizes);
  const winningIndex = prizes.findIndex(prize => prize.name === winner.name);
  
  // Beräkna rotationsvinkel
  const sectionAngle = 360 / sections.length;
  const randomExtraRotation = Math.floor(Math.random() * 360);
  const fullRotations = 5 * 360; // 5 hela varv
  
  // Beräkna slutposition för att pilen ska peka på vinnande sektion
  // Pilen pekar på toppen, så vi behöver rotera till motsatt position
  const winningAngle = (winningIndex * sectionAngle) + (sectionAngle / 2);
  const finalRotation = fullRotations + 360 - winningAngle + randomExtraRotation;
  
  // Sätt CSS custom property för animationen
  wheel.style.setProperty('--spin-degree', `${finalRotation}deg`);
  
  // Starta animationen
  wheel.classList.add('spinning');
  
  // Uppdatera återstående snurr
  const remainingSpins = parseInt(localStorage.getItem('gobet_remaining_spins') || '0');
  if (remainingSpins > 0) {
    localStorage.setItem('gobet_remaining_spins', remainingSpins - 1);
  }
  
  // Efter animation är klar, visa vinst
  setTimeout(() => {
    // Återställ hjulet för nästa spin
    wheel.classList.remove('spinning');
    wheel.style.transform = `rotate(${finalRotation}deg)`;
    
    // Uppdatera UI för återstående snurr
    updateRemainingSpins();
    
    // Visa vinstmodal
    showPrizeModal(winner.name);
  }, 5000); // 5 sekunder, samma som animationstiden
}

/**
 * Välj vinnare baserat på sannolikhet
 */
function selectWinnerBasedOnProbability(prizes) {
  // Beräkna total sannolikhet
  const totalProbability = prizes.reduce((sum, prize) => sum + prize.probability, 0);
  
  // Generera ett slumpmässigt tal mellan 0 och total sannolikhet
  const random = Math.random() * totalProbability;
  
  // Välj ett pris baserat på sannolikhet
  let cumulativeProbability = 0;
  for (const prize of prizes) {
    cumulativeProbability += prize.probability;
    if (random < cumulativeProbability) {
      return prize;
    }
  }
  
  // Fallback till första priset om något går fel
  return prizes[0];
}

/**
 * Initiera vinstmodalen
 */
function initializePrizeModal() {
  const modal = document.getElementById('prizeModal');
  const closeModalButton = document.querySelector('#prizeModal .close-modal');
  const claimPrizeButton = document.getElementById('claimPrize');
  
  if (closeModalButton) {
    closeModalButton.addEventListener('click', () => {
      modal.classList.remove('active');
    });
  }
  
  if (claimPrizeButton) {
    claimPrizeButton.addEventListener('click', () => {
      modal.classList.remove('active');
    });
  }
}

/**
 * Visa vinstmodalen
 */
function showPrizeModal(prizeName) {
  const modal = document.getElementById('prizeModal');
  const prizeAmountElement = document.getElementById('prizeAmount');
  
  if (!modal || !prizeAmountElement) return;
  
  // Sätt prisnamnet
  prizeAmountElement.textContent = prizeName;
  
  // Visa modalen
  modal.classList.add('active');
  
  // Uppdatera användarens konto med vinsten
  processPrize(prizeName);
}

/**
 * Bearbeta vinsten
 */
function processPrize(prizeName) {
  // I en riktig app skulle detta göras på serversidan
  // Här simulerar vi bara uppdatering av användarens data
  
  console.log(`Användaren vann: ${prizeName}`);
  
  // Uppdatera användarstatistik baserat på pris
  if (prizeName.includes('GoCoins')) {
    // Extrahera myntantal från prisnamnet
    const coinAmount = parseInt(prizeName.match(/\d+/)[0]);
    
    // Uppdatera användarens mynt
    const currentCoins = parseInt(localStorage.getItem('gobet_user_coins') || '5000');
    localStorage.setItem('gobet_user_coins', currentCoins + coinAmount);
  } 
  else if (prizeName.includes('Premium')) {
    // Simulera premium-uppgradering
    console.log('Premium-uppgradering tilldelad');
  }
  else if (prizeName.includes('Avatar')) {
    // Simulera avatar-belöning
    console.log('Avatar-belöning tilldelad');
  }
  else if (prizeName.includes('Item')) {
    // Simulera föremålsbelöning
    console.log('Sällsynt föremål tillagd i inventarium');
  }
} 