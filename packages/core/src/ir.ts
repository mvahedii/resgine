/**
 * The normalized Resume Intermediate Representation (IR).
 *
 * The IR is *semantic only*. It describes the meaning of resume content and
 * deliberately carries no styling, no font sizes, no colors, no measurements
 * and no PDF concepts. Any theme and any renderer consume the exact same IR,
 * which is what makes output deterministic and renderers swappable.
 */

export interface ResumeDocument {
  meta: ResumeMeta;
  sections: ResumeSection[];
}

export interface ResumeMeta {
  /** Version of the resume schema this document was validated against. */
  schemaVersion: string;
}

/**
 * One section of a resume. `data` is the section's validated and normalized
 * payload; its concrete shape depends on `type` and is known both to the
 * section definition and to the theme renderer registered for that type.
 */
export interface ResumeSection {
  /** Stable identifier, unique within the document. */
  id: string;
  /** Section kind, e.g. `"personal-info"`, `"experience"`. */
  type: string;
  /** Optional human-facing heading; a theme may use or ignore it. */
  title?: string;
  data: unknown;
}
