import { gameState, updateMoneyDisplay, updateRobuxDisplay, updateWorkButtonText, updateShopItemsDisplay, appreciateOwnedItems, resetGameState } from './gameState.js';
import { saveLoadGame } from './saveLoadGame.js';
import { aiCursor } from './aiCursor.js';

export function setupEventListeners() {
  const workButton = document.getElementById('workButton');
  const robuxButton = document.getElementById('robuxButton');
  const robux1100Button = document.getElementById('robux1100Button');
  const robux2200Button = document.getElementById('robux2200Button');
  const robux5800Button = document.getElementById('robux5800Button');
  const robux12100Button = document.getElementById('robux12100Button');
  const robux26400Button = document.getElementById('robux26400Button');
  const workUpgradeButton = document.getElementById('workUpgradeButton');
  const singlePlayerBtn = document.getElementById('singlePlayerBtn');
  const singleCPUBtn = document.getElementById('singleCPUBtn');
  const backToMenuButton = document.getElementById('backToMenuButton');
  const themeSwitchButtons = document.querySelectorAll('#themeSwitchButton');
  const shopBuyButtons = document.querySelectorAll('.buy-item');
  const saveProgressButton = document.getElementById('saveProgressButton');
  const loadProgressButton = document.getElementById('loadProgressButton');
  const musicToggleButton = document.getElementById('musicToggleButton');
  const shopSellButtons = document.querySelectorAll('.sell-item');
  const customGameBtn = document.getElementById('customGameBtn');
  const creditsBtn = document.getElementById('creditsBtn');
  const closeCreditsBtn = document.querySelector('.close-credits');
  const closeCustomGameBtn = document.querySelector('.close-custom-game');
  const startCustomGameButton = document.getElementById('startCustomGameButton');

  workButton.addEventListener('click', () => {
    gameState.money += gameState.workMultiplier;
    updateMoneyDisplay();
  });

  robuxButton.addEventListener('click', () => {
    if (gameState.money >= 5) {
      gameState.money -= 5;
      gameState.robux += 550;
      updateMoneyDisplay();
      updateRobuxDisplay();
    }
  });

  robux1100Button.addEventListener('click', () => {
    if (gameState.money >= 10) {
      gameState.money -= 10;
      gameState.robux += 1100;
      updateMoneyDisplay();
      updateRobuxDisplay();
    }
  });

  robux2200Button.addEventListener('click', () => {
    if (gameState.money >= 20) {
      gameState.money -= 20;
      gameState.robux += 2200;
      updateMoneyDisplay();
      updateRobuxDisplay();
    }
  });

  robux5800Button.addEventListener('click', () => {
    if (gameState.money >= 50) {
      gameState.money -= 50;
      gameState.robux += 5800;
      updateMoneyDisplay();
      updateRobuxDisplay();
    }
  });

  robux12100Button.addEventListener('click', () => {
    if (gameState.money >= 100) {
      gameState.money -= 100;
      gameState.robux += 12100;
      updateMoneyDisplay();
      updateRobuxDisplay();
    }
  });

  robux26400Button.addEventListener('click', () => {
    if (gameState.money >= 200) {
      gameState.money -= 200;
      gameState.robux += 26400;
      updateMoneyDisplay();
      updateRobuxDisplay();
    }
  });

  workUpgradeButton.addEventListener('click', () => {
    if (gameState.robux >= gameState.workUpgradeCost) {
      gameState.robux -= gameState.workUpgradeCost;
      gameState.workMultiplier++;
      gameState.workUpgradeCost = Math.ceil(gameState.workUpgradeCost * 1.5);
      updateWorkButtonText();
      updateRobuxDisplay();
    }
  });

  singlePlayerBtn.addEventListener('click', () => startGame('singlePlayer'));
  singleCPUBtn.addEventListener('click', () => {
    startGame('singleCPU');
    aiCursor.startCPUMode(); 
  });

  backToMenuButton.addEventListener('click', returnToMenu);

  const themeStates = ['default', 'dark', 'evil'];
  let currentThemeIndex = getCurrentThemeIndex();

  applyTheme(currentThemeIndex);

  themeSwitchButtons.forEach(button => {
    button.addEventListener('click', () => {
      currentThemeIndex = (currentThemeIndex + 1) % themeStates.length;
      
      localStorage.setItem('selectedTheme', themeStates[currentThemeIndex]);
      
      applyTheme(currentThemeIndex);
    });
  });

  function getCurrentThemeIndex() {
    const savedTheme = localStorage.getItem('selectedTheme') || 'default';
    return themeStates.indexOf(savedTheme);
  }

  function applyTheme(themeIndex) {
    document.body.classList.remove('dark-mode', 'evil-mode');
    
    if (themeStates[themeIndex] === 'dark') {
      document.body.classList.add('dark-mode');
    } else if (themeStates[themeIndex] === 'evil') {
      document.body.classList.add('evil-mode');
    }
  }

  shopBuyButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const shopItem = e.target.closest('.shop-item');
      const itemName = shopItem.dataset.item;
      const itemDetails = gameState.shopItems[itemName];
      
      if (gameState.robux >= itemDetails.price && !itemDetails.owned) {
        gameState.robux -= itemDetails.price;
        itemDetails.owned = true;
　　 　 // Reset sell price when buying again
　　 　 itemDetails.sellPrice = itemDetails.basePrice;
　　 　 itemDetails.lastAppreciationTime = Date.now();
　　 　 // Update display
　　 　 updateRobuxDisplay();
　　 　 // Update shop item display
　　 　 shopItem.classList.add('owned');
　　 　 button.textContent = 'Owned';
　　 　 // Ensure sell button is shown when item is bought
　　 　 const sellButton = shopItem.querySelector('.sell-item');
　　 　 sellButton.style.display = 'block';
      }
    });
  });

  shopSellButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const shopItem = e.target.closest('.shop-item');
      const itemName = shopItem.dataset.item;
      const itemDetails = gameState.shopItems[itemName];
      
      if (itemDetails.owned) {
        gameState.robux += Math.floor(itemDetails.sellPrice);
　　 　 // Reset item ownership
　　 　 itemDetails.owned = false;
　　 　 itemDetails.sellPrice = 0;
　　 　 itemDetails.lastAppreciationTime = 0;
　　 　 // Update display
　　 　 updateRobuxDisplay();
　　 　 updateShopItemsDisplay();
　　 　 // Save game progress
　　 　 saveLoadGame.conditionalSave();
      }
    });
  });

  saveProgressButton.addEventListener('click', () => saveLoadGame.saveGameProgress());
  loadProgressButton.addEventListener('click', () => {
    const loadProgressFileInput = document.createElement('input');
    loadProgressFileInput.type = 'file';
    loadProgressFileInput.accept = '.json';
    loadProgressFileInput.style.display = 'none';
    loadProgressFileInput.addEventListener('change', saveLoadGame.loadGameProgress);
    document.body.appendChild(loadProgressFileInput);
    loadProgressFileInput.click();
    document.body.removeChild(loadProgressFileInput);
  });

  musicToggleButton.addEventListener('click', () => {
    const backgroundMusic = document.getElementById('backgroundMusic');
    if (backgroundMusic.paused) {
      backgroundMusic.play();
    } else {
      backgroundMusic.pause();
    }
  });

  creditsBtn.addEventListener('click', () => {
    const creditsDialog = document.getElementById('creditsDialog');
    creditsDialog.style.display = 'block';
  });

  customGameBtn.addEventListener('click', () => {
    const customGameDialog = document.getElementById('customGameDialog');
    customGameDialog.style.display = 'block';
  });

  const closeCreditPopup = () => {
    const creditsDialog = document.getElementById('creditsDialog');
    const modalContent = creditsDialog.querySelector('.modal-content');
  
    modalContent.classList.add('pop-out');
  
    setTimeout(() => {
      creditsDialog.style.display = 'none';
      modalContent.classList.remove('pop-out');
    }, 500);
  };

  const closeCustomGamePopup = () => {
    const customGameDialog = document.getElementById('customGameDialog');
    const modalContent = customGameDialog.querySelector('.modal-content');
  
    modalContent.classList.add('pop-out');
  
    setTimeout(() => {
      customGameDialog.style.display = 'none';
      modalContent.classList.remove('pop-out');
    }, 500);
  };

  closeCreditsBtn.addEventListener('click', closeCreditPopup);
  closeCustomGameBtn.addEventListener('click', closeCustomGamePopup);

  startCustomGameButton.addEventListener('click', () => {
    resetGameState();

    const startingMoney = parseInt(document.getElementById('startingMoney').value) || 0;
    const startingRobux = parseInt(document.getElementById('startingRobux').value) || 0;
    const workMultiplier = parseInt(document.getElementById('workMultiplier').value) || 1;
    const workUpgradeCost = parseInt(document.getElementById('workUpgradeCost').value) || 5500;
    const startInCPUMode = document.getElementById('startInCPUMode').checked;

    gameState.money = startingMoney;
    gameState.robux = startingRobux;
    gameState.workMultiplier = workMultiplier;
    gameState.workUpgradeCost = workUpgradeCost;

    updateMoneyDisplay();
    updateRobuxDisplay();
    updateWorkButtonText();

    startGame(startInCPUMode ? 'singleCPU' : 'customGame');

    if (startInCPUMode) {
      const cpuSpeedSlider = document.getElementById('cpuSpeedSlider');
      const cpuSpeed = cpuSpeedSlider.value;
      aiCursor.startCPUMode(parseInt(cpuSpeed)); 
      aiCursor.setCPUSpeed(parseInt(cpuSpeed));
    }

    const customGameDialog = document.getElementById('customGameDialog');
    customGameDialog.style.display = 'none';
  });

  setInterval(appreciateOwnedItems, 3600000); 

  function startGame(mode) {
    gameState.gameMode = mode;
    
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

  function returnToMenu() {
    const gameContainer = document.getElementById('gameContainer');
    const startMenu = document.getElementById('startMenu');
    const backgroundMusic = document.getElementById('backgroundMusic');
    const shopSidebar = document.getElementById('shopSidebar');
    const progressSidebar = document.getElementById('progressSidebar');

    gameContainer.style.display = 'none';
    startMenu.style.display = 'flex';
    
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
    
    shopSidebar.classList.remove('active');
    progressSidebar.classList.remove('active');

    // Only stop CPU mode if not in rogue mode
    if (!aiCursor.isRogueMode) {
      aiCursor.stopCPUMode();
    }

    gameState.gameMode = '';
  }
}