/**
 * @packageDocumentation
 * @module @proc7ts/style-producer
 */
import { StypPureSelector } from './pure-selector';

/**
 * Structured CSS selector.
 *
 * This can be one of:
 * - raw CSS selector text,
 * - CSS selector part, or
 * - an array consisting of strings, parts, and their combinators.
 *
 * A normalized structured CSS selector can be constructed using [[stypSelector]] function.
 *
 * @category CSS Rule
 */
export type StypSelector =
    | string
    | StypSelector.Part
    | readonly (string | StypSelector.Part | StypSelector.Combinator)[];

export namespace StypSelector {

  /**
   * Normalized structured CSS selector.
   *
   * This is an array of normalized selector parts and combinators between them. Combinators do not follow each other.
   * The last item is never a combinator.
   *
   * Normalized selector never contains empty parts.
   */
  export type Normalized = readonly (NormalizedPart | Combinator)[];

  /**
   * Mutable normalized structured CSS selector.
   */
  export type Mutable = (NormalizedPart | Combinator)[];

  /**
   * CSS selector combinator. One of `'>'`, `'+'`, or `'~'`. A space combinator is represented by combinator absence.
   */
  export type Combinator = '>' | '+' | '~';

  /**
   * A part of structured CSS selector.
   *
   * It may represent a selector like `element-name#id.class1.classN[attr1][attr2]:pseudo-class::pseudo-element` with
   * any of sub-parts omitted. Attributes, pseudo-classes, and pseudo-elements are represented as sub-selectors.
   * A raw CSS selector can also be represented by this structure, but is never parsed.
   *
   * All of the properties are optional.
   */
  export interface Part extends StypPureSelector.Part {

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
    readonly $?: string | readonly string[];

  }

  /**
   * Normalized part of structured CSS selector.
   *
   * Normalized part:
   * - does not contain empty properties,
   * - does not contain unnecessary `*` element,
   * - does not contain empty class names,
   * - does not contain empty class names array,
   * - class names are sorted,
   * - does not contain empty sub-selectors array,
   * - sub-selectors are normalized.
   * - does not contain empty qualifiers,
   * - does not contain empty qualifiers array,
   * - qualifiers are exposed, e.g. `foo:bar=baz` is exposed as three qualifiers: `foo`, `foo:bar`, and `foo:bar=baz`
   * - qualifiers are sorted.
   *
   * The `stypSelector()` function always returns an array containing normalized parts.
   */
  export interface NormalizedPart extends StypPureSelector.NormalizedPart {

    /**
     * Array of qualifiers. Either absent, or non-empty and containing non-empty qualifiers sorted alphabetically.
     */
    readonly $?: readonly [string, ...string[]];

  }

}
