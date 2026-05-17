import { getH3Blocks, toString } from '../../utils/mdast.js';
import type { RootContent } from 'mdast';
import type { Education } from '../../types/resume.js';

export function parseEducation(nodes: RootContent[]): Education[] {
  const blocks = getH3Blocks(nodes);
  const entries: Education[] = [];

  for (const block of blocks) {
    const parts = block.heading.split('|').map((s) => s.trim());
    const degree = parts[0] ?? block.heading;
    const institution = parts[1] ?? '';

    let dateRange = '';
    for (const node of block.nodes) {
      if (node.type === 'paragraph') {
        dateRange = toString(node).trim();
        break;
      }
    }

    entries.push({ degree, institution, dateRange });
  }

  return entries;
}
