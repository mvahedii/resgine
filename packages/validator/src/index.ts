/**
 * @resgine/validator
 *
 * Validates untrusted resume JSON against `@resgine/schema`, turns Zod failures
 * into structured, section/field-aware diagnostics, and normalizes valid input
 * into the `@resgine/core` IR. It never renders anything.
 */

export type { Diagnostic } from './diagnostics.js';
export { zodErrorToDiagnostics } from './diagnostics.js';
export type { ValidationResult } from './validate.js';
export { validate } from './validate.js';
