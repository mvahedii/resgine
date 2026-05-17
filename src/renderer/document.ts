import PDFDocument from 'pdfkit';
import { createWriteStream } from 'fs';
import { THEME } from './theme.js';

export function createDocument(): InstanceType<typeof PDFDocument> {
  return new PDFDocument({
    size: THEME.page.size,
    margins: THEME.page.margins,
    bufferPages: true,
    info: { Creator: 'resume-build' },
  });
}

export function saveDocument(
  doc: InstanceType<typeof PDFDocument>,
  outputPath: string,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const stream = createWriteStream(outputPath);
    stream.on('finish', resolve);
    stream.on('error', reject);
    doc.pipe(stream);
    doc.end();
  });
}
