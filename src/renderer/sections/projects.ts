import PDFDocument from 'pdfkit';
import { THEME } from '../theme.js';
import { drawSectionHeader, drawBullet, checkPageBreak, contentWidth } from '../../utils/pdf.js';
import type { Project } from '../../types/resume.js';

type Doc = InstanceType<typeof PDFDocument>;

export function renderProjects(doc: Doc, entries: Project[]): void {
  if (entries.length === 0) return;
  drawSectionHeader(doc, 'Projects');

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    checkPageBreak(doc, 50);

    if (i > 0) doc.moveDown(THEME.spacing.entryGap / doc.currentLineHeight(true));

    // Title + optional link on same line
    if (entry.link) {
      const titleWidth = doc
        .font(THEME.fonts.bold)
        .fontSize(THEME.sizes.entryHead)
        .widthOfString(`${entry.title}  `);

      doc
        .font(THEME.fonts.bold)
        .fontSize(THEME.sizes.entryHead)
        .fillColor(THEME.colors.body)
        .text(entry.title, THEME.page.margins.left, doc.y, { continued: true, lineBreak: false });

      doc
        .font(THEME.fonts.regular)
        .fontSize(THEME.sizes.meta)
        .fillColor(THEME.colors.accent)
        .text(entry.linkText ?? entry.link, {
          link: entry.link,
          underline: true,
          lineBreak: false,
        });

      doc.moveDown();
    } else {
      doc
        .font(THEME.fonts.bold)
        .fontSize(THEME.sizes.entryHead)
        .fillColor(THEME.colors.body)
        .text(entry.title, THEME.page.margins.left, doc.y, { width: contentWidth(doc) });
    }

    if (entry.description) {
      doc
        .font(THEME.fonts.regular)
        .fontSize(THEME.sizes.body)
        .fillColor(THEME.colors.body)
        .text(entry.description, THEME.page.margins.left, doc.y, {
          width: contentWidth(doc),
          lineGap: THEME.spacing.lineHeight,
        });
    }

    doc.moveDown(0.3);
    for (const bullet of entry.bullets) {
      checkPageBreak(doc, 20);
      drawBullet(doc, bullet);
    }
  }
}
