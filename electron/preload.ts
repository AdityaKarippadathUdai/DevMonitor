import { contextBridge, ipcRenderer } from 'electron';
import { SystemAllMetrics, SystemSpecs } from '../src/types';

contextBridge.exposeInMainWorld('electronAPI', {
  getSystemMetrics: (): Promise<SystemAllMetrics> => ipcRenderer.invoke('get-system-metrics'),
  getSystemSpecs: (): Promise<SystemSpecs> => ipcRenderer.invoke('get-system-specs'),
  
  onMetricsUpdate: (callback: (metrics: SystemAllMetrics) => void) => {
    const listener = (_event: any, metrics: SystemAllMetrics) => callback(metrics);
    ipcRenderer.on('metrics-update', listener);
    
    // Return unsubscribe function
    return () => {
      ipcRenderer.removeListener('metrics-update', listener);
    };
  }
});
