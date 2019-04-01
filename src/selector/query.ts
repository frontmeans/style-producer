import { StypSelector } from './selector';
import { normalizeStypSelectorPart } from './selector.impl';

/**
 * CSS rule query.
 *
 * It may represent a selector like `element-name#id.class1.classN` with any of sub-parts omitted.
 *
 * Queries are used to grab a subset of matching rules from `StypRule`.
 */
export type StypQuery = StypQuery.Element | StypQuery.NonElement;

export namespace StypQuery {

  /**
   * Normalized CSS rule query.
   */
  export type Normalized = StypQuery & StypSelector.NormalizedPart;

  /**
   * Base structure of CSS rule query.
   *
   * All of it sub-parts are optional.
   */
  export interface Base {

    /**
     * Element namespace.
     */
    ns?: string;

    /**
     * Element name.
     */
    e?: string;

    /**
     * Element identifier.
     */
    i?: string;

    /**
     * Element class or classes.
     */
    c?: string | string[];

    /**
     * Qualifier or qualifiers.
     */
    $?: string | string[];

  }

  /**
   * CSS rule query containing element selector.
   */
  export interface Element extends Base {
    e: string;
  }

  /**
   * CSS rule query not containing element selector (and thus not containing namespace selector).
   */
  export interface NonElement extends Base {
    ns?: undefined;
    e?: undefined;
  }

}

/**
 * Normalizes arbitrary CSS rule query.
 *
 * @param query CSS rule query to normalize.
 *
 * @returns Normalized CSS rule query.
 */
export function stypQuery(query: StypQuery): StypQuery.Normalized | undefined {
  return normalizeStypSelectorPart(query);
}

/**
 * Checks whether the given structured CSS `selector` matches the target `query`.
 *
 * @param selector Normalized structured CSS selector.
 * @param query Normalized CSS rule query.
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

function classesMatch(classes: string[] | undefined, query: string[]) {
  return classes && query.every(qClass => classes.indexOf(qClass) >= 0);
}
