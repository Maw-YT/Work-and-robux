import { gameState } from './gameState.js'; // Import gameState

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
  isVisible: true, // Track visibility state
  systemCursorForcedHidden: true, // Control aggressive hiding
  mutationObserver: null, // Store observer instance

  init() {
    // Create cursor elements
    this.createCursorElements();

    // Add event listeners
    document.addEventListener('mousemove', this.moveCursor.bind(this));
    document.addEventListener('mousedown', this.startClick.bind(this));
    document.addEventListener('mouseup', this.endClick.bind(this));

    // Add hover detection and system cursor control
    this.setupHoverDetection();
    this.setupSystemCursorControl();

    // Hide default cursor initially based on state
    this.setSystemCursorVisibility(!this.isVisible);
  },

  createCursorElements() {
    // Create main cursor container
    this.cursorElement = document.createElement('div');
    this.cursorElement.id = 'playerCursor';
    this.cursorElement.style.display = this.isVisible ? 'block' : 'none'; // Set initial visibility

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
    if (!this.isVisible) return; // Don't move if hidden
    // Move the cursor to mouse position with smooth lag
    const { clientX, clientY } = e;

    // Use requestAnimationFrame for smoother movement
    requestAnimationFrame(() => {
        // Ensure cursorElement exists before trying to style it
        if (this.cursorElement) {
            this.cursorElement.style.left = `${clientX}px`;
            this.cursorElement.style.top = `${clientY}px`;
        }
    });

    // Create trail effect only if not in potato mode
    if (this.trailEnabled && !gameState.lowPerformanceMode) {
      const currentTime = Date.now();
      if (currentTime - this.lastTrailTime > this.trailInterval) {
        this.createTrailEffect(clientX, clientY);
        this.lastTrailTime = currentTime;
      }
    }
  },

  createTrailEffect(x, y) {
    if (!this.isVisible) return; // Don't create trail if hidden
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
    if (!this.isVisible) return; // Don't process click visuals if hidden
    this.isClicking = true;
    this.cursorElement.classList.add('clicking');
  },

  endClick() {
     if (!this.isVisible) return; // Don't process click visuals if hidden
    this.isClicking = false;
    this.cursorElement.classList.remove('clicking');
  },

  setupHoverDetection() {
    // Use event delegation for better performance
    document.addEventListener('mouseover', (e) => {
       if (!this.isVisible) return; // Don't process hover if hidden
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
       if (!this.isVisible) return; // Don't process hover if hidden
      if (e.target === this.hoveredElement ||
          this.hoveredElement && this.hoveredElement.contains(e.target)) {
        this.hoveredElement = null;
        this.cursorElement.classList.remove('hovering');
      }
    });
  },

  // Moved system cursor control logic here from main.js
  setupSystemCursorControl() {
    const interactiveSelector = 'button, a, input, .shop-item, label, select, textarea';

    // Initial hide for existing elements if needed
    this.applySystemCursorStyle();

    // Mouseover listener
    document.addEventListener('mouseover', (e) => {
      if (!this.systemCursorForcedHidden) return; // Only hide if forced hidden

      if (e.target.closest(interactiveSelector)) {
        e.target.style.cursor = 'none';
      } else {
        document.body.style.cursor = 'none';
      }
    }, true);

    // Mutation observer
    this.mutationObserver = new MutationObserver(mutations => {
      if (!this.systemCursorForcedHidden) return; // Only hide if forced hidden

      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) { // Element node
             if (node.matches(interactiveSelector)) {
                node.style.cursor = 'none';
             }
             node.querySelectorAll(interactiveSelector).forEach(el => el.style.cursor = 'none');
          }
        });
      });
    });

    this.mutationObserver.observe(document.body, { childList: true, subtree: true });
  },

  applySystemCursorStyle() {
    const interactiveSelector = 'button, a, input, .shop-item, label, select, textarea';
    const allInteractiveElements = document.querySelectorAll(interactiveSelector);

    if (this.systemCursorForcedHidden) {
      document.body.style.cursor = 'none';
      allInteractiveElements.forEach(element => {
        element.style.cursor = 'none';
      });
    } else {
      document.body.style.cursor = 'default';
      allInteractiveElements.forEach(element => {
        // Use 'pointer' for interactive elements when system cursor is shown
        element.style.cursor = 'pointer';
      });
    }
  },

  // New method to toggle visibility
  toggleVisibility() {
    this.isVisible = !this.isVisible;
    if (this.cursorElement) {
      this.cursorElement.style.display = this.isVisible ? 'block' : 'none';
    }
    // Toggle system cursor visibility accordingly
    this.setSystemCursorVisibility(!this.isVisible);
    return this.isVisible;
  },

  // Updated method to control system cursor visibility AND the aggressive hiding
  setSystemCursorVisibility(showSystemCursor) {
    this.systemCursorForcedHidden = !showSystemCursor;
    this.applySystemCursorStyle();
  },

  enableTrail() {
    this.trailEnabled = true;
  },

  disableTrail() {
    this.trailEnabled = false;
  },

  setBattleMode(enabled) {
     if (!this.isVisible) return; // Don't change trail if hidden
    if (enabled) {
      this.trailInterval = 50; // More intense trail effect during battle
    } else {
      this.trailInterval = 100; // Normal trail interval
    }
  }
};