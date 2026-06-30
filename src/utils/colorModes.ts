import { GlassmorphismSettings } from '../store/useMetricsStore';

export interface ChartColors {
  cpu: string;
  mem: string;
  cache: string;
  buffers: string;
  gpu: string;
  disk: string;
  network: string;
}

export interface ColorModePreset {
  id: string;
  name: string;
  description: string;
  theme: 'dark' | 'light';
  glassSettings: Partial<GlassmorphismSettings>;
  chartColors: ChartColors;
}

export const COLOR_MODES: ColorModePreset[] = [
  {
    id: 'standard',
    name: 'Standard Slate',
    description: 'Modern slate-colored glass with classic diagnostic colors',
    theme: 'dark',
    glassSettings: {
      blurIntensity: 'md',
      baseTintColor: 'slate',
      tintOpacity: 0.25,
      borderStrength: 'medium',
      glowEffect: true,
    },
    chartColors: {
      cpu: '#22d3ee',     // Cyan
      mem: '#ec4899',     // Pink
      cache: '#6366f1',   // Indigo
      buffers: '#c084fc', // Purple
      gpu: '#10b981',     // Emerald
      disk: '#f59e0b',     // Amber
      network: '#3b82f6', // Blue
    },
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    description: 'Vibrant fuchsia glass with heavy-contrast neon highlights',
    theme: 'dark',
    glassSettings: {
      blurIntensity: 'lg',
      baseTintColor: 'fuchsia',
      tintOpacity: 0.35,
      borderStrength: 'strong',
      glowEffect: true,
    },
    chartColors: {
      cpu: '#06b6d4',     // Bright Cyan
      mem: '#ff007f',     // Neon Rose / Red-Pink
      cache: '#f43f5e',   // Neon Rose
      buffers: '#d946ef', // Neon Purple/Fuchsia
      gpu: '#10b981',     // Emerald Green
      disk: '#fbbf24',     // Gold Yellow
      network: '#ec4899', // Hot Pink
    },
  },
  {
    id: 'midnight',
    name: 'Stealth Midnight',
    description: 'Deep zinc-tinted matte with soothing, muted ambient colors',
    theme: 'dark',
    glassSettings: {
      blurIntensity: 'xl',
      baseTintColor: 'zinc',
      tintOpacity: 0.15,
      borderStrength: 'subtle',
      glowEffect: false,
    },
    chartColors: {
      cpu: '#818cf8',     // Soft Indigo
      mem: '#fb7185',     // Soft Rose
      cache: '#a78bfa',   // Soft Purple
      buffers: '#f472b6', // Soft Pink
      gpu: '#34d399',     // Soft Mint Green
      disk: '#fbbf24',     // Muted Amber
      network: '#60a5fa', // Soft Blue
    },
  },
  {
    id: 'emerald-glow',
    name: 'Hacker Matrix',
    description: 'Terminal-inspired emerald glass with radioactive green scales',
    theme: 'dark',
    glassSettings: {
      blurIntensity: 'md',
      baseTintColor: 'emerald',
      tintOpacity: 0.30,
      borderStrength: 'strong',
      glowEffect: true,
    },
    chartColors: {
      cpu: '#10b981',     // Active Green
      mem: '#34d399',     // Mint Green
      cache: '#059669',   // Deep Emerald
      buffers: '#6ee7b7', // Light green
      gpu: '#047857',     // Dark Emerald
      disk: '#84cc16',     // Lime
      network: '#06b6d4', // Cyan
    },
  },
  {
    id: 'soft-light',
    name: 'Light Cream',
    description: 'A clean, high-contrast light layout with warm rose accents',
    theme: 'light',
    glassSettings: {
      blurIntensity: 'md',
      baseTintColor: 'rose',
      tintOpacity: 0.15,
      borderStrength: 'medium',
      glowEffect: true,
    },
    chartColors: {
      cpu: '#0d9488',     // Teal
      mem: '#db2777',     // Deep Pink
      cache: '#4f46e5',   // Indigo
      buffers: '#7c3aed', // Purple
      gpu: '#059669',     // Emerald
      disk: '#b45309',     // Warm Amber/Brown
      network: '#2563eb', // Blue
    },
  },
  {
    id: 'crystal-ice',
    name: 'Crystal Ice',
    description: 'Ultra-blurred cyan glass with frosted Arctic blue charts',
    theme: 'light',
    glassSettings: {
      blurIntensity: 'xl',
      baseTintColor: 'cyan',
      tintOpacity: 0.12,
      borderStrength: 'subtle',
      glowEffect: true,
    },
    chartColors: {
      cpu: '#0284c7',     // Sky Blue
      mem: '#0891b2',     // Cyan
      cache: '#2563eb',   // Indigo
      buffers: '#3b82f6', // Bright Blue
      gpu: '#0d9488',     // Teal
      disk: '#ca8a04',     // Dark Amber
      network: '#db2777', // Rose Pink
    },
  },
];

export const getChartColorsByMode = (modeId: string): ChartColors => {
  const mode = COLOR_MODES.find(m => m.id === modeId) || COLOR_MODES[0];
  return mode.chartColors;
};
