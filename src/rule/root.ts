import { StypSelector } from '../selector';
import { StypProperties } from './properties';
import { stypPropertiesBySpec } from './properties.impl';
import { StypRule } from './rule';
import { StypRule$ } from './rule.impl';

/**
 * @internal
 */
const rootSelector: StypSelector.Normalized = [];

/**
 * Constructs root CSS rule representing global CSS declarations.
 *
 * All other rules are nested within single root.
 *
 * The root CSS rule selector is empty.
 *
 * @category CSS Rule
 * @param properties - Initial CSS rule properties specifier.
 *
 * @returns New root CSS rule.
 */
export function stypRoot(properties?: StypProperties.Spec): StypRule {
  return new StypRule$(undefined, rootSelector, [], properties ? r => stypPropertiesBySpec(r, properties) : undefined);
}
