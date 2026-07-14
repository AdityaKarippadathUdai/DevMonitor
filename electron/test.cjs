const { app } = require('electron'); app.commandLine.appendSwitch('no-sandbox'); app.whenReady().then(() => { console.log('App ready'); app.quit(); });
