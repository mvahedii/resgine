import type { Theme } from '@resgine/core';
import { modernTheme } from '@resgine/theme-modern';

/**
 * The theme registry.
 *
 * Themes are registered here by id. Today the CLI bundles `theme-modern`;
 * resolving a community theme by npm package name (dynamic `import()`) would
 * plug in at `getTheme` without changing any command.
 */
const themes = new Map<string, Theme>([[modernTheme.id, modernTheme]]);

export const DEFAULT_THEME_ID = modernTheme.id;

export function getTheme(id: string): Theme | undefined {
  return themes.get(id);
}

export function listThemes(): Theme[] {
  return [...themes.values()];
}
