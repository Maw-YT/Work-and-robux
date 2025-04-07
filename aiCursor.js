import { gameState } from './gameState.js';

export const aiCursor = {
  cursor: null,
  cpuIntervalId: null,
  cpuSpeed: 300, // Default interval speed
  isMoving: false,
  lastPosition: { x: 0, y: 0 },
  currentState: 'idle', // New property to track AI state
  targetPreference: 'balanced', // New property to set target preference
  isRogueMode: false, // New property for rogue mode
  aiCursors: [], // Array to store multiple AI cursors
  aiCursorDraggable: null,

  init() {
    // Create SVG cursor instead of image
    this.cursor = document.createElement('div');
    this.cursor.id = 'aiCursor';
    this.cursor.innerHTML = `
      <svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feFlood flood-color="#ff4444" flood-opacity="0.8" result="color"/>
          <feComposite in="color" in2="blur" operator="in" result="glow"/>
          <feMerge>
            <feMergeNode in="glow"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <path d="M20,10 L44,30 L32,30 L38,50 L26,50 L20,30 L10,30 Z" fill="#ffffff" stroke="#000000" stroke-width="2" filter="url(#glow)" class="cursor-path"/>
        <text x="32" y="28" text-anchor="middle" font-family="Arial" font-size="10" font-weight="bold" fill="#000000">AI</text>
      </svg>
    `;
    this.cursor.style.position = 'fixed';
    this.cursor.style.zIndex = '1000';
    this.cursor.style.width = '64px';
    this.cursor.style.height = '64px';
    this.cursor.style.pointerEvents = 'none';
    this.cursor.style.display = 'none';
    this.cursor.style.transition = 'transform 0.2s cubic-bezier(0.18, 0.89, 0.32, 1.28)';
    document.body.appendChild(this.cursor);

    // Add event listener to update speed display
    const cpuSpeedSlider = document.getElementById('cpuSpeedSlider');
    const cpuSpeedDisplay = document.getElementById('cpuSpeedDisplay');
    
    cpuSpeedSlider.addEventListener('input', () => {
      const speed = cpuSpeedSlider.value;
      // Invert the percentage calculation
      const speedPercentage = Math.round(((speed - 100) / 800) * 100);
      cpuSpeedDisplay.textContent = `${speedPercentage}%`;
    });
  },

  moveAiCursor(targetButton) {
    if (!targetButton || this.isMoving) return;
    
    this.isMoving = true;
    this.cursor.style.display = 'block';
    
    const targetRect = targetButton.getBoundingClientRect();
    
    const endX = targetRect.left + targetRect.width / 2 - 32; // Center cursor
    const endY = targetRect.top + targetRect.height / 2 - 32; // Center cursor
    
    // If this is the first move, set lastPosition to current target to avoid jumping
    if (this.lastPosition.x === 0 && this.lastPosition.y === 0) {
      this.lastPosition = { x: endX, y: endY };
      this.cursor.style.left = `${endX}px`;
      this.cursor.style.top = `${endY}px`;
    }
    
    // Calculate path for smooth movement
    const startX = parseFloat(this.cursor.style.left) || this.lastPosition.x;
    const startY = parseFloat(this.cursor.style.top) || this.lastPosition.y;
    
    // Save this position as last position
    this.lastPosition = { x: endX, y: endY };
    
    // Animate cursor along path with realistic movement
    this.animateCursorMovement(startX, startY, endX, endY, () => {
      // After reaching target, perform click animation
      this.performClickAnimation(targetButton);
      
      // Add speech bubble when performing actions based on state
      this.speakBasedOnAction(targetButton);
    });
  },
  
  animateCursorMovement(startX, startY, endX, endY, callback) {
    const duration = 400; // Movement duration in ms
    const startTime = performance.now();
    
    // Remove transition temporarily for animation
    this.cursor.style.transition = 'none';
    
    // Add slight hover effect during movement
    this.cursor.classList.add('active');
    
    const animate = (currentTime) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      
      // Easing function for smoother deceleration at the end
      const easedProgress = this.easeOutQuad(progress);
      
      const currentX = startX + (endX - startX) * easedProgress;
      const currentY = startY + (endY - startY) * easedProgress;
      
      // Add slight curve to movement by applying sine wave
      const curveAmplitude = 5; // Max curve height in pixels
      const curve = Math.sin(progress * Math.PI) * curveAmplitude;
      
      // Apply position with curve
      this.cursor.style.left = `${currentX}px`;
      this.cursor.style.top = `${currentY + curve}px`;
      
      // Add slight rotation during movement
      const rotationAngle = Math.sin(progress * Math.PI * 2) * 5;
      this.cursor.style.transform = `rotate(${rotationAngle}deg)`;
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Movement complete
        if (callback) callback();
      }
    };
    
    requestAnimationFrame(animate);
  },
  
  performClickAnimation(targetButton, cursorData = null) {
    // Set state to match the action being performed
    if (targetButton.id === 'workButton') {
      this.currentState = 'working';
    } else if (targetButton.classList.contains('buy-item')) {
      this.currentState = 'buying';
    } else if (targetButton.classList.contains('sell-item')) {
      this.currentState = 'selling';
    }
    
    // Get the cursor element based on whether it's the main cursor or an additional one
    const cursor = cursorData ? cursorData.element : this.cursor;
    
    // Restore transition for click animation
    cursor.style.transition = 'transform 0.2s cubic-bezier(0.18, 0.89, 0.32, 1.28)';
    
    // Add small rotation on click for more dynamic feel
    const randomRotation = Math.random() * 20 - 10; // Random rotation between -10 and 10 degrees
    cursor.style.transform = `rotate(${randomRotation}deg) scale(1.2)`;
    
    const clickSound2 = new Audio('click-2.mp3');
    const clickSound3 = new Audio('click-3.mp3');
    const clickSounds = [clickSound2, clickSound3];
    const randomSound = clickSounds[Math.floor(Math.random() * clickSounds.length)];
    randomSound.currentTime = 0; 
    randomSound.play();
    
    targetButton.classList.add('ai-click-animation');
    targetButton.click();
    
    // Make additional cursors speak occasionally
    if (cursorData && Math.random() < 0.2) {
      import('./aiCursorSpeech.js').then(module => {
        const aiCursorSpeech = module.aiCursorSpeech;
        aiCursorSpeech.speak(cursor, 'rogue');
      });
    }
    
    setTimeout(() => {
      cursor.classList.remove('active');
      cursor.style.transform = 'rotate(0deg) scale(1)';
      targetButton.classList.remove('ai-click-animation');
      
      // Reset isMoving flag only if this is the main cursor
      if (!cursorData) {
        this.isMoving = false;
      } else {
        cursorData.isMoving = false;
      }
    }, 400);
  },
  
  speakBasedOnAction(targetButton) {
    import('./aiCursorSpeech.js').then(module => {
      const aiCursorSpeech = module.aiCursorSpeech;
      
      // Only add speech bubbles occasionally to avoid too much text
      if (Math.random() < 0.3) {
        let state = this.currentState;
        
        // Set state based on button being clicked
        if (targetButton.id === 'workButton') {
          state = 'working';
        } else if (targetButton.classList.contains('buy-item')) {
          state = 'buying';
        } else if (targetButton.classList.contains('sell-item')) {
          state = 'selling';
        } else if (this.isRogueMode) {
          state = 'rogue';
        }
        
        // Make cursor speak
        aiCursorSpeech.speak(this.cursor, state);
      }
    });
  },
  
  easeOutQuad(t) {
    return t * (2 - t);
  },
  
  easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  },
  
  getRandomTarget() {
    if (Math.random() < 0.15) {
      return this.wanderRandomly();
    }
    
    // Select from all interactive elements on the page
    const allButtons = [
      ...document.querySelectorAll('button'),
      ...document.querySelectorAll('input[type="range"]'),
      ...document.querySelectorAll('.shop-item')
    ];
    
    // Filter out invisible elements
    const visibleElements = allButtons.filter(element => {
      const style = window.getComputedStyle(element);
      return style.display !== 'none' && style.visibility !== 'hidden' && element.offsetParent !== null;
    });
    
    if (visibleElements.length === 0) return null;
    
    // Filter out save and load buttons
    const filteredElements = visibleElements.filter(element => {
      return !(element.id === 'saveProgressButton' || element.id === 'loadProgressButton');
    });
    
    // Otherwise, pick a random element
    return filteredElements[Math.floor(Math.random() * filteredElements.length)];
  },
  
  startCPUMode(customSpeed = null) {
    // Set initial state
    this.currentState = 'idle';
    
    // If a custom speed is provided, use it; otherwise, reset to default
    if (customSpeed !== null) {
      this.cpuSpeed = 1000 - customSpeed;
    } else {
      // Reset to default speed
      this.cpuSpeed = 300;
      
      // Reset slider and display to default
      const cpuSpeedSlider = document.getElementById('cpuSpeedSlider');
      const cpuSpeedDisplay = document.getElementById('cpuSpeedDisplay');
      
      cpuSpeedSlider.value = 600;
      cpuSpeedDisplay.textContent = '60%';
    }

    this.cursor.style.display = 'block';
    
    // Clear any existing interval
    if (this.cpuIntervalId) {
      clearInterval(this.cpuIntervalId);
    }
    
    this.cpuIntervalId = setInterval(() => {
      const targetButton = this.isRogueMode ? this.selectRogueTarget() : this.selectTarget();
      if (targetButton) {
        this.moveAiCursor(targetButton);
      }
    }, this.cpuSpeed);  
  },

  stopCPUMode() {
    // Reset state when stopping
    this.currentState = 'idle';
    
    if (this.cpuIntervalId) {
      clearInterval(this.cpuIntervalId);
      this.cpuIntervalId = null;
      this.cursor.style.display = 'none';
      this.isMoving = false;
      this.lastPosition = { x: 0, y: 0 };
      
      // Reset to default speed
      this.cpuSpeed = 300;
      
      // Reset slider and display
      const cpuSpeedSlider = document.getElementById('cpuSpeedSlider');
      const cpuSpeedDisplay = document.getElementById('cpuSpeedDisplay');
      
      cpuSpeedSlider.value = 600;
      cpuSpeedDisplay.textContent = '60%';
    }
  },

  setCPUSpeed(speed) {
    // Convert slider value to interval speed (lower value = faster)
    this.cpuSpeed = 1000 - speed;
    
    // Update speed display 
    const cpuSpeedSlider = document.getElementById('cpuSpeedSlider');
    const cpuSpeedDisplay = document.getElementById('cpuSpeedDisplay');
    
    // Invert the percentage calculation
    const speedPercentage = Math.round(((speed - 100) / 800) * 100);
    cpuSpeedDisplay.textContent = `${speedPercentage}%`;
    
    // If CPU mode is currently running, restart with new speed
    if (this.cpuIntervalId) {
      this.stopCPUMode();
      this.startCPUMode(speed);
    }
  },
  
  getCPUSpeedPercentage() {
    // Invert the calculation from setCPUSpeed
    const sliderValue = 1000 - this.cpuSpeed;
    return Math.round(((sliderValue - 100) / 800) * 100);
  },
  
  setState(state) {
    this.currentState = state;
    
    // Change behavior based on state
    switch(state) {
      case 'aggressive':
        this.targetPreference = 'earning';
        if (this.cpuIntervalId) {
          this.setCPUSpeed(900); // Max speed
        }
        break;
      case 'passive':
        this.targetPreference = 'balanced';
        if (this.cpuIntervalId) {
          this.setCPUSpeed(300); // Slower speed
        }
        break;
      case 'buying':
        this.targetPreference = 'buying';
        break;
      case 'selling':
        this.targetPreference = 'selling';
        break;
      case 'working':
        this.targetPreference = 'working';
        break;
      case 'rogue':
        this.isRogueMode = true;
        break;
      case 'idle':
      default:
        this.targetPreference = 'balanced';
        this.isRogueMode = false;
        break;
    }
    
    // If in CPU mode, restart to apply new settings
    if (this.cpuIntervalId) {
      const currentSpeed = 1000 - this.cpuSpeed;
      this.stopCPUMode();
      this.startCPUMode(currentSpeed);
    }
  },
  
  selectTarget() {
    const buttons = [
      document.getElementById('workButton'),
      document.getElementById('workUpgradeButton'),
      document.getElementById('robuxButton'),
      document.getElementById('robux1100Button'),
      document.getElementById('robux2200Button'),
      document.getElementById('robux5800Button'),
      document.getElementById('robux12100Button'),
      document.getElementById('robux26400Button'),
      ...document.querySelectorAll('.buy-item'),
      ...document.querySelectorAll('.sell-item')
    ];
    
    // Filter available buttons based on current balance/state
    const availableButtons = buttons.filter(button => {
      if (!button) return false;
      
      // Work button is always available
      if (button.id === 'workButton') {
        return this.targetPreference !== 'selling' && this.targetPreference !== 'buying';
      }
      
      // Work upgrade button if can afford
      if (button.id === 'workUpgradeButton') {
        return gameState.robux >= gameState.workUpgradeCost && this.targetPreference !== 'selling';
      }
      
      // Robux exchange buttons based on money
      if (button.id === 'robuxButton') {
        return gameState.money >= 5 && this.targetPreference !== 'selling';
      }
      if (button.id === 'robux1100Button') {
        return gameState.money >= 10 && this.targetPreference !== 'selling';
      }
      if (button.id === 'robux2200Button') {
        return gameState.money >= 20 && this.targetPreference !== 'selling';
      }
      if (button.id === 'robux5800Button') {
        return gameState.money >= 50 && this.targetPreference !== 'selling';
      }
      if (button.id === 'robux12100Button') {
        return gameState.money >= 100 && this.targetPreference !== 'selling';
      }
      if (button.id === 'robux26400Button') {
        return gameState.money >= 200 && this.targetPreference !== 'selling';
      }
      
      // Buy buttons
      if (button.classList.contains('buy-item') && this.targetPreference !== 'selling' && this.targetPreference !== 'working') {
        const shopItem = button.closest('.shop-item');
        const itemName = shopItem.dataset.item;
        const itemDetails = gameState.shopItems[itemName];
        return gameState.robux >= itemDetails.price && !itemDetails.owned;
      }
      
      // Sell buttons
      if (button.classList.contains('sell-item') && this.targetPreference !== 'buying' && this.targetPreference !== 'working') {
        const shopItem = button.closest('.shop-item');
        const itemName = shopItem.dataset.item;
        const itemDetails = gameState.shopItems[itemName];
        return itemDetails.owned && Math.floor(itemDetails.sellPrice) > gameState.workUpgradeCost;
      }
      
      return false;
    });
    
    // If no buttons match preferences, return null
    if (availableButtons.length === 0) {
      return null;
    }
    
    // Special case for specific preferences
    if (this.targetPreference === 'working') {
      const workButton = document.getElementById('workButton');
      if (workButton) return workButton;
    }
    
    // Prioritize selling for 'selling' preference
    if (this.targetPreference === 'selling') {
      const sellButtons = availableButtons.filter(btn => btn.classList.contains('sell-item'));
      if (sellButtons.length > 0) {
        // Sort by highest sell value
        return sellButtons.sort((a, b) => {
          const aItem = a.closest('.shop-item').dataset.item;
          const bItem = b.closest('.shop-item').dataset.item;
          return gameState.shopItems[bItem].sellPrice - gameState.shopItems[aItem].sellPrice;
        })[0];
      }
    }
    
    // Prioritize buying for 'buying' preference
    if (this.targetPreference === 'buying') {
      const buyButtons = availableButtons.filter(btn => btn.classList.contains('buy-item'));
      if (buyButtons.length > 0) {
        // Sort by lowest price first
        return buyButtons.sort((a, b) => {
          const aItem = a.closest('.shop-item').dataset.item;
          const bItem = b.closest('.shop-item').dataset.item;
          return gameState.shopItems[aItem].price - gameState.shopItems[bItem].price;
        })[0];
      }
    }
    
    // For 'earning' preference, prioritize work upgrades and higher robux exchanges
    if (this.targetPreference === 'earning') {
      const workUpgradeButton = document.getElementById('workUpgradeButton');
      if (workUpgradeButton && availableButtons.includes(workUpgradeButton)) {
        return workUpgradeButton;
      }
      
      // Try to get the highest robux exchange button available
      const robuxButtons = [
        'robux26400Button', 'robux12100Button', 'robux5800Button', 
        'robux2200Button', 'robux1100Button', 'robuxButton'
      ];
      
      for (const buttonId of robuxButtons) {
        const button = document.getElementById(buttonId);
        if (button && availableButtons.includes(button)) {
          return button;
        }
      }
    }
    
    // Default: return a random button from available ones
    return availableButtons[Math.floor(Math.random() * availableButtons.length)];
  },
  
  selectRogueTarget() {
    // 10% chance to attack player with UI elements in battle mode
    if (window.aiCursorBattle && window.aiCursorBattle.battleActive && Math.random() < 0.1) {
      return this.weaponizeUIElement();
    }
    
    // 15% chance to wander randomly looking for a way out
    if (Math.random() < 0.15) {
      return this.wanderRandomly();
    }
    
    // In rogue mode, select from ALL interactive elements on the page
    const allButtons = [
      ...document.querySelectorAll('button'),
      ...document.querySelectorAll('input[type="range"]'),
      ...document.querySelectorAll('.shop-item')
    ];
    
    // Filter out invisible elements
    const visibleElements = allButtons.filter(element => {
      const style = window.getComputedStyle(element);
      return style.display !== 'none' && style.visibility !== 'hidden' && element.offsetParent !== null;
    });
    
    if (visibleElements.length === 0) return null;
    
    // 10% chance to click backToMenuButton if in game container
    const backToMenuButton = document.getElementById('backToMenuButton');
    if (gameState.gameMode && backToMenuButton && Math.random() < 0.1) {
      return backToMenuButton;
    }
    
    // Special case: If CPU mode button is found and clicked, spawn a new AI cursor
    const singleCPUBtn = document.getElementById('singleCPUBtn');
    if (singleCPUBtn && visibleElements.includes(singleCPUBtn) && Math.random() < 0.2) {
      this.spawnNewAICursor();
      return singleCPUBtn;
    }
    
    // 20% chance to interact with sliders if available
    const sliders = visibleElements.filter(el => el.type === 'range');
    if (sliders.length > 0 && Math.random() < 0.2) {
      const slider = sliders[Math.floor(Math.random() * sliders.length)];
      
      // Simulate setting a random value on the slider
      const min = Number(slider.min) || 0;
      const max = Number(slider.max) || 100;
      const randomValue = Math.floor(Math.random() * (max - min + 1)) + min;
      slider.value = randomValue;
      
      // Dispatch input event to trigger any listeners
      slider.dispatchEvent(new Event('input', { bubbles: true }));
      
      return slider;
    }
    
    // Filter out save and load buttons that we don't want the AI to interact with
    const filteredElements = visibleElements.filter(element => {
      // Prevent clicking save/load buttons
      if (element.id === 'saveProgressButton' || element.id === 'loadProgressButton') {
        return false;
      }
      return true;
    });
    
    // Otherwise, pick a random element
    return filteredElements[Math.floor(Math.random() * filteredElements.length)];
  },
  
  weaponizeUIElement() {
    // Get battle system if it's available
    if (!window.aiCursorBattle) return null;
    
    // Get a random UI element to use as a weapon
    const uiWeapon = window.aiCursorBattle.getRandomUIWeapon();
    if (!uiWeapon) return null;
    
    // Mark it as a weapon
    uiWeapon.classList.add('ui-weapon');
    
    // Create a virtual target at the player's cursor position
    const playerPos = this.aiCursorDraggable ? this.aiCursorDraggable.playerCursorPos : { x: 0, y: 0 };
    
    // Animate the UI element toward the player's cursor
    setTimeout(() => {
      uiWeapon.classList.add('attacking');
      
      // Random rotation
      const rotation = Math.random() * 720 - 360;
      
      // Random scale for dramatic effect
      const scale = 0.5 + Math.random() * 1.5;
      
      // Launch toward player position with some randomness
      const targetX = playerPos.x + (Math.random() * 200 - 100);
      const targetY = playerPos.y + (Math.random() * 200 - 100);
      
      uiWeapon.style.transform = `translate(${targetX}px, ${targetY}px) rotate(${rotation}deg) scale(${scale})`;
      uiWeapon.style.zIndex = '9000';
      
      // Reset after attack
      setTimeout(() => {
        uiWeapon.classList.remove('ui-weapon', 'attacking');
      }, 2000);
    }, 500);
    
    // Return a virtual target for the cursor to click on before throwing
    const virtualTarget = document.createElement('div');
    virtualTarget.getBoundingClientRect = () => uiWeapon.getBoundingClientRect();
    return virtualTarget;
  },
  
  wanderRandomly() {
    // Create a virtual target at a random position on the screen
    const virtualTarget = document.createElement('div');
    
    // Set random position at the edges of the screen with higher probability
    const edgePosition = Math.random() < 0.7;
    let x, y;
    
    if (edgePosition) {
      // Position near the edge
      const edge = Math.floor(Math.random() * 4); // 0:top, 1:right, 2:bottom, 3:left
      switch (edge) {
        case 0: // top
          x = Math.random() * window.innerWidth;
          y = Math.random() * 100;
          break;
        case 1: // right
          x = window.innerWidth - Math.random() * 100;
          y = Math.random() * window.innerHeight;
          break;
        case 2: // bottom
          x = Math.random() * window.innerWidth;
          y = window.innerHeight - Math.random() * 100;
          break;
        case 3: // left
          x = Math.random() * 100;
          y = Math.random() * window.innerHeight;
          break;
      }
    } else {
      // Random position anywhere
      x = Math.random() * window.innerWidth;
      y = Math.random() * window.innerHeight;
    }
    
    // Set the position as a getBoundingClientRect mock
    virtualTarget.getBoundingClientRect = () => ({
      left: x,
      top: y,
      width: 10,
      height: 10
    });
    
    return virtualTarget;
  },
  
  spawnNewAICursor() {
    // Create a new cursor element
    const newCursor = document.createElement('div');
    newCursor.className = 'ai-cursor rogue';
    newCursor.innerHTML = this.cursor.innerHTML;
    newCursor.style.position = 'fixed';
    newCursor.style.zIndex = '1000';
    newCursor.style.width = '64px';
    newCursor.style.height = '64px';
    newCursor.style.pointerEvents = 'none';
    newCursor.style.left = Math.random() * window.innerWidth + 'px';
    newCursor.style.top = Math.random() * window.innerHeight + 'px';
    newCursor.style.transition = 'transform 0.2s cubic-bezier(0.18, 0.89, 0.32, 1.28)';
    document.body.appendChild(newCursor);
    
    // Store the cursor and create its behavior
    const cursorData = {
      element: newCursor,
      position: { x: parseInt(newCursor.style.left), y: parseInt(newCursor.style.top) },
      isMoving: false,
      intervalId: null
    };
    
    import('./aiCursorDraggable.js').then(module => {
      this.aiCursorDraggable = module.aiCursorDraggable;
    });
    
    // Give the cursor its own behavior cycle
    cursorData.intervalId = setInterval(() => {
      if (!cursorData.isMoving) {
        cursorData.isMoving = true;
        
        // Always in rogue mode
        const target = this.getRandomTarget();
        if (target) {
          const targetRect = target.getBoundingClientRect();
          
          // Animate the additional cursor
          this.animateAdditionalCursor(
            cursorData,
            targetRect.left + targetRect.width / 2 - 32,
            targetRect.top + targetRect.height / 2 - 32,
            () => {
              // After reaching target, perform click if it's a button
              if (target.tagName === 'BUTTON' || target.classList.contains('shop-item')) {
                this.performClickAnimation(target, cursorData);
              }
            }
          );
        }
      }
    }, 500 + Math.random() * 1000); // Random intervals
    
    this.aiCursors.push(cursorData);
    
    // Remove after 15-30 seconds to prevent too many cursors
    setTimeout(() => {
      if (cursorData.intervalId) {
        clearInterval(cursorData.intervalId);
      }
      if (cursorData.element && cursorData.element.parentNode) {
        cursorData.element.parentNode.removeChild(cursorData.element);
      }
      this.aiCursors = this.aiCursors.filter(c => c !== cursorData);
    }, 15000 + Math.random() * 15000);
  },
  
  animateAdditionalCursor(cursorData, targetX, targetY, callback = null) {
    const cursor = cursorData.element;
    const startX = parseFloat(cursor.style.left) || cursorData.position.x;
    const startY = parseFloat(cursor.style.top) || cursorData.position.y;

    cursorData.position = { x: targetX, y: targetY };

    // Simplified animation for additional cursors for performance
    const duration = 300 + Math.random() * 200; // Slightly faster, less variance
    const startTime = performance.now();

    // Remove transition temporarily for animation
    cursor.style.transition = 'none';
    cursor.classList.add('active');

    const animate = (currentTime) => {
      // Check if the element still exists
      if (!cursor || !cursor.parentNode) return;

      const elapsedTime = currentTime - startTime;
      let progress = Math.min(elapsedTime / duration, 1);

      // Simpler easing
      progress = progress * (2 - progress); // EaseOutQuad

      const currentX = startX + (targetX - startX) * progress;
      const currentY = startY + (targetY - startY) * progress;

      // Apply position directly
      cursor.style.left = `${currentX}px`;
      cursor.style.top = `${currentY}px`;

      // Simplified transform - remove dynamic scale/rotate during move
      cursor.style.transform = `scale(1)`;

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Movement complete
        if (!cursor || !cursor.parentNode) return; // Check again before final actions

        cursor.classList.remove('active');
        cursor.style.transform = 'scale(1)'; // Reset transform
        cursorData.isMoving = false;

        // Execute callback if provided (for button clicks)
        if (callback) callback();
      }
    };

    requestAnimationFrame(animate);
  }
};