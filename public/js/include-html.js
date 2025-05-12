/**
 * GoBet - Include HTML
 * Hanterar inkludering av gemensamma HTML-delar som header och footer
 */

// Vänta tills DOM är helt laddad
document.addEventListener('DOMContentLoaded', async () => {
    await includeHTML();
    
    // Efter att ha inkluderat komponenterna, uppdatera auth UI om auth.js är tillgänglig
    if (window.Auth && typeof window.Auth.updateAuthUI === 'function') {
        window.Auth.updateAuthUI();
    }
});

/**
 * Inkluderar HTML i element med data-include attribut
 */
async function includeHTML() {
    const includes = document.querySelectorAll('[data-include]');
    
    const promises = Array.from(includes).map(async (element) => {
        const file = element.getAttribute('data-include');
        try {
            const response = await fetch(file);
            if (response.ok) {
                const content = await response.text();
                element.innerHTML = content;
                
                // Kör eventuella script i den inkluderade HTML:en
                Array.from(element.querySelectorAll('script')).forEach(script => {
                    const newScript = document.createElement('script');
                    
                    if (script.src) {
                        newScript.src = script.src;
                    } else {
                        newScript.textContent = script.textContent;
                    }
                    
                    document.head.appendChild(newScript);
                    script.remove();
                });
            } else {
                element.innerHTML = `<p>Kunde inte ladda ${file}: ${response.status} ${response.statusText}</p>`;
            }
        } catch (error) {
            element.innerHTML = `<p>Kunde inte ladda ${file}: ${error.message}</p>`;
        }
    });
    
    // Vänta på att alla komponenter laddas
    await Promise.all(promises);
}

// Exportera funktionalitet för användning i andra skript
window.IncludeHTML = {
    includeHTML: includeHTML
}; 