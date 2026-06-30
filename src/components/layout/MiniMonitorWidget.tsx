import React, { useState, useRef, useEffect } from 'react';
import { useMetricsStore } from '../../store/useMetricsStore';
import { getGlassmorphicStyle } from '../../utils/glassmorphism';
import { getChartColorsByMode } from '../../utils/colorModes';
import { 
  Cpu, 
  Laptop, 
  Maximize2, 
  Minimize2, 
  GripHorizontal, 
  X, 
  Activity, 
  Pin,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const MiniMonitorWidget: React.FC = () => {
  const { currentMetrics, history, theme, glassSettings, miniModeActive, setMiniModeActive, colorMode } = useMetricsStore();
  const isDark = theme === 'dark';
  const glassStyle = getGlassmorphicStyle(glassSettings, isDark);
  const colors = getChartColorsByMode(colorMode);

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [position, setPosition] = useState({ x: -1, y: -1 });
  const [isDragging, setIsDragging] = useState(false);
  
  const widgetRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startX: number; startY: number; posX: number; posY: number }>({
    startX: 0,
    startY: 0,
    posX: 0,
    posY: 0,
  });

  // Calculate default position once the component mounts or window resizes
  useEffect(() => {
    if (position.x === -1 && position.y === -1) {
      const defaultX = window.innerWidth - 320 - 24; // 320px width, 24px padding
      const defaultY = window.innerHeight - 240 - 24; // ~240px height, 24px padding
      setPosition({ x: Math.max(16, defaultX), y: Math.max(16, defaultY) });
    }
  }, [position]);

  // Adjust position if window size shrinks to keep widget on screen
  useEffect(() => {
    const handleResize = () => {
      if (position.x !== -1 && position.y !== -1) {
        const maxX = window.innerWidth - (isCollapsed ? 200 : 320) - 16;
        const maxY = window.innerHeight - (isCollapsed ? 50 : 240) - 16;
        setPosition(prev => ({
          x: Math.min(Math.max(16, prev.x), Math.max(16, maxX)),
          y: Math.min(Math.max(16, prev.y), Math.max(16, maxY)),
        }));
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [position, isCollapsed]);

  if (!miniModeActive || !currentMetrics) return null;

  // CPU and RAM Metrics
  const cpuUsage = Math.round(currentMetrics.cpu?.usage || 0);
  const ramUsedBytes = currentMetrics.memory?.used || 0;
  const ramTotalBytes = currentMetrics.memory?.total || 1;
  const ramUsagePercent = Math.round((ramUsedBytes / ramTotalBytes) * 100);
  const ramUsedGB = (ramUsedBytes / (1024 ** 3)).toFixed(1);
  const ramTotalGB = (ramTotalBytes / (1024 ** 3)).toFixed(1);

  // Refs to hold the latest dragging event handlers to avoid stale closures
  const handleMouseMoveRef = useRef<(e: MouseEvent) => void>(null);
  const handleMouseUpRef = useRef<() => void>(null);
  const handleTouchMoveRef = useRef<(e: TouchEvent) => void>(null);
  const handleTouchEndRef = useRef<() => void>(null);

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only drag with left click
    if (e.button !== 0) return;
    
    // Prevent dragging if clicking buttons
    const target = e.target as HTMLElement;
    if (target.closest('button')) return;

    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      posX: position.x !== -1 ? position.x : window.innerWidth - (isCollapsed ? 190 : 300) - 24,
      posY: position.y !== -1 ? position.y : window.innerHeight - (isCollapsed ? 44 : 230) - 24,
    };
    e.preventDefault();
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest('button')) return;

    const touch = e.touches[0];
    setIsDragging(true);
    dragRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      posX: position.x !== -1 ? position.x : window.innerWidth - (isCollapsed ? 190 : 300) - 24,
      posY: position.y !== -1 ? position.y : window.innerHeight - (isCollapsed ? 44 : 230) - 24,
    };
  };

  // Keep event handler refs up-to-date with current state values
  useEffect(() => {
    handleMouseMoveRef.current = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      
      const nextX = dragRef.current.posX + dx;
      const nextY = dragRef.current.posY + dy;

      // Boundary constraints
      const minX = 10;
      const minY = 10;
      const maxX = window.innerWidth - (isCollapsed ? 190 : 300) - 10;
      const maxY = window.innerHeight - (isCollapsed ? 44 : 230) - 10;

      setPosition({
        x: Math.min(Math.max(minX, nextX), maxX),
        y: Math.min(Math.max(minY, nextY), maxY),
      });
    };

    handleMouseUpRef.current = () => {
      setIsDragging(false);
    };

    handleTouchMoveRef.current = (e: TouchEvent) => {
      if (!isDragging) return;
      const touch = e.touches[0];
      const dx = touch.clientX - dragRef.current.startX;
      const dy = touch.clientY - dragRef.current.startY;

      const nextX = dragRef.current.posX + dx;
      const nextY = dragRef.current.posY + dy;

      const minX = 10;
      const minY = 10;
      const maxX = window.innerWidth - (isCollapsed ? 190 : 300) - 10;
      const maxY = window.innerHeight - (isCollapsed ? 44 : 230) - 10;

      setPosition({
        x: Math.min(Math.max(minX, nextX), maxX),
        y: Math.min(Math.max(minY, nextY), maxY),
      });
    };

    handleTouchEndRef.current = () => {
      setIsDragging(false);
    };
  });

  // Attach global listeners for dragging using stable proxy functions
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => handleMouseMoveRef.current?.(e);
    const onMouseUp = () => handleMouseUpRef.current?.();
    const onTouchMove = (e: TouchEvent) => handleTouchMoveRef.current?.(e);
    const onTouchEnd = () => handleTouchEndRef.current?.();

    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      window.addEventListener('touchmove', onTouchMove, { passive: false });
      window.addEventListener('touchend', onTouchEnd);
    }

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [isDragging]);

  // Generate real-time sparkline SVG points for CPU and Memory
  const getSparklinePoints = (key: 'cpu' | 'memory', width: number, height: number) => {
    if (history.length < 2) return '';
    const points: string[] = [];
    const maxIndex = history.length - 1;

    history.forEach((m, idx) => {
      const x = (idx / maxIndex) * width;
      let val = 0;
      if (key === 'cpu') {
        val = m.cpu?.usage || 0;
      } else {
        const used = m.memory?.used || 0;
        const tot = m.memory?.total || 1;
        val = (used / tot) * 100;
      }
      
      // Flip value for SVG coordinate system (0 is at top)
      const y = height - (val / 100) * height;
      points.push(`${x},${y}`);
    });

    return points.join(' ');
  };

  // SVG Circular progress ring calculation
  const radius = 28;
  const strokeWidth = 5;
  const circumference = 2 * Math.PI * radius;
  
  const getStrokeDashOffset = (percent: number) => {
    const val = Math.min(Math.max(0, percent), 100);
    return circumference - (val / 100) * circumference;
  };

  return (
    <div
      ref={widgetRef}
      className={`fixed z-[100] select-none ${isDragging ? 'cursor-grabbing scale-[1.01]' : ''}`}
      style={{
        left: position.x !== -1 ? `${position.x}px` : 'auto',
        top: position.y !== -1 ? `${position.y}px` : 'auto',
        right: position.x === -1 ? '24px' : 'auto',
        bottom: position.y === -1 ? '24px' : 'auto',
      }}
    >
      <div 
        className={`${glassStyle.className} shadow-2xl flex flex-col overflow-hidden`}
        style={{
          ...glassStyle.style,
          width: isCollapsed ? '190px' : '300px',
          height: isCollapsed ? '44px' : '230px',
        }}
      >
        {/* DRAGGABLE HEADER / TITLE BAR */}
        <div
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          className={`flex items-center justify-between px-3 py-1.5 cursor-grab border-b active:cursor-grabbing ${
            isDark ? 'bg-slate-900/40 border-slate-800/40' : 'bg-slate-50/50 border-slate-200/50'
          }`}
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <GripHorizontal className={`w-3.5 h-3.5 shrink-0 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
            <span className={`text-[10px] font-mono font-bold tracking-wider truncate uppercase ${
              isDark ? 'text-slate-300' : 'text-slate-600'
            }`}>
              Mini Monitor
            </span>
            <span className="flex h-1.5 w-1.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* Collapse/Expand Toggle */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={`p-1 rounded hover:scale-105 active:scale-95 cursor-pointer transition-transform ${
                isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'
              }`}
              title={isCollapsed ? 'Expand Widget' : 'Collapse Widget'}
            >
              {isCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            
            {/* Return to Dashboard / Exit Button */}
            <button
              onClick={() => setMiniModeActive(false)}
              className={`p-1 rounded hover:scale-105 active:scale-95 cursor-pointer transition-transform ${
                isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-rose-400' : 'hover:bg-slate-100 text-slate-500 hover:text-rose-500'
              }`}
              title="Close Widget"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* WIDGET CONTENT */}
        {isCollapsed ? (
          /* COLLAPSED MINI-PILL MODE */
          <div className="flex-1 flex items-center justify-around px-3 py-1 font-mono text-[10px]">
            <div className="flex items-center gap-1" style={{ color: colors.cpu }}>
              <Cpu className="w-3 h-3" />
              <span className="font-bold">{cpuUsage}%</span>
            </div>
            <span className="text-slate-500">|</span>
            <div className="flex items-center gap-1" style={{ color: colors.mem }}>
              <Laptop className="w-3 h-3" />
              <span className="font-bold">{ramUsagePercent}%</span>
            </div>
            <span className="text-slate-500">|</span>
            <div className="text-[9px] text-slate-400 font-bold">
              {ramUsedGB}G
            </div>
          </div>
        ) : (
          /* EXPANDED RICH METRIC MODE */
          <div className="flex-1 p-3.5 flex flex-col justify-between space-y-3">
            {/* GAUGES GRID */}
            <div className="grid grid-cols-2 gap-4">
              
              {/* CPU CIRCULAR GAUGE */}
              <div className="flex flex-col items-center justify-center text-center">
                <div className="relative flex items-center justify-center w-16 h-16">
                  {/* SVG circular track */}
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="32"
                      cy="32"
                      r={radius}
                      className={isDark ? 'stroke-slate-800/50' : 'stroke-slate-200'}
                      strokeWidth={strokeWidth}
                      fill="transparent"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r={radius}
                      className="transition-all duration-300"
                      style={{ stroke: colors.cpu }}
                      strokeWidth={strokeWidth}
                      fill="transparent"
                      strokeDasharray={circumference}
                      strokeDashoffset={getStrokeDashOffset(cpuUsage)}
                      strokeLinecap="round"
                    />
                  </svg>
                  {/* Gauge Overlay Value */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
                    <span className="text-xs font-bold font-mono" style={{ color: colors.cpu }}>{cpuUsage}%</span>
                    <span className="text-[7px] font-mono text-slate-400 mt-0.5 uppercase tracking-wide">CPU</span>
                  </div>
                </div>
 
                {/* Mini cpu details */}
                <div className="mt-1 flex items-center gap-1 text-[8px] font-mono text-slate-400">
                  <Activity className="w-2.5 h-2.5" style={{ color: colors.cpu }} />
                  <span>Load: Active</span>
                </div>
              </div>

              {/* RAM CIRCULAR GAUGE */}
              <div className="flex flex-col items-center justify-center text-center">
                <div className="relative flex items-center justify-center w-16 h-16">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="32"
                      cy="32"
                      r={radius}
                      className={isDark ? 'stroke-slate-800/50' : 'stroke-slate-200'}
                      strokeWidth={strokeWidth}
                      fill="transparent"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r={radius}
                      className="transition-all duration-300"
                      style={{ stroke: colors.mem }}
                      strokeWidth={strokeWidth}
                      fill="transparent"
                      strokeDasharray={circumference}
                      strokeDashoffset={getStrokeDashOffset(ramUsagePercent)}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
                    <span className="text-xs font-bold font-mono" style={{ color: colors.mem }}>{ramUsagePercent}%</span>
                    <span className="text-[7px] font-mono text-slate-400 mt-0.5 uppercase tracking-wide">RAM</span>
                  </div>
                </div>

                {/* Mini ram details */}
                <span className="mt-1 text-[8px] font-mono text-slate-400">
                  {ramUsedGB}G / {ramTotalGB}G
                </span>
              </div>

            </div>

            {/* REAL-TIME MICRO-SPARKLINE INTEGRATION */}
            <div className={`p-2 rounded-xl border flex flex-col justify-between h-14 ${
              isDark ? 'bg-slate-950/40 border-slate-900/60' : 'bg-slate-50 border-slate-250/20'
            }`}>
              <div className="flex items-center justify-between text-[8px] font-mono text-slate-400">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colors.cpu }}></span>
                  CPU Sparkline
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colors.mem }}></span>
                  RAM Sparkline
                </span>
              </div>
              
              <div className="relative h-6 w-full mt-1 overflow-hidden">
                {/* Embedded High-Performance Sparklines */}
                {history.length > 1 ? (
                  <svg className="w-full h-full" preserveAspectRatio="none">
                    {/* CPU Sparkline Path */}
                    <polyline
                      fill="none"
                      stroke={colors.cpu}
                      strokeWidth="1.2"
                      points={getSparklinePoints('cpu', 260, 24)}
                      className="transition-all duration-300"
                    />
                    {/* RAM Sparkline Path */}
                    <polyline
                      fill="none"
                      stroke={colors.mem}
                      strokeWidth="1.2"
                      points={getSparklinePoints('memory', 260, 24)}
                      className="transition-all duration-300"
                    />
                  </svg>
                ) : (
                  <div className="h-full flex items-center justify-center text-[8px] font-mono text-slate-500">
                    Waiting for metrics...
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
