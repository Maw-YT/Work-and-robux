export const aiCursorDraggable = {
  draggedCursor: null,
  mouseOffset: { x: 0, y: 0 },
  trashBin: null,
  playerCursorPos: { x: 0, y: 0 },
  avoidanceRadius: 150,
  playerHealth: 100,

  init() {
    // Create trash bin for deleting AI cursors
    this.createTrashBin();

    // Track player's cursor position
    document.addEventListener('mousemove', this.trackPlayerCursor.bind(this));

    // Setup drag events on the document
    document.addEventListener('mousedown', this.handleMouseDown.bind(this));
    document.addEventListener('mousemove', this.handleMouseMove.bind(this));
    document.addEventListener('mouseup', this.handleMouseUp.bind(this));
  },

  createTrashBin() {
    this.trashBin = document.createElement('div');
    this.trashBin.id = 'aiCursorTrashBin';
    this.trashBin.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="100%" height="100%">
        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor"/>
      </svg>
    `;
    document.body.appendChild(this.trashBin);

    // Initially hide the trash bin until dragging starts
    this.trashBin.style.display = 'none';
  },

  trackPlayerCursor(e) {
    this.playerCursorPos = { x: e.clientX, y: e.clientY };

    // If battle is active, notify battle system of player position
    if (window.aiCursorBattle && window.aiCursorBattle.battleActive) {
      this.checkForDamageCollision();
    }
  },

  checkForDamageCollision() {
    // Import battle system and aiCursor module dynamically
    Promise.all([
      import('./aiCursorBattle.js'),
      import('./aiCursor.js')
    ]).then(([battleModule, cursorModule]) => {
      const battle = battleModule.aiCursorBattle;
      const aiCursor = cursorModule.aiCursor;

      if (!battle.battleActive || battle.isPlayerDead) return;

      // Check collision with AI cursors
      const checkCursor = (cursorElement, damage = 1) => {
        if (!cursorElement) return false;

        const rect = cursorElement.getBoundingClientRect();
        const cursorX = rect.left + rect.width / 2;
        const cursorY = rect.top + rect.height / 2;

        const dx = this.playerCursorPos.x - cursorX;
        const dy = this.playerCursorPos.y - cursorY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Collision detected with AI cursor
        if (distance < 40) {
          battle.damagePlayer(damage);
          return true;
        }
        return false;
      };

      // Check main cursor
      const mainCursor = document.getElementById('aiCursor');
      if (mainCursor) {
        checkCursor(mainCursor, 5);
      }

      // Check additional cursors
      for (const cursorData of aiCursor.aiCursors) {
        checkCursor(cursorData.element, 2);
      }

      // Check UI weapons
      document.querySelectorAll('.ui-weapon').forEach(weapon => {
        const rect = weapon.getBoundingClientRect();
        const weaponCenterX = rect.left + rect.width / 2;
        const weaponCenterY = rect.top + rect.height / 2;

        const dx = this.playerCursorPos.x - weaponCenterX;
        const dy = this.playerCursorPos.y - weaponCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < Math.max(rect.width, rect.height) / 2) {
          battle.damagePlayer(3);
        }
      });
    });
  },

  handleMouseDown(e) {
    // Import aiCursor module dynamically to avoid circular dependency
    import('./aiCursor.js').then(module => {
      const aiCursor = module.aiCursor;

      // Check if we're clicking on the main AI cursor or any of the additional cursors
      const mainCursor = document.getElementById('aiCursor');

      if (mainCursor && this.isClickOnCursor(e, mainCursor) && aiCursor.isRogueMode) {
        this.draggedCursor = mainCursor;
        this.calculateOffset(e, mainCursor);
        this.startDragging();
        e.preventDefault();
        return;
      }

      // Check additional cursors
      for (const cursorData of aiCursor.aiCursors) {
        if (this.isClickOnCursor(e, cursorData.element)) {
          this.draggedCursor = cursorData.element;
          this.calculateOffset(e, cursorData.element);
          // Store reference for cursor data to pause its movement
          this.draggedCursorData = cursorData;
          if (cursorData.intervalId) {
            clearInterval(cursorData.intervalId);
            cursorData.isBeingDragged = true;
          }
          this.startDragging();
          e.preventDefault();
          break;
        }
      }
    });
  },

  isClickOnCursor(e, cursorElement) {
    if (!cursorElement) return false;

    const rect = cursorElement.getBoundingClientRect();
    const clickX = e.clientX;
    const clickY = e.clientY;

    // Create a more forgiving hitbox for easier grabbing
    const padding = 20;
    return (
      clickX >= rect.left - padding &&
      clickX <= rect.right + padding &&
      clickY >= rect.top - padding &&
      clickY <= rect.bottom + padding
    );
  },

  calculateOffset(e, cursorElement) {
    const rect = cursorElement.getBoundingClientRect();
    this.mouseOffset = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  },

  startDragging() {
    // Show the trash bin when dragging starts
    this.trashBin.style.display = 'block';
    this.trashBin.classList.add('active');

    // Add dragging class to cursor
    if (this.draggedCursor) {
      this.draggedCursor.classList.add('dragging');
    }
  },

  handleMouseMove(e) {
    if (this.draggedCursor) {
      const x = e.clientX - this.mouseOffset.x;
      const y = e.clientY - this.mouseOffset.y;

      this.draggedCursor.style.left = `${x}px`;
      this.draggedCursor.style.top = `${y}px`;

      // Check if cursor is over trash bin
      const trashRect = this.trashBin.getBoundingClientRect();
      if (
        e.clientX >= trashRect.left &&
        e.clientX <= trashRect.right &&
        e.clientY >= trashRect.top &&
        e.clientY <= trashRect.bottom
      ) {
        this.trashBin.classList.add('hover');
      } else {
        this.trashBin.classList.remove('hover');
      }
    }
  },

  handleMouseUp(e) {
    if (this.draggedCursor) {
      // Check if cursor was dropped in trash bin
      const trashRect = this.trashBin.getBoundingClientRect();
      if (
        e.clientX >= trashRect.left &&
        e.clientX <= trashRect.right &&
        e.clientY >= trashRect.top &&
        e.clientY <= trashRect.bottom
      ) {
        this.deleteCursor();
      } else {
        // Otherwise, release the cursor
        this.releaseCursor();
      }

      // Hide trash bin
      this.trashBin.style.display = 'none';
      this.trashBin.classList.remove('active');
      this.trashBin.classList.remove('hover');
    }
  },

  deleteCursor() {
    import('./aiCursor.js').then(module => {
      const aiCursor = module.aiCursor;

      if (this.draggedCursor.id === 'aiCursor') {
        // This is the main cursor - reset it instead of deleting
        this.draggedCursor.classList.remove('dragging');
        this.draggedCursor.style.display = 'none';

        // Stop CPU mode
        aiCursor.stopCPUMode();
      } else {
        // Remove from the DOM
        if (this.draggedCursor.parentNode) {
          this.draggedCursor.parentNode.removeChild(this.draggedCursor);
        }

        // Remove from aiCursors array
        aiCursor.aiCursors = aiCursor.aiCursors.filter(cursor => 
          cursor.element !== this.draggedCursor
        );
      }

      this.draggedCursor = null;
      this.draggedCursorData = null;
    });
  },

  releaseCursor() {
    this.draggedCursor.classList.remove('dragging');

    import('./aiCursor.js').then(module => {
      const aiCursor = module.aiCursor;

      // If this was a secondary cursor, restart its behavior
      const cursorData = aiCursor.aiCursors.find(
        cursor => cursor.element === this.draggedCursor
      );

      if (cursorData && cursorData.isBeingDragged) {
        cursorData.isBeingDragged = false;
        cursorData.position = {
          x: parseFloat(this.draggedCursor.style.left),
          y: parseFloat(this.draggedCursor.style.top)
        };

        // Restart interval with random behavior
        if (!cursorData.intervalId) {
          cursorData.intervalId = setInterval(() => {
            if (!cursorData.isMoving && !cursorData.isBeingDragged) {
              cursorData.isMoving = true;

              const target = aiCursor.getRandomTarget();
              if (target) {
                const targetRect = target.getBoundingClientRect();
                aiCursor.animateAdditionalCursor(
                  cursorData,
                  targetRect.left + targetRect.width / 2 - 32,
                  targetRect.top + targetRect.height / 2 - 32,
                  () => {
                    // After reaching target, perform click if it's a button
                    if (target.tagName === 'BUTTON' || target.classList.contains('shop-item')) {
                      aiCursor.performClickAnimation(target, cursorData);
                    }
                  }
                );
              }
            }
          }, 500 + Math.random() * 1000);
        }
      }

      this.draggedCursor = null;
      this.draggedCursorData = null;
    });
  },

  checkCursorAvoidance() {
    import('./aiCursor.js').then(module => {
      const aiCursor = module.aiCursor;

      if (!aiCursor.isRogueMode) return;

      // Check main cursor
      const mainCursor = document.getElementById('aiCursor');
      if (mainCursor && !this.draggedCursor) {
        this.applyCursorAvoidance(mainCursor);
      }

      // Check additional cursors
      for (const cursorData of aiCursor.aiCursors) {
        if (!cursorData.isBeingDragged && !cursorData.isMoving && this.draggedCursor !== cursorData.element) {
          this.applyCursorAvoidance(cursorData.element);
        }
      }
    });
  },

  applyCursorAvoidance(cursorElement) {
    if (!cursorElement) return;

    const rect = cursorElement.getBoundingClientRect();
    const cursorX = rect.left + rect.width / 2;
    const cursorY = rect.top + rect.height / 2;

    const dx = this.playerCursorPos.x - cursorX;
    const dy = this.playerCursorPos.y - cursorY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // If player cursor is too close, run away
    if (distance < this.avoidanceRadius) {
      const fleeAngle = Math.atan2(dy, dx) + Math.PI; // Opposite direction
      const fleeDistance = (this.avoidanceRadius - distance) * 0.8;

      const newX = cursorX + Math.cos(fleeAngle) * fleeDistance;
      const newY = cursorY + Math.sin(fleeAngle) * fleeDistance;

      // Ensure cursor stays within viewport
      const safePadding = 50;
      const safeX = Math.max(safePadding, Math.min(window.innerWidth - safePadding, newX));
      const safeY = Math.max(safePadding, Math.min(window.innerHeight - safePadding, newY));

      // Move with animation
      cursorElement.classList.add('fleeing');
      cursorElement.style.transition = 'left 0.3s, top 0.3s';
      cursorElement.style.left = `${safeX - rect.width / 2}px`;
      cursorElement.style.top = `${safeY - rect.height / 2}px`;

      setTimeout(() => {
        cursorElement.classList.remove('fleeing');
      }, 300);
    }
  }
};

// Start checking for cursor avoidance at regular intervals
setInterval(() => {
  aiCursorDraggable.checkCursorAvoidance();
}, 250); // Increased interval from 100ms to 250ms for better performance