import React from 'react';
import { useMetricsStore } from '../store/useMetricsStore';
import { getChartColorsByMode, ChartColors } from '../utils/colorModes';
import { Layers, Database, ShieldAlert, Cpu } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface MemoryChartProps {
  data: any[];
  isDark: boolean;
  totalGB: number;
  colors: ChartColors;
}

const MemoryChart: React.FC<MemoryChartProps> = ({ data, isDark, totalGB, colors }) => {
  const maxDomain = Math.ceil(totalGB) || 16;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const used = payload.find((p: any) => p.name === 'Active')?.value || 0;
      const cached = payload.find((p: any) => p.name === 'Cache')?.value || 0;
      const buffers = payload.find((p: any) => p.name === 'Buffers')?.value || 0;
      const totalAllocated = (used + cached + buffers).toFixed(2);

      return (
        <div className={`p-3 rounded-xl border text-xs shadow-lg space-y-1.5 font-mono ${
          isDark
            ? 'bg-slate-950/95 border-slate-800 text-slate-100'
            : 'bg-white/95 border-slate-200 text-slate-900'
        }`}>
          <div className="font-semibold text-[10px] text-slate-400 uppercase tracking-wider mb-1">
            Memory Allocation Composition
          </div>
          <div className="flex justify-between gap-8">
            <span className="flex items-center gap-1.5" style={{ color: colors.mem }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.mem }}></span>
              Active Used:
            </span>
            <span className="font-bold">{used.toFixed(2)} GB</span>
          </div>
          <div className="flex justify-between gap-8">
            <span className="flex items-center gap-1.5" style={{ color: colors.cache }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.cache }}></span>
              Caches:
            </span>
            <span className="font-bold">{cached.toFixed(2)} GB</span>
          </div>
          <div className="flex justify-between gap-8 pb-1.5 border-b border-slate-800/10">
            <span className="flex items-center gap-1.5" style={{ color: colors.buffers }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.buffers }}></span>
              Buffers:
            </span>
            <span className="font-bold">{buffers.toFixed(2)} GB</span>
          </div>
          <div className="flex justify-between gap-8 pt-0.5">
            <span className="text-slate-400">Combined:</span>
            <span className="font-bold text-emerald-400">{totalAllocated} / {totalGB.toFixed(2)} GB</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: '100%', height: 220 }} className="relative">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
        >
          <defs>
            <linearGradient id="gradient-used" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors.mem} stopOpacity={0.4} />
              <stop offset="95%" stopColor={colors.mem} stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="gradient-cached" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors.cache} stopOpacity={0.4} />
              <stop offset="95%" stopColor={colors.cache} stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="gradient-buffers" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors.buffers} stopOpacity={0.4} />
              <stop offset="95%" stopColor={colors.buffers} stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke={isDark ? 'rgba(51, 65, 85, 0.15)' : 'rgba(226, 232, 240, 0.4)'}
          />
          <XAxis
            dataKey="timeLabel"
            hide
          />
          <YAxis
            domain={[0, maxDomain]}
            tick={{ fontSize: 10, fill: isDark ? '#94a3b8' : '#64748b', fontFamily: 'monospace' }}
            stroke="transparent"
            width={35}
            unit="G"
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="active"
            stackId="1"
            stroke={colors.mem}
            strokeWidth={1.5}
            fillOpacity={1}
            fill="url(#gradient-used)"
            name="Active"
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="cached"
            stackId="1"
            stroke={colors.cache}
            strokeWidth={1.5}
            fillOpacity={1}
            fill="url(#gradient-cached)"
            name="Cache"
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="buffers"
            stackId="1"
            stroke={colors.buffers}
            strokeWidth={1.5}
            fillOpacity={1}
            fill="url(#gradient-buffers)"
            name="Buffers"
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export const Memory: React.FC = () => {
  const { currentMetrics, history, theme, colorMode } = useMetricsStore();
  const isDark = theme === 'dark';
  const colors = getChartColorsByMode(colorMode);

  if (!currentMetrics) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
        <p className="text-sm font-mono text-slate-400">Inspecting RAM registers...</p>
      </div>
    );
  }

  // Format Bytes into GB
  const formatGB = (bytes: number) => {
    return (bytes / (1024 ** 3)).toFixed(2);
  };

  const chartData = history.map((m) => {
    const time = new Date(m.timestamp);
    const timeLabel = `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}:${time.getSeconds().toString().padStart(2, '0')}`;
    return {
      timeLabel,
      active: (m.memory?.active || 0) / (1024 ** 3),
      cached: (m.memory?.cached || 0) / (1024 ** 3),
      buffers: (m.memory?.buffers || 0) / (1024 ** 3),
    };
  });

  const mem = currentMetrics.memory;

  // Safe division check
  const activeGB = formatGB(mem?.active || 0);
  const totalGB = formatGB(mem?.total || 0);
  const usedGB = formatGB(mem?.used || 0);
  const freeGB = formatGB(mem?.free || 0);
  const cachedGB = formatGB(mem?.cached || 0);
  const buffersGB = formatGB(mem?.buffers || 0);
  const availableGB = formatGB(mem?.available || 0);
  const swapUsedGB = formatGB(mem?.swapUsed || 0);
  const swapTotalGB = formatGB(mem?.swapTotal || 0);

  const swapPercentage = (mem?.swapTotal || 0) > 0 ? ((mem?.swapUsed || 0) / (mem?.swapTotal || 1)) * 100 : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">System Memory (RAM)</h2>
        <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Track volatile primary RAM caches, page files, buffers, and virtual swap limits.
        </p>
      </div>

      {/* Primary stats layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline Chart */}
        <div className={`lg:col-span-2 rounded-2xl border p-5 ${
          isDark ? 'bg-slate-900/40 border-slate-800/80 shadow-lg' : 'bg-white border-slate-200 shadow-md'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="font-semibold text-sm">Memory Allocation (60 seconds)</h3>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-[10px] font-mono text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.mem }}></span>
                  Active Process ({activeGB} GB)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.cache }}></span>
                  Cache Blocks ({cachedGB} GB)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.buffers }}></span>
                  Kern Buffers ({buffersGB} GB)
                </span>
              </div>
            </div>
            <span 
              className="self-start sm:self-center text-xs font-mono font-bold px-2 py-0.5 rounded-full border"
              style={{ color: colors.mem, backgroundColor: `${colors.mem}10`, borderColor: `${colors.mem}30` }}
            >
              {(mem?.percentage || 0).toFixed(1)}% Used
            </span>
          </div>

          <MemoryChart 
            data={chartData} 
            isDark={isDark} 
            totalGB={(mem?.total || 0) / (1024 ** 3)} 
            colors={colors}
          />
        </div>

        {/* Diagnostic details */}
        <div className={`rounded-2xl border p-5 flex flex-col justify-between ${
          isDark ? 'bg-slate-900/40 border-slate-800/80 shadow-lg' : 'bg-white border-slate-200 shadow-md'
        }`}>
          <div>
            <h3 className="font-semibold text-sm mb-4">Usage Summary</h3>
            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between border-b border-slate-800/10 pb-1.5">
                <span className="text-slate-500">Active (Processes):</span>
                <span className="font-bold" style={{ color: colors.mem }}>{activeGB} GB</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/10 pb-1.5">
                <span className="text-slate-500">Cache Blocks:</span>
                <span className="font-semibold" style={{ color: colors.cache }}>{cachedGB} GB</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/10 pb-1.5">
                <span className="text-slate-500">Buffers:</span>
                <span className="font-semibold" style={{ color: colors.buffers }}>{buffersGB} GB</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/10 pb-1.5">
                <span className="text-slate-500">Available (Freeable):</span>
                <span className="font-semibold text-emerald-400">{availableGB} GB</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/10 pb-1.5">
                <span className="text-slate-500">Free Space:</span>
                <span className="font-semibold">{freeGB} GB</span>
              </div>
              <div className="flex justify-between pb-1">
                <span className="text-slate-500">Total System RAM:</span>
                <span className="font-bold">{totalGB} GB</span>
              </div>
            </div>
          </div>

          <div className={`mt-4 p-3 rounded-xl border flex items-center gap-3 ${
            isDark ? 'bg-slate-950/40 border-slate-800/60' : 'bg-slate-50 border-slate-200'
          }`}>
            <Database className="w-5 h-5 shrink-0" style={{ color: colors.mem }} />
            <div className="text-[10px] leading-relaxed">
              <span className="font-semibold text-slate-400">Paging Engine: </span>
              {(mem?.percentage || 0) > 85 ? (
                <span className="text-rose-400 font-bold">Swap cache overload warning</span>
              ) : (
                <span className="text-emerald-400 font-bold">Stable physical caching bounds</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Segmented Allocation Visual Progress and Swap monitoring */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Memory Bar Segment Graph */}
        <div className={`rounded-2xl border p-5 ${
          isDark ? 'bg-slate-900/40 border-slate-800/80 shadow-lg' : 'bg-white border-slate-200 shadow-md'
        }`}>
          <h3 className="font-semibold text-sm mb-4">Memory Allocation Segments</h3>
          
          <div className="space-y-4">
            {/* Horizontal Stack Bar */}
            <div className="h-6 rounded-full overflow-hidden flex bg-slate-800 font-mono text-[9px] text-white">
              <div 
                className="flex items-center justify-center font-bold" 
                style={{ 
                  width: `${(mem?.total || 0) > 0 ? ((mem?.active || 0) / (mem?.total || 1)) * 100 : 0}%`,
                  backgroundColor: colors.mem
                }}
                title={`Active Processes RAM: ${activeGB} GB`}
              >
                {(mem?.total || 0) > 0 && ((mem?.active || 0) / (mem?.total || 1)) * 100 > 12 && 'ACTIVE'}
              </div>
              <div 
                className="flex items-center justify-center font-bold" 
                style={{ 
                  width: `${(mem?.total || 0) > 0 ? ((mem?.cached || 0) / (mem?.total || 1)) * 100 : 0}%`,
                  backgroundColor: colors.cache
                }}
                title={`Cached Memory: ${cachedGB} GB`}
              >
                {(mem?.total || 0) > 0 && ((mem?.cached || 0) / (mem?.total || 1)) * 100 > 12 && 'CACHE'}
              </div>
              <div 
                className="flex items-center justify-center font-bold" 
                style={{ 
                  width: `${(mem?.total || 0) > 0 ? ((mem?.buffers || 0) / (mem?.total || 1)) * 100 : 0}%`,
                  backgroundColor: colors.buffers
                }}
                title={`Buffers: ${buffersGB} GB`}
              >
                {(mem?.total || 0) > 0 && ((mem?.buffers || 0) / (mem?.total || 1)) * 100 > 12 && 'BUFFERS'}
              </div>
              <div 
                className="bg-emerald-500 flex items-center justify-center font-bold text-slate-900" 
                style={{ width: `${(mem?.total || 0) > 0 ? ((mem?.free || 0) / (mem?.total || 1)) * 100 : 0}%` }}
                title={`Free Memory: ${freeGB} GB`}
              >
                {(mem?.total || 0) > 0 && ((mem?.free || 0) / (mem?.total || 1)) * 100 > 12 && 'FREE'}
              </div>
            </div>

            {/* Segment legend */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span>
                <span>Active Process ({activeGB} GB)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                <span>Caches ({cachedGB} GB)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span>
                <span>Buffers ({buffersGB} GB)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span>Pure Free ({freeGB} GB)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Swap File Virtual Memory Allocation */}
        <div className={`rounded-2xl border p-5 ${
          isDark ? 'bg-slate-900/40 border-slate-800/80 shadow-lg' : 'bg-white border-slate-200 shadow-md'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm">Swap Virtual Page File</h3>
            <span className="text-xs font-mono text-indigo-400 font-bold bg-indigo-950/20 px-2 py-0.5 rounded-full">
              {swapPercentage.toFixed(1)}% Used
            </span>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Page File Allocated:</span>
                <span>{swapUsedGB} GB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Page File Size:</span>
                <span>{swapTotalGB} GB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Virtual Swap Remaining:</span>
                <span className="font-bold text-indigo-400">{(Number(swapTotalGB) - Number(swapUsedGB)).toFixed(2)} GB</span>
              </div>
            </div>

            {/* Swap indicator */}
            <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-pink-500 transition-all duration-300"
                style={{ width: `${swapPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
