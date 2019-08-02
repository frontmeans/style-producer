/**
 * @module style-producer
 */
import { NameInNamespace, namesEqual, NamespaceDef } from 'namespace-aliaser';
import { StypSelector } from './selector';
import { normalizeStypSelectorPart } from './selector.impl';

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
  readonly e?: NameInNamespace;

  /**
   * Element identifier.
   */
  readonly i?: NameInNamespace;

  /**
   * Element class name or names.
   */
  readonly c?: NameInNamespace | readonly NameInNamespace[];

  /**
   * Qualifier or qualifiers.
   */
  readonly $?: string | readonly string[];

}

export namespace StypQuery {

  /**
   * Normalized CSS rule query.
   */
  export type Normalized = StypQuery & StypSelector.NormalizedPart;

}

/**
 * Normalizes arbitrary CSS rule query.
 *
 * @category CSS Rule
 * @param query  CSS rule query to normalize.
 *
 * @returns Normalized CSS rule query.
 */
export function stypQuery(query: StypQuery): StypQuery.Normalized {
  return normalizeStypSelectorPart(query);
}

/**
 * Checks whether the given structured CSS `selector` matches the target `query`.
 *
 * @category CSS Rule
 * @param selector  Normalized structured CSS selector.
 * @param query  Normalized CSS rule query.
 *
 * @returns `true` if `selector` matches the `query`, or `false` otherwise.
 */
export function stypSelectorMatches(selector: StypSelector.Normalized, query: StypQuery.Normalized): boolean {
  if (!selector.length) {
    return false;
  }

  const part = selector[selector.length - 1] as StypSelector.NormalizedPart;

  if (query.ns && part.ns !== query.ns) {
    return false;
  }
  if (query.e && part.e !== query.e) {
    return false;
  }
  if (query.i && part.i !== query.i) {
    return false;
  }
  if (query.c && !classesMatch(part.c, query.c)) {
    return false;
  }
  // noinspection RedundantIfStatementJS
  if (query.$ && !classesMatch(part.$, query.$)) {
    return false;
  }

  return true;
}

function classesMatch(classes: readonly NameInNamespace[] | undefined, query: readonly NameInNamespace[]) {
  return classes && query.every(qClass => classes.find(mClass => namesEqual(qClass, mClass)));
}
