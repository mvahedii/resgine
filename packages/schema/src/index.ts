/**
 * @resgine/schema
 *
 * The schema-driven layer: the field builder DSL, `defineSection`, the standard
 * resume sections, the full resume Zod schema, and JSON Schema export. Depends
 * only on `zod` — it knows nothing about layout, rendering or PDFs.
 */

export * from './fields.js';
export * from './define-section.js';
export * from './sections.js';
export * from './resume-schema.js';
export * from './json-schema.js';
