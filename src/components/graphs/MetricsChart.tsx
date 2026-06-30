import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { useMetricsStore } from '../../store/useMetricsStore';

interface MetricsChartProps {
  data: any[];
  dataKey: string;
  color: string; // Hex color code
  unit: string;
  height?: number;
  domain?: [any, any];
}

export const MetricsChart: React.FC<MetricsChartProps> = ({
  data,
  dataKey,
  color,
  unit,
  height = 200,
  domain = [0, 100],
}) => {
  const theme = useMetricsStore((state) => state.theme);
  const colorMode = useMetricsStore((state) => state.colorMode);
  const isDark = theme === 'dark';

  // Gradient IDs need to be unique and update on color mode switch
  const gradientId = `gradient-${dataKey}-${colorMode}`;

  // Custom tooltips
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const val = payload[0].value;
      const formattedVal =
        typeof val === 'number' ? val.toFixed(1) : val;
      return (
        <div className={`p-2 rounded-lg border text-xs shadow-md ${
          isDark
            ? 'bg-slate-900/90 border-slate-700/50 text-slate-100'
            : 'bg-white/90 border-slate-200/50 text-slate-900'
        }`}>
          <span className="font-medium">{payload[0].name || 'Value'}:</span>{' '}
          <span className="font-bold font-mono">
            {formattedVal} {unit}
          </span>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: '100%', height }} className="relative">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.4} />
              <stop offset="95%" stopColor={color} stopOpacity={0.0} />
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
            domain={domain}
            tick={{ fontSize: 10, fill: isDark ? '#94a3b8' : '#64748b', fontFamily: 'monospace' }}
            stroke="transparent"
            width={35}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={1.5}
            fillOpacity={1}
            fill={`url(#${gradientId})`}
            name={dataKey.toUpperCase()}
            isAnimationActive={false} // Disable charts animation on fast ticks to prevent rubber-banding
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
