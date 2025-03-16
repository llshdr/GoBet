/**
 * Register Modal Script
 * 
 * Hanterar funktionaliteten för registreringsmodalen.
 */

// Skapa register-modal elementet när DOM är redo
let registerModalCreated = false;
let registerModal;

function createRegisterModal() {
    if (registerModalCreated) return;
    
    // Skapa modalen
    registerModal = document.createElement('div');
    registerModal.className = 'register-modal';
    registerModal.innerHTML = `
        <div class="register-modal-overlay"></div>
        <div class="register-modal-container">
            <div class="register-modal-header">
                <h2>Skapa konto</h2>
                <button class="register-modal-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="register-modal-body">
                <form class="auth-form" id="registerForm">
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label" for="registerFirstName">Förnamn</label>
                            <div class="form-input-icon">
                                <i class="fas fa-user input-icon"></i>
                                <input class="form-input" type="text" id="registerFirstName" placeholder="Förnamn" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="registerLastName">Efternamn</label>
                            <div class="form-input-icon">
                                <i class="fas fa-user input-icon"></i>
                                <input class="form-input" type="text" id="registerLastName" placeholder="Efternamn" required>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label" for="registerUsername">Användarnamn</label>
                        <div class="form-input-icon">
                            <i class="fas fa-user-tag input-icon"></i>
                            <input class="form-input" type="text" id="registerUsername" placeholder="Välj ett unikt användarnamn" required>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label" for="registerEmail">E-post</label>
                        <div class="form-input-icon">
                            <i class="fas fa-envelope input-icon"></i>
                            <input class="form-input" type="email" id="registerEmail" placeholder="din.epost@exempel.se" required>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label" for="registerPassword">Lösenord</label>
                        <div class="form-input-icon">
                            <i class="fas fa-lock input-icon"></i>
                            <input class="form-input" type="password" id="registerPassword" placeholder="Minst 8 tecken" required>
                            <button type="button" class="password-toggle" id="registerPasswordToggle">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                        <div class="password-strength-container">
                            <div id="passwordStrength" class="password-strength-bar"></div>
                        </div>
                        <div id="passwordStrengthText" class="password-strength-text">Lösenordsstyrka: Inget lösenord</div>
                    </div>
                    
                    <div class="form-check">
                        <input type="checkbox" id="termsAgreement" required>
                        <label for="termsAgreement">
                            Jag accepterar <a href="terms.html">användarvillkoren</a> och <a href="privacy.html">integritetspolicyn</a>
                        </label>
                    </div>
                    
                    <button type="submit" class="auth-button">
                        <i class="fas fa-user-plus"></i> Skapa konto
                    </button>
                    
                    <div class="auth-divider">eller registrera med</div>
                    
                    <div class="social-login">
                        <button type="button" class="social-button google-login">
                            <i class="fab fa-google"></i> Google
                        </button>
                        <button type="button" class="social-button facebook-login">
                            <i class="fab fa-facebook-f"></i> Facebook
                        </button>
                    </div>
                    
                    <div class="auth-redirect">
                        Har du redan ett konto? <a href="#" id="loginLink" class="redirect-link">Logga in</a>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    // Lägg till i body
    document.body.appendChild(registerModal);
    
    // Hantera stängning av modalen när man klickar på stäng-knappen
    const closeButton = registerModal.querySelector('.register-modal-close');
    closeButton.addEventListener('click', closeRegisterModal);
    
    // Hantera stängning av modalen när man klickar på overlay
    const overlay = registerModal.querySelector('.register-modal-overlay');
    overlay.addEventListener('click', closeRegisterModal);
    
    // Hantera lösenordsvisning
    const passwordToggle = registerModal.querySelector('#registerPasswordToggle');
    const passwordInput = registerModal.querySelector('#registerPassword');
    
    passwordToggle.addEventListener('click', function() {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            passwordToggle.innerHTML = '<i class="fas fa-eye-slash"></i>';
        } else {
            passwordInput.type = 'password';
            passwordToggle.innerHTML = '<i class="fas fa-eye"></i>';
        }
    });
    
    // Hantera lösenordsstyrka
    const strengthBar = registerModal.querySelector('#passwordStrength');
    const strengthText = registerModal.querySelector('#passwordStrengthText');
    
    passwordInput.addEventListener('input', function() {
        const password = this.value;
        let strength = 0;
        let status = '';
        
        if (password.length >= 8) strength += 25;
        if (/[A-Z]/.test(password)) strength += 25;
        if (/[0-9]/.test(password)) strength += 25;
        if (/[^A-Za-z0-9]/.test(password)) strength += 25;
        
        strengthBar.style.width = strength + '%';
        
        if (strength <= 25) {
            strengthBar.style.backgroundColor = '#ff4747';
            status = 'Svagt';
        } else if (strength <= 50) {
            strengthBar.style.backgroundColor = '#ffc107';
            status = 'Medel';
        } else if (strength <= 75) {
            strengthBar.style.backgroundColor = '#2196f3';
            status = 'Bra';
        } else {
            strengthBar.style.backgroundColor = '#4caf50';
            status = 'Starkt';
        }
        
        strengthText.textContent = 'Lösenordsstyrka: ' + (password.length ? status : 'Inget lösenord');
    });
    
    // Hantera registrering
    const registerForm = registerModal.querySelector('#registerForm');
    
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const firstName = registerModal.querySelector('#registerFirstName').value;
        const lastName = registerModal.querySelector('#registerLastName').value;
        const username = registerModal.querySelector('#registerUsername').value;
        const email = registerModal.querySelector('#registerEmail').value;
        const password = registerModal.querySelector('#registerPassword').value;
        const termsAgreed = registerModal.querySelector('#termsAgreement').checked;
        
        if (!firstName || !lastName || !username || !email || !password) {
            alert('Vänligen fyll i alla obligatoriska fält.');
            return;
        }
        
        if (!termsAgreed) {
            alert('Du måste acceptera våra användarvillkor och integritetspolicy för att fortsätta.');
            return;
        }
        
        // Visa ett framgångsmeddelande (ersätt med faktisk registrering)
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>Ditt konto har skapats! Du kommer att omdirigeras till startsidan...</span>
        `;
        
        registerForm.prepend(successMessage);
        
        // Simulera backend-anrop och omdirigering
        setTimeout(function() {
            closeRegisterModal();
            window.location.reload();
        }, 2000);
    });
    
    // Hantera övergång till inloggning
    const loginLink = registerModal.querySelector('#loginLink');
    loginLink.addEventListener('click', function(e) {
        e.preventDefault();
        closeRegisterModal();
        
        // Vänta en stund innan inloggningsmodalen öppnas
        setTimeout(function() {
            if (typeof openLoginModal === 'function') {
                openLoginModal();
            }
        }, 300);
    });
    
    registerModalCreated = true;
}

// Öppna register-modal
function openRegisterModal() {
    if (!registerModalCreated) {
        createRegisterModal();
    }
    
    registerModal.classList.add('open');
    document.body.style.overflow = 'hidden'; // Förhindra scrollning av bakgrunden
}

// Stäng register-modal
function closeRegisterModal() {
    if (registerModal) {
        registerModal.classList.remove('open');
        document.body.style.overflow = ''; // Återställ scrollning
    }
}

// Exportera funktioner för att användas i andra script
window.openRegisterModal = openRegisterModal;
window.closeRegisterModal = closeRegisterModal; 