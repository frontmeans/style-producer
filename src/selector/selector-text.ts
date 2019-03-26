import { formatStypSelector } from './selector-text.impl';
import { stypSelector, StypSelector } from './selector';
import { asis } from 'call-thru';

/**
 * Converts structured CSS selector to its textual representation.
 *
 * @param selector Target CSS selector.
 *
 * @returns CSS selector string.
 */
export function stypSelectorText(selector: StypSelector): string {
  return formatStypSelector(stypSelector(selector), asis);
}
