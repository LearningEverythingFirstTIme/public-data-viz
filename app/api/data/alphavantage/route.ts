import { NextRequest, NextResponse } from 'next/server';

const API_KEY = process.env.ALPHA_VANTAGE_API_KEY || 'demo';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const function_ = searchParams.get('function');
    const symbol = searchParams.get('symbol') || 'IBM';
    const interval = searchParams.get('interval') || '5min';
    const timePeriod = searchParams.get('timePeriod') || '14';
    const fastPeriod = searchParams.get('fastPeriod') || '12';
    const slowPeriod = searchParams.get('slowPeriod') || '26';
    const signalPeriod = searchParams.get('signalPeriod') || '9';

    if (!function_) {
      return NextResponse.json(
        { error: 'Function parameter is required' },
        { status: 400 }
      );
    }

    let url = `https://www.alphavantage.co/query?function=${function_}&symbol=${symbol}&apikey=${API_KEY}`;

    // Add function-specific parameters
    if (function_ === 'TIME_SERIES_INTRADAY') {
      url += `&interval=${interval}`;
    } else if (function_ === 'RSI' || function_ === 'SMA' || function_ === 'EMA') {
      url += `&interval=${interval}&time_period=${timePeriod}&series_type=close`;
    } else if (function_ === 'MACD') {
      url += `&interval=${interval}&fastperiod=${fastPeriod}&slowperiod=${slowPeriod}&signalperiod=${signalPeriod}&series_type=close`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Alpha Vantage API error: ${response.status}`);
    }

    const data = await response.json();

    // Check for API error messages
    if (data['Error Message']) {
      console.warn('Alpha Vantage API error:', data['Error Message']);
      // Return mock data for demonstration
      return NextResponse.json(generateMockAlphaVantageData(function_, symbol, interval));
    }

    // Check for API rate limit or demo key limitation
    if (data['Note'] || data['Information']) {
      console.warn('Alpha Vantage API note:', data['Note'] || data['Information']);
      // Return mock data for demonstration
      return NextResponse.json(generateMockAlphaVantageData(function_, symbol, interval));
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Alpha Vantage API error:', error);
    // Return mock data on error
    const function_ = new URL(request.url).searchParams.get('function') || 'TIME_SERIES_DAILY';
    const symbol = new URL(request.url).searchParams.get('symbol') || 'IBM';
    const interval = new URL(request.url).searchParams.get('interval') || '5min';
    return NextResponse.json(generateMockAlphaVantageData(function_, symbol, interval));
  }
}

function generateMockAlphaVantageData(function_: string, symbol: string, interval: string) {
  const now = new Date();
  const data: any = {};

  if (function_ === 'TIME_SERIES_DAILY') {
    data['Meta Data'] = {
      '1. Information': 'Daily Prices (open, high, low, close) and Volumes',
      '2. Symbol': symbol,
      '3. Last Refreshed': now.toISOString().split('T')[0],
      '4. Output Size': 'Compact',
      '5. Time Zone': 'US/Eastern',
    };

    const timeSeries: Record<string, any> = {};
    let basePrice = 150;

    for (let i = 100; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const change = (Math.random() - 0.48) * 5;
      basePrice = Math.max(100, basePrice + change);
      const open = basePrice + (Math.random() - 0.5) * 2;
      const high = Math.max(open, basePrice) + Math.random() * 2;
      const low = Math.min(open, basePrice) - Math.random() * 2;
      const close = basePrice;
      const volume = Math.floor(1000000 + Math.random() * 5000000);

      timeSeries[dateStr] = {
        '1. open': open.toFixed(4),
        '2. high': high.toFixed(4),
        '3. low': low.toFixed(4),
        '4. close': close.toFixed(4),
        '5. volume': volume.toString(),
      };
    }

    data['Time Series (Daily)'] = timeSeries;
  } else if (function_ === 'TIME_SERIES_INTRADAY') {
    data['Meta Data'] = {
      '1. Information': `Intraday (${interval}) open, high, low, close prices and volume`,
      '2. Symbol': symbol,
      '3. Last Refreshed': now.toISOString(),
      '4. Interval': interval,
      '5. Output Size': 'Compact',
      '6. Time Zone': 'US/Eastern',
    };

    const timeSeries: Record<string, any> = {};
    let basePrice = 150;
    const intervalMinutes = parseInt(interval) || 5;

    for (let i = 100; i >= 0; i--) {
      const date = new Date(now);
      date.setMinutes(date.getMinutes() - i * intervalMinutes);
      const dateStr = date.toISOString().replace('T', ' ').substring(0, 19);

      const change = (Math.random() - 0.48) * 2;
      basePrice = Math.max(100, basePrice + change);
      const open = basePrice + (Math.random() - 0.5) * 1;
      const high = Math.max(open, basePrice) + Math.random() * 1;
      const low = Math.min(open, basePrice) - Math.random() * 1;
      const close = basePrice;
      const volume = Math.floor(100000 + Math.random() * 500000);

      timeSeries[dateStr] = {
        '1. open': open.toFixed(4),
        '2. high': high.toFixed(4),
        '3. low': low.toFixed(4),
        '4. close': close.toFixed(4),
        '5. volume': volume.toString(),
      };
    }

    data[`Time Series (${interval})`] = timeSeries;
  } else if (function_ === 'RSI') {
    data['Meta Data'] = {
      '1: Symbol': symbol,
      '2: Indicator': 'Relative Strength Index (RSI)',
      '3: Last Refreshed': now.toISOString().split('T')[0],
      '4: Interval': 'daily',
      '5: Time Period': 14,
      '6: Series Type': 'close',
      '7: Time Zone': 'US/Eastern',
    };

    const technicalAnalysis: Record<string, any> = {};
    let rsiValue = 50;

    for (let i = 100; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      rsiValue = Math.max(0, Math.min(100, rsiValue + (Math.random() - 0.5) * 10));
      technicalAnalysis[dateStr] = { RSI: rsiValue.toFixed(4) };
    }

    data['Technical Analysis: RSI'] = technicalAnalysis;
  } else if (function_ === 'MACD') {
    data['Meta Data'] = {
      '1: Symbol': symbol,
      '2: Indicator': 'Moving Average Convergence Divergence (MACD)',
      '3: Last Refreshed': now.toISOString().split('T')[0],
      '4: Interval': 'daily',
      '5.1: Fast Period': 12,
      '5.2: Slow Period': 26,
      '5.3: Signal Period': 9,
      '5.4: Series Type': 'close',
      '6: Time Zone': 'US/Eastern',
    };

    const technicalAnalysis: Record<string, any> = {};
    let macdValue = 0;
    let signalValue = 0;

    for (let i = 100; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      macdValue += (Math.random() - 0.5) * 2;
      signalValue += (Math.random() - 0.5) * 1.5;
      const hist = macdValue - signalValue;

      technicalAnalysis[dateStr] = {
        MACD: macdValue.toFixed(4),
        MACD_Signal: signalValue.toFixed(4),
        MACD_Hist: hist.toFixed(4),
      };
    }

    data['Technical Analysis: MACD'] = technicalAnalysis;
  } else if (function_ === 'SMA' || function_ === 'EMA') {
    const indicatorName = function_ === 'SMA' ? 'Simple Moving Average' : 'Exponential Moving Average';
    const technicalKey = `Technical Analysis: ${function_}`;

    data['Meta Data'] = {
      '1: Symbol': symbol,
      '2: Indicator': indicatorName,
      '3: Last Refreshed': now.toISOString().split('T')[0],
      '4: Interval': 'daily',
      '5: Time Period': 20,
      '6: Series Type': 'close',
      '7: Time Zone': 'US/Eastern',
    };

    const technicalAnalysis: Record<string, any> = {};
    let maValue = 150;

    for (let i = 100; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      maValue += (Math.random() - 0.48) * 3;
      technicalAnalysis[dateStr] = { [function_]: maValue.toFixed(4) };
    }

    data[technicalKey] = technicalAnalysis;
  }

  return data;
}
