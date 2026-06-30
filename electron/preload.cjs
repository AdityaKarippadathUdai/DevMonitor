const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getSystemMetrics: () => ipcRenderer.invoke('get-system-metrics'),
  getSystemSpecs: () => ipcRenderer.invoke('get-system-specs'),
  onMetricsUpdate: (callback) => {
    const listener = (_event, metrics) => callback(metrics);
    ipcRenderer.on('metrics-update', listener);
    return () => ipcRenderer.removeListener('metrics-update', listener);
  },
});
