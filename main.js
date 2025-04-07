import { initGameState } from './gameState.js';
import { setupEventListeners } from './eventListeners.js';
import { setupUI } from './uiControls.js';
import { musicControls } from './musicControls.js';
import { saveLoadGame } from './saveLoadGame.js';
import { aiCursor } from './aiCursor.js';
import { consoleSystem } from './console.js';
import { aiCursorDraggable } from './aiCursorDraggable.js';
import { aiCursorBattle } from './aiCursorBattle.js';
import { aiCursorSpeech } from './aiCursorSpeech.js';
import { playerCursor } from './player-cursor.js';
import { numberIndicators } from './numberIndicators.js';

document.addEventListener('DOMContentLoaded', () => {
  initGameState();
  setupEventListeners();
  setupUI();
  musicControls.init();
  saveLoadGame.init();
  aiCursor.init();
  consoleSystem.init();
  aiCursorDraggable.init();
  aiCursorBattle.init();
  playerCursor.init(); // Initialize the player cursor
  numberIndicators.init(); // Initialize number indicators

  // Make modules globally available if needed elsewhere (use cautiously)
  window.aiCursor = aiCursor; // Make AI cursor globally available for number indicators
  window.aiCursorBattle = aiCursorBattle;
  window.aiCursorSpeech = aiCursorSpeech;
  window.playerCursor = playerCursor; // Make player cursor globally available
  window.numberIndicators = numberIndicators;

  // Fix browser cursor visibility more efficiently
  document.body.style.cursor = 'none';
  // Apply to specific interactive elements if needed, but generally hiding body cursor is enough
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest('button, a, input, select, textarea, .shop-item')) {
      e.target.style.cursor = 'none';
    } else {
       // Reset cursor for non-interactive areas if needed, though usually covered by body style
      document.body.style.cursor = 'none';
    }
  }, true); // Use capture phase

  // Initial fix for elements already present
  fixCursorVisibility();
});

// Simplified function to fix cursor visibility on existing elements
function fixCursorVisibility() {
  const allInteractiveElements = document.querySelectorAll('button, a, input, .shop-item, label, select, textarea');
  allInteractiveElements.forEach(element => {
    element.style.cursor = 'none';
  });

  // Less aggressive mutation observer
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === 1) { // Element node
           if (node.matches('button, a, input, .shop-item, label, select, textarea')) {
              node.style.cursor = 'none';
           }
           node.querySelectorAll('button, a, input, .shop-item, label, select, textarea').forEach(el => el.style.cursor = 'none');
        }
      });
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
}