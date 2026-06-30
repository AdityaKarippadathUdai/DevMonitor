import React, { useState } from 'react';
import { useMetricsStore } from '../store/useMetricsStore';
import { ListRestart, Search, ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react';

type SortKey = 'pid' | 'name' | 'cpu' | 'mem';
type SortOrder = 'asc' | 'desc';

export const Processes: React.FC = () => {
  const { currentMetrics, theme } = useMetricsStore();
  const [filterQuery, setFilterQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('cpu');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const isDark = theme === 'dark';

  if (!currentMetrics) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
        <p className="text-sm font-mono text-slate-400">Scanning running OS process table...</p>
      </div>
    );
  }

  // Handle header sorting click
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('desc'); // Default to descending on new key
    }
  };

  const getSortIcon = (key: SortKey) => {
    if (sortKey !== key) return <ArrowUpDown className="w-3 h-3 text-slate-500" />;
    return sortOrder === 'asc' 
      ? <ChevronUp className="w-3.5 h-3.5 text-cyan-400" /> 
      : <ChevronDown className="w-3.5 h-3.5 text-cyan-400" />;
  };

  const processes = currentMetrics.cpu.processes || [];

  // Filter processes
  const filtered = processes.filter((proc) =>
    proc.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
    proc.pid.toString().includes(filterQuery) ||
    proc.user.toLowerCase().includes(filterQuery.toLowerCase())
  );

  // Sort processes
  const sorted = [...filtered].sort((a, b) => {
    let valA = a[sortKey];
    let valB = b[sortKey];

    if (typeof valA === 'string' && typeof valB === 'string') {
      return sortOrder === 'asc' 
        ? valA.localeCompare(valB) 
        : valB.localeCompare(valA);
    }

    return sortOrder === 'asc' 
      ? (valA as number) - (valB as number) 
      : (valB as number) - (valA as number);
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Active Processes Explorer</h2>
        <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Detailed list of running binary process trees, thread loads, and active address space allocations.
        </p>
      </div>

      {/* Control panel & table */}
      <div className={`rounded-2xl border p-5 ${
        isDark ? 'bg-slate-900/40 border-slate-800/80 shadow-lg' : 'bg-white border-slate-200 shadow-md'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-2.5">
            <ListRestart className="w-5 h-5 text-cyan-400" />
            <h3 className="font-semibold text-sm">System Running Tasks</h3>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
              {sorted.length} listed
            </span>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search by PID, name or executing user..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 text-xs rounded-xl border outline-none font-mono ${
                isDark 
                  ? 'bg-slate-950/60 border-slate-800 text-slate-200 focus:border-cyan-500' 
                  : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-cyan-600'
              }`}
            />
          </div>
        </div>

        {/* Full-width Process Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className={`border-b border-slate-800/10 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                <th 
                  onClick={() => handleSort('pid')}
                  className="pb-3 font-semibold cursor-pointer select-none hover:text-cyan-400 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>PID</span>
                    {getSortIcon('pid')}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('name')}
                  className="pb-3 font-semibold cursor-pointer select-none hover:text-cyan-400 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Process Name</span>
                    {getSortIcon('name')}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('cpu')}
                  className="pb-3 font-semibold cursor-pointer select-none hover:text-cyan-400 transition-colors text-right"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>CPU %</span>
                    {getSortIcon('cpu')}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('mem')}
                  className="pb-3 font-semibold cursor-pointer select-none hover:text-cyan-400 transition-colors text-right"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>RAM %</span>
                    {getSortIcon('mem')}
                  </div>
                </th>
                <th className="pb-3 font-semibold text-right">RAM (MB)</th>
                <th className="pb-3 font-semibold text-right">Executing User</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/10">
              {sorted.map((proc) => {
                // Approximate memory size in MB from process mem percentage or systems
                const totalSystemRam = currentMetrics.memory.total;
                const approxMemMB = totalSystemRam > 0 
                  ? ((proc.mem / 100) * totalSystemRam / (1024 * 1024)).toFixed(1) 
                  : 'N/A';

                return (
                  <tr 
                    key={proc.pid} 
                    className={`hover:bg-slate-800/5 transition-colors ${
                      isDark ? 'text-slate-300' : 'text-slate-800'
                    }`}
                  >
                    <td className="py-3 text-slate-500 font-bold">{proc.pid}</td>
                    <td className="py-3 font-bold truncate max-w-[220px]" title={proc.name}>
                      {proc.name}
                    </td>
                    <td className="py-3 text-right text-cyan-400 font-bold">
                      {proc.cpu.toFixed(1)}%
                    </td>
                    <td className="py-3 text-right font-medium">
                      {proc.mem.toFixed(1)}%
                    </td>
                    <td className="py-3 text-right text-slate-400 font-medium">
                      {approxMemMB !== 'N/A' ? `${approxMemMB} MB` : 'N/A'}
                    </td>
                    <td className="py-3 text-right text-slate-500 font-medium">{proc.user}</td>
                  </tr>
                );
              })}
              {sorted.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-mono">
                    No active tasks match your search filter.
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
