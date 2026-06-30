import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getAllMetrics, getSystemSpecs } from './services/system.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow: BrowserWindow | null = null;
let metricsInterval: NodeJS.Timeout | null = null;

async function loadAppContent(window: BrowserWindow) {
  if (!app.isPackaged) {
    const candidates = [
      process.env.VITE_DEV_SERVER_URL,
      'http://127.0.0.1:5173',
      'http://localhost:5173',
    ].filter((value): value is string => Boolean(value));

    for (let attempt = 0; attempt < candidates.length; attempt += 1) {
      try {
        await window.loadURL(candidates[attempt]);
        return;
      } catch (error) {
        console.warn(`Failed to load ${candidates[attempt]}:`, error);
        if (attempt < candidates.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 750));
        }
      }
    }
  }

  await window.loadFile(path.join(__dirname, '../index.html'));
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'Resource Monitor',
    frame: true,
    backgroundColor: '#0f172a',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  await loadAppContent(mainWindow);

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
