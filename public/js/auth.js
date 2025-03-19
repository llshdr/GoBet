/**
 * GoBet - Authentication Client
 * Klientbibliotek för autentisering mot GoBet API
 */

// API-URL
const API_URL = 'http://localhost:3000'; // Ändra till rätt URL i produktion

// Hjälpfunktion för att göra API-anrop
async function fetchAPI(endpoint, options = {}) {
  try {
    // Standardinställningar för fetch
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include' // Skicka med cookies
    };
    
    // Kombinera användaralternativ med standardalternativ
    const fetchOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers
      }
    };
    
    // Gör API-anropet
    const response = await fetch(`${API_URL}${endpoint}`, fetchOptions);
    const data = await response.json();
    
    // Returnera svaret
    return {
      success: response.ok,
      status: response.status,
      data
    };
  } catch (error) {
    console.error('API-anropsfel:', error);
    return {
      success: false,
      status: 0,
      data: { message: 'Kunde inte ansluta till servern' }
    };
  }
}

// Autentiseringsbibliotek
const Auth = {
  /**
   * Registrera en ny användare
   * @param {Object} userData - Användardata
   * @returns {Promise<Object>} API-svar
   */
  async register(userData) {
    return await fetchAPI('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },
  
  /**
   * Logga in en användare
   * @param {string} email - Användarens e-post
   * @param {string} password - Användarens lösenord
   * @returns {Promise<Object>} API-svar
   */
  async login(email, password) {
    const response = await fetchAPI('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    
    // Om inloggningen lyckades, spara token och användarinfo
    if (response.success && response.data.data) {
      const { token, user } = response.data.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Uppdatera UI för inloggad användare
      this.updateAuthUI(user);
    }
    
    return response;
  },
  
  /**
   * Logga ut användaren
   * @returns {Promise<Object>} API-svar
   */
  async logout() {
    const response = await fetchAPI('/api/auth/logout', {
      method: 'POST'
    });
    
    // Rensa lokal lagring oavsett om API-anropet lyckades
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Uppdatera UI för utloggad användare
    this.updateAuthUI(null);
    
    return response;
  },
  
  /**
   * Hämta inloggad användare
   * @returns {Promise<Object>} API-svar
   */
  async getUser() {
    // Hämta token från localStorage
    const token = localStorage.getItem('token');
    const headers = {};
    
    // Lägg till token i headers om den finns
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetchAPI('/api/auth/me', { headers });
    
    // Om användaren är inloggad, uppdatera UI
    if (response.success && response.data.loggedIn) {
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
      this.updateAuthUI(response.data.data.user);
    } else {
      // Om användaren inte är inloggad, rensa lokal lagring
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      this.updateAuthUI(null);
    }
    
    return response;
  },
  
  /**
   * Kontrollera om användaren är inloggad
   * @returns {boolean} true om användaren är inloggad
   */
  isLoggedIn() {
    return localStorage.getItem('token') !== null && 
           localStorage.getItem('user') !== null;
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
   * @param {Object|null} user - Användarinfo eller null om utloggad
   */
  updateAuthUI(user) {
    const topMenu = document.querySelector('.top-menu');
    const balanceDisplay = document.querySelector('.balance-amount') || 
                           document.querySelector('.balance-display span') ||
                           document.querySelector('.user-balance span');
    
    if (!topMenu) return; // Ingen meny att uppdatera
    
    if (user) {
      // Uppdatera för inloggad användare
      if (balanceDisplay) {
        balanceDisplay.textContent = user.coins.toLocaleString();
      }
      
      // Uppdatera menyn
      topMenu.innerHTML = `
        <div class="user-info">
          <span class="welcome-text">Välkommen, ${user.display_name || user.username}</span>
        </div>
        <button type="button" class="logout-btn" onclick="handleLogout()">
          <i class="fas fa-sign-out-alt"></i>
          <span>Logga ut</span>
        </button>
      `;
      
      // Uppdatera synlighet för element som kräver inloggning
      document.querySelectorAll('.requires-auth').forEach(el => {
        el.classList.remove('hidden');
      });
      
      // Dölj element som bara ska visas för utloggade användare
      document.querySelectorAll('.logged-out-only').forEach(el => {
        el.classList.add('hidden');
      });
    } else {
      // Uppdatera för utloggad användare
      if (balanceDisplay) {
        balanceDisplay.textContent = '0';
      }
      
      // Uppdatera menyn
      topMenu.innerHTML = `
        <button type="button" class="login-btn" onclick="openLoginModal()">
          <i class="fas fa-user"></i>
          <span>Logga in</span>
        </button>
        <button type="button" class="register-btn" onclick="openRegisterModal()">
          <i class="fas fa-user-plus"></i>
          <span>Skapa konto</span>
        </button>
      `;
      
      // Dölj element som kräver inloggning
      document.querySelectorAll('.requires-auth').forEach(el => {
        el.classList.add('hidden');
      });
      
      // Visa element som bara ska visas för utloggade användare
      document.querySelectorAll('.logged-out-only').forEach(el => {
        el.classList.remove('hidden');
      });
    }
  }
};

// Hantera inloggningsformulär
function handleLogin(event) {
  event.preventDefault();
  
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const errorMessage = document.getElementById('login-error');
  
  // Rensa felmeddelande
  if (errorMessage) {
    errorMessage.textContent = '';
  }
  
  // Validera indata
  if (!email || !password) {
    if (errorMessage) {
      errorMessage.textContent = 'Vänligen fyll i alla fält';
    }
    return;
  }
  
  // Visa laddningsindikator
  const loginButton = document.querySelector('#login-form button[type="submit"]');
  if (loginButton) {
    loginButton.disabled = true;
    loginButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loggar in...';
  }
  
  // Logga in
  Auth.login(email, password)
    .then(response => {
      if (response.success) {
        // Stäng modal
        closeLoginModal();
      } else {
        // Visa felmeddelande
        if (errorMessage) {
          errorMessage.textContent = response.data.message || 'Inloggningen misslyckades';
        }
      }
    })
    .catch(error => {
      console.error('Login error:', error);
      if (errorMessage) {
        errorMessage.textContent = 'Ett fel uppstod vid inloggning';
      }
    })
    .finally(() => {
      // Återställ knapp
      if (loginButton) {
        loginButton.disabled = false;
        loginButton.innerHTML = 'Logga in';
      }
    });
}

// Hantera registreringsformulär
function handleRegister(event) {
  event.preventDefault();
  
  const username = document.getElementById('register-username').value;
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;
  const confirmPassword = document.getElementById('register-confirm-password').value;
  const errorMessage = document.getElementById('register-error');
  
  // Rensa felmeddelande
  if (errorMessage) {
    errorMessage.textContent = '';
  }
  
  // Validera indata
  if (!username || !email || !password) {
    if (errorMessage) {
      errorMessage.textContent = 'Vänligen fyll i alla fält';
    }
    return;
  }
  
  if (password !== confirmPassword) {
    if (errorMessage) {
      errorMessage.textContent = 'Lösenorden matchar inte';
    }
    return;
  }
  
  // Visa laddningsindikator
  const registerButton = document.querySelector('#register-form button[type="submit"]');
  if (registerButton) {
    registerButton.disabled = true;
    registerButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Skapar konto...';
  }
  
  // Registrera
  Auth.register({ username, email, password })
    .then(response => {
      if (response.success) {
        // Stäng register-modal och öppna login-modal
        closeRegisterModal();
        openLoginModal();
        
        // Visa meddelande om att registreringen lyckades
        const loginError = document.getElementById('login-error');
        if (loginError) {
          loginError.style.color = 'green';
          loginError.textContent = 'Konto skapat! Du kan nu logga in.';
        }
      } else {
        // Visa felmeddelande
        if (errorMessage) {
          errorMessage.textContent = response.data.message || 'Registreringen misslyckades';
        }
      }
    })
    .catch(error => {
      console.error('Register error:', error);
      if (errorMessage) {
        errorMessage.textContent = 'Ett fel uppstod vid registrering';
      }
    })
    .finally(() => {
      // Återställ knapp
      if (registerButton) {
        registerButton.disabled = false;
        registerButton.innerHTML = 'Skapa konto';
      }
    });
}

// Hantera utloggning
function handleLogout() {
  Auth.logout()
    .then(response => {
      // Oavsett svar, uppdatera UI till utloggad status
      console.log('Utloggad:', response.data.message);
    })
    .catch(error => {
      console.error('Logout error:', error);
    });
}

// Kontrollera inloggningsstatus när sidan laddas
document.addEventListener('DOMContentLoaded', () => {
  // Initiera UI
  const currentUser = Auth.getCurrentUser();
  Auth.updateAuthUI(currentUser);
  
  // Kontrollera med server om användaren är inloggad
  Auth.getUser()
    .then(response => {
      if (!response.success) {
        console.warn('Kunde inte hämta användarinfo:', response.data.message);
      }
    })
    .catch(error => {
      console.error('Error fetching user:', error);
    });
  
  // Lägg till eventlyssnare för formulär
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
  
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
  }
}); 