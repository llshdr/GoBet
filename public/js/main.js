// GoBet frontend JavaScript

document.addEventListener('DOMContentLoaded', () => {
  // Initiera Socket.io anslutning om tillgänglig
  initSocket();
  
  // Sätt upp tab navigation
  setupTabs();
  
  // Registrera event listeners
  registerEventListeners();
  
  // Ladda demo-data för UI
  loadDemoData();
});

// Initiera Socket.io anslutning
function initSocket() {
  try {
    const socket = io();
    
    // Lyssna på uppdateringar för bets
    socket.on('bet-added', (betData) => {
      console.log('Nytt bet tillagt:', betData);
      // Implementera uppdatering av UI
    });
    
    socket.on('odds-updated', (data) => {
      console.log('Odds uppdaterade:', data);
      // Implementera uppdatering av odds i UI
    });
    
    socket.on('bet-result', (data) => {
      console.log('Bet resultat:', data);
      // Visa resultat popover/notifikation
    });
    
    // Lyssna på chat-meddelanden
    socket.on('new-message', (data) => {
      console.log('Nytt meddelande:', data);
      // Lägg till meddelande i chat
    });
    
    // Spara socket i global variabel för att använda senare
    window.gobet = window.gobet || {};
    window.gobet.socket = socket;
    
    console.log('Socket.io ansluten!');
  } catch (err) {
    console.error('Kunde inte ansluta till Socket.io:', err);
  }
}

// Sätt upp tab navigation
function setupTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');
  
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetTab = button.dataset.tab;
      
      // Ta bort active-klassen från alla tabbar och innehåll
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabPanes.forEach(pane => pane.classList.remove('active'));
      
      // Lägg till active-klassen på den valda tabben och innehållet
      button.classList.add('active');
      document.getElementById(targetTab).classList.add('active');
    });
  });
}

// Registrera alla event listeners
function registerEventListeners() {
  // Hantera klick på "Delta" knappar
  document.querySelectorAll('.btn-join').forEach(button => {
    button.addEventListener('click', handleJoinBet);
  });
  
  // Hantera klick på "Skapa bet" knappar
  document.querySelectorAll('.create-bet-btn').forEach(button => {
    button.addEventListener('click', handleCreateBet);
  });
  
  // Hantera klick på "Skapa giveaway" knappar
  document.querySelectorAll('.create-giveaway-btn').forEach(button => {
    button.addEventListener('click', handleCreateGiveaway);
  });
  
  // Hantera user-menu dropdown på mobil
  const userMenu = document.querySelector('.user-menu');
  if (userMenu) {
    userMenu.addEventListener('click', (e) => {
      if (window.innerWidth <= 768) {
        e.currentTarget.classList.toggle('active');
      }
    });
  }
}

// Hantera att delta i ett bet
function handleJoinBet(e) {
  const betCard = e.currentTarget.closest('.bet-card, .giveaway-card');
  if (!betCard) return;
  
  const betTitle = betCard.querySelector('.bet-title, .giveaway-title').textContent;
  const isGiveaway = betCard.classList.contains('giveaway-card');
  
  // Demo popup - i verkliga applikationen skulle detta göra en API-förfrågan
  if (confirm(`Vill du delta i ${isGiveaway ? 'giveaway' : 'bet'}: "${betTitle}"?`)) {
    alert(`Du har gått med i ${isGiveaway ? 'giveaway' : 'bet'}: "${betTitle}"!`);
    e.currentTarget.textContent = 'Deltar';
    e.currentTarget.disabled = true;
  }
}

// Hantera att skapa ett nytt bet
function handleCreateBet() {
  // Demo popup - i verkliga applikationen skulle detta öppna en modal
  alert('Här skulle en modal öppnas för att skapa ett nytt bet!\n\nI den verkliga applikationen skulle du kunna:\n- Ange titel och beskrivning\n- Välja typ av bet\n- Sätta insats och pris\n- Bjuda in vänner\n- Ställa in tidsram');
}

// Hantera att skapa en ny giveaway
function handleCreateGiveaway() {
  // Demo popup - i verkliga applikationen skulle detta öppna en modal
  alert('Här skulle en modal öppnas för att skapa en ny giveaway!\n\nI den verkliga applikationen skulle du kunna:\n- Ange titel och beskrivning\n- Välja priser att ge bort\n- Sätta krav för deltagande\n- Ställa in tidsram');
}

// Ladda demo-data för UI-demo
function loadDemoData() {
  // Simulera att balansen uppdateras varje 30 sekunder
  simulateBalanceUpdates();
  
  // Simulera live-uppdateringar av data
  simulateLiveUpdates();
}

// Simulera balansuppdateringar för demo
function simulateBalanceUpdates() {
  const balanceElement = document.getElementById('gocoins-balance');
  if (!balanceElement) return;
  
  setInterval(() => {
    // Simulera slumpmässig ökning/minskning av balansen
    const currentBalance = parseInt(balanceElement.textContent, 10);
    const change = Math.floor(Math.random() * 200) - 100; // -100 till +100
    const newBalance = Math.max(0, currentBalance + change);
    
    // Animera ändringen
    animateBalanceChange(balanceElement, currentBalance, newBalance);
  }, 30000); // Var 30:e sekund
}

// Animera en balansändring
function animateBalanceChange(element, fromValue, toValue) {
  const duration = 1000; // 1 sekund
  const startTime = performance.now();
  
  function updateValue(currentTime) {
    const elapsedTime = currentTime - startTime;
    
    if (elapsedTime < duration) {
      const progress = elapsedTime / duration;
      const currentValue = Math.floor(fromValue + (toValue - fromValue) * progress);
      element.textContent = currentValue;
      requestAnimationFrame(updateValue);
    } else {
      element.textContent = toValue;
    }
  }
  
  requestAnimationFrame(updateValue);
}

// Simulera live-uppdateringar för demo
function simulateLiveUpdates() {
  // Simulera tidnedräkningar
  const timers = document.querySelectorAll('.bet-timer, .giveaway-timer');
  
  timers.forEach(timer => {
    const timeText = timer.textContent.trim();
    // Extrahera tid från formatet "2d 5h kvar"
    const matches = timeText.match(/(\d+)d\s+(\d+)h/);
    
    if (matches) {
      let days = parseInt(matches[1], 10);
      let hours = parseInt(matches[2], 10);
      
      // Uppdatera tiden varje minut
      setInterval(() => {
        // Minska tiden med 1 timme för demo
        hours--;
        
        if (hours < 0) {
          hours = 23;
          days--;
        }
        
        if (days < 0) {
          timer.innerHTML = '<i class="fas fa-check-circle"></i> Avslutad';
          return;
        }
        
        timer.innerHTML = `<i class="fas fa-clock"></i> ${days}d ${hours}h kvar`;
      }, 60000); // Varje minut
    }
  });
} 