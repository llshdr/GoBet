/**
 * Login Modal Script
 * Hanterar inloggningsmodalen som visas på alla sidor.
 */

document.addEventListener('DOMContentLoaded', function() {
  // Skapa modalstrukturen
  const modalHtml = `
    <div class="login-modal" id="loginModal">
      <div class="login-modal-overlay"></div>
      <div class="login-modal-container">
        <div class="login-modal-header">
          <h2>Logga in på GoBet</h2>
          <button class="login-modal-close" aria-label="Stäng">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="login-modal-body">
          <div class="auth-form">
            <div class="form-group">
              <label for="loginEmail" class="form-label">E-postadress</label>
              <div class="form-input-icon">
                <i class="fas fa-envelope input-icon"></i>
                <input type="email" id="loginEmail" class="form-input" placeholder="exempel@mail.com" required>
              </div>
            </div>
            
            <div class="form-group">
              <label for="loginPassword" class="form-label">Lösenord</label>
              <div class="form-input-icon">
                <i class="fas fa-lock input-icon"></i>
                <input type="password" id="loginPassword" class="form-input" placeholder="Lösenord" required>
                <button type="button" class="password-toggle" aria-label="Visa/dölj lösenord">
                  <i class="fas fa-eye"></i>
                </button>
              </div>
            </div>
            
            <div class="remember-forgot">
              <div class="remember-me">
                <input type="checkbox" id="rememberMe">
                <label for="rememberMe">Kom ihåg mig</label>
              </div>
              <a href="forgot-password.html" class="forgot-password">Glömt lösenord?</a>
            </div>
            
            <button type="button" class="auth-button" id="loginSubmit">
              <i class="fas fa-sign-in-alt"></i>
              Logga in
            </button>
            
            <div class="auth-divider">eller fortsätt med</div>
            
            <div class="social-login">
              <button type="button" class="social-button google-login">
                <i class="fab fa-google"></i>
                Google
              </button>
              <button type="button" class="social-button facebook-login">
                <i class="fab fa-facebook-f"></i>
                Facebook
              </button>
            </div>
            
            <div class="auth-redirect">
              Har du inget konto? 
              <a href="register.html" class="redirect-link">Skapa konto</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Lägg till modalen i slutet av body
  document.body.insertAdjacentHTML('beforeend', modalHtml);
  
  // Element-referenser
  const loginModal = document.getElementById('loginModal');
  const loginButtons = document.querySelectorAll('.login-button');
  const closeButton = document.querySelector('.login-modal-close');
  const overlay = document.querySelector('.login-modal-overlay');
  const passwordToggle = document.querySelector('.password-toggle');
  const passwordInput = document.getElementById('loginPassword');
  const loginSubmit = document.getElementById('loginSubmit');

  // Funktion för att öppna modal
  function openLoginModal() {
    loginModal.classList.add('open');
    document.body.style.overflow = 'hidden'; // Förhindra scrollning av sidan
  }
  
  // Funktion för att stänga modal
  function closeLoginModal() {
    loginModal.classList.remove('open');
    document.body.style.overflow = ''; // Återställ scrollning
  }
  
  // Lägg till event listeners
  loginButtons.forEach(button => {
    button.addEventListener('click', openLoginModal);
  });
  
  closeButton.addEventListener('click', closeLoginModal);
  
  overlay.addEventListener('click', closeLoginModal);
  
  // Visa/dölj lösenord
  passwordToggle.addEventListener('click', function() {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    this.querySelector('i').classList.toggle('fa-eye');
    this.querySelector('i').classList.toggle('fa-eye-slash');
  });
  
  // Hantera inloggning (demo)
  loginSubmit.addEventListener('click', function() {
    const email = document.getElementById('loginEmail').value;
    const password = passwordInput.value;
    
    if (email && password) {
      // Här skulle vi egentligen skicka en inloggningsförfrågan till servern
      // Men för demo-syfte simulerar vi bara en inloggning
      loginSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loggar in...';
      
      setTimeout(() => {
        // Simulera framgångsrik inloggning
        window.location.reload();
      }, 1500);
    } else {
      alert('Vänligen fyll i både e-post och lösenord.');
    }
  });
  
  // Lyssna på Enter-tangent
  document.getElementById('loginPassword').addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
      loginSubmit.click();
    }
  });
  
  // Exportera funktioner för att kunna användas från andra platser
  window.LoginModal = {
    open: openLoginModal,
    close: closeLoginModal
  };
}); 