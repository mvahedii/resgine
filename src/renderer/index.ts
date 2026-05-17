import { createDocument, saveDocument } from './document.js';
import { renderHeader } from './sections/header.js';
import { renderSummary } from './sections/summary.js';
import { renderExperience } from './sections/experience.js';
import { renderEducation } from './sections/education.js';
import { renderSkills } from './sections/skills.js';
import { renderProjects } from './sections/projects.js';
import type { Resume } from '../types/resume.js';

export async function renderResume(resume: Resume, outputPath: string): Promise<void> {
  const doc = createDocument();

  renderHeader(doc, resume.header);
  if (resume.summary) renderSummary(doc, resume.summary);
  renderExperience(doc, resume.experience);
  renderEducation(doc, resume.education);
  renderSkills(doc, resume.skills);
  renderProjects(doc, resume.projects);

  await saveDocument(doc, outputPath);
}
