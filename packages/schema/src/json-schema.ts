import { z } from 'zod';
import { resumeSchema } from './resume-schema.js';

/**
 * JSON Schema export.
 *
 * Publishing a JSON Schema gives editors autocomplete, inline validation and
 * hover docs for `resume.json` — point a document's `$schema` at the generated
 * file. Generated from the single source of truth ({@link resumeSchema}), so it
 * can never drift from runtime validation.
 */
export function toJsonSchema(): Record<string, unknown> {
  return z.toJSONSchema(resumeSchema) as Record<string, unknown>;
}
