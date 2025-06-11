// Console commands split out from console.js to avoid file size issues
export function initConsoleCommands(consoleSystem) {
  import('./aiCursor.js').then(module => {
    const aiCursor = module.aiCursor;

    // AI speech commands
    import('./aiCursorSpeech.js').then(speechModule => {
      const aiCursorSpeech = speechModule.aiCursorSpeech;

      // Talk to AI command
      consoleSystem.commands.ai_talk = (args) => {
        if (!args.length) {
          consoleSystem.log('Usage: ai_talk [message]', 'info');
          return;
        }

        const message = args.join(' ');

        // Make all cursors speak the custom message
        aiCursorSpeech.speakAll(message);

        consoleSystem.log(`You said to the AI cursors: "${message}"`, 'success');
      };

      // Help for ai_talk command
      consoleSystem.commands.help_ai_talk = () => {
        consoleSystem.log('ai_talk - Make all AI cursors display a speech bubble with your message', 'info');
        consoleSystem.log('Usage: ai_talk [message]', 'info');
        consoleSystem.log('  message: The text you want the cursors to display', 'info');
      };

      // Toggle AI speech command
      consoleSystem.commands.ai_speech_toggle = (args) => {
        const enabled = aiCursorSpeech.toggleSpeech();
        consoleSystem.log(`AI speech bubbles ${enabled ? 'enabled' : 'disabled'}.`, 'success');
      };

      // Help for ai_speech_toggle
      consoleSystem.commands.help_ai_speech_toggle = () => {
        consoleSystem.log('ai_speech_toggle - Toggles the display of AI cursor speech bubbles on/off.', 'info');
      };

      // Add ai_talk to help command (handled in console.js)
    });

    // Other console commands can be moved here as needed
  });

  // Number Indicator commands
  import('./numberIndicators.js').then(indicatorModule => {
    const numberIndicators = indicatorModule.numberIndicators;

    // Toggle Number Indicators command
    consoleSystem.commands.toggle_indicators = (args) => {
      const enabled = numberIndicators.toggleIndicators();
      consoleSystem.log(`Number indicators ${enabled ? 'enabled' : 'disabled'}.`, 'success');
    };

    // Help for toggle_indicators command (this definition might be redundant if already in console.js, but good for organization)
    consoleSystem.commands.help_toggle_indicators = () => {
      consoleSystem.log('toggle_indicators - Toggles the display of floating number indicators on/off.', 'info');
      consoleSystem.log('  When disabled, numbers like +$1 or -5 R$ will not appear on clicks.', 'info');
    };
  });

  // Player Cursor commands
  import('./player-cursor.js').then(cursorModule => {
    const playerCursor = cursorModule.playerCursor;

    // Toggle Custom Cursor command
    consoleSystem.commands.toggle_cursor = (args) => {
      const enabled = playerCursor.toggleVisibility();
      consoleSystem.log(`Custom player cursor ${enabled ? 'enabled' : 'disabled'}.`, 'success');
    };

    // Help for toggle_cursor command
    consoleSystem.commands.help_toggle_cursor = () => {
      consoleSystem.log('toggle_cursor - Toggles the custom player cursor on/off.', 'info');
      consoleSystem.log('  When disabled, the default system cursor will be shown.', 'info');
    };
  });

  // Game state commands (imported separately for clarity)
  import('./gameState.js').then(module => {
    const gameState = module.gameState;
    const updateMoneyDisplay = module.updateMoneyDisplay;
    const updateRobuxDisplay = module.updateRobuxDisplay;
    const updateWorkButtonText = module.updateWorkButtonText;
    const updateShopItemsDisplay = module.updateShopItemsDisplay; // Import if needed

    // Game state display command
    consoleSystem.commands.gamestate = () => {
      consoleSystem.log('Current Game State:', 'info');
      consoleSystem.log(`Money: $${gameState.money}`);
      consoleSystem.log(`Robux: ${gameState.robux}`);
      consoleSystem.log(`Work Multiplier: ${gameState.workMultiplier}`);
      consoleSystem.log(`Work Upgrade Cost: ${gameState.workUpgradeCost} Robux`);
      consoleSystem.log(`Passive Income Level: ${gameState.passiveIncome} ($${gameState.passiveIncome}/5s)`);
      consoleSystem.log(`Passive Income Upgrade Cost: ${gameState.passiveIncomeCost} Robux`);
      const exchangeBonusPercent = ((gameState.exchangeRateBonus - 1) * 100).toFixed(0);
      consoleSystem.log(`Exchange Rate Bonus: +${exchangeBonusPercent}%`);
      consoleSystem.log(`Exchange Rate Upgrade Cost: ${gameState.exchangeRateCost} Robux`);
      consoleSystem.log(`Game Mode: ${gameState.gameMode || 'None'}`);
      consoleSystem.log(`Potato Mode: ${gameState.lowPerformanceMode ? 'Enabled' : 'Disabled'}`); // Show potato mode status

      consoleSystem.log('Shop Items:', 'info');
      Object.entries(gameState.shopItems).forEach(([itemName, details]) => {
        consoleSystem.log(`- ${itemName}: ${details.owned ? 'Owned' : 'Not Owned'}`);
        if (details.owned) {
          consoleSystem.log(`  Sell Price: ${Math.floor(details.sellPrice)}`);
        }
      });
    };

    // Set money command
    consoleSystem.commands.money = (args) => {
      if (!args.length) {
        consoleSystem.log(`Current money: $${gameState.money}`, 'info');
        return;
      }

      const amount = parseInt(args[0]);

      if (isNaN(amount) || amount < 0) {
        consoleSystem.log('Invalid amount. Please specify a positive number.', 'error');
        return;
      }

      gameState.money = amount;
      updateMoneyDisplay();
      consoleSystem.log(`Set money to: $${amount}`, 'success');
    };

    // Set robux command
    consoleSystem.commands.robux = (args) => {
      if (!args.length) {
        consoleSystem.log(`Current robux: ${gameState.robux}`, 'info');
        return;
      }

      const amount = parseInt(args[0]);

      if (isNaN(amount) || amount < 0) {
        consoleSystem.log('Invalid amount. Please specify a positive number.', 'error');
        return;
      }

      gameState.robux = amount;
      updateRobuxDisplay();
      consoleSystem.log(`Set robux to: ${amount}`, 'success');
    };

    // Set work multiplier command
    consoleSystem.commands.work_mult = (args) => {
      if (!args.length) {
        consoleSystem.log(`Current work multiplier: ${gameState.workMultiplier}`, 'info');
        return;
      }

      const value = parseInt(args[0]);

      if (isNaN(value) || value < 1) {
        consoleSystem.log('Invalid value. Please specify a positive number.', 'error');
        return;
      }

      gameState.workMultiplier = value;
      updateWorkButtonText();
      consoleSystem.log(`Set work multiplier to: ${value}`, 'success');
    };

    // Set passive income level command
    consoleSystem.commands.passive_income = (args) => {
      if (!args.length) {
        consoleSystem.log(`Current passive income level: ${gameState.passiveIncome} ($${gameState.passiveIncome}/5s)`, 'info');
        return;
      }

      const level = parseInt(args[0]);

      if (isNaN(level) || level < 0) {
        consoleSystem.log('Invalid level. Please specify a non-negative number.', 'error');
        return;
      }

      gameState.passiveIncome = level;
      updateWorkButtonText(); // Update button text to reflect new income
      consoleSystem.log(`Set passive income level to: ${level} ($${level}/5s)`, 'success');
    };

    // Set exchange rate bonus command
    consoleSystem.commands.exchange_rate = (args) => {
      if (!args.length) {
        consoleSystem.log(`Current exchange rate bonus: ${gameState.exchangeRateBonus.toFixed(2)} (+${(gameState.exchangeRateBonus * 10).toFixed(1)}%)`, 'info');
        return;
      }

      const bonus = parseFloat(args[0]);

      if (isNaN(bonus) || bonus < 1) {
        consoleSystem.log('Invalid bonus. Please specify a number >= 1 (e.g., 1.1 for +10%).', 'error');
        return;
      }

      gameState.exchangeRateBonus = bonus;
      updateWorkButtonText(); // Update button text to reflect new rate
      consoleSystem.log(`Set exchange rate bonus to: ${bonus.toFixed(2)} (+${((bonus - 1) * 100).toFixed(1)}%)`, 'success');
    };

    // Potato Mode command
    consoleSystem.commands.potato_mode = () => {
      gameState.lowPerformanceMode = !gameState.lowPerformanceMode;
      if (gameState.lowPerformanceMode) {
        document.body.classList.add('potato-mode');
        consoleSystem.log('Potato Mode Enabled: Reduced animations and effects.', 'success');
      } else {
        document.body.classList.remove('potato-mode');
        consoleSystem.log('Potato Mode Disabled: Restored animations and effects.', 'success');
      }
      // Re-initialize AI speed if CPU mode is active to apply changes
      import('./aiCursor.js').then(aiModule => {
          const aiCursor = aiModule.aiCursor;
          if (aiCursor.cpuIntervalId) {
              const currentSpeedSetting = 1000 - aiCursor.cpuSpeed; // Get current slider-like value
              aiCursor.stopCPUMode();
              aiCursor.startCPUMode(currentSpeedSetting); // Restart with the same setting, startCPUMode will check potato mode
          }
      });
    };

    // Help for potato_mode
    consoleSystem.commands.help_potato_mode = () => {
      consoleSystem.log('potato_mode - Toggles low performance mode on/off.', 'info');
      consoleSystem.log('  Reduces animations, effects, and AI update rates for better performance on slower computers.', 'info');
    };

  });
}