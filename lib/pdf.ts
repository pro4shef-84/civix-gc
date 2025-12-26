import fs from 'fs';
import pdf from 'pdf-parse';
import Tesseract from 'tesseract.js';

export async function extractTextFromFile(path: string, mimeType: string): Promise<{ text: string; meta: any }> {
  if (mimeType === 'text/plain') {
    const text = await fs.promises.readFile(path, 'utf-8');
    return { text, meta: { type: 'text' } };
  }

  if (mimeType === 'application/pdf') {
    const data = await fs.promises.readFile(path);
    const parsed = await pdf(data);
    if (parsed.text.trim().length > 200) {
      return { text: parsed.text, meta: { type: 'pdf', pages: parsed.numpages } };
    }
    const ocr = await Tesseract.recognize(data, 'eng');
    return { text: ocr.data.text, meta: { type: 'pdf-ocr', confidence: ocr.data.confidence } };
  }
  throw new Error('Unsupported mime type');
}
