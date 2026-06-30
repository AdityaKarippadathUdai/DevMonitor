import { create } from 'zustand';
import type { SystemAllMetrics, SystemSpecs } from '../../shared/types';
import { COLOR_MODES } from '../utils/colorModes';

export interface GlassmorphismSettings {
  blurIntensity: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  baseTintColor: 'slate' | 'indigo' | 'emerald' | 'amber' | 'rose' | 'cyan' | 'zinc' | 'violet' | 'fuchsia';
  tintOpacity: number;
  borderStrength: 'none' | 'subtle' | 'medium' | 'strong';
  glowEffect: boolean;
}

const defaultGlassSettings: GlassmorphismSettings = {
  blurIntensity: 'md',
  baseTintColor: 'slate',
  tintOpacity: 0.25,
  borderStrength: 'medium',
  glowEffect: true,
};

interface MetricsState {
  specs: SystemSpecs | null;
  currentMetrics: SystemAllMetrics | null;
  history: SystemAllMetrics[];
  activeTab: 'dashboard' | 'cpu' | 'memory' | 'gpu' | 'disk' | 'network' | 'processes';
  theme: 'dark' | 'light';
  isLive: boolean;
  glassSettings: GlassmorphismSettings;
  miniModeActive: boolean;
  colorMode: string;
  
  setTheme: (theme: 'dark' | 'light') => void;
  setActiveTab: (tab: MetricsState['activeTab']) => void;
  setSpecs: (specs: SystemSpecs) => void;
  addMetrics: (metrics: SystemAllMetrics) => void;
  fetchSpecs: () => Promise<void>;
  startListening: () => () => void; // returns cleanup function
  updateGlassSettings: (settings: Partial<GlassmorphismSettings>) => void;
  setMiniModeActive: (active: boolean) => void;
  setColorMode: (modeId: string) => void;
}

const loadColorMode = (): string => {
  try {
    const saved = localStorage.getItem('color-mode');
    return saved || 'standard';
  } catch (e) {
    return 'standard';
  }
};

const loadTheme = (): 'dark' | 'light' => {
  try {
    const savedColorMode = localStorage.getItem('color-mode');
    if (savedColorMode) {
      const preset = COLOR_MODES.find(m => m.id === savedColorMode);
      if (preset && preset.theme) {
        return preset.theme;
      }
    }
  } catch (e) {
    console.error('Failed to load initial theme', e);
  }
  return 'dark';
};

const initialTheme = loadTheme();
if (typeof window !== 'undefined') {
  if (initialTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

// Helper to load settings from localStorage safely
const loadGlassSettings = (): GlassmorphismSettings => {
  try {
    const saved = localStorage.getItem('glass-settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...defaultGlassSettings, ...parsed };
    }
  } catch (e) {
    console.error('Failed to parse saved glassmorphism settings:', e);
  }
  return defaultGlassSettings;
};

let hasStartedListening = false;

export const useMetricsStore = create<MetricsState>((set, get) => ({
  specs: null,
  currentMetrics: null,
  history: [],
  activeTab: 'dashboard',
  theme: loadTheme(),
  isLive: false,
  glassSettings: loadGlassSettings(),
  miniModeActive: false,
  colorMode: loadColorMode(),

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

  setMiniModeActive: (miniModeActive) => set({ miniModeActive }),

  setColorMode: (colorMode) => {
    const preset = COLOR_MODES.find(m => m.id === colorMode);
    if (preset) {
      set({ colorMode });
      try {
        localStorage.setItem('color-mode', colorMode);
      } catch (e) {
        console.error('Failed to save color-mode to local storage', e);
      }
      
      // Update glass settings
      if (preset.glassSettings) {
        get().updateGlassSettings(preset.glassSettings);
      }
      
      // Update theme if defined
      if (preset.theme) {
        get().setTheme(preset.theme);
      }
    }
  },

  updateGlassSettings: (settings) => {
    set((state) => {
      const newSettings = { ...state.glassSettings, ...settings };
      try {
        localStorage.setItem('glass-settings', JSON.stringify(newSettings));
      } catch (e) {
        console.error('Failed to save glassmorphism settings:', e);
      }
      return { glassSettings: newSettings };
    });
  },

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
      if (!window.electronAPI) {
        return;
      }

      console.log('[Store] Requesting system specs from Electron');
      const specs = await window.electronAPI.getSystemSpecs();
      set({ specs });
    } catch (error) {
      console.error('Failed to fetch system specifications:', error);
    }
  },

  startListening: () => {
    if (hasStartedListening) {
      return () => undefined;
    }

    hasStartedListening = true;

    const { addMetrics, fetchSpecs } = get();

    void fetchSpecs();

    if (!window.electronAPI) {
      set({ isLive: false });
      return () => undefined;
    }

    console.log('[Store] Subscribing to Electron IPC metrics-update');
    const unsubscribe = window.electronAPI.onMetricsUpdate((metrics) => {
      console.log('[Store] Received metrics-update event', metrics?.timestamp);
      addMetrics(metrics);
    });

    void window.electronAPI.getSystemMetrics()
      .then((metrics) => {
        console.log('[Store] Received initial metrics snapshot', metrics?.timestamp);
        addMetrics(metrics);
      })
      .catch((error) => {
        console.error('[Store] Failed to fetch initial system metrics:', error);
      });

    return () => {
      hasStartedListening = false;
      unsubscribe();
      set({ isLive: false });
    };
  }
}));
