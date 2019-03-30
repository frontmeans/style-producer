import { formatStypSelector } from './selector-text.impl';
import { stypSelector, StypSelector } from './selector';

/**
 * Structured CSS selector textual representation options.
 */
export interface StypSelectorTextOpts {

  /**
   * Qualifier formatting function. When present, it is called for each qualifier to build its
   * textual representation. When unspecified, the qualifiers won't be attached to resulting CSS selector text.
   *
   * @param qualifier Qualifier to format.
   *
   * @returns Textual representation of `qualifier`.
   */
  qualify?: (qualifier: string) => string;

}

/**
 * Converts structured CSS selector to its textual representation.
 *
 * @param selector Target CSS selector.
 * @param opts Textual representation options.
 *
 * @returns CSS selector string.
 */
export function stypSelectorText(selector: StypSelector, opts?: StypSelectorTextOpts): string {
  return formatStypSelector(stypSelector(selector), opts);
}
