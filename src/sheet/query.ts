import { StypSelector } from '../selector';

/**
 * CSS rule query.
 *
 * This can be one of:
 * - CSS rule query part, or
 * - an array consisting of parts and their combinators.
 *
 * Queries are used to grab a subset of matching rules from `StypSheet`.
 */
export type StypQuery = StypQuery.Part | (StypQuery.Part | StypSelector.Combinator)[];

export namespace StypQuery {

  /**
   * A part of structured CSS rule query.
   *
   * It may represent a selector like `element-name#id.class1.classN` with any of sub-parts omitted.
   */
  export type Part = Element | NonElement;

  /**
   * Base structure of the part of structured CSS selector.
   *
   * All of it sub-parts are optional.
   */
  export interface PartBase {

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
     *
     * Qualifiers are typically not rendered as CSS selector text, but rather used to distinguish between style rules.
     *
     * Qualifier may have a `name=value` form. The `name` part may be qualified by selecting name parts with colons.
     * The `StypSheet` would be able to grab rules either by full qualifier, or the ones with partially matched
     * qualifier names.
     *
     * Example: `foo:bar:baz=some value` matches `foo:bar:baz=some value`, `foo:bar:baz`, `foo:bar`, and `foo`.
     */
    $?: string | string[];

  }

  /**
   * CSS rule query part containing element selector.
   */
  export interface Element extends PartBase {
    e: string;
  }

  /**
   * CSS rule query part not containing element selector (and thus not containing namespace selector).
   */
  export interface NonElement extends PartBase {
    ns?: undefined;
    e?: undefined;
  }

}
