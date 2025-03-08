/**
 * GoBet - Create Bet Functionality
 */

document.addEventListener('DOMContentLoaded', () => {
    initCreateBetForm();
    initSpecialBetTypes();
});

/**
 * Initialisera formulär för att skapa nya bets
 */
function initCreateBetForm() {
    const createBetForm = document.querySelector('.create-bet-form');
    
    if (!createBetForm) return;
    
    // Lyssna efter formuläröverföring
    createBetForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Kontrollera om användaren kan skapa ett bet (baserat på prenumerationsplan)
        if (!canCreateBet()) {
            return;
        }
        
        // Samla formulärdata
        const formData = new FormData(this);
        const betData = {
            title: formData.get('bet-title'),
            description: formData.get('bet-description'),
            amount: formData.get('bet-amount'),
            endDate: formData.get('bet-end-date'),
            isPublic: formData.get('bet-visibility') === 'public',
            winnerTakesAll: formData.get('winner-takes-all') === 'on',
            isTournament: formData.get('tournament-bet') === 'on',
            tournamentType: formData.get('tournament-type') || null,
            options: getBetOptions(),
        };
        
        // Validera formuläret
        if (!validateBetForm(betData)) {
            return;
        }
        
        // Simulerad API-anrop för att spara bet
        saveBet(betData);
    });
    
    // Initiera alternativhantering
    initBetOptions();
}

/**
 * Kontrollera om användaren kan skapa ett bet baserat på deras prenumerationsplan
 */
function canCreateBet() {
    // För demo använder vi bara localStorage
    const currentPlan = localStorage.getItem('userPlan') || 'free';
    
    // Kontrollera antalet kvarvarande gratisbets för denna vecka
    if (currentPlan === 'free') {
        const remainingBets = calculateFreeBetsRemaining();
        
        if (remainingBets <= 0) {
            showNotification('Du har använt ditt gratis-bet för denna vecka. Uppgradera till Premium för fler bets!', 'warning');
            return false;
        }
    }
    
    return true;
}

/**
 * Validera bet-formuläret
 */
function validateBetForm(betData) {
    // Kontrollera obligatoriska fält
    if (!betData.title || betData.title.trim() === '') {
        showNotification('Var god ange en titel för bettet', 'error');
        return false;
    }
    
    if (!betData.description || betData.description.trim() === '') {
        showNotification('Var god ange en beskrivning för bettet', 'error');
        return false;
    }
    
    if (!betData.amount || isNaN(betData.amount) || parseInt(betData.amount) <= 0) {
        showNotification('Var god ange ett giltigt belopp för insatsen', 'error');
        return false;
    }
    
    if (!betData.endDate) {
        showNotification('Var god ange ett slutdatum för bettet', 'error');
        return false;
    }
    
    // Kontrollera att slutdatum är i framtiden
    const endDate = new Date(betData.endDate);
    if (endDate <= new Date()) {
        showNotification('Slutdatumet måste vara i framtiden', 'error');
        return false;
    }
    
    // Kontrollera att det finns minst två alternativ
    if (!betData.options || betData.options.length < 2) {
        showNotification('Du måste ange minst två alternativ för bettet', 'error');
        return false;
    }
    
    // Kontrollera att alla alternativ har namn
    for (const option of betData.options) {
        if (!option.name || option.name.trim() === '') {
            showNotification('Alla alternativ måste ha ett namn', 'error');
            return false;
        }
    }
    
    return true;
}

/**
 * Initialisera hantering av bet-alternativ
 */
function initBetOptions() {
    const optionsContainer = document.querySelector('.bet-options-container');
    const addOptionButton = document.querySelector('.btn-add-option');
    
    if (!optionsContainer || !addOptionButton) return;
    
    // Lägg till initiala två alternativ
    addBetOption(optionsContainer);
    addBetOption(optionsContainer);
    
    // Lyssna efter klick på Lägg till alternativ-knappen
    addOptionButton.addEventListener('click', () => {
        addBetOption(optionsContainer);
    });
    
    // Lyssna efter klick på ta bort alternativ-knappar (delegerad händelse)
    optionsContainer.addEventListener('click', (e) => {
        if (e.target.closest('.btn-remove-option')) {
            const optionRow = e.target.closest('.bet-option-row');
            
            // Kontrollera att vi har minst två alternativ kvar
            const optionRows = optionsContainer.querySelectorAll('.bet-option-row');
            if (optionRows.length <= 2) {
                showNotification('Ett bet måste ha minst två alternativ', 'warning');
                return;
            }
            
            // Ta bort alternativraden
            optionRow.remove();
        }
    });
}

/**
 * Lägg till ett nytt alternativ i bet-formuläret
 */
function addBetOption(container) {
    const optionRow = document.createElement('div');
    optionRow.className = 'bet-option-row';
    
    optionRow.innerHTML = `
        <input type="text" class="form-control" name="option-name" placeholder="Alternativnamn" required>
        <input type="number" class="form-control" name="option-odds" placeholder="Odds (valfritt)" min="1" step="0.1">
        <button type="button" class="btn-remove-option" title="Ta bort alternativ">
            <i class="fa-solid fa-times"></i>
        </button>
    `;
    
    container.appendChild(optionRow);
}

/**
 * Hämta alla alternativ från formuläret
 */
function getBetOptions() {
    const options = [];
    const optionRows = document.querySelectorAll('.bet-option-row');
    
    optionRows.forEach(row => {
        const nameInput = row.querySelector('input[name="option-name"]');
        const oddsInput = row.querySelector('input[name="option-odds"]');
        
        if (nameInput && nameInput.value.trim() !== '') {
            options.push({
                name: nameInput.value.trim(),
                odds: oddsInput && oddsInput.value ? parseFloat(oddsInput.value) : null
            });
        }
    });
    
    return options;
}

/**
 * Initialisera specialfunktioner för olika bettyper
 */
function initSpecialBetTypes() {
    const winnerTakesAllCheck = document.getElementById('winner-takes-all');
    const tournamentCheck = document.getElementById('tournament-bet');
    const tournamentTypeSelect = document.getElementById('tournament-type');
    const tournamentDetailsDiv = document.querySelector('.tournament-details');
    
    // Hantera vinnare-tar-allt-val
    if (winnerTakesAllCheck) {
        winnerTakesAllCheck.addEventListener('change', function() {
            // Uppdatera UI baserat på status
            const betAmountLabel = document.querySelector('label[for="bet-amount"]');
            
            if (this.checked) {
                betAmountLabel.textContent = 'Insats per person (GoCoins):';
            } else {
                betAmountLabel.textContent = 'Insats (GoCoins):';
            }
        });
    }
    
    // Hantera turnering-val
    if (tournamentCheck && tournamentTypeSelect && tournamentDetailsDiv) {
        tournamentCheck.addEventListener('change', function() {
            if (this.checked) {
                tournamentDetailsDiv.style.display = 'block';
            } else {
                tournamentDetailsDiv.style.display = 'none';
            }
        });
        
        // Uppdatera beskrivning baserat på vald turneringstyp
        tournamentTypeSelect.addEventListener('change', function() {
            const tournamentDescription = document.getElementById('tournament-description');
            
            if (!tournamentDescription) return;
            
            switch (this.value) {
                case 'csgo':
                    tournamentDescription.textContent = 'CS:GO-turneringar använder matchresultat för att avgöra vinnare.';
                    break;
                case 'custom':
                    tournamentDescription.textContent = 'Anpassade turneringar låter dig sätta egna regler och villkor.';
                    break;
                case 'sports':
                    tournamentDescription.textContent = 'Sportturneringar följer officiella resultat från sportmatcher.';
                    break;
                default:
                    tournamentDescription.textContent = '';
            }
        });
    }
}

/**
 * Simulerad funktion för att spara ett bet
 */
function saveBet(betData) {
    // I en verklig applikation skulle detta göra ett API-anrop
    console.log('Sparar bet:', betData);
    
    // Simulera sparande av bet
    setTimeout(() => {
        // Uppdatera användarens kvarvarande gratisbets om det behövs
        const currentPlan = localStorage.getItem('userPlan') || 'free';
        if (currentPlan === 'free') {
            useFreeBet();
        }
        
        // Lägg till det nya bettet i listan över bets
        addBetToLocalStorage(betData);
        
        // Visa bekräftelse
        showNotification('Ditt bet har skapats!', 'success');
        
        // Omdirigera till betlistan efter en kort fördröjning
        setTimeout(() => {
            window.location.href = betData.isPublic ? '#public-bets' : '#friend-bets';
            window.location.reload();
        }, 1500);
    }, 1000);
}

/**
 * Lägg till bet i localStorage (för demo)
 */
function addBetToLocalStorage(betData) {
    // Hämta befintliga bets från localStorage eller skapa en tom array
    const existingBets = JSON.parse(localStorage.getItem('userBets') || '[]');
    
    // Lägg till vårt nya bet med ett unikt ID och skapardatum
    const newBet = {
        ...betData,
        id: generateUniqueId(),
        createdAt: new Date().toISOString(),
        createdBy: {
            username: 'MaxBettman',
            avatar: 'https://ui-avatars.com/api/?name=Max+Bettman&background=6643b5&color=fff'
        },
        participants: []
    };
    
    // Lägg till det nya bettet först i listan
    existingBets.unshift(newBet);
    
    // Spara tillbaka till localStorage
    localStorage.setItem('userBets', JSON.stringify(existingBets));
}

/**
 * Generera ett unikt ID för ett nytt bet
 */
function generateUniqueId() {
    return 'bet_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
} 