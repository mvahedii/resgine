/**
 * @resgine/core
 *
 * The framework layer: the semantic resume IR, the theme system, and the
 * IR→layout composition stage. Core depends only on `@resgine/layout` and
 * holds no styling values, no domain section definitions, and no PDF concepts.
 */

export type { ResumeDocument, ResumeMeta, ResumeSection } from './ir.js';
export type {
  Theme,
  ThemeContext,
  ThemeDefinition,
  ThemeRenderers,
  ThemeTokens,
  TypeStyle,
  SectionRenderer,
} from './theme.js';
export { defineTheme } from './theme.js';
export type { ComposeResult } from './compose.js';
export { composeResume } from './compose.js';
