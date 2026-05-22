import type { ThemeTokens } from '@resgine/core';
import type { PageConfig } from '@resgine/layout';

/**
 * Design tokens for the Modern theme.
 *
 * Tokens are this theme's private vocabulary. Renderers resolve them into the
 * concrete styles carried by layout nodes; nothing downstream of the theme
 * ever sees a token.
 */

/** A4 page with comfortable margins. */
export const page: PageConfig = {
  size: 'A4',
  margins: { top: 52, right: 56, bottom: 52, left: 56 },
};

export const tokens: ThemeTokens = {
  colors: {
    ink: '#1A2433',
    accent: '#2563EB',
    body: '#33404F',
    muted: '#717C8A',
    rule: '#E2E6EC',
  },
  spacing: {
    /** Gap between top-level sections — read by `composeResume`. */
    section: 16,
    /** Whitespace between a section heading rule and its content. */
    afterHeading: 7,
    /** Gap between entries within a section. */
    entry: 11,
    /** Gap between bullet points. */
    bullet: 3,
    /** Gap between the two stacked rows of an entry header. */
    entryRow: 2.5,
  },
  typography: {
    name: { font: 'Helvetica-Bold', size: 23 },
    headline: { font: 'Helvetica', size: 11.5 },
    contact: { font: 'Helvetica', size: 9 },
    heading: { font: 'Helvetica-Bold', size: 10.5 },
    entryTitle: { font: 'Helvetica-Bold', size: 10.5 },
    entrySubtitle: { font: 'Helvetica', size: 9.7 },
    entryMeta: { font: 'Helvetica-Oblique', size: 9 },
    body: { font: 'Helvetica', size: 9.7, lineHeight: 1.45 },
    bullet: { font: 'Helvetica', size: 9.7, lineHeight: 1.4 },
  },
};
