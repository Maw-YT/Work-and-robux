import { gameState, updateMoneyDisplay, updateRobuxDisplay, updateWorkButtonText, updateShopItemsDisplay } from './gameState.js';

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
    loadProgressFileInput.addEventListener('change', this.loadGameProgress.bind(this));
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
      shopItems: gameState.shopItems
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
        
        gameState.money = gameProgress.money || 0;
        gameState.robux = gameProgress.robux || 0;
        gameState.workMultiplier = gameProgress.workMultiplier || 1;
        gameState.workUpgradeCost = gameProgress.workUpgradeCost || 5500;
        gameState.shopItems = gameProgress.shopItems || gameState.shopItems;
        
        updateMoneyDisplay();
        updateRobuxDisplay();
        updateWorkButtonText();
        updateShopItemsDisplay();
        
        // If not in a game, simulate starting a single-player game
        const gameMode = gameState.gameMode;
        if (gameMode === '') {
          gameState.gameMode = 'singlePlayer';
          const startMenu = document.getElementById('startMenu');
          const gameContainer = document.getElementById('gameContainer');
          const backgroundMusic = document.getElementById('backgroundMusic');
          const shopSidebar = document.getElementById('shopSidebar');
          const progressSidebar = document.getElementById('progressSidebar');

          startMenu.style.display = 'none';
          gameContainer.style.display = 'flex';
          shopSidebar.classList.add('active');
          progressSidebar.classList.add('active');
          backgroundMusic.play();
        }
      } catch (error) {
        console.error('Error parsing game progress:', error);
        alert('Invalid game progress file');
      }
    };
    reader.readAsText(file);
  },

  conditionalSave() {
    const currentTime = Date.now();
    if (currentTime - this.lastSaveTime > this.SAVE_INTERVAL) {
      this.saveGameProgress();
      this.lastSaveTime = currentTime;
    }
  }
};