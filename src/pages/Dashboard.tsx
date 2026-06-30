import React from 'react';
import { useMetricsStore } from '../store/useMetricsStore';
import { MetricsChart } from '../components/graphs/MetricsChart';
import { Cpu, Laptop, HardDrive, Network, Layers, ChevronRight } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { currentMetrics, history, theme, setActiveTab } = useMetricsStore();
  const isDark = theme === 'dark';

  if (!currentMetrics) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
        <p className="text-sm font-mono text-slate-400 animate-pulse">
          Awaiting real-time diagnostic feed from system monitor...
        </p>
      </div>
    );
  }

  // Map history to simple arrays for sparkline plotting
  const chartData = history.map((m) => {
    const time = new Date(m.timestamp);
    const timeLabel = `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}:${time.getSeconds().toString().padStart(2, '0')}`;
    
    // Safety check on GPU availability
    const primaryGpu = m.gpus && m.gpus.length > 0 ? m.gpus[0] : null;

    return {
      timeLabel,
      cpu: m.cpu.usage,
      mem: m.memory.percentage,
      gpu: primaryGpu ? primaryGpu.utilization : 0,
      vram: primaryGpu ? primaryGpu.vramPercentage : 0,
    };
  });

  // Safe RAM values
  const ramTotalGB = (currentMetrics.memory.total / (1024 ** 3)).toFixed(1);
  const ramUsedGB = (currentMetrics.memory.used / (1024 ** 3)).toFixed(1);

  // Status indicators based on load threshold
  const getStatus = (usage: number) => {
    if (usage < 50) return { label: 'Optimal', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
    if (usage < 85) return { label: 'Elevated', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
    return { label: 'Heavy Load', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' };
  };

  const cpuStatus = getStatus(currentMetrics.cpu.usage);
  const ramStatus = getStatus(currentMetrics.memory.percentage);

  // GPU Specs
  const gpuDetected = currentMetrics.gpus && currentMetrics.gpus.length > 0;
  const primaryGpu = gpuDetected ? currentMetrics.gpus[0] : null;
  const gpuStatus = primaryGpu ? getStatus(primaryGpu.utilization) : null;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Intro Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">System At A Glance</h2>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Real-time visual feed of processing power, storage array, and active sockets.
          </p>
        </div>
      </div>

      {/* Grid of Resource Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CPU SUMMARY CARD */}
        <div 
          onClick={() => setActiveTab('cpu')}
          className={`group relative rounded-2xl border p-5 transition-all duration-300 hover:scale-[1.02] cursor-pointer flex flex-col justify-between ${
            isDark 
              ? 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-900/60 shadow-lg hover:shadow-cyan-500/5' 
              : 'bg-white border-slate-200 hover:bg-slate-50/50 shadow-md hover:shadow-cyan-500/5'
          }`}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Processor</h3>
                  <p className={`text-[10px] truncate max-w-[150px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {currentMetrics.cpu.brand}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${cpuStatus.color}`}>
                  {cpuStatus.label}
                </span>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold tracking-tight font-mono">
                {currentMetrics.cpu.usage.toFixed(1)}
              </span>
              <span className="text-sm font-medium text-slate-500">%</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800/10">
            <p className="text-[10px] font-mono mb-2 text-slate-500">Live Load History (60s)</p>
            <MetricsChart 
              data={chartData} 
              dataKey="cpu" 
              color="#06b6d4" 
              unit="%" 
              height={100} 
            />
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4 text-[11px] font-mono">
            <div>
              <span className="text-slate-500">Speed:</span>{' '}
              <span className="font-semibold">{currentMetrics.cpu.frequency.toFixed(2)} GHz</span>
            </div>
            <div>
              <span className="text-slate-500">Threads:</span>{' '}
              <span className="font-semibold">{currentMetrics.cpu.threads}</span>
            </div>
          </div>
        </div>

        {/* RAM SUMMARY CARD */}
        <div 
          onClick={() => setActiveTab('memory')}
          className={`group relative rounded-2xl border p-5 transition-all duration-300 hover:scale-[1.02] cursor-pointer flex flex-col justify-between ${
            isDark 
              ? 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-900/60 shadow-lg hover:shadow-pink-500/5' 
              : 'bg-white border-slate-200 hover:bg-slate-50/50 shadow-md hover:shadow-pink-500/5'
          }`}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-400">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Memory</h3>
                  <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    DDR System Array
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${ramStatus.color}`}>
                  {ramStatus.label}
                </span>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold tracking-tight font-mono">
                {currentMetrics.memory.percentage.toFixed(1)}
              </span>
              <span className="text-sm font-medium text-slate-500">%</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800/10">
            <p className="text-[10px] font-mono mb-2 text-slate-500">Live Memory History (60s)</p>
            <MetricsChart 
              data={chartData} 
              dataKey="mem" 
              color="#ec4899" 
              unit="%" 
              height={100} 
            />
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4 text-[11px] font-mono">
            <div>
              <span className="text-slate-500">Used:</span>{' '}
              <span className="font-semibold">{ramUsedGB} GB</span>
            </div>
            <div>
              <span className="text-slate-500">Total:</span>{' '}
              <span className="font-semibold">{ramTotalGB} GB</span>
            </div>
          </div>
        </div>

        {/* GPU SUMMARY CARD */}
        <div 
          onClick={() => setActiveTab('gpu')}
          className={`group relative rounded-2xl border p-5 transition-all duration-300 hover:scale-[1.02] cursor-pointer flex flex-col justify-between ${
            isDark 
              ? 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-900/60 shadow-lg hover:shadow-emerald-500/5' 
              : 'bg-white border-slate-200 hover:bg-slate-50/50 shadow-md hover:shadow-emerald-500/5'
          }`}
        >
          {gpuDetected && primaryGpu && gpuStatus ? (
            <>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                      <Cpu className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">Graphics (GPU)</h3>
                      <p className={`text-[10px] truncate max-w-[150px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {primaryGpu.model}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${gpuStatus.color}`}>
                      {gpuStatus.label}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold tracking-tight font-mono">
                    {primaryGpu.utilization.toFixed(1)}
                  </span>
                  <span className="text-sm font-medium text-slate-500">%</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-800/10">
                <p className="text-[10px] font-mono mb-2 text-slate-500">Live GPU History (60s)</p>
                <MetricsChart 
                  data={chartData} 
                  dataKey="gpu" 
                  color="#10b981" 
                  unit="%" 
                  height={100} 
                />
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4 text-[11px] font-mono">
                <div>
                  <span className="text-slate-500">VRAM:</span>{' '}
                  <span className="font-semibold">
                    {(primaryGpu.vramUsed / (1024 ** 2)).toFixed(0)} / {(primaryGpu.vramTotal / (1024 ** 2)).toFixed(0)} MB
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Temp:</span>{' '}
                  <span className="font-semibold">
                    {primaryGpu.temperature !== null ? `${primaryGpu.temperature}°C` : 'N/A'}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-500/10 flex items-center justify-center text-slate-400">
                  <Cpu className="w-5 h-5 text-slate-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Graphics (GPU)</h3>
                  <p className="text-[10px] text-slate-500">No GPU detected</p>
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-center items-center py-6 text-center">
                <p className={`text-xs font-mono px-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  No dedicated hardware graphics accelerator detected on this platform.
                </p>
                <span className="text-[10px] text-slate-500 mt-1">Shared memory graphics in use.</span>
              </div>

              <div className="border-t border-slate-800/10 pt-4 mt-auto">
                <button 
                  onClick={() => setActiveTab('gpu')}
                  className="w-full text-center text-[11px] text-indigo-500 font-semibold hover:underline cursor-pointer"
                >
                  View graphics drivers info
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Secondary Row: Disks and Network */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Disks storage summary */}
        <div 
          onClick={() => setActiveTab('disk')}
          className={`rounded-2xl border p-5 transition-all duration-300 cursor-pointer ${
            isDark ? 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-900/60' : 'bg-white border-slate-200 hover:bg-slate-50/50'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <HardDrive className="w-4 h-4 text-amber-500" />
              <h3 className="font-semibold text-sm">Disk Array Volumes</h3>
            </div>
            <span className="text-[10px] font-mono text-indigo-500 font-semibold">Details →</span>
          </div>

          <div className="space-y-4">
            {currentMetrics.disks.map((disk, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="font-medium truncate max-w-[200px]">{disk.name} ({disk.type})</span>
                  <span className="text-slate-500">
                    {disk.usePercentage.toFixed(0)}% used • {((disk.size - disk.used) / (1024 ** 3)).toFixed(1)} GB free
                  </span>
                </div>
                {/* Progress bar */}
                <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-500"
                    style={{ width: `${disk.usePercentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
            {currentMetrics.disks.length === 0 && (
              <p className="text-xs text-slate-400 font-mono">Scanning drive arrays...</p>
            )}
          </div>
        </div>

        {/* Network Interfaces summary */}
        <div 
          onClick={() => setActiveTab('network')}
          className={`rounded-2xl border p-5 transition-all duration-300 cursor-pointer ${
            isDark ? 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-900/60' : 'bg-white border-slate-200 hover:bg-slate-50/50'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <Network className="w-4 h-4 text-indigo-400" />
              <h3 className="font-semibold text-sm">Active Network Interfaces</h3>
            </div>
            <span className="text-[10px] font-mono text-indigo-500 font-semibold">Sockets →</span>
          </div>

          <div className="space-y-3.5">
            {currentMetrics.network.map((net, idx) => {
              const formatRate = (bytesSec: number) => {
                if (bytesSec === 0) return '0 B/s';
                if (bytesSec < 1024) return `${bytesSec.toFixed(0)} B/s`;
                if (bytesSec < 1024 * 1024) return `${(bytesSec / 1024).toFixed(1)} KB/s`;
                return `${(bytesSec / (1024 * 1024)).toFixed(1)} MB/s`;
              };

              return (
                <div key={idx} className="flex justify-between items-center text-xs border-b border-slate-800/10 pb-2 last:border-none last:pb-0">
                  <div className="font-mono">
                    <span className="font-semibold">{net.name}</span>
                    <span className="text-[10px] text-slate-500 block">{net.ip4}</span>
                  </div>
                  <div className="font-mono text-right">
                    <div className="text-emerald-400 flex items-center justify-end gap-1">
                      <span className="text-[9px] uppercase font-medium">Down</span>
                      <span className="font-bold">{formatRate(net.rxRate)}</span>
                    </div>
                    <div className="text-indigo-400 flex items-center justify-end gap-1">
                      <span className="text-[9px] uppercase font-medium">Up</span>
                      <span className="font-bold">{formatRate(net.txRate)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
            {currentMetrics.network.length === 0 && (
              <p className="text-xs text-slate-400 font-mono">Awaiting network statistics...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
