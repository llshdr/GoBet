/**
 * GoBet - Modern betting platform
 * Main JavaScript file
 */

// Vänta tills DOM är helt laddad
document.addEventListener('DOMContentLoaded', () => {
    console.log('GoBet app initialized');
    
    // Initialisera komponenter
    initUserMenu();
    checkAuthStatus();
    initMobileMenu();
    initTabs();
    initOptions();
    initSocket();
    initAnimations();
    initTheme();
    setCurrentYear();
    
    // Ladda demo-data (ersätts senare med API-anrop)
    loadDemoData();
    
    // Registrera event listeners för modaler
    setupModalListeners();
    
    // Registrera logga ut-knapp event listener
    setupLogoutButton();
    
    // Sätt upp "skapa vad"-knapp
    setupCreateBetButton();
});

/**
 * Kontrollera inloggningsstatus och uppdatera UI
 */
async function checkAuthStatus() {
    try {
        // Hämta token från localStorage
        const token = localStorage.getItem('token');
        
        // Om ingen token, uppdatera UI för utloggad användare
        if (!token) {
            updateUIForLoggedOutUser();
            return;
        }
        
        // Anropa API:et för att verifiera token och hämta användarinfo
        const response = await fetch('/api/auth/me', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        // Om anropet misslyckas, rensa token och uppdatera UI
        if (!response.ok) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            updateUIForLoggedOutUser();
            return;
        }
        
        // Uppdatera user info
        const data = await response.json();
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Uppdatera UI för inloggad användare
        updateUIForLoggedInUser(data.user);
        
    } catch (error) {
        console.error('Auth check error:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        updateUIForLoggedOutUser();
    }
}

/**
 * Uppdatera UI baserat på utloggad användare
 */
function updateUIForLoggedOutUser() {
    // Visa "logga in" och "skapa konto" knappar
    const loginButtons = document.querySelectorAll('.login-btn, .auth-button[data-action="login"]');
    const registerButtons = document.querySelectorAll('.register-btn, .auth-button[data-action="register"]');
    
    loginButtons.forEach(button => {
        button.style.display = 'inline-flex';
    });
    
    registerButtons.forEach(button => {
        button.style.display = 'inline-flex';
    });
    
    // Dölj element som kräver inloggning
    const loggedInElements = document.querySelectorAll('.requires-auth, .logged-in-only');
    loggedInElements.forEach(element => {
        element.style.display = 'none';
    });
    
    // Dölj användarmenyn om den finns
    const userMenu = document.querySelector('.user-menu');
    if (userMenu) {
        userMenu.style.display = 'none';
    }
    
    // Dölj saldovisning
    const balanceElements = document.querySelectorAll('.balance-display, .balance-amount');
    balanceElements.forEach(element => {
        element.textContent = '0';
        element.parentElement.style.display = 'none';
    });
    
    // Dölj logga ut-knapp
    const logoutButtons = document.querySelectorAll('.logout-btn, .auth-button[data-action="logout"]');
    logoutButtons.forEach(button => {
        button.style.display = 'none';
    });
    
    // Visa element endast för utloggade
    const loggedOutElements = document.querySelectorAll('.logged-out-only');
    loggedOutElements.forEach(element => {
        element.style.display = '';
    });
    
    // Dölj "skapa vad"-knapp
    const createBetButtons = document.querySelectorAll('.create-bet-button');
    createBetButtons.forEach(button => {
        button.style.display = 'none';
    });
}

/**
 * Uppdatera UI baserat på inloggad användare
 */
function updateUIForLoggedInUser(user) {
    // Dölj "logga in" och "skapa konto" knappar
    const loginButtons = document.querySelectorAll('.login-btn, .auth-button[data-action="login"]');
    const registerButtons = document.querySelectorAll('.register-btn, .auth-button[data-action="register"]');
    
    loginButtons.forEach(button => {
        button.style.display = 'none';
    });
    
    registerButtons.forEach(button => {
        button.style.display = 'none';
    });
    
    // Visa element som kräver inloggning
    const loggedInElements = document.querySelectorAll('.requires-auth, .logged-in-only');
    loggedInElements.forEach(element => {
        element.style.display = '';
    });
    
    // Visa användarmenyn om den finns
    const userMenu = document.querySelector('.user-menu');
    if (userMenu) {
        userMenu.style.display = 'flex';
        
        // Uppdatera användarnamn
        const usernameElements = userMenu.querySelectorAll('.username');
        usernameElements.forEach(element => {
            element.textContent = user.username;
        });
    }
    
    // Uppdatera saldovisning
    const balanceElements = document.querySelectorAll('.balance-display, .balance-amount');
    balanceElements.forEach(element => {
        element.textContent = user.balance || 0;
        if (element.parentElement) {
            element.parentElement.style.display = '';
        }
    });
    
    // Visa logga ut-knapp
    const logoutButtons = document.querySelectorAll('.logout-btn, .auth-button[data-action="logout"]');
    logoutButtons.forEach(button => {
        button.style.display = 'inline-flex';
    });
    
    // Dölj element endast för utloggade
    const loggedOutElements = document.querySelectorAll('.logged-out-only');
    loggedOutElements.forEach(element => {
        element.style.display = 'none';
    });
    
    // Visa "skapa vad"-knapp
    const createBetButtons = document.querySelectorAll('.create-bet-button');
    createBetButtons.forEach(button => {
        button.style.display = 'inline-flex';
    });
}

/**
 * Sätt upp event listeners för modaler
 */
function setupModalListeners() {
    // Login form submission
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Visa loading state
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;
            submitBtn.textContent = 'Loggar in...';
            submitBtn.disabled = true;
            
            const errorEl = document.getElementById('login-error');
            if (errorEl) errorEl.textContent = '';
            
            const email = loginForm.querySelector('[name="email"]').value;
            const password = loginForm.querySelector('[name="password"]').value;
            
            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.message || 'Fel användarnamn eller lösenord');
                }
                
                // Spara token och användarinfo
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                
                // Stäng modal
                if (typeof closeLoginModal === 'function') {
                    closeLoginModal();
                }
                
                // Uppdatera UI
                updateUIForLoggedInUser(data.user);
                
                // Återställ formulär
                loginForm.reset();
                
            } catch (error) {
                if (errorEl) {
                    errorEl.textContent = error.message || 'Inloggning misslyckades';
                }
                console.error('Login error:', error);
            } finally {
                // Återställ knapp
                submitBtn.textContent = originalBtnText;
                submitBtn.disabled = false;
            }
        });
    }
    
    // Register form submission
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Visa loading state
            const submitBtn = registerForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;
            submitBtn.textContent = 'Skapar konto...';
            submitBtn.disabled = true;
            
            const errorEl = document.getElementById('register-error');
            if (errorEl) errorEl.textContent = '';
            
            const username = registerForm.querySelector('[name="username"]').value;
            const email = registerForm.querySelector('[name="email"]').value;
            const password = registerForm.querySelector('[name="password"]').value;
            const confirmPassword = registerForm.querySelector('[name="confirmPassword"]').value;
            
            // Enkel validering
            if (password !== confirmPassword) {
                if (errorEl) errorEl.textContent = 'Lösenorden matchar inte';
                submitBtn.textContent = originalBtnText;
                submitBtn.disabled = false;
                return;
            }
            
            try {
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, email, password })
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.message || 'Registreringen misslyckades');
                }
                
                // Stäng register-modal
                if (typeof closeRegisterModal === 'function') {
                    closeRegisterModal();
                }
                
                // Visa success-meddelande i login-modal
                if (typeof openLoginModal === 'function') {
                    openLoginModal();
                    
                    const loginErrorEl = document.getElementById('login-error');
                    if (loginErrorEl) {
                        loginErrorEl.style.color = 'green';
                        loginErrorEl.textContent = 'Konto skapat! Du kan nu logga in.';
                    }
                }
                
                // Återställ formulär
                registerForm.reset();
                
            } catch (error) {
                if (errorEl) {
                    errorEl.textContent = error.message || 'Registreringen misslyckades';
                }
                console.error('Register error:', error);
            } finally {
                // Återställ knapp
                submitBtn.textContent = originalBtnText;
                submitBtn.disabled = false;
            }
        });
    }
}

/**
 * Sätt upp logga ut-knapp
 */
function setupLogoutButton() {
    // Hitta alla logga ut-knappar
    const logoutButtons = document.querySelectorAll('.logout-btn, [data-action="logout"]');
    
    logoutButtons.forEach(button => {
        button.addEventListener('click', async (e) => {
            e.preventDefault();
            
            try {
                // Hämta token
                const token = localStorage.getItem('token');
                
                if (token) {
                    // Anropa server för utloggning
                    await fetch('/api/auth/logout', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                }
                
                // Rensa lokal lagring
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                
                // Uppdatera UI
                updateUIForLoggedOutUser();
                
                // Ladda om sidan (valfritt)
                // window.location.reload();
                
            } catch (error) {
                console.error('Logout error:', error);
                
                // Rensa även vid fel
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                updateUIForLoggedOutUser();
            }
        });
    });
}

/**
 * Sätt upp skapa vad-knapp
 */
function setupCreateBetButton() {
    const createBetButtons = document.querySelectorAll('.create-bet-button, [data-action="create-bet"]');
    
    createBetButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Kontrollera om användaren är inloggad
            if (!localStorage.getItem('token')) {
                // Visa login-modal om inte inloggad
                if (typeof openLoginModal === 'function') {
                    openLoginModal();
                    
                    const loginErrorEl = document.getElementById('login-error');
                    if (loginErrorEl) {
                        loginErrorEl.textContent = 'Du måste vara inloggad för att skapa vad';
                    }
                }
                return;
            }
            
            // Visa skapa vad-modal om inloggad
            if (typeof openCreateBetModal === 'function') {
                openCreateBetModal();
            }
        });
    });
}

/**
 * Initialisera användarmenyn
 */
function initUserMenu() {
    const userMenuBtn = document.querySelector('.user-menu-btn');
    
    if (userMenuBtn) {
        userMenuBtn.addEventListener('click', () => {
            const dropdown = document.querySelector('.user-dropdown');
            if (dropdown) {
                dropdown.classList.toggle('active');
            }
        });
        
        // Stäng menyn när man klickar utanför
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.user-menu')) {
                const dropdown = document.querySelector('.user-dropdown');
                if (dropdown && dropdown.classList.contains('active')) {
                    dropdown.classList.remove('active');
                }
            }
        });
    }
}

/**
 * Initialisera mobilmenyn
 */
function initMobileMenu() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    
    if (mobileMenuToggle && mainNav) {
        mobileMenuToggle.addEventListener('click', () => {
            const isExpanded = mobileMenuToggle.getAttribute('aria-expanded') === 'true';
            mobileMenuToggle.setAttribute('aria-expanded', !isExpanded);
            mainNav.classList.toggle('active');
        });
        
        // Stäng menyn när man klickar utanför
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.mobile-menu-toggle') && 
                !e.target.closest('.main-nav') &&
                mainNav.classList.contains('active')) {
                mainNav.classList.remove('active');
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }
}

/**
 * Initialisera tabbfunktionalitet
 */
function initTabs() {
    const tabContainers = document.querySelectorAll('.tab-container');
    
    tabContainers.forEach(container => {
        const tabs = container.querySelectorAll('.tab-btn');
        const panes = container.querySelectorAll('.tab-pane');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const target = tab.getAttribute('data-tab');
                
                // Update active states
                tabs.forEach(t => t.classList.remove('active'));
                panes.forEach(p => p.classList.remove('active'));
                
                tab.classList.add('active');
                container.querySelector(`.tab-pane[data-tab="${target}"]`).classList.add('active');
            });
        });
    });
}

/**
 * Initialisera bet-alternativ med klickfunktionalitet
 */
function initOptions() {
    const options = document.querySelectorAll('.option');
    
    if (options.length) {
        options.forEach(option => {
            option.addEventListener('click', () => {
                // Avmarkera alla alternativ i samma bet-card
                const parentCard = option.closest('.bet-card');
                const siblingOptions = parentCard.querySelectorAll('.option');
                
                siblingOptions.forEach(opt => {
                    opt.classList.remove('selected');
                    opt.style.borderColor = '';
                    opt.style.backgroundColor = '';
                });
                
                // Markera klickat alternativ
                option.classList.add('selected');
                option.style.borderColor = 'var(--primary-color)';
                option.style.backgroundColor = 'rgba(102, 67, 181, 0.15)';
                
                // Uppdatera knappen att visa "Satsa" istället för "Delta"
                const joinBtn = parentCard.querySelector('.btn-join');
                if (joinBtn) {
                    joinBtn.textContent = 'Satsa på detta alternativ';
                    joinBtn.classList.add('active');
                }
            });
        });
    }
}

/**
 * Initialisera Socket.io för realtidskommunikation
 */
function initSocket() {
    try {
        const socket = io();
        
        socket.on('connect', () => {
            console.log('Connected to server via Socket.io');
        });
        
        socket.on('new-bet', (data) => {
            console.log('New bet received:', data);
            // Implementera: Lägg till nytt bet i gränssnittet
            // showNotification('Nytt bet tillgängligt!', 'info');
        });
        
        socket.on('bet-update', (data) => {
            console.log('Bet update received:', data);
            // Implementera: Uppdatera bet-information i gränssnittet
        });
        
        socket.on('disconnect', () => {
            console.log('Disconnected from server');
        });
        
        // Exponera socket för global åtkomst
        window.gobet = window.gobet || {};
        window.gobet.socket = socket;
    } catch (error) {
        console.error('Failed to connect to socket server:', error);
    }
}

/**
 * Lägg till animationer och interaktiva effekter
 */
function initAnimations() {
    // Gör alla kort interaktiva
    const cards = document.querySelectorAll('.bet-card, .giveaway-card, .game-card');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px)';
            card.style.boxShadow = 'var(--box-shadow-lg)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
            card.style.boxShadow = '';
        });
    });
    
    // Animera sidor vid laddning
    animateOnScroll();
    window.addEventListener('scroll', animateOnScroll);
}

/**
 * Animera element när de scrollas in i vyn
 */
function animateOnScroll() {
    const elements = document.querySelectorAll('.hero, .section-header, .bet-card, .giveaway-card, .game-card');
    
    elements.forEach(element => {
        const elementPosition = element.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        
        if (elementPosition < windowHeight - 100) {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }
    });
}

/**
 * Ladda demo-data (ersätts senare med API-anrop)
 */
function loadDemoData() {
    // Simulera uppdatering av vän-bets
    const friendBetsPane = document.querySelector('#friend-bets');
    
    if (friendBetsPane) {
        // Kontrollera om pane är tom (innehåller empty-state)
        const hasEmptyState = friendBetsPane.querySelector('.empty-state');
        
        if (hasEmptyState) {
            // Timer för att simulera datahämtning
            setTimeout(() => {
                // Ta bort empty-state
                hasEmptyState.remove();
                
                // Skapa en container för vän-bets
                const betsGrid = document.createElement('div');
                betsGrid.className = 'bets-grid';
                
                // Lägg till några vän-bets (senare ersätts detta med API-data)
                betsGrid.innerHTML = `
                    <!-- Friend Bet Card 1 -->
                    <div class="bet-card glass-card">
                        <div class="bet-header">
                            <div class="bet-creator">
                                <img src="images/avatar4.png" alt="Creator" class="avatar-sm">
                                <span>GameMaster</span>
                            </div>
                            <div class="bet-type friends">
                                <i class="fa-solid fa-user-group"></i> Vänner
                            </div>
                        </div>
                        <h3 class="bet-title">Vem vinner vårt Fortnite-krig?</h3>
                        <p class="bet-description">Vi kör ett Fortnite battle royale ikväll kl 20. Satsa på vinnaren!</p>
                        <div class="bet-options">
                            <div class="option">
                                <span class="option-name">TeamAlpha</span>
                                <span class="option-odds">2.0x</span>
                            </div>
                            <div class="option">
                                <span class="option-name">TeamBeta</span>
                                <span class="option-odds">2.0x</span>
                            </div>
                        </div>
                        <div class="bet-footer">
                            <div class="bet-prize">
                                <img src="images/skin-icon.png" alt="Prize" class="prize-icon">
                                Legendary Skin
                            </div>
                            <div class="bet-timer">
                                <i class="fa-regular fa-clock"></i>
                                6 timmar kvar
                            </div>
                        </div>
                        <a href="#" class="btn btn-join">Delta i Bet</a>
                    </div>
                    
                    <!-- Friend Bet Card 2 -->
                    <div class="bet-card glass-card">
                        <div class="bet-header">
                            <div class="bet-creator">
                                <img src="images/avatar5.png" alt="Creator" class="avatar-sm">
                                <span>MovieBuff</span>
                            </div>
                            <div class="bet-type friends">
                                <i class="fa-solid fa-user-group"></i> Vänner
                            </div>
                        </div>
                        <h3 class="bet-title">Oscarsgalan 2023: Bästa film</h3>
                        <p class="bet-description">Vilken film kommer att vinna Oscar för Bästa Film i år? Satsa nu!</p>
                        <div class="bet-options">
                            <div class="option">
                                <span class="option-name">Film A</span>
                                <span class="option-odds">1.8x</span>
                            </div>
                            <div class="option">
                                <span class="option-name">Film B</span>
                                <span class="option-odds">2.5x</span>
                            </div>
                        </div>
                        <div class="bet-footer">
                            <div class="bet-prize">
                                <i class="fa-solid fa-coins"></i>
                                1,000 GoCoins
                            </div>
                            <div class="bet-timer">
                                <i class="fa-regular fa-clock"></i>
                                12 dagar kvar
                            </div>
                        </div>
                        <a href="#" class="btn btn-join">Delta i Bet</a>
                    </div>
                `;
                
                // Lägg till i pane
                friendBetsPane.appendChild(betsGrid);
                
                // Initiera nya options
                initOptions();
            }, 1500); // Simulera långsam laddning av data
        }
    }
}

/**
 * Visa en notifikation på skärmen
 * @param {string} message - Meddelandet att visa
 * @param {string} type - Typ av notifikation (success, error, warning, info)
 */
function showNotification(message, type = 'info') {
    // Skapa notifikationselement
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    // Sätt innehåll
    notification.innerHTML = `
        <div class="notification-icon">
            <i class="fa-solid ${getIconForType(type)}"></i>
        </div>
        <div class="notification-content">
            <p>${message}</p>
        </div>
        <button class="notification-close">
            <i class="fa-solid fa-xmark"></i>
        </button>
    `;
    
    // Lägg till på sidan
    document.body.appendChild(notification);
    
    // Animera in
    setTimeout(() => {
        notification.classList.add('active');
    }, 10);
    
    // Stängknapp
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.classList.remove('active');
        setTimeout(() => {
            notification.remove();
        }, 300); // Matcha CSS-transition
    });
    
    // Auto-hide efter 5 sekunder
    setTimeout(() => {
        if (document.body.contains(notification)) {
            notification.classList.remove('active');
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);
}

/**
 * Få rätt ikon baserat på notifikationstyp
 * @param {string} type - Notifikationstypen
 * @returns {string} Klassnamnet för ikonen
 */
function getIconForType(type) {
    switch (type) {
        case 'success':
            return 'fa-circle-check';
        case 'error':
            return 'fa-circle-xmark';
        case 'warning':
            return 'fa-triangle-exclamation';
        case 'info':
        default:
            return 'fa-circle-info';
    }
}

/**
 * Initialisera tema-inställningar
 */
function initTheme() {
    const storedTheme = localStorage.getItem('gobet_theme') || 'auto';
    applyTheme(storedTheme);
    
    // Lyssna efter ändringar i systemtema om auto-läge är aktivt
    if (storedTheme === 'auto') {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
            if (localStorage.getItem('gobet_theme') === 'auto') {
                applyTheme('auto');
            }
        });
    }
}

/**
 * Tillämpa det valda temat
 */
function applyTheme(theme) {
    const isDark = theme === 'dark' || 
                 (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    if (isDark) {
        document.body.classList.add('dark-theme');
        document.body.classList.remove('light-theme');
    } else {
        document.body.classList.add('light-theme');
        document.body.classList.remove('dark-theme');
    }
    
    // Spara temat
    localStorage.setItem('gobet_theme', theme);
}

/**
 * Sätt rätt årtal i footern
 */
function setCurrentYear() {
    const yearElements = document.querySelectorAll('.current-year');
    const currentYear = new Date().getFullYear();
    
    yearElements.forEach(element => {
        element.textContent = currentYear;
    });
}

// Funktion för att återställa användarinställningar
async function resetUserSettings(userId) {
    try {
        const response = await fetch('/api/reset-settings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId })
        });

        if (!response.ok) {
            throw new Error('Kunde inte återställa inställningar');
        }

        const data = await response.json();
        console.log('Inställningar återställda:', data);

        // Uppdatera UI med återställda värden
        updateUserInterface(data);
    } catch (error) {
        console.error('Fel vid återställning av inställningar:', error);
        showNotification('Ett fel uppstod vid återställning av inställningar', 'error');
    }
}

// Funktion för att uppdatera användargränssnittet
function updateUserInterface(settings) {
    // Uppdatera vunna bets
    const wonBetsElement = document.querySelector('.user-stats .won-bets');
    if (wonBetsElement) {
        wonBetsElement.textContent = '0';
    }

    // Uppdatera poäng
    const pointsElement = document.querySelector('.user-stats .points');
    if (pointsElement) {
        pointsElement.textContent = '0';
    }

    // Uppdatera andra relevanta UI-element
    // ...

    showNotification('Dina inställningar har återställts', 'success');
}

// Lägg till event listener för inloggning
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.querySelector('#login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            try {
                const formData = new FormData(loginForm);
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        username: formData.get('username'),
                        password: formData.get('password')
                    })
                });

                if (!response.ok) {
                    throw new Error('Inloggning misslyckades');
                }

                const data = await response.json();
                
                // Återställ användarinställningar efter inloggning
                await resetUserSettings(data.userId);

                // Omdirigera till dashboard eller annan sida
                window.location.href = '/dashboard';
            } catch (error) {
                console.error('Inloggningsfel:', error);
                showNotification('Inloggning misslyckades', 'error');
            }
        });
    }
});

function checkLoginAndOpenCreateBet() {
    const isLoggedIn = localStorage.getItem('gobet_logged_in') === 'true';
    
    if (!isLoggedIn) {
        showNotification('Du måste logga in för att skapa ett bet!', 'warning');
        openLoginModal();
        return;
    }
    
    openCreateBetModal();
} 