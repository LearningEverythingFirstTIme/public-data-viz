export interface DataPoint {
  x: string | number | Date;
  y: number;
  label?: string;
}

export interface DataSet {
  id: string;
  name: string;
  data: DataPoint[];
  metadata?: {
    unit?: string;
    source?: string;
    lastUpdated?: Date;
  };
}

export type ChartType = 'line' | 'bar' | 'area' | 'scatter' | 'pie' | 'stat';

export interface WidgetConfig {
  id: string;
  type: ChartType;
  title: string;
  dataSource: string;
  dataSourceConfig: {
    indicator?: string;
    country?: string;
    symbol?: string;
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
