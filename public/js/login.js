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
 * Initialisera formuläröverföring
 */
function initFormSubmission() {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  
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
      
      // Simulera inloggningsförfrågan till servern
      console.log('Loggar in...', { email, rememberMe });
      
      // Simulera laddning
      const submitButton = loginForm.querySelector('button[type="submit"]');
      submitButton.disabled = true;
      submitButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Loggar in...';
      
      setTimeout(() => {
        // Simulera en lyckad inloggning
        showSuccessMessage('Inloggning lyckades!');
        
        // Spara inloggningsstatus i localStorage (i en riktig app skulle detta hanteras av cookies/sessioner)
        localStorage.setItem('gobet_logged_in', 'true');
        localStorage.setItem('gobet_user', JSON.stringify({
          username: email.split('@')[0],
          email: email,
          avatar: 'https://ui-avatars.com/api/?name=' + email.split('@')[0]
        }));
        
        // Omdirigera till hemsidan efter en kort fördröjning
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1500);
      }, 1000);
    });
  }
  
  // Registreringsformulär
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const username = document.getElementById('registerUsername').value.trim();
      const email = document.getElementById('registerEmail').value.trim();
      const password = document.getElementById('registerPassword').value;
      const confirmPassword = document.getElementById('registerConfirmPassword').value;
      const termsAgreement = document.getElementById('termsAgreement')?.checked;
      
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
      
      const strength = calculatePasswordStrength(password);
      if (strength.percent < 40) {
        if (!confirm('Ditt lösenord är svagt. Vill du fortsätta ändå?')) {
          return;
        }
      }
      
      // Simulera registreringsförfrågan till servern
      console.log('Registrerar...', { username, email });
      
      // Simulera laddning
      const submitButton = registerForm.querySelector('button[type="submit"]');
      submitButton.disabled = true;
      submitButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Skapar konto...';
      
      setTimeout(() => {
        // Simulera lyckad registrering
        showSuccessMessage('Konto skapat! Du loggas in automatiskt...');
        
        // Spara inloggningsstatus i localStorage (i en riktig app skulle detta hanteras av cookies/sessioner)
        localStorage.setItem('gobet_logged_in', 'true');
        localStorage.setItem('gobet_user', JSON.stringify({
          username: username,
          email: email,
          avatar: 'https://ui-avatars.com/api/?name=' + username
        }));
        
        // Omdirigera till hemsidan efter en kort fördröjning
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1500);
      }, 1500);
    });
  }
  
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