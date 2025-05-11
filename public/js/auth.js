/**
 * GoBet - Authentication Client
 * Klientbibliotek för autentisering mot GoBet API
 */

// API URL för auth requests
const API_URL = '/api/auth';

// Hjälpfunktion för att göra API-anrop
async function fetchAPI(url, options = {}) {
  try {
    // Lägg till token i Authorization header om den finns i localStorage
    const token = localStorage.getItem('token');
    if (token) {
      options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`
      };
    }
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Något gick fel');
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Auth object med metoder för auth-hantering
const Auth = {
  /**
   * Registrera en ny användare
   * @param {string} username - Användarens användarnamn
   * @param {string} email - Användarens e-post
   * @param {string} password - Användarens lösenord
   * @returns {Promise<Object>} API-svar
   */
  async register(username, email, password) {
    try {
      const data = await fetchAPI(`${API_URL}/register`, {
        method: 'POST',
        body: JSON.stringify({ username, email, password })
      });
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      return data;
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Logga in en användare
   * @param {string} email - Användarens e-post
   * @param {string} password - Användarens lösenord
   * @returns {Promise<Object>} API-svar
   */
  async login(email, password) {
    try {
      const data = await fetchAPI(`${API_URL}/login`, {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      return data;
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Logga ut användaren
   * @returns {Promise<Object>} API-svar
   */
  async logout() {
    try {
      await fetchAPI(`${API_URL}/logout`, {
        method: 'POST'
      });
      
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Uppdatera UI
      this.updateAuthUI();
    } catch (error) {
      console.error('Utloggningsfel:', error);
      // Rensa lokal lagring även vid fel
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },
  
  /**
   * Hämta inloggad användare
   * @returns {Promise<Object>} API-svar
   */
  async getUser() {
    try {
      const data = await fetchAPI(`${API_URL}/me`);
      localStorage.setItem('user', JSON.stringify(data.user));
      return data.user;
    } catch (error) {
      console.error('Fel vid hämtning av användare:', error);
      return null;
    }
  },
  
  /**
   * Kontrollera om användaren är inloggad
   * @returns {boolean} true om användaren är inloggad
   */
  isLoggedIn() {
    return localStorage.getItem('token') !== null && localStorage.getItem('user') !== null;
  },
  
  /**
   * Hämta användarinfo från lokal lagring
   * @returns {Object|null} Användarinfo eller null om inte inloggad
   */
  getCurrentUser() {
    const userJson = localStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
  },
  
  /**
   * Uppdatera UI baserat på inloggningsstatus
   */
  updateAuthUI() {
    const isLoggedIn = this.isLoggedIn();
    const currentUser = this.getCurrentUser();
    
    // Elemnent som ska visas/döljas när inloggad/utloggad
    const authButtons = document.querySelectorAll('.auth-button');
    const userElements = document.querySelectorAll('.user-element');
    const createBetButton = document.querySelector('.create-bet-button');
    
    if (isLoggedIn && currentUser) {
      // Dölj login/register knappar
      authButtons.forEach(button => {
        button.style.display = 'none';
      });
      
      // Visa användarspecifika element
      userElements.forEach(element => {
        element.style.display = 'block';
        
        // Uppdatera användarnamn om elementet har username-klass
        if (element.classList.contains('username')) {
          element.textContent = currentUser.username;
        }
        
        // Uppdatera saldo om elementet har balance-klass
        if (element.classList.contains('balance')) {
          element.textContent = `${currentUser.balance || 0} GoCoins`;
        }
      });
      
      // Visa skapa bet knapp om den finns
      if (createBetButton) {
        createBetButton.style.display = 'block';
      }
    } else {
      // Visa login/register knappar
      authButtons.forEach(button => {
        button.style.display = 'inline-flex';
      });
      
      // Dölj användarspecifika element
      userElements.forEach(element => {
        element.style.display = 'none';
      });
      
      // Dölj skapa bet knapp om den finns
      if (createBetButton) {
        createBetButton.style.display = 'none';
      }
    }
  }
};

// Hantera login-formulär
document.addEventListener('DOMContentLoaded', () => {
  // Uppdatera UI när sidan laddas
  Auth.updateAuthUI();
  
  // Hämta användare om token finns men user info saknas
  if (localStorage.getItem('token') && !localStorage.getItem('user')) {
    Auth.getUser().then(() => {
      Auth.updateAuthUI();
    });
  }
  
  // Login form handler
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Visa en loading indikator
      const submitButton = loginForm.querySelector('button[type="submit"]');
      const originalButtonText = submitButton.textContent;
      submitButton.textContent = 'Loggar in...';
      submitButton.disabled = true;
      
      const errorEl = document.getElementById('login-error');
      errorEl.textContent = '';
      
      const email = loginForm.querySelector('[name="email"]').value;
      const password = loginForm.querySelector('[name="password"]').value;
      
      try {
        await Auth.login(email, password);
        
        // Stäng modal
        if (typeof closeLoginModal === 'function') {
          closeLoginModal();
        }
        
        // Uppdatera UI
        Auth.updateAuthUI();
        
        // Återställ formulär
        loginForm.reset();
        
        // Ladda om sidan om användaren omdirigeras
        if (loginForm.dataset.redirect) {
          window.location.href = loginForm.dataset.redirect;
        } else {
          // Ladda om aktuell sida för att uppdatera allt
          window.location.reload();
        }
      } catch (error) {
        console.error('Login error:', error);
        errorEl.textContent = error.message || 'Fel e-post eller lösenord';
      } finally {
        // Återställ knappen
        submitButton.textContent = originalButtonText;
        submitButton.disabled = false;
      }
    });
  }
  
  // Register form handler
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Visa en loading indikator
      const submitButton = registerForm.querySelector('button[type="submit"]');
      const originalButtonText = submitButton.textContent;
      submitButton.textContent = 'Skapar konto...';
      submitButton.disabled = true;
      
      const errorEl = document.getElementById('register-error');
      errorEl.textContent = '';
      
      const username = registerForm.querySelector('[name="username"]').value;
      const email = registerForm.querySelector('[name="email"]').value;
      const password = registerForm.querySelector('[name="password"]').value;
      const confirmPassword = registerForm.querySelector('[name="confirmPassword"]').value;
      
      // Validera lösenord
      if (password !== confirmPassword) {
        errorEl.textContent = 'Lösenorden matchar inte';
        submitButton.textContent = originalButtonText;
        submitButton.disabled = false;
        return;
      }
      
      try {
        await Auth.register(username, email, password);
        
        // Stäng modal
        if (typeof closeRegisterModal === 'function') {
          closeRegisterModal();
        }
        
        // Uppdatera UI
        Auth.updateAuthUI();
        
        // Återställ formulär
        registerForm.reset();
        
        // Ladda om sidan om användaren omdirigeras
        if (registerForm.dataset.redirect) {
          window.location.href = registerForm.dataset.redirect;
        } else {
          // Ladda om aktuell sida för att uppdatera allt
          window.location.reload();
        }
      } catch (error) {
        console.error('Register error:', error);
        errorEl.textContent = error.message || 'Ett fel uppstod vid registrering';
      } finally {
        // Återställ knappen
        submitButton.textContent = originalButtonText;
        submitButton.disabled = false;
      }
    });
  }
  
  // Logout handler
  const logoutButton = document.getElementById('logout-button');
  if (logoutButton) {
    logoutButton.addEventListener('click', async (e) => {
      e.preventDefault();
      await Auth.logout();
      
      // Ladda om sidan efter utloggning
      window.location.reload();
    });
  }
});

// Exportera Auth för användning i andra skript
window.Auth = Auth;
