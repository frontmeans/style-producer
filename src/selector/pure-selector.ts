/**
 * @module style-producer
 */
import { NamespaceDef, QualifiedName } from 'namespace-aliaser';
import { StypSelector } from './selector';
import { StypSubSelector } from './sub-selector';

/**
 * Pure CSS selector.
 *
 * This can be one of:
 * - raw CSS selector text,
 * - CSS selector part, or
 * - an array consisting of strings, parts, and their combinators.
 *
 * A normalized pure CSS selector can be constructed using [[stypSelector]] function.
 *
 * This is the base of {@link StypSelector structured CSS selector}. In contrast to the latter it does not support
 * qualifiers.
 *
 * @category CSS Rule
 */
export type StypPureSelector =
    | string
    | StypPureSelector.Part
    | readonly (string | StypPureSelector.Part | StypSelector.Combinator)[];

export namespace StypPureSelector {

  /**
   * Normalized pure CSS selector.
   *
   * This is an array of normalized selector parts and combinators between them. Combinators do not follow each other.
   * The last item is never a combinator.
   *
   * Normalized selector never contains empty parts.
   */
  export type Normalized = readonly (NormalizedPart | StypSelector.Combinator)[];

  /**
   * A part of pure CSS selector.
   *
   * It may represent a selector like `element-name#id.class1.classN[attr1][attr2]:pseudo-class::pseudo-element` with
   * any of sub-parts omitted. Attributes, pseudo-classes, and pseudo-elements are represented as sub-selectors.
   * A raw CSS selector can also be represented by this structure, but is never parsed.
   *
   * All of the properties are optional.
   *
   * This is the base of {@link StypSelector.Part structured CSS selector part}. In contrast to the latter it does not
   * support qualifiers.
   */
  export interface Part {

    /**
     * Element namespace.
     */
    readonly ns?: string | NamespaceDef;

    /**
     * Element name.
     *
     * This is the same as `*` when absent. Unless the part contains only sub-selectors, and the first one is either
     * pseudo-class or pseudo-element.
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
     * Sub-selector(s) representing either attribute selector, pseudo-class, or pseudo-element.
     */
    readonly u?: StypSubSelector | readonly StypSubSelector[];

    /**
     * Raw CSS selector text to append to the end.
     *
     * When all other properties are omitted this one represents a raw CSS selector text. Otherwise it is appended
     * to other selector parts representation.
     */
    readonly s?: string;

  }

  /**
   * Normalized part of pure CSS selector.
   *
   * Normalized part:
   * - does not contain empty properties,
   * - does not contain unnecessary `*` element,
   * - does not contain empty class names,
   * - does not contain empty class names array,
   * - class names are sorted,
   * - does not contain empty sub-selectors array,
   * - sub-selectors are normalized.
   *
   * The `stypSelector()` function always returns an array containing normalized parts.
   *
   * This is the base of {@link StypSelector.NormalizedPart normalized part of structured CSS selector}. In contrast to
   * the latter it does not support qualifiers.
   */
  export interface NormalizedPart extends Part {

    /**
     * Array of element class names. Either absent, or non-empty and containing non-empty class names sorted
     * alphabetically.
     */
    readonly c?: readonly [QualifiedName, ...QualifiedName[]];

    /**
     * Array of normalized sub-selectors, each of which represents either attribute selector, pseudo-class,
     * or pseudo-element.
     *
     * Either absent or non-empty.
     */
    readonly u?: readonly [StypSubSelector.Normalized, ...StypSubSelector.Normalized[]];

  }

}
