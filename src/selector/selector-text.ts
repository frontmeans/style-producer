/**
 * @packageDocumentation
 * @module style-producer
 */
import { NamespaceAliaser } from '@proc7ts/namespace-aliaser';
import { StypPureSelector } from './pure-selector';
import { StypSelector } from './selector';
import { stypSelector } from './selector-constructor';
import { formatStypSelector } from './selector-text.impl';

/**
 * Structured CSS selector textual format.
 *
 * @category CSS Rule
 */
export interface StypSelectorFormat {

  /**
   * Qualifier formatting function. When present, it is called for each qualifier to build its
   * textual representation. When unspecified, the qualifiers won't be attached to resulting CSS selector text.
   *
   * @param qualifier  Qualifier to format.
   *
   * @returns Textual representation of `qualifier`.
   */
  qualify?: (qualifier: string) => string;

  /**
   * Namespace aliaser to use.
   *
   * New instance will be created if not specified.
   */
  nsAlias?: NamespaceAliaser;

}

/**
 * Converts structured CSS selector to its textual representation.
 *
 * @category CSS Rule
 * @param selector  Target CSS selector.
 * @param format  CSS selector format.
 *
 * @returns CSS selector string.
 */
export function stypSelectorText(selector: StypSelector | StypPureSelector, format?: StypSelectorFormat): string {
  return formatStypSelector(stypSelector(selector), format);
}
