import type { z } from 'zod';

/**
 * A single, structured validation problem. Diagnostics are designed to be
 * actionable: they pin the problem to a section and field rather than dumping a
 * raw schema path.
 */
export interface Diagnostic {
  severity: 'error' | 'warning';
  /** Section type the problem belongs to, when known. */
  section?: string;
  /** Index of the section within the document, when applicable. */
  index?: number;
  /** Dotted field path within the section's data, when applicable. */
  field?: string;
  message: string;
}

/** Best-effort read of the `type` of the section at `index` in raw input. */
function sectionTypeAt(input: unknown, index: number): string | undefined {
  if (!input || typeof input !== 'object') return undefined;
  const sections = (input as { sections?: unknown }).sections;
  if (!Array.isArray(sections)) return undefined;
  const section: unknown = sections[index];
  if (!section || typeof section !== 'object') return undefined;
  const type = (section as { type?: unknown }).type;
  return typeof type === 'string' ? type : undefined;
}

/** Turn a camelCase / kebab field key into a capitalized, human label. */
function humanize(key: string): string {
  const spaced = key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[-_]/g, ' ');
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/** Rephrase Zod's raw message into something resume-author-friendly. */
function describe(path: ReadonlyArray<PropertyKey>, message: string): string {
  if (message.includes('received undefined')) {
    const last = path[path.length - 1];
    if (typeof last === 'string') return `${humanize(last)} is required`;
  }
  return message;
}

/** Translate one raw Zod path into a section/field-aware {@link Diagnostic}. */
function mapIssue(
  path: ReadonlyArray<PropertyKey>,
  message: string,
  input: unknown,
): Diagnostic {
  if (path[0] === 'sections' && typeof path[1] === 'number') {
    const index = path[1];
    const section = sectionTypeAt(input, index);
    let field: string | undefined;
    if (path[2] === 'data') {
      field = path.slice(3).map(String).join('.') || undefined;
    } else if (path.length > 2) {
      field = path.slice(2).map(String).join('.');
    }
    return {
      severity: 'error',
      section,
      index,
      field,
      message: describe(path, message),
    };
  }

  const field = path.length > 0 ? path.map(String).join('.') : undefined;
  return { severity: 'error', field, message: describe(path, message) };
}

/**
 * Convert a `ZodError` into structured diagnostics. The raw `input` is used to
 * recover each failing section's `type` for friendlier messages.
 */
export function zodErrorToDiagnostics(
  error: z.ZodError,
  input: unknown,
): Diagnostic[] {
  return error.issues.map((issue) =>
    mapIssue(issue.path as ReadonlyArray<PropertyKey>, issue.message, input),
  );
}
