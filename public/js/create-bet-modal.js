/**
 * GoBet - Create Bet Modal
 * Script för att skapa nya vadslagningar
 */

// Funktioner för att öppna och stänga create-bet-modalen
function openCreateBetModal() {
  const modal = document.getElementById('create-bet-modal');
  if (modal) {
    modal.classList.add('active');
    document.body.classList.add('modal-open');
  }
}

function closeCreateBetModal() {
  const modal = document.getElementById('create-bet-modal');
  if (modal) {
    modal.classList.remove('active');
    document.body.classList.remove('modal-open');
  }
}

// Kontrollera om användaren är inloggad innan create-bet öppnas
function checkLoginAndOpenCreateBet() {
  // Kontrollera om Auth är tillgängligt
  if (window.Auth && typeof window.Auth.isLoggedIn === 'function') {
    if (window.Auth.isLoggedIn()) {
      openCreateBetModal();
    } else {
      // Öppna login-modal istället
      if (typeof openLoginModal === 'function') {
        openLoginModal();
      }
    }
  } else {
    // Fallback om Auth inte är tillgängligt
    openCreateBetModal();
  }
}

// Initialisering av modal-händelser
document.addEventListener('DOMContentLoaded', () => {
  // Stäng-knappar
  const closeButtons = document.querySelectorAll('.create-bet-modal .close-modal, .create-bet-modal .cancel-btn');
  closeButtons.forEach(button => {
    button.addEventListener('click', closeCreateBetModal);
  });
  
  // Stäng om användaren klickar utanför modalen
  const modal = document.getElementById('create-bet-modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeCreateBetModal();
      }
    });
  }
  
  // Hantera skapande av vadslagning
  const createBetForm = document.getElementById('create-bet-form');
  if (createBetForm) {
    createBetForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Kontrollera om användaren är inloggad
      if (window.Auth && typeof window.Auth.isLoggedIn === 'function' && !window.Auth.isLoggedIn()) {
        if (typeof openLoginModal === 'function') {
          openLoginModal();
        }
        return;
      }
      
      // Samla in formulärdata
      const formData = new FormData(createBetForm);
      const betData = {
        title: formData.get('bet-title'),
        description: formData.get('bet-description'),
        type: formData.get('bet-type'),
        options: [],
        deadline: formData.get('bet-deadline'),
        private: formData.get('bet-private') === 'on',
        winnerTakesAll: formData.get('winner-takes-all') === 'on'
      };
      
      // Hämta alla alternativ
      const optionInputs = createBetForm.querySelectorAll('.bet-option-input');
      optionInputs.forEach(input => {
        if (input.value.trim()) {
          betData.options.push(input.value.trim());
        }
      });
      
      try {
        // Skicka till API (simulerat för nu)
        console.log('Skapar vadslagning:', betData);
        
        // Visa bekräftelse och stäng modal
        alert('Vadslagning skapad!');
        closeCreateBetModal();
        
        // Återställ formuläret
        createBetForm.reset();
      } catch (error) {
        console.error('Fel vid skapande av vadslagning:', error);
      }
    });
  }
  
  // Hantera dynamiskt tillägg av alternativ
  const addOptionButton = document.getElementById('add-option-btn');
  const optionsContainer = document.getElementById('bet-options-container');
  
  if (addOptionButton && optionsContainer) {
    addOptionButton.addEventListener('click', () => {
      const optionCount = optionsContainer.querySelectorAll('.bet-option-group').length;
      if (optionCount < 10) { // Max 10 alternativ
        const newOption = document.createElement('div');
        newOption.className = 'bet-option-group';
        newOption.innerHTML = `
          <input type="text" class="bet-option-input" placeholder="Alternativ ${optionCount + 1}">
          <button type="button" class="remove-option-btn">
            <i class="fas fa-times"></i>
          </button>
        `;
        
        // Lägg till händelse för att ta bort alternativ
        const removeButton = newOption.querySelector('.remove-option-btn');
        removeButton.addEventListener('click', () => {
          newOption.remove();
        });
        
        optionsContainer.appendChild(newOption);
      }
    });
  }
}); 