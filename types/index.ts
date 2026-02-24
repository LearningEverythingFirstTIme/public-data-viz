export interface DataPoint {
  x: string | number | Date;
  y: number;
  label?: string;
}

export interface DataSet {
  id: string;
  name: string;
  data: DataPoint[];
  ohlcvData?: OHLCVDataPoint[];
  metadata?: {
    unit?: string;
    source?: string;
    lastUpdated?: Date;
    isOHLCV?: boolean;
  };
}

export type ChartType = 'line' | 'bar' | 'area' | 'scatter' | 'pie' | 'stat' | 'candlestick';

// OHLCV Data Point for candlestick charts
export interface OHLCVDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// Extended DataSet that includes OHLCV data
export interface OHLCVDataSet extends Omit<DataSet, 'data'> {
  data: OHLCVDataPoint[];
  isOHLCV: true;
}

export interface WidgetConfig {
  id: string;
  type: ChartType;
  title: string;
  dataSource: string;
  dataSourceConfig: {
    indicator?: string;
    country?: string;
    symbol?: string;
    days?: string;
    startDate?: string;
    endDate?: string;
    frequency?: string;
  };
  chartConfig: {
    colorTheme: string;
    showGrid?: boolean;
    showLegend?: boolean;
    lineSmooth?: boolean;
    fillArea?: boolean;
  };
}

export interface WidgetLayout {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
}

export interface Dashboard {
  id: string;
  userId: string;
  name: string;
  description?: string;
  isPublic: boolean;
  widgets: WidgetConfig[];
  layout: WidgetLayout[];
  createdAt: Date;
  updatedAt: Date;
}

export interface DataSource {
  id: string;
  name: string;
  description: string;
  category: 'economic' | 'crypto' | 'demographic' | 'financial';
  indicators: DataSourceIndicator[];
}

export interface DataSourceIndicator {
  id: string;
  name: string;
  description: string;
  unit?: string;
  defaultParams?: Record<string, string>;
}
