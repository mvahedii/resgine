import type { z } from 'zod';
import {
  shapeToZodObject,
  type FieldShape,
  type InferFields,
} from './fields.js';

/**
 * `defineSection` — the schema-driven, extensible section API.
 *
 * Anyone (users or theme authors) can declare a new section type with this
 * function; the engine never needs to be modified to support it. The returned
 * definition carries both a runtime Zod schema and an inferred TypeScript type.
 */

export interface SectionDefinitionInput<S extends FieldShape> {
  type: string;
  title?: string;
  fields: S;
}

export interface SectionDefinition<
  TData = unknown,
  TType extends string = string,
> {
  readonly type: TType;
  readonly title?: string;
  readonly dataSchema: z.ZodType;
  /** Phantom marker — never present at runtime — carrying the data type. */
  readonly __data?: TData;
}

/** Extract the inferred data type from a {@link SectionDefinition}. */
export type InferSectionData<D> =
  D extends SectionDefinition<infer T, string> ? T : never;

export function defineSection<S extends FieldShape>(input: {
  type: string;
  title?: string;
  fields: S;
}): SectionDefinition<InferFields<S>, string> {
  return {
    type: input.type,
    title: input.title,
    dataSchema: shapeToZodObject(input.fields),
  };
}
