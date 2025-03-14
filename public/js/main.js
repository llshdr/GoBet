/**
 * GoBet - Modern betting platform
 * Main JavaScript file
 */

// Vänta tills DOM är helt laddad
document.addEventListener('DOMContentLoaded', () => {
    console.log('GoBet app initialized');
    
    // Initialisera komponenter
    initUserMenu();
    checkLoginStatus();
    initMobileMenu();
    initTabs();
    initOptions();
    initSocket();
    initAnimations();
    initTheme();
    setCurrentYear();
    
    // Ladda demo-data (ersätts senare med API-anrop)
    loadDemoData();
});

/**
 * Kontrollera användarens inloggningsstatus
 */
function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('gobet_logged_in') === 'true';
    const userData = JSON.parse(localStorage.getItem('gobet_user') || '{}');
    
    // Uppdatera användarmenyn
    updateUserMenu(isLoggedIn, userData);
    
    // Hantera åtkomstrestriktioner för inloggningskrävande sidor
    handleAccessRestrictions(isLoggedIn);
    
    // Initiera utloggningsknapp
    initLogout();
}

/**
 * Uppdatera användarmenyn baserat på inloggningsstatus
 */
function updateUserMenu(isLoggedIn, userData) {
    const userMenuButton = document.querySelector('.user-menu-btn');
    const userAvatar = document.getElementById('userAvatar');
    const userDisplayName = document.getElementById('userDisplayName');
    const userPlanBadge = document.querySelector('.user-plan-badge');
    const balanceDisplay = document.querySelector('.balance span');
    const loginButtons = document.querySelectorAll('.login-button');
    
    if (!userMenuButton && !loginButtons.length) return;
    
    if (isLoggedIn && userData) {
        // Användaren är inloggad, visa användarinformation
        if (userAvatar && userData.avatar) {
            userAvatar.src = userData.avatar;
            userAvatar.alt = userData.username || 'Avatar';
        }
        
        if (userDisplayName) {
            userDisplayName.textContent = userData.displayName || userData.firstName + ' ' + userData.lastName || userData.username || 'Användare';
        }
        
        // Visa användarmenyn och dölj inloggningsknappar
        if (userMenuButton) userMenuButton.style.display = 'flex';
        loginButtons.forEach(button => {
            button.style.display = 'none';
        });
        
        if (userPlanBadge) {
            const plan = localStorage.getItem('gobet_user_plan') || 'free';
            userPlanBadge.className = 'user-plan-badge ' + plan;
            userPlanBadge.textContent = plan === 'free' ? 'Gratis' : 
                                     plan === 'premium' ? 'Premium' : 'Premium+';
        }
        
        if (balanceDisplay) {
            const coins = localStorage.getItem('gobet_user_coins') || '5000';
            balanceDisplay.textContent = `${coins} GoCoins`;
        }
    } else {
        // Användaren är inte inloggad, visa inloggningslänk
        if (userMenuButton) userMenuButton.style.display = 'none';
        loginButtons.forEach(button => {
            button.style.display = 'flex';
        });
        
        if (userAvatar) {
            userAvatar.src = "https://ui-avatars.com/api/?name=Gäst&background=6c757d&color=fff";
            userAvatar.alt = "Gäst";
        }
        
        if (userDisplayName) {
            userDisplayName.textContent = "Gäst";
        }
        
        if (userPlanBadge) {
            userPlanBadge.className = 'user-plan-badge guest';
            userPlanBadge.textContent = 'Inte inloggad';
        }
        
        if (balanceDisplay) {
            balanceDisplay.textContent = '0 GoCoins';
        }
    }
}

/**
 * Hantera åtkomstrestriktioner baserat på inloggningsstatus
 */
function handleAccessRestrictions(isLoggedIn) {
    // Lista över sidor som kräver inloggning
    const restrictedPages = [
        'profile.html',
        'create-bet.html',
        'wheel.html'
    ];
    
    // Kontrollera om aktuell sida kräver inloggning
    const currentPage = window.location.pathname.split('/').pop();
    const requiresLogin = restrictedPages.some(page => currentPage.includes(page));
    
    if (requiresLogin && !isLoggedIn) {
        // Om sidan kräver inloggning men användaren inte är inloggad,
        // visa en varning och begränsa funktionalitet
        showLoginWarning();
        restrictFunctionality();
    }
}

/**
 * Visa varning om att användaren måste logga in
 */
function showLoginWarning() {
    // Skapa varningselement om det inte redan finns
    if (!document.getElementById('loginWarning')) {
        const warning = document.createElement('div');
        warning.id = 'loginWarning';
        warning.className = 'login-warning';
        warning.innerHTML = `
            <div class="warning-content">
                <i class="fa-solid fa-lock"></i>
                <h3>Inloggning krävs</h3>
                <p>Du måste vara inloggad för att använda denna funktionalitet.</p>
                <a href="login.html" class="btn btn-primary">Logga in</a>
            </div>
        `;
        
        // Lägg till varningen i huvudinnehållet
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.prepend(warning);
        } else {
            document.body.prepend(warning);
        }
    }
}

/**
 * Begränsa funktionalitet för icke inloggade användare
 */
function restrictFunctionality() {
    // Inaktivera interaktiva element
    const interactiveElements = document.querySelectorAll('button:not(.btn-primary), .btn-join, #spinButton, #buySpinButton, input[type="submit"]');
    
    interactiveElements.forEach(element => {
        element.disabled = true;
        element.classList.add('disabled');
        
        // Lägg till tooltip
        element.setAttribute('title', 'Logga in för att använda denna funktion');
        
        // Lägg till klickhändelse som visar inloggningsmeddelande
        element.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            alert('Du måste logga in för att använda denna funktion.');
        });
    });
    
    // Dölj känsligt innehåll
    const sensitiveContent = document.querySelectorAll('.wheel-of-fortune, .bet-card:not(:first-child), .create-bet-form');
    
    sensitiveContent.forEach(element => {
        element.classList.add('blurred');
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
 * Initialisera utloggningsknappen
 */
function initLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Rensa användardata från localStorage
            localStorage.removeItem('gobet_logged_in');
            localStorage.removeItem('gobet_user');
            localStorage.removeItem('gobet_remaining_spins');
            
            // Visa bekräftelsemeddelande
            alert('Du har loggats ut.');
            
            // Omdirigera till startsidan
            window.location.href = 'index.html';
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