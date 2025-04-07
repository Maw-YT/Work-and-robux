// Custom Player Cursor Implementation
export const playerCursor = {
  cursorElement: null,
  cursorRing: null,
  cursorDot: null,
  trailEnabled: true,
  trailInterval: 100, // ms between trail effects
  lastTrailTime: 0,
  hoveredElement: null,
  isClicking: false,
  
  init() {
    // Create cursor elements
    this.createCursorElements();
    
    // Add event listeners
    document.addEventListener('mousemove', this.moveCursor.bind(this));
    document.addEventListener('mousedown', this.startClick.bind(this));
    document.addEventListener('mouseup', this.endClick.bind(this));
    
    // Add hover detection
    this.setupHoverDetection();
    
    // Hide default cursor
    document.body.style.cursor = 'none';
  },
  
  createCursorElements() {
    // Create main cursor container
    this.cursorElement = document.createElement('div');
    this.cursorElement.id = 'playerCursor';
    
    // Create ring element
    this.cursorRing = document.createElement('div');
    this.cursorRing.className = 'cursor-ring';
    
    // Create dot element
    this.cursorDot = document.createElement('div');
    this.cursorDot.className = 'cursor-dot';
    
    // Assemble cursor
    this.cursorElement.appendChild(this.cursorRing);
    this.cursorElement.appendChild(this.cursorDot);
    
    // Add to DOM
    document.body.appendChild(this.cursorElement);
  },
  
  moveCursor(e) {
    // Move the cursor to mouse position with smooth lag
    const { clientX, clientY } = e;
    
    // Use requestAnimationFrame for smoother movement
    requestAnimationFrame(() => {
      this.cursorElement.style.left = `${clientX}px`;
      this.cursorElement.style.top = `${clientY}px`;
    });
    
    // Create trail effect
    if (this.trailEnabled) {
      const currentTime = Date.now();
      if (currentTime - this.lastTrailTime > this.trailInterval) {
        this.createTrailEffect(clientX, clientY);
        this.lastTrailTime = currentTime;
      }
    }
  },
  
  createTrailEffect(x, y) {
    const trail = document.createElement('div');
    trail.className = 'cursor-fx';
    trail.style.left = `${x}px`;
    trail.style.top = `${y}px`;
    
    document.body.appendChild(trail);
    
    // Remove trail element after animation completes
    setTimeout(() => {
      if (trail.parentNode) {
        trail.parentNode.removeChild(trail);
      }
    }, 1000);
  },
  
  startClick() {
    this.isClicking = true;
    this.cursorElement.classList.add('clicking');
  },
  
  endClick() {
    this.isClicking = false;
    this.cursorElement.classList.remove('clicking');
  },
  
  setupHoverDetection() {
    // Use event delegation for better performance
    document.addEventListener('mouseover', (e) => {
      // Check if hovering over interactive elements
      if (e.target.tagName === 'BUTTON' || 
          e.target.tagName === 'A' ||
          e.target.tagName === 'INPUT' ||
          e.target.classList.contains('shop-item') ||
          e.target.closest('.shop-item') ||
          e.target.closest('button')) {
        
        this.hoveredElement = e.target;
        this.cursorElement.classList.add('hovering');
      }
    });
    
    document.addEventListener('mouseout', (e) => {
      if (e.target === this.hoveredElement || 
          this.hoveredElement && this.hoveredElement.contains(e.target)) {
        this.hoveredElement = null;
        this.cursorElement.classList.remove('hovering');
      }
    });
  },
  
  enableTrail() {
    this.trailEnabled = true;
  },
  
  disableTrail() {
    this.trailEnabled = false;
  },
  
  setBattleMode(enabled) {
    if (enabled) {
      this.trailInterval = 50; // More intense trail effect during battle
    } else {
      this.trailInterval = 100; // Normal trail interval
    }
  }
};