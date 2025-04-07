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

      // Add ai_talk to help command (handled in console.js)
    });

    // Other console commands can be moved here as needed
  });

  // Game state commands (imported separately for clarity)
  import('./gameState.js').then(module => {
    const gameState = module.gameState;
    const updateMoneyDisplay = module.updateMoneyDisplay;
    const updateRobuxDisplay = module.updateRobuxDisplay;
    const updateWorkButtonText = module.updateWorkButtonText;

    // Game state display command
    consoleSystem.commands.gamestate = () => {
      consoleSystem.log('Current Game State:', 'info');
      consoleSystem.log(`Money: $${gameState.money}`);
      consoleSystem.log(`Robux: ${gameState.robux}`);
      consoleSystem.log(`Work Multiplier: ${gameState.workMultiplier}`);
      consoleSystem.log(`Work Upgrade Cost: ${gameState.workUpgradeCost} Robux`);
      consoleSystem.log(`Passive Income Level: ${gameState.passiveIncome} ($${gameState.passiveIncome}/5s)`);
      consoleSystem.log(`Passive Income Upgrade Cost: ${gameState.passiveIncomeCost} Robux`);
      consoleSystem.log(`Exchange Rate Bonus: +${(gameState.exchangeRateBonus * 10).toFixed(1)}%`);
      consoleSystem.log(`Exchange Rate Upgrade Cost: ${gameState.exchangeRateCost} Robux`);
      consoleSystem.log(`Game Mode: ${gameState.gameMode || 'None'}`);

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
  });
}