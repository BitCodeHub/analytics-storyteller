import { NextRequest } from 'next/server';
import { listProperties, fetchMetrics } from '@/lib/ga4-service';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const segments = url.pathname.split('/').filter(Boolean);
  
  if (segments.length === 4 && segments[3] === 'properties') {
    const properties = await listProperties();
    return new Response(JSON.stringify(properties), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  return new Response(JSON.stringify({ error: 'Endpoint not found' }), {
    status: 404
  });
}

export async function POST(request: NextRequest) {
  const url = new URL(request.url);
  const segments = url.pathname.split('/').filter(Boolean);
  
  if (segments.length === 4 && segments[3] === 'report') {
    const { propertyId, metrics, dateRange } = await request.json();
    const data = await fetchMetrics(propertyId, metrics, dateRange);
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  return new Response(JSON.stringify({ error: 'Invalid report path' }), {
    status: 404
  });
}