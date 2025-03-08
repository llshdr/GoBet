/**
 * GoBet - Profile Management
 */

document.addEventListener('DOMContentLoaded', () => {
  console.log('Profile module initialized');
  
  // Kontrollera inloggningsstatus
  checkLoginStatus();
  
  // Initialisera komponenter
  initProfileTabs();
  initProfileModal();
  initLogout();
  initAvatarUpload();
  initBannerUpload();
  initFilterButtons();
});

/**
 * Kontrollera inloggningsstatus och ladda användardata
 */
function checkLoginStatus() {
  const isLoggedIn = localStorage.getItem('gobet_logged_in') === 'true';
  
  if (!isLoggedIn) {
    // Omdirigera till inloggningssidan om användaren inte är inloggad
    window.location.href = 'login.html';
    return;
  }
  
  // Ladda användardata
  loadUserProfile();
}

/**
 * Ladda användardata från localStorage (i en riktig app skulle detta komma från servern)
 */
function loadUserProfile() {
  const userData = JSON.parse(localStorage.getItem('gobet_user')) || {};
  
  // Uppdatera header-menyn
  const userAvatar = document.getElementById('userAvatar');
  const userDisplayName = document.getElementById('userDisplayName');
  
  if (userAvatar && userData.avatar) {
    userAvatar.src = userData.avatar;
  }
  
  if (userDisplayName && userData.username) {
    userDisplayName.textContent = userData.username;
  }
  
  // Uppdatera profilsidan
  const profileAvatar = document.getElementById('profileAvatar');
  const profileName = document.getElementById('profileName');
  const profileBio = document.getElementById('profileBio');
  
  if (profileAvatar && userData.avatar) {
    profileAvatar.src = userData.avatar;
  }
  
  if (profileName && userData.username) {
    profileName.textContent = userData.username;
  }
  
  if (profileBio && userData.bio) {
    profileBio.textContent = userData.bio;
  }
  
  // Ladda data till redigeringsformuläret
  preloadEditForm(userData);
}

/**
 * Förladda data till redigeringsformuläret
 */
function preloadEditForm(userData) {
  const editUsername = document.getElementById('editUsername');
  const editEmail = document.getElementById('editEmail');
  const editBio = document.getElementById('editBio');
  const bioCharCount = document.getElementById('bioCharCount');
  const avatarPreview = document.getElementById('avatarPreview');
  
  if (editUsername && userData.username) {
    editUsername.value = userData.username;
  }
  
  if (editEmail && userData.email) {
    editEmail.value = userData.email;
  }
  
  if (editBio && userData.bio) {
    editBio.value = userData.bio;
    if (bioCharCount) {
      bioCharCount.textContent = userData.bio.length;
    }
  }
  
  if (avatarPreview && userData.avatar) {
    avatarPreview.src = userData.avatar;
  }
  
  // Uppdatera antal tecken i biografi när användaren skriver
  if (editBio && bioCharCount) {
    editBio.addEventListener('input', () => {
      bioCharCount.textContent = editBio.value.length;
    });
  }
}

/**
 * Initialisera profiltabbar
 */
function initProfileTabs() {
  const tabs = document.querySelectorAll('.profile-tab');
  const panels = document.querySelectorAll('.tab-panel');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Avmarkera alla tabbar
      tabs.forEach(t => t.classList.remove('active'));
      
      // Dölj alla paneler
      panels.forEach(panel => panel.classList.remove('active'));
      
      // Markera klickad tab och visa motsvarande panel
      tab.classList.add('active');
      const tabId = tab.getAttribute('data-tab');
      
      if (tabId) {
        const panel = document.getElementById(tabId);
        if (panel) {
          panel.classList.add('active');
        }
      }
    });
  });
}

/**
 * Initialisera profilredigeringsmodal
 */
function initProfileModal() {
  const editProfileBtn = document.getElementById('editProfileBtn');
  const editProfileModal = document.getElementById('editProfileModal');
  const closeModalBtn = document.querySelector('#editProfileModal .close-modal');
  const cancelEditProfile = document.getElementById('cancelEditProfile');
  const saveProfile = document.getElementById('saveProfile');
  
  if (!editProfileBtn || !editProfileModal) return;
  
  // Öppna modal
  editProfileBtn.addEventListener('click', () => {
    editProfileModal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Förhindra scrollning
  });
  
  // Stäng modal (kryss-knapp)
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeModal);
  }
  
  // Stäng modal (avbryt-knapp)
  if (cancelEditProfile) {
    cancelEditProfile.addEventListener('click', closeModal);
  }
  
  // Spara profil
  if (saveProfile) {
    saveProfile.addEventListener('click', saveUserProfile);
  }
  
  // Stäng med ESC-tangent
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && editProfileModal.classList.contains('active')) {
      closeModal();
    }
  });
  
  // Stäng när man klickar utanför modal
  editProfileModal.addEventListener('click', (e) => {
    if (e.target === editProfileModal) {
      closeModal();
    }
  });
  
  function closeModal() {
    editProfileModal.classList.remove('active');
    document.body.style.overflow = ''; // Återställ scrollning
  }
}

/**
 * Spara användarprofil
 */
function saveUserProfile() {
  const editUsername = document.getElementById('editUsername');
  const editEmail = document.getElementById('editEmail');
  const editBio = document.getElementById('editBio');
  const avatarPreview = document.getElementById('avatarPreview');
  const bannerPreview = document.getElementById('bannerPreview');
  
  if (!editUsername || !editEmail) return;
  
  const username = editUsername.value.trim();
  const email = editEmail.value.trim();
  const bio = editBio ? editBio.value.trim() : '';
  
  if (!username || !email) {
    alert('Vänligen fyll i alla obligatoriska fält.');
    return;
  }
  
  // Hämta tidigare användardata
  const userData = JSON.parse(localStorage.getItem('gobet_user')) || {};
  
  // Uppdatera användardata
  const updatedUserData = {
    ...userData,
    username,
    email,
    bio,
    avatar: avatarPreview ? avatarPreview.src : userData.avatar,
    banner: bannerPreview ? bannerPreview.src : userData.banner
  };
  
  // Spara uppdaterad data i localStorage
  localStorage.setItem('gobet_user', JSON.stringify(updatedUserData));
  
  // Uppdatera UI
  loadUserProfile();
  
  // Stäng modal
  const editProfileModal = document.getElementById('editProfileModal');
  if (editProfileModal) {
    editProfileModal.classList.remove('active');
    document.body.style.overflow = '';
  }
  
  // Visa bekräftelsemeddelande
  showSuccessMessage('Profilen har uppdaterats');
}

/**
 * Initialisera bilduppladdning för profilbild
 */
function initAvatarUpload() {
  const uploadAvatarBtn = document.getElementById('uploadAvatarBtn');
  const avatarUpload = document.getElementById('avatarUpload');
  const avatarPreview = document.getElementById('avatarPreview');
  const btnEditAvatar = document.querySelector('.btn-edit-avatar');
  
  if (uploadAvatarBtn && avatarUpload && avatarPreview) {
    uploadAvatarBtn.addEventListener('click', () => {
      avatarUpload.click();
    });
    
    avatarUpload.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          alert('Bilden är för stor. Max storlek är 5MB.');
          return;
        }
        
        const reader = new FileReader();
        reader.onload = (event) => {
          avatarPreview.src = event.target.result;
        };
        reader.readAsDataURL(file);
      }
    });
  }
  
  // Öppna modal och fokusera på profilbilden när användaren klickar på ändra-knappen
  if (btnEditAvatar) {
    btnEditAvatar.addEventListener('click', () => {
      const editProfileModal = document.getElementById('editProfileModal');
      if (editProfileModal) {
        editProfileModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Skrolla till profilbilduppladdningen
        const uploadContainer = document.querySelector('.upload-preview');
        if (uploadContainer) {
          setTimeout(() => {
            uploadContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 300);
        }
      }
    });
  }
}

/**
 * Initialisera bilduppladdning för banner
 */
function initBannerUpload() {
  const uploadBannerBtn = document.getElementById('uploadBannerBtn');
  const bannerUpload = document.getElementById('bannerUpload');
  const bannerPreview = document.getElementById('bannerPreview');
  const btnEditBanner = document.querySelector('.btn-edit-banner');
  
  if (uploadBannerBtn && bannerUpload && bannerPreview) {
    uploadBannerBtn.addEventListener('click', () => {
      bannerUpload.click();
    });
    
    bannerUpload.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          alert('Bilden är för stor. Max storlek är 5MB.');
          return;
        }
        
        const reader = new FileReader();
        reader.onload = (event) => {
          bannerPreview.src = event.target.result;
        };
        reader.readAsDataURL(file);
      }
    });
  }
  
  // Öppna modal och fokusera på bannerbilden när användaren klickar på ändra-knappen
  if (btnEditBanner) {
    btnEditBanner.addEventListener('click', () => {
      const editProfileModal = document.getElementById('editProfileModal');
      if (editProfileModal) {
        editProfileModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Skrolla till banneruppladdningen
        const uploadContainer = document.querySelector('.banner-preview');
        if (uploadContainer) {
          setTimeout(() => {
            uploadContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 300);
        }
      }
    });
  }
}

/**
 * Initialisera filterknappar
 */
function initFilterButtons() {
  const filterGroups = document.querySelectorAll('.filter-buttons');
  
  filterGroups.forEach(group => {
    const filterButtons = group.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        // Avmarkera alla knappar i denna grupp
        filterButtons.forEach(btn => btn.classList.remove('active'));
        
        // Markera den klickade knappen
        button.classList.add('active');
        
        // Här skulle vi implementera faktisk filtrering av innehåll
        console.log('Filter selected:', button.textContent.trim());
      });
    });
  });
}

/**
 * Initialisera utloggning
 */
function initLogout() {
  const logoutBtn = document.getElementById('logoutBtn');
  
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      
      if (confirm('Är du säker på att du vill logga ut?')) {
        // Rensa inloggningsstatus
        localStorage.removeItem('gobet_logged_in');
        
        // Visa meddelande
        showSuccessMessage('Du har loggats ut');
        
        // Omdirigera till inloggningssidan efter en kort fördröjning
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 1500);
      }
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