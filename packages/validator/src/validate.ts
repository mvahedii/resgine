import type { ResumeDocument, ResumeSection } from '@resgine/core';
import { resumeSchema, type ResumeInput } from '@resgine/schema';
import { zodErrorToDiagnostics, type Diagnostic } from './diagnostics.js';

/**
 * The "Schema Validation → Normalized IR" stage of the pipeline.
 */

export type ValidationResult =
  | { ok: true; document: ResumeDocument }
  | { ok: false; diagnostics: Diagnostic[] };

/**
 * Validate an untrusted JSON value against the resume schema. On success the
 * value is normalized into the semantic {@link ResumeDocument} IR; on failure a
 * list of structured {@link Diagnostic}s is returned (never thrown).
 */
export function validate(input: unknown): ValidationResult {
  const parsed = resumeSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, diagnostics: zodErrorToDiagnostics(parsed.error, input) };
  }
  return { ok: true, document: normalize(parsed.data) };
}

/**
 * Project validated input onto the IR: assign stable section ids and lift
 * document metadata. Section order is preserved exactly — input order is the
 * only ordering, which keeps rendering deterministic.
 */
function normalize(input: ResumeInput): ResumeDocument {
  const sections: ResumeSection[] = input.sections.map((section, index) => ({
    id: `${section.type}-${index}`,
    type: section.type,
    title: section.title,
    data: section.data,
  }));

  return {
    meta: { schemaVersion: input.schemaVersion },
    sections,
  };
}
