import { formatSelector } from './selector-text.impl';
import { stypSelector, StypSelector } from './selector';

/**
 * Converts structured CSS selector to its textual representation.
 *
 * @param selector Target CSS selector.
 *
 * @returns CSS selector string.
 */
export function stypSelectorText(selector: StypSelector): string {
  return formatSelector(stypSelector(selector), formatRawAsIs);
}

function formatRawAsIs(s: string) {
  return s;
}
