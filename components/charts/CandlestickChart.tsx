'use client';

import { useMemo } from 'react';
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { DataSet, OHLCVDataPoint } from '@/types';
import { colorThemes, ColorThemeKey } from '@/lib/data/connectors';

interface CandlestickChartProps {
  data: DataSet;
  colorTheme?: ColorThemeKey;
  showGrid?: boolean;
  height?: number;
}

/**
 * Validates if the data is in OHLCV format (Open, High, Low, Close, Volume)
 * Returns true if all required fields are present in the data points
 */
export function supportsDataType(data: DataSet): boolean {
  if (!data) {
    return false;
  }

  // Check for ohlcvData field (preferred format from Alpha Vantage)
  if (data.ohlcvData && Array.isArray(data.ohlcvData) && data.ohlcvData.length > 0) {
    const firstPoint = data.ohlcvData[0];
    const requiredFields = ['open', 'high', 'low', 'close', 'volume'];
    const hasAllFields = requiredFields.every(
      (field) => typeof firstPoint[field as keyof OHLCVDataPoint] === 'number'
    );
    return hasAllFields;
  }

  // Check data.data array for OHLCV format
  if (!Array.isArray(data.data) || data.data.length === 0) {
    return false;
  }

  const firstPoint = data.data[0];
  
  // Check for required OHLCV fields
  const requiredFields = ['open', 'high', 'low', 'close', 'volume'];
  const hasAllFields = requiredFields.every(
    (field) => typeof firstPoint[field as keyof typeof firstPoint] === 'number'
  );

  // Also need a date field (can be 'date' or 'x')
  const hasDateField = 'date' in firstPoint || 'x' in firstPoint;

  return hasAllFields && hasDateField;
}

/**
 * Custom tooltip for candlestick charts showing OHLCV data
 */
function CandlestickTooltip({ 
  active, 
  payload, 
  label 
}: { 
  active?: boolean; 
  payload?: any[]; 
  label?: string;
}) {
  if (active && payload && payload.length > 0) {
    const data = payload[0].payload;
    const isGreen = data.close >= data.open;
    
    return (
      <div className="bg-[#13161E] border border-[#1E2330] rounded-lg p-3 text-sm shadow-xl">
        <p className="text-gray-400 mb-2 font-medium">{label}</p>
        <div className="space-y-1">
          <div className="flex justify-between gap-6">
            <span className="text-gray-500">Open:</span>
            <span className="text-gray-200 font-mono">{data.open?.toFixed(4)}</span>
          </div>
          <div className="flex justify-between gap-6">
            <span className="text-gray-500">High:</span>
            <span className="text-gray-200 font-mono">{data.high?.toFixed(4)}</span>
          </div>
          <div className="flex justify-between gap-6">
            <span className="text-gray-500">Low:</span>
            <span className="text-gray-200 font-mono">{data.low?.toFixed(4)}</span>
          </div>
          <div className="flex justify-between gap-6">
            <span className="text-gray-500">Close:</span>
            <span className={isGreen ? 'text-green-400 font-mono' : 'text-red-400 font-mono'}>
              {data.close?.toFixed(4)}
            </span>
          </div>
          <div className="flex justify-between gap-6 pt-2 border-t border-[#1E2330] mt-2">
            <span className="text-gray-500">Volume:</span>
            <span className="text-gray-200 font-mono">
              {data.volume >= 1e9 
                ? `${(data.volume / 1e9).toFixed(2)}B`
                : data.volume >= 1e6
                ? `${(data.volume / 1e6).toFixed(2)}M`
                : data.volume >= 1e3
                ? `${(data.volume / 1e3).toFixed(2)}K`
                : data.volume.toFixed(0)}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
}

/**
 * Custom candlestick shape for Recharts Bar component
 * Renders a full candlestick with body and wicks
 */
function CandlestickShape(props: any) {
  const { x, y, width, height, payload } = props;
  
  if (!payload) return null;
  
  const { open, high, low, close } = payload;
  const isGreen = close >= open;
  const color = isGreen ? '#10B981' : '#EF4444';
  
  // Calculate positions
  const candleWidth = Math.max(width * 0.6, 2);
  const halfWidth = candleWidth / 2;
  const centerX = x + width / 2;
  
  // Scale factor (will be applied via coordinate system)
  const priceRange = payload._priceRange || { min: low, max: high };
  const chartHeight = payload._chartHeight || height;
  
  // Calculate Y positions (invert because SVG Y increases downward)
  const getY = (price: number) => {
    const ratio = (price - priceRange.min) / (priceRange.max - priceRange.min);
    return y + height - (ratio * height);
  };
  
  const yHigh = getY(high);
  const yLow = getY(low);
  const yOpen = getY(open);
  const yClose = getY(close);
  
  const bodyTop = Math.min(yOpen, yClose);
  const bodyBottom = Math.max(yOpen, yClose);
  const bodyHeight = Math.max(bodyBottom - bodyTop, 1);
  
  return (
    <g>
      {/* High-Low wick */}
      <line
        x1={centerX}
        y1={yHigh}
        x2={centerX}
        y2={yLow}
        stroke={color}
        strokeWidth={1}
      />
      {/* Candle body */}
      <rect
        x={centerX - halfWidth}
        y={bodyTop}
        width={candleWidth}
        height={bodyHeight}
        fill={isGreen ? color : color}
        stroke={color}
        strokeWidth={1}
      />
    </g>
  );
}

export function CandlestickChartComponent({
  data,
  colorTheme = 'teal',
  showGrid = true,
  height = 300,
}: CandlestickChartProps) {
  const theme = colorThemes[colorTheme];

  // Validate data format
  const isValidData = useMemo(() => supportsDataType(data), [data]);

  // Transform and prepare chart data
  const { chartData, priceRange, maxVolume } = useMemo(() => {
    if (!isValidData) {
      return { chartData: [], priceRange: { min: 0, max: 100 }, maxVolume: 0 };
    }

    // Use ohlcvData if available (from Alpha Vantage), otherwise fall back to data.data
    const ohlcvData = data.ohlcvData || (data.data as unknown as OHLCVDataPoint[]);

    const processed = ohlcvData.map((point) => ({
      ...point,
      date: point.date || (point as any).x,
      // Calculate range for candle body
      range: point.high - point.low,
      // Determine color based on open/close
      isGreen: point.close >= point.open,
    }));

    // Calculate price range
    const highs = processed.map((d) => d.high);
    const lows = processed.map((d) => d.low);
    const maxPrice = Math.max(...highs);
    const minPrice = Math.min(...lows);
    const padding = (maxPrice - minPrice) * 0.05 || maxPrice * 0.05;

    // Calculate max volume
    const volumes = processed.map((d) => d.volume);
    const maxVol = Math.max(...volumes);

    // Add metadata for rendering
    const withMeta = processed.map((d) => ({
      ...d,
      _priceRange: { min: Math.max(0, minPrice - padding), max: maxPrice + padding },
    }));

    return {
      chartData: withMeta,
      priceRange: { min: Math.max(0, minPrice - padding), max: maxPrice + padding },
      maxVolume: maxVol,
    };
  }, [data, isValidData]);

  // Format value for axis labels
  const formatValue = (value: number) => {
    if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
    return value.toFixed(2);
  };

  // Show error if data is not in OHLCV format
  if (!isValidData) {
    return (
      <div 
        className="w-full flex items-center justify-center bg-[#0A0C10] rounded-lg border border-red-900/30"
        style={{ height }}
      >
        <div className="text-center p-6">
          <div className="text-red-400 text-lg mb-2 font-medium">⚠️ Invalid Data Format</div>
          <p className="text-gray-400 text-sm max-w-xs">
            Candlestick charts require OHLCV data (Open, High, Low, Close, Volume).
            <br />
            <span className="text-xs text-gray-500 mt-2 block">
              Please select a data source that provides OHLCV data, such as
              stock price data from Alpha Vantage.
            </span>
          </p>
        </div>
      </div>
    );
  }

  const candleWidth = chartData.length > 100 ? 1 : chartData.length > 50 ? 2 : 4;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart
        data={chartData}
        margin={{ top: 10, right: 50, left: 0, bottom: 0 }}
      >
        {showGrid && (
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#1E2330"
            vertical={false}
          />
        )}
        
        {/* X Axis - Date */}
        <XAxis
          dataKey="date"
          stroke="#6B7280"
          fontSize={11}
          tickLine={false}
          axisLine={{ stroke: '#1E2330' }}
          tickFormatter={(value: string) => {
            if (!value) return '';
            const date = new Date(value);
            return date.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            });
          }}
          interval="preserveStartEnd"
          minTickGap={30}
        />
        
        {/* Primary Y Axis - Price */}
        <YAxis
          yAxisId="price"
          orientation="left"
          stroke="#6B7280"
          fontSize={11}
          tickLine={false}
          axisLine={{ stroke: '#1E2330' }}
          domain={[priceRange.min, priceRange.max]}
          tickFormatter={formatValue}
          width={60}
        />
        
        {/* Secondary Y Axis - Volume */}
        <YAxis
          yAxisId="volume"
          orientation="right"
          stroke="#6B7280"
          fontSize={10}
          tickLine={false}
          axisLine={{ stroke: '#1E2330' }}
          domain={[0, maxVolume * 5]}
          tickFormatter={(value: number) => {
            if (value >= 1e9) return `${(value / 1e9).toFixed(0)}B`;
            if (value >= 1e6) return `${(value / 1e6).toFixed(0)}M`;
            if (value >= 1e3) return `${(value / 1e3).toFixed(0)}K`;
            return value.toFixed(0);
          }}
          width={45}
        />
        
        <Tooltip content={<CandlestickTooltip />} />
        
        {/* Volume bars at bottom */}
        <Bar
          yAxisId="volume"
          dataKey="volume"
          barSize={candleWidth + 1}
          opacity={0.4}
        >
          {chartData.map((entry: any, index: number) => (
            <Cell 
              key={`volume-${index}`} 
              fill={entry.isGreen ? '#10B981' : '#EF4444'} 
            />
          ))}
        </Bar>
        
        {/* Candlestick bars - using range to create the visual */}
        <Bar
          yAxisId="price"
          dataKey="high"
          shape={<CandlestickShape />}
          barSize={candleWidth + 2}
        >
          {chartData.map((entry: any, index: number) => (
            <Cell 
              key={`candle-${index}`} 
              fill={entry.isGreen ? '#10B981' : '#EF4444'}
            />
          ))}
        </Bar>
      </ComposedChart>
    </ResponsiveContainer>
  );
}
