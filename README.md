# resume-build

A CLI tool that converts a Markdown resume into a polished PDF using [PDFKit](https://pdfkit.org/) — no headless browser, no LaTeX, no dependencies beyond Node.

## How it works

```
resume.md  →  [Parser]  →  Resume (typed AST)  →  [Renderer]  →  output.pdf
```

1. **Parser** — strips YAML frontmatter (contact info), then walks the Markdown AST section-by-section (`## Summary`, `## Work Experience`, etc.) and maps each block into a typed `Resume` object.
2. **Renderer** — iterates the `Resume` object and draws each section onto a PDFKit document using a shared theme (fonts, colors, spacing). The document is piped to a write stream and saved to disk.

## Usage

### Build the CLI

```bash
pnpm install
pnpm dlx tsup   # or: npx tsup
```

This produces `dist/index.js` (a self-contained CJS bundle with a shebang).

### Run

```bash
node dist/index.js <input.md> [options]

# Examples
node dist/index.js example/resume.md
node dist/index.js example/resume.md -o my-resume.pdf
```

During development you can run without building:

```bash
npx tsx src/index.ts example/resume.md
```

### Options

| Flag | Description |
|------|-------------|
| `-o, --output <file>` | Output PDF path (defaults to `<input>.pdf` next to the source file) |
| `-V, --version` | Print version |
| `-h, --help` | Show help |

## Resume format

Write your resume in Markdown with a YAML frontmatter block at the top.

```markdown
---
name: Jane Smith
title: Software Engineer
email: jane@example.com
phone: "+1 (555) 000-0000"
linkedin: linkedin.com/in/janesmith
github: github.com/janesmith
location: San Francisco, CA
---

## Summary

One-paragraph professional summary.

## Work Experience

### Role @ Company
*Month YYYY – Month YYYY | Location*

- Bullet point
- Bullet point

## Education

### Degree | Institution
*YYYY – YYYY*

## Skills

**Category:** Item, Item, Item

## Projects

### Project Name
*[link-text](https://url)*

Short description.

- Bullet point
```

### Frontmatter fields

| Field | Required | Description |
|-------|----------|-------------|
| `name` | yes | Full name (large heading) |
| `title` | yes | Job title shown under name |
| `email` | yes | Contact email |
| `phone` | no | Phone number |
| `linkedin` | no | LinkedIn URL or handle |
| `github` | no | GitHub URL or handle |
| `location` | no | City, State |

### Sections

Sections are detected by `## H2` headings (case-insensitive). Supported sections:

- **Summary** — a paragraph of plain text
- **Work Experience** — `### Role @ Company` entries with an italic date/location line and bullet points
- **Education** — `### Degree | Institution` entries with an italic date range
- **Skills** — bold category labels followed by a comma-separated list (`**Languages:** Go, Rust`)
- **Projects** — `### Project Name` entries with an optional italic link line, optional description paragraph, and bullet points

## Project structure

```
src/
├── index.ts                  # CLI entry point (Commander)
├── types/
│   └── resume.ts             # Shared TypeScript interfaces
├── parser/
│   ├── index.ts              # Orchestrates parsing → Resume object
│   ├── frontmatter.ts        # gray-matter wrapper
│   ├── markdown.ts           # remark AST builder
│   └── sections/
│       ├── summary.ts
│       ├── experience.ts
│       ├── education.ts
│       ├── skills.ts
│       └── projects.ts
├── renderer/
│   ├── index.ts              # Orchestrates rendering
│   ├── document.ts           # PDFKit document factory + save helper
│   ├── theme.ts              # Fonts, colors, sizes, spacing constants
│   └── sections/
│       ├── header.ts
│       ├── summary.ts
│       ├── experience.ts
│       ├── education.ts
│       ├── skills.ts
│       └── projects.ts
└── utils/
    ├── mdast.ts              # Slice AST nodes by H2 heading
    └── pdf.ts                # Low-level PDFKit drawing helpers
```

## Dependencies

| Package | Purpose |
|---------|---------|
| `pdfkit` | Programmatic PDF generation |
| `commander` | CLI argument parsing |
| `gray-matter` | YAML frontmatter extraction |
| `unified` + `remark-parse` | Markdown → MDAST |
| `unist-util-visit` | AST traversal |
| `mdast-util-to-string` | Extract plain text from AST nodes |

## Requirements

- Node.js 18+
- pnpm 11+
