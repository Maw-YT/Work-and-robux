export let gameState = {
  money: 0,
  robux: 0,
  workMultiplier: 1,
  workUpgradeCost: 5500,
  clickMultiplier: 1,
  clickMultiplierCost: 8000,
  passiveIncome: 0,
  passiveIncomeCost: 12000,
  exchangeRateBonus: 1,
  exchangeRateCost: 20000,
  gameMode: '',
  shopItems: {
    dominus: {
      price: 50000,
      basePrice: 50000, // Static price for buying
      owned: false,
      sellPrice: 50000, // Dynamic price for selling, starts at base
      appreciationRate: 1.005,
      lastAppreciationTime: 0,
      salesCount: 0
    },
    dragon: {
      price: 25000,
      basePrice: 25000,
      owned: false,
      sellPrice: 25000,
      appreciationRate: 1.005,
      lastAppreciationTime: 0,
      salesCount: 0
    },
    hat: {
      price: 10000,
      basePrice: 10000,
      owned: false,
      sellPrice: 10000,
      appreciationRate: 1.005,
      lastAppreciationTime: 0,
      salesCount: 0
    }
  },
  lowPerformanceMode: false
};

// Default structure for resetting and merging loaded data
export const defaultShopItems = {
  dominus: {
    price: 50000,
    basePrice: 50000,
    owned: false,
    sellPrice: 50000,
    appreciationRate: 1.005,
    lastAppreciationTime: 0,
    salesCount: 0
  },
  dragon: {
    price: 25000,
    basePrice: 25000,
    owned: false,
    sellPrice: 25000,
    appreciationRate: 1.005,
    lastAppreciationTime: 0,
    salesCount: 0
  },
  hat: {
    price: 10000,
    basePrice: 10000,
    owned: false,
    sellPrice: 10000,
    appreciationRate: 1.005,
    lastAppreciationTime: 0,
    salesCount: 0
  }
};

export function initGameState() {
  const savedProgress = localStorage.getItem('gameProgress');
  if (savedProgress) {
    const gameProgress = JSON.parse(savedProgress);
    
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
    
    // Safely merge shop items, preserving basePrice from defaults if missing
    const loadedShopItems = gameProgress.shopItems || {};
    Object.keys(defaultShopItems).forEach(key => {
        gameState.shopItems[key] = {
            ...defaultShopItems[key], // Start with defaults
            ...(loadedShopItems[key] || {}), // Overwrite with loaded data
            // Ensure basePrice is always the default, even if save file is old/corrupted
            basePrice: defaultShopItems[key].basePrice 
        };
    });
    
    updateMoneyDisplay();
    updateRobuxDisplay();
    updateWorkButtonText();
    updateShopItemsDisplay();
  }
}

export function updateMoneyDisplay() {
  const moneyDisplay = document.getElementById('moneyAmount');
  moneyDisplay.textContent = gameState.money;
}

export function updateRobuxDisplay() {
  const robuxDisplay = document.getElementById('robuxAmount');
  robuxDisplay.textContent = gameState.robux;
}

export function updateWorkButtonText() {
  const workButton = document.getElementById('workButton');
  const workUpgradeButton = document.getElementById('workUpgradeButton');
  const passiveIncomeButton = document.getElementById('passiveIncomeButton');
  const exchangeRateButton = document.getElementById('exchangeRateButton');
  
  workButton.textContent = `Work (Earn $${gameState.workMultiplier})`;
  workUpgradeButton.textContent = `Upgrade Work (${gameState.workUpgradeCost} Robux)`;
  
  if (passiveIncomeButton) {
    passiveIncomeButton.textContent = `Passive Income +$${gameState.passiveIncome + 1}/5s (${gameState.passiveIncomeCost} Robux)`;
  }
  
  if (exchangeRateButton) {
    const bonusPercentage = ((gameState.exchangeRateBonus - 1) * 100).toFixed(0);
    exchangeRateButton.textContent = `Exchange Rate +${bonusPercentage}% (${gameState.exchangeRateCost} Robux)`;
  }
}

export function updateShopItemsDisplay() {
  Object.keys(gameState.shopItems).forEach(item => {
    const shopItemElement = document.querySelector(`.shop-item[data-item="${item}"]`);
    if (shopItemElement) {
      const buyButton = shopItemElement.querySelector('.buy-item');
      const sellButton = shopItemElement.querySelector('.sell-item');
      const priceElement = shopItemElement.querySelector('p');
      const itemDetails = gameState.shopItems[item];

      // Ensure basePrice exists, fallback to default if somehow missing
      const basePrice = itemDetails.basePrice !== undefined ? itemDetails.basePrice : defaultShopItems[item]?.basePrice || 0;

      if (itemDetails.owned) {
        shopItemElement.classList.add('owned');
        buyButton.textContent = 'Owned';
        sellButton.style.display = 'block';

        // Display the current dynamic sell price when owned
        const currentSellPrice = Math.floor(itemDetails.sellPrice || basePrice);
        priceElement.textContent = `Sell Price: ${currentSellPrice} Robux`;
      } else {
        itemDetails.salesCount = 0; // Reset sales count if not owned

        shopItemElement.classList.remove('owned');
        buyButton.textContent = 'Buy';
        sellButton.style.display = 'none';
        // Display the static base price when not owned
        priceElement.textContent = `Price: ${basePrice} Robux`; 
      }
    }
  });
}

export function appreciateOwnedItems() {
  const currentTime = Date.now();
  let itemsUpdated = false;

  Object.keys(gameState.shopItems).forEach(item => {
    const itemDetails = gameState.shopItems[item];
    if (itemDetails.owned) {
        // Ensure basePrice exists for fallback
        const basePrice = itemDetails.basePrice !== undefined ? itemDetails.basePrice : defaultShopItems[item]?.basePrice || 0;
        const timeSinceLastAppreciation = currentTime - (itemDetails.lastAppreciationTime || 0);

      if (timeSinceLastAppreciation >= 1000) { 
        const currentSellPrice = itemDetails.sellPrice || basePrice;
        
        const salesMultiplier = 1 + (itemDetails.salesCount * 0.001);
        
        const newSellPrice = Math.floor(
          currentSellPrice * (itemDetails.appreciationRate * salesMultiplier)
        );
        
        itemDetails.sellPrice = newSellPrice;
        itemDetails.lastAppreciationTime = currentTime;
        
        itemsUpdated = true;
      }
    }
  });
  
  if (itemsUpdated) {
    updateShopItemsDisplay();
  }
}

export function resetGameState() {
  gameState.money = 0;
  gameState.robux = 0;
  gameState.workMultiplier = 1;
  gameState.workUpgradeCost = 5500;
  gameState.clickMultiplier = 1;
  gameState.clickMultiplierCost = 8000;
  gameState.passiveIncome = 0;
  gameState.passiveIncomeCost = 12000;
  gameState.exchangeRateBonus = 1;
  gameState.exchangeRateCost = 20000;
  gameState.lowPerformanceMode = false;

  // Reset shop items using the default structure (deep copy)
  gameState.shopItems = JSON.parse(JSON.stringify(defaultShopItems));

  updateMoneyDisplay();
  updateRobuxDisplay();
  updateWorkButtonText();
  updateShopItemsDisplay();
}

function addPassiveIncome() {
  if (gameState.passiveIncome > 0 && gameState.gameMode !== '') {
    gameState.money += gameState.passiveIncome;
    updateMoneyDisplay();
    
    // Show indicator for passive income at a random position near the top of the screen
    if (typeof window.numberIndicators !== 'undefined') {
      const randomX = Math.random() * window.innerWidth * 0.8 + window.innerWidth * 0.1;
      const randomY = Math.random() * window.innerHeight * 0.2 + 50;
      window.numberIndicators.create(gameState.passiveIncome, randomX, randomY, 'money');
    }
  }
}

setInterval(appreciateOwnedItems, 60000);
setInterval(addPassiveIncome, 5000);