/**
 * Register Modal Script
 * Hanterar registreringsmodalen som visas på alla sidor.
 */

// Skapa register-modalen direkt när skriptet laddas
const registerModalHTML = `
  <div class="login-modal register-modal" id="registerModal">
    <div class="login-modal-overlay"></div>
    <div class="login-modal-container">
      <div class="login-modal-header">
        <h2>Skapa konto</h2>
        <button class="login-modal-close" aria-label="Stäng">×</button>
      </div>
      <div class="login-modal-body">
        <form class="auth-form" id="registerForm">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label" for="firstName">Förnamn</label>
              <div class="form-input-icon">
                <i class="fas fa-user input-icon"></i>
                <input type="text" id="firstName" class="form-input" required>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label" for="lastName">Efternamn</label>
              <div class="form-input-icon">
                <i class="fas fa-user input-icon"></i>
                <input type="text" id="lastName" class="form-input" required>
              </div>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label" for="registerUsername">Användarnamn</label>
            <div class="form-input-icon">
              <i class="fas fa-at input-icon"></i>
              <input type="text" id="registerUsername" class="form-input" required>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label" for="registerEmail">E-postadress</label>
            <div class="form-input-icon">
              <i class="fas fa-envelope input-icon"></i>
              <input type="email" id="registerEmail" class="form-input" required>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label" for="registerPassword">Lösenord</label>
            <div class="form-input-icon">
              <i class="fas fa-lock input-icon"></i>
              <input type="password" id="registerPassword" class="form-input" required>
              <button type="button" class="password-toggle" aria-label="Visa/dölj lösenord">
                <i class="fas fa-eye"></i>
              </button>
            </div>
            <div class="password-strength-container">
              <div class="password-strength-bar"></div>
            </div>
            <div class="password-strength-text"></div>
          </div>
          <div class="form-check">
            <input type="checkbox" id="termsAgree" required>
            <label for="termsAgree">
              Jag godkänner <a href="/terms" target="_blank">användarvillkoren</a> och 
              <a href="/privacy" target="_blank">integritetspolicyn</a>
            </label>
          </div>
          <button type="submit" class="auth-button">
            <i class="fas fa-user-plus"></i>
            Skapa konto
          </button>
          <div class="auth-divider">eller</div>
          <div class="social-login">
            <button type="button" class="social-button google-login">
              <i class="fab fa-google"></i>
              Google
            </button>
            <button type="button" class="social-button facebook-login">
              <i class="fab fa-facebook"></i>
              Facebook
            </button>
          </div>
          <div class="auth-redirect">
            Har du redan ett konto? 
            <a href="#" class="redirect-link" onclick="closeRegisterModal(); openLoginModal(); return false;">
              Logga in här
            </a>
          </div>
        </form>
      </div>
    </div>
  </div>
`;

// Lägg till modalen i DOM:en när skriptet laddas
document.body.insertAdjacentHTML('beforeend', registerModalHTML);

// Hämta DOM-element
const registerModal = document.getElementById('registerModal');
const registerForm = document.getElementById('registerForm');
const passwordInput = document.getElementById('registerPassword');
const passwordToggle = registerModal.querySelector('.password-toggle');
const passwordStrengthBar = registerModal.querySelector('.password-strength-bar');
const passwordStrengthText = registerModal.querySelector('.password-strength-text');
const closeButton = registerModal.querySelector('.login-modal-close');
const overlay = registerModal.querySelector('.login-modal-overlay');

// Funktion för att öppna modalen
function openRegisterModal() {
  registerModal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

// Funktion för att stänga modalen
function closeRegisterModal() {
  registerModal.classList.remove('open');
  document.body.style.overflow = '';
}

// Hantera stängning av modalen
closeButton.addEventListener('click', closeRegisterModal);
overlay.addEventListener('click', closeRegisterModal);

// Hantera lösenordsvisning
passwordToggle.addEventListener('click', () => {
  const type = passwordInput.type === 'password' ? 'text' : 'password';
  passwordInput.type = type;
  passwordToggle.querySelector('i').className = `fas fa-${type === 'password' ? 'eye' : 'eye-slash'}`;
});

// Funktion för att beräkna lösenordsstyrka
function calculatePasswordStrength(password) {
  let strength = 0;
  if (password.length >= 8) strength += 25;
  if (password.match(/[a-z]+/)) strength += 25;
  if (password.match(/[A-Z]+/)) strength += 25;
  if (password.match(/[0-9]+/)) strength += 25;
  return strength;
}

// Uppdatera lösenordsstyrka
passwordInput.addEventListener('input', () => {
  const strength = calculatePasswordStrength(passwordInput.value);
  passwordStrengthBar.style.width = `${strength}%`;
  
  let color = '#ff4747';
  let text = 'Svagt';
  
  if (strength >= 75) {
    color = '#2ecc71';
    text = 'Starkt';
  } else if (strength >= 50) {
    color = '#f1c40f';
    text = 'Medel';
  } else if (strength >= 25) {
    color = '#e67e22';
    text = 'Svagt';
  }
  
  passwordStrengthBar.style.backgroundColor = color;
  passwordStrengthText.textContent = `Lösenordsstyrka: ${text}`;
});

// Hantera formulärinlämning
registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const submitButton = registerForm.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Skapar konto...';
  
  try {
    // Simulera backend-anrop
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Visa framgångsmeddelande
    alert('Ditt konto har skapats! Du kommer nu att omdirigeras till inloggningssidan.');
    closeRegisterModal();
    
    // Öppna login-modalen
    if (typeof openLoginModal === 'function') {
      openLoginModal();
    }
  } catch (error) {
    alert('Ett fel uppstod. Försök igen senare.');
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = '<i class="fas fa-user-plus"></i> Skapa konto';
  }
});

// Exportera funktioner för användning i andra filer
window.openRegisterModal = openRegisterModal;
window.closeRegisterModal = closeRegisterModal; 