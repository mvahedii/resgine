import { basename, extname, resolve } from 'node:path';
import { composeResume, type ResumeDocument } from '@resgine/core';
import { renderToFile } from '@resgine/pdf-renderer';
import { validate } from '@resgine/validator';
import { getTheme, listThemes } from '../registry.js';
import { loadJsonFile, printDiagnostics } from '../util.js';

export interface BuildArgs {
  input: string;
  output?: string;
  theme: string;
}

/**
 * `resume build` — run the full pipeline:
 * JSON → validate → IR → compose layout tree → render PDF.
 */
export async function buildCommand(args: BuildArgs): Promise<void> {
  const theme = getTheme(args.theme);
  if (!theme) {
    const available = listThemes()
      .map((t) => t.id)
      .join(', ');
    console.error(`Unknown theme "${args.theme}". Available: ${available}.`);
    process.exitCode = 1;
    return;
  }

  const loaded = await loadJsonFile(args.input);
  if (!loaded.ok) {
    console.error(loaded.message);
    process.exitCode = 1;
    return;
  }

  const result = validate(loaded.json);
  if (!result.ok) {
    console.error(
      `Validation failed — ${result.diagnostics.length} issue(s):\n`,
    );
    printDiagnostics(result.diagnostics);
    process.exitCode = 1;
    return;
  }

  const { tree, warnings } = composeResume(result.document, theme);
  for (const warning of warnings) console.warn(`warning: ${warning}`);

  const outputPath = resolve(args.output ?? defaultOutputPath(loaded.path));
  await renderToFile(tree, outputPath, {
    page: theme.page,
    title: resumeTitle(result.document),
  });

  console.log(`✓ PDF written to ${outputPath}  (theme: ${theme.name})`);
}

function defaultOutputPath(inputPath: string): string {
  return `${basename(inputPath, extname(inputPath))}.pdf`;
}

/** Best-effort PDF document title taken from the personal-info section. */
function resumeTitle(document: ResumeDocument): string | undefined {
  const personal = document.sections.find((s) => s.type === 'personal-info');
  const data = personal?.data;
  if (data && typeof data === 'object' && 'name' in data) {
    const name = (data as { name?: unknown }).name;
    if (typeof name === 'string') return `${name} — Résumé`;
  }
  return undefined;
}
