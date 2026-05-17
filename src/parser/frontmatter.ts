import matter from 'gray-matter';
import type { ResumeHeader } from '../types/resume.js';

export function parseFrontmatter(raw: string): { header: ResumeHeader; body: string } {
  const { data, content } = matter(raw);

  if (!data.name) throw new Error('Frontmatter missing required field: name');
  if (!data.email) throw new Error('Frontmatter missing required field: email');
  if (!data.title) throw new Error('Frontmatter missing required field: title');

  const header: ResumeHeader = {
    name: String(data.name),
    title: String(data.title),
    email: String(data.email),
    phone: data.phone ? String(data.phone) : undefined,
    linkedin: data.linkedin ? String(data.linkedin) : undefined,
    github: data.github ? String(data.github) : undefined,
    location: data.location ? String(data.location) : undefined,
  };

  return { header, body: content };
}
