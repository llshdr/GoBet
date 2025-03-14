// Klass för att hantera winner-takes-all bets
class WinnerTakesAllBet {
    constructor(betId, totalPot, participants) {
        this.betId = betId;
        this.totalPot = totalPot;
        this.participants = participants;
        this.correctGuesses = 0;
    }

    calculatePotentialWinnings(betAmount) {
        // Beräkna total pott inklusive ny insats
        const updatedPot = this.totalPot + betAmount;
        
        // Uppskatta antal korrekta gissningar (använd nuvarande + 1 för att inkludera den nya gissningen)
        const estimatedCorrectGuesses = this.correctGuesses + 1;
        
        // Beräkna potentiell vinst per person
        const potentialWinPerPerson = updatedPot / estimatedCorrectGuesses;
        
        return {
            totalPot: updatedPot,
            estimatedWinners: estimatedCorrectGuesses,
            potentialWin: potentialWinPerPerson
        };
    }

    updateParticipants(newParticipant) {
        this.participants.push(newParticipant);
        this.updateUI();
    }

    updateUI() {
        const betElement = document.querySelector(`#bet-${this.betId}`);
        if (!betElement) return;

        const potElement = betElement.querySelector('.total-pot');
        const participantsElement = betElement.querySelector('.participants-count');
        
        if (potElement) {
            potElement.textContent = `${this.totalPot} coins`;
        }
        
        if (participantsElement) {
            participantsElement.textContent = `${this.participants.length} deltagare`;
        }
    }
}

// Funktion för att hantera bet-formulär
function handleBetForm() {
    const betForms = document.querySelectorAll('.bet-form');
    
    betForms.forEach(form => {
        const betId = form.dataset.betId;
        const betType = form.dataset.betType;
        const amountInput = form.querySelector('.bet-amount');
        const submitButton = form.querySelector('.submit-bet');
        const winningsPreview = form.querySelector('.potential-winnings');
        
        // Skapa WinnerTakesAllBet-instans om det är rätt typ
        if (betType === 'winner-takes-all') {
            const totalPot = parseInt(form.dataset.totalPot) || 0;
            const participants = JSON.parse(form.dataset.participants || '[]');
            const bet = new WinnerTakesAllBet(betId, totalPot, participants);
            
            // Lägg till event listener för input
            amountInput.addEventListener('input', (e) => {
                const amount = parseInt(e.target.value) || 0;
                const winnings = bet.calculatePotentialWinnings(amount);
                
                // Uppdatera UI med potentiell vinst
                if (winningsPreview) {
                    winningsPreview.innerHTML = `
                        <div class="winnings-info">
                            <p>Total pott: <strong>${winnings.totalPot} coins</strong></p>
                            <p>Uppskattade vinnare: <strong>${winnings.estimatedWinners}</strong></p>
                            <p>Potentiell vinst: <strong>${Math.floor(winnings.potentialWin)} coins</strong></p>
                        </div>
                    `;
                }
            });
            
            // Hantera formulärinlämning
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const amount = parseInt(amountInput.value) || 0;
                if (amount <= 0) {
                    showNotification('Ange ett giltigt belopp', 'error');
                    return;
                }
                
                try {
                    const response = await fetch('/api/place-bet', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            betId,
                            amount,
                            type: 'winner-takes-all'
                        })
                    });
                    
                    if (!response.ok) {
                        throw new Error('Kunde inte placera bet');
                    }
                    
                    const data = await response.json();
                    bet.updateParticipants({
                        userId: data.userId,
                        amount: amount
                    });
                    
                    showNotification('Bet placerad framgångsrikt!', 'success');
                    amountInput.value = '';
                    if (winningsPreview) {
                        winningsPreview.innerHTML = '';
                    }
                } catch (error) {
                    console.error('Fel vid placering av bet:', error);
                    showNotification('Ett fel uppstod vid placering av bet', 'error');
                }
            });
        }
    });
}

// Initiera när dokumentet är laddat
document.addEventListener('DOMContentLoaded', () => {
    handleBetForm();
}); 