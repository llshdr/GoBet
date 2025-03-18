/**
 * Login Modal Script
 * Hanterar inloggningsmodalen som visas på alla sidor.
 */

// Login-modal
document.addEventListener('DOMContentLoaded', function() {
    // Skapa modal-strukturen
    const modalHTML = `
        <div class="modal" id="loginModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Logga in</h2>
                    <button class="close-button" aria-label="Stäng">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="loginForm" class="auth-form">
                        <div class="form-group">
                            <label for="loginEmail">E-post</label>
                            <input type="email" id="loginEmail" name="email" required>
                        </div>
                        <div class="form-group">
                            <label for="loginPassword">Lösenord</label>
                            <div class="password-input">
                                <input type="password" id="loginPassword" name="password" required>
                                <button type="button" class="toggle-password" aria-label="Visa/dölj lösenord">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="rememberMe" name="rememberMe">
                                <span>Kom ihåg mig</span>
                            </label>
                        </div>
                        <button type="submit" class="btn btn-primary btn-block">
                            <i class="fas fa-sign-in-alt"></i>
                            Logga in
                        </button>
                        <div class="social-login">
                            <p>Eller logga in med</p>
                            <div class="social-buttons">
                                <button type="button" class="btn btn-social btn-google">
                                    <i class="fab fa-google"></i>
                                    Google
                                </button>
                                <button type="button" class="btn btn-social btn-facebook">
                                    <i class="fab fa-facebook-f"></i>
                                    Facebook
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;

    // Lägg till modal i body
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Hämta modal-element
    const modal = document.getElementById('loginModal');
    const closeButton = modal.querySelector('.close-button');
    const loginForm = document.getElementById('loginForm');
    const togglePasswordButton = modal.querySelector('.toggle-password');
    const passwordInput = modal.querySelector('#loginPassword');

    // Funktion för att öppna modalen
    window.openLoginModal = function() {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    };

    // Funktion för att stänga modalen
    window.closeLoginModal = function() {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    };

    // Event listeners
    closeButton.addEventListener('click', closeLoginModal);
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeLoginModal();
        }
    });

    // Toggle password visibility
    togglePasswordButton.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        this.querySelector('i').classList.toggle('fa-eye');
        this.querySelector('i').classList.toggle('fa-eye-slash');
    });

    // Hantera formulärinlämning
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const rememberMe = document.getElementById('rememberMe').checked;

        // Här kan vi lägga till riktig autentisering
        // För nu använder vi en enkel simulering
        if (email && password) {
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userEmail', email);
            if (rememberMe) {
                localStorage.setItem('rememberMe', 'true');
            }
            closeLoginModal();
            alert('Inloggning lyckades!');
        } else {
            alert('Vänligen fyll i både e-post och lösenord');
        }
    });
});