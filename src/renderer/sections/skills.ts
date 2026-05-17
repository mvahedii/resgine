import PDFDocument from 'pdfkit';
import { THEME } from '../theme.js';
import { drawSectionHeader, contentWidth } from '../../utils/pdf.js';
import type { SkillGroup } from '../../types/resume.js';

type Doc = InstanceType<typeof PDFDocument>;

export function renderSkills(doc: Doc, groups: SkillGroup[]): void {
  if (groups.length === 0) return;
  drawSectionHeader(doc, 'Skills');

  const labelWidth = 90;
  const textWidth = contentWidth(doc) - labelWidth;

  for (const group of groups) {
    const y = doc.y;

    doc
      .font(THEME.fonts.bold)
      .fontSize(THEME.sizes.skillLabel)
      .fillColor(THEME.colors.body)
      .text(`${group.category}:`, THEME.page.margins.left, y, {
        width: labelWidth,
        lineBreak: false,
      });

    doc
      .font(THEME.fonts.regular)
      .fontSize(THEME.sizes.skillLabel)
      .fillColor(THEME.colors.body)
      .text(group.items.join(', '), THEME.page.margins.left + labelWidth, y, {
        width: textWidth,
      });

    doc.moveDown(0.15);
  }
}
