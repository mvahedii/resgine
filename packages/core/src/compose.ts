import { vbox, type LayoutNode } from '@resgine/layout';
import type { ResumeDocument } from './ir.js';
import type { Theme, ThemeContext } from './theme.js';

/**
 * The "Normalized IR → Layout Tree" stage of the rendering pipeline.
 */

export interface ComposeResult {
  tree: LayoutNode;
  warnings: string[];
}

/**
 * Build the layout tree for a document under a theme. Each section is handed to
 * its registered theme renderer; sections with no renderer are skipped with a
 * warning rather than failing the whole build.
 */
export function composeResume(doc: ResumeDocument, theme: Theme): ComposeResult {
  const ctx: ThemeContext = { tokens: theme.tokens, page: theme.page };
  const warnings: string[] = [];
  const blocks: LayoutNode[] = [];

  for (const section of doc.sections) {
    const renderer = theme.renderers[section.type];
    if (!renderer) {
      warnings.push(
        `Theme "${theme.id}" has no renderer for section "${section.type}" — skipped.`,
      );
      continue;
    }
    blocks.push(renderer(section.data, ctx));
  }

  const sectionGap = theme.tokens.spacing.section ?? 0;
  return { tree: vbox(blocks, { gap: sectionGap }), warnings };
}
