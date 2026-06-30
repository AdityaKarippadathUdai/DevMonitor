import { create } from 'zustand';
import { SystemAllMetrics, SystemSpecs } from '../types';

interface MetricsState {
  specs: SystemSpecs | null;
  currentMetrics: SystemAllMetrics | null;
  history: SystemAllMetrics[];
  activeTab: 'dashboard' | 'cpu' | 'memory' | 'gpu' | 'disk' | 'network' | 'processes';
  theme: 'dark' | 'light';
  isLive: boolean;
  
  setTheme: (theme: 'dark' | 'light') => void;
  setActiveTab: (tab: MetricsState['activeTab']) => void;
  setSpecs: (specs: SystemSpecs) => void;
  addMetrics: (metrics: SystemAllMetrics) => void;
  fetchSpecs: () => Promise<void>;
  startListening: () => () => void; // returns cleanup function
}

export const useMetricsStore = create<MetricsState>((set, get) => ({
  specs: null,
  currentMetrics: null,
  history: [],
  activeTab: 'dashboard',
  theme: 'dark',
  isLive: false,

  setTheme: (theme) => {
    set({ theme });
    // Apply theme class to document body
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },

  setActiveTab: (activeTab) => set({ activeTab }),

  setSpecs: (specs) => set({ specs }),

  addMetrics: (metrics) => set((state) => {
    const newHistory = [...state.history, metrics];
    // Limit to 60 points for a smooth rolling graph representing time
    if (newHistory.length > 60) {
      newHistory.shift();
    }
    return {
      currentMetrics: metrics,
      history: newHistory,
      isLive: true,
    };
  }),

  fetchSpecs: async () => {
    try {
      if (window.electronAPI) {
        const specs = await window.electronAPI.getSystemSpecs();
        set({ specs });
      } else {
        const res = await fetch('/api/specs');
        if (res.ok) {
          const specs = await res.json();
          set({ specs });
        }
      }
    } catch (error) {
      console.error('Failed to fetch system specifications:', error);
    }
  },

  startListening: () => {
    const { addMetrics, fetchSpecs } = get();
    
    // Make sure static specs are loaded first
    fetchSpecs();

    // 1. If Electron IPC is available, subscribe to Electron events
    if (window.electronAPI) {
      console.log('[Store] Subscribing to Electron IPC metrics-update');
      const unsubscribe = window.electronAPI.onMetricsUpdate((metrics) => {
        addMetrics(metrics);
      });
      return () => {
        unsubscribe();
        set({ isLive: false });
      };
    } 
    
    // 2. If running in a web browser preview, subscribe via Server-Sent Events (SSE)
    console.log('[Store] Subscribing to Express SSE /api/metrics/live');
    const eventSource = new EventSource('/api/metrics/live');
    
    eventSource.onmessage = (event) => {
      try {
        const metrics: SystemAllMetrics = JSON.parse(event.data);
        addMetrics(metrics);
      } catch (err) {
        console.error('[Store] Error parsing SSE metrics data:', err);
      }
    };

    eventSource.onerror = (err) => {
      console.error('[Store] SSE connection error. Retrying...', err);
      set({ isLive: false });
    };

    return () => {
      console.log('[Store] Closing SSE connection');
      eventSource.close();
      set({ isLive: false });
    };
  }
}));
