import { DataConnector } from './connectors';
import { DataSet, DataPoint, DataSourceIndicator } from '@/types';

export class UNDataConnector extends DataConnector {
  id = 'undata';
  name = 'UN Data Portal';
  category = 'demographic';
  description = 'Demographic and social statistics from the United Nations';

  private baseUrl = 'https://population.un.org/dataportalapi/api/v1';

  // Indicator IDs for UN Data Portal
  private indicatorMap: Record<string, string> = {
    'life_expectancy': '47', // Life expectancy at birth
    'literacy_rate': '72',   // Literacy rate
    'fertility_rate': '68',  // Total fertility rate
  };

  getIndicators(): DataSourceIndicator[] {
    return [
      {
        id: 'life_expectancy',
        name: 'Life Expectancy at Birth',
        description: 'Average number of years a newborn is expected to live',
        unit: 'years',
      },
      {
        id: 'literacy_rate',
        name: 'Literacy Rate',
        description: 'Percentage of population aged 15+ who can read and write',
        unit: '%',
      },
      {
        id: 'fertility_rate',
        name: 'Total Fertility Rate',
        description: 'Average number of children born to a woman during her reproductive years',
        unit: 'children per woman',
      },
    ];
  }

  async fetchData(
    indicator: string,
    params: Record<string, string>
  ): Promise<DataSet> {
    const location = params.location || '900'; // Default to World (900)
    const indicatorId = this.indicatorMap[indicator];

    if (!indicatorId) {
      throw new Error(`Unknown indicator: ${indicator}`);
    }

    const allData: any[] = [];
    let nextPageUrl: string | null = `${this.baseUrl}/data/indicators/${indicatorId}/locations/${location}/start/1950/end/2024`;

    // Handle pagination by following nextPage links
    while (nextPageUrl) {
      // eslint-disable-next-line no-await-in-loop
      const data = await this.fetchWithErrorHandling(nextPageUrl);
      
      if (data.data && Array.isArray(data.data)) {
        allData.push(...data.data);
      }

      // Check for next page
      nextPageUrl = data.nextPage || null;
    }

    return this.transformData(allData, indicator, location);
  }

  private transformData(
    apiData: any[], 
    indicator: string, 
    location: string
  ): DataSet {
    const indicatorInfo = this.getIndicators().find(i => i.id === indicator);

    const dataPoints: DataPoint[] = apiData
      .filter((item: any) => item.value !== null && item.value !== undefined)
      .map((item: any) => ({
        x: parseInt(item.timeLabel) || item.timeLabel,
        y: parseFloat(item.value),
        label: item.locationName || location,
      }))
      .sort((a: DataPoint, b: DataPoint) => {
        const aVal = typeof a.x === 'number' ? a.x : parseInt(a.x as string);
        const bVal = typeof b.x === 'number' ? b.x : parseInt(b.x as string);
        return aVal - bVal;
      });

    return {
      id: `undata-${indicator}-${location}`,
      name: indicatorInfo?.name || indicator,
      data: dataPoints,
      metadata: {
        unit: indicatorInfo?.unit,
        source: 'UN Data Portal',
      },
    };
  }
}
