import PDFDocument from 'pdfkit';
import { THEME } from '../theme.js';
import { drawSectionHeader, drawBullet, checkPageBreak, contentWidth } from '../../utils/pdf.js';
import type { WorkExperience } from '../../types/resume.js';

type Doc = InstanceType<typeof PDFDocument>;

export function renderExperience(doc: Doc, entries: WorkExperience[]): void {
  if (entries.length === 0) return;
  drawSectionHeader(doc, 'Work Experience');

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    checkPageBreak(doc, 60);

    if (i > 0) doc.moveDown(THEME.spacing.entryGap / doc.currentLineHeight(true));

    const heading = entry.company ? `${entry.role} @ ${entry.company}` : entry.role;
    doc
      .font(THEME.fonts.bold)
      .fontSize(THEME.sizes.entryHead)
      .fillColor(THEME.colors.body)
      .text(heading, THEME.page.margins.left, doc.y, { width: contentWidth(doc) });

    const metaParts = [entry.dateRange, entry.location].filter(Boolean);
    if (metaParts.length > 0) {
      doc
        .font(THEME.fonts.italic)
        .fontSize(THEME.sizes.meta)
        .fillColor(THEME.colors.muted)
        .text(metaParts.join(' | '), THEME.page.margins.left, doc.y, {
          width: contentWidth(doc),
        });
    }

    doc.moveDown(0.3);
    for (const bullet of entry.bullets) {
      checkPageBreak(doc, 20);
      drawBullet(doc, bullet);
    }
  }
}
