import PDFDocument from 'pdfkit';
import { THEME } from '../renderer/theme.js';

type Doc = InstanceType<typeof PDFDocument>;

export function contentWidth(doc: Doc): number {
  return doc.page.width - THEME.page.margins.left - THEME.page.margins.right;
}

export function drawRule(doc: Doc, y?: number): void {
  const x1 = THEME.page.margins.left;
  const x2 = doc.page.width - THEME.page.margins.right;
  const lineY = y ?? doc.y;
  doc
    .moveTo(x1, lineY)
    .lineTo(x2, lineY)
    .strokeColor(THEME.colors.rule)
    .lineWidth(0.5)
    .stroke();
}

export function drawSectionHeader(doc: Doc, title: string): void {
  doc.moveDown(THEME.spacing.sectionGap / doc.currentLineHeight(true));
  doc
    .font(THEME.fonts.bold)
    .fontSize(THEME.sizes.sectionHead)
    .fillColor(THEME.colors.accent)
    .text(title.toUpperCase(), THEME.page.margins.left, doc.y, {
      width: contentWidth(doc),
    });
  doc.moveDown(0.15);
  drawRule(doc);
  doc.moveDown(THEME.spacing.afterRule / doc.currentLineHeight(true));
}

export function drawBullet(doc: Doc, text: string): void {
  const x = THEME.page.margins.left;
  const bulletX = x + 4;
  const textX = x + THEME.spacing.bulletIndent;
  const width = contentWidth(doc) - THEME.spacing.bulletIndent;

  const y = doc.y + doc.currentLineHeight(true) * 0.35;
  doc.circle(bulletX, y, 1.5).fillColor(THEME.colors.body).fill();

  doc
    .font(THEME.fonts.regular)
    .fontSize(THEME.sizes.bullet)
    .fillColor(THEME.colors.body)
    .text(text, textX, doc.y, { width });

  doc.moveDown(THEME.spacing.bulletGap / doc.currentLineHeight(true));
}

export function checkPageBreak(doc: Doc, estimatedHeight: number): void {
  const bottom = doc.page.height - THEME.page.margins.bottom;
  if (doc.y + estimatedHeight > bottom) {
    doc.addPage();
  }
}
