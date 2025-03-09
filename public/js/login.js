/**
 * GoBet - Login & Registration
 */

document.addEventListener('DOMContentLoaded', () => {
  console.log('Login/Register module initialized');
  
  // Initialisera komponenter
  initAuthTabs();
  initPasswordToggle();
  initPasswordStrength();
  initFormSubmission();
  animateLoginForm();
});

/**
 * Initialisera autentiseringstabbar
 */
function initAuthTabs() {
  const tabs = document.querySelectorAll('.auth-tab');
  const forms = document.querySelectorAll('.auth-form');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Avmarkera alla tabbar
      tabs.forEach(t => t.classList.remove('active'));
      
      // Dölj alla formulär
      forms.forEach(form => form.classList.remove('active'));
      
      // Markera klickad tab och visa motsvarande formulär
      tab.classList.add('active');
      const targetForm = document.getElementById(tab.getAttribute('data-tab'));
      
      if (targetForm) {
        targetForm.classList.add('active');
      }
    });
  });
}

/**
 * Initialisera lösenordsvisning
 */
function initPasswordToggle() {
  const toggleButtons = document.querySelectorAll('.toggle-password');
  
  toggleButtons.forEach(button => {
    button.addEventListener('click', function() {
      const input = this.previousElementSibling;
      const icon = this.querySelector('i');
      
      // Ändra inputfältets typ
      if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
      } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
      }
    });
  });
}

/**
 * Initialisera lösenordsstyrka
 */
function initPasswordStrength() {
  const passwordInput = document.getElementById('registerPassword');
  const strengthBar = document.getElementById('passwordStrength');
  const strengthText = document.getElementById('passwordStrengthText');
  
  if (!passwordInput || !strengthBar || !strengthText) return;
  
  passwordInput.addEventListener('input', (e) => {
    const password = e.target.value;
    
    // Beräkna lösenordsstyrka
    const strength = calculatePasswordStrength(password);
    
    // Uppdatera styrkeindikator
    strengthBar.style.width = `${strength.percent}%`;
    strengthBar.style.backgroundColor = strength.color;
    strengthText.textContent = `Lösenordsstyrka: ${strength.label}`;
  });
  
  function calculatePasswordStrength(password) {
    if (!password) {
      return { percent: 0, color: '#ff4747', label: 'Inget lösenord' };
    }
    
    let score = 0;
    
    // Längd
    if (password.length >= 8) {
      score += 25;
    } else if (password.length >= 6) {
      score += 10;
    }
    
    // Komplexitet
    if (/[A-Z]/.test(password)) score += 15; // Versaler
    if (/[a-z]/.test(password)) score += 10; // Gemener
    if (/[0-9]/.test(password)) score += 15; // Siffror
    if (/[^A-Za-z0-9]/.test(password)) score += 20; // Specialtecken
    
    // Variation
    const uniqueChars = new Set(password).size;
    score += Math.min(15, uniqueChars * 2);
    
    // Resultat
    let color, label;
    
    if (score >= 80) {
      color = '#2ecc71';
      label = 'Mycket starkt';
    } else if (score >= 60) {
      color = '#27ae60';
      label = 'Starkt';
    } else if (score >= 40) {
      color = '#f39c12';
      label = 'Medium';
    } else if (score >= 20) {
      color = '#e67e22';
      label = 'Svagt';
    } else {
      color = '#ff4747';
      label = 'Mycket svagt';
    }
    
    return { percent: Math.min(100, score), color, label };
  }
}

/**
 * Lägg till animationer till inloggningsformulär
 */
function animateLoginForm() {
  // Animera inputs när de fokuseras
  const inputs = document.querySelectorAll('input');
  
  inputs.forEach(input => {
    // Lägg till klass "focused" på parent när input fokuseras
    input.addEventListener('focus', () => {
      input.parentElement.classList.add('focused');
    });
    
    // Ta bort klass "focused" på parent när input tappar fokus
    input.addEventListener('blur', () => {
      if (!input.value) {
        input.parentElement.classList.remove('focused');
      }
    });
    
    // Kontrollera om inputen redan har ett värde vid sidladdning
    if (input.value) {
      input.parentElement.classList.add('focused');
    }
  });
  
  // Staggered animation för formulärelement
  const formElements = document.querySelectorAll('.auth-form.active .form-group, .auth-form.active .btn-full, .auth-form.active .social-auth');
  
  formElements.forEach((el, index) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
      el.style.transition = 'all 0.4s ease';
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }, 100 + (index * 100)); // Staggered delay
  });
}

/**
 * Initialisera formuläröverföring
 */
function initFormSubmission() {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const verificationForm = document.getElementById('verificationForm');
  
  // Inloggningsformulär
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value;
      const rememberMe = document.getElementById('rememberMe')?.checked;
      
      if (!email || !password) {
        alert('Vänligen fyll i alla fält.');
        return;
      }
      
      // Kontrollera om användaren finns
      const registeredUsers = JSON.parse(localStorage.getItem('gobet_registered_users') || '[]');
      const user = registeredUsers.find(u => u.email === email);
      
      if (!user) {
        alert('Användaren finns inte. Vänligen registrera dig först.');
        return;
      }
      
      // Kontrollera lösenord
      if (user.password !== password) {
        alert('Fel lösenord. Försök igen.');
        return;
      }
      
      // Simulera laddning
      const submitButton = loginForm.querySelector('button[type="submit"]');
      submitButton.disabled = true;
      submitButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Loggar in...';
      
      // Hämta användardata
      const userData = user.userData;
      
      // Visa inloggningsmeddelande
      showSuccessMessage('Inloggning lyckades!');
      
      // Spara inloggningsstatus i localStorage
      localStorage.setItem('gobet_logged_in', 'true');
      localStorage.setItem('gobet_user', JSON.stringify(userData));
      
      // Omdirigera till hemsidan efter en kort fördröjning
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1500);
    });
  }
  
  // Registreringsformulär
  if (registerForm) {
    console.log('Registerformulär hittades:', registerForm);
    
    registerForm.addEventListener('submit', function(e) {
      e.preventDefault();
      console.log('Registreringsformulär skickat');
      
      try {
        const username = document.getElementById('registerUsername').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;
        const termsAgreement = document.getElementById('termsAgreement')?.checked;
        
        console.log('Formulärvärden:', { username, email, password: '****', confirmPassword: '****', termsAgreement });
        
        // Validering
        if (!username || !email || !password || !confirmPassword) {
          alert('Vänligen fyll i alla fält.');
          return;
        }
        
        if (password !== confirmPassword) {
          alert('Lösenorden matchar inte.');
          return;
        }
        
        if (!termsAgreement) {
          alert('Du måste godkänna användarvillkoren för att fortsätta.');
          return;
        }
        
        // Kontrollera om e-postadressen redan är registrerad
        const registeredUsers = JSON.parse(localStorage.getItem('gobet_registered_users') || '[]');
        if (registeredUsers.some(user => user.email === email)) {
          alert('E-postadressen är redan registrerad. Vänligen logga in istället.');
          return;
        }
        
        // Validera lösenordsstyrka
        if (typeof calculatePasswordStrength !== 'function') {
          console.error('calculatePasswordStrength är inte definierad');
          const strength = { percent: 50 }; // standardvärde om funktionen saknas
        } else {
          const strength = calculatePasswordStrength(password);
          if (strength.percent < 40) {
            if (!confirm('Ditt lösenord är svagt. Vill du fortsätta ändå?')) {
              return;
            }
          }
        }
        
        // Simulera laddning
        const submitButton = registerForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Skapar konto...';
        
        // Skapa en verifikationskod (6 siffror)
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Spara tillfällig användardata
        const tempUserData = {
          username,
          email,
          password,
          verificationCode,
          createdAt: new Date().toISOString()
        };
        
        localStorage.setItem('gobet_temp_user', JSON.stringify(tempUserData));
        
        // Skicka verifieringsmail via vår API
        fetch('/api/email/send-verification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            username,
            verificationCode
          }),
        })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            console.log('Verifikationskod skickad till', email, ':', verificationCode);
            showSuccessMessage('Verifikationskod skickad till din e-post!');
            
            // Visa verifieringsformuläret
            showVerificationForm(email);
            
            // Visa verifikationstabben
            const verificationTab = document.querySelector('.auth-tab[data-tab="verification"]');
            if (verificationTab) {
              verificationTab.style.display = 'block';
            }
          } else {
            throw new Error(data.error || 'Kunde inte skicka verifikationskod');
          }
        })
        .catch(error => {
          console.error('Fel vid skickande av verifikationskod:', error);
          alert('Det uppstod ett fel vid sändning av verifikationskod. Försök igen senare.');
          
          // Fallback: Visa upp verifikationskoden direkt om API-anropet misslyckas
          console.log('FALLBACK: Verifikationskod för', email, ':', verificationCode);
          showSuccessMessage('Verifikationskod genererad (se konsolen)');
          
          // Visa verifieringsformuläret ändå
          showVerificationForm(email);
          
          // Visa verifikationstabben
          const verificationTab = document.querySelector('.auth-tab[data-tab="verification"]');
          if (verificationTab) {
            verificationTab.style.display = 'block';
          }
        })
        .finally(() => {
          // Återställ registreringsknappen
          setTimeout(() => {
            submitButton.disabled = false;
            submitButton.innerHTML = 'Skapa konto';
          }, 1500);
        });
      } catch (error) {
        console.error('Fel vid registrering:', error);
        alert('Ett fel inträffade vid registrering. Vänligen försök igen.');
        
        // Återställ knappen vid fel
        const submitButton = registerForm.querySelector('button[type="submit"]');
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.innerHTML = 'Skapa konto';
        }
      }
    });
  } else {
    console.error('Registerformulär hittades inte!');
  }
  
  // Verifieringsformulär
  if (verificationForm) {
    verificationForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const verificationCodeInput = document.getElementById('verificationCode');
      if (!verificationCodeInput) return;
      
      const enteredCode = verificationCodeInput.value.trim();
      if (!enteredCode) {
        alert('Vänligen ange verifikationskoden.');
        return;
      }
      
      // Hämta temporär användardata
      const tempUser = JSON.parse(localStorage.getItem('gobet_temp_user') || '{}');
      if (!tempUser.verificationCode) {
        alert('Någonting gick fel. Vänligen försök registrera dig igen.');
        return;
      }
      
      // Kontrollera verifikationskoden
      if (enteredCode !== tempUser.verificationCode) {
        alert('Felaktig verifikationskod. Försök igen.');
        return;
      }
      
      // Simulera laddning
      const submitButton = verificationForm.querySelector('button[type="submit"]');
      submitButton.disabled = true;
      submitButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Verifierar...';
      
      // Skapa användardata
      const userData = {
        username: tempUser.username,
        email: tempUser.email,
        avatar: 'https://ui-avatars.com/api/?name=' + tempUser.username + '&background=6643b5&color=fff',
        joinDate: tempUser.createdAt,
        bio: 'Hej! Jag är en ny GoBet-användare.'
      };
      
      // Spara användaren i registrerade användare
      const registeredUsers = JSON.parse(localStorage.getItem('gobet_registered_users') || '[]');
      registeredUsers.push({
        email: tempUser.email,
        password: tempUser.password,
        userData
      });
      localStorage.setItem('gobet_registered_users', JSON.stringify(registeredUsers));
      
      // Rensa temporär användardata
      localStorage.removeItem('gobet_temp_user');
      
      // Spara inloggningsstatus och data
      localStorage.setItem('gobet_logged_in', 'true');
      localStorage.setItem('gobet_user', JSON.stringify(userData));
      
      // Sätt startbeloppet av GoCoins för användaren
      localStorage.setItem('gobet_user_coins', '5000');
      
      // Initiera användarstatistik
      initializeUserStats();
      
      // Visa bekräftelsemeddelande
      showSuccessMessage('Konto verifierat! Du loggas in automatiskt...');
      
      // Omdirigera till hemsidan efter en kort fördröjning
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1500);
    });
  }
}

/**
 * Visar verifieringsformuläret
 */
function showVerificationForm(email) {
  const loginForm = document.getElementById('login');
  const registerForm = document.getElementById('register');
  const verificationForm = document.getElementById('verification');
  
  if (!loginForm || !registerForm || !verificationForm) return;
  
  // Dölj andra formulär
  loginForm.classList.remove('active');
  registerForm.classList.remove('active');
  
  // Visa verifieringsformuläret
  verificationForm.classList.add('active');
  
  // Uppdatera e-postadress i meddelandet
  const emailDisplay = document.getElementById('verificationEmail');
  if (emailDisplay) {
    emailDisplay.textContent = email;
  }
  
  // Uppdatera flikar
  const authTabs = document.querySelectorAll('.auth-tab');
  authTabs.forEach(tab => {
    tab.classList.remove('active');
    if (tab.dataset.tab === 'verification') {
      tab.classList.add('active');
    }
  });
  
  // Fokusera på verifikationskoden
  const codeInput = document.getElementById('verificationCode');
  if (codeInput) {
    codeInput.focus();
  }
}

/**
 * Visa ett lyckat meddelande
 */
function showSuccessMessage(message) {
  const successMessage = document.getElementById('successMessage');
  const successMessageText = document.getElementById('successMessageText');
  
  if (!successMessage || !successMessageText) return;
  
  // Ange meddelandet
  successMessageText.textContent = message;
  
  // Visa meddelandet
  successMessage.classList.add('active');
  
  // Dölj meddelandet efter en stund
  setTimeout(() => {
    successMessage.classList.remove('active');
  }, 3000);
}

/**
 * Initiera användarstatistik vid inloggning/registrering
 */
function initializeUserStats() {
  // Kontrollera om användarstatistik redan finns
  if (!localStorage.getItem('gobet_user_stats')) {
    // Skapa standardstatistik för nya användare
    const initialStats = {
      betsCreated: 0,
      betsWon: 0,
      winPercentage: 0,
      friends: 0
    };
    
    localStorage.setItem('gobet_user_stats', JSON.stringify(initialStats));
  }
} 