import { DataConnector } from './connectors';
import { DataSet, DataPoint, DataSourceIndicator } from '@/types';

export class WorldBankConnector extends DataConnector {
  id = 'worldbank';
  name = 'World Bank';
  category = 'demographic';
  description = 'Global economic and demographic data from the World Bank';

  private baseUrl = 'https://api.worldbank.org/v2';

  getIndicators(): DataSourceIndicator[] {
    return [
      {
        id: 'NY.GDP.MKTP.CD',
        name: 'GDP (Current US$)',
        description: 'Gross Domestic Product in current US dollars',
        unit: 'USD',
      },
      {
        id: 'NY.GDP.MKTP.KD.ZG',
        name: 'GDP Growth (Annual %)',
        description: 'Annual GDP growth rate',
        unit: '%',
      },
      {
        id: 'SP.POP.TOTL',
        name: 'Total Population',
        description: 'Total population count',
        unit: 'people',
      },
      {
        id: 'SP.POP.GROW',
        name: 'Population Growth (Annual %)',
        description: 'Annual population growth rate',
        unit: '%',
      },
      {
        id: 'FP.CPI.TOTL.ZG',
        name: 'Inflation (Annual %)',
        description: 'Consumer price index inflation',
        unit: '%',
      },
      {
        id: 'SL.UEM.TOTL.ZS',
        name: 'Unemployment Rate',
        description: 'Total unemployment as percentage of labor force',
        unit: '%',
      },
      {
        id: 'SE.XPD.TOTL.GD.ZS',
        name: 'Government Expenditure on Education (% of GDP)',
        description: 'Government spending on education as percentage of GDP',
        unit: '%',
      },
      {
        id: 'SH.XPD.CHEX.GD.ZS',
        name: 'Current Health Expenditure (% of GDP)',
        description: 'Health expenditure as percentage of GDP',
        unit: '%',
      },
    ];
  }

  async fetchData(
    indicator: string,
    params: Record<string, string>
  ): Promise<DataSet> {
    const country = params.country || 'US';
    const startDate = params.startDate || '2015';
    const endDate = params.endDate || '2024';

    const url = `/api/data/worldbank?indicator=${indicator}&country=${country}&startDate=${startDate}&endDate=${endDate}`;
    
    const data = await this.fetchWithErrorHandling(url);
    
    return this.transformData(data, indicator);
  }

  private transformData(apiData: any, indicator: string): DataSet {
    const indicatorInfo = this.getIndicators().find(i => i.id === indicator);
    
    // World Bank returns [metadata, dataArray]
    const rawData = Array.isArray(apiData) && apiData.length > 1 
      ? apiData[1] 
      : [];

    const dataPoints: DataPoint[] = rawData
      .filter((item: any) => item.value !== null)
      .map((item: any) => ({
        x: parseInt(item.date),
        y: item.value,
        label: item.country?.value || '',
      }))
      .sort((a: DataPoint, b: DataPoint) => (a.x as number) - (b.x as number));

    return {
      id: `worldbank-${indicator}`,
      name: indicatorInfo?.name || indicator,
      data: dataPoints,
      metadata: {
        unit: indicatorInfo?.unit,
        source: 'World Bank',
      },
    };
  }
}
