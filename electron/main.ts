import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { getAllMetrics, getSystemSpecs } from './services/system';

let mainWindow: BrowserWindow | null = null;
let metricsInterval: NodeJS.Timeout | null = null;

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'Resource Monitor',
    frame: true, // Native window borders for maximum system fidelity, or custom-titlebar-friendly
    backgroundColor: '#0f172a', // Slate-900 background to match our theme
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Load URL in dev, or file path in prod
  if (process.env.VITE_DEV_SERVER_URL) {
    await mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    await mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Set up background polling ticker (500ms as requested)
  startMetricsPolling();

  mainWindow.on('closed', () => {
    mainWindow = null;
    stopMetricsPolling();
  });
}

function startMetricsPolling() {
  if (metricsInterval) clearInterval(metricsInterval);
  
  metricsInterval = setInterval(async () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      try {
        const metrics = await getAllMetrics();
        mainWindow.webContents.send('metrics-update', metrics);
      } catch (error) {
        console.error('Error in metrics background poll:', error);
      }
    }
  }, 500); // 500ms intervals
}

function stopMetricsPolling() {
  if (metricsInterval) {
    clearInterval(metricsInterval);
    metricsInterval = null;
  }
}

// IPC registration
ipcMain.handle('get-system-metrics', async () => {
  return await getAllMetrics();
});

ipcMain.handle('get-system-specs', async () => {
  return await getSystemSpecs();
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
