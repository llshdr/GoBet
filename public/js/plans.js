/**
 * GoBet - Prenumerationsplaner
 */

document.addEventListener('DOMContentLoaded', () => {
    initPlanSelection();
    updatePlanBenefits();
    calculateFreeBetsRemaining();
});

/**
 * Initialisera val av prenumerationsplaner
 */
function initPlanSelection() {
    const planCards = document.querySelectorAll('.plan-card');
    const planSelectButtons = document.querySelectorAll('.plan-select');
    
    // Läs användarens nuvarande plan från localStorage eller använd gratis som standard
    const currentPlan = localStorage.getItem('userPlan') || 'free';
    
    // Markera användarens nuvarande plan
    planCards.forEach(card => {
        if (card.getAttribute('data-plan') === currentPlan) {
            card.classList.add('selected');
        }
        
        // Lägg till klickhändelse för att välja plan
        card.addEventListener('click', function() {
            const plan = this.getAttribute('data-plan');
            
            // Avmarkera alla kort
            planCards.forEach(c => c.classList.remove('selected'));
            
            // Markera det klickade kortet
            this.classList.add('selected');
            
            // Uppdatera knapptext baserat på om detta är användarens nuvarande plan
            updatePlanButtonText(plan, currentPlan);
        });
    });
    
    // Hantera klick på prenumerationsknappar
    planSelectButtons.forEach(button => {
        const planCard = button.closest('.plan-card');
        const plan = planCard.getAttribute('data-plan');
        
        // Sätt initial knapptext
        updatePlanButtonText(plan, currentPlan);
        
        button.addEventListener('click', function(e) {
            e.stopPropagation(); // Förhindra kortet från att triggas
            
            const selectedPlan = this.closest('.plan-card').getAttribute('data-plan');
            
            if (selectedPlan === currentPlan) {
                showNotification('Du använder redan denna plan', 'info');
                return;
            }
            
            // Simulera en prenumerationsprocess
            if (selectedPlan !== 'free') {
                showPaymentModal(selectedPlan);
            } else {
                // Nedgradering till gratisplan
                upgradeToPlan(selectedPlan);
            }
        });
    });
}

/**
 * Uppdaterar knapptexten baserat på om planen är vald eller inte
 */
function updatePlanButtonText(plan, currentPlan) {
    const button = document.querySelector(`.plan-card[data-plan="${plan}"] .plan-select`);
    
    if (!button) return;
    
    if (plan === currentPlan) {
        button.textContent = 'Din nuvarande plan';
        button.disabled = true;
    } else if (plan === 'free') {
        button.textContent = 'Nedgradera till gratis';
    } else if (currentPlan === 'free') {
        button.textContent = 'Uppgradera nu';
    } else if (
        (currentPlan === 'premium' && plan === 'premium-plus') || 
        (currentPlan === 'premium-plus' && plan === 'premium')
    ) {
        button.textContent = currentPlan === 'premium' ? 'Uppgradera' : 'Nedgradera';
    }
}

/**
 * Visa betalningsmodal för premiumplaner
 */
function showPaymentModal(plan) {
    // Här skulle normalt en riktig betalningsmodal visas
    // För demo simulerar vi bara en lyckad betalning
    const isUpgrade = confirm(`Vill du verkligen uppgradera till ${getPlanDisplayName(plan)}? (Simulerad betalning)`);
    
    if (isUpgrade) {
        upgradeToPlan(plan);
    }
}

/**
 * Uppgradera användarens plan
 */
function upgradeToPlan(plan) {
    // Spara användarens val i localStorage
    localStorage.setItem('userPlan', plan);
    
    // Om plan är gratis, nollställ antalet gratisbets per vecka
    if (plan === 'free') {
        localStorage.setItem('freeBetsThisWeek', '0');
        localStorage.setItem('lastFreeBetReset', Date.now().toString());
    }
    
    // Visa bekräftelse
    showNotification(`Du har nu ${plan === 'free' ? 'nedgraderat' : 'uppgraderat'} till ${getPlanDisplayName(plan)}!`, 'success');
    
    // Uppdatera UI för att reflektera den nya planen
    updateUIForPlan(plan);
    
    // Ladda om sidan efter en kort fördröjning
    setTimeout(() => {
        window.location.reload();
    }, 2000);
}

/**
 * Uppdatera UI baserat på användarens plan
 */
function updateUIForPlan(plan) {
    // Uppdatera klassar på planerna
    const planCards = document.querySelectorAll('.plan-card');
    planCards.forEach(card => {
        card.classList.remove('selected');
        if (card.getAttribute('data-plan') === plan) {
            card.classList.add('selected');
        }
    });
    
    // Uppdatera knapptexten
    planCards.forEach(card => {
        const cardPlan = card.getAttribute('data-plan');
        const button = card.querySelector('.plan-select');
        
        if (cardPlan === plan) {
            button.textContent = 'Din nuvarande plan';
            button.disabled = true;
        } else {
            updatePlanButtonText(cardPlan, plan);
            button.disabled = false;
        }
    });
    
    // Uppdatera användarens plan-badge i header om det finns
    const planBadge = document.querySelector('.user-plan-badge');
    if (planBadge) {
        planBadge.textContent = getPlanDisplayName(plan);
        planBadge.className = `user-plan-badge ${plan}`;
    }
}

/**
 * Uppdatera antalet gratisbets baserat på prenumerationsplan
 */
function updatePlanBenefits() {
    const currentPlan = localStorage.getItem('userPlan') || 'free';
    
    // Uppdatera räknare för gratis bets per vecka
    const betsRemainingElement = document.getElementById('free-bets-remaining');
    
    if (betsRemainingElement) {
        if (currentPlan === 'free') {
            const betsRemaining = calculateFreeBetsRemaining();
            betsRemainingElement.textContent = betsRemaining;
        } else if (currentPlan === 'premium') {
            betsRemainingElement.textContent = '5';
        } else if (currentPlan === 'premium-plus') {
            betsRemainingElement.textContent = 'Obegränsat';
        }
    }
    
    // Uppdatera tillgång till winner-takes-all och turneringsfunktioner
    const createBetForm = document.querySelector('.create-bet-form');
    
    if (createBetForm) {
        const winnerTakesAllCheck = createBetForm.querySelector('#winner-takes-all');
        const tournamentCheck = createBetForm.querySelector('#tournament-bet');
        
        if (winnerTakesAllCheck) {
            if (currentPlan === 'free') {
                winnerTakesAllCheck.disabled = true;
                winnerTakesAllCheck.parentElement.classList.add('unavailable');
                winnerTakesAllCheck.parentElement.title = 'Kräver Premium eller Premium+';
            } else {
                winnerTakesAllCheck.disabled = false;
                winnerTakesAllCheck.parentElement.classList.remove('unavailable');
                winnerTakesAllCheck.parentElement.title = '';
            }
        }
        
        if (tournamentCheck) {
            if (currentPlan !== 'premium-plus') {
                tournamentCheck.disabled = true;
                tournamentCheck.parentElement.classList.add('unavailable');
                tournamentCheck.parentElement.title = 'Kräver Premium+';
            } else {
                tournamentCheck.disabled = false;
                tournamentCheck.parentElement.classList.remove('unavailable');
                tournamentCheck.parentElement.title = '';
            }
        }
    }
}

/**
 * Beräkna återstående gratisbets för gratis-användare
 */
function calculateFreeBetsRemaining() {
    // Endast relevant för gratis-användare
    const currentPlan = localStorage.getItem('userPlan') || 'free';
    if (currentPlan !== 'free') return;
    
    // Kontrollera om vi behöver återställa räknaren för en ny vecka
    const lastReset = parseInt(localStorage.getItem('lastFreeBetReset') || '0');
    const now = Date.now();
    const oneWeek = 7 * 24 * 60 * 60 * 1000; // en vecka i millisekunder
    
    if (now - lastReset > oneWeek) {
        // Återställ räknaren för en ny vecka
        localStorage.setItem('freeBetsThisWeek', '0');
        localStorage.setItem('lastFreeBetReset', now.toString());
    }
    
    // Hämta antalet använda gratisbets denna vecka
    const usedBets = parseInt(localStorage.getItem('freeBetsThisWeek') || '0');
    
    // Gratis-användare får 1 gratis bet per vecka
    const remainingBets = Math.max(0, 1 - usedBets);
    
    return remainingBets;
}

/**
 * Använd ett gratisbet
 */
function useFreeBet() {
    const currentPlan = localStorage.getItem('userPlan') || 'free';
    
    // Premium+ användare har obegränsat med bets
    if (currentPlan === 'premium-plus') return true;
    
    // Premium användare har 5 bets per vecka
    if (currentPlan === 'premium') {
        const usedBets = parseInt(localStorage.getItem('premiumBetsThisWeek') || '0');
        
        if (usedBets >= 5) {
            showNotification('Du har använt alla dina gratis premium-bets denna vecka.', 'warning');
            return false;
        }
        
        localStorage.setItem('premiumBetsThisWeek', (usedBets + 1).toString());
        return true;
    }
    
    // Gratis-användare har 1 bet per vecka
    const usedBets = parseInt(localStorage.getItem('freeBetsThisWeek') || '0');
    
    if (usedBets >= 1) {
        showNotification('Du har använt ditt gratisspel för denna vecka. Uppgradera till Premium för fler spel!', 'warning');
        return false;
    }
    
    localStorage.setItem('freeBetsThisWeek', '1');
    return true;
}

/**
 * Få visningsnamn för plan
 */
function getPlanDisplayName(plan) {
    switch (plan) {
        case 'free': return 'Gratis';
        case 'premium': return 'Premium';
        case 'premium-plus': return 'Premium+';
        default: return plan;
    }
} 