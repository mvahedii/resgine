import PDFDocument from 'pdfkit';
import { THEME } from '../theme.js';
import { contentWidth, drawRule } from '../../utils/pdf.js';
import type { ResumeHeader } from '../../types/resume.js';

type Doc = InstanceType<typeof PDFDocument>;

export function renderHeader(doc: Doc, header: ResumeHeader): void {
  const { margins } = THEME.page;
  const pageWidth = doc.page.width;
  const rightX = pageWidth - margins.right;

  // Left side: name + title
  doc
    .font(THEME.fonts.bold)
    .fontSize(THEME.sizes.name)
    .fillColor(THEME.colors.name)
    .text(header.name, margins.left, margins.top, { lineBreak: false });

  const nameBottom = doc.y + doc.currentLineHeight(true);

  doc
    .font(THEME.fonts.regular)
    .fontSize(THEME.sizes.jobTitle)
    .fillColor(THEME.colors.muted)
    .text(header.title, margins.left, nameBottom, { lineBreak: false });

  const leftBottom = doc.y + doc.currentLineHeight(true);

  // Right side: contact info (right-aligned), drawn top-aligned with name
  const contactLines: string[] = [];
  if (header.email) contactLines.push(header.email);
  if (header.phone) contactLines.push(header.phone);
  if (header.linkedin) contactLines.push(header.linkedin);
  if (header.github) contactLines.push(header.github);
  if (header.location) contactLines.push(header.location);

  let contactY = margins.top;
  doc.font(THEME.fonts.regular).fontSize(THEME.sizes.contactLine).fillColor(THEME.colors.muted);

  for (const line of contactLines) {
    doc.text(line, margins.left, contactY, {
      width: contentWidth(doc),
      align: 'right',
      lineBreak: false,
    });
    contactY += doc.currentLineHeight(true) + 1;
  }

  const rightBottom = contactY;
  const headerBottom = Math.max(leftBottom, rightBottom) + THEME.spacing.headerBottom;

  doc.y = headerBottom;
  drawRule(doc);
  doc.moveDown(THEME.spacing.afterRule / doc.currentLineHeight(true));
}
