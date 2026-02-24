import { DataSet, DataSource, DataSourceIndicator } from '@/types';

export abstract class DataConnector {
  abstract id: string;
  abstract name: string;
  abstract category: string;
  abstract description: string;
  
  abstract getIndicators(): DataSourceIndicator[];
  abstract fetchData(
    indicator: string,
    params: Record<string, string>
  ): Promise<DataSet>;

  protected async fetchWithErrorHandling(url: string): Promise<any> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    return response.json();
  }
}

export const colorThemes = {
  teal: {
    primary: '#00D4AA',
    secondary: '#00B894',
    gradient: ['#00D4AA', '#00B894', '#00A383'],
  },
  amber: {
    primary: '#F5A623',
    secondary: '#E6951A',
    gradient: ['#F5A623', '#E6951A', '#D4840F'],
  },
  purple: {
    primary: '#A855F7',
    secondary: '#9333EA',
    gradient: ['#A855F7', '#9333EA', '#7C3AED'],
  },
  rose: {
    primary: '#F43F5E',
    secondary: '#E11D48',
    gradient: ['#F43F5E', '#E11D48', '#BE123C'],
  },
  cyan: {
    primary: '#06B6D4',
    secondary: '#0891B2',
    gradient: ['#06B6D4', '#0891B2', '#0E7490'],
  },
};

export type ColorThemeKey = keyof typeof colorThemes;
