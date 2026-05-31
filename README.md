# Resgine

A **schema-driven, themeable, JSON-based resume rendering engine**.

Resgine turns a validated JSON resume into a polished PDF. There is no Markdown,
no HTML, and no headless browser — a JSON document flows through a strict
pipeline and is drawn directly with [PDFKit](https://pdfkit.org/).

```
JSON Resume  →  Schema Validation  →  Normalized IR  →  Layout Tree  →  PDF
```

## Why

- **Deterministic** — no browser, no layout engine drift, fixed metadata. The
  same input produces the same PDF.
- **Themeable** — themes control typography, spacing, layout and section
  structure. A theme emits abstract layout nodes; it never touches PDFKit.
- **Schema-driven** — sections are declared with a typed DSL. Custom sections
  need no engine changes.
- **Strongly typed** — every stage is fully typed; theme renderers receive
  typed section data inferred from the schema.

## Quick start

```bash
pnpm install

# Render the example resume to examples/resume.pdf
pnpm dev:example

# Or drive the CLI directly (no build step — runs through tsx)
pnpm resume validate examples/resume.json
pnpm resume build    examples/resume.json -o out.pdf
pnpm resume themes
pnpm resume init     my-resume.json
pnpm resume schema -o examples/resume.schema.json
```

`pnpm build` compiles every package (`tsc -b`) into publishable `dist/` output.

## Architecture

Resgine is a pnpm monorepo. Each pipeline stage is its own package with a
single responsibility and an acyclic dependency graph:

| Package | Role | Depends on |
|---|---|---|
| [`@resgine/layout`](packages/layout) | Renderer-agnostic layout primitives (`VBox`, `HBox`, `Text`, `Spacer`, `Divider`, `BulletList`) + measurement seam | — |
| [`@resgine/schema`](packages/schema) | Field DSL, `defineSection`, standard sections, resume Zod schema, JSON Schema export | `zod` |
| [`@resgine/core`](packages/core) | Semantic resume IR, theme system (`defineTheme`), IR→layout composition | `layout` |
| [`@resgine/validator`](packages/validator) | `validate()` — Zod parsing, structured diagnostics, IR normalization | `core`, `schema` |
| [`@resgine/pdf-renderer`](packages/pdf-renderer) | Draws a layout tree to PDF with PDFKit; block-level pagination | `layout`, `pdfkit` |
| [`@resgine/theme-modern`](packages/theme-modern) | The reference theme | `core`, `layout`, `schema` |
| [`@resgine/cli`](packages/cli) | `resume build / validate / init / themes / schema` | all of the above |

### Layered design

1. **Resume IR is semantic only.** It carries no font sizes, colors or
   coordinates — only meaning (`{ type, data }`).
2. **Themes resolve meaning into layout.** A theme owns tokens (typography,
   spacing, colors) and per-section renderers that return abstract layout
   nodes carrying *resolved* styles.
3. **Renderers draw layout.** The PDF renderer consumes layout nodes and knows
   nothing about themes or resumes. Any other backend implementing the same
   node walk + `MeasureContext` could replace it.

## The resume format

A resume is a versioned, ordered list of typed sections:

```json
{
  "$schema": "./resume.schema.json",
  "schemaVersion": "1.0",
  "sections": [
    { "type": "personal-info", "data": { "name": "Ada Lovelace", "...": "..." } },
    { "type": "summary",       "data": { "body": "..." } },
    { "type": "experience",    "data": { "items": [ "..." ] } }
  ]
}
```

Standard sections: `personal-info`, `summary`, `experience`, `education`,
`skills`, `projects`. See [`examples/resume.json`](examples/resume.json) for a
complete document. Run `resume schema` to generate the JSON Schema and point
`$schema` at it for editor autocomplete and inline validation.

## Defining a section

Sections are declared with a typed field DSL — the standard sections use the
exact same API, so they are not privileged:

```ts
import { defineSection, text, list, group } from '@resgine/schema';

export const awardsSection = defineSection({
  type: 'awards',
  title: 'Awards',
  fields: {
    items: list(
      group({
        name: text({ required: true }),
        year: text({ required: true }),
        note: text(),
      }),
      { required: true },
    ),
  },
});
```

## Authoring a theme

A theme is design tokens plus per-section renderers. Renderers receive typed,
semantic section data and return abstract layout nodes — never PDFKit calls:

```ts
import { defineTheme } from '@resgine/core';
import { L } from '@resgine/layout';
import type { SectionDataMap } from '@resgine/schema';

export const myTheme = defineTheme<SectionDataMap>({
  id: 'my-theme',
  page: { size: 'A4', margins: { top: 52, right: 56, bottom: 52, left: 56 } },
  tokens: { colors: { /* ... */ }, spacing: { /* ... */ }, typography: { /* ... */ } },
  renderers: {
    summary: (data, ctx) =>
      L.text(data.body, {
        font: 'Helvetica',
        size: 10,
        color: ctx.tokens.colors.body,
      }),
    // ...one renderer per section type
  },
});
```

[`@resgine/theme-modern`](packages/theme-modern) is a complete reference
implementation.

## Extensibility

- **New sections** — call `defineSection` and add a matching theme renderer.
- **Community themes** — a theme is a standalone package depending only on
  `core`, `layout` and `schema`. The CLI registry is the seam for resolving a
  theme by npm package name.
- **Pagination & layout** — `MeasureContext` abstracts measurement; a future
  standalone layout/pagination engine can plug in without a renderer.
- **Alternate renderers** — any backend that walks layout nodes and implements
  `MeasureContext` (SVG, canvas, …) can replace the PDF renderer.

## License

MIT
