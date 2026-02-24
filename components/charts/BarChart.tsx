'use client';

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { DataSet } from '@/types';
import { colorThemes, ColorThemeKey } from '@/lib/data/connectors';

interface BarChartProps {
  data: DataSet;
  colorTheme?: ColorThemeKey;
  showGrid?: boolean;
  height?: number;
}

export function BarChartComponent({
  data,
  colorTheme = 'teal',
  showGrid = true,
  height = 300,
}: BarChartProps) {
  const theme = colorThemes[colorTheme];

  const chartData = useMemo(() => {
    return data.data.map((point) => ({
      ...point,
      x: typeof point.x === 'number' ? point.x.toString() : point.x,
    }));
  }, [data]);

  const formatValue = (value: number) => {
    if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(2)}K`;
    return value.toFixed(2);
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        {showGrid && (
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#1E2330"
            vertical={false}
          />
        )}
        
        <XAxis
          dataKey="x"
          stroke="#6B7280"
          fontSize={12}
          tickLine={false}
          axisLine={{ stroke: '#1E2330' }}
        />
        
        <YAxis
          stroke="#6B7280"
          fontSize={12}
          tickLine={false}
          axisLine={{ stroke: '#1E2330' }}
          tickFormatter={formatValue}
        />
        
        <Tooltip
          contentStyle={{
            backgroundColor: '#13161E',
            border: '1px solid #1E2330',
            borderRadius: '8px',
            color: '#F9FAFB',
          }}
          formatter={(value: number | undefined) => [
            `${formatValue(value || 0)} ${data.metadata?.unit || ''}`,
            data.name,
          ]}
          labelStyle={{ color: '#6B7280' }}
        />
        
        <Bar
          dataKey="y"
          fill={theme.primary}
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
