import { z } from 'zod';
import type { SectionDefinition } from './define-section.js';
import {
  educationSection,
  experienceSection,
  personalInfoSection,
  projectsSection,
  skillsSection,
  summarySection,
} from './sections.js';

/**
 * The full resume document schema. A resume is a versioned, ordered list of
 * typed sections — there is no fixed section set, which is what makes the
 * format extensible.
 */

/** Current resume schema version written into new documents. */
export const SCHEMA_VERSION = '1.0';

/** Build the `{ type, title?, data }` envelope schema for one section type. */
function sectionEntry<T extends string>(def: SectionDefinition<unknown, T>) {
  return z.object({
    type: z.literal(def.type),
    title: z.string().optional(),
    data: def.dataSchema,
  });
}

/** Discriminated union over `type` — one clean branch per section kind. */
export const sectionSchema = z.discriminatedUnion('type', [
  sectionEntry(personalInfoSection),
  sectionEntry(summarySection),
  sectionEntry(experienceSection),
  sectionEntry(educationSection),
  sectionEntry(skillsSection),
  sectionEntry(projectsSection),
]);

export const resumeSchema = z.object({
  /** Optional pointer to the JSON Schema file, enabling IDE autocomplete. */
  $schema: z.string().optional(),
  schemaVersion: z.string(),
  sections: z.array(sectionSchema),
});

/** The statically inferred type of a valid resume JSON document. */
export type ResumeInput = z.infer<typeof resumeSchema>;
