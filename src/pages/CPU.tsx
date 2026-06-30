import React, { useState } from 'react';
import { useMetricsStore } from '../store/useMetricsStore';
import { MetricsChart } from '../components/graphs/MetricsChart';
import { getChartColorsByMode } from '../utils/colorModes';
import { Cpu, Terminal, Search, Flame, Server } from 'lucide-react';

export const CPU: React.FC = () => {
  const { currentMetrics, history, theme, colorMode } = useMetricsStore();
  const [filterQuery, setFilterQuery] = useState('');
  const isDark = theme === 'dark';
  const colors = getChartColorsByMode(colorMode);

  if (!currentMetrics) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
        <p className="text-sm font-mono text-slate-400">Loading processor parameters...</p>
      </div>
    );
  }

  // Map history to CPU load points
  const chartData = history.map((m) => {
    const time = new Date(m.timestamp || Date.now());
    const timeLabel = `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}:${time.getSeconds().toString().padStart(2, '0')}`;
    return {
      timeLabel,
      cpu: m.cpu?.usage || 0,
    };
  });

  const cpu = currentMetrics.cpu;
  const processes = cpu?.processes || [];

  // Filter processes
  const filteredProcesses = processes.filter((proc) => {
    const name = proc.name || '';
    const pid = proc.pid !== undefined && proc.pid !== null ? proc.pid.toString() : '';
    const user = proc.user || '';
    return name.toLowerCase().includes(filterQuery.toLowerCase()) ||
      pid.includes(filterQuery) ||
      user.toLowerCase().includes(filterQuery.toLowerCase());
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Processor Performance</h2>
        <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Detailed monitoring of CPU cores, operational frequencies, and active threads.
        </p>
      </div>

      {/* Main CPU Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Core Utilization Timeline */}
        <div className={`lg:col-span-2 rounded-2xl border p-5 ${
          isDark ? 'bg-slate-900/40 border-slate-800/80 shadow-lg' : 'bg-white border-slate-200 shadow-md'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm">Utilization Timeline (60 seconds)</h3>
            <span 
              className="text-xs font-mono font-bold px-2 py-0.5 rounded-full border"
              style={{ color: colors.cpu, backgroundColor: `${colors.cpu}10`, borderColor: `${colors.cpu}30` }}
            >
              {(cpu?.usage || 0).toFixed(1)}% Load
            </span>
          </div>

          <MetricsChart 
            data={chartData} 
            dataKey="cpu" 
            color={colors.cpu} 
            unit="%" 
            height={220} 
          />
        </div>

        {/* Static Spec Details Card */}
        <div className={`rounded-2xl border p-5 flex flex-col justify-between ${
          isDark ? 'bg-slate-900/40 border-slate-800/80 shadow-lg' : 'bg-white border-slate-200 shadow-md'
        }`}>
          <div>
            <h3 className="font-semibold text-sm mb-4">Specifications</h3>
            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between border-b border-slate-800/10 pb-1.5">
                <span className="text-slate-500">Processor:</span>
                <span className="font-semibold text-right truncate max-w-[180px]">{cpu?.brand || 'Unknown CPU'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/10 pb-1.5">
                <span className="text-slate-500">Physical Cores:</span>
                <span className="font-semibold">{cpu?.physicalCores || 0}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/10 pb-1.5">
                <span className="text-slate-500">Logical Cores:</span>
                <span className="font-semibold">{cpu?.logicalCores || 0}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/10 pb-1.5">
                <span className="text-slate-500">Frequency:</span>
                <span className="font-semibold">{(cpu?.frequency || 0).toFixed(2)} GHz</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/10 pb-1.5">
                <span className="text-slate-500">Load Average:</span>
                <span className="font-semibold">{(cpu?.loadAverage || []).map(v => (v || 0).toFixed(2)).join(' • ')}</span>
              </div>
              <div className="flex justify-between pb-1">
                <span className="text-slate-500">Temperature:</span>
                <span className="font-semibold flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-orange-500" />
                  {cpu?.temperature !== null && cpu?.temperature !== undefined ? `${(cpu.temperature || 0).toFixed(0)}°C` : 'Sensor Blocked'}
                </span>
              </div>
            </div>
          </div>

          <div className={`mt-4 p-3 rounded-xl border flex items-center gap-3 ${
            isDark ? 'bg-slate-950/40 border-slate-800/60' : 'bg-slate-55/10 border-slate-100'
          }`}>
            <Server className="w-5 h-5 shrink-0" style={{ color: colors.cpu }} />
            <div className="text-[10px] leading-relaxed">
              <span className="font-semibold text-slate-400">Diagnostic Status: </span>
              {(cpu?.usage || 0) > 85 ? (
                <span className="text-rose-400 font-bold">Throttling limits reached</span>
              ) : (
                <span className="text-emerald-400 font-bold">Operational • Safe Temps</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Logical Cores */}
      <div className={`rounded-2xl border p-5 ${
        isDark ? 'bg-slate-900/40 border-slate-800/80 shadow-lg' : 'bg-white border-slate-200 shadow-md'
      }`}>
        <h3 className="font-semibold text-sm mb-4">Logical Cores Utilization</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3.5">
          {(cpu?.cores || []).map((coreLoad, idx) => {
            const loadVal = coreLoad || 0;
            return (
              <div 
                key={idx} 
                className={`p-3 rounded-xl border flex flex-col justify-between font-mono gap-1.5 ${
                  isDark ? 'bg-slate-950/40 border-slate-800/60' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-500 font-semibold">Core {idx}</span>
                  <span className="font-bold" style={{ color: colors.cpu }}>{loadVal.toFixed(0)}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full transition-all duration-300"
                    style={{ width: `${loadVal}%`, backgroundColor: colors.cpu }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Processes Sorted by CPU Load */}
      <div className={`rounded-2xl border p-5 ${
        isDark ? 'bg-slate-900/40 border-slate-800/80 shadow-lg' : 'bg-white border-slate-200 shadow-md'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2.5">
            <Terminal className="w-4 h-4" style={{ color: colors.cpu }} />
            <h3 className="font-semibold text-sm">Top Running Processes by Processor Load</h3>
          </div>
          
          {/* Search bar inside list */}
          <div className="relative w-full md:w-64">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
              <Search className="w-3.5 h-3.5" />
            </span>
            <input
              type="text"
              placeholder="Filter processes..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className={`w-full pl-9 pr-4 py-1.5 text-xs rounded-xl border outline-none font-mono ${
                isDark 
                  ? 'bg-slate-950/60 border-slate-800 text-slate-200 focus:border-cyan-500' 
                  : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-cyan-600'
              }`}
            />
          </div>
        </div>

        {/* Table layout */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className={`border-b ${isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                <th className="pb-2.5 font-semibold">PID</th>
                <th className="pb-2.5 font-semibold">Process Name</th>
                <th className="pb-2.5 font-semibold text-right">CPU %</th>
                <th className="pb-2.5 font-semibold text-right">RAM %</th>
                <th className="pb-2.5 font-semibold text-right">User</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/10">
              {filteredProcesses.map((proc, idx) => {
                const pidVal = proc.pid || 0;
                const nameVal = proc.name || 'Unknown';
                const cpuVal = proc.cpu || 0;
                const memVal = proc.mem || 0;
                const userVal = proc.user || 'system';

                return (
                  <tr key={idx} className={`hover:bg-slate-800/10 transition-colors ${
                    isDark ? 'text-slate-300' : 'text-slate-800'
                  }`}>
                    <td className="py-2.5 text-slate-500 font-bold">{pidVal}</td>
                    <td className="py-2.5 font-bold truncate max-w-[180px]">{nameVal}</td>
                    <td className="py-2.5 text-right font-bold" style={{ color: colors.cpu }}>{cpuVal.toFixed(1)}%</td>
                    <td className="py-2.5 text-right font-medium">{memVal.toFixed(1)}%</td>
                    <td className="py-2.5 text-right text-slate-500">{userVal}</td>
                  </tr>
                );
              })}
              {filteredProcesses.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400">
                    No processes matched your filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
