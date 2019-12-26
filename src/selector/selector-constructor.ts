import { StypSelector } from './index';
import { StypPureSelector } from './pure-selector';
import { normalizeStypSelector } from './selector.impl';

/**
 * Converts normalized pure CSS selector part to normalized pure CSS selector.
 *
 * @category CSS Rule
 * @param selector  Normalized pure CSS selector part.
 *
 * @returns Normalized pure CSS selector. An array containing `selector` as its only item.
 */
export function stypSelector(selector: StypPureSelector.NormalizedPart): [StypPureSelector.NormalizedPart];

/**
 * Converts normalized structured CSS selector part to normalized structured CSS selector.
 *
 * @category CSS Rule
 * @param selector  Normalized CSS selector part.
 *
 * @returns Normalized structured CSS selector. An array containing `selector` as its only item.
 */
export function stypSelector(selector: StypSelector.NormalizedPart): [StypSelector.NormalizedPart];

/**
 * Normalizes arbitrary pure CSS selector.
 *
 * @param selector  CSS selector to normalize.
 *
 * @returns Normalized pure CSS selector.
 */
export function stypSelector(selector: StypPureSelector): StypPureSelector.Normalized;

/**
 * Normalizes arbitrary structured CSS selector.
 *
 * @param selector  CSS selector to normalize.
 *
 * @returns Normalized structured CSS selector.
 */
export function stypSelector(selector: StypSelector): StypSelector.Normalized;

export function stypSelector(selector: StypSelector): StypSelector.Normalized {
  return normalizeStypSelector(selector);
}
