/**
 * GoBet - Wheel of Fortune
 */

document.addEventListener('DOMContentLoaded', () => {
  console.log('Wheel of Fortune initialized');
  
  // Kontrollera inloggningsstatus först
  if (checkLoginRequired()) {
    // Bara initialisera hjulet om användaren är inloggad
    initializeWheel();
    checkWheelRendering();
    initializeButtons();
    initializePrizeModal();
    
    // Ladda användardata
    loadUserData();
  }
});

/**
 * Kontrollera om användaren måste vara inloggad
 */
function checkLoginRequired() {
  const isLoggedIn = localStorage.getItem('gobet_logged_in') === 'true';
  
  if (!isLoggedIn) {
    console.log('User not logged in, wheel functionality is limited');
    // Här behöver vi inte göra något eftersom main.js redan hanterar
    // att lägga till varningsmeddelande och begränsa funktionalitet
    return false;
  }
  
  return true;
}

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
  if (!wheel) {
    console.error('Wheel element not found!');
    return;
  }
  
  // Rensa eventuella befintliga sektioner
  wheel.innerHTML = '';
  
  // Prizes array with probability and value
  const prizes = [
    { type: 'coins', value: 50, probability: 20, color: '#ff7e47', icon: 'fa-coins' },
    { type: 'coins', value: 100, probability: 15, color: '#ffcc00', icon: 'fa-coins' },
    { type: 'coins', value: 200, probability: 10, color: '#28a745', icon: 'fa-coins' },
    { type: 'premium', value: '1 dag', probability: 5, color: '#007bff', icon: 'fa-crown' },
    { type: 'premium-plus', value: '1 dag', probability: 3, color: '#6f42c1', icon: 'fa-crown' },
    { type: 'avatar', value: 'Ny Avatar', probability: 5, color: '#e83e8c', icon: 'fa-user-circle' },
    { type: 'item', value: 'Specialitem', probability: 2, color: '#dc3545', icon: 'fa-gift' },
    { type: 'nothing', value: 'Bättre lycka nästa gång', probability: 40, color: '#6c757d', icon: 'fa-times-circle' }
  ];

  // Beräkna totala vikten för sannolikheter
  const totalProbability = prizes.reduce((sum, prize) => sum + prize.probability, 0);
  
  // Skapa sektioner
  prizes.forEach((prize, index) => {
    createWheelSection(wheel, prize, index, prizes.length);
  });
  
  // Bekräfta att sektionerna skapades
  const sectionCount = wheel.querySelectorAll('.wheel-slice').length;
  console.log(`Wheel initialized with ${sectionCount} sections`);
  
  // Sätt en grundläggande rotation för att se till att hjulet börjar i rätt position
  wheel.style.transform = 'rotate(0deg)';
}

/**
 * Skapa ett nytt hjulsegment
 */
function createWheelSection(wheel, prize, index, totalSections) {
  // Beräkna andelen av hjulet baserat på sannolikhet
  const totalProbability = 100; // Alla sannolikheter summerar till 100
  const sectionAngle = (prize.probability / totalProbability) * 360;
  
  // Beräkna startvinkel baserat på föregående sektioner
  let startAngle = 0;
  for (let i = 0; i < index; i++) {
    const prevPrize = wheel.children[i]?.dataset;
    if (prevPrize && prevPrize.probability) {
      startAngle += (parseFloat(prevPrize.probability) / totalProbability) * 360;
    }
  }
  
  const section = document.createElement('div');
  section.className = 'wheel-slice';
  section.style.backgroundColor = prize.color;
  section.style.transform = `rotate(${startAngle}deg)`;
  
  // Anpassa bredd baserat på sektionsstorlek
  section.style.width = '50%';
  section.style.height = '50%';
  
  // Skapa innehåll med både text och ikon
  const content = document.createElement('div');
  content.className = 'wheel-slice-content';
  
  // Lägg till en ikon som representerar priset
  const icon = document.createElement('i');
  icon.className = `fas ${prize.icon}`;
  content.appendChild(icon);
  
  const prizeText = document.createElement('span');
  if (prize.type === 'coins') {
    prizeText.textContent = `${prize.value} GoCoins`;
  } else if (prize.type === 'premium' || prize.type === 'premium-plus') {
    prizeText.textContent = `${prize.type === 'premium' ? 'Premium' : 'Premium+'} ${prize.value}`;
  } else if (prize.type === 'nothing') {
    prizeText.textContent = 'Inget';
  } else {
    prizeText.textContent = prize.value;
  }
  content.appendChild(prizeText);
  
  section.appendChild(content);
  wheel.appendChild(section);
  
  // Lagra prisdata och vinkel
  section.dataset.type = prize.type;
  section.dataset.value = prize.value;
  section.dataset.probability = prize.probability;
  section.dataset.angle = sectionAngle;
  section.dataset.startAngle = startAngle;
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
  const sections = wheel.querySelectorAll('.wheel-slice');
  const prizes = Array.from(sections).map(section => ({
    name: section.dataset.type,
    probability: parseFloat(section.dataset.probability),
    angle: parseFloat(section.dataset.angle),
    startAngle: parseFloat(section.dataset.startAngle)
  }));
  
  // Välj en vinnande position baserat på sannolikhet
  const winner = selectWinnerBasedOnProbability(prizes);
  
  // Beräkna rotationsvinkel för att landa på den vinnande sektionen
  // Vi behöver rikta pekaren mot mitten av den vinnande sektionen
  const sectionMidpointAngle = winner.startAngle + (winner.angle / 2);
  
  // Antal varv som ska snurras (minst 5) plus positionen
  const fullRotations = 5 * 360; // 5 hela varv
  const randomExtraRotation = Math.floor(Math.random() * 30) - 15; // ± 15 grader slumpmässig variation
  
  // Beräkna slutposition för att pilen ska peka på vinnande sektion
  // Pilen pekar på toppen, så vi behöver rotera till motsatt position
  const finalRotation = fullRotations + 360 - sectionMidpointAngle + randomExtraRotation;
  
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
    showWinModal(winner);
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
function showWinModal(prize) {
  const modalTitle = document.querySelector('#prizeModal .modal-title');
  const modalBody = document.querySelector('#prizeModal .modal-body');
  
  // Create prize win content
  let content = `
    <div class="prize-win">
      <div class="prize-icon">
        <i class="fas ${prize.icon}"></i>
      </div>
      <h2>Grattis!</h2>
  `;
  
  // Customize message based on prize type
  if (prize.type === 'coins') {
    content += `<p>Du har vunnit <strong>${prize.value} GoCoins</strong>!</p>`;
  } else if (prize.type === 'premium' || prize.type === 'premium-plus') {
    content += `<p>Du har vunnit <strong>${prize.value} ${prize.type === 'premium' ? 'Premium' : 'Premium Plus'}</strong>!</p>`;
  } else if (prize.type === 'avatar') {
    content += `<p>Du har vunnit en <strong>ny avatar</strong>!</p>`;
  } else if (prize.type === 'item') {
    content += `<p>Du har vunnit ett <strong>specialitem</strong>!</p>`;
  } else {
    content += `<p>${prize.value}</p>`;
  }
  
  content += `</div>`;
  modalBody.innerHTML = content;
  
  // Update modal title
  if (prize.type === 'nothing') {
    modalTitle.textContent = 'Bättre lycka nästa gång';
  } else {
    modalTitle.textContent = 'Du vann!';
  }
  
  // Show modal
  const prizeModal = new bootstrap.Modal(document.getElementById('prizeModal'));
  prizeModal.show();
}

/**
 * Kontrollera hjulets rendering
 */
function checkWheelRendering() {
  const wheel = document.getElementById('wheel');
  if (!wheel) return;
  
  // Kontrollera om hjulet har rätt storlek och synlighet
  console.log('Wheel dimensions:', wheel.offsetWidth, 'x', wheel.offsetHeight);
  
  // Kontrollera om hjulet har sektioner
  const sections = wheel.querySelectorAll('.wheel-slice');
  console.log('Number of wheel sections:', sections.length);
  
  // Kontrollera att hjulet är synligt
  const computedStyle = window.getComputedStyle(wheel);
  if (computedStyle.display === 'none' || computedStyle.visibility === 'hidden') {
    console.warn('Warning: Wheel may be hidden by CSS!');
    // Försök åtgärda visningsproblemet
    wheel.style.display = 'block';
    wheel.style.visibility = 'visible';
  }
  
  // Om hjulet saknar sektioner, skapa dem igen
  if (sections.length === 0) {
    console.warn('Warning: Wheel has no sections, reinitializing...');
    initializeWheel();
  }
} 