// Skapa bet-modal
document.addEventListener('DOMContentLoaded', function() {
    // Skapa modal-strukturen
    const modalHTML = `
        <div class="modal" id="createBetModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Skapa ny bet</h2>
                    <button class="close-button" aria-label="Stäng">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="createBetForm" class="auth-form">
                        <div class="form-group">
                            <label for="betTitle">Titel</label>
                            <input type="text" id="betTitle" name="betTitle" required>
                        </div>
                        <div class="form-group">
                            <label for="betDescription">Beskrivning</label>
                            <textarea id="betDescription" name="betDescription" required></textarea>
                        </div>
                        <div class="form-group">
                            <label for="betType">Typ av bet</label>
                            <select id="betType" name="betType" required>
                                <option value="sport">Sport</option>
                                <option value="entertainment">Nöje</option>
                                <option value="games">Spel</option>
                                <option value="other">Annat</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="betAmount">Insats (GoCoins)</label>
                            <input type="number" id="betAmount" name="betAmount" min="100" required>
                        </div>
                        <div class="form-group">
                            <label for="betDeadline">Deadline</label>
                            <input type="datetime-local" id="betDeadline" name="betDeadline" required>
                        </div>
                        <div class="form-group">
                            <label for="betOptions">Alternativ (ett per rad)</label>
                            <textarea id="betOptions" name="betOptions" placeholder="Alternativ 1&#10;Alternativ 2&#10;Alternativ 3" required></textarea>
                        </div>
                        <div class="form-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="wta" name="wta">
                                <span>Winner Takes All</span>
                            </label>
                        </div>
                        <button type="submit" class="btn btn-primary btn-block">
                            <i class="fas fa-plus-circle"></i>
                            Skapa bet
                        </button>
                    </form>
                </div>
            </div>
        </div>
    `;

    // Lägg till modal i body
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Hämta modal-element
    const modal = document.getElementById('createBetModal');
    const closeButton = modal.querySelector('.close-button');
    const createBetForm = document.getElementById('createBetForm');

    // Funktion för att öppna modalen
    window.openCreateBetModal = function() {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    };

    // Funktion för att stänga modalen
    window.closeCreateBetModal = function() {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    };

    // Event listeners
    closeButton.addEventListener('click', closeCreateBetModal);
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeCreateBetModal();
        }
    });

    // Hantera formulärinlämning
    createBetForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Här kan du lägga till logik för att hantera skapande av bet
        // För nu visar vi bara ett meddelande
        alert('Bet skapad!');
        closeCreateBetModal();
    });
}); 