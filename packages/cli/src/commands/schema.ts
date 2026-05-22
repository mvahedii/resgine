import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { toJsonSchema } from '@resgine/schema';

/**
 * `resume schema` — emit the resume JSON Schema. Point a resume's `$schema` at
 * the written file to get editor autocomplete and inline validation.
 */
export async function schemaCommand(output?: string): Promise<void> {
  const json = `${JSON.stringify(toJsonSchema(), null, 2)}\n`;

  if (!output) {
    process.stdout.write(json);
    return;
  }

  const path = resolve(output);
  await writeFile(path, json, 'utf8');
  console.log(`✓ JSON Schema written to ${path}`);
}
