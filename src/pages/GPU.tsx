import React from 'react';
import { useMetricsStore } from '../store/useMetricsStore';
import { MetricsChart } from '../components/graphs/MetricsChart';
import { getChartColorsByMode } from '../utils/colorModes';
import { getGlassmorphicStyle } from '../utils/glassmorphism';
import { Cpu, HelpCircle, Activity, Wind, Zap, Gauge } from 'lucide-react';

export const GPU: React.FC = () => {
  const { currentMetrics, history, theme, colorMode, glassSettings } = useMetricsStore();
  const isDark = theme === 'dark';
  const colors = getChartColorsByMode(colorMode);
  const glassStyle = getGlassmorphicStyle(glassSettings, isDark);

  if (!currentMetrics) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
        <p className="text-sm font-mono text-slate-400">Querying PCI-Express buses...</p>
      </div>
    );
  }

  const gpus = currentMetrics.gpus || [];
  const hasGpu = gpus.length > 0;

  // Map history to GPU/VRAM arrays
  const getGpuChartData = (index: number) => {
    return history.map((m) => {
      const time = new Date(m.timestamp);
      const timeLabel = `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}:${time.getSeconds().toString().padStart(2, '0')}`;
      const gpu = m.gpus && m.gpus.length > index ? m.gpus[index] : null;
      return {
        timeLabel,
        utilization: gpu ? gpu.utilization : 0,
        vram: gpu ? gpu.vramPercentage : 0,
      };
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Graphics Processors (GPU)</h2>
        <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Monitor discrete/integrated graphics accelerators, hardware encoders, thermal bounds, and VRAM maps.
        </p>
      </div>

      {hasGpu ? (
        <div className="space-y-8">
          {gpus.map((gpu, idx) => {
            const chartData = getGpuChartData(idx);
            
            // Customize vendor styling
            let vendorBadge = 'bg-slate-500/10 text-slate-400 border-slate-500/20';
            if (gpu.vendor === 'NVIDIA') {
              vendorBadge = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            } else if (gpu.vendor === 'AMD') {
              vendorBadge = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
            } else if (gpu.vendor === 'Intel') {
              vendorBadge = 'bg-sky-500/10 text-sky-400 border-sky-500/20';
            } else if (gpu.vendor === 'Apple') {
              vendorBadge = 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
            }

            return (
              <div 
                key={idx} 
                className={`${glassStyle.className} p-6 space-y-6`}
                style={glassStyle.style}
              >
                {/* Header detail */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/10">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                      <Cpu className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base">{gpu.model}</h3>
                      <p className="text-[10px] text-slate-500 font-mono">Index {idx} • PCIe Bus Controller</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border self-start md:self-auto ${vendorBadge}`}>
                    {gpu.vendor} Chipset
                  </span>
                </div>

                {/* Main dual-chart breakdown */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* GPU Core Utilization */}
                  <div className={`rounded-xl border p-4 ${isDark ? 'bg-slate-950/40 border-slate-800/60' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xs font-semibold text-slate-500 font-mono">Core Load Timeline</span>
                      <span className="text-xs font-mono font-bold" style={{ color: colors.gpu }}>{(gpu.utilization || 0).toFixed(1)}%</span>
                    </div>
                    <MetricsChart 
                      data={chartData} 
                      dataKey="utilization" 
                      color={colors.gpu} 
                      unit="%" 
                      height={160} 
                    />
                  </div>

                  {/* VRAM Memory Allocation */}
                  <div className={`rounded-xl border p-4 ${isDark ? 'bg-slate-950/40 border-slate-800/60' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xs font-semibold text-slate-500 font-mono">VRAM Framebuffer Allocation</span>
                      <span className="text-xs font-mono font-bold" style={{ color: colors.mem }}>{(gpu.vramPercentage || 0).toFixed(1)}%</span>
                    </div>
                    <MetricsChart 
                      data={chartData} 
                      dataKey="vram" 
                      color={colors.mem} 
                      unit="%" 
                      height={160} 
                    />
                  </div>
                </div>

                {/* Subordinate telemetry sensors */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  
                  {/* Temperatures */}
                  <div className={`p-4 rounded-xl border flex items-center gap-3 font-mono ${
                    isDark ? 'bg-slate-950/30 border-slate-800/50' : 'bg-slate-50 border-slate-250'
                  }`}>
                    <Activity className="w-4 h-4 text-orange-500 shrink-0" />
                    <div>
                      <span className="text-[9px] text-slate-500 block uppercase font-bold">Temperature</span>
                      <span className="font-bold text-xs">{gpu.temperature !== null ? `${gpu.temperature}°C` : 'Blocked'}</span>
                    </div>
                  </div>

                  {/* Fans */}
                  <div className={`p-4 rounded-xl border flex items-center gap-3 font-mono ${
                    isDark ? 'bg-slate-950/30 border-slate-800/50' : 'bg-slate-50 border-slate-250'
                  }`}>
                    <Wind className="w-4 h-4 text-teal-400 shrink-0" />
                    <div>
                      <span className="text-[9px] text-slate-500 block uppercase font-bold">Fan Speed</span>
                      <span className="font-bold text-xs">{gpu.fanSpeed !== null ? `${gpu.fanSpeed}%` : 'Passive'}</span>
                    </div>
                  </div>

                  {/* Power Draw */}
                  <div className={`p-4 rounded-xl border flex items-center gap-3 font-mono ${
                    isDark ? 'bg-slate-950/30 border-slate-800/50' : 'bg-slate-50 border-slate-250'
                  }`}>
                    <Zap className="w-4 h-4 text-yellow-400 shrink-0" />
                    <div>
                      <span className="text-[9px] text-slate-500 block uppercase font-bold">Power Draw</span>
                      <span className="font-bold text-xs">{gpu.powerDraw !== null ? `${gpu.powerDraw}W` : 'N/A'}</span>
                    </div>
                  </div>

                  {/* Core clock */}
                  <div className={`p-4 rounded-xl border flex items-center gap-3 font-mono ${
                    isDark ? 'bg-slate-950/30 border-slate-800/50' : 'bg-slate-50 border-slate-250'
                  }`}>
                    <Gauge className="w-4 h-4 shrink-0" style={{ color: colors.gpu }} />
                    <div>
                      <span className="text-[9px] text-slate-500 block uppercase font-bold">GPU Clock</span>
                      <span className="font-bold text-xs">{gpu.gpuClock !== null ? `${gpu.gpuClock} MHz` : 'Dynamic'}</span>
                    </div>
                  </div>

                  {/* Memory clock */}
                  <div className={`p-4 rounded-xl border flex items-center gap-3 font-mono ${
                    isDark ? 'bg-slate-950/30 border-slate-800/50' : 'bg-slate-50 border-slate-250'
                  }`}>
                    <Gauge className="w-4 h-4 shrink-0" style={{ color: colors.mem }} />
                    <div>
                      <span className="text-[9px] text-slate-500 block uppercase font-bold">VRAM Clock</span>
                      <span className="font-bold text-xs">{gpu.memoryClock !== null ? `${gpu.memoryClock} MHz` : 'Dynamic'}</span>
                    </div>
                  </div>

                </div>

                {/* Core/vram detail text block */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono border-t border-slate-800/10 pt-4 text-slate-500">
                  <div>
                    <span className="font-semibold text-slate-400">Total Dedicated Framebuffer: </span>
                    <span>{((gpu.vramTotal || 0) / (1024 ** 2)).toFixed(0)} MB SDRAM</span>
                  </div>
                  <div className="md:text-right">
                    <span className="font-semibold text-slate-400">Used Memory Address Space: </span>
                    <span>{((gpu.vramUsed || 0) / (1024 ** 2)).toFixed(0)} MB ({(gpu.vramPercentage || 0).toFixed(1)}%)</span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        /* GPU FALLBACK STATE: Beautiful glassmorphic fallback view if no GPU exists */
        <div className={`${glassStyle.className} p-10 text-center space-y-6 max-w-2xl mx-auto flex flex-col items-center justify-center`} style={glassStyle.style}>
          <div className="w-16 h-16 rounded-3xl bg-amber-500/10 flex items-center justify-center text-amber-500 animate-pulse">
            <HelpCircle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="font-bold text-lg">No Dedicated GPU Detected</h3>
            <p className={`text-xs leading-relaxed max-w-md ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              The diagnostic monitor was unable to scan dedicated physical discrete graphics expansion cards (e.g., NVIDIA NVML, AMD ROCm/Linux or Intel hardware pipelines). 
            </p>
          </div>
          <div className={`p-4 rounded-xl border max-w-md text-left font-mono text-[10px] leading-relaxed text-slate-500 ${
            isDark ? 'bg-slate-950/60 border-slate-800/80' : 'bg-slate-50 border-slate-100'
          }`}>
            <span className="font-bold text-slate-400 block mb-1">🔍 Technical Diagnostic Logs:</span>
            - PCI express slot verification: empty / virtual hardware<br />
            - NVML API initialization: driver library not exposed<br />
            - AMD Linux controller nodes: no sysfs parameters located<br />
            - Shared host graphics renderer (Intel / Apple Silicon SOC integration) handles browser composition safely.
          </div>
        </div>
      )}
    </div>
  );
};
