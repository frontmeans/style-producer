/**
 * Structured CSS selector.
 *
 * This can be one of:
 * - raw CSS selector text,
 * - CSS selector part, or
 * - an array consisting of strings, parts, and their combinators.
 *
 * A normalized structured CSS selector can be constructed using `stypSelector()` function.
 */
export type StypSelector = string | StypSelector.Part | (string | StypSelector.Part | StypSelector.Combinator)[];

export namespace StypSelector {

  /**
   * Normalized structured CSS selector.
   *
   * This is an array of normalized selector parts and combinators between them. Combinators do not follow each other.
   * The last item is never a combinator.
   *
   * Normalized selector never contains empty parts.
   */
  export type Normalized = (NormalizedPart | Combinator)[];

  /**
   * CSS selector combinator. One of `'>'`, `'+'`, or `'~'`. A space combinator is represented by combinator absence.
   */
  export type Combinator = '>' | '+' | '~';

  /**
   * A part of structured CSS selector.
   *
   * It may represent a selector like `element-name#id.class1.classN[attr1][attr2]:pseudo-class::pseudo-element` with
   * any of sub-parts omitted. Attributes, pseudo-classes, and pseudo-elements are represented as raw CSS text and never
   * interpreted by this library. A raw CSS selector can also be represented by this structure.
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
     * Raw CSS selector text to append to the end.
     *
     * This may contain attribute selectors, pseudo-classes, and pseudo-elements.
     *
     * When all other properties are omitted this one represents a raw CSS selector text.
     */
    s?: string;

    /**
     * Qualifier or qualifiers.
     *
     * Qualifiers are typically not rendered as CSS selector text, but rather used to distinguish between style rules.
     *
     * Qualifier may have a `name=value` form. The `name` part may be qualified by selecting name parts with colons.
     * The `StypRule` would be able to grab rules either by full qualifier, or the ones with partially matched
     * qualifier names.
     *
     * Example: `foo:bar:baz=some value` matches `foo:bar:baz=some value`, `foo:bar:baz`, `foo:bar`, and `foo`.
     */
    $?: string | string[];

  }

  /**
   * CSS selector part containing element selector.
   */
  export interface Element extends PartBase {
    e: string;
  }

  /**
   * CSS selector part not containing element selector (and thus not containing namespace selector).
   */
  export interface NonElement extends PartBase {
    ns?: undefined;
    e?: undefined;
  }

  /**
   * Normalized part of structured CSS selector.
   *
   * Normalized part:
   * - is not empty, i.e. has at least one property,
   * - does not contain empty sub-parts,
   * - does not contain empty class names,
   * - does not contain empty class array,
   * - class names are sorted,
   * - does not contain empty qualifiers,
   * - does not contain empty qualifiers array,
   * - qualifiers are exposed, e.g. `foo:bar=baz` is exposed as three qualifiers: `foo`, `foo:bar`, and `foo:bar=baz`
   * - qualifiers are sorted.
   *
   * The `stypSelector()` function always returns an array of normalized parts.
   */
  export type NormalizedPart = NormalizedElement | NormalizedNonElement;

  /**
   * Normalized CSS selector part containing element selector.
   */
  export interface NormalizedElement extends Element {

    /**
     * Array of classes. Either absent, or non-empty and containing non-empty class names sorted alphabetically.
     */
    c?: [string, ...string[]];

    /**
     * Array of qualifiers. Either absent, or non-empty and containing non-empty qualifiers sorted alphabetically.
     */
    $?: [string, ...string[]];

  }

  /**
   * Normalized CSS selector part not containing element selector (and thus not containing namespace selector).
   */
  export interface NormalizedNonElement extends NonElement {

    /**
     * Array of classes. Either absent, or non-empty and containing non-empty class names sorted alphabetically.
     */
    c?: [string, ...string[]];

    /**
     * Array of qualifiers. Either absent, or non-empty and containing non-empty qualifiers sorted alphabetically.
     */
    $?: [string, ...string[]];

  }

  /**
   * Raw CSS selector text representation.
   *
   * It contains only `s` property and optionally qualifiers.
   */
  export interface Raw extends NormalizedNonElement {
    i?: undefined;
    c?: undefined;
    s: string;
  }

}
