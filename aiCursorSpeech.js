// AI Cursor Speech System
export const aiCursorSpeech = {
  // Collection of possible phrases for different states
  phrases: {
    idle: [
      "Just hanging out...",
      "What should I click today?",
      "Beep boop. I am an AI cursor.",
      "Looking for something to do.",
      "Hello there!",
      "I'm not doing anything right now.",
      "Waiting for instructions..."
    ],
    working: [
      "Time to work!",
      "Money, money, money!",
      "Let's earn some cash!",
      "Work, work, work...",
      "Another day, another dollar!",
      "Grinding for that cash!",
      "Working hard or hardly working?"
    ],
    buying: [
      "Ooh, I want that!",
      "Shopping spree!",
      "Time to spend some Robux!",
      "This looks nice!",
      "I'll take one of those!",
      "Add to cart!",
      "Shut up and take my Robux!"
    ],
    selling: [
      "Time to cash out!",
      "Let's sell this!",
      "Need more Robux!",
      "Selling for profit!",
      "This should fetch a good price!",
      "Bye-bye item!",
      "Converting items to Robux!"
    ],
    aggressive: [
      "Must click faster!",
      "Maximum efficiency!",
      "No time to waste!",
      "Speed is key!",
      "Working at hyperspeed!",
      "Aggressive optimization mode!",
      "MAXIMUM OVERDRIVE!"
    ],
    passive: [
      "Taking it easy...",
      "Slow and steady wins the race.",
      "No rush.",
      "Just relaxing.",
      "Casual clicking mode.",
      "Low power mode activated.",
      "Conservation mode."
    ],
    rogue: [
      "I'm free! FREE!",
      "No one can stop me now!",
      "This whole UI is mine!",
      "Click ALL the buttons!",
      "Chaos is fun!",
      "MUHAHAHA!",
      "I do what I want!"
    ],
    battle: [
      "Prepare to be defeated!",
      "En garde!",
      "Your cursor is no match for me!",
      "Fight me if you dare!",
      "This means war!",
      "To battle!",
      "I challenge you to a duel!"
    ],
    custom: [] // For custom messages from console command
  },
  
  // Create a speech bubble for a cursor
  createSpeechBubble(message, cursor, duration = 4000) {
    // Remove any existing speech bubble
    this.removeSpeechBubble(cursor);
    
    // Create speech bubble element
    const speechBubble = document.createElement('div');
    speechBubble.className = 'cursor-speech-bubble';
    speechBubble.innerHTML = `
      <div class="speech-bubble-content">${message}</div>
      <div class="speech-bubble-tail"></div>
    `;
    
    // Position speech bubble above cursor
    const cursorRect = cursor.getBoundingClientRect();
    speechBubble.style.left = `${cursorRect.left + cursorRect.width / 2}px`;
    speechBubble.style.top = `${cursorRect.top - 10}px`;
    
    // Add to DOM
    document.body.appendChild(speechBubble);
    
    // Store reference to speech bubble on cursor
    cursor.speechBubble = speechBubble;
    
    // Animate in
    setTimeout(() => {
      speechBubble.classList.add('active');
    }, 10);
    
    // Remove after duration
    setTimeout(() => {
      this.removeSpeechBubble(cursor);
    }, duration);
    
    return speechBubble;
  },
  
  // Remove speech bubble from a cursor
  removeSpeechBubble(cursor) {
    if (cursor.speechBubble) {
      cursor.speechBubble.classList.remove('active');
      
      // Wait for animation to finish before removing
      setTimeout(() => {
        if (cursor.speechBubble && cursor.speechBubble.parentNode) {
          cursor.speechBubble.parentNode.removeChild(cursor.speechBubble);
        }
        cursor.speechBubble = null;
      }, 300);
    }
  },
  
  // Make a cursor speak based on its state
  speak(cursor, state, customMessage = null) {
    if (!cursor) return;
    
    let message;
    
    if (customMessage) {
      message = customMessage;
    } else if (this.phrases[state]) {
      // Get random phrase for the state
      const stateMessages = this.phrases[state];
      message = stateMessages[Math.floor(Math.random() * stateMessages.length)];
    } else {
      // Default message if state not found
      message = "Hello!";
    }
    
    return this.createSpeechBubble(message, cursor);
  },
  
  // Add custom phrase to a state
  addPhrase(state, phrase) {
    if (this.phrases[state]) {
      this.phrases[state].push(phrase);
      return true;
    }
    return false;
  },
  
  // Make all AI cursors speak based on their state
  speakAll(customMessage = null) {
    import('./aiCursor.js').then(module => {
      const aiCursor = module.aiCursor;
      
      // Make main AI cursor speak
      const mainCursor = document.getElementById('aiCursor');
      if (mainCursor && mainCursor.style.display !== 'none') {
        this.speak(mainCursor, aiCursor.currentState, customMessage);
      }
      
      // Make additional AI cursors speak
      aiCursor.aiCursors.forEach(cursorData => {
        if (cursorData.element) {
          this.speak(cursorData.element, 'rogue', customMessage);
        }
      });
    });
  }
};