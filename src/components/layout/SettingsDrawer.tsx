import React from 'react';
import { useMetricsStore, GlassmorphismSettings } from '../../store/useMetricsStore';
import { COLOR_MODES } from '../../utils/colorModes';
import { X, Sliders, Sparkles, Layers, Palette, Check, RotateCcw } from 'lucide-react';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const TINTS = [
  { id: 'slate', name: 'Slate', color: 'bg-slate-500' },
  { id: 'indigo', name: 'Indigo', color: 'bg-indigo-500' },
  { id: 'emerald', name: 'Emerald', color: 'bg-emerald-500' },
  { id: 'amber', name: 'Amber', color: 'bg-amber-500' },
  { id: 'rose', name: 'Rose', color: 'bg-rose-500' },
  { id: 'cyan', name: 'Cyan', color: 'bg-cyan-500' },
  { id: 'zinc', name: 'Zinc', color: 'bg-zinc-500' },
  { id: 'violet', name: 'Violet', color: 'bg-violet-500' },
  { id: 'fuchsia', name: 'Fuchsia', color: 'bg-fuchsia-500' },
];

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({ isOpen, onClose }) => {
  const { theme, glassSettings, updateGlassSettings, colorMode, setColorMode } = useMetricsStore();
  const isDark = theme === 'dark';

  if (!isOpen) return null;

  const handleReset = () => {
    setColorMode('standard');
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Panel */}
      <div className={`fixed right-0 top-0 bottom-0 z-50 w-full max-w-md p-6 flex flex-col justify-between border-l shadow-2xl transition-all duration-300 transform translate-x-0 ${
        isDark 
          ? 'bg-slate-950/95 border-slate-800 text-slate-100' 
          : 'bg-white/95 border-slate-200 text-slate-900'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/10">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-500" />
            <div>
              <h2 className="text-base font-bold tracking-tight">Cosmetic Aesthetics</h2>
              <p className={`text-[10px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Configure glassmorphism & visual engines
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className={`p-1.5 rounded-lg border cursor-pointer hover:scale-105 active:scale-95 transition-all ${
              isDark ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-900'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable controls */}
        <div className="flex-1 overflow-y-auto py-5 space-y-6 pr-1 scrollbar-thin">
          
          {/* Quick Presets */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Theme Preset Bundles</span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {COLOR_MODES.map((preset) => {
                const isActive = colorMode === preset.id;

                return (
                  <button
                    key={preset.id}
                    onClick={() => setColorMode(preset.id)}
                    className={`p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                      isActive
                        ? isDark 
                          ? 'bg-indigo-950/30 border-indigo-500 text-indigo-300 ring-1 ring-indigo-500'
                          : 'bg-indigo-50 border-indigo-400 text-indigo-900 ring-1 ring-indigo-400'
                        : isDark
                          ? 'bg-slate-900/40 border-slate-800 hover:bg-slate-900 hover:border-slate-750'
                          : 'bg-slate-50 border-slate-100 hover:bg-slate-100/60 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">{preset.name}</span>
                      {isActive && <Check className="w-3.5 h-3.5 text-indigo-500" />}
                    </div>
                    <p className={`text-[10px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {preset.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Tint swatch grid */}
          <div className="space-y-3 border-t border-slate-800/10 pt-5">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <Palette className="w-3.5 h-3.5 text-cyan-400" />
              <span>Base Color Tint Overlay</span>
            </div>
            <div className="grid grid-cols-5 gap-2.5">
              {TINTS.map((tint) => {
                const isSelected = glassSettings.baseTintColor === tint.id;
                return (
                  <button
                    key={tint.id}
                    onClick={() => updateGlassSettings({ baseTintColor: tint.id as any })}
                    className="flex flex-col items-center gap-1.5 focus:outline-none group cursor-pointer"
                    title={tint.name}
                  >
                    <div className={`w-8 h-8 rounded-full ${tint.color} relative flex items-center justify-center transition-transform hover:scale-110 active:scale-95 shadow-md ${
                      isSelected ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-slate-950' : ''
                    }`}>
                      {isSelected && <Check className="w-4 h-4 text-white drop-shadow-md" />}
                    </div>
                    <span className="text-[9px] font-mono text-slate-400 group-hover:text-slate-200 transition-colors">
                      {tint.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tint Opacity slider */}
          <div className="space-y-3 border-t border-slate-800/10 pt-5">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <Sliders className="w-3.5 h-3.5 text-pink-500" />
                <span>Glass Tint Opacity</span>
              </div>
              <span className="font-mono text-xs font-bold text-pink-400">
                {Math.round(glassSettings.tintOpacity * 100)}%
              </span>
            </div>
            <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Determines how saturated the translucent background overlay is.
            </p>
            <input
              type="range"
              min="0.05"
              max="0.60"
              step="0.05"
              value={glassSettings.tintOpacity}
              onChange={(e) => updateGlassSettings({ tintOpacity: parseFloat(e.target.value) })}
              className="w-full accent-pink-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Blur Intensity segmented picker */}
          <div className="space-y-3 border-t border-slate-800/10 pt-5">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>Backdrop Blur Intensity</span>
            </div>
            <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Controls hardware-accelerated filter opacity to blur underlying content.
            </p>
            <div className={`grid grid-cols-5 gap-1 p-1 rounded-xl text-center text-[10px] font-mono ${
              isDark ? 'bg-slate-900' : 'bg-slate-100'
            }`}>
              {(['none', 'sm', 'md', 'lg', 'xl'] as const).map((intensity) => {
                const isActive = glassSettings.blurIntensity === intensity;
                return (
                  <button
                    key={intensity}
                    onClick={() => updateGlassSettings({ blurIntensity: intensity })}
                    className={`py-1.5 rounded-lg capitalize font-semibold cursor-pointer transition-all ${
                      isActive
                        ? isDark 
                          ? 'bg-slate-850 text-cyan-400 shadow-sm'
                          : 'bg-white text-cyan-600 shadow-sm'
                        : 'text-slate-500 hover:text-slate-400'
                    }`}
                  >
                    {intensity}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Border Strength segmented picker */}
          <div className="space-y-3 border-t border-slate-800/10 pt-5">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <span className="w-3.5 h-3.5 border border-slate-400 rounded flex items-center justify-center text-[8px] font-bold">B</span>
              <span>Border Ring Strength</span>
            </div>
            <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Sets the outer layout ring opacity to isolate card panels.
            </p>
            <div className={`grid grid-cols-4 gap-1 p-1 rounded-xl text-center text-[10px] font-mono ${
              isDark ? 'bg-slate-900' : 'bg-slate-100'
            }`}>
              {(['none', 'subtle', 'medium', 'strong'] as const).map((strength) => {
                const isActive = glassSettings.borderStrength === strength;
                return (
                  <button
                    key={strength}
                    onClick={() => updateGlassSettings({ borderStrength: strength })}
                    className={`py-1.5 rounded-lg capitalize font-semibold cursor-pointer transition-all ${
                      isActive
                        ? isDark 
                          ? 'bg-slate-850 text-cyan-400 shadow-sm'
                          : 'bg-white text-cyan-600 shadow-sm'
                        : 'text-slate-500 hover:text-slate-400'
                    }`}
                  >
                    {strength}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Glow Shadow Toggle */}
          <div className="flex items-center justify-between border-t border-slate-800/10 pt-5">
            <div className="space-y-0.5 pr-4">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <span className="w-3.5 h-3.5 rounded-full bg-indigo-500/20 ring-1 ring-indigo-500 flex items-center justify-center text-[8px] font-bold">G</span>
                <span>Active Shadow Glow</span>
              </div>
              <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Blends colorized ambient back-lighting matching your selected color tint.
              </p>
            </div>
            <button
              onClick={() => updateGlassSettings({ glowEffect: !glassSettings.glowEffect })}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                glassSettings.glowEffect ? 'bg-indigo-500' : 'bg-slate-800'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  glassSettings.glowEffect ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

        </div>

        {/* Footer actions */}
        <div className="pt-4 border-t border-slate-800/10 flex gap-3">
          <button
            onClick={handleReset}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl border text-xs font-semibold cursor-pointer transition-all hover:bg-slate-100/10 active:scale-95 ${
              isDark ? 'border-slate-800 text-slate-300 hover:text-white' : 'border-slate-200 text-slate-600 hover:text-slate-950'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer active:scale-95 transition-all text-center"
          >
            Apply Changes
          </button>
        </div>
      </div>
    </>
  );
};
