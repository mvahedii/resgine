import { writeFile } from 'node:fs/promises';
import PDFDocument from 'pdfkit';
import {
  pageContentBox,
  type EdgeInsets,
  type HBoxNode,
  type LayoutNode,
  type PageConfig,
  type Rect,
  type TextStyle,
} from '@resgine/layout';
import { lineGapFor, PdfMeasureContext } from './measure.js';

/**
 * The "Layout Tree → PDF" stage of the pipeline. The renderer is the only
 * package that touches PDFKit. It consumes layout nodes with fully resolved
 * styles and knows nothing about themes or the resume domain.
 */

export interface RenderOptions {
  page: PageConfig;
  /** Embedded PDF document title. */
  title?: string;
  /** Embedded PDF document author. */
  author?: string;
}

const ZERO_INSETS: EdgeInsets = { top: 0, right: 0, bottom: 0, left: 0 };

/** Render a layout tree to an in-memory PDF buffer. */
export function renderToBuffer(
  tree: LayoutNode,
  options: RenderOptions,
): Promise<Buffer> {
  // Determinism: PDFKit stamps `CreationDate` with the wall clock and derives
  // the file `/ID` from it inside the constructor — so the pinned date must be
  // supplied up front via `info`, not assigned afterwards. With that, base-14
  // fonts and no RNG, output is byte-stable.
  const info: PDFKit.DocumentInfo = { CreationDate: new Date(0) };
  if (options.title) info.Title = options.title;
  if (options.author) info.Author = options.author;

  const doc = new PDFDocument({
    size: options.page.size,
    margin: 0,
    autoFirstPage: true,
    info,
  });

  const chunks: Buffer[] = [];
  const finished = new Promise<Buffer>((resolve, reject) => {
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
  });

  new RenderEngine(doc, options.page).render(tree);
  doc.end();

  return finished;
}

/** Render a layout tree and write the resulting PDF to disk. */
export async function renderToFile(
  tree: LayoutNode,
  path: string,
  options: RenderOptions,
): Promise<void> {
  const buffer = await renderToBuffer(tree, options);
  await writeFile(path, buffer);
}

/**
 * Walks a layout tree and paints it onto a PDFKit document.
 *
 * Two traversals cooperate:
 *  - `flow` — cursor-based and *paginating*; used for the vertical document
 *    spine (VBox / BulletList). It page-breaks between children.
 *  - `place` — absolute-positioned and *non-paginating*; measures (and
 *    optionally paints) any subtree at a fixed point. Used for atomic blocks
 *    and for HBox children.
 *
 * Pagination is block-level: a block moves wholly to the next page rather than
 * being split. The `place`/measure split is the seam where finer-grained
 * page-breaking or multi-column flow would later plug in.
 */
class RenderEngine {
  private readonly measurer: PdfMeasureContext;
  private readonly contentBox: Rect;
  private readonly pageBottom: number;
  private cursorY: number;

  constructor(
    private readonly doc: PDFKit.PDFDocument,
    page: PageConfig,
  ) {
    this.measurer = new PdfMeasureContext(doc);
    this.contentBox = pageContentBox(page);
    this.pageBottom = this.contentBox.y + this.contentBox.height;
    this.cursorY = this.contentBox.y;
  }

  render(root: LayoutNode): void {
    this.flow(root, this.contentBox.x, this.contentBox.width);
  }

  /* ---------------------------------------------------------------------- */
  /* Paginating traversal                                                    */
  /* ---------------------------------------------------------------------- */

  private flow(node: LayoutNode, x: number, width: number): void {
    switch (node.type) {
      case 'vbox': {
        const pad = node.padding ?? ZERO_INSETS;
        this.cursorY += pad.top;
        const innerX = x + pad.left;
        const innerWidth = width - pad.left - pad.right;
        node.children.forEach((child, i) => {
          if (i > 0) this.cursorY += node.gap;
          this.flow(child, innerX, innerWidth);
        });
        this.cursorY += pad.bottom;
        return;
      }
      case 'bullet-list': {
        const contentX = x + node.indent;
        const contentWidth = width - node.indent;
        node.items.forEach((item, i) => {
          if (i > 0) this.cursorY += node.gap;
          const height = this.place(item, 0, 0, contentWidth, false);
          this.ensureSpace(height);
          this.paintText(node.marker, node.markerStyle, x, this.cursorY, node.indent);
          this.place(item, contentX, this.cursorY, contentWidth, true);
          this.cursorY += height;
        });
        return;
      }
      case 'spacer': {
        this.cursorY += node.size;
        return;
      }
      default: {
        // Atomic blocks (text, divider, hbox): break as an indivisible unit.
        const height = this.place(node, 0, 0, width, false);
        this.ensureSpace(height);
        this.place(node, x, this.cursorY, width, true);
        this.cursorY += height;
      }
    }
  }

  private ensureSpace(height: number): void {
    const atPageTop = this.cursorY <= this.contentBox.y;
    if (!atPageTop && this.cursorY + height > this.pageBottom) {
      this.doc.addPage();
      this.cursorY = this.contentBox.y;
    }
  }

  /* ---------------------------------------------------------------------- */
  /* Absolute traversal — measures, and paints when `paint` is true          */
  /* ---------------------------------------------------------------------- */

  /** Lay out `node` at (`x`, `y`) within `width`; returns the height consumed. */
  private place(
    node: LayoutNode,
    x: number,
    y: number,
    width: number,
    paint: boolean,
  ): number {
    switch (node.type) {
      case 'spacer':
        return node.size;

      case 'divider': {
        if (paint) {
          const lineY = y + node.gap + node.thickness / 2;
          this.doc
            .save()
            .lineWidth(node.thickness)
            .strokeColor(node.color)
            .moveTo(x, lineY)
            .lineTo(x + width, lineY)
            .stroke()
            .restore();
        }
        return node.thickness + node.gap * 2;
      }

      case 'text': {
        const size = this.measurer.measureText(node.text, node.style, width);
        if (paint) this.paintText(node.text, node.style, x, y, width);
        return size.height;
      }

      case 'vbox': {
        const pad = node.padding ?? ZERO_INSETS;
        const innerX = x + pad.left;
        const innerWidth = width - pad.left - pad.right;
        let cy = y + pad.top;
        node.children.forEach((child, i) => {
          if (i > 0) cy += node.gap;
          cy += this.place(child, innerX, cy, innerWidth, paint);
        });
        return cy + pad.bottom - y;
      }

      case 'hbox': {
        const widths = this.hboxChildWidths(node, width);
        const count = node.children.length;
        const used = widths.reduce((sum, w) => sum + w, 0);
        const gaps = node.gap * Math.max(0, count - 1);
        const leftover = Math.max(0, width - used - gaps);

        let cx = x;
        let extraGap = 0;
        if (node.justify === 'end') cx += leftover;
        else if (node.justify === 'center') cx += leftover / 2;
        else if (node.justify === 'between' && count > 1) {
          extraGap = leftover / (count - 1);
        }

        let rowHeight = 0;
        node.children.forEach((child, i) => {
          if (i > 0) cx += node.gap + extraGap;
          const w = widths[i];
          const h = this.place(child.node, cx, y, w, paint);
          if (h > rowHeight) rowHeight = h;
          cx += w;
        });
        return rowHeight;
      }

      case 'bullet-list': {
        const contentX = x + node.indent;
        const contentWidth = width - node.indent;
        let cy = y;
        node.items.forEach((item, i) => {
          if (i > 0) cy += node.gap;
          if (paint) {
            this.paintText(node.marker, node.markerStyle, x, cy, node.indent);
          }
          cy += this.place(item, contentX, cy, contentWidth, paint);
        });
        return cy - y;
      }
    }
  }

  /* ---------------------------------------------------------------------- */
  /* HBox sizing                                                             */
  /* ---------------------------------------------------------------------- */

  private hboxChildWidths(node: HBoxNode, totalWidth: number): number[] {
    const count = node.children.length;
    if (count === 0) return [];

    const available = totalWidth - node.gap * (count - 1);
    const widths = new Array<number>(count).fill(0);
    const flexIndices: number[] = [];
    let flexTotal = 0;
    let usedWidth = 0;

    node.children.forEach((child, i) => {
      if (child.flex && child.flex > 0) {
        flexIndices.push(i);
        flexTotal += child.flex;
      } else if (child.width != null) {
        widths[i] = child.width;
        usedWidth += child.width;
      } else {
        const intrinsic = this.intrinsicWidth(child.node);
        widths[i] = intrinsic;
        usedWidth += intrinsic;
      }
    });

    const remaining = Math.max(0, available - usedWidth);
    for (const i of flexIndices) {
      const weight = node.children[i].flex ?? 0;
      widths[i] = (remaining * weight) / flexTotal;
    }
    return widths;
  }

  /** Unconstrained natural width of a node — used to size intrinsic HBox children. */
  private intrinsicWidth(node: LayoutNode): number {
    switch (node.type) {
      case 'text':
        return this.measurer.measureText(
          node.text,
          node.style,
          Number.MAX_SAFE_INTEGER,
        ).width;
      case 'spacer':
      case 'divider':
        return 0;
      case 'vbox': {
        let max = 0;
        for (const child of node.children) {
          max = Math.max(max, this.intrinsicWidth(child));
        }
        return max;
      }
      case 'hbox': {
        let sum = 0;
        node.children.forEach((child, i) => {
          if (i > 0) sum += node.gap;
          sum += this.intrinsicWidth(child.node);
        });
        return sum;
      }
      case 'bullet-list': {
        let max = 0;
        for (const item of node.items) {
          max = Math.max(max, this.intrinsicWidth(item) + node.indent);
        }
        return max;
      }
    }
  }

  /* ---------------------------------------------------------------------- */
  /* Drawing primitives                                                      */
  /* ---------------------------------------------------------------------- */

  private paintText(
    content: string,
    style: TextStyle,
    x: number,
    y: number,
    width: number,
  ): void {
    this.doc.font(style.font).fontSize(style.size).fillColor(style.color);
    this.doc.text(content, x, y, {
      width,
      align: style.align ?? 'left',
      lineGap: lineGapFor(style),
      link: style.link ?? null,
      underline: false,
    });
  }
}
