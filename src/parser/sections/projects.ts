import { getH3Blocks, toString } from '../../utils/mdast.js';
import type { RootContent, Paragraph, List, ListItem, Emphasis, Link } from 'mdast';
import type { Project } from '../../types/resume.js';

export function parseProjects(nodes: RootContent[]): Project[] {
  const blocks = getH3Blocks(nodes);
  const entries: Project[] = [];

  for (const block of blocks) {
    let link: string | undefined;
    let linkText: string | undefined;
    let description: string | undefined;
    const bullets: string[] = [];
    let linkChecked = false;

    for (const node of block.nodes) {
      if (node.type === 'paragraph') {
        const para = node as Paragraph;

        if (!linkChecked) {
          linkChecked = true;
          // Check if this paragraph is a single italic link: *[text](url)*
          if (
            para.children.length === 1 &&
            para.children[0].type === 'emphasis'
          ) {
            const em = para.children[0] as Emphasis;
            if (em.children.length === 1 && em.children[0].type === 'link') {
              const linkNode = em.children[0] as Link;
              link = linkNode.url;
              linkText = toString(linkNode).trim();
              continue;
            }
          }
        }

        // Otherwise treat as description
        if (!description) {
          description = toString(para).trim();
        }
      } else if (node.type === 'list') {
        const list = node as List;
        for (const item of list.children) {
          const bullet = toString(item as ListItem).trim();
          if (bullet) bullets.push(bullet);
        }
      }
    }

    entries.push({ title: block.heading, link, linkText, description, bullets });
  }

  return entries;
}
