#!/usr/bin/env node
import { Command } from 'commander';
import { buildCommand } from './commands/build.js';
import { initCommand } from './commands/init.js';
import { schemaCommand } from './commands/schema.js';
import { themesCommand } from './commands/themes.js';
import { validateCommand } from './commands/validate.js';
import { DEFAULT_THEME_ID } from './registry.js';

/**
 * @resgine/cli
 *
 * The command-line entry point. The CLI only orchestrates the pipeline —
 * validation, composition and rendering all live in their own packages.
 */

const program = new Command();

program
  .name('resume')
  .description('Resgine — a schema-driven, themeable JSON resume rendering engine')
  .version('0.1.0');

program
  .command('build')
  .description('Validate a resume and render it to a PDF')
  .argument('<input>', 'path to the resume JSON file')
  .option('-o, --output <file>', 'output PDF path (defaults next to the input)')
  .option('-t, --theme <id>', 'theme id', DEFAULT_THEME_ID)
  .action(async (input: string, options: { output?: string; theme: string }) => {
    await buildCommand({ input, output: options.output, theme: options.theme });
  });

program
  .command('validate')
  .description('Validate a resume JSON file and print structured diagnostics')
  .argument('<input>', 'path to the resume JSON file')
  .action(async (input: string) => {
    await validateCommand(input);
  });

program
  .command('init')
  .description('Create a starter resume.json')
  .argument('[path]', 'destination path', 'resume.json')
  .action(async (path: string) => {
    await initCommand(path);
  });

program
  .command('themes')
  .description('List available themes')
  .action(() => {
    themesCommand();
  });

program
  .command('schema')
  .description('Print the resume JSON Schema, or write it with --output')
  .option('-o, --output <file>', 'output path for the JSON Schema file')
  .action(async (options: { output?: string }) => {
    await schemaCommand(options.output);
  });

program.parseAsync(process.argv).catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
