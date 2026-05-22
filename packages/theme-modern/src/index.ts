/**
 * @resgine/theme-modern
 *
 * The Modern theme — a clean, single-column resume theme. It is a reference
 * implementation of the theme contract: it depends on `@resgine/core` (for
 * `defineTheme`), `@resgine/layout` (for layout builders) and `@resgine/schema`
 * (for section data types) — and never on any renderer.
 *
 * A community theme is authored exactly like this file.
 */

import { defineTheme } from '@resgine/core';
import type { SectionDataMap } from '@resgine/schema';
import { renderers } from './renderers.js';
import { page, tokens } from './tokens.js';

export const modernTheme = defineTheme<SectionDataMap>({
  id: 'modern',
  name: 'Modern',
  page,
  tokens,
  renderers,
});

export { page, tokens } from './tokens.js';
export { renderers } from './renderers.js';
export default modernTheme;
