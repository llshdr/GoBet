/**
 * Cookie-hantering för GoBet
 */

class CookieManager {
    constructor() {
        this.cookieConsent = this.getCookie('gobet_cookie_consent');
        this.initCookieBanner();
    }

    /**
     * Initialisera cookie-banner om användaren inte har accepterat cookies
     */
    initCookieBanner() {
        if (!this.cookieConsent) {
            const banner = document.createElement('div');
            banner.className = 'cookie-banner';
            banner.innerHTML = `
                <div class="cookie-content">
                    <div class="cookie-header">
                        <i class="fas fa-cookie-bite"></i>
                        <h3>Vi använder cookies</h3>
                    </div>
                    <p>Vi använder cookies för att förbättra din upplevelse på vår webbplats. 
                       Genom att fortsätta använda webbplatsen godkänner du användningen av cookies.</p>
                    <div class="cookie-buttons">
                        <button class="btn-cookie-settings">Inställningar</button>
                        <button class="btn-cookie-accept">Acceptera alla</button>
                    </div>
                </div>
            `;

            document.body.appendChild(banner);

            // Hantera knapptryck
            banner.querySelector('.btn-cookie-accept').addEventListener('click', () => {
                this.acceptAllCookies();
                banner.remove();
            });

            banner.querySelector('.btn-cookie-settings').addEventListener('click', () => {
                this.showCookieSettings();
            });
        }
    }

    /**
     * Visa cookie-inställningar
     */
    showCookieSettings() {
        const modal = document.createElement('div');
        modal.className = 'cookie-settings-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Cookie-inställningar</h3>
                    <button class="modal-close"><i class="fas fa-times"></i></button>
                </div>
                <div class="modal-body">
                    <div class="cookie-option">
                        <div class="cookie-option-header">
                            <h4>Nödvändiga cookies</h4>
                            <label class="switch">
                                <input type="checkbox" checked disabled>
                                <span class="slider"></span>
                            </label>
                        </div>
                        <p>Dessa cookies är nödvändiga för att webbplatsen ska fungera och kan inte stängas av.</p>
                    </div>
                    
                    <div class="cookie-option">
                        <div class="cookie-option-header">
                            <h4>Prestanda cookies</h4>
                            <label class="switch">
                                <input type="checkbox" id="performance-cookies">
                                <span class="slider"></span>
                            </label>
                        </div>
                        <p>Hjälper oss att förstå hur besökare använder webbplatsen genom att samla in anonym statistik.</p>
                    </div>
                    
                    <div class="cookie-option">
                        <div class="cookie-option-header">
                            <h4>Funktionella cookies</h4>
                            <label class="switch">
                                <input type="checkbox" id="functional-cookies">
                                <span class="slider"></span>
                            </label>
                        </div>
                        <p>Möjliggör förbättrad funktionalitet och personalisering.</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-save-preferences">Spara inställningar</button>
                    <button class="btn-accept-necessary">Acceptera nödvändiga</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Hantera stängning av modal
        modal.querySelector('.modal-close').addEventListener('click', () => {
            modal.remove();
        });

        // Hantera spara inställningar
        modal.querySelector('.btn-save-preferences').addEventListener('click', () => {
            const preferences = {
                necessary: true, // Alltid aktiverad
                performance: modal.querySelector('#performance-cookies').checked,
                functional: modal.querySelector('#functional-cookies').checked
            };
            
            this.saveCookiePreferences(preferences);
            modal.remove();
            
            // Ta bort cookie banner om den finns
            const banner = document.querySelector('.cookie-banner');
            if (banner) banner.remove();
        });
        
        // Hantera acceptera nödvändiga cookies
        modal.querySelector('.btn-accept-necessary').addEventListener('click', () => {
            const preferences = {
                necessary: true,
                performance: false,
                functional: false
            };
            
            this.saveCookiePreferences(preferences);
            modal.remove();
            
            // Ta bort cookie banner om den finns
            const banner = document.querySelector('.cookie-banner');
            if (banner) banner.remove();
        });
    }

    /**
     * Spara cookiepreferenser
     */
    saveCookiePreferences(preferences) {
        localStorage.setItem('gobet_cookie_preferences', JSON.stringify(preferences));
        
        // Sätt cookie för 30 dagar
        const prefsString = Object.entries(preferences)
            .filter(([_, value]) => value)
            .map(([key, _]) => key)
            .join(',');
            
        this.setCookie('gobet_cookie_consent', prefsString, 30);
        
        console.log('Cookie-preferenser sparade:', preferences);
    }
    
    /**
     * Acceptera endast nödvändiga cookies
     */
    acceptNecessaryCookies() {
        const preferences = {
            necessary: true,
            performance: false,
            functional: false
        };
        
        this.saveCookiePreferences(preferences);
        
        // Ta bort cookie banner om den finns
        const banner = document.querySelector('.cookie-banner');
        if (banner) banner.remove();
    }

    /**
     * Acceptera alla cookies
     */
    acceptAllCookies() {
        const preferences = {
            necessary: true,
            performance: true,
            functional: true
        };
        
        this.saveCookiePreferences(preferences);
        
        console.log('Alla cookies accepterade');
    }

    /**
     * Sätt en cookie
     */
    setCookie(name, value, days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = "; expires=" + date.toUTCString();
        document.cookie = name + "=" + value + expires + "; path=/; SameSite=Lax";
    }

    /**
     * Hämta en cookie
     */
    getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    /**
     * Ta bort en cookie
     */
    deleteCookie(name) {
        document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/';
    }
}

// Initiera cookie-hantering när sidan laddas
document.addEventListener('DOMContentLoaded', () => {
    window.cookieManager = new CookieManager();
}); 