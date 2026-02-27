import { NextResponse } from 'next/server';
import { BetaAnalyticsDataClient } from '@google-analytics/data';

// GA4 Property IDs we have access to
const GA4_PROPERTIES = [
  { propertyId: '433414289', displayName: 'myHyundai App (Mobile)', name: 'properties/433414289' },
  { propertyId: '459721175', displayName: 'myGenesis App (Mobile)', name: 'properties/459721175' },
  { propertyId: '426071039', displayName: 'MyHyundai (Web)', name: 'properties/426071039' },
  { propertyId: '434780747', displayName: 'MyGenesis (Web)', name: 'properties/434780747' },
];

export async function GET() {
  try {
    // Return static list of properties we have access to
    // In production, you could use the Admin API to list properties dynamically
    return NextResponse.json({ 
      properties: GA4_PROPERTIES,
      count: GA4_PROPERTIES.length
    });
  } catch (error) {
    console.error('Failed to list properties:', error);
    return NextResponse.json({ error: 'Failed to list properties' }, { status: 500 });
  }
}
