import { z } from 'zod';

/**
 * The field builder DSL.
 *
 * Field builders are the vocabulary for declaring section shapes. Each builder
 * returns a {@link FieldDef} that knows (a) its semantic kind, (b) whether it
 * is required, and (c) how to produce a Zod schema for runtime validation.
 */

export type FieldKind =
  | 'text'
  | 'richText'
  | 'list'
  | 'group'
  | 'select'
  | 'number'
  | 'date';

export interface FieldDef<TValue, TRequired extends boolean = boolean> {
  readonly kind: FieldKind;
  readonly required: TRequired;
  readonly description?: string;
  toZod(): z.ZodType;
  /** Phantom marker — never present at runtime — that carries the value type. */
  readonly __value?: TValue;
}

export type AnyFieldDef = FieldDef<unknown, boolean>;

/* -------------------------------------------------------------------------- */
/* Type inference                                                              */
/* -------------------------------------------------------------------------- */

export type InferValue<F> = F extends FieldDef<infer V, boolean> ? V : never;

export type FieldShape = Record<string, AnyFieldDef>;

type RequiredKeys<S extends FieldShape> = {
  [K in keyof S]: S[K] extends FieldDef<unknown, true> ? K : never;
}[keyof S];

type OptionalKeys<S extends FieldShape> = {
  [K in keyof S]: S[K] extends FieldDef<unknown, true> ? never : K;
}[keyof S];

type Prettify<T> = { [K in keyof T]: T[K] } & {};

/** Resolve a field shape into a plain object type with correct optionality. */
export type InferFields<S extends FieldShape> = Prettify<
  { [K in RequiredKeys<S>]: InferValue<S[K]> } & {
    [K in OptionalKeys<S>]?: InferValue<S[K]>;
  }
>;

/* -------------------------------------------------------------------------- */
/* Builder options                                                             */
/* -------------------------------------------------------------------------- */

interface FieldOptions {
  required?: boolean;
  description?: string;
}

/** Options shape that statically marks a field as required. */
interface RequiredOption {
  required: true;
  description?: string;
}

/** Options shape that statically marks a field as optional. */
interface OptionalOption {
  required?: false;
  description?: string;
}

function makeField<TValue, TRequired extends boolean>(
  kind: FieldKind,
  required: TRequired,
  description: string | undefined,
  buildZod: () => z.ZodType,
): FieldDef<TValue, TRequired> {
  return {
    kind,
    required,
    description,
    toZod: () => (description ? buildZod().describe(description) : buildZod()),
  };
}

/* -------------------------------------------------------------------------- */
/* Scalar fields                                                               */
/* -------------------------------------------------------------------------- */

/** A single line of plain text. */
export function text(opts: RequiredOption): FieldDef<string, true>;
export function text(opts?: OptionalOption): FieldDef<string, false>;
export function text(opts: FieldOptions = {}): FieldDef<string, boolean> {
  const required = opts.required ?? false;
  return makeField<string, boolean>('text', required, opts.description, () =>
    required ? z.string().min(1) : z.string(),
  );
}

/**
 * Multi-paragraph prose. The IR value is a `string` (newlines preserved);
 * renderers may split it into paragraphs. The distinct `kind` lets themes
 * treat it differently from plain `text`.
 */
export function richText(opts: RequiredOption): FieldDef<string, true>;
export function richText(opts?: OptionalOption): FieldDef<string, false>;
export function richText(opts: FieldOptions = {}): FieldDef<string, boolean> {
  const required = opts.required ?? false;
  return makeField<string, boolean>('richText', required, opts.description, () =>
    required ? z.string().min(1) : z.string(),
  );
}

/** A numeric field. */
export function number(opts: RequiredOption): FieldDef<number, true>;
export function number(opts?: OptionalOption): FieldDef<number, false>;
export function number(opts: FieldOptions = {}): FieldDef<number, boolean> {
  return makeField<number, boolean>(
    'number',
    opts.required ?? false,
    opts.description,
    () => z.number(),
  );
}

/** A date stored as an ISO-8601-ish string (kept as text for determinism). */
export function date(opts: RequiredOption): FieldDef<string, true>;
export function date(opts?: OptionalOption): FieldDef<string, false>;
export function date(opts: FieldOptions = {}): FieldDef<string, boolean> {
  const required = opts.required ?? false;
  return makeField<string, boolean>('date', required, opts.description, () =>
    required ? z.string().min(1) : z.string(),
  );
}

/** A value constrained to one of a fixed set of strings. */
export function select<const O extends readonly [string, ...string[]]>(
  values: O,
  opts: RequiredOption,
): FieldDef<O[number], true>;
export function select<const O extends readonly [string, ...string[]]>(
  values: O,
  opts?: OptionalOption,
): FieldDef<O[number], false>;
export function select<const O extends readonly [string, ...string[]]>(
  values: O,
  opts: FieldOptions = {},
): FieldDef<O[number], boolean> {
  return makeField<O[number], boolean>(
    'select',
    opts.required ?? false,
    opts.description,
    () => z.enum(values),
  );
}

/* -------------------------------------------------------------------------- */
/* Composite fields                                                            */
/* -------------------------------------------------------------------------- */

/** A repeated field. `required` additionally enforces a non-empty array. */
export function list<F extends AnyFieldDef>(
  item: F,
  opts: RequiredOption,
): FieldDef<InferValue<F>[], true>;
export function list<F extends AnyFieldDef>(
  item: F,
  opts?: OptionalOption,
): FieldDef<InferValue<F>[], false>;
export function list<F extends AnyFieldDef>(
  item: F,
  opts: FieldOptions = {},
): FieldDef<InferValue<F>[], boolean> {
  const required = opts.required ?? false;
  return makeField<InferValue<F>[], boolean>(
    'list',
    required,
    opts.description,
    () => {
      const arr = z.array(item.toZod());
      return required ? arr.min(1) : arr;
    },
  );
}

/** A nested object of fields. */
export function group<S extends FieldShape>(
  shape: S,
  opts: RequiredOption,
): FieldDef<InferFields<S>, true>;
export function group<S extends FieldShape>(
  shape: S,
  opts?: OptionalOption,
): FieldDef<InferFields<S>, false>;
export function group<S extends FieldShape>(
  shape: S,
  opts: FieldOptions = {},
): FieldDef<InferFields<S>, boolean> {
  return makeField<InferFields<S>, boolean>(
    'group',
    opts.required ?? false,
    opts.description,
    () => shapeToZodObject(shape),
  );
}

/* -------------------------------------------------------------------------- */
/* Shape compilation                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Compile a field shape into a Zod object schema. Optional fields are wrapped
 * with `.optional()` so missing keys validate. Shared by {@link group} and
 * `defineSection`.
 */
export function shapeToZodObject(shape: FieldShape): z.ZodType {
  const entries: Record<string, z.ZodType> = {};
  for (const [key, field] of Object.entries(shape)) {
    const value = field.toZod();
    entries[key] = field.required ? value : value.optional();
  }
  return z.object(entries);
}
