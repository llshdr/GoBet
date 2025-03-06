document.addEventListener('DOMContentLoaded', () => {
  // Fetch and display matches
  fetchMatches();
  
  // Add event listeners
  setupEventListeners();
});

// Fetch matches from the API
async function fetchMatches() {
  const matchesContainer = document.getElementById('matches-container');
  
  try {
    const response = await fetch('/api/odds');
    const data = await response.json();
    
    // Remove loading message
    matchesContainer.innerHTML = '';
    
    // Display matches
    if (data.matches && data.matches.length > 0) {
      data.matches.forEach(match => {
        matchesContainer.appendChild(createMatchCard(match));
      });
    } else {
      matchesContainer.innerHTML = '<p class="no-matches">Inga matcher tillgängliga just nu.</p>';
    }
  } catch (error) {
    console.error('Error fetching matches:', error);
    matchesContainer.innerHTML = '<p class="error">Kunde inte ladda matcher. Försök igen senare.</p>';
  }
}

// Create a match card element
function createMatchCard(match) {
  const matchCard = document.createElement('div');
  matchCard.className = 'match-card';
  
  matchCard.innerHTML = `
    <div class="match-header">
      <span class="match-time">20:45</span>
      <span class="match-league">Champions League</span>
    </div>
    <div class="match-teams">
      <div class="team">${match.team1}</div>
      <div class="vs">VS</div>
      <div class="team">${match.team2}</div>
    </div>
    <div class="match-odds">
      <button class="odds-btn" data-match-id="${match.id}" data-outcome="1" data-odds="${match.odds1}">
        <span class="outcome">1</span>
        <span class="odds-value">${match.odds1}</span>
      </button>
      <button class="odds-btn" data-match-id="${match.id}" data-outcome="X" data-odds="${match.oddsX}">
        <span class="outcome">X</span>
        <span class="odds-value">${match.oddsX}</span>
      </button>
      <button class="odds-btn" data-match-id="${match.id}" data-outcome="2" data-odds="${match.odds2}">
        <span class="outcome">2</span>
        <span class="odds-value">${match.odds2}</span>
      </button>
    </div>
  `;
  
  return matchCard;
}

// Setup event listeners
function setupEventListeners() {
  // Listen for clicks on odds buttons
  document.addEventListener('click', (e) => {
    if (e.target.closest('.odds-btn')) {
      const button = e.target.closest('.odds-btn');
      const matchId = button.dataset.matchId;
      const outcome = button.dataset.outcome;
      const odds = button.dataset.odds;
      
      // Add to bet slip (will be implemented later)
      addToBetSlip(matchId, outcome, odds);
    }
  });
  
  // Login button
  const loginBtn = document.querySelector('.login-btn');
  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      alert('Inloggningsfunktionen kommer snart!');
    });
  }
  
  // Register button
  const registerBtn = document.querySelector('.register-btn');
  if (registerBtn) {
    registerBtn.addEventListener('click', () => {
      alert('Registreringsfunktionen kommer snart!');
    });
  }
  
  // CTA button
  const ctaBtn = document.querySelector('.cta-btn');
  if (ctaBtn) {
    ctaBtn.addEventListener('click', () => {
      // Scroll to matches section
      const matchesSection = document.querySelector('.featured-matches');
      if (matchesSection) {
        matchesSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }
}

// Add match to bet slip
function addToBetSlip(matchId, outcome, odds) {
  console.log(`Added to bet slip: Match ID ${matchId}, Outcome: ${outcome}, Odds: ${odds}`);
  alert(`Spel tillagt! Match: ${matchId}, Resultat: ${outcome}, Odds: ${odds}`);
  
  // In a real application, this would add the bet to a bet slip component
  // and possibly store it in local storage or a user session
}

// Additional CSS for match cards
const style = document.createElement('style');
style.textContent = `
  .match-card {
    background-color: #fff;
    border-radius: 10px;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
    padding: 20px;
    transition: transform 0.3s ease;
  }
  
  .match-card:hover {
    transform: translateY(-5px);
  }
  
  .match-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 15px;
    font-size: 0.9rem;
    color: #777;
  }
  
  .match-teams {
    text-align: center;
    margin-bottom: 20px;
  }
  
  .team {
    font-weight: bold;
    font-size: 1.1rem;
  }
  
  .vs {
    margin: 10px 0;
    color: #777;
  }
  
  .match-odds {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }
  
  .odds-btn {
    background-color: #f8f9fa;
    border: 1px solid #ddd;
    border-radius: 5px;
    padding: 10px;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    transition: all 0.3s ease;
  }
  
  .odds-btn:hover {
    background-color: var(--accent-color);
    color: #fff;
    border-color: var(--accent-color);
  }
  
  .outcome {
    font-weight: bold;
  }
  
  .odds-value {
    margin-top: 5px;
    font-size: 1.1rem;
    color: var(--secondary-color);
  }
  
  .odds-btn:hover .odds-value {
    color: #fff;
  }
  
  .no-matches, .error {
    text-align: center;
    grid-column: 1 / -1;
    padding: 20px;
    color: #777;
  }
  
  .error {
    color: var(--secondary-color);
  }
`;

document.head.appendChild(style); 