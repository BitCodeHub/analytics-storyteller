import { NextRequest, NextResponse } from 'next/server';
import { BetaAnalyticsDataClient } from '@google-analytics/data';

function getAnalyticsClient() {
  const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  if (!credentialsJson) {
    throw new Error('GOOGLE_APPLICATION_CREDENTIALS_JSON not configured');
  }
  
  const credentials = JSON.parse(credentialsJson);
  return new BetaAnalyticsDataClient({ credentials });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { property, startDate = '7daysAgo', endDate = 'today', metrics = [] } = body;

    if (!property) {
      return NextResponse.json({ error: 'Property is required' }, { status: 400 });
    }

    const client = getAnalyticsClient();
    const propertyId = property.replace('properties/', '');

    // Define all metrics we want to fetch
    const metricNames = metrics.length > 0 ? metrics : [
      'activeUsers',
      'totalUsers', 
      'sessions',
      'screenPageViews',
      'averageSessionDuration',
      'bounceRate',
      'newUsers',
      'engagedSessions'
    ];

    const [response] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate }],
      metrics: metricNames.map(name => ({ name })),
    });

    // Parse metrics from response
    const metricsData: Record<string, number> = {};
    if (response.rows && response.rows.length > 0) {
      const row = response.rows[0];
      row.metricValues?.forEach((value, index) => {
        const metricName = metricNames[index];
        metricsData[metricName] = parseFloat(value.value || '0');
      });
    }

    return NextResponse.json({ 
      metrics: metricsData,
      property: propertyId,
      dateRange: { startDate, endDate },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('GA4 report error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to fetch GA4 report',
      details: error.details || null
    }, { status: 500 });
  }
}
