import type {
  SectionRenderer,
  ThemeRenderers,
  ThemeTokens,
  TypeStyle,
} from '@resgine/core';
import { L, type HBoxChild, type LayoutNode, type TextStyle } from '@resgine/layout';
import type {
  EducationData,
  ExperienceData,
  PersonalInfoData,
  ProjectsData,
  SectionDataMap,
  SkillsData,
  SummaryData,
} from '@resgine/schema';

/**
 * Section renderers for the Modern theme.
 *
 * Each renderer receives fully typed, semantic section data and returns an
 * abstract layout subtree. No renderer touches PDFKit — that is what keeps
 * themes portable across renderers.
 */

/* -------------------------------------------------------------------------- */
/* Helpers                                                                     */
/* -------------------------------------------------------------------------- */

/** Resolve a semantic {@link TypeStyle} token into a concrete {@link TextStyle}. */
function resolve(
  style: TypeStyle,
  color: string,
  extra: Partial<TextStyle> = {},
): TextStyle {
  return {
    font: style.font,
    size: style.size,
    color,
    lineHeight: style.lineHeight,
    ...extra,
  };
}

/** A section heading (uppercase), a hairline rule, then the section body. */
function sectionBlock(
  title: string,
  body: LayoutNode[],
  t: ThemeTokens,
): LayoutNode {
  const c = t.colors;
  return L.vbox([
    L.text(title.toUpperCase(), resolve(t.typography.heading, c.ink)),
    L.divider({ color: c.rule, thickness: 1, gap: 3 }),
    L.spacer(t.spacing.afterHeading),
    L.vbox(body, { gap: t.spacing.entry }),
  ]);
}

/** A bullet list of plain-text items in the theme's accent/body styles. */
function bullets(items: readonly string[], t: ThemeTokens): LayoutNode {
  const c = t.colors;
  return L.bulletList(
    items.map((item) => L.text(item, resolve(t.typography.bullet, c.body))),
    {
      marker: '•',
      markerStyle: resolve(t.typography.bullet, c.accent),
      gap: t.spacing.bullet,
      indent: 13,
    },
  );
}

/** A two-row entry header: bold title + meta, then accent subtitle + meta. */
function entryHeader(
  title: string,
  meta: string,
  subtitle: string,
  subMeta: string | undefined,
  t: ThemeTokens,
): LayoutNode {
  const c = t.colors;
  const topRow = L.hbox(
    [
      L.flex(L.text(title, resolve(t.typography.entryTitle, c.ink))),
      L.text(meta, resolve(t.typography.entryMeta, c.muted)),
    ],
    { gap: 14 },
  );

  const subRow: (LayoutNode | HBoxChild)[] = [
    L.flex(L.text(subtitle, resolve(t.typography.entrySubtitle, c.accent))),
  ];
  if (subMeta) {
    subRow.push(L.text(subMeta, resolve(t.typography.entryMeta, c.muted)));
  }

  return L.vbox([topRow, L.hbox(subRow, { gap: 14 })], {
    gap: t.spacing.entryRow,
  });
}

/* -------------------------------------------------------------------------- */
/* Section renderers                                                           */
/* -------------------------------------------------------------------------- */

const renderPersonalInfo: SectionRenderer<PersonalInfoData> = (data, ctx) => {
  const t = ctx.tokens;
  const c = t.colors;
  const contact = [data.email, data.phone, data.location].filter(
    (v): v is string => Boolean(v),
  );

  const children: LayoutNode[] = [
    L.text(data.name, resolve(t.typography.name, c.ink)),
    L.spacer(3),
    L.text(data.headline, resolve(t.typography.headline, c.accent)),
  ];

  if (contact.length > 0) {
    children.push(L.spacer(7));
    children.push(
      L.text(contact.join('    ·    '), resolve(t.typography.contact, c.muted)),
    );
  }

  if (data.links && data.links.length > 0) {
    children.push(L.spacer(3));
    children.push(renderLinks(data.links, t));
  }

  children.push(L.spacer(10));
  children.push(L.divider({ color: c.rule, thickness: 1.4, gap: 0 }));
  return L.vbox(children);
};

/** Render profile links as a row of individually clickable text runs. */
function renderLinks(
  links: ReadonlyArray<{ label: string; url: string }>,
  t: ThemeTokens,
): LayoutNode {
  const c = t.colors;
  const separator = resolve(t.typography.contact, c.muted);
  const nodes: LayoutNode[] = [];
  links.forEach((link, i) => {
    if (i > 0) nodes.push(L.text('    ·    ', separator));
    nodes.push(
      L.text(link.label, resolve(t.typography.contact, c.accent, { link: link.url })),
    );
  });
  return L.hbox(nodes, { gap: 0 });
}

const renderSummary: SectionRenderer<SummaryData> = (data, ctx) => {
  const t = ctx.tokens;
  const paragraphs = data.body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
  const body = paragraphs.map((p) =>
    L.text(p, resolve(t.typography.body, t.colors.body)),
  );
  return sectionBlock('Summary', body, t);
};

const renderExperience: SectionRenderer<ExperienceData> = (data, ctx) => {
  const t = ctx.tokens;
  const entries = data.items.map((item) => experienceEntry(item, t));
  return sectionBlock('Experience', entries, t);
};

function experienceEntry(
  item: ExperienceData['items'][number],
  t: ThemeTokens,
): LayoutNode {
  const rows: LayoutNode[] = [
    entryHeader(item.role, item.period, item.company, item.location, t),
  ];
  if (item.highlights && item.highlights.length > 0) {
    rows.push(L.spacer(4));
    rows.push(bullets(item.highlights, t));
  }
  return L.vbox(rows);
}

const renderEducation: SectionRenderer<EducationData> = (data, ctx) => {
  const t = ctx.tokens;
  const entries = data.items.map((item) =>
    entryHeader(item.degree, item.period, item.institution, item.details, t),
  );
  return sectionBlock('Education', entries, t);
};

const renderSkills: SectionRenderer<SkillsData> = (data, ctx) => {
  const t = ctx.tokens;
  const c = t.colors;
  const rows = data.items.map((group) =>
    L.hbox(
      [
        L.fixed(
          L.text(group.category, resolve(t.typography.entryTitle, c.ink)),
          122,
        ),
        L.flex(
          L.text(group.items.join(',   '), resolve(t.typography.body, c.body)),
        ),
      ],
      { gap: 12 },
    ),
  );
  return sectionBlock('Skills', rows, t);
};

const renderProjects: SectionRenderer<ProjectsData> = (data, ctx) => {
  const t = ctx.tokens;
  const entries = data.items.map((item) => projectEntry(item, t));
  return sectionBlock('Projects', entries, t);
};

function projectEntry(
  item: ProjectsData['items'][number],
  t: ThemeTokens,
): LayoutNode {
  const c = t.colors;
  const titleStyle = item.url
    ? resolve(t.typography.entryTitle, c.accent, { link: item.url })
    : resolve(t.typography.entryTitle, c.ink);

  const rows: LayoutNode[] = [L.text(item.name, titleStyle)];
  if (item.description) {
    rows.push(L.spacer(2));
    rows.push(L.text(item.description, resolve(t.typography.body, c.body)));
  }
  if (item.highlights && item.highlights.length > 0) {
    rows.push(L.spacer(4));
    rows.push(bullets(item.highlights, t));
  }
  return L.vbox(rows);
}

/* -------------------------------------------------------------------------- */
/* Renderer registry                                                           */
/* -------------------------------------------------------------------------- */

/** Renderer for every standard section, fully typed against `SectionDataMap`. */
export const renderers: ThemeRenderers<SectionDataMap> = {
  'personal-info': renderPersonalInfo,
  summary: renderSummary,
  experience: renderExperience,
  education: renderEducation,
  skills: renderSkills,
  projects: renderProjects,
};
