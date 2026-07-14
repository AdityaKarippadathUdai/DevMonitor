const { app } = require('electron');
app.commandLine.appendSwitch('no-sandbox');
app.whenReady().then(() => { console.log('Ready'); app.quit(); });
