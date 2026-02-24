'use client';

import { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { DataSet } from '@/types';
import { colorThemes, ColorThemeKey } from '@/lib/data/connectors';

interface PieChartProps {
  data: DataSet;
  colorTheme?: ColorThemeKey;
  height?: number;
}

export function PieChartComponent({
  data,
  colorTheme = 'teal',
  height = 300,
}: PieChartProps) {
  const theme = colorThemes[colorTheme];

  // Generate additional colors based on the theme
  const colors = useMemo(() => {
    const baseColors = [
      theme.primary,
      theme.secondary,
      ...theme.gradient,
      '#A855F7',
      '#F43F5E',
      '#06B6D4',
      '#F5A623',
    ];
    return baseColors;
  }, [theme]);

  const chartData = useMemo(() => {
    // For pie chart, we'll use the data points directly
    // Limit to top 10 values for readability
    return data.data
      .slice(-10)
      .map((point) => ({
        name: String(point.x),
        value: point.y,
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
      <PieChart>
        <Tooltip
          contentStyle={{
            backgroundColor: '#13161E',
            border: '1px solid #1E2330',
            borderRadius: '8px',
            color: '#F9FAFB',
          }}
          formatter={(value: number) => [
            `${formatValue(value)} ${data.metadata?.unit || ''}`,
          ]}
        />
        
        <Legend
          verticalAlign="bottom"
          height={36}
          iconType="circle"
          wrapperStyle={{
            color: '#6B7280',
            fontSize: '12px',
          }}
        />
        
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={colors[index % colors.length]}
            />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}
