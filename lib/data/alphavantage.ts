import { DataConnector } from './connectors';
import { DataSet, DataPoint, DataSourceIndicator, OHLCVDataPoint } from '@/types';

export class AlphaVantageConnector extends DataConnector {
  id = 'alphavantage';
  name = 'Alpha Vantage';
  category = 'financial';
  description = 'Stock prices and technical indicators from Alpha Vantage';

  getIndicators(): DataSourceIndicator[] {
    return [
      {
        id: 'TIME_SERIES_DAILY',
        name: 'Daily Stock Prices',
        description: 'Daily OHLCV stock price data',
        unit: 'USD',
        defaultParams: { symbol: 'IBM' },
      },
      {
        id: 'TIME_SERIES_INTRADAY',
        name: 'Intraday Stock Prices',
        description: 'Intraday OHLCV stock price data',
        unit: 'USD',
        defaultParams: { symbol: 'IBM', interval: '5min' },
      },
      {
        id: 'RSI',
        name: 'Relative Strength Index (RSI)',
        description: 'Technical momentum indicator',
        unit: 'Index',
        defaultParams: { symbol: 'IBM', interval: 'daily', timePeriod: '14' },
      },
      {
        id: 'MACD',
        name: 'MACD',
        description: 'Moving Average Convergence Divergence',
        unit: 'Index',
        defaultParams: { symbol: 'IBM', interval: 'daily', fastPeriod: '12', slowPeriod: '26', signalPeriod: '9' },
      },
      {
        id: 'SMA',
        name: 'Simple Moving Average (SMA)',
        description: 'Simple moving average technical indicator',
        unit: 'USD',
        defaultParams: { symbol: 'IBM', interval: 'daily', timePeriod: '20' },
      },
      {
        id: 'EMA',
        name: 'Exponential Moving Average (EMA)',
        description: 'Exponential moving average technical indicator',
        unit: 'USD',
        defaultParams: { symbol: 'IBM', interval: 'daily', timePeriod: '20' },
      },
    ];
  }

  async fetchData(
    indicator: string,
    params: Record<string, string>
  ): Promise<DataSet> {
    const symbol = params.symbol || 'IBM';
    const interval = params.interval || 'daily';
    const timePeriod = params.timePeriod || '14';
    const fastPeriod = params.fastPeriod || '12';
    const slowPeriod = params.slowPeriod || '26';
    const signalPeriod = params.signalPeriod || '9';

    let url = `/api/data/alphavantage?function=${indicator}&symbol=${symbol}`;
    
    if (indicator === 'TIME_SERIES_INTRADAY') {
      url += `&interval=${interval}`;
    } else if (indicator === 'RSI' || indicator === 'SMA' || indicator === 'EMA') {
      url += `&interval=${interval}&timePeriod=${timePeriod}`;
    } else if (indicator === 'MACD') {
      url += `&interval=${interval}&fastPeriod=${fastPeriod}&slowPeriod=${slowPeriod}&signalPeriod=${signalPeriod}`;
    }

    const data = await this.fetchWithErrorHandling(url);
    
    return this.transformData(data, indicator, symbol);
  }

  private transformData(apiData: any, indicator: string, symbol: string): DataSet {
    const indicatorInfo = this.getIndicators().find(i => i.id === indicator);
    
    let dataPoints: DataPoint[] = [];
    let ohlcvData: OHLCVDataPoint[] | undefined;

    if (indicator === 'TIME_SERIES_DAILY' || indicator === 'TIME_SERIES_INTRADAY') {
      // OHLCV data format
      const timeSeriesKey = indicator === 'TIME_SERIES_DAILY' 
        ? 'Time Series (Daily)' 
        : `Time Series (${apiData.metaData?.['4. Interval'] || '5min'})`;
      
      const timeSeries = apiData[timeSeriesKey] || {};
      
      // Create OHLCV data for candlestick charts
      ohlcvData = Object.entries(timeSeries)
        .map(([date, values]: [string, any]) => ({
          date,
          open: parseFloat(values['1. open']),
          high: parseFloat(values['2. high']),
          low: parseFloat(values['3. low']),
          close: parseFloat(values['4. close']),
          volume: parseInt(values['5. volume'], 10),
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      // Also create standard DataPoint for other chart types
      dataPoints = ohlcvData.map(d => ({
        x: d.date,
        y: d.close,
        label: `O: ${d.open} H: ${d.high} L: ${d.low} V: ${d.volume}`,
      }));
    } else {
      // Technical indicator format - find the data key (usually like "Technical Analysis: RSI")
      const dataKey = Object.keys(apiData).find(key => key.includes('Technical Analysis'));
      
      if (dataKey) {
        const technicalData = apiData[dataKey] || {};
        
        dataPoints = Object.entries(technicalData)
          .map(([date, values]: [string, any]) => {
            const valueKey = Object.keys(values)[0];
            return {
              x: date,
              y: parseFloat(values[valueKey]),
            };
          })
          .sort((a, b) => new Date(a.x as string).getTime() - new Date(b.x as string).getTime());
      }
    }

    return {
      id: `alphavantage-${indicator}-${symbol}`,
      name: `${indicatorInfo?.name || indicator} - ${symbol}`,
      data: dataPoints,
      ohlcvData, // Include OHLCV data when available
      metadata: {
        unit: indicatorInfo?.unit,
        source: 'Alpha Vantage',
        lastUpdated: new Date(),
        isOHLCV: !!ohlcvData,
      },
    };
  }
}
