import type { LayoutNode, PageConfig } from "@resgine/layout";

/**
 * The theme system.
 *
 * A theme owns *all* visual decisions: typography, spacing, colors, section
 * structure and layout. A theme receives semantic section data and returns
 * abstract layout nodes — it never touches PDFKit or any renderer directly.
 */
export interface TypeStyle {
  font: string;
  size: number;
  lineHeight?: number;
  color?: string;
}

/**
 * A theme's design tokens. Tokens are the theme's private vocabulary; renderers
 * never see them — the theme resolves tokens into concrete layout-node styles.
 */
export interface ThemeTokens {
  colors: Record<string, string>;
  spacing: Record<string, number>;
  typography: Record<string, TypeStyle>;
}

export interface ThemeContext {
  tokens: ThemeTokens;
  page: PageConfig;
}

export type SectionRenderer<TData = unknown> = (
  data: TData,
  ctx: ThemeContext,
) => LayoutNode;

export interface Theme {
  id: string;
  name: string;
  page: PageConfig;
  tokens: ThemeTokens;
  renderers: Record<string, SectionRenderer>;
}

/**
 * Renderer map for {@link ThemeDefinition}. `TMap` maps each section type to
 * its data type, so every renderer receives fully typed `data`. To add a
 * custom section, widen `TMap` at the `defineTheme` call site:
 *
 * ```ts
 * defineTheme<SectionDataMap & { 'awards': AwardData }>({ ... })
 * ```
 */
export type ThemeRenderers<TMap extends Record<string, unknown>> = {
  [K in keyof TMap]?: SectionRenderer<TMap[K]>;
};

export interface ThemeDefinition<TMap extends Record<string, unknown>> {
  id: string;
  name?: string;
  page: PageConfig;
  tokens: ThemeTokens;
  renderers: ThemeRenderers<TMap>;
}

/**
 * Construct a theme. Generic over a section→data type map so theme authors get
 * compile-time-checked, fully typed renderers.
 */
export function defineTheme<TMap extends Record<string, unknown>>(
  def: ThemeDefinition<TMap>,
): Theme {
  return {
    id: def.id,
    name: def.name ?? def.id,
    page: def.page,
    tokens: def.tokens,
    renderers: def.renderers as unknown as Record<string, SectionRenderer>,
  };
}
