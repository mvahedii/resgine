import { validate } from "@resgine/validator";
import { loadJsonFile, printDiagnostics } from "../util.js";

/**
 * `resume validate` — check a resume JSON file against the schema and print
 * structured diagnostics. Exits non-zero when the document is invalid.
 */
export async function validateCommand(input: string): Promise<void> {
  const loaded = await loadJsonFile(input);
  if (!loaded.ok) {
    console.error(loaded.message);
    process.exitCode = 1;
    return;
  }

  const result = validate(loaded.json);
  if (result.ok) {
    const count = result.document.sections.length;
    console.log(`✓ ${loaded.path} is valid — ${count} section(s).`);
    return;
  }

  console.error(`✗ ${result.diagnostics.length} issue(s) in ${loaded.path}:\n`);
  printDiagnostics(result.diagnostics);
  process.exitCode = 1;
}
