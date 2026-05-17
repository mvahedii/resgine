#!/usr/bin/env node
import { Command } from 'commander';
import { readFileSync } from 'fs';
import { resolve, basename, extname } from 'path';
import { parseResume } from './parser/index.js';
import { renderResume } from './renderer/index.js';

const program = new Command();

program
  .name('resume-build')
  .description('Generate a PDF resume from a Markdown file')
  .version('1.0.0')
  .argument('<input>', 'Path to the .md resume file')
  .option('-o, --output <file>', 'Output PDF file path')
  .action(async (input: string, options: { output?: string }) => {
    const inputPath = resolve(input);
    const defaultOutput = basename(inputPath, extname(inputPath)) + '.pdf';
    const outputPath = resolve(options.output ?? defaultOutput);

    try {
      const raw = readFileSync(inputPath, 'utf-8');
      const resume = parseResume(raw);
      await renderResume(resume, outputPath);
      console.log(`✓ PDF written to: ${outputPath}`);
    } catch (err) {
      console.error('Error:', (err as Error).message);
      process.exit(1);
    }
  });

program.parse();
