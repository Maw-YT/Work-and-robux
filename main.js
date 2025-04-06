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
  
  // Make battle system globally available
  window.aiCursorBattle = aiCursorBattle;
  window.aiCursorSpeech = aiCursorSpeech;
});

