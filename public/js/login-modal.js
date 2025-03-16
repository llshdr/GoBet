/**
 * Login Modal Script
 * Hanterar inloggningsmodalen som visas på alla sidor.
 */

// Skapa login-modalen direkt när skriptet laddas
const loginModalHTML = `
  <div class="login-modal" id="loginModal">
    <div class="login-modal-overlay"></div>
    <div class="login-modal-container">
      <div class="login-modal-header">
        <h2>Logga in</h2>
        <button class="login-modal-close" aria-label="Stäng">×</button>
      </div>
      <div class="login-modal-body">
        <form class="auth-form" id="loginForm">
          <div class="form-group">
            <label class="form-label" for="loginEmail">E-postadress</label>
            <div class="form-input-icon">
              <i class="fas fa-envelope input-icon"></i>
              <input type="email" id="loginEmail" class="form-input" required>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label" for="loginPassword">Lösenord</label>
            <div class="form-input-icon">
              <i class="fas fa-lock input-icon"></i>
              <input type="password" id="loginPassword" class="form-input" required>
              <button type="button" class="password-toggle" aria-label="Visa/dölj lösenord">
                <i class="fas fa-eye"></i>
              </button>
            </div>
          </div>
          <div class="form-check">
            <input type="checkbox" id="rememberMe">
            <label for="rememberMe">Kom ihåg mig</label>
          </div>
          <button type="submit" class="auth-button" id="loginSubmit">
            <i class="fas fa-sign-in-alt"></i>
            Logga in
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
            <a href="#" class="forgot-password">Glömt lösenord?</a>
          </div>
        </form>
      </div>
    </div>
  </div>
`;

// Kontrollera om modalen redan finns i DOM:en
if (!document.getElementById('loginModal')) {
  // Lägg till modalen i DOM:en när skriptet laddas
  document.body.insertAdjacentHTML('beforeend', loginModalHTML);
}

// Hämta DOM-element
const loginModal = document.getElementById('loginModal');
const loginForm = document.getElementById('loginForm');
const passwordInput = document.getElementById('loginPassword');
const passwordToggle = loginModal.querySelector('.password-toggle');
const closeButton = loginModal.querySelector('.login-modal-close');
const overlay = loginModal.querySelector('.login-modal-overlay');

// Funktion för att öppna modalen
function openLoginModal() {
  // Spara nuvarande sidans scroll-position
  const scrollY = window.scrollY;
  
  loginModal.classList.add('open');
  document.body.style.overflow = 'hidden';
  document.body.style.position = 'fixed';
  document.body.style.top = `-${scrollY}px`;
  document.body.style.width = '100%';
}

// Funktion för att stänga modalen
function closeLoginModal() {
  loginModal.classList.remove('open');
  
  // Återställ scroll-position
  const scrollY = document.body.style.top;
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.overflow = '';
  document.body.style.width = '';
  window.scrollTo(0, parseInt(scrollY || '0') * -1);
}

// Hantera stängning av modalen
closeButton.addEventListener('click', closeLoginModal);
overlay.addEventListener('click', closeLoginModal);

// Hantera lösenordsvisning
passwordToggle.addEventListener('click', () => {
  const type = passwordInput.type === 'password' ? 'text' : 'password';
  passwordInput.type = type;
  passwordToggle.querySelector('i').className = `fas fa-${type === 'password' ? 'eye' : 'eye-slash'}`;
});

// Hantera formulärinlämning
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const submitButton = loginForm.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loggar in...';
  
  try {
    // Simulera backend-anrop
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulera framgångsrik inloggning
    window.location.reload();
  } catch (error) {
    alert('Ett fel uppstod. Försök igen senare.');
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = '<i class="fas fa-sign-in-alt"></i> Logga in';
  }
});

// Exportera funktioner för användning i andra filer
window.openLoginModal = openLoginModal;
window.closeLoginModal = closeLoginModal;