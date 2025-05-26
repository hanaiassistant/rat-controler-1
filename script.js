// Simulated RAT functionality for demo purposes
document.addEventListener('DOMContentLoaded', function() {
    // Initialize terminal
    const terminal = document.getElementById('terminal');
    const commandInput = document.getElementById('command-input');
    
    // Terminal command history
    let commandHistory = [];
    let historyIndex = -1;
    
    // Focus on input
    commandInput.focus();
    
    // Terminal commands
    const commands = {
        help: function() {
            addTerminalLine('Available commands:');
            addTerminalLine('help - Show this help message');
            addTerminalLine('clear - Clear terminal');
            addTerminalLine('connect [id] - Connect to device');
            addTerminalLine('disconnect - Disconnect from device');
            addTerminalLine('camera - Access device camera');
            addTerminalLine('files - Access device files');
            addTerminalLine('sms - Access device messages');
            addTerminalLine('flashlight - Toggle device flashlight');
        },
        clear: function() {
            const lines = document.querySelectorAll('.terminal-line');
            lines.forEach(line => {
                if (!line.classList.contains('terminal-input-line')) {
                    line.remove();
                }
            });
        },
        connect: function(args) {
            if (args.length < 1) {
                addTerminalLine('Usage: connect [device_id]', 'error');
                return;
            }
            addTerminalLine(`> Attempting to connect to device ${args[0]}...`);
            // Simulate connection delay
            setTimeout(() => {
                addTerminalLine(`> Successfully connected to device ${args[0]}`, 'success');
            }, 1500);
        },
        disconnect: function() {
            addTerminalLine('> Disconnecting from device...');
            setTimeout(() => {
                addTerminalLine('> Disconnected', 'success');
            }, 1000);
        },
        camera: function() {
            toggleCamera();
        },
        files: function() {
            accessFiles();
        },
        sms: function() {
            accessSMS();
        },
        flashlight: function() {
            toggleFlashlight();
        }
    };
    
    // Handle command input
    commandInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            const commandText = commandInput.value.trim();
            if (commandText) {
                // Add to history
                commandHistory.push(commandText);
                historyIndex = commandHistory.length;
                
                // Process command
                addTerminalLine(`root@darkhawk:~# ${commandText}`);
                
                const parts = commandText.split(' ');
                const command = parts[0].toLowerCase();
                const args = parts.slice(1);
                
                if (commands[command]) {
                    commands[command](args);
                } else {
                    addTerminalLine(`Command not found: ${command}`, 'error');
                    addTerminalLine('Type "help" for available commands');
                }
                
                // Clear input
                commandInput.value = '';
                
                // Scroll to bottom
                terminal.scrollTop = terminal.scrollHeight;
            }
        } else if (e.key === 'ArrowUp') {
            // Navigate command history
            if (commandHistory.length > 0) {
                if (historyIndex > 0) historyIndex--;
                commandInput.value = commandHistory[historyIndex] || '';
            }
        } else if (e.key === 'ArrowDown') {
            // Navigate command history
            if (commandHistory.length > 0) {
                if (historyIndex < commandHistory.length - 1) historyIndex++;
                commandInput.value = commandHistory[historyIndex] || '';
            }
        }
    });
    
    function addTerminalLine(text, className = '') {
        const line = document.createElement('div');
        line.className = `terminal-line ${className}`;
        line.textContent = text;
        terminal.insertBefore(line, document.querySelector('.terminal-input-line'));
    }
    
    // Control functions
    window.toggleCamera = function() {
        const cameraFeed = document.getElementById('camera-feed');
        cameraFeed.classList.toggle('visible');
        
        if (cameraFeed.classList.contains('visible')) {
            addTerminalLine('> Accessing device camera...');
            setTimeout(() => {
                addTerminalLine('> Camera feed activated', 'success');
                // Simulate camera feed
                cameraFeed.querySelector('.feed-placeholder').textContent = 'LIVE CAMERA FEED';
            }, 1000);
        } else {
            addTerminalLine('> Camera feed deactivated', 'success');
        }
    };
    
    window.accessFiles = function() {
        const fileList = document.getElementById('file-list');
        fileList.classList.toggle('visible');
        
        if (fileList.classList.contains('visible')) {
            addTerminalLine('> Accessing device files...');
            setTimeout(() => {
                addTerminalLine('> File system accessed', 'success');
                // Simulate file list
                fileList.innerHTML = `
                    <div class="file-item">📁 Downloads</div>
                    <div class="file-item">📁 Documents</div>
                    <div class="file-item">📁 Pictures</div>
                    <div class="file-item">📄 notes.txt</div>
                    <div class="file-item">📄 contacts.vcf</div>
                `;
            }, 1000);
        }
    };
    
    window.accessSMS = function() {
        const smsList = document.getElementById('sms-list');
        smsList.classList.toggle('visible');
        
        if (smsList.classList.contains('visible')) {
            addTerminalLine('> Accessing device messages...');
            setTimeout(() => {
                addTerminalLine('> SMS messages accessed', 'success');
                // Simulate SMS list
                smsList.innerHTML = `
                    <div class="sms-item">
                        <div class="sms-sender">Mom</div>
                        <div class="sms-text">Call me when you can</div>
                    </div>
                    <div class="sms-item">
                        <div class="sms-sender">John</div>
                        <div class="sms-text">Meeting at 3pm tomorrow</div>
                    </div>
                `;
            }, 1000);
        }
    };
    
    window.toggleFlashlight = function() {
        const status = document.getElementById('flashlight-status');
        const isOn = status.textContent === 'ON';
        
        addTerminalLine(`> Toggling flashlight ${isOn ? 'OFF' : 'ON'}...`);
        
        setTimeout(() => {
            status.textContent = isOn ? 'OFF' : 'ON';
            status.style.color = isOn ? '#ff0000' : '#00ff00';
            addTerminalLine(`> Flashlight turned ${isOn ? 'OFF' : 'ON'}`, 'success');
        }, 800);
    };
    
    // Add some hacker-like effects
    setInterval(() => {
        const random = Math.random();
        if (random > 0.9) {
            const elements = document.querySelectorAll('.terminal-line:not(.terminal-input-line)');
            if (elements.length > 0) {
                const randomElement = elements[Math.floor(Math.random() * elements.length)];
                randomElement.classList.add('glitch');
                setTimeout(() => {
                    randomElement.classList.remove('glitch');
                }, 300);
            }
        }
    }, 3000);
});