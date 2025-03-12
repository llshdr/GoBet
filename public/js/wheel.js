/**
 * GoBet - Wheel of Fortune
 */

document.addEventListener('DOMContentLoaded', () => {
  console.log('Wheel of Fortune initialized');
  
  // Kontrollera om användaren är inloggad
  if (!checkLoginStatus()) {
    showLoginWarning();
    return;
  }

  // Element
  const wheelElement = document.getElementById('wheel');
  const spinButton = document.getElementById('spinButton');
  const buySpinButton = document.getElementById('buySpinButton');
  const remainingSpinsElement = document.getElementById('remainingSpins');
  const nextSpinElement = document.getElementById('nextSpin');

  // Användardata
  let userData = loadUserData();
  let remainingSpins = userData.remainingSpins || 0;
  
  // Uppdatera visningen av återstående snurr
  updateSpinsDisplay();
  
  // Starta timern för nästa snurr
  startNextSpinTimer();
  
  // Prislista med sannolikhet och värde
  const prizes = [
    { type: 'coins', value: 50, probability: 20, color: '#ff7e47', icon: 'fa-coins' },
    { type: 'coins', value: 100, probability: 15, color: '#ffcc00', icon: 'fa-coins' },
    { type: 'coins', value: 200, probability: 10, color: '#28a745', icon: 'fa-coins' },
    { type: 'premium', value: '1 dag', probability: 5, color: '#007bff', icon: 'fa-crown' },
    { type: 'premium-plus', value: '1 dag', probability: 3, color: '#6f42c1', icon: 'fa-crown' },
    { type: 'avatar', value: 'Avatar', probability: 5, color: '#e83e8c', icon: 'fa-user-circle' },
    { type: 'item', value: 'Item', probability: 2, color: '#dc3545', icon: 'fa-gift' },
    { type: 'nothing', value: 'Inget', probability: 40, color: '#6c757d', icon: 'fa-times-circle' }
  ];
  
  // Ladda hjulet med sektioner
  initWheel();
  
  // Knappfunktioner
  spinButton.addEventListener('click', spinWheel);
  buySpinButton.addEventListener('click', buyAdditionalSpin);
  
  /**
   * Kontrollera om användaren är inloggad
   */
  function checkLoginStatus() {
    return localStorage.getItem('gobet_user_logged_in') === 'true';
  }
  
  /**
   * Visa varning om att användaren måste logga in
   */
  function showLoginWarning() {
    const loginWarningModal = new bootstrap.Modal(document.getElementById('loginWarningModal'));
    loginWarningModal.show();
    
    // Inaktivera snurrknappar
    spinButton.disabled = true;
    buySpinButton.disabled = true;
  }
  
  /**
   * Ladda användardata från local storage
   */
  function loadUserData() {
    let data = {
      plan: localStorage.getItem('gobet_user_plan') || 'free',
      remainingSpins: parseInt(localStorage.getItem('gobet_user_spins') || '0'),
      lastSpinTime: localStorage.getItem('gobet_last_spin_time') || null,
      coins: parseInt(localStorage.getItem('gobet_user_coins') || '5000')
    };
    
    // Simulera olika planer för demonstration
    if (!localStorage.getItem('gobet_user_plan')) {
      // Slumpa en plan för demo
      const plans = ['free', 'premium', 'premium-plus'];
      data.plan = plans[Math.floor(Math.random() * plans.length)];
      localStorage.setItem('gobet_user_plan', data.plan);
      
      // Ange återstående snurr baserat på plan
      if (data.plan === 'free') data.remainingSpins = 1;
      else if (data.plan === 'premium') data.remainingSpins = 3;
      else if (data.plan === 'premium-plus') data.remainingSpins = 5;
      
      localStorage.setItem('gobet_user_spins', data.remainingSpins.toString());
    }
    
    return data;
  }
  
  /**
   * Uppdatera visningen av återstående snurr
   */
  function updateSpinsDisplay() {
    remainingSpinsElement.textContent = remainingSpins;
    
    // Aktivera/inaktivera snurrknapp baserat på återstående snurr
    spinButton.disabled = remainingSpins <= 0;
  }
  
  /**
   * Starta timern för nästa kostnadsfria snurr
   */
  function startNextSpinTimer() {
    const lastSpinTime = userData.lastSpinTime ? new Date(userData.lastSpinTime) : null;
    let timeRemaining;
    
    if (lastSpinTime) {
      // Olika resetperioder beroende på användarens plan
      let resetHours = 24; // Standard för gratis plan
      if (userData.plan === 'premium') resetHours = 8;
      else if (userData.plan === 'premium-plus') resetHours = 4;
      
      const resetTime = new Date(lastSpinTime.getTime() + resetHours * 60 * 60 * 1000);
      const now = new Date();
      
      timeRemaining = resetTime - now;
      
      if (timeRemaining <= 0) {
        // Återställ snurr om tiden har gått ut
        resetDailySpins();
        timeRemaining = resetHours * 60 * 60 * 1000;
      }
    } else {
      // Första gången användaren besöker sidan, eller efter återställning
      timeRemaining = 0;
      resetDailySpins();
    }
    
    updateTimerDisplay(timeRemaining);
    
    // Uppdatera timern varje sekund
    setInterval(() => {
      timeRemaining -= 1000;
      
      if (timeRemaining <= 0) {
        resetDailySpins();
        // Ställ in ny återställningstid baserat på plan
        let resetHours = 24;
        if (userData.plan === 'premium') resetHours = 8;
        else if (userData.plan === 'premium-plus') resetHours = 4;
        
        timeRemaining = resetHours * 60 * 60 * 1000;
      }
      
      updateTimerDisplay(timeRemaining);
    }, 1000);
  }
  
  /**
   * Uppdatera timervisningen
   */
  function updateTimerDisplay(timeInMs) {
    const hours = Math.floor(timeInMs / (1000 * 60 * 60));
    const minutes = Math.floor((timeInMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeInMs % (1000 * 60)) / 1000);
    
    nextSpinElement.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  
  /**
   * Återställ dagliga snurr
   */
  function resetDailySpins() {
    // Ange antalet gratissnurr baserat på användarens plan
    if (userData.plan === 'free') remainingSpins = 1;
    else if (userData.plan === 'premium') remainingSpins = 3;
    else if (userData.plan === 'premium-plus') remainingSpins = 5;
    
    // Spara värden
    localStorage.setItem('gobet_user_spins', remainingSpins.toString());
    localStorage.setItem('gobet_last_spin_time', new Date().toISOString());
    
    userData.remainingSpins = remainingSpins;
    userData.lastSpinTime = new Date();
    
    // Uppdatera visningen
    updateSpinsDisplay();
  }
  
  /**
   * Initiera hjulet med sektioner
   */
  function initWheel() {
    // Rensa hjulet
    wheelElement.innerHTML = '';
    
    // Beräkna total sannolikhet
    const totalProbability = prizes.reduce((sum, prize) => sum + prize.probability, 0);
    
    // Skapa sektioner för varje pris
    let currentAngle = 0;
    prizes.forEach((prize, index) => {
      const angle = (prize.probability / totalProbability) * 360;
      
      // Skapa och lägg till sektion
      createWheelSection(prize, currentAngle);
      
      // Uppdatera aktuell vinkel för nästa sektion
      currentAngle += angle;
    });
    
    // Uppdatera prisförklaringen
    updatePrizeLegend();
  }
  
  /**
   * Skapa ett hjulsegment
   */
  function createWheelSection(prize, startAngle) {
    // Beräkna vinkeln för sektionen baserat på sannolikhet
    const sectionAngle = (prize.probability / 100) * 360;
    
    // Skapa sektionselement
    const section = document.createElement('div');
    section.className = 'wheel-slice';
    section.style.transform = `rotate(${startAngle}deg)`;
    section.style.backgroundColor = prize.color;
    
    // Skapa innehåll med ikon (utan text)
    const content = document.createElement('div');
    content.className = 'wheel-slice-content';
    
    // Lägg till en stor ikon som representerar priset
    const icon = document.createElement('i');
    icon.className = `fas ${prize.icon}`;
    content.appendChild(icon);
    
    // Lägg till innehåll och sektion till hjulet
    section.appendChild(content);
    wheelElement.appendChild(section);
    
    // Lagra prisdata och vinkel för denna sektion
    section.dataset.type = prize.type;
    section.dataset.value = prize.value;
    section.dataset.angle = startAngle;
    section.dataset.sectionAngle = sectionAngle;
  }
  
  /**
   * Uppdatera prisförklaringen under hjulet
   */
  function updatePrizeLegend() {
    const legendContainer = document.querySelector('.legend-items');
    if (!legendContainer) return;
    
    // Rensa befintliga objekt
    legendContainer.innerHTML = '';
    
    // Skapa legendobjekt för varje pris
    prizes.forEach(prize => {
      const legendItem = document.createElement('div');
      legendItem.className = 'legend-item';
      
      const legendColor = document.createElement('div');
      legendColor.className = 'legend-color';
      legendColor.style.backgroundColor = prize.color;
      
      // Lägg till ikon i färgrutan
      const icon = document.createElement('i');
      icon.className = `fas ${prize.icon}`;
      legendColor.appendChild(icon);
      
      const legendText = document.createElement('div');
      legendText.className = 'legend-text';
      
      // Visa lämplig text baserat på pristyp
      if (prize.type === 'coins') {
        legendText.textContent = `${prize.value} GoCoins`;
      } else if (prize.type === 'premium') {
        legendText.textContent = `Premium ${prize.value}`;
      } else if (prize.type === 'premium-plus') {
        legendText.textContent = `Premium+ ${prize.value}`;
      } else if (prize.type === 'avatar') {
        legendText.textContent = 'Ny Avatar';
      } else if (prize.type === 'item') {
        legendText.textContent = 'Specialitem';
      } else {
        legendText.textContent = 'Ingen vinst';
      }
      
      legendItem.appendChild(legendColor);
      legendItem.appendChild(legendText);
      legendContainer.appendChild(legendItem);
    });
  }
  
  /**
   * Animera hjulsnurr
   */
  function spinWheel() {
    // Kolla om användaren har återstående snurr
    if (remainingSpins <= 0) {
      alert('Du har inga återstående gratissnurr. Köp fler eller vänta på återställning.');
      return;
    }
    
    // Inaktivera knappen under snurrningen
    spinButton.disabled = true;
    buySpinButton.disabled = true;
    
    // Minska återstående snurr
    remainingSpins--;
    localStorage.setItem('gobet_user_spins', remainingSpins.toString());
    userData.remainingSpins = remainingSpins;
    
    // Uppdatera tidpunkt för senaste snurr
    localStorage.setItem('gobet_last_spin_time', new Date().toISOString());
    userData.lastSpinTime = new Date();
    
    // Uppdatera visningen
    updateSpinsDisplay();
    
    // Simulera vinstresultat baserat på sannolikhet
    const result = getRandomPrize();
    
    // Beräkna slutvinkel för animering
    // Vi lägger till flera varv (5 * 360 grader) plus vinkeln till vinstsektionen
    // minus 45 grader så att pilen pekar mot mitten av sektionen
    const targetAngle = 5 * 360 + findSectionAngle(result) - 45;
    
    // Lägg till effekter för snurr
    wheelElement.classList.add('spinning');
    
    // Ställ in transformationen för att animera snurr
    wheelElement.style.transition = 'transform 5s cubic-bezier(0.17, 0.67, 0.12, 0.99)';
    wheelElement.style.transform = `rotate(-${targetAngle}deg)`;
    
    // När animationen är klar
    setTimeout(() => {
      // Visa vinst
      showWinModal(result);
      
      // Återställ knappar
      spinButton.disabled = remainingSpins <= 0;
      buySpinButton.disabled = false;
      
      // Ta bort effekter
      wheelElement.classList.remove('spinning');
      
      // Återställ hjulet till startposition efter en kort fördröjning
      setTimeout(() => {
        wheelElement.style.transition = 'none';
        wheelElement.style.transform = 'rotate(0deg)';
        
        // Återaktivera transition efter återställning
        setTimeout(() => {
          wheelElement.style.transition = 'transform 5s cubic-bezier(0.17, 0.67, 0.12, 0.99)';
        }, 50);
      }, 500);
    }, 5000);
  }
  
  /**
   * Hitta vinkeln för en specifik sektion
   */
  function findSectionAngle(prize) {
    // Vi behöver hitta vinkeln till sektionen som matchar det vinnande priset
    const sections = wheelElement.querySelectorAll('.wheel-slice');
    
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      if (section.dataset.type === prize.type && section.dataset.value === prize.value) {
        // Ta hänsyn till sektionens storlek för att pilen ska peka på mitten
        const halfSectionAngle = parseFloat(section.dataset.sectionAngle) / 2;
        return parseFloat(section.dataset.angle) + halfSectionAngle;
      }
    }
    
    // Om ingen matchning hittades, returnera ett standardvärde
    return 0;
  }
  
  /**
   * Välj ett slumpmässigt pris baserat på sannolikhet
   */
  function getRandomPrize() {
    const totalProbability = prizes.reduce((sum, prize) => sum + prize.probability, 0);
    const randomValue = Math.random() * totalProbability;
    
    let accumulatedProbability = 0;
    
    for (let i = 0; i < prizes.length; i++) {
      accumulatedProbability += prizes[i].probability;
      if (randomValue <= accumulatedProbability) {
        return prizes[i];
      }
    }
    
    // Fallback till det sista priset om något går fel
    return prizes[prizes.length - 1];
  }
  
  /**
   * Köp ytterligare snurr
   */
  function buyAdditionalSpin() {
    // Kolla om användaren har tillräckligt med mynt
    let spinCost = 50; // Standardkostnad
    
    // Olika kostnader baserat på användarens plan
    if (userData.plan === 'premium') spinCost = 30;
    else if (userData.plan === 'premium-plus') spinCost = 20;
    
    if (userData.coins < spinCost) {
      alert(`Du har inte tillräckligt med GoCoins. Du behöver ${spinCost} GoCoins för att köpa ett snurr.`);
      return;
    }
    
    // Dra kostnad och öka återstående snurr
    userData.coins -= spinCost;
    remainingSpins++;
    
    // Spara värden
    localStorage.setItem('gobet_user_coins', userData.coins.toString());
    localStorage.setItem('gobet_user_spins', remainingSpins.toString());
    
    // Uppdatera visningen
    updateSpinsDisplay();
    
    // Uppdatera myntvisningen i användarmenyn
    const userCoinsElement = document.getElementById('userCoins');
    if (userCoinsElement) {
      userCoinsElement.textContent = userData.coins.toLocaleString();
    }
  }
  
  /**
   * Visa vinst i modal
   */
  function showWinModal(prize) {
    const modalTitle = document.querySelector('#prizeModal .modal-title');
    const modalBody = document.querySelector('#prizeModal .modal-body');
    
    // Skapa innehåll för vinst
    let content = `
      <div class="prize-win">
        <div class="prize-icon">
          <i class="fas ${prize.icon}"></i>
        </div>
        <h2>Grattis!</h2>
    `;
    
    // Anpassa meddelande baserat på pristyp
    if (prize.type === 'coins') {
      content += `<p>Du har vunnit <strong>${prize.value} GoCoins</strong>!</p>`;
      
      // Uppdatera användarens mynt
      userData.coins += parseInt(prize.value);
      localStorage.setItem('gobet_user_coins', userData.coins.toString());
      
      // Uppdatera myntvisningen
      const userCoinsElement = document.getElementById('userCoins');
      if (userCoinsElement) {
        userCoinsElement.textContent = userData.coins.toLocaleString();
      }
    } else if (prize.type === 'premium' || prize.type === 'premium-plus') {
      content += `<p>Du har vunnit <strong>${prize.value} ${prize.type === 'premium' ? 'Premium' : 'Premium Plus'}</strong>!</p>`;
    } else if (prize.type === 'avatar') {
      content += `<p>Du har vunnit en <strong>ny avatar</strong>!</p>`;
    } else if (prize.type === 'item') {
      content += `<p>Du har vunnit ett <strong>specialitem</strong>!</p>`;
    } else {
      content += `<p>Bättre lycka nästa gång!</p>`;
    }
    
    content += `</div>`;
    modalBody.innerHTML = content;
    
    // Uppdatera modal-titel
    if (prize.type === 'nothing') {
      modalTitle.textContent = 'Ingen vinst';
    } else {
      modalTitle.textContent = 'Du vann!';
    }
    
    // Visa modalen
    const prizeModal = new bootstrap.Modal(document.getElementById('prizeModal'));
    prizeModal.show();
  }
}); 