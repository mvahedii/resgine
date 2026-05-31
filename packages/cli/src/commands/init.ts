import { existsSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { SCHEMA_VERSION } from '@resgine/schema';

/** A minimal but valid starter resume, written by `resume init`. */
const starterResume = {
  $schema: './resume.schema.json',
  schemaVersion: SCHEMA_VERSION,
  sections: [
    {
      type: 'personal-info',
      data: {
        name: 'Your Name',
        headline: 'Your Professional Headline',
        email: 'you@example.com',
        location: 'City, Country',
        links: [{ label: 'GitHub', url: 'https://github.com/you' }],
      },
    },
    {
      type: 'summary',
      data: { body: 'A short professional summary goes here.' },
    },
    {
      type: 'experience',
      data: {
        items: [
          {
            role: 'Job Title',
            company: 'Company',
            period: '2022 — Present',
            highlights: ['Something measurable that you accomplished.'],
          },
        ],
      },
    },
    {
      type: 'education',
      data: {
        items: [
          {
            degree: 'Your Degree',
            institution: 'Your School',
            period: '2016 — 2020',
          },
        ],
      },
    },
    {
      type: 'skills',
      data: {
        items: [{ category: 'Languages', items: ['TypeScript', 'Python'] }],
      },
    },
  ],
};

/**
 * `resume init` — write a starter `resume.json`. Refuses to overwrite an
 * existing file.
 */
export async function initCommand(target: string): Promise<void> {
  const path = resolve(target);
  if (existsSync(path)) {
    console.error(`Refusing to overwrite existing file: ${path}`);
    process.exitCode = 1;
    return;
  }

  await writeFile(path, `${JSON.stringify(starterResume, null, 2)}\n`, 'utf8');
  console.log(`✓ Created ${path}`);
  console.log(`  Edit it, then run:  resume build ${target}`);
}
