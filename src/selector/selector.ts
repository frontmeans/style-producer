import { filterIt, mapIt, overArray } from 'a-iterable';
import { isCombinator } from './selector.impl';
import { isPresent } from 'call-thru';

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
   * This is an array of normalized selector parts and combinators between them. When combinator is omitted a space is
   * used.
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
   * It may represents a selectors like `element-name#id.class1.classN[attr1][attr2]:pseudo-class::pseudo-element` with
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
     * Qualifiers are typically not rendered as CSS selector text, but rather used to distinguish between style
     * declarations.
     *
     * Qualifier may have a `name=value` form.
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
   * - does not contain empty class names
   * - does not contain empty class array,
   * - class names are sorted.
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
    c?: string[];

    /**
     * Array of qualifiers. Either absent, or non-empty and containing non-empty qualifiers sorted alphabetically.
     */
    $?: string[];

  }

  /**
   * Normalized CSS selector part not containing element selector (and thus not containing namespace selector).
   */
  export interface NormalizedNonElement extends NonElement {

    /**
     * Array of classes. Either absent, or non-empty and containing non-empty class names sorted alphabetically.
     */
    c?: string[];

    /**
     * Array of qualifiers. Either absent, or non-empty and containing non-empty qualifiers sorted alphabetically.
     */
    $?: string[];

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

/**
 * Converts raw CSS selector text to its normalized structured representation.
 *
 * @param selector Raw CSS selector text.
 *
 * @returns Normalized structured CSS selector. An array containing only a raw CSS selector part.
 */
export function stypSelector(selector: string): [StypSelector.Raw];

/**
 * Converts normalized CSS selector part to normalized CSS selector.
 *
 * @param selector Normalized CSS selector part.
 *
 * @returns Normalized structured CSS selector. An array containing `selector` as its only item.
 */
export function stypSelector(selector: StypSelector.NormalizedPart): [typeof selector];

/**
 * Converts element CSS selector to normalized form.
 *
 * @param selector Element CSS selector.
 *
 * @returns Normalized structured CSS selector. An array containing only normalized element selector.
 */
export function stypSelector(selector: StypSelector.Element): [StypSelector.NormalizedElement];

/**
 * Converts non-element CSS selector to normalized form.
 *
 * @param selector Non-element CSS selector.
 *
 * @returns Normalized structured CSS selector. An array containing only normalized non-element selector.
 */
export function stypSelector(selector: StypSelector.NonElement): [StypSelector.NormalizedNonElement];

/**
 * Normalizes arbitrary structured CSS selector.
 *
 * @param selector CSS selector to normalize.
 *
 * @returns Normalized structured CSS selector.
 */
export function stypSelector(selector: StypSelector): StypSelector.Normalized;

export function stypSelector(selector: StypSelector): StypSelector.Normalized {
  if (Array.isArray(selector)) {
    return [
      ...filterIt<
          StypSelector.NormalizedPart | StypSelector.Combinator | undefined,
          StypSelector.NormalizedPart | StypSelector.Combinator>(
          mapIt(
              overArray(selector),
              normalizeItem),
          isPresent),
    ];
  } else {

    const key = normalizeKey(selector);

    return key ? [key] : [];
  }
}

function normalizeItem(item: string | StypSelector.Part | StypSelector.Combinator):
    StypSelector.NormalizedPart | StypSelector.Combinator | undefined {
  if (isCombinator(item)) {
    return item;
  }
  return normalizeKey(item);
}

function normalizeKey(key: StypSelector.Part | string): StypSelector.NormalizedPart | undefined {
  if (typeof key === 'string') {
    if (!key) {
      return;
    }
    return { s: key };
  }
  return normalizePart(key);
}

function normalizePart(part: StypSelector.Part): StypSelector.NormalizedPart | undefined {

  const ns = part.ns || undefined;
  const e = part.e || undefined;
  const i = part.i || undefined;
  const s = part.s || undefined;
  const c = normalizeClasses(part.c);
  const $ = normalizeClasses(part.$);

  if (!e && !i && !s && !c && !$) {
    return;
  }

  return { ns, e, i, s, c, $ } as StypSelector.NormalizedPart;
}

function normalizeClasses(classes: string | string[] | undefined): string[] | undefined {
  if (!classes) {
    return;
  }
  if (!Array.isArray(classes)) {
    return [classes];
  }

  classes = classes.filter(c => !!c);

  return classes.length ? classes.sort() : undefined;
}
