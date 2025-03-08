/**
 * GoBet - Friends Management
 */

document.addEventListener('DOMContentLoaded', () => {
  console.log('Friends module initialized');
  
  // Initialisera komponenter
  initFriendTabs();
  initFriendSearch();
  initAddFriendModal();
  initFriendActions();
});

/**
 * Initialisera väntabbar
 */
function initFriendTabs() {
  const tabs = document.querySelectorAll('.friend-tab');
  const friendLists = document.querySelectorAll('.friend-list');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Avmarkera alla tabbar
      tabs.forEach(t => t.classList.remove('active'));
      
      // Dölj alla listor
      friendLists.forEach(list => list.style.display = 'none');
      
      // Markera klickad tab och visa motsvarande lista
      tab.classList.add('active');
      const targetList = document.getElementById(tab.getAttribute('data-tab'));
      
      if (targetList) {
        targetList.style.display = 'grid';
      }
    });
  });
}

/**
 * Initialisera sökning av vänner
 */
function initFriendSearch() {
  const searchInput = document.getElementById('friendSearch');
  
  if (!searchInput) return;
  
  searchInput.addEventListener('input', (e) => {
    const searchValue = e.target.value.toLowerCase().trim();
    const visibleList = document.querySelector('.friend-list[style="display: grid"]') || document.querySelector('.friend-list');
    const friendItems = visibleList.querySelectorAll('.friend-item');
    
    friendItems.forEach(item => {
      const name = item.querySelector('.friend-name').textContent.toLowerCase();
      
      if (name.includes(searchValue)) {
        item.style.display = 'flex';
      } else {
        item.style.display = 'none';
      }
    });
  });
}

/**
 * Initialisera modal för att lägga till vänner
 */
function initAddFriendModal() {
  const addFriendButton = document.querySelector('.btn-add-friend');
  const modal = document.getElementById('addFriendModal');
  const cancelButton = document.getElementById('cancelAddFriend');
  const confirmButton = document.getElementById('confirmAddFriend');
  const closeButtons = document.querySelectorAll('.close-modal');
  
  if (!addFriendButton || !modal) return;
  
  // Öppna modal
  addFriendButton.addEventListener('click', () => {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Förhindra scrollning av bakgrund
    document.getElementById('friendUsername').focus();
  });
  
  // Stäng modal-knappar
  closeButtons.forEach(button => {
    button.addEventListener('click', closeModal);
  });
  
  // Stäng med avbryt-knapp
  if (cancelButton) {
    cancelButton.addEventListener('click', closeModal);
  }
  
  // Skicka vänförfrågan
  if (confirmButton) {
    confirmButton.addEventListener('click', () => {
      const username = document.getElementById('friendUsername').value.trim();
      const message = document.getElementById('friendMessage').value.trim();
      
      if (!username) {
        showNotification('Ange ett användarnamn eller e-post', 'error');
        return;
      }
      
      // Simulera att skicka förfrågan till servern
      setTimeout(() => {
        closeModal();
        showSuccessMessage('Vänförfrågan skickad till ' + username);
        document.getElementById('friendUsername').value = '';
        document.getElementById('friendMessage').value = '';
      }, 500);
    });
  }
  
  // Stäng med ESC-tangent
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });
  
  // Stäng när man klickar utanför modal
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });
  
  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = ''; // Återställ scrollning
  }
}

/**
 * Initialisera vänåtgärder
 */
function initFriendActions() {
  const actionButtons = document.querySelectorAll('.friend-actions .btn-icon:last-child');
  const modal = document.getElementById('friendActionsModal');
  const closeButtons = document.querySelectorAll('#friendActionsModal .close-modal');
  const actionItems = document.querySelectorAll('.friend-action-item');
  
  if (!actionButtons.length || !modal) return;
  
  // Öppna åtgärdsmodal
  actionButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      // Förhindra att klickeventen bubblar till förälderelement
      e.stopPropagation();
      
      // Spara referens till aktuell vän
      const friendItem = button.closest('.friend-item');
      const friendName = friendItem.querySelector('.friend-name').textContent;
      
      // Uppdatera modal-innehåll om nödvändigt (t.ex. titeln)
      const modalTitle = modal.querySelector('.modal-header h3');
      modalTitle.textContent = 'Alternativ för ' + friendName;
      
      // Visa modal
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
      
      // Spara vänens ID som datattribut på modalen för användning senare
      modal.dataset.friendId = friendItem.dataset.id || '0';
    });
  });
  
  // Stäng modal-knappar
  closeButtons.forEach(button => {
    button.addEventListener('click', closeActionsModal);
  });
  
  // Hantera klick på handlingsalternativ
  actionItems.forEach(item => {
    item.addEventListener('click', function() {
      const actionType = this.dataset.action || this.textContent.trim();
      const friendId = modal.dataset.friendId;
      
      // Simulera respons baserat på handlingstyp
      handleFriendAction(actionType, friendId);
      
      // Stäng modal
      closeActionsModal();
    });
  });
  
  // Stäng med ESC-tangent
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeActionsModal();
    }
  });
  
  // Stäng när man klickar utanför modal
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeActionsModal();
    }
  });
  
  function closeActionsModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

/**
 * Hantera vänåtgärder
 */
function handleFriendAction(actionType, friendId) {
  console.log(`Handling action: ${actionType} for friend ID: ${friendId}`);
  
  // Simulera olika åtgärder (i en riktig app skulle detta anropa backend API)
  switch(actionType.toLowerCase()) {
    case 'visa profil':
      window.location.href = `profile.html?id=${friendId}`;
      break;
    case 'skapa bet':
      window.location.href = `create-bet.html?friend=${friendId}`;
      break;
    case 'skicka gåva':
      showSuccessMessage('Funktionen för att skicka gåvor kommer snart!');
      break;
    case 'ta bort vän':
      if (confirm('Är du säker på att du vill ta bort denna vän?')) {
        // Simulera borttagning av vän
        showSuccessMessage('Vännen har tagits bort');
      }
      break;
    case 'blockera användare':
      if (confirm('Är du säker på att du vill blockera denna användare?')) {
        // Simulera blockering av användare
        showSuccessMessage('Användaren har blockerats');
      }
      break;
    default:
      showSuccessMessage('Funktionen kommer snart!');
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