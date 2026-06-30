import React from 'react';
import { useMetricsStore } from '../store/useMetricsStore';
import { MetricsChart } from '../components/graphs/MetricsChart';
import { getChartColorsByMode } from '../utils/colorModes';
import { Network as NetIcon, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

export const Network: React.FC = () => {
  const { currentMetrics, history, theme, colorMode } = useMetricsStore();
  const isDark = theme === 'dark';
  const colors = getChartColorsByMode(colorMode);

  if (!currentMetrics) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
        <p className="text-sm font-mono text-slate-400">Probing active network interfaces...</p>
      </div>
    );
  }

  // Format bytes rate to human readable speed
  const formatSpeed = (bytesSec: number) => {
    if (bytesSec === 0) return '0 B/s';
    if (bytesSec < 1024) return `${bytesSec.toFixed(0)} B/s`;
    if (bytesSec < 1024 * 1024) return `${(bytesSec / 1024).toFixed(1)} KB/s`;
    return `${(bytesSec / (1024 * 1024)).toFixed(1)} MB/s`;
  };

  // Map history to Network Rates (KB/s) for smoother graphing
  const chartData = history.map((m) => {
    const time = new Date(m.timestamp);
    const timeLabel = `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}:${time.getSeconds().toString().padStart(2, '0')}`;
    
    const rxSum = (m.network || []).reduce((acc, curr) => acc + (curr.rxRate || 0), 0);
    const txSum = (m.network || []).reduce((acc, curr) => acc + (curr.txRate || 0), 0);

    return {
      timeLabel,
      rx: Number((rxSum / 1024).toFixed(1)), // KB/s
      tx: Number((txSum / 1024).toFixed(1)), // KB/s
    };
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Network Bandwidth</h2>
        <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Measure real-time bandwidth consumption, dynamic packet uploads/downloads, and socket interface configs.
        </p>
      </div>

      {/* Dual Bandwidth Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Download Rates */}
        <div className={`rounded-2xl border p-5 ${
          isDark ? 'bg-slate-900/40 border-slate-800/80 shadow-lg' : 'bg-white border-slate-200 shadow-md'
        }`}>
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-semibold text-slate-500 font-mono flex items-center gap-2">
              <ArrowDownCircle className="w-4 h-4" style={{ color: colors.network }} />
              <span>Instantaneous Download (Rx)</span>
            </span>
            <span className="text-xs font-mono font-bold" style={{ color: colors.network }}>
              {formatSpeed((currentMetrics.network || []).reduce((acc, n) => acc + (n.rxRate || 0), 0))}
            </span>
          </div>
          <MetricsChart 
            data={chartData} 
            dataKey="rx" 
            color={colors.network} 
            unit="KB/s" 
            height={160}
            domain={[0, 'auto']}
          />
        </div>

        {/* Upload Rates */}
        <div className={`rounded-2xl border p-5 ${
          isDark ? 'bg-slate-900/40 border-slate-800/80 shadow-lg' : 'bg-white border-slate-200 shadow-md'
        }`}>
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-semibold text-slate-500 font-mono flex items-center gap-2">
              <ArrowUpCircle className="w-4 h-4" style={{ color: colors.mem }} />
              <span>Instantaneous Upload (Tx)</span>
            </span>
            <span className="text-xs font-mono font-bold" style={{ color: colors.mem }}>
              {formatSpeed((currentMetrics.network || []).reduce((acc, n) => acc + (n.txRate || 0), 0))}
            </span>
          </div>
          <MetricsChart 
            data={chartData} 
            dataKey="tx" 
            color={colors.mem} 
            unit="KB/s" 
            height={160}
            domain={[0, 'auto']}
          />
        </div>

      </div>

      {/* Active Interfaces Specs */}
      <div className={`rounded-2xl border p-6 ${
        isDark ? 'bg-slate-900/40 border-slate-800/80 shadow-lg' : 'bg-white border-slate-200 shadow-md'
      }`}>
        <h3 className="font-semibold text-sm mb-5 flex items-center gap-2">
          <NetIcon className="w-4 h-4 text-indigo-400" />
          <span>Configured Network Interfaces</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(currentMetrics.network || []).map((net, idx) => (
            <div 
              key={idx} 
              className={`p-5 rounded-2xl border flex flex-col justify-between font-mono space-y-4 ${
                isDark ? 'bg-slate-950/40 border-slate-800/60' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div>
                <span className="font-bold text-sm block text-indigo-400">{net.name || 'Interface'}</span>
                <span className="text-[10px] text-slate-500 mt-0.5 block">IP Address: {net.ip4 || 'No IP'}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800/10">
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-semibold block">Down Speed</span>
                  <span className="font-bold text-emerald-400">{formatSpeed(net.rxRate || 0)}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-semibold block">Up Speed</span>
                  <span className="font-bold text-indigo-400">{formatSpeed(net.txRate || 0)}</span>
                </div>
              </div>
            </div>
          ))}
          {(!currentMetrics.network || currentMetrics.network.length === 0) && (
            <p className="text-xs text-slate-400 text-center col-span-2 py-6">No network sockets detected.</p>
          )}
        </div>
      </div>
    </div>
  );
};
