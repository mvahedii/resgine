/**
 * @resgine/layout
 *
 * Renderer-agnostic layout primitives. This package is the contract between
 * themes (which produce layout nodes) and renderers (which draw them).
 *
 * Layout nodes carry only *resolved, concrete* style values. Themes are
 * responsible for turning design tokens into these values before building
 * nodes — there are no tokens, no fonts-by-name-lookup, and no PDF concepts
 * here. Equally, this package knows nothing about PDFKit or the resume domain.
 */

/* -------------------------------------------------------------------------- */
/* Geometry                                                                    */
/* -------------------------------------------------------------------------- */

export interface EdgeInsets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type PageSize = 'A4' | 'LETTER';

export interface PageConfig {
  size: PageSize;
  margins: EdgeInsets;
}

/** Page dimensions in PostScript points (1/72 inch). */
export const PAGE_DIMENSIONS: Record<PageSize, Size> = {
  A4: { width: 595.28, height: 841.89 },
  LETTER: { width: 612, height: 792 },
};

/** The drawable area of a page once margins are subtracted. */
export function pageContentBox(page: PageConfig): Rect {
  const dim = PAGE_DIMENSIONS[page.size];
  return {
    x: page.margins.left,
    y: page.margins.top,
    width: dim.width - page.margins.left - page.margins.right,
    height: dim.height - page.margins.top - page.margins.bottom,
  };
}

/* -------------------------------------------------------------------------- */
/* Resolved style                                                              */
/* -------------------------------------------------------------------------- */

export type TextAlign = 'left' | 'center' | 'right';

/**
 * A fully resolved text style. `font` is a concrete renderer font key (for the
 * PDF renderer, a PDFKit standard font name such as `Helvetica-Bold`).
 */
export interface TextStyle {
  font: string;
  size: number;
  color: string;
  /** Multiplier applied to `size`. Defaults to 1 in the renderer. */
  lineHeight?: number;
  align?: TextAlign;
  /** If set, the text is drawn as a hyperlink to this URL. */
  link?: string;
}

/* -------------------------------------------------------------------------- */
/* Layout nodes                                                                */
/* -------------------------------------------------------------------------- */

export interface TextNode {
  type: 'text';
  text: string;
  style: TextStyle;
}

/** Vertical whitespace. */
export interface SpacerNode {
  type: 'spacer';
  size: number;
}

/** A horizontal rule. `gap` is the whitespace above and below the line. */
export interface DividerNode {
  type: 'divider';
  color: string;
  thickness: number;
  gap: number;
}

/** A vertical stack. Children flow top to bottom separated by `gap`. */
export interface VBoxNode {
  type: 'vbox';
  children: LayoutNode[];
  gap: number;
  padding?: EdgeInsets;
}

export type HBoxJustify = 'start' | 'center' | 'end' | 'between';

/**
 * A child of an HBox. A child is either intrinsically sized, fixed to `width`,
 * or `flex`-weighted to share leftover horizontal space.
 */
export interface HBoxChild {
  node: LayoutNode;
  width?: number;
  flex?: number;
}

/** A horizontal row. Primarily used for "title left / dates right" rows. */
export interface HBoxNode {
  type: 'hbox';
  children: HBoxChild[];
  gap: number;
  justify: HBoxJustify;
}

/** A list where each item is preceded by a marker glyph. */
export interface BulletListNode {
  type: 'bullet-list';
  items: LayoutNode[];
  marker: string;
  markerStyle: TextStyle;
  gap: number;
  indent: number;
}

export type LayoutNode =
  | TextNode
  | SpacerNode
  | DividerNode
  | VBoxNode
  | HBoxNode
  | BulletListNode;

/* -------------------------------------------------------------------------- */
/* Builders                                                                    */
/* -------------------------------------------------------------------------- */

export function text(content: string, style: TextStyle): TextNode {
  return { type: 'text', text: content, style };
}

export function spacer(size: number): SpacerNode {
  return { type: 'spacer', size };
}

export interface DividerOptions {
  color: string;
  thickness?: number;
  gap?: number;
}

export function divider(opts: DividerOptions): DividerNode {
  return {
    type: 'divider',
    color: opts.color,
    thickness: opts.thickness ?? 1,
    gap: opts.gap ?? 0,
  };
}

export interface VBoxOptions {
  gap?: number;
  padding?: EdgeInsets;
}

export function vbox(children: LayoutNode[], opts: VBoxOptions = {}): VBoxNode {
  return { type: 'vbox', children, gap: opts.gap ?? 0, padding: opts.padding };
}

export interface HBoxOptions {
  gap?: number;
  justify?: HBoxJustify;
}

export function hbox(
  children: ReadonlyArray<LayoutNode | HBoxChild>,
  opts: HBoxOptions = {},
): HBoxNode {
  return {
    type: 'hbox',
    children: children.map(asHBoxChild),
    gap: opts.gap ?? 0,
    justify: opts.justify ?? 'start',
  };
}

/** Wrap a node as a flex-weighted HBox child (shares leftover width). */
export function flex(node: LayoutNode, weight = 1): HBoxChild {
  return { node, flex: weight };
}

/** Wrap a node as a fixed-width HBox child. */
export function fixed(node: LayoutNode, width: number): HBoxChild {
  return { node, width };
}

export interface BulletListOptions {
  markerStyle: TextStyle;
  marker?: string;
  gap?: number;
  indent?: number;
}

export function bulletList(
  items: LayoutNode[],
  opts: BulletListOptions,
): BulletListNode {
  return {
    type: 'bullet-list',
    items,
    marker: opts.marker ?? '•',
    markerStyle: opts.markerStyle,
    gap: opts.gap ?? 0,
    indent: opts.indent ?? 12,
  };
}

function asHBoxChild(child: LayoutNode | HBoxChild): HBoxChild {
  return 'node' in child ? child : { node: child };
}

/**
 * Namespaced re-export of every builder. Themes typically import this as `L`
 * so the layout `text` builder does not collide with the schema `text` field
 * builder: `import { L } from '@resgine/layout'` then `L.text(...)`.
 */
export const L = {
  text,
  spacer,
  divider,
  vbox,
  hbox,
  flex,
  fixed,
  bulletList,
} as const;

/* -------------------------------------------------------------------------- */
/* Measurement                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Abstract text measurement backend. A renderer supplies a concrete
 * implementation (the PDF renderer measures with PDFKit font metrics). Keeping
 * measurement behind an interface is the seam that lets a future standalone
 * layout/pagination engine measure content without depending on any renderer.
 */
export interface MeasureContext {
  measureText(content: string, style: TextStyle, maxWidth: number): Size;
}
