import React, { useState } from 'react';
import { useMetricsStore } from '../../store/useMetricsStore';
import { SettingsDrawer } from './SettingsDrawer';
import { 
  LayoutDashboard, 
  Cpu, 
  HardDrive, 
  Network, 
  ListRestart, 
  Settings, 
  Sun, 
  Moon,
  Laptop,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { activeTab, setActiveTab, theme, setTheme, currentMetrics, isLive, specs } = useMetricsStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const formatUptime = (seconds: number) => {
    if (!seconds) return '0s';
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    const parts = [];
    if (d > 0) parts.push(`${d}d`);
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    if (s > 0 || parts.length === 0) parts.push(`${s}s`);
    return parts.join(' ');
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'cpu', label: 'CPU', icon: Cpu },
    { id: 'memory', label: 'Memory', icon: Laptop },
    { id: 'gpu', label: 'GPU', icon: Cpu }, // GPU uses CPU or alternative icon
    { id: 'disk', label: 'Disk Storage', icon: HardDrive },
    { id: 'network', label: 'Network', icon: Network },
    { id: 'processes', label: 'Processes', icon: ListRestart },
  ] as const;

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen font-sans flex flex-col transition-colors duration-300 ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Top Header */}
      <header className={`sticky top-0 z-40 border-b backdrop-blur-md px-6 py-4 flex items-center justify-between ${
        isDark 
          ? 'bg-slate-900/60 border-slate-800/80 shadow-slate-950/20 shadow-md' 
          : 'bg-white/60 border-slate-200/80 shadow-slate-100/20 shadow-md'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">System Monitor</h1>
            {specs ? (
              <p className={`text-[10px] font-mono leading-none mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {specs.hostname} • {specs.distro} ({specs.arch})
              </p>
            ) : (
              <p className="text-[10px] font-mono animate-pulse">Scanning system hardware...</p>
            )}
          </div>
        </div>

        {/* System Specs and Controls */}
        <div className="flex items-center gap-4">
          {/* Connection Badge */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
            isLive 
              ? isDark ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-600'
              : isDark ? 'bg-amber-950/30 border-amber-800/40 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-600'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`}></span>
            {isLive ? 'Live Stream' : 'Disconnected'}
          </div>

          {/* Theme Switcher */}
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className={`p-2 rounded-xl border transition-all hover:scale-105 active:scale-95 cursor-pointer ${
              isDark 
                ? 'bg-slate-800/50 border-slate-700/60 text-yellow-400 hover:bg-slate-800' 
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Aesthetic Controls Button */}
          <button
            onClick={() => setSettingsOpen(true)}
            className={`p-2 rounded-xl border transition-all hover:scale-105 active:scale-95 cursor-pointer ${
              isDark 
                ? 'bg-slate-800/50 border-slate-700/60 text-indigo-400 hover:bg-slate-800 hover:text-indigo-300 shadow-sm' 
                : 'bg-white border-slate-200 text-indigo-600 hover:bg-slate-100 hover:text-indigo-700 shadow-sm'
            }`}
            title="Aesthetics Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Sidebar Navigation */}
        <aside className={`w-full md:w-64 md:border-r border-slate-800/20 flex flex-col p-4 gap-2 shrink-0 ${
          isDark ? 'bg-slate-900/20' : 'bg-slate-100/10'
        }`}>
          {/* Tabs */}
          <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 scrollbar-none">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              // Set tab color styles based on focus
              let activeColorClass = '';
              if (isActive) {
                if (isDark) {
                  activeColorClass = 'bg-slate-800/80 border-slate-700 text-cyan-400 shadow-sm';
                } else {
                  activeColorClass = 'bg-white border-slate-200 text-cyan-600 shadow-sm';
                }
              } else {
                if (isDark) {
                  activeColorClass = 'border-transparent text-slate-400 hover:text-slate-100 hover:bg-slate-850/50';
                } else {
                  activeColorClass = 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/60';
                }
              }

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200 cursor-pointer text-left whitespace-nowrap md:w-full ${activeColorClass}`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'scale-110' : ''}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Primary Page Canvas */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
      <SettingsDrawer isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
};
