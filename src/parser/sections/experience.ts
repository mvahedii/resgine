import { getH3Blocks, toString } from '../../utils/mdast.js';
import type { RootContent, List, ListItem } from 'mdast';
import type { WorkExperience } from '../../types/resume.js';

export function parseExperience(nodes: RootContent[]): WorkExperience[] {
  const blocks = getH3Blocks(nodes);
  const entries: WorkExperience[] = [];

  for (const block of blocks) {
    const atIdx = block.heading.lastIndexOf(' @ ');
    const role = atIdx !== -1 ? block.heading.slice(0, atIdx).trim() : block.heading;
    const company = atIdx !== -1 ? block.heading.slice(atIdx + 3).trim() : '';

    let dateRange = '';
    let location: string | undefined;
    const bullets: string[] = [];

    for (const node of block.nodes) {
      if (node.type === 'paragraph' && !dateRange) {
        const text = toString(node).trim();
        const pipeParts = text.split('|').map((s) => s.trim());
        dateRange = pipeParts[0] ?? '';
        location = pipeParts[1];
      } else if (node.type === 'list') {
        const list = node as List;
        for (const item of list.children) {
          const bullet = toString(item as ListItem).trim();
          if (bullet) bullets.push(bullet);
        }
      }
    }

    entries.push({ role, company, dateRange, location, bullets });
  }

  return entries;
}
