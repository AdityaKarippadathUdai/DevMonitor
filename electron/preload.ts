import { contextBridge, ipcRenderer } from 'electron';
import type { SystemAllMetrics, SystemSpecs } from '../shared/types.js';

console.log('[Preload] Loading preload bridge');

contextBridge.exposeInMainWorld('electronAPI', {
  getSystemMetrics: (): Promise<SystemAllMetrics> => {
    console.log('[Preload] Renderer requested getSystemMetrics');
    return ipcRenderer.invoke('get-system-metrics');
  },
  getSystemSpecs: (): Promise<SystemSpecs> => {
    console.log('[Preload] Renderer requested getSystemSpecs');
    return ipcRenderer.invoke('get-system-specs');
  },

  onMetricsUpdate: (callback: (metrics: SystemAllMetrics) => void) => {
    console.log('[Preload] Renderer subscribed to metrics-update');
    const listener = (_event: unknown, metrics: SystemAllMetrics) => {
      console.log('[Preload] metrics-update received by preload bridge');
      callback(metrics);
    };

    ipcRenderer.on('metrics-update', listener);

    return () => {
      ipcRenderer.removeListener('metrics-update', listener);
    };
  },
});

console.log('[Preload] ContextBridge exposed');
