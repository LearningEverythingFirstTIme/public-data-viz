import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const series = searchParams.get('series');
    const startDate = searchParams.get('startDate') || '2015-01-01';
    const endDate = searchParams.get('endDate') || new Date().toISOString().split('T')[0];

    if (!series) {
      return NextResponse.json(
        { error: 'Series ID is required' },
        { status: 400 }
      );
    }

    // Note: FRED API requires an API key for production use
    // For demo purposes, we'll return mock data if no API key is available
    const apiKey = process.env.FRED_API_KEY;
    
    if (!apiKey) {
      // Return mock data for demonstration
      return NextResponse.json(generateMockFREDData(series, startDate, endDate));
    }

    const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${series}&api_key=${apiKey}&file_type=json&observation_start=${startDate}&observation_end=${endDate}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`FRED API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('FRED API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data from FRED' },
      { status: 500 }
    );
  }
}

function generateMockFREDData(series: string, startDate: string, endDate: string) {
  const observations = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const baseValues: Record<string, number> = {
    'GDP': 21000,
    'UNRATE': 5.0,
    'CPIAUCSL': 250,
    'FEDFUNDS': 2.5,
    'T10Y2Y': 0.5,
    'DEXUSEU': 0.85,
    'SP500': 4000,
    'M2SL': 20000,
  };

  const baseValue = baseValues[series] || 100;
  let currentValue = baseValue;

  for (let d = new Date(start); d <= end; d.setMonth(d.getMonth() + 1)) {
    // Add some random variation
    const change = (Math.random() - 0.48) * baseValue * 0.02;
    currentValue = Math.max(baseValue * 0.5, currentValue + change);
    
    observations.push({
      date: d.toISOString().split('T')[0],
      value: currentValue.toFixed(2),
    });
  }

  return {
    series_id: series,
    observations,
  };
}
