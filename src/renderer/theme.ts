export const THEME = {
  page: {
    size: 'LETTER' as const,
    margins: { top: 40, bottom: 40, left: 50, right: 50 },
  },
  colors: {
    name: '#1A1A2E',
    accent: '#2563EB',
    body: '#1F2937',
    muted: '#6B7280',
    rule: '#D1D5DB',
  },
  fonts: {
    regular: 'Helvetica',
    bold: 'Helvetica-Bold',
    italic: 'Helvetica-Oblique',
    boldItalic: 'Helvetica-BoldOblique',
  },
  sizes: {
    name: 26,
    jobTitle: 13,
    contactLine: 9,
    sectionHead: 11,
    entryHead: 10.5,
    meta: 9,
    body: 9.5,
    bullet: 9.5,
    skillLabel: 9.5,
  },
  spacing: {
    sectionGap: 14,
    afterRule: 6,
    entryGap: 8,
    bulletIndent: 14,
    bulletGap: 3,
    lineHeight: 1.35,
    headerBottom: 10,
  },
} as const;
