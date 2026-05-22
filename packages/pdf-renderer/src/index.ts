/**
 * @resgine/pdf-renderer
 *
 * A PDFKit-based renderer for Resgine layout trees. It is the only package that
 * imports PDFKit, and it depends solely on `@resgine/layout` — it has no
 * knowledge of themes or the resume domain, so it is fully swappable.
 */

export type { RenderOptions } from './render.js';
export { renderToBuffer, renderToFile } from './render.js';
export { PdfMeasureContext, lineGapFor } from './measure.js';
