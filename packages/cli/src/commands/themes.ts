import { listThemes } from '../registry.js';

/** `resume themes` — list every registered theme. */
export function themesCommand(): void {
  const themes = listThemes();
  console.log(`Available themes (${themes.length}):\n`);
  for (const theme of themes) {
    console.log(`  ${theme.id.padEnd(14)} ${theme.name}`);
  }
}
