import { toString } from '../../utils/mdast.js';
import type { RootContent } from 'mdast';

export function parseSummary(nodes: RootContent[]): string | undefined {
  for (const node of nodes) {
    if (node.type === 'paragraph') {
      return toString(node).trim();
    }
  }
  return undefined;
}
