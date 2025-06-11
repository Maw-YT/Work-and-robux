import { gameState, defaultShopItems, updateMoneyDisplay, updateRobuxDisplay, updateWorkButtonText, updateShopItemsDisplay } from './gameState.js';

export const saveLoadGame = {
  lastSaveTime: 0,
  SAVE_INTERVAL: 600000, // 10 minutes

  init() {
    const saveProgressButton = document.getElementById('saveProgressButton');
    const loadProgressButton = document.getElementById('loadProgressButton');
    
    saveProgressButton.addEventListener('click', this.saveGameProgress.bind(this));
    
    // Create a hidden file input for loading progress
    const loadProgressFileInput = document.createElement('input');
    loadProgressFileInput.type = 'file';
    loadProgressFileInput.accept = '.json';
    loadProgressFileInput.style.display = 'none';
    loadProgressFileInput.addEventListener('change', (event) => this.loadGameProgress(event)); // Pass event directly
    document.body.appendChild(loadProgressFileInput);

    loadProgressButton.addEventListener('click', () => {
      loadProgressFileInput.click();
    });
  },

  saveGameProgress() {
    const gameProgress = {
      money: gameState.money,
      robux: gameState.robux,
      workMultiplier: gameState.workMultiplier,
      workUpgradeCost: gameState.workUpgradeCost,
      clickMultiplier: gameState.clickMultiplier, // Ensure all relevant state is saved
      clickMultiplierCost: gameState.clickMultiplierCost,
      passiveIncome: gameState.passiveIncome,
      passiveIncomeCost: gameState.passiveIncomeCost,
      exchangeRateBonus: gameState.exchangeRateBonus,
      exchangeRateCost: gameState.exchangeRateCost,
      shopItems: gameState.shopItems // Saves the whole shopItems object
    };
    
    // Create a JSON file and trigger download
    const jsonString = JSON.stringify(gameProgress, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'game_progress.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Optional: Visual feedback
    const saveProgressButton = document.getElementById('saveProgressButton');
    saveProgressButton.textContent = 'Saved!';
    setTimeout(() => {
      saveProgressButton.textContent = 'Save Progress';
    }, 1500);
  },

  loadGameProgress(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const gameProgress = JSON.parse(e.target.result);
        
        // Update core game stats
        gameState.money = gameProgress.money || 0;
        gameState.robux = gameProgress.robux || 0;
        gameState.workMultiplier = gameProgress.workMultiplier || 1;
        gameState.workUpgradeCost = gameProgress.workUpgradeCost || 5500;
        gameState.clickMultiplier = gameProgress.clickMultiplier || 1;
        gameState.clickMultiplierCost = gameProgress.clickMultiplierCost || 8000;
        gameState.passiveIncome = gameProgress.passiveIncome || 0;
        gameState.passiveIncomeCost = gameProgress.passiveIncomeCost || 12000;
        gameState.exchangeRateBonus = gameProgress.exchangeRateBonus || 1;
        gameState.exchangeRateCost = gameProgress.exchangeRateCost || 20000;
        
        // Safely merge loaded shop items with defaults
        const loadedShopItems = gameProgress.shopItems || {};
        Object.keys(defaultShopItems).forEach(key => {
            if (!gameState.shopItems[key]) { // Ensure key exists in current gameState
                gameState.shopItems[key] = {};
            }
            gameState.shopItems[key] = {
                ...defaultShopItems[key], // Start with defaults (guarantees basePrice)
                ...(loadedShopItems[key] || {}), // Overwrite with loaded values if they exist
                // Explicitly enforce default basePrice to prevent issues with old saves
                basePrice: defaultShopItems[key].basePrice 
            };
        });

        // Update UI based on loaded state
        updateMoneyDisplay();
        updateRobuxDisplay();
        updateWorkButtonText();
        updateShopItemsDisplay();
        
        // If not currently in a game, transition to the game view
        // This assumes loading progress implies wanting to continue playing
        if (gameState.gameMode === '') {
          gameState.gameMode = 'singlePlayer'; // Default to single player view after load
          const startMenu = document.getElementById('startMenu');
          const gameContainer = document.getElementById('gameContainer');
          const backgroundMusic = document.getElementById('backgroundMusic');
          const shopSidebar = document.getElementById('shopSidebar');
          const progressSidebar = document.getElementById('progressSidebar');

          if (startMenu) startMenu.style.display = 'none';
          if (gameContainer) gameContainer.style.display = 'flex';
          if (shopSidebar) shopSidebar.classList.add('active');
          if (progressSidebar) progressSidebar.classList.add('active');
          if (backgroundMusic && backgroundMusic.paused) {
             backgroundMusic.play().catch(err => console.error("Error playing music after load:", err));
          }
        }
        
        // Reset the file input value to allow loading the same file again
        if (event.target) {
            event.target.value = null;
        }

        // Optional: Visual feedback
        const loadProgressButton = document.getElementById('loadProgressButton');
        if(loadProgressButton) {
            loadProgressButton.textContent = 'Loaded!';
            setTimeout(() => {
              loadProgressButton.textContent = 'Load Progress';
            }, 1500);
        }

      } catch (error) {
        console.error('Error parsing game progress:', error);
        alert('Invalid game progress file');
         // Reset the file input value even on error
        if (event.target) {
            event.target.value = null;
        }
      }
    };
    reader.readAsText(file);
  },

  conditionalSave() {
    // Only save if in a game mode
    if (gameState.gameMode !== '') {
        const currentTime = Date.now();
        if (currentTime - this.lastSaveTime > this.SAVE_INTERVAL) {
          this.saveGameProgress();
          this.lastSaveTime = currentTime;
        }
    }
  }
};