import { NextRequest, NextResponse } from 'next/server';

// Azure Anthropic configuration
const AZURE_ENDPOINT = process.env.AZURE_ANTHROPIC_ENDPOINT || 'https://jimmylam-code-resource.openai.azure.com/anthropic/v1/messages';
const AZURE_API_KEY = process.env.AZURE_ANTHROPIC_KEY;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      headers = [], 
      data = [], 
      csvData = [],
      totalRows = 0, 
      ga4Metrics, 
      ga4Property, 
      uploadedDocuments = [],
      dateRange 
    } = body;

    // Use csvData if data is empty
    const actualData = data.length > 0 ? data : csvData;

    // Build data context from all sources
    let dataContext = '';

    // CSV/Spreadsheet data
    if (headers.length > 0 && actualData.length > 0) {
      const dataSummary = JSON.stringify(actualData.slice(0, 50), null, 2);
      const columnInfo = headers.map((h: string) => {
        const values = actualData.map((row: Record<string, unknown>) => row[h]).filter((v: unknown) => v !== null && v !== undefined);
        const numericValues = values.filter((v: unknown) => typeof v === 'number');
        const isNumeric = numericValues.length > values.length * 0.5;
        
        if (isNumeric && numericValues.length > 0) {
          const nums = numericValues as number[];
          const sum = nums.reduce((a, b) => a + b, 0);
          const avg = sum / nums.length;
          const min = Math.min(...nums);
          const max = Math.max(...nums);
          return `${h}: numeric (min: ${min.toFixed(2)}, max: ${max.toFixed(2)}, avg: ${avg.toFixed(2)})`;
        } else {
          const uniqueValues = [...new Set(values.slice(0, 10))];
          return `${h}: categorical (examples: ${uniqueValues.slice(0, 5).join(', ')})`;
        }
      }).join('\n');

      dataContext += `
## SPREADSHEET/CSV DATA
- Total rows: ${totalRows || actualData.length}
- Columns: ${headers.join(', ')}

Column Analysis:
${columnInfo}

Sample Data (first 50 rows):
${dataSummary}
`;
    }

    // GA4 Analytics data
    if (ga4Metrics) {
      dataContext += `
## GOOGLE ANALYTICS 4 DATA
Property: ${ga4Property || 'Unknown'}
Date Range: ${dateRange?.start || '7daysAgo'} to ${dateRange?.end || 'today'}

Metrics:
- Active Users: ${ga4Metrics.activeUsers?.toLocaleString() || 'N/A'}
- Total Users: ${ga4Metrics.totalUsers?.toLocaleString() || 'N/A'}
- Sessions: ${ga4Metrics.sessions?.toLocaleString() || 'N/A'}
- Page Views: ${ga4Metrics.screenPageViews?.toLocaleString() || 'N/A'}
- Avg Session Duration: ${ga4Metrics.averageSessionDuration ? Math.round(ga4Metrics.averageSessionDuration) + ' seconds' : 'N/A'}
- Bounce Rate: ${ga4Metrics.bounceRate ? (ga4Metrics.bounceRate * 100).toFixed(1) + '%' : 'N/A'}
- New Users: ${ga4Metrics.newUsers?.toLocaleString() || 'N/A'}
- Engaged Sessions: ${ga4Metrics.engagedSessions?.toLocaleString() || 'N/A'}
`;
    }

    // Uploaded documents
    if (uploadedDocuments.length > 0) {
      dataContext += `
## UPLOADED DOCUMENTS
${uploadedDocuments.map((doc: { name: string; type: string; content: string }) => `
### ${doc.name} (${doc.type})
${doc.content}
`).join('\n')}
`;
    }

    if (!dataContext.trim()) {
      return NextResponse.json({ error: 'No data provided for analysis' }, { status: 400 });
    }

    const prompt = `You are an expert data analyst and storyteller working for an enterprise company. Analyze all the provided data sources and create a comprehensive, compelling narrative.

${dataContext}

YOUR TASK:
1. Analyze ALL data sources thoroughly (GA4 analytics, spreadsheets, and any uploaded documents)
2. Cross-reference insights across different data sources when possible
3. Write a compelling 3-4 paragraph executive narrative that tells the complete story. Use vivid language, specific numbers, and make it engaging for C-level executives.
4. Identify 5-7 key insights (specific, data-driven findings from all sources)
5. Provide 3-5 actionable recommendations based on the combined data
6. Suggest the best chart visualization to highlight key metrics

RESPOND IN THIS EXACT JSON FORMAT:
{
  "story": "Your 3-4 paragraph executive narrative here. Include specific numbers and percentages. Reference data from all available sources...",
  "insights": [
    "Insight 1 with specific numbers from GA4 or spreadsheet",
    "Insight 2 highlighting a trend or pattern",
    "Insight 3 cross-referencing multiple data sources",
    "Insight 4 about user behavior or performance",
    "Insight 5 about opportunities or concerns"
  ],
  "recommendations": [
    "Strategic recommendation 1 with expected impact",
    "Tactical recommendation 2 for immediate action",
    "Long-term recommendation 3 for growth"
  ],
  "chartData": {
    "labels": ["Label1", "Label2", "Label3", "Label4", "Label5"],
    "datasets": [
      {
        "label": "Primary Metric",
        "data": [100, 200, 150, 300, 250]
      }
    ]
  }
}

For chartData:
- If GA4 data is available, visualize key metrics like users, sessions, pageviews
- If spreadsheet data is available, pick the most insightful numeric columns
- Use at most 10 labels for readability
- Include 1-2 relevant metrics as datasets

Return ONLY valid JSON, no markdown or explanation.`;

    // Call Azure Anthropic endpoint
    const response = await fetch(AZURE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': AZURE_API_KEY || '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 4096,
        messages: [
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Azure API error: ${response.status} - ${errorText}`);
    }

    const aiResponse = await response.json();

    // Extract text content from Azure response
    const textContent = aiResponse.content?.find((c: { type: string }) => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response from AI');
    }

    // Parse JSON response
    let result;
    try {
      // Try to extract JSON from the response
      const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch {
      console.error('Failed to parse AI response:', textContent.text);
      throw new Error('Failed to parse AI analysis');
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Analysis failed' },
      { status: 500 }
    );
  }
}
