import { toString } from 'mdast-util-to-string';
import type { Root, Node, Heading, RootContent } from 'mdast';

export { toString };

export function sliceByH2(root: Root): Map<string, RootContent[]> {
  const map = new Map<string, RootContent[]>();
  let current: string | null = null;

  for (const node of root.children) {
    if (node.type === 'heading' && (node as Heading).depth === 2) {
      current = toString(node as Node).trim().toLowerCase();
      map.set(current, []);
    } else if (current !== null) {
      map.get(current)!.push(node);
    }
  }

  return map;
}

export interface H3Block {
  heading: string;
  nodes: RootContent[];
}

export function getH3Blocks(nodes: RootContent[]): H3Block[] {
  const blocks: H3Block[] = [];
  let current: H3Block | null = null;

  for (const node of nodes) {
    if (node.type === 'heading' && (node as Heading).depth === 3) {
      if (current) blocks.push(current);
      current = { heading: toString(node as Node).trim(), nodes: [] };
    } else if (current) {
      current.nodes.push(node);
    }
  }

  if (current) blocks.push(current);
  return blocks;
}
