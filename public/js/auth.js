/**
 * GoBet - Authentication Client
 * Klientbibliotek för autentisering mot GoBet API
 */

// Autentiseringshantering för GoBet
const API_URL = '/api';

// Hjälpfunktion för att hantera API-anrop
async function fetchAPI(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Ett fel uppstod');
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Registrera ny användare
async function registerUser(userData) {
    try {
        const data = await fetchAPI('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
        
        // Spara token och användardata
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        return data;
    } catch (error) {
        throw error;
    }
}

// Logga in användare
async function loginUser(credentials) {
    try {
        const data = await fetchAPI('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
        
        // Spara token och användardata
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        return data;
    } catch (error) {
        throw error;
    }
}

// Logga ut användare
function logoutUser() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
}

// Kontrollera om användaren är inloggad
function isLoggedIn() {
    return !!localStorage.getItem('token');
}

// Hämta nuvarande användare
function getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

// Hämta auth token
function getAuthToken() {
    return localStorage.getItem('token');
}

// Uppdatera UI baserat på inloggningsstatus
function updateAuthUI() {
    const user = getCurrentUser();
    const isUserLoggedIn = isLoggedIn();
    
    // Uppdatera knappar och menyer
    const loginButtons = document.querySelectorAll('.login-btn, .auth-button[data-action="login"]');
    const registerButtons = document.querySelectorAll('.register-btn, .auth-button[data-action="register"]');
    const userMenu = document.querySelector('.user-menu');
    const balanceDisplay = document.querySelector('.balance-display');
    const homeSection = document.querySelector('.active-bets-section'); // Home-sektionen

    if (isUserLoggedIn && user) {
        // Visa användarmenyn och dölj inloggningsknappar
        loginButtons.forEach(btn => btn.style.display = 'none');
        registerButtons.forEach(btn => btn.style.display = 'none');
        
        if (userMenu) {
            userMenu.style.display = 'flex';
            const usernameElement = userMenu.querySelector('.username');
            if (usernameElement) {
                usernameElement.textContent = user.username;
            }
        }
        
        if (balanceDisplay) {
            balanceDisplay.style.display = 'flex';
            const balanceAmount = balanceDisplay.querySelector('.balance-amount');
            if (balanceAmount) {
                balanceAmount.textContent = user.balance || '0';
            }
        }

        // Visa home-sektionen för inloggade användare
        if (homeSection) {
            homeSection.style.display = 'block';
        }
    } else {
        // Visa inloggningsknappar och dölj användarmenyn
        loginButtons.forEach(btn => btn.style.display = 'inline-flex');
        registerButtons.forEach(btn => btn.style.display = 'inline-flex');
        
        if (userMenu) {
            userMenu.style.display = 'none';
        }
        
        if (balanceDisplay) {
            balanceDisplay.style.display = 'none';
        }

        // Dölj home-sektionen för icke-inloggade användare
        if (homeSection) {
            homeSection.style.display = 'none';
        }
    }
}

// Event listeners för formulär
document.addEventListener('DOMContentLoaded', () => {
    // Login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            
            try {
                await loginUser({ email, password });
                updateAuthUI();
                window.location.reload();
            } catch (error) {
                const errorElement = document.getElementById('login-error');
                if (errorElement) {
                    errorElement.textContent = error.message;
                }
            }
        });
    }
    
    // Register form
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const username = document.getElementById('register-username').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            const confirmPassword = document.getElementById('register-confirm-password').value;
            
            if (password !== confirmPassword) {
                const errorElement = document.getElementById('register-error');
                if (errorElement) {
                    errorElement.textContent = 'Lösenorden matchar inte';
                }
                return;
            }
            
            try {
                await registerUser({ username, email, password });
                updateAuthUI();
                window.location.reload();
            } catch (error) {
                const errorElement = document.getElementById('register-error');
                if (errorElement) {
                    errorElement.textContent = error.message;
                }
            }
        });
    }
    
    // Logout button
    const logoutButton = document.getElementById('logoutBtn');
    if (logoutButton) {
        logoutButton.addEventListener('click', (e) => {
            e.preventDefault();
            logoutUser();
            updateAuthUI();
        });
    }
    
    // Initial UI update
    updateAuthUI();
});

// Exportera Auth för användning i andra skript
window.Auth = {
  register: registerUser,
  login: loginUser,
  logout: logoutUser,
  isLoggedIn: isLoggedIn,
  getCurrentUser: getCurrentUser,
  getAuthToken: getAuthToken,
  updateAuthUI: updateAuthUI
};
