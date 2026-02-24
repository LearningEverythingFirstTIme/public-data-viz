'use client';

import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { DataSet } from '@/types';
import { colorThemes, ColorThemeKey } from '@/lib/data/connectors';

interface StatCardProps {
  data: DataSet;
  colorTheme?: ColorThemeKey;
}

export function StatCardComponent({
  data,
  colorTheme = 'teal',
}: StatCardProps) {
  const theme = colorThemes[colorTheme];

  const stats = useMemo(() => {
    if (!data.data.length) {
      return {
        current: 0,
        previous: 0,
        change: 0,
        changePercent: 0,
        min: 0,
        max: 0,
        avg: 0,
      };
    }

    const values = data.data.map((d) => d.y);
    const current = values[values.length - 1];
    const previous = values.length > 1 ? values[values.length - 2] : current;
    const change = current - previous;
    const changePercent = previous !== 0 ? (change / previous) * 100 : 0;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;

    return {
      current,
      previous,
      change,
      changePercent,
      min,
      max,
      avg,
    };
  }, [data]);

  const formatValue = (value: number) => {
    if (Math.abs(value) >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
    if (Math.abs(value) >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
    if (Math.abs(value) >= 1e3) return `${(value / 1e3).toFixed(2)}K`;
    return value.toFixed(2);
  };

  const getTrendIcon = () => {
    if (stats.changePercent > 0.1) {
      return <TrendingUp className="w-5 h-5" style={{ color: '#00D4AA' }} />;
    } else if (stats.changePercent < -0.1) {
      return <TrendingDown className="w-5 h-5" style={{ color: '#F43F5E' }} />;
    }
    return <Minus className="w-5 h-5" style={{ color: '#6B7280' }} />;
  };

  const getTrendColor = () => {
    if (stats.changePercent > 0.1) return '#00D4AA';
    if (stats.changePercent < -0.1) return '#F43F5E';
    return '#6B7280';
  };

  return (
    <div className="h-full flex flex-col justify-center p-6">
      <div className="mb-4">
        <p className="text-sm text-gray-400 mb-1">{data.name}</p>
        <div className="flex items-baseline gap-2">
          <h2 className="text-4xl font-bold" style={{ color: theme.primary }}>
            {formatValue(stats.current)}
          </h2>
          <span className="text-sm text-gray-500">
            {data.metadata?.unit}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-6">
        {getTrendIcon()}
        <span
          className="text-sm font-medium"
          style={{ color: getTrendColor() }}
        >
          {stats.changePercent > 0 ? '+' : ''}
          {stats.changePercent.toFixed(2)}%
        </span>
        <span className="text-xs text-gray-500">
          vs previous
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#1E2330]">
        <div>
          <p className="text-xs text-gray-500 mb-1">Min</p>
          <p className="text-sm font-medium text-gray-300">
            {formatValue(stats.min)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Avg</p>
          <p className="text-sm font-medium text-gray-300">
            {formatValue(stats.avg)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Max</p>
          <p className="text-sm font-medium text-gray-300">
            {formatValue(stats.max)}
          </p>
        </div>
      </div>
    </div>
  );
}
