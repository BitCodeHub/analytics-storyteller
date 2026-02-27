import { AnalyticsDataClient } from '@google-analytics/data';

const client = new AnalyticsDataClient();

export async function listProperties() {
  const [response] = await client.listProperties({});
  return response.properties || [];
}

export async function fetchMetrics(propertyId: string, metrics: string[], dateRange: { startDate: string, endDate: string }) {
  const [response] = await client.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate: dateRange.startDate, endDate: dateRange.endDate }],
    metrics: metrics.map(m => ({ name: m })),
  });
  return response;
}

// Note: fetchCustomDateRangeData would call fetchMetrics with specific date range
