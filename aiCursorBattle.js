// AI Cursor Battle System
export const aiCursorBattle = {
  playerHealth: 100,
  maxHealth: 100,
  isPlayerDead: false,
  damageOverlay: null,
  battleActive: false,
  uiElements: [],
  uiOriginalPositions: {},
  
  init() {
    // Create player health bar
    this.createHealthBar();
    
    // Create damage overlay
    this.createDamageOverlay();
    
    // Add battle commands to console
    this.addConsoleCommands();
  },
  
  createHealthBar() {
    const healthBar = document.createElement('div');
    healthBar.id = 'playerHealthBar';
    healthBar.innerHTML = `
      <div class="health-bar-container">
        <div class="health-bar-text">HP: 100/100</div>
        <div class="health-bar-bg">
          <div class="health-bar-fill"></div>
        </div>
      </div>
    `;
    document.body.appendChild(healthBar);
    
    // Initially hide health bar
    healthBar.style.display = 'none';
  },
  
  createDamageOverlay() {
    this.damageOverlay = document.createElement('div');
    this.damageOverlay.id = 'damageOverlay';
    document.body.appendChild(this.damageOverlay);
  },
  
  startBattle() {
    if (this.battleActive) return;
    
    this.battleActive = true;
    this.playerHealth = this.maxHealth;
    this.isPlayerDead = false;
    
    // Show health bar
    const healthBar = document.getElementById('playerHealthBar');
    healthBar.style.display = 'block';
    this.updateHealthBar();
    
    // Start tracking player cursor position
    document.addEventListener('mousemove', this.trackPlayerCursor);
    
    // Store original positions of UI elements before battle
    this.storeUIPositions();
    
    // Set battle mode for player cursor
    if (window.playerCursor) {
      window.playerCursor.setBattleMode(true);
      document.body.classList.add('battle-active');
    }
    
    console.log('AI cursors are attacking! Defend yourself!');
  },
  
  stopBattle() {
    if (!this.battleActive) return;
    
    this.battleActive = false;
    
    // Hide health bar
    const healthBar = document.getElementById('playerHealthBar');
    healthBar.style.display = 'none';
    
    // Stop tracking player cursor
    document.removeEventListener('mousemove', this.trackPlayerCursor);
    
    // Reset damage overlay
    this.damageOverlay.style.opacity = '0';
    
    // Reset UI elements
    this.resetUIPositions();
    
    // Turn off battle mode for player cursor
    if (window.playerCursor) {
      window.playerCursor.setBattleMode(false);
      document.body.classList.remove('battle-active');
    }
    
    console.log('Battle ended. UI restored.');
  },
  
  trackPlayerCursor(e) {
    // Implement in aiCursorDraggable.js
  },
  
  damagePlayer(amount) {
    if (this.isPlayerDead) return;
    
    this.playerHealth -= amount;
    this.playerHealth = Math.max(0, this.playerHealth);
    
    // Update health bar
    this.updateHealthBar();
    
    // Flash damage overlay
    this.flashDamageOverlay(amount);
    
    // Check if player died
    if (this.playerHealth <= 0) {
      this.playerDeath();
    }
  },
  
  healPlayer(amount) {
    this.playerHealth += amount;
    this.playerHealth = Math.min(this.maxHealth, this.playerHealth);
    
    // Update health bar
    this.updateHealthBar();
    
    // Flash heal overlay
    this.flashHealOverlay();
    
    // Revive if was dead
    if (this.isPlayerDead) {
      this.revivePlayer();
    }
  },
  
  updateHealthBar() {
    const healthBar = document.getElementById('playerHealthBar');
    if (!healthBar) return;
    
    const fillBar = healthBar.querySelector('.health-bar-fill');
    const textElement = healthBar.querySelector('.health-bar-text');
    
    const healthPercent = (this.playerHealth / this.maxHealth) * 100;
    fillBar.style.width = `${healthPercent}%`;
    
    // Change color based on health
    if (healthPercent > 60) {
      fillBar.style.backgroundColor = '#4caf50';
    } else if (healthPercent > 30) {
      fillBar.style.backgroundColor = '#ff9800';
    } else {
      fillBar.style.backgroundColor = '#f44336';
    }
    
    textElement.textContent = `HP: ${Math.round(this.playerHealth)}/${this.maxHealth}`;
  },
  
  flashDamageOverlay(amount) {
    // Calculate opacity based on damage (higher damage = more red)
    const opacity = Math.min(0.7, amount / 30);
    
    this.damageOverlay.style.backgroundColor = 'rgba(255, 0, 0, ' + opacity + ')';
    this.damageOverlay.style.opacity = '1';
    
    setTimeout(() => {
      this.damageOverlay.style.opacity = '0';
    }, 200);
  },
  
  flashHealOverlay() {
    this.damageOverlay.style.backgroundColor = 'rgba(0, 255, 0, 0.3)';
    this.damageOverlay.style.opacity = '1';
    
    setTimeout(() => {
      this.damageOverlay.style.opacity = '0';
    }, 200);
  },
  
  playerDeath() {
    this.isPlayerDead = true;
    
    // Full red overlay
    this.damageOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.98)';
    this.damageOverlay.style.opacity = '1';
    this.damageOverlay.style.transition = 'opacity 2s ease-in';
    
    // Show death message
    const deathMessage = document.createElement('div');
    deathMessage.id = 'deathMessage';
    deathMessage.innerHTML = `
      <div class="death-message">
        <h1>YOU DIED</h1>
        <p>Open the console with [\`] key and type "heal" to revive</p>
      </div>
    `;
    document.body.appendChild(deathMessage);
    
    // Hide health bar
    const healthBar = document.getElementById('playerHealthBar');
    healthBar.style.display = 'none';
    
    console.log('YOU DIED! Type "heal" in the console to revive.');
  },
  
  revivePlayer() {
    this.isPlayerDead = false;
    
    // Fade out black overlay
    this.damageOverlay.style.transition = 'opacity 1s ease-out';
    this.damageOverlay.style.opacity = '0';
    
    // Remove death message
    const deathMessage = document.getElementById('deathMessage');
    if (deathMessage) {
      document.body.removeChild(deathMessage);
    }
    
    // Show health bar again
    const healthBar = document.getElementById('playerHealthBar');
    healthBar.style.display = 'block';
    
    // Set health to 25%
    this.playerHealth = Math.floor(this.maxHealth * 0.25);
    this.updateHealthBar();
    
    console.log('You have been revived with 25% health!');
  },
  
  storeUIPositions() {
    // Store positions of all UI elements we want to manipulate
    this.uiElements = [];
    this.uiOriginalPositions = {};
    
    // Collection of elements that can be used as weapons
    const weaponizableElements = [
      ...document.querySelectorAll('button'),
      ...document.querySelectorAll('.modal-content'),
      ...document.querySelectorAll('.shop-item'),
      ...document.querySelectorAll('h1, h2, h3'),
      ...document.querySelectorAll('.container')
    ];
    
    weaponizableElements.forEach(element => {
      // Skip if element is not visible or if it's the console
      if (!element.offsetParent || element.closest('.console-container')) {
        return;
      }
      
      const rect = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);
      
      // Store original positions and styles
      this.uiOriginalPositions[element.outerHTML] = {
        element: element,
        left: rect.left,
        top: rect.top,
        transform: style.transform,
        transition: style.transition,
        position: style.position
      };
      
      this.uiElements.push(element);
      
      // Make element absolute positioned if it's not already
      if (style.position !== 'fixed' && style.position !== 'absolute') {
        element.style.position = 'absolute';
        element.style.left = rect.left + 'px';
        element.style.top = rect.top + 'px';
      }
      
      // Add transition for smooth movement
      element.style.transition = 'all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
    });
    
    return this.uiElements;
  },
  
  resetUIPositions() {
    // Restore all UI elements to their original positions
    Object.values(this.uiOriginalPositions).forEach(data => {
      const element = data.element;
      
      if (element && element.parentNode) {
        // Reset position
        element.style.transition = data.transition;
        element.style.transform = data.transform;
        
        if (data.position !== 'fixed' && data.position !== 'absolute') {
          // Allow it to return to flow
          setTimeout(() => {
            element.style.position = data.position;
            element.style.left = '';
            element.style.top = '';
          }, 500); // Wait for transition to complete
        } else {
          // Just reset position
          element.style.left = data.left + 'px';
          element.style.top = data.top + 'px';
        }
      }
    });
    
    this.uiElements = [];
    this.uiOriginalPositions = {};
  },
  
  getRandomUIWeapon() {
    if (this.uiElements.length === 0) return null;
    return this.uiElements[Math.floor(Math.random() * this.uiElements.length)];
  },
  
  addConsoleCommands() {
    // Add console commands when imported from console.js
    import('./console.js').then(module => {
      const consoleSystem = module.consoleSystem;
      
      consoleSystem.commands.heal = () => {
        aiCursorBattle.healPlayer(100);
      };
    });
  }
};