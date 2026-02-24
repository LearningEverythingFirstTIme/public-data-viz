import { DataConnector } from './connectors';
import { DataSet, DataPoint, DataSourceIndicator } from '@/types';

export class FREDConnector extends DataConnector {
  id = 'fred';
  name = 'FRED Economic Data';
  category = 'economic';
  description = 'US Federal Reserve Economic Data';

  getIndicators(): DataSourceIndicator[] {
    return [
      {
        id: 'GDP',
        name: 'Gross Domestic Product',
        description: 'US GDP in billions of dollars',
        unit: 'Billions USD',
      },
      {
        id: 'UNRATE',
        name: 'Unemployment Rate',
        description: 'US civilian unemployment rate',
        unit: '%',
      },
      {
        id: 'CPIAUCSL',
        name: 'Consumer Price Index',
        description: 'All Urban Consumers CPI',
        unit: 'Index',
      },
      {
        id: 'FEDFUNDS',
        name: 'Federal Funds Rate',
        description: 'Effective federal funds rate',
        unit: '%',
      },
      {
        id: 'T10Y2Y',
        name: '10Y-2Y Treasury Spread',
        description: '10-Year minus 2-Year Treasury spread',
        unit: '%',
      },
      {
        id: 'DEXUSEU',
        name: 'USD/EUR Exchange Rate',
        description: 'US Dollars to Euro spot exchange rate',
        unit: 'USD/EUR',
      },
      {
        id: 'SP500',
        name: 'S&P 500',
        description: 'S&P 500 index',
        unit: 'Index',
      },
      {
        id: 'M2SL',
        name: 'M2 Money Supply',
        description: 'M2 money stock in billions',
        unit: 'Billions USD',
      },
    ];
  }

  async fetchData(
    indicator: string,
    params: Record<string, string>
  ): Promise<DataSet> {
    const startDate = params.startDate || '2015-01-01';
    const endDate = params.endDate || new Date().toISOString().split('T')[0];

    const url = `/api/data/fred?series=${indicator}&startDate=${startDate}&endDate=${endDate}`;
    
    const data = await this.fetchWithErrorHandling(url);
    
    return this.transformData(data, indicator);
  }

  private transformData(apiData: any, indicator: string): DataSet {
    const indicatorInfo = this.getIndicators().find(i => i.id === indicator);
    
    const observations = apiData?.observations || [];

    const dataPoints: DataPoint[] = observations
      .filter((item: any) => item.value !== '.' && item.value !== null)
      .map((item: any) => ({
        x: item.date,
        y: parseFloat(item.value),
      }));

    return {
      id: `fred-${indicator}`,
      name: indicatorInfo?.name || indicator,
      data: dataPoints,
      metadata: {
        unit: indicatorInfo?.unit,
        source: 'FRED',
      },
    };
  }
}
