import { formatStypSelector } from './selector-text.impl';
import { StypSelector } from './selector';
import { stypSelector } from './selector-constructor';
import { NamespaceRegistrar } from '../ns';

/**
 * Structured CSS selector textual format.
 */
export interface StypSelectorFormat {

  /**
   * Qualifier formatting function. When present, it is called for each qualifier to build its
   * textual representation. When unspecified, the qualifiers won't be attached to resulting CSS selector text.
   *
   * @param qualifier Qualifier to format.
   *
   * @returns Textual representation of `qualifier`.
   */
  qualify?: (qualifier: string) => string;

  /**
   * Namespace registrar to use.
   *
   * New instance will be created if not specified.
   */
  nsAlias?: NamespaceRegistrar;

}

/**
 * Converts structured CSS selector to its textual representation.
 *
 * @param selector Target CSS selector.
 * @param format CSS selector format.
 *
 * @returns CSS selector string.
 */
export function stypSelectorText(selector: StypSelector, format?: StypSelectorFormat): string {
  return formatStypSelector(stypSelector(selector), format);
}
