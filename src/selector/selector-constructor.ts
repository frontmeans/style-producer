import { StypSelector } from './index';
import { isCombinator, normalizeStypSelectorPart } from './selector.impl';

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
  if (!Array.isArray(selector)) {

    const key = normalizeKey(selector);

    return key ? [key] : [];
  }

  const normalized: StypSelector.Normalized = [];
  let combinator: StypSelector.Combinator | undefined;

  for (const item of selector) {
    if (isCombinator(item)) {
      combinator = combinator || item;
      continue;
    }

    const normalizedPart = normalizeKey(item);

    if (!normalizedPart) {
      continue;
    }
    if (combinator) {
      normalized.push(combinator);
      combinator = undefined;
    }

    normalized.push(normalizedPart);
  }

  return normalized;
}

function normalizeKey(key: StypSelector.Part | string): StypSelector.NormalizedPart | undefined {
  if (typeof key === 'string') {
    if (!key) {
      return;
    }
    return { s: key };
  }
  return normalizeStypSelectorPart(key);
}
