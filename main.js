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
  playerCursor.init(); // Initialize the player cursor - this now handles system cursor hiding
  numberIndicators.init(); // Initialize number indicators

  // Make modules globally available if needed elsewhere (use cautiously)
  window.aiCursor = aiCursor; // Make AI cursor globally available for number indicators
  window.aiCursorBattle = aiCursorBattle;
  window.aiCursorSpeech = aiCursorSpeech;
  window.playerCursor = playerCursor; // Make player cursor globally available
  window.numberIndicators = numberIndicators;

  // Removed aggressive cursor hiding logic from here, now handled by playerCursor.js
});