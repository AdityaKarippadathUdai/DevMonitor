const { app } = require('electron');
app.commandLine.appendSwitch('disable-setuid-sandbox');
app.whenReady().then(() => { console.log('Ready'); app.quit(); });
