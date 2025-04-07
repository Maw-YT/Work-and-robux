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
    gameState.shopItems = gameProgress.shopItems || gameState.shopItems;
    
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
    passiveIncomeButton.textContent = `Passive Income $${gameState.passiveIncome + 1}/5s (${gameState.passiveIncomeCost} Robux)`;
  }
  
  if (exchangeRateButton) {
    exchangeRateButton.textContent = `Exchange Rate +${(gameState.exchangeRateBonus * 10)}% (${gameState.exchangeRateCost} Robux)`;
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
      
      if (itemDetails.owned) {
        shopItemElement.classList.add('owned');
        buyButton.textContent = 'Owned';
        sellButton.style.display = 'block';
        
        priceElement.textContent = `Sell Price: ${Math.floor(itemDetails.sellPrice || itemDetails.basePrice)} Robux`;
      } else {
        itemDetails.salesCount = 0;
        
        shopItemElement.classList.remove('owned');
        buyButton.textContent = 'Buy';
        sellButton.style.display = 'none';
        priceElement.textContent = `Price: ${itemDetails.basePrice} Robux`;
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
      const timeSinceLastAppreciation = currentTime - itemDetails.lastAppreciationTime;
      
      if (timeSinceLastAppreciation >= 1000) { 
        const currentSellPrice = itemDetails.sellPrice || itemDetails.basePrice;
        
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
  
  gameState.shopItems = {
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