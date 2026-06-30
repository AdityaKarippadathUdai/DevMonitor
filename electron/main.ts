import { app, BrowserWindow, ipcMain } from 'electron';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getAllMetrics, getSystemSpecs } from './services/system.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow: BrowserWindow | null = null;
let metricsInterval: NodeJS.Timeout | null = null;

function resolvePreloadPath() {
  const candidates = [
    path.resolve(app.getAppPath(), 'electron/preload.cjs'),
    path.resolve(__dirname, '../../electron/preload.cjs'),
    path.resolve(__dirname, 'preload.cjs'),
    path.resolve(__dirname, 'preload.js'),
  ];

  const existingPath = candidates.find((candidate) => existsSync(candidate));
  const preloadPath = existingPath ?? candidates[0];

  console.log(`[Electron] Using preload script at ${preloadPath}`);
  return preloadPath;
}

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
  const preloadPath = resolvePreloadPath();

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'Resource Monitor',
    frame: true,
    backgroundColor: '#0f172a',
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  console.log('[Electron] BrowserWindow created');

  mainWindow.webContents.on('console-message', (_event, level, message, line, sourceId) => {
    console.log(`[Renderer ${level}] ${message} [${sourceId}:${line}]`);
  });

  mainWindow.webContents.on('did-finish-load', async () => {
    try {
      const bridgeInfo = await mainWindow?.webContents.executeJavaScript(`(() => {
        try {
          return {
            hasElectronAPI: !!window.electronAPI,
            keys: window.electronAPI ? Object.keys(window.electronAPI) : [],
          };
        } catch (error) {
          return { error: error.message };
        }
      })()`);
      console.log('[Electron] Renderer bridge inspection:', bridgeInfo);
    } catch (error) {
      console.error('[Electron] Failed to inspect renderer bridge:', error);
    }
  });

  await loadAppContent(mainWindow);

  console.log('[Electron] Renderer loaded, starting metrics polling');
  startMetricsPolling();

  mainWindow.on('closed', () => {
    mainWindow = null;
    stopMetricsPolling();
  });
}

function startMetricsPolling() {
  if (metricsInterval) clearInterval(metricsInterval);

  console.log('[Electron] Starting metrics polling every 500ms');

  metricsInterval = setInterval(async () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      try {
        console.log('[Electron] Polling system metrics');
        const metrics = await getAllMetrics();
        console.log('[Electron] Sending metrics-update event to renderer', metrics.timestamp);
        mainWindow.webContents.send('metrics-update', metrics);
      } catch (error) {
        console.error('[Electron] Error in metrics background poll:', error);
      }
    }
  }, 500);
}

function stopMetricsPolling() {
  if (metricsInterval) {
    clearInterval(metricsInterval);
    metricsInterval = null;
  }
}

// IPC registration
ipcMain.handle('get-system-metrics', async () => {
  console.log('[Electron] IPC handle get-system-metrics invoked');
  const metrics = await getAllMetrics();
  console.log('[Electron] IPC handle get-system-metrics resolved');
  return metrics;
});

ipcMain.handle('get-system-specs', async () => {
  console.log('[Electron] IPC handle get-system-specs invoked');
  const specs = await getSystemSpecs();
  console.log('[Electron] IPC handle get-system-specs resolved');
  return specs;
});

app.whenReady().then(() => {
  console.log('[Electron] started');
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
