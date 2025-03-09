/**
 * GoBet - Friends Management
 */

document.addEventListener('DOMContentLoaded', () => {
  console.log('Friends module initialized');
  
  // Initiera komponenter
  initFriendSearch();
  initFriendTabs();
  initAddFriendButton();
  initFriendActions();
  
  // Ladda demodata
  loadFriendsData();
});

/**
 * Initiera sökning av vänner
 */
function initFriendSearch() {
  const searchInput = document.getElementById('friendSearch');
  if (!searchInput) return;
  
  searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.trim().toLowerCase();
    searchFriends(searchTerm);
  });
}

/**
 * Sök efter vänner baserat på söktermen
 */
function searchFriends(searchTerm) {
  if (!searchTerm) {
    // Om söktermen är tom, visa alla vänner
    document.querySelectorAll('.friend-item').forEach(item => {
      item.style.display = '';
    });
    return;
  }
  
  // Filtrera vännernas lista
  document.querySelectorAll('.friend-item').forEach(item => {
    const friendName = item.querySelector('.friend-name').textContent.toLowerCase();
    if (friendName.includes(searchTerm)) {
      item.style.display = '';
    } else {
      item.style.display = 'none';
    }
  });
}

/**
 * Initiera flikar för vänner
 */
function initFriendTabs() {
  const tabs = document.querySelectorAll('.friend-tab');
  if (!tabs.length) return;
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Ta bort aktiv-klassen från alla flikar
      tabs.forEach(t => t.classList.remove('active'));
      
      // Lägg till aktiv-klassen på den klickade fliken
      tab.classList.add('active');
      
      // Visa motsvarande vänner
      const tabType = tab.dataset.tab;
      filterFriendsByType(tabType);
    });
  });
}

/**
 * Filtrera vänner baserat på typ (alla, online, väntande)
 */
function filterFriendsByType(type) {
  const allFriends = document.querySelectorAll('.friend-item');
  
  allFriends.forEach(friend => {
    if (type === 'all-friends') {
      friend.style.display = '';
    } else if (type === 'online-friends' && friend.classList.contains('online')) {
      friend.style.display = '';
    } else if (type === 'pending-friends' && friend.classList.contains('pending')) {
      friend.style.display = '';
    } else {
      friend.style.display = 'none';
    }
  });
}

/**
 * Initiera "Lägg till vän"-knappen
 */
function initAddFriendButton() {
  const addFriendBtn = document.querySelector('.btn-add-friend');
  if (!addFriendBtn) return;
  
  addFriendBtn.addEventListener('click', () => {
    openAddFriendModal();
  });
}

/**
 * Öppna modal för att lägga till vän
 */
function openAddFriendModal() {
  // Skapa modalinnehåll om det inte redan finns
  if (!document.getElementById('addFriendModal')) {
    createAddFriendModal();
  }
  
  // Visa modal
  const modal = document.getElementById('addFriendModal');
  modal.classList.add('active');
  
  // Fokusera på sökfältet
  const searchInput = document.getElementById('friendNameSearch');
  if (searchInput) {
    searchInput.focus();
  }
}

/**
 * Skapa modal för att lägga till vän
 */
function createAddFriendModal() {
  const modal = document.createElement('div');
  modal.id = 'addFriendModal';
  modal.className = 'modal';
  
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>Lägg till vän</h3>
        <button class="close-modal">&times;</button>
      </div>
      <div class="modal-body">
        <div class="search-container">
          <input type="text" id="friendNameSearch" placeholder="Sök användarnamn..." autocomplete="off">
          <i class="fa-solid fa-search"></i>
        </div>
        <div class="search-results" id="friendSearchResults">
          <p class="search-hint">Skriv in ett användarnamn för att söka bland alla GoBet-användare.</p>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-outline" id="cancelAddFriend">Avbryt</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Lägg till händelselyssnare
  const closeBtn = modal.querySelector('.close-modal');
  const cancelBtn = modal.querySelector('#cancelAddFriend');
  const searchInput = modal.querySelector('#friendNameSearch');
  
  closeBtn.addEventListener('click', () => {
    modal.classList.remove('active');
  });
  
  cancelBtn.addEventListener('click', () => {
    modal.classList.remove('active');
  });
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
    }
  });
  
  // Lägg till händelselyssnare för sökning
  searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.trim();
    if (searchTerm.length < 2) {
      document.getElementById('friendSearchResults').innerHTML = 
        '<p class="search-hint">Skriv minst 2 tecken för att söka.</p>';
      return;
    }
    
    searchRegisteredUsers(searchTerm);
  });
}

/**
 * Sök efter registrerade användare baserat på söktermen
 */
function searchRegisteredUsers(searchTerm) {
  const resultsContainer = document.getElementById('friendSearchResults');
  resultsContainer.innerHTML = '<p class="loading"><i class="fa-solid fa-spinner fa-spin"></i> Söker användare...</p>';
  
  // Simulera en sökning med fördröjning (i en riktig app skulle detta vara ett API-anrop)
  setTimeout(() => {
    // Hämta registrerade användare
    const registeredUsers = JSON.parse(localStorage.getItem('gobet_registered_users') || '[]');
    
    // Filtrera baserat på söktermen
    const filteredUsers = registeredUsers.filter(user => 
      user.userData.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Visa resultat
    if (filteredUsers.length === 0) {
      resultsContainer.innerHTML = '<p class="no-results">Inga användare hittades.</p>';
      return;
    }
    
    // Hämta aktuell användare
    const currentUser = JSON.parse(localStorage.getItem('gobet_user') || '{}');
    
    // Hämta vänner och väntande förfrågningar
    const friends = JSON.parse(localStorage.getItem('gobet_friends') || '[]');
    const pendingRequests = JSON.parse(localStorage.getItem('gobet_pending_requests') || '[]');
    
    // Skapa HTML för resultaten
    let html = '<div class="user-search-results">';
    
    filteredUsers.forEach(user => {
      const userData = user.userData;
      
      // Visa inte den aktuella användaren i sökresultaten
      if (userData.email === currentUser.email) return;
      
      // Kontrollera om användaren redan är en vän
      const isAlreadyFriend = friends.some(friend => friend.email === userData.email);
      
      // Kontrollera om det finns en väntande förfrågan
      const hasPendingRequest = pendingRequests.some(req => 
        req.recipient === userData.email || req.sender === userData.email
      );
      
      // Skapa användarelement
      html += `
        <div class="user-result">
          <img src="${userData.avatar}" alt="${userData.username}" class="user-avatar">
          <div class="user-info">
            <span class="user-name">${userData.username}</span>
            <span class="user-since">Medlem sedan ${formatDate(userData.joinDate)}</span>
          </div>
          <div class="user-actions">
      `;
      
      if (isAlreadyFriend) {
        html += `<button class="btn btn-sm btn-success" disabled>Vän</button>`;
      } else if (hasPendingRequest) {
        html += `<button class="btn btn-sm btn-outline" disabled>Förfrågan skickad</button>`;
      } else {
        html += `<button class="btn btn-sm btn-primary add-friend-btn" data-email="${userData.email}">Lägg till vän</button>`;
      }
      
      html += `
          </div>
        </div>
      `;
    });
    
    html += '</div>';
    resultsContainer.innerHTML = html;
    
    // Lägg till händelselyssnare för "Lägg till vän"-knappar
    document.querySelectorAll('.add-friend-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const userEmail = e.target.dataset.email;
        sendFriendRequest(userEmail);
        
        // Uppdatera knappens utseende
        e.target.disabled = true;
        e.target.textContent = 'Förfrågan skickad';
        e.target.classList.remove('btn-primary');
        e.target.classList.add('btn-outline');
      });
    });
  }, 500);
}

/**
 * Formatera datum till läsbart format
 */
function formatDate(dateString) {
  const options = { year: 'numeric', month: 'long' };
  return new Date(dateString).toLocaleDateString('sv-SE', options);
}

/**
 * Skicka vänförfrågan till en användare
 */
function sendFriendRequest(recipientEmail) {
  // Hämta aktuell användare
  const currentUser = JSON.parse(localStorage.getItem('gobet_user') || '{}');
  
  // Hämta väntande förfrågningar
  let pendingRequests = JSON.parse(localStorage.getItem('gobet_pending_requests') || '[]');
  
  // Kontrollera om det redan finns en förfrågan
  if (pendingRequests.some(req => req.recipient === recipientEmail && req.sender === currentUser.email)) {
    return false; // Förfrågan finns redan
  }
  
  // Lägg till ny förfrågan
  const newRequest = {
    sender: currentUser.email,
    recipient: recipientEmail,
    timestamp: new Date().toISOString()
  };
  
  pendingRequests.push(newRequest);
  localStorage.setItem('gobet_pending_requests', JSON.stringify(pendingRequests));
  
  // Visa bekräftelsemeddelande
  showSuccessMessage('Vänförfrågan skickad!');
  
  return true;
}

/**
 * Visa ett bekräftelsemeddelande
 */
function showSuccessMessage(message) {
  // Skapa element om det inte finns
  let messageEl = document.querySelector('.success-message');
  
  if (!messageEl) {
    messageEl = document.createElement('div');
    messageEl.className = 'success-message';
    messageEl.innerHTML = `
      <div class="success-content">
        <i class="fa-solid fa-circle-check"></i>
        <span id="successMessageText">${message}</span>
      </div>
    `;
    document.body.appendChild(messageEl);
  } else {
    document.getElementById('successMessageText').textContent = message;
  }
  
  // Visa meddelandet
  messageEl.classList.add('active');
  
  // Dölj efter 3 sekunder
  setTimeout(() => {
    messageEl.classList.remove('active');
  }, 3000);
}

/**
 * Initiera vänåtgärder (acceptera, neka, etc.)
 */
function initFriendActions() {
  // Lyssna på åtgärder som läggs till dynamiskt med hjälp av delegering
  document.addEventListener('click', (e) => {
    // Acceptera vänförfrågan
    if (e.target.classList.contains('accept-friend-btn')) {
      const requestId = e.target.closest('.friend-item').dataset.requestId;
      acceptFriendRequest(requestId);
    }
    
    // Neka vänförfrågan
    if (e.target.classList.contains('decline-friend-btn')) {
      const requestId = e.target.closest('.friend-item').dataset.requestId;
      declineFriendRequest(requestId);
    }
    
    // Ta bort vän
    if (e.target.classList.contains('remove-friend-btn')) {
      const friendEmail = e.target.closest('.friend-item').dataset.email;
      if (confirm('Är du säker på att du vill ta bort denna vän?')) {
        removeFriend(friendEmail);
      }
    }
  });
}

/**
 * Acceptera vänförfrågan
 */
function acceptFriendRequest(requestId) {
  // Hämta väntande förfrågningar
  let pendingRequests = JSON.parse(localStorage.getItem('gobet_pending_requests') || '[]');
  
  // Hitta aktuell förfrågan
  const requestIndex = pendingRequests.findIndex(req => req.id === requestId);
  if (requestIndex === -1) return false;
  
  const request = pendingRequests[requestIndex];
  
  // Hämta vänner
  let friends = JSON.parse(localStorage.getItem('gobet_friends') || '[]');
  
  // Hämta användardata för avsändaren
  const registeredUsers = JSON.parse(localStorage.getItem('gobet_registered_users') || '[]');
  const senderUser = registeredUsers.find(user => user.email === request.sender);
  
  if (!senderUser) return false;
  
  // Lägg till i vänner
  friends.push({
    email: request.sender,
    username: senderUser.userData.username,
    avatar: senderUser.userData.avatar,
    addedAt: new Date().toISOString()
  });
  
  localStorage.setItem('gobet_friends', JSON.stringify(friends));
  
  // Ta bort från väntande förfrågningar
  pendingRequests.splice(requestIndex, 1);
  localStorage.setItem('gobet_pending_requests', JSON.stringify(pendingRequests));
  
  // Uppdatera UI
  loadFriendsData();
  
  // Visa bekräftelsemeddelande
  showSuccessMessage('Vänförfrågan accepterad!');
  
  return true;
}

/**
 * Neka vänförfrågan
 */
function declineFriendRequest(requestId) {
  // Hämta väntande förfrågningar
  let pendingRequests = JSON.parse(localStorage.getItem('gobet_pending_requests') || '[]');
  
  // Hitta aktuell förfrågan
  const requestIndex = pendingRequests.findIndex(req => req.id === requestId);
  if (requestIndex === -1) return false;
  
  // Ta bort från väntande förfrågningar
  pendingRequests.splice(requestIndex, 1);
  localStorage.setItem('gobet_pending_requests', JSON.stringify(pendingRequests));
  
  // Uppdatera UI
  loadFriendsData();
  
  // Visa bekräftelsemeddelande
  showSuccessMessage('Vänförfrågan nekad.');
  
  return true;
}

/**
 * Ta bort vän
 */
function removeFriend(friendEmail) {
  // Hämta vänner
  let friends = JSON.parse(localStorage.getItem('gobet_friends') || '[]');
  
  // Filtrera bort vännen
  friends = friends.filter(friend => friend.email !== friendEmail);
  localStorage.setItem('gobet_friends', JSON.stringify(friends));
  
  // Uppdatera UI
  loadFriendsData();
  
  // Visa bekräftelsemeddelande
  showSuccessMessage('Vän borttagen.');
  
  return true;
}

/**
 * Ladda vändata
 */
function loadFriendsData() {
  const friendsContainer = document.querySelector('.friends-list');
  if (!friendsContainer) return;
  
  // Hämta aktuell användare
  const currentUser = JSON.parse(localStorage.getItem('gobet_user') || '{}');
  
  // Kontrollera om användaren är inloggad
  if (!currentUser.email) {
    friendsContainer.innerHTML = `
      <div class="auth-required">
        <i class="fa-solid fa-lock"></i>
        <h3>Inloggning krävs</h3>
        <p>Du måste vara inloggad för att se dina vänner.</p>
        <a href="login.html" class="btn btn-primary">Logga in</a>
      </div>
    `;
    return;
  }
  
  // Hämta vänner
  const friends = JSON.parse(localStorage.getItem('gobet_friends') || '[]');
  
  // Hämta väntande förfrågningar
  const pendingRequests = JSON.parse(localStorage.getItem('gobet_pending_requests') || '[]');
  
  // Filtrera förfrågningar för aktuell användare
  const userRequests = pendingRequests.filter(req => req.recipient === currentUser.email);
  
  // Ladda data i vänlistan
  let html = '';
  
  // Lägg till väntande förfrågningar
  userRequests.forEach((request, index) => {
    const registeredUsers = JSON.parse(localStorage.getItem('gobet_registered_users') || '[]');
    const senderUser = registeredUsers.find(user => user.email === request.sender);
    
    if (!senderUser) return;
    
    const userData = senderUser.userData;
    
    html += `
      <div class="friend-item pending" data-request-id="${request.id || index}">
        <div class="friend-avatar">
          <img src="${userData.avatar}" alt="${userData.username}">
          <span class="friend-status pending">Väntar</span>
        </div>
        <div class="friend-info">
          <span class="friend-name">${userData.username}</span>
          <span class="friend-action-time">Skickad ${formatRelativeTime(request.timestamp)}</span>
        </div>
        <div class="friend-actions">
          <button class="btn btn-sm btn-success accept-friend-btn"><i class="fa-solid fa-check"></i></button>
          <button class="btn btn-sm btn-error decline-friend-btn"><i class="fa-solid fa-xmark"></i></button>
        </div>
      </div>
    `;
  });
  
  // Lägg till befintliga vänner
  if (friends.length > 0) {
    friends.forEach(friend => {
      // Simulera online-status slumpmässigt
      const statuses = ['online', 'away', 'offline'];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      
      html += `
        <div class="friend-item ${randomStatus}" data-email="${friend.email}">
          <div class="friend-avatar">
            <img src="${friend.avatar}" alt="${friend.username}">
            <span class="friend-status ${randomStatus}"></span>
          </div>
          <div class="friend-info">
            <span class="friend-name">${friend.username}</span>
            <span class="friend-status-text">${randomStatus === 'online' ? 'Online' : randomStatus === 'away' ? 'Borta' : 'Offline'}</span>
          </div>
          <div class="friend-actions">
            <button class="btn btn-icon btn-message"><i class="fa-solid fa-message"></i></button>
            <button class="btn btn-icon btn-challenge"><i class="fa-solid fa-dice"></i></button>
            <div class="friend-more">
              <button class="btn btn-icon btn-more"><i class="fa-solid fa-ellipsis"></i></button>
              <div class="friend-more-dropdown">
                <a href="#"><i class="fa-solid fa-user"></i> Visa profil</a>
                <a href="#"><i class="fa-solid fa-dice-d6"></i> Skapa Bet</a>
                <a href="#" class="text-error remove-friend-btn"><i class="fa-solid fa-user-minus"></i> Ta bort vän</a>
              </div>
            </div>
          </div>
        </div>
      `;
    });
  }
  
  // Om det inte finns några vänner eller förfrågningar
  if (html === '') {
    html = `
      <div class="empty-state">
        <img src="images/empty-friends.svg" alt="Inga vänner">
        <h3>Inga vänner ännu</h3>
        <p>Lägg till vänner för att börja betta och utmana dom på GoBet!</p>
        <button class="btn btn-primary btn-add-friend">Lägg till vänner</button>
      </div>
    `;
  }
  
  friendsContainer.innerHTML = html;
  
  // Aktivera dropdown för "mer"-menyer
  document.querySelectorAll('.btn-more').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const dropdown = e.target.closest('.friend-more').querySelector('.friend-more-dropdown');
      dropdown.classList.toggle('active');
      e.stopPropagation();
    });
  });
  
  // Stäng dropdowns när man klickar utanför
  document.addEventListener('click', () => {
    document.querySelectorAll('.friend-more-dropdown.active').forEach(dropdown => {
      dropdown.classList.remove('active');
    });
  });
}

/**
 * Formatera relativ tid från ISO-datum
 */
function formatRelativeTime(isoDate) {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  
  if (diffSec < 60) {
    return 'just nu';
  } else if (diffMin < 60) {
    return `${diffMin} min sedan`;
  } else if (diffHour < 24) {
    return `${diffHour} tim sedan`;
  } else if (diffDay < 7) {
    return `${diffDay} dagar sedan`;
  } else {
    return date.toLocaleDateString('sv-SE');
  }
} 