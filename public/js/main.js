/**
 * GoBet - Modern betting platform
 * Main JavaScript file
 */

// Vänta tills DOM är helt laddad
document.addEventListener('DOMContentLoaded', () => {
    console.log('GoBet app initialized');
    
    // Initialisera komponenter
    initMobileMenu();
    initTabs();
    initOptions();
    initSocket();
    initUserDropdown();
    initAnimations();
    
    // Ladda demo-data (ersätts senare med API-anrop)
    loadDemoData();
});

/**
 * Initialisera mobilmenyn
 */
function initMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mainNav = document.getElementById('mainNav');
    
    if (mobileMenuToggle && mainNav) {
        mobileMenuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
            mobileMenuToggle.setAttribute('aria-expanded', 
                mainNav.classList.contains('active') ? 'true' : 'false');
            
            // Ändra ikonen baserat på menyns tillstånd
            const icon = mobileMenuToggle.querySelector('i');
            if (mainNav.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-xmark');
            } else {
                icon.classList.remove('fa-xmark');
                icon.classList.add('fa-bars');
            }
        });
        
        // Stäng menyn när man klickar utanför
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#mobileMenuToggle') && 
                !e.target.closest('#mainNav') &&
                mainNav.classList.contains('active')) {
                mainNav.classList.remove('active');
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
                
                const icon = mobileMenuToggle.querySelector('i');
                icon.classList.remove('fa-xmark');
                icon.classList.add('fa-bars');
            }
        });
    }
}

/**
 * Initialisera tabbfunktionalitet
 */
function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    if (tabBtns.length && tabPanes.length) {
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Ta bort active från alla knappar och panes
                tabBtns.forEach(b => b.classList.remove('active'));
                tabPanes.forEach(p => p.classList.remove('active'));
                
                // Lägg till active på klickad knapp och motsvarande pane
                btn.classList.add('active');
                const tabId = btn.getAttribute('data-tab');
                const targetPane = document.getElementById(tabId);
                
                if (targetPane) {
                    targetPane.classList.add('active');
                    
                    // Spara i localStorage för att komma ihåg vid uppdatering
                    localStorage.setItem('activeTab', tabId);
                    
                    // Animationseffekt
                    targetPane.style.opacity = 0;
                    targetPane.style.transform = 'translateY(10px)';
                    
                    setTimeout(() => {
                        targetPane.style.opacity = 1;
                        targetPane.style.transform = 'translateY(0)';
                    }, 50);
                }
            });
        });
        
        // Återställ tidigare vald flik vid siduppdatering
        const savedTab = localStorage.getItem('activeTab');
        if (savedTab) {
            const savedTabBtn = document.querySelector(`.tab-btn[data-tab="${savedTab}"]`);
            if (savedTabBtn) {
                savedTabBtn.click();
            }
        }
    }
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
 * Initialisera användarmeny dropdown
 */
function initUserDropdown() {
    const userMenu = document.querySelector('.user-menu');
    
    if (userMenu) {
        userMenu.addEventListener('click', (e) => {
            e.stopPropagation();
            userMenu.classList.toggle('active');
        });
        
        // Stäng dropdown när man klickar utanför
        document.addEventListener('click', () => {
            userMenu.classList.remove('active');
        });
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