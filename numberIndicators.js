import { gameState } from './gameState.js';
import { aiCursor } from './aiCursor.js';

// Number Indicators System
export const numberIndicators = {
  container: null, // Container for indicators

  init() {
    // Create a container for indicators to improve performance
    this.container = document.createElement('div');
    this.container.id = 'number-indicator-container';
    this.container.style.position = 'fixed';
    this.container.style.top = '0';
    this.container.style.left = '0';
    this.container.style.width = '100%';
    this.container.style.height = '100%';
    this.container.style.pointerEvents = 'none';
    this.container.style.zIndex = '2000'; // Ensure it's above most elements but below cursor
    document.body.appendChild(this.container);
  },

  create(value, x, y, type = 'money') {
    if (!this.container) this.init(); // Ensure container exists

    // Create indicator element
    const indicator = document.createElement('div');
    indicator.className = 'number-indicator';

    // Set position relative to the container
    indicator.style.position = 'absolute'; // Position absolutely within the container
    indicator.style.left = `${x}px`;
    indicator.style.top = `${y}px`;

    // Format and style based on type and value
    if (type === 'money') {
      if (value > 0) {
        indicator.textContent = `+$${value}`;
        indicator.classList.add('positive');
      } else {
        indicator.textContent = `-$${Math.abs(value)}`;
        indicator.classList.add('negative');
      }
    } else if (type === 'robux') {
      if (value > 0) {
        indicator.textContent = `+${value} R$`;
        indicator.classList.add('robux');
      } else {
        indicator.textContent = `-${Math.abs(value)} R$`;
        indicator.classList.add('negative');
      }
    }

    // Add to the container instead of body
    this.container.appendChild(indicator);

    // Remove after animation completes
    setTimeout(() => {
      if (indicator.parentNode === this.container) {
        this.container.removeChild(indicator);
      }
    }, 1500);

    return indicator;
  },

  // Create at cursor position or button position
  createAtEvent(e, value, type = 'money') {
    let x, y;

    // Check if AI CPU mode is active
    if (gameState.gameMode === 'singleCPU' && aiCursor.cpuIntervalId) {
        // Use AI cursor's last known position
        x = aiCursor.lastPosition.x + 32; // Offset to center roughly
        y = aiCursor.lastPosition.y;
    } else if (window.playerCursor && document.getElementById('playerCursor')) {
      // Get position from custom player cursor if available
      const cursor = document.getElementById('playerCursor');
      const rect = cursor.getBoundingClientRect();
      x = rect.left;
      y = rect.top;
    } else {
      // Fallback to event position or target center
      x = e.clientX || e.target.getBoundingClientRect().left + e.target.getBoundingClientRect().width / 2;
      y = e.clientY || e.target.getBoundingClientRect().top;
    }

    // Add some randomness to position for visual variety
    x += (Math.random() - 0.5) * 20;
    y += (Math.random() - 0.5) * 20;

    // Ensure position is within viewport bounds
    x = Math.max(10, Math.min(window.innerWidth - 50, x)); // Add padding
    y = Math.max(10, Math.min(window.innerHeight - 30, y)); // Add padding

    return this.create(value, x, y, type);
  }
};