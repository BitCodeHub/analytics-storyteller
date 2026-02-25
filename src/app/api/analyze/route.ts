import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { headers, data, totalRows } = await request.json();

    if (!headers || !data || data.length === 0) {
      return NextResponse.json({ error: 'No data provided' }, { status: 400 });
    }

    // Prepare data summary for the AI
    const dataSummary = JSON.stringify(data.slice(0, 50), null, 2);
    const columnInfo = headers.map((h: string) => {
      const values = data.map((row: Record<string, unknown>) => row[h]).filter((v: unknown) => v !== null && v !== undefined);
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

    const prompt = `You are an expert data analyst and storyteller. Analyze this dataset and create a compelling narrative.

DATASET INFO:
- Total rows: ${totalRows}
- Columns: ${headers.join(', ')}

COLUMN ANALYSIS:
${columnInfo}

SAMPLE DATA (first 50 rows):
${dataSummary}

YOUR TASK:
1. Analyze the data thoroughly
2. Write a compelling 2-3 paragraph narrative that tells the story behind this data. Use vivid language and make it engaging.
3. Identify 3-5 key insights (specific, data-driven findings)
4. Provide 2-3 actionable recommendations based on the data
5. Suggest a chart visualization (pick the most insightful numeric columns)

RESPOND IN THIS EXACT JSON FORMAT:
{
  "story": "Your 2-3 paragraph narrative here...",
  "insights": [
    "Insight 1 with specific numbers",
    "Insight 2 with specific numbers",
    "Insight 3 with specific numbers"
  ],
  "recommendations": [
    "Recommendation 1",
    "Recommendation 2"
  ],
  "chartData": {
    "labels": ["Label1", "Label2", ...],
    "datasets": [
      {
        "label": "Metric Name",
        "data": [value1, value2, ...]
      }
    ]
  }
}

For chartData:
- Use at most 10-15 labels for readability
- If data has a time/date column, use it for labels
- If no clear x-axis, use top categories or aggregate by a meaningful dimension
- Include 1-2 relevant numeric metrics as datasets

Return ONLY valid JSON, no markdown or explanation.`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [
        { role: 'user', content: prompt }
      ],
    });

    // Extract text content
    const textContent = response.content.find(c => c.type === 'text');
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
