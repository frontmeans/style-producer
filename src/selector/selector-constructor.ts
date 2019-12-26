import { isReadonlyArray } from '../internal';
import { StypSelector } from './index';
import { StypPureSelector } from './pure-selector';
import { isCombinator, normalizeStypSelectorPart } from './selector.impl';

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
  if (!isReadonlyArray(selector)) {
    return [normalizeKey(selector)];
  }

  const normalized: StypSelector.Mutable = [];
  let combinator: StypSelector.Combinator | undefined;

  for (const item of selector) {

    const prevCombinator = combinator;

    if (combinator) {
      normalized.push(combinator);
      combinator = undefined;
    }

    let part: StypSelector.NormalizedPart;

    if (isCombinator(item)) {
      combinator = item;
      if (!prevCombinator) {
        continue;
      }
      part = {};
    } else {
      part = normalizeKey(item);
    }

    normalized.push(part);
  }
  if (combinator) {
    normalized.push(combinator, {});
  }

  return normalized;
}

function normalizeKey(key: StypSelector.Part | string): StypSelector.NormalizedPart {
  if (typeof key === 'string') {
    if (!key) {
      return {};
    }
    return { s: key };
  }
  return normalizeStypSelectorPart(key);
}
