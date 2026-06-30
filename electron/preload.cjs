const { contextBridge, ipcRenderer } = require('electron');

console.log('[Preload] Loading preload bridge');

contextBridge.exposeInMainWorld('electronAPI', {
  getSystemMetrics: () => {
    console.log('[Preload] Renderer requested getSystemMetrics');
    return ipcRenderer.invoke('get-system-metrics');
  },
  getSystemSpecs: () => {
    console.log('[Preload] Renderer requested getSystemSpecs');
    return ipcRenderer.invoke('get-system-specs');
  },
  onMetricsUpdate: (callback) => {
    console.log('[Preload] Renderer subscribed to metrics-update');
    const listener = (_event, metrics) => {
      console.log('[Preload] metrics-update received by preload bridge');
      callback(metrics);
    };
    ipcRenderer.on('metrics-update', listener);
    return () => ipcRenderer.removeListener('metrics-update', listener);
  },
});

console.log('[Preload] ContextBridge exposed');
