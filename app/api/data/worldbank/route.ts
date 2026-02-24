import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const indicator = searchParams.get('indicator');
    const country = searchParams.get('country') || 'US';
    const startDate = searchParams.get('startDate') || '2015';
    const endDate = searchParams.get('endDate') || '2024';

    if (!indicator) {
      return NextResponse.json(
        { error: 'Indicator is required' },
        { status: 400 }
      );
    }

    const url = `https://api.worldbank.org/v2/country/${country}/indicator/${indicator}?date=${startDate}:${endDate}&format=json&per_page=500`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`World Bank API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('World Bank API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data from World Bank' },
      { status: 500 }
    );
  }
}
