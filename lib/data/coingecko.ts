import { DataConnector } from './connectors';
import { DataSet, DataPoint, DataSourceIndicator } from '@/types';

export class CoinGeckoConnector extends DataConnector {
  id = 'coingecko';
  name = 'CoinGecko';
  category = 'crypto';
  description = 'Cryptocurrency prices and market data';

  getIndicators(): DataSourceIndicator[] {
    return [
      {
        id: 'bitcoin',
        name: 'Bitcoin (BTC)',
        description: 'Bitcoin price in USD',
        unit: 'USD',
      },
      {
        id: 'ethereum',
        name: 'Ethereum (ETH)',
        description: 'Ethereum price in USD',
        unit: 'USD',
      },
      {
        id: 'solana',
        name: 'Solana (SOL)',
        description: 'Solana price in USD',
        unit: 'USD',
      },
      {
        id: 'cardano',
        name: 'Cardano (ADA)',
        description: 'Cardano price in USD',
        unit: 'USD',
      },
      {
        id: 'polkadot',
        name: 'Polkadot (DOT)',
        description: 'Polkadot price in USD',
        unit: 'USD',
      },
      {
        id: 'chainlink',
        name: 'Chainlink (LINK)',
        description: 'Chainlink price in USD',
        unit: 'USD',
      },
    ];
  }

  async fetchData(
    indicator: string,
    params: Record<string, string>
  ): Promise<DataSet> {
    const days = params.days || '365';

    const url = `/api/data/coingecko?coin=${indicator}&days=${days}`;
    
    const data = await this.fetchWithErrorHandling(url);
    
    return this.transformData(data, indicator);
  }

  private transformData(apiData: any, indicator: string): DataSet {
    const indicatorInfo = this.getIndicators().find(i => i.id === indicator);
    
    const prices = apiData?.prices || [];

    const dataPoints: DataPoint[] = prices.map((item: [number, number]) => {
      const date = new Date(item[0]);
      return {
        x: date.toISOString().split('T')[0],
        y: item[1],
      };
    });

    return {
      id: `coingecko-${indicator}`,
      name: indicatorInfo?.name || indicator,
      data: dataPoints,
      metadata: {
        unit: 'USD',
        source: 'CoinGecko',
      },
    };
  }
}
