import PDFDocument from 'pdfkit';
import { THEME } from '../theme.js';
import { drawSectionHeader, contentWidth } from '../../utils/pdf.js';

type Doc = InstanceType<typeof PDFDocument>;

export function renderSummary(doc: Doc, summary: string): void {
  drawSectionHeader(doc, 'Summary');
  doc
    .font(THEME.fonts.regular)
    .fontSize(THEME.sizes.body)
    .fillColor(THEME.colors.body)
    .text(summary, THEME.page.margins.left, doc.y, {
      width: contentWidth(doc),
      lineGap: THEME.spacing.lineHeight,
    });
}
