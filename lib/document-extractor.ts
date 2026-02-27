import pdfParse from 'pdf-parse';
import xlsx from 'xlsx';
import mammoth from 'mammoth';
import pptxParser from 'pptx-parser';

export async function extractText(file: { buffer: Buffer | ArrayBuffer, name: string }): Promise<string> {
  const extension = file.name.split('.').pop()?.toLowerCase();

  try {
    switch (extension) {
      case 'pdf':
        const pdfResult = await pdfParse(file.buffer);
        return pdfResult.text;
      
      case 'xlsx':
      case 'xls':
        const workbook = xlsx.read(file.buffer, { type: 'buffer' });
        return workbook.Sheets[workbook.SheetNames[0]]._text || '';
      
      case 'docx':
        const wordResult = await mammoth.extractRawText({ buffer: file.buffer });
        return wordResult.value;
      
      case 'pptx':
        const pptxResult = await pptxParser.parse(file.buffer);
        return pptxResult.text;
      
      default:
        throw new Error(`Unsupported file type: ${extension}`);
    }
  } catch (error) {
    console.error('Extraction error:', error);
    return `Extraction failed: ${error.message}`;
  }
}