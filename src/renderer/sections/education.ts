import PDFDocument from 'pdfkit';
import { THEME } from '../theme.js';
import { drawSectionHeader, checkPageBreak, contentWidth } from '../../utils/pdf.js';
import type { Education } from '../../types/resume.js';

type Doc = InstanceType<typeof PDFDocument>;

export function renderEducation(doc: Doc, entries: Education[]): void {
  if (entries.length === 0) return;
  drawSectionHeader(doc, 'Education');

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    checkPageBreak(doc, 40);

    if (i > 0) doc.moveDown(THEME.spacing.entryGap / doc.currentLineHeight(true));

    const heading = entry.institution
      ? `${entry.degree} | ${entry.institution}`
      : entry.degree;

    doc
      .font(THEME.fonts.bold)
      .fontSize(THEME.sizes.entryHead)
      .fillColor(THEME.colors.body)
      .text(heading, THEME.page.margins.left, doc.y, { width: contentWidth(doc) });

    if (entry.dateRange) {
      doc
        .font(THEME.fonts.italic)
        .fontSize(THEME.sizes.meta)
        .fillColor(THEME.colors.muted)
        .text(entry.dateRange, THEME.page.margins.left, doc.y, {
          width: contentWidth(doc),
        });
    }
  }
}
