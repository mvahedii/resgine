import { readFileSync } from 'fs';
import { parseFrontmatter } from './frontmatter.js';
import { parseMarkdown } from './markdown.js';
import { sliceByH2 } from '../utils/mdast.js';
import { parseSummary } from './sections/summary.js';
import { parseExperience } from './sections/experience.js';
import { parseEducation } from './sections/education.js';
import { parseSkills } from './sections/skills.js';
import { parseProjects } from './sections/projects.js';
import type { Resume } from '../types/resume.js';

export function parseResume(raw: string): Resume {
  const { header, body } = parseFrontmatter(raw);
  const ast = parseMarkdown(body);
  const slices = sliceByH2(ast);

  return {
    header,
    summary: parseSummary(slices.get('summary') ?? []),
    experience: parseExperience(slices.get('work experience') ?? []),
    education: parseEducation(slices.get('education') ?? []),
    skills: parseSkills(slices.get('skills') ?? []),
    projects: parseProjects(slices.get('projects') ?? []),
  };
}

// Dev smoke test: tsx src/parser/index.ts example/resume.md
if (process.argv[1]?.endsWith('parser/index.ts') || process.argv[1]?.endsWith('parser/index.js')) {
  const path = process.argv[2];
  if (path) {
    const raw = readFileSync(path, 'utf-8');
    const resume = parseResume(raw);
    console.log(JSON.stringify(resume, null, 2));
  }
}
