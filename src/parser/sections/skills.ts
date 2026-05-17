import type { RootContent, Paragraph, Strong, Text } from 'mdast';
import type { SkillGroup } from '../../types/resume.js';

export function parseSkills(nodes: RootContent[]): SkillGroup[] {
  const groups: SkillGroup[] = [];

  for (const node of nodes) {
    if (node.type !== 'paragraph') continue;
    const para = node as Paragraph;

    let category = '';
    let itemsText = '';

    for (const child of para.children) {
      if (child.type === 'strong') {
        const strong = child as Strong;
        category = (strong.children[0] as Text).value.replace(/:$/, '').trim();
      } else if (child.type === 'text') {
        itemsText += (child as Text).value;
      }
    }

    if (category && itemsText) {
      const items = itemsText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      if (items.length > 0) {
        groups.push({ category, items });
      }
    }
  }

  return groups;
}
