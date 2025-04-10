// Console system for admin commands
export const consoleSystem = {
    isOpen: false,
    consoleContainer: null,
    consoleOutput: null,
    consoleInput: null,
    commandHistory: [],
    historyIndex: -1,

    init() {
        // Create console elements
        this.createConsoleElements();

        // Add keyboard event listeners
        document.addEventListener('keydown', this.handleKeyDown.bind(this));

        // Initialize console commands
        this.initCommands();

        // Import additional commands from separate file to reduce file size
        import('./consoleCommands.js').then(module => {
            module.initConsoleCommands(this);
        });
    },

    createConsoleElements() {
        // Create console container
        this.consoleContainer = document.createElement('div');
        this.consoleContainer.className = 'console-container';

        // Create console output area
        this.consoleOutput = document.createElement('div');
        this.consoleOutput.className = 'console-output';

        // Create console input container
        const inputContainer = document.createElement('div');
        inputContainer.className = 'console-input';

        // Create command prompt
        const prompt = document.createElement('span');
        prompt.textContent = '>';

        // Create input field
        this.consoleInput = document.createElement('input');
        this.consoleInput.type = 'text';
        this.consoleInput.autocomplete = 'off';
        this.consoleInput.addEventListener('keydown', this.handleInputKeyDown.bind(this));

        // Assemble the console
        inputContainer.appendChild(prompt);
        inputContainer.appendChild(this.consoleInput);
        this.consoleContainer.appendChild(this.consoleOutput);
        this.consoleContainer.appendChild(inputContainer);

        // Add to document
        document.body.appendChild(this.consoleContainer);
    },

    handleKeyDown(e) {
        // Toggle console with backtick key
        if (e.key === '`' || e.key === 'Backquote') {
            e.preventDefault();
            this.toggleConsole();
        }
    },

    handleInputKeyDown(e) {
        // Execute command on Enter
        if (e.key === 'Enter') {
            const command = this.consoleInput.value.trim();

            if (command) {
                this.executeCommand(command);
                this.commandHistory.push(command);
                this.historyIndex = this.commandHistory.length;
                this.consoleInput.value = '';
            }
        }

        // Navigate command history with arrow keys
        else if (e.key === 'ArrowUp') {
            if (this.historyIndex > 0) {
                this.historyIndex--;
                this.consoleInput.value = this.commandHistory[this.historyIndex];
            }
            e.preventDefault();
        }
        else if (e.key === 'ArrowDown') {
            if (this.historyIndex < this.commandHistory.length - 1) {
                this.historyIndex++;
                this.consoleInput.value = this.commandHistory[this.historyIndex];
            } else {
                this.historyIndex = this.commandHistory.length;
                this.consoleInput.value = '';
            }
            e.preventDefault();
        }
    },

    toggleConsole() {
        this.isOpen = !this.isOpen;

        if (this.isOpen) {
            this.consoleContainer.style.display = 'block';
            this.consoleInput.focus();
            this.log('Console activated. Type "help" for available commands.', 'info');
        } else {
            this.consoleContainer.style.display = 'none';
        }
    },

    log(message, type = 'normal') {
        const entry = document.createElement('div');
        entry.textContent = message;

        if (type) {
            entry.classList.add(type);
        }

        this.consoleOutput.appendChild(entry);
        this.consoleOutput.scrollTop = this.consoleOutput.scrollHeight;
    },

    executeCommand(commandStr) {
        this.log(`> ${commandStr}`);

        const args = commandStr.split(' ');
        const command = args.shift().toLowerCase();

        if (this.commands[command]) {
            try {
                this.commands[command](args);
            } catch (error) {
                this.log(`Error executing command: ${error.message}`, 'error');
            }
        } else {
            this.log(`Unknown command: ${command}. Type "help" for available commands.`, 'error');
        }
    },

    commands: {},

    initCommands() {
        // Help command
        this.commands.help = (args) => {
            const specificCommand = args[0];

            if (specificCommand && this.commands[specificCommand.toLowerCase()]) {
                const helpFuncName = `help_${specificCommand.toLowerCase()}`;
                if (this.commands[helpFuncName]) {
                    this.log(`Help for command "${specificCommand}":`, 'info');
                    this.commands[helpFuncName]();
                } else {
                    this.log(`No specific help available for command "${specificCommand}".`, 'warning');
                }
                return;
            }

            this.log('Available commands:', 'info');
            this.log('help [command] - Display help message (optionally for a specific command)');
            this.log('clear - Clear the console');
            this.log('ai_status - Show AI cursor status');
            this.log('ai_start [speed] - Start AI cursor in CPU mode (speed 1-100)');
            this.log('ai_stop - Stop AI cursor CPU mode');
            this.log('ai_speed [value] - Set AI cursor speed (1-100)');
            this.log('ai_state [state] - Set AI cursor state (idle, working, buying, selling, aggressive, passive, rogue)');
            this.log('ai_rogue - Toggle AI rogue mode');
            this.log('ai_talk [message] - Make AI cursors say something');
            this.log('gamestate - Show current game state');
            this.log('money [amount] - Set money amount');
            this.log('robux [amount] - Set robux amount');
            this.log('work_mult [value] - Set work multiplier');
            this.log('passive_income [level] - Set passive income level');
            this.log('exchange_rate [bonus] - Set exchange rate bonus (e.g., 1.1 for +10%)');
            this.log('heal - Heal yourself in battle mode');
            this.log('restore_ui - Restore UI positions and stop battle');
        };

        // Clear command
        this.commands.clear = () => {
            this.consoleOutput.innerHTML = '';
            this.log('Console cleared.', 'success');
        };

        // Help for specific commands
        this.commands.help_ai_status = () => {
            this.log('ai_status - Shows the current status of the AI cursor including:');
            this.log('  - Current state');
            this.log('  - CPU mode active status');
            this.log('  - Current speed');
            this.log('  - Position coordinates');
        };

        this.commands.help_ai_start = () => {
            this.log('ai_start - Starts the AI cursor in CPU mode');
            this.log('Usage: ai_start [speed]');
            this.log('  speed: Optional. Speed from 1-100 (default: 60)');
        };

        this.commands.help_ai_stop = () => {
            this.log('ai_stop - Stops the AI cursor CPU mode');
        };

        this.commands.help_ai_speed = () => {
            this.log('ai_speed - Sets the AI cursor speed');
            this.log('Usage: ai_speed [value]');
            this.log('  value: Speed from 1-100');
        };

        this.commands.help_ai_state = () => {
            this.log('ai_state - Sets the AI cursor state');
            this.log('Usage: ai_state [state]');
            this.log('  state: One of idle, working, buying, selling, aggressive, passive, rogue');
        };

        this.commands.help_ai_rogue = () => {
            this.log('ai_rogue - Toggles AI rogue mode on/off');
            this.log('  In rogue mode, AI can interact with all UI elements');
            this.log('  WARNING: The AI might click anything, including menus and settings!');
        };

        this.commands.help_gamestate = () => {
            this.log('gamestate - Shows current game state values');
        };

        this.commands.help_money = () => {
            this.log('money - Sets player money amount');
            this.log('Usage: money [amount]');
        };

        this.commands.help_robux = () => {
            this.log('robux - Sets player robux amount');
            this.log('Usage: robux [amount]');
        };

        this.commands.help_work_mult = () => {
            this.log('work_mult - Sets work multiplier value');
            this.log('Usage: work_mult [value]');
        };

        // Help for new commands
        this.commands.help_passive_income = () => {
            this.log('passive_income - Sets passive income level');
            this.log('Usage: passive_income [level]');
            this.log('  level: The amount of money earned every 5 seconds');
        };

        this.commands.help_exchange_rate = () => {
            this.log('exchange_rate - Sets the exchange rate bonus multiplier');
            this.log('Usage: exchange_rate [bonus]');
            this.log('  bonus: Multiplier for Robux gained from exchanges (1 = base, 1.1 = +10%)');
        };

        // Help for heal and restore_ui
        this.commands.help_heal = () => {
            this.log('heal - Restores your health to full');
            this.log('  Use this if you are killed by the AI cursors');
        };

        this.commands.help_restore_ui = () => {
            this.log('restore_ui - Resets UI elements to their original positions');
            this.log('  Also disables rogue mode and battle system');
        };

        this.commands.help_ai_talk = () => {
            this.log('ai_talk - Make all AI cursors display a speech bubble with your message', 'info');
            this.log('Usage: ai_talk [message]', 'info');
            this.log('  message: The text you want the cursors to display', 'info');
        };

        // Import other modules' functions for use in console commands
        import('./aiCursor.js').then(module => {
            const aiCursor = module.aiCursor;

            // AI cursor status command
            this.commands.ai_status = () => {
                this.log('AI Cursor Status:', 'info');
                this.log(`State: ${aiCursor.currentState}`);
                this.log(`CPU Mode: ${aiCursor.cpuIntervalId ? 'Active' : 'Inactive'}`);
                this.log(`Speed: ${aiCursor.getCPUSpeedPercentage()}%`);
                this.log(`Position: X:${aiCursor.lastPosition.x.toFixed(2)}, Y:${aiCursor.lastPosition.y.toFixed(2)}`);
                this.log(`Moving: ${aiCursor.isMoving ? 'Yes' : 'No'}`);
                this.log(`Target Preference: ${aiCursor.targetPreference}`);
                this.log(`Rogue Mode: ${aiCursor.isRogueMode ? 'Enabled' : 'Disabled'}`);
            };

            // Start AI cursor command
            this.commands.ai_start = (args) => {
                const speed = args[0] ? parseInt(args[0]) : 60;

                if (isNaN(speed) || speed < 1 || speed > 100) {
                    this.log('Invalid speed. Please specify a value between 1 and 100.', 'error');
                    return;
                }

                // Convert percentage to slider value (100-900)
                const sliderValue = 100 + (speed * 8);

                aiCursor.startCPUMode(sliderValue);
                this.log(`Started AI cursor in CPU mode with speed: ${speed}%`, 'success');
            };

            // Stop AI cursor command
            this.commands.ai_stop = () => {
                aiCursor.stopCPUMode();
                this.log('Stopped AI cursor CPU mode', 'success');
            };

            // Set AI cursor speed command
            this.commands.ai_speed = (args) => {
                if (!args.length) {
                    this.log('Current AI speed: ' + aiCursor.getCPUSpeedPercentage() + '%', 'info');
                    return;
                }

                const speed = parseInt(args[0]);

                if (isNaN(speed) || speed < 1 || speed > 100) {
                    this.log('Invalid speed. Please specify a value between 1 and 100.', 'error');
                    return;
                }

                // Convert percentage to slider value (100-900)
                const sliderValue = 100 + (speed * 8);

                aiCursor.setCPUSpeed(sliderValue);
                this.log(`Set AI cursor speed to: ${speed}%`, 'success');
            };

            // Set AI cursor state command
            this.commands.ai_state = (args) => {
                if (!args.length) {
                    this.log('Current AI state: ' + aiCursor.currentState, 'info');
                    return;
                }

                const state = args[0].toLowerCase();
                const validStates = ['idle', 'working', 'buying', 'selling', 'aggressive', 'passive', 'rogue'];

                if (!validStates.includes(state)) {
                    this.log(`Invalid state. Valid states are: ${validStates.join(', ')}`, 'error');
                    return;
                }

                aiCursor.setState(state);
                this.log(`Set AI cursor state to: ${state}`, 'success');
            };

            // Toggle AI rogue mode command
            this.commands.ai_rogue = () => {
                aiCursor.isRogueMode = !aiCursor.isRogueMode;

                if (aiCursor.isRogueMode) {
                    aiCursor.setState('rogue');
                    this.log('AI ROGUE MODE ENABLED - The AI will now interact with all UI elements!', 'warning');
                    this.log('Use this command again to disable rogue mode', 'info');

                    // Start battle mode when activating rogue mode
                    import('./aiCursorBattle.js').then(battleModule => {
                        const battle = battleModule.aiCursorBattle;
                        battle.startBattle();
                    });

                } else {
                    aiCursor.setState('idle');
                    this.log('AI rogue mode disabled', 'success');

                    // Stop battle mode when disabling rogue mode
                    import('./aiCursorBattle.js').then(battleModule => {
                        const battle = battleModule.aiCursorBattle;
                        battle.stopBattle();
                    });
                }
            };

            // Add heal command
            this.commands.heal = () => {
                import('./aiCursorBattle.js').then(battleModule => {
                    const battle = battleModule.aiCursorBattle;
                    battle.healPlayer(battle.maxHealth);
                    this.log('You have been healed to full health!', 'success');
                });
            };

            // Add restore UI command
            this.commands.restore_ui = () => {
                import('./aiCursorBattle.js').then(battleModule => {
                    const battle = battleModule.aiCursorBattle;
                    battle.stopBattle();

                    // Also disable rogue mode
                    aiCursor.isRogueMode = false;
                    aiCursor.setState('idle');

                    this.log('UI has been restored and battle mode disabled', 'success');
                });
            };
        });

        // Note: Game state commands (gamestate, money, robux, work_mult, passive_income, exchange_rate)
        // are now initialized within consoleCommands.js using dynamic import.
    }
};