import { StypProperties, stypRoot, StypRule } from '../rule';
import { StypSelector } from '../selector';

/**
 * Dynamic CSS stylesheet.
 *
 * Represents a hierarchy of CSS rules.
 */
export abstract class StypSheet {

  /**
   * Root CSS rule.
   *
   * This corresponds to the global CSS.
   */
  abstract readonly root: StypRule;

  /**
   * Returns CSS rule with the given `selector`.
   *
   * @param selector Structured CSS selector of the rule.
   *
   * @returns Either matching CSS rule, or empty one.
   */
  abstract rule(selector: StypSelector): StypRule;

  /**
   * Appends the given CSS `properties` to the rule with the given `selector`.
   *
   * @param selector Target rule selector.
   * @param properties CSS properties specifier.
   *
   * @returns Modified CSS rule.
   */
  abstract add(selector: StypSelector, properties: StypProperties.Spec): StypRule;

}

export function stypSheet(rootProperties?: StypProperties.Spec): StypSheet {

  const root = stypRoot(rootProperties);

  class Sheet extends StypSheet {

    get root() {
      return root;
    }

    rule(selector: StypSelector) {
      return root.rule(selector);
    }

    add(selector: StypSelector, properties: StypProperties.Spec) {
      return root.rule(selector).add(properties);
    }

  }

  return new Sheet();
}
