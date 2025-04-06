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
      
      // Add ai_talk to help command
      const originalHelpCommand = consoleSystem.commands.help;
      consoleSystem.commands.help = (args) => {
        if (!args.length) {
          originalHelpCommand(args);
          consoleSystem.log('ai_talk [message] - Make AI cursors say something', 'info');
          return;
        }
        originalHelpCommand(args);
      };
    });
    
    // Other console commands can be moved here as needed
  });
}