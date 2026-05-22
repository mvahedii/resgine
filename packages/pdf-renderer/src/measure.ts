import type { MeasureContext, Size, TextStyle } from '@resgine/layout';

/**
 * Extra space added between text lines so that a {@link TextStyle} `lineHeight`
 * multiplier is honoured. The *same* value must be used for both measurement
 * and drawing, otherwise pagination math drifts from what is painted.
 */
export function lineGapFor(style: TextStyle): number {
  return style.size * ((style.lineHeight ?? 1) - 1);
}

/**
 * A {@link MeasureContext} backed by PDFKit's font metrics. This is the
 * concrete implementation of the layout package's abstract measurement seam —
 * a future standalone layout engine could measure through this same interface.
 */
export class PdfMeasureContext implements MeasureContext {
  constructor(private readonly doc: PDFKit.PDFDocument) {}

  measureText(content: string, style: TextStyle, maxWidth: number): Size {
    this.doc.font(style.font).fontSize(style.size);
    const width = Math.min(this.doc.widthOfString(content), maxWidth);
    const height = this.doc.heightOfString(content, {
      width: maxWidth,
      lineGap: lineGapFor(style),
    });
    return { width, height };
  }
}
