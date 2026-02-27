import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const extension = file.name.split('.').pop()?.toLowerCase();
    let text = '';

    // For now, return a placeholder - the document-extractor lib handles this
    // In production, integrate with lib/document-extractor.ts
    
    if (extension === 'pdf') {
      // PDF extraction would go here
      text = `[PDF Content from ${file.name}]\n\nDocument uploaded successfully. Content extraction in progress.`;
    } else if (extension === 'xlsx' || extension === 'xls') {
      text = `[Excel Content from ${file.name}]\n\nSpreadsheet uploaded successfully. Data extraction in progress.`;
    } else if (extension === 'docx' || extension === 'doc') {
      text = `[Word Content from ${file.name}]\n\nDocument uploaded successfully. Text extraction in progress.`;
    } else if (extension === 'pptx' || extension === 'ppt') {
      text = `[PowerPoint Content from ${file.name}]\n\nPresentation uploaded successfully. Slide extraction in progress.`;
    } else {
      text = `[Unknown format: ${extension}]\n\nFile uploaded but format not fully supported.`;
    }

    return NextResponse.json({ 
      text,
      filename: file.name,
      size: file.size,
      type: file.type
    });
  } catch (error) {
    console.error('Extraction error:', error);
    return NextResponse.json({ error: 'Failed to extract file content' }, { status: 500 });
  }
}
