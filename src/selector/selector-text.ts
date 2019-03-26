import { formatStypSelector } from './selector-text.impl';
import { stypSelector, StypSelector } from './selector';

/**
 * Converts structured CSS selector to its textual representation.
 *
 * @param selector Target CSS selector.
 * @param formatQualifier Qualifier formatting function. When present, it is called for each qualifier to build its
 * textual representation. When unspecified, the qualifiers won't be attached to resulting CSS selector text.
 *
 * @returns CSS selector string.
 */
export function stypSelectorText(selector: StypSelector, formatQualifier?: (s: string) => string): string {
  return formatStypSelector(stypSelector(selector), formatQualifier);
}
