import { DataConnector } from './connectors';
import { DataSet, DataPoint, DataSourceIndicator } from '@/types';

export class NOAAConnector extends DataConnector {
  id = 'noaa';
  name = 'NOAA Weather';
  category = 'weather';
  description = 'Weather forecasts and conditions from the National Weather Service';

  private baseUrl = 'https://api.weather.gov';

  getIndicators(): DataSourceIndicator[] {
    return [
      {
        id: 'temperature',
        name: 'Temperature Forecast',
        description: 'Temperature forecast in Fahrenheit',
        unit: '°F',
      },
      {
        id: 'precipitation',
        name: 'Precipitation Chance',
        description: 'Probability of precipitation',
        unit: '%',
      },
    ];
  }

  async fetchData(
    indicator: string,
    params: Record<string, string>
  ): Promise<DataSet> {
    const lat = params.lat;
    const lng = params.lng;

    if (!lat || !lng) {
      throw new Error('Latitude and longitude are required parameters');
    }

    // Step 1: Get grid point information from /points endpoint
    const pointsUrl = `${this.baseUrl}/points/${lat},${lng}`;
    
    const pointsResponse = await fetch(pointsUrl, {
      headers: {
        'User-Agent': '(datalens.app, contact@datalens.app)',
      },
    });

    if (!pointsResponse.ok) {
      throw new Error(`API error: ${pointsResponse.status} ${pointsResponse.statusText}`);
    }

    const pointsData = await pointsResponse.json();
    const forecastUrl = pointsData.properties?.forecast;

    if (!forecastUrl) {
      throw new Error('No forecast URL found for the given coordinates');
    }

    // Step 2: Get forecast data from the grid URL
    const forecastResponse = await fetch(forecastUrl, {
      headers: {
        'User-Agent': '(datalens.app, contact@datalens.app)',
      },
    });

    if (!forecastResponse.ok) {
      throw new Error(`Forecast API error: ${forecastResponse.status} ${forecastResponse.statusText}`);
    }

    const forecastData = await forecastResponse.json();
    
    return this.transformData(forecastData, indicator, lat, lng);
  }

  private transformData(
    apiData: any, 
    indicator: string, 
    lat: string, 
    lng: string
  ): DataSet {
    const indicatorInfo = this.getIndicators().find(i => i.id === indicator);
    const periods = apiData.properties?.periods || [];

    let dataPoints: DataPoint[] = [];

    if (indicator === 'temperature') {
      dataPoints = periods.map((period: any) => ({
        x: period.startTime,
        y: period.temperature,
        label: period.name,
      }));
    } else if (indicator === 'precipitation') {
      dataPoints = periods.map((period: any) => ({
        x: period.startTime,
        y: period.probabilityOfPrecipitation?.value || 0,
        label: period.name,
      }));
    }

    return {
      id: `noaa-${indicator}-${lat},${lng}`,
      name: indicatorInfo?.name || indicator,
      data: dataPoints,
      metadata: {
        unit: indicatorInfo?.unit,
        source: 'NOAA National Weather Service',
      },
    };
  }
}
