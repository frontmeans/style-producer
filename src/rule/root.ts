import { StypSelector } from '../selector';
import { StypProperties } from './properties';
import { StypRule } from './rule.impl';
import { stypPropertiesBySpec } from './properties.impl';

const rootSelector: StypSelector.Normalized = [];

/**
 * Constructs root CSS rule representing global CSS declarations.
 *
 * All other rules are nested within single root.
 *
 * The root CSS rule selector is empty.
 *
 * @param properties Initial CSS rule properties specifier.
 *
 * @returns New root CSS rule.
 */
export function stypRoot(properties?: StypProperties.Spec): StypRule {
  return new StypRule(undefined, rootSelector, r => stypPropertiesBySpec(r, properties));
}
