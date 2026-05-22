import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { Diagnostic } from '@resgine/validator';

/** Outcome of reading and JSON-parsing a file. */
export type LoadResult =
  | { ok: true; json: unknown; path: string }
  | { ok: false; message: string };

/** Read a file and parse it as JSON, reporting failures instead of throwing. */
export async function loadJsonFile(input: string): Promise<LoadResult> {
  const path = resolve(input);
  let raw: string;
  try {
    raw = await readFile(path, 'utf8');
  } catch {
    return { ok: false, message: `Cannot read file: ${path}` };
  }
  try {
    return { ok: true, json: JSON.parse(raw) as unknown, path };
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    return { ok: false, message: `Invalid JSON in ${path}: ${detail}` };
  }
}

/** Render one diagnostic as an indented, location-prefixed line. */
export function formatDiagnostic(diagnostic: Diagnostic): string {
  const location: string[] = [];
  if (diagnostic.section) location.push(diagnostic.section);
  else if (diagnostic.index !== undefined) location.push(`section ${diagnostic.index}`);
  if (diagnostic.field) location.push(diagnostic.field);

  const where = location.length > 0 ? ` [${location.join(' › ')}]` : '';
  const mark = diagnostic.severity === 'warning' ? '!' : '✗';
  return `  ${mark}${where} ${diagnostic.message}`;
}

export function printDiagnostics(diagnostics: readonly Diagnostic[]): void {
  for (const diagnostic of diagnostics) {
    console.error(formatDiagnostic(diagnostic));
  }
}
