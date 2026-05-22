import {
  defineSection,
  type InferSectionData,
  type SectionDefinition,
} from './define-section.js';
import { group, list, richText, text } from './fields.js';

/**
 * The six standard resume sections, declared entirely with the public DSL —
 * they are not privileged. A community section is defined the exact same way.
 */

export const personalInfoSection = defineSection({
  type: 'personal-info',
  title: 'Personal Info',
  fields: {
    name: text({ required: true, description: 'Full name' }),
    headline: text({
      required: true,
      description: 'Professional headline, e.g. "Senior Software Engineer"',
    }),
    email: text({ required: true, description: 'Contact email address' }),
    phone: text({ description: 'Contact phone number' }),
    location: text({ description: 'City, country' }),
    links: list(
      group({
        label: text({ required: true, description: 'Link label, e.g. "GitHub"' }),
        url: text({ required: true, description: 'Fully-qualified URL' }),
      }),
      { description: 'External profile links' },
    ),
  },
});

export const summarySection = defineSection({
  type: 'summary',
  title: 'Summary',
  fields: {
    body: richText({ required: true, description: 'Professional summary' }),
  },
});

export const experienceSection = defineSection({
  type: 'experience',
  title: 'Experience',
  fields: {
    items: list(
      group({
        role: text({ required: true, description: 'Job title' }),
        company: text({ required: true, description: 'Employer name' }),
        period: text({ required: true, description: 'e.g. "2021 — Present"' }),
        location: text({ description: 'Job location' }),
        highlights: list(text({ required: true }), {
          description: 'Accomplishment bullet points',
        }),
      }),
      { required: true },
    ),
  },
});

export const educationSection = defineSection({
  type: 'education',
  title: 'Education',
  fields: {
    items: list(
      group({
        degree: text({ required: true, description: 'Degree or qualification' }),
        institution: text({ required: true, description: 'School or university' }),
        period: text({ required: true, description: 'e.g. "2014 — 2018"' }),
        details: text({ description: 'Optional notes, e.g. GPA or honours' }),
      }),
      { required: true },
    ),
  },
});

export const skillsSection = defineSection({
  type: 'skills',
  title: 'Skills',
  fields: {
    items: list(
      group({
        category: text({ required: true, description: 'Skill group name' }),
        items: list(text({ required: true }), {
          required: true,
          description: 'Individual skills',
        }),
      }),
      { required: true },
    ),
  },
});

export const projectsSection = defineSection({
  type: 'projects',
  title: 'Projects',
  fields: {
    items: list(
      group({
        name: text({ required: true, description: 'Project name' }),
        url: text({ description: 'Project URL' }),
        description: text({ description: 'Short project description' }),
        highlights: list(text({ required: true }), {
          description: 'Notable details',
        }),
      }),
      { required: true },
    ),
  },
});

/* -------------------------------------------------------------------------- */
/* Inferred data types                                                         */
/* -------------------------------------------------------------------------- */

export type PersonalInfoData = InferSectionData<typeof personalInfoSection>;
export type SummaryData = InferSectionData<typeof summarySection>;
export type ExperienceData = InferSectionData<typeof experienceSection>;
export type EducationData = InferSectionData<typeof educationSection>;
export type SkillsData = InferSectionData<typeof skillsSection>;
export type ProjectsData = InferSectionData<typeof projectsSection>;

/**
 * Maps each standard section type to its data type. Theme authors pass this to
 * `defineTheme<SectionDataMap>` so every renderer gets fully typed `data`.
 *
 * Declared as a `type` (not an `interface`) so it structurally satisfies the
 * `Record<string, unknown>` constraint on `defineTheme`.
 */
export type SectionDataMap = {
  'personal-info': PersonalInfoData;
  summary: SummaryData;
  experience: ExperienceData;
  education: EducationData;
  skills: SkillsData;
  projects: ProjectsData;
};

/* -------------------------------------------------------------------------- */
/* Registry                                                                    */
/* -------------------------------------------------------------------------- */

/** All standard sections in canonical display order. */
export const standardSections: readonly SectionDefinition[] = [
  personalInfoSection,
  summarySection,
  experienceSection,
  educationSection,
  skillsSection,
  projectsSection,
];

/** Lookup of section type → definition, used by the validator. */
export const sectionRegistry: ReadonlyMap<string, SectionDefinition> = new Map(
  standardSections.map((section) => [section.type, section]),
);
