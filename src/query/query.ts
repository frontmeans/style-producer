import { DoqryPicker, doqryPickerPart } from '@frontmeans/doqry';
import { NamespaceDef, QualifiedName } from '@frontmeans/namespace-aliaser';

/**
 * CSS rule query.
 *
 * It may represent a selector like `element-name#id.class1.classN` with any of sub-parts omitted.
 *
 * Queries are used to grab a subset of matching rules from `StypRule`.
 *
 * All of its properties are optional.
 *
 * @category CSS Rule
 */
export interface StypQuery {

  /**
   * Element namespace.
   */
  readonly ns?: string | NamespaceDef;

  /**
   * Element name.
   *
   * This is the same as `*` when absent.
   */
  readonly e?: QualifiedName;

  /**
   * Element identifier.
   */
  readonly i?: QualifiedName;

  /**
   * Element class name or names.
   */
  readonly c?: QualifiedName | readonly QualifiedName[];

  /**
   * Qualifier or qualifiers.
   */
  readonly $?: string | readonly string[];

}

/**
 * @category CSS Rule
 */
export namespace StypQuery {

  /**
   * Normalized CSS rule query.
   */
  export type Normalized = DoqryPicker.Part;

}

const StypQuery__symbol = (/*#__PURE__*/ Symbol('StypQuery'));

interface StypQuery$Normalizable extends StypQuery {

  [StypQuery__symbol]?: StypQuery & DoqryPicker.Part;

}

class StypQuery$Normalized implements StypQuery.Normalized {

  [StypQuery__symbol]: StypQuery.Normalized;

  constructor(query: StypQuery.Normalized) {
    this[StypQuery__symbol] = query;
  }

  get ns(): string | NamespaceDef | undefined {
    return this[StypQuery__symbol].ns;
  }

  get e(): QualifiedName | undefined {
    return this[StypQuery__symbol].e;
  }

  get i(): QualifiedName | undefined {
    return this[StypQuery__symbol].i;
  }

  get c(): readonly [QualifiedName, ...QualifiedName[]] | undefined {
    return this[StypQuery__symbol].c;
  }

  get $(): readonly [string, ...string[]] | undefined {
    return this[StypQuery__symbol].$;
  }

}

/**
 * Normalizes arbitrary CSS rule query.
 *
 * @category CSS Rule
 * @param query - CSS rule query to normalize.
 *
 * @returns Normalized CSS rule query, or the `query` itself if normalized already.
 */
export function stypQuery(query: StypQuery): StypQuery.Normalized;

export function stypQuery(query: StypQuery$Normalizable): StypQuery.Normalized {
  if (query[StypQuery__symbol]) {
    return query as StypQuery.Normalized;
  }
  return new StypQuery$Normalized(doqryPickerPart(query));
}
