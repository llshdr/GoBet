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
 * Beräkna lösenordsstyrka
 * Flyttad utanför för att vara tillgänglig för andra funktioner
 */
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
    
    // Beräkna lösenordsstyrka med den globala funktionen
    const strength = calculatePasswordStrength(password);
    
    // Uppdatera styrkeindikator
    strengthBar.style.width = `${strength.percent}%`;
    strengthBar.style.backgroundColor = strength.color;
    strengthText.textContent = `Lösenordsstyrka: ${strength.label}`;
  });
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
      const user = registeredUsers.find(u => u.email === email || u.userData.username === email);
      
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
      
      // För äldre användarkonton som inte har displayName, sätt displayName baserat på tillgänglig info
      if (!userData.displayName) {
        if (userData.firstName && userData.lastName) {
          userData.displayName = userData.firstName + ' ' + userData.lastName;
        } else {
          userData.displayName = userData.username;
        }
      }
      
      // För äldre användarkonton som använder extern avatar, ersätt med lokal
      if (userData.avatar && userData.avatar.includes('ui-avatars.com')) {
        userData.avatar = 'img/avatar.svg';
      }
      
      // Visa inloggningsmeddelande
      showSuccessMessage('Inloggning lyckades!');
      
      // Spara inloggningsstatus i localStorage
      localStorage.setItem('gobet_logged_in', 'true');
      localStorage.setItem('gobet_user', JSON.stringify(userData));
      
      // Acceptera nödvändiga cookies
      acceptNecessaryCookies();
      
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
        const firstName = document.getElementById('registerFirstName').value.trim();
        const lastName = document.getElementById('registerLastName').value.trim();
        const username = document.getElementById('registerUsername').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const phone = document.getElementById('registerPhone') ? document.getElementById('registerPhone').value.trim() : '';
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;
        const termsAgreement = document.getElementById('termsAgreement')?.checked;
        
        console.log('Formulärvärden:', { firstName, lastName, username, email, phone, password: '****', confirmPassword: '****', termsAgreement });
        
        // Validering
        if (!firstName || !lastName || !username || !email || !password || !confirmPassword) {
          alert('Vänligen fyll i alla obligatoriska fält.');
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
        
        // Validera e-postformatet
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          alert('Vänligen ange en giltig e-postadress.');
          return;
        }
        
        // Kontrollera om e-postadressen eller användarnamnet redan är registrerad
        const registeredUsers = JSON.parse(localStorage.getItem('gobet_registered_users') || '[]');
        if (registeredUsers.some(user => user.email === email)) {
          alert('E-postadressen är redan registrerad. Vänligen logga in istället.');
          return;
        }
        
        if (registeredUsers.some(user => user.userData.username === username)) {
          alert('Användarnamnet är redan taget. Vänligen välj ett annat.');
          return;
        }
        
        // Validera lösenordsstyrka
        const strength = calculatePasswordStrength(password);
        if (strength.percent < 40) {
          if (!confirm('Ditt lösenord är svagt. Vill du fortsätta ändå?')) {
            return;
          }
        }
        
        // Simulera laddning
        const submitButton = registerForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Skapar konto...';
        
        // Skapa användardata direkt utan verifikation
        const userData = {
          firstName: firstName,
          lastName: lastName,
          username: username,
          email: email,
          phone: phone || '',
          avatar: 'img/avatar.svg', // Använd lokal SVG istället för extern tjänst
          displayName: firstName + ' ' + lastName, // Använd hela namnet som visningsnamn
          joinDate: new Date().toISOString(),
          bio: 'Hej! Jag är en ny GoBet-användare.'
        };
        
        // Spara användaren i registrerade användare
        registeredUsers.push({
          email: email,
          password: password,
          userData: userData
        });
        
        try {
          localStorage.setItem('gobet_registered_users', JSON.stringify(registeredUsers));
          
          // Spara inloggningsstatus och data
          localStorage.setItem('gobet_logged_in', 'true');
          localStorage.setItem('gobet_user', JSON.stringify(userData));
          
          // Sätt startbeloppet av GoCoins för användaren
          localStorage.setItem('gobet_user_coins', '5000');
          
          // Initiera användarstatistik
          initializeUserStats();

          // Acceptera nödvändiga cookies
          acceptNecessaryCookies();
          
          // Visa bekräftelsemeddelande
          showSuccessMessage('Konto skapat! Du loggas in automatiskt...');
          
          // Omdirigera till hemsidan efter en kort fördröjning
          setTimeout(() => {
            window.location.href = 'index.html';
          }, 1500);
        } catch (storageError) {
          console.error('Fel vid lagring av användardata:', storageError);
          alert('Ett fel inträffade vid lagring av användardata. Kontrollera att cookies och lokal lagring är aktiverad i din webbläsare.');
          submitButton.disabled = false;
          submitButton.innerHTML = 'Skapa konto';
        }
        
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
      // Koden inaktiverad temporärt
      console.log('Verifikation tillfälligt inaktiverad');
    });
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
      betsJoined: 0,
      betsWon: 0,
      betsLost: 0,
      winPercentage: 0,
      totalWinnings: 0,
      friends: 0,
      favoriteGames: []
    };
    
    localStorage.setItem('gobet_user_stats', JSON.stringify(initialStats));
  }
}

/**
 * Uppdatera användarstatistik när en bet vinns eller förloras
 */
function updateUserStats(result, amount) {
  // Hämta nuvarande statistik
  const stats = JSON.parse(localStorage.getItem('gobet_user_stats') || '{}');
  
  if (result === 'win') {
    stats.betsWon += 1;
    stats.totalWinnings += amount;
  } else if (result === 'loss') {
    stats.betsLost += 1;
  }
  
  // Räkna om vinstprocent
  const totalBets = stats.betsWon + stats.betsLost;
  if (totalBets > 0) {
    stats.winPercentage = Math.round((stats.betsWon / totalBets) * 100);
  }
  
  // Spara uppdaterad statistik
  localStorage.setItem('gobet_user_stats', JSON.stringify(stats));
}

/**
 * Acceptera nödvändiga cookies
 */
function acceptNecessaryCookies() {
  const cookiePreferences = {
    necessary: true,
    performance: false,
    functional: false
  };
  
  localStorage.setItem('gobet_cookie_preferences', JSON.stringify(cookiePreferences));
  
  // Sätt cookie_consent cookie för 30 dagar
  const date = new Date();
  date.setTime(date.getTime() + (30 * 24 * 60 * 60 * 1000));
  const expires = "; expires=" + date.toUTCString();
  document.cookie = "gobet_cookie_consent=necessary" + expires + "; path=/; SameSite=Lax";
} 