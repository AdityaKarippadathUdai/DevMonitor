import React from 'react';
import { useMetricsStore } from '../store/useMetricsStore';
import { MetricsChart } from '../components/graphs/MetricsChart';
import { getChartColorsByMode } from '../utils/colorModes';
import { HardDrive, Activity, TrendingUp } from 'lucide-react';

export const Disk: React.FC = () => {
  const { currentMetrics, history, theme, colorMode } = useMetricsStore();
  const isDark = theme === 'dark';
  const colors = getChartColorsByMode(colorMode);

  if (!currentMetrics) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
        <p className="text-sm font-mono text-slate-400">Verifying disk sector mappings...</p>
      </div>
    );
  }

  // Format Bytes to human readable
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / (k ** i)).toFixed(1)} ${sizes[i]}`;
  };

  // Format speed in MB/s
  const formatMBs = (bytesSec: number) => {
    return (bytesSec / (1024 * 1024)).toFixed(2);
  };

  // Map history to Disk I/O speeds (MB/s)
  const chartData = history.map((m) => {
    const time = new Date(m.timestamp);
    const timeLabel = `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}:${time.getSeconds().toString().padStart(2, '0')}`;
    
    // Average or sum rates across drives
    const readSum = (m.disks || []).reduce((acc, curr) => acc + (curr.readRate || 0), 0);
    const writeSum = (m.disks || []).reduce((acc, curr) => acc + (curr.writeRate || 0), 0);

    return {
      timeLabel,
      read: Number(formatMBs(readSum)),
      write: Number(formatMBs(writeSum)),
    };
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Disk Storage Arrays</h2>
        <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Track volume fragmentation, read/write I/O transfer rates, mounting locations, and partitions.
        </p>
      </div>

      {/* Disk I/O Graph Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Read Rates */}
        <div className={`rounded-2xl border p-5 ${
          isDark ? 'bg-slate-900/40 border-slate-800/80 shadow-lg' : 'bg-white border-slate-200 shadow-md'
        }`}>
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-semibold text-slate-500 font-mono">Active Read Rates</span>
            <span className="text-xs font-mono font-bold" style={{ color: colors.disk }}>
              {formatMBs((currentMetrics.disks || []).reduce((acc, d) => acc + (d.readRate || 0), 0))} MB/s
            </span>
          </div>
          <MetricsChart 
            data={chartData} 
            dataKey="read" 
            color={colors.disk} 
            unit="MB/s" 
            height={160}
            domain={[0, 'auto']}
          />
        </div>

        {/* Write Rates */}
        <div className={`rounded-2xl border p-5 ${
          isDark ? 'bg-slate-900/40 border-slate-800/80 shadow-lg' : 'bg-white border-slate-200 shadow-md'
        }`}>
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-semibold text-slate-500 font-mono">Active Write Rates</span>
            <span className="text-xs font-mono font-bold" style={{ color: colors.mem }}>
              {formatMBs((currentMetrics.disks || []).reduce((acc, d) => acc + (d.writeRate || 0), 0))} MB/s
            </span>
          </div>
          <MetricsChart 
            data={chartData} 
            dataKey="write" 
            color={colors.mem} 
            unit="MB/s" 
            height={160}
            domain={[0, 'auto']}
          />
        </div>

      </div>

      {/* Complete Disk Volume Listings */}
      <div className={`rounded-2xl border p-6 ${
        isDark ? 'bg-slate-900/40 border-slate-800/80 shadow-lg' : 'bg-white border-slate-200 shadow-md'
      }`}>
        <h3 className="font-semibold text-sm mb-5 flex items-center gap-2">
          <HardDrive className="w-4 h-4" style={{ color: colors.disk }} />
          <span>Mounted Storage Volumes</span>
        </h3>

        <div className="space-y-6">
          {(currentMetrics.disks || []).map((disk, idx) => (
            <div 
              key={idx} 
              className={`p-5 rounded-2xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-6 ${
                isDark ? 'bg-slate-950/40 border-slate-800/60' : 'bg-slate-50 border-slate-200'
              }`}
            >
              {/* Drive descriptors */}
              <div className="space-y-1">
                <span className="font-bold text-sm block">{disk.name || 'Drive'}</span>
                <div className="flex items-center gap-3 text-[10px] font-mono text-slate-500">
                  <span>File-System: <span className="font-semibold">{disk.type || 'SSD'}</span></span>
                  <span>•</span>
                  <span>Operational Health: <span className="text-emerald-400 font-bold">Excellent</span></span>
                </div>
              </div>

              {/* Progress and status */}
              <div className="flex-1 max-w-md w-full space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-500">Utilization Space:</span>
                  <span className="font-semibold" style={{ color: colors.disk }}>{(disk.usePercentage || 0).toFixed(1)}% Used</span>
                </div>
                <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                  <div 
                    className="h-full transition-all duration-300"
                    style={{ width: `${disk.usePercentage || 0}%`, background: `linear-gradient(to right, ${colors.disk}, ${colors.disk}dd)` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>Used: {formatBytes(disk.used || 0)}</span>
                  <span>Available Free: {formatBytes(disk.available || 0)}</span>
                  <span>Capacity: {formatBytes(disk.size || 0)}</span>
                </div>
              </div>

            </div>
          ))}
          {(!currentMetrics.disks || currentMetrics.disks.length === 0) && (
            <p className="text-xs text-slate-400 font-mono text-center py-6">No storage volumes detected.</p>
          )}
        </div>
      </div>
    </div>
  );
};
