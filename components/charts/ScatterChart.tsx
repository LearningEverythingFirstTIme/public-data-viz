'use client';

import { useMemo } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ZAxis,
} from 'recharts';
import { DataSet } from '@/types';
import { colorThemes, ColorThemeKey } from '@/lib/data/connectors';

interface ScatterChartProps {
  data: DataSet;
  colorTheme?: ColorThemeKey;
  showGrid?: boolean;
  height?: number;
}

export function ScatterChartComponent({
  data,
  colorTheme = 'teal',
  showGrid = true,
  height = 300,
}: ScatterChartProps) {
  const theme = colorThemes[colorTheme];

  const chartData = useMemo(() => {
    return data.data.map((point, index) => ({
      x: index,
      y: point.y,
      label: point.x,
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
      <ScatterChart margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        {showGrid && (
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#1E2330"
          />
        )}
        
        <XAxis
          type="number"
          dataKey="x"
          stroke="#6B7280"
          fontSize={12}
          tickLine={false}
          axisLine={{ stroke: '#1E2330' }}
          hide
        />
        
        <YAxis
          type="number"
          dataKey="y"
          stroke="#6B7280"
          fontSize={12}
          tickLine={false}
          axisLine={{ stroke: '#1E2330' }}
          tickFormatter={formatValue}
        />
        
        <ZAxis type="number" dataKey="z" range={[50, 400]} />
        
        <Tooltip
          cursor={{ strokeDasharray: '3 3' }}
          contentStyle={{
            backgroundColor: '#13161E',
            border: '1px solid #1E2330',
            borderRadius: '8px',
            color: '#F9FAFB',
          }}
          formatter={(value: number | undefined, name: string | undefined, props: any) => {
            if (name === 'y') {
              return [`${formatValue(value || 0)} ${data.metadata?.unit || ''}`, data.name];
            }
            return [value || 0, name || ''];
          }}
          labelFormatter={(label: any, payload: any) => {
            if (payload && payload[0]) {
              return payload[0].payload.label;
            }
            return '';
          }}
        />
        
        <Scatter
          name={data.name}
          data={chartData}
          fill={theme.primary}
        />
      </ScatterChart>
    </ResponsiveContainer>
  );
}
