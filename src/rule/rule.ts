/**
 * @packageDocumentation
 * @module @frontmeans/style-producer
 */
import { AfterEvent, AfterEvent__symbol, EventKeeper, OnEvent, OnEvent__symbol } from '@proc7ts/fun-events';
import { StypQuery, StypRuleKey, StypSelector } from '../selector';
import { StypProperties } from './properties';
import { StypRules } from './rules';

/**
 * CSS rule.
 *
 * Represents CSS selector and corresponding CSS properties.
 *
 * @category CSS Rule
 */
export abstract class StypRule implements EventKeeper<[StypProperties]> {

  /**
   * A reference to the root CSS rule.
   */
  abstract readonly root: StypRule;

  /**
   * A reference to outer CSS rule.
   *
   * The outer rule is the one for enclosing element.
   * I.e. for the rule with selector is `a b+c` the parent one is `a b`, while the outer one is `a`.
   *
   * This is `null` for the root rule and may be `null` for the rule removed from hierarchy.
   */
  abstract readonly outer: StypRule | null;

  /**
   * CSS selector of this rule.
   */
  abstract readonly selector: StypSelector.Normalized;

  /**
   * A key of this rule in the enclosing one.
   */
  abstract readonly key: StypRuleKey;

  /**
   * Whether this rule's properties are empty.
   *
   * This is `true` when the rule properties are constant and empty.
   *
   * Empty CSS rules returned from `rule()` method when there is no matching rule found.
   */
  abstract readonly empty: boolean;

  /**
   * Dynamic list of all CSS rules in hierarchy starting from this one.
   */
  abstract readonly rules: StypRuleHierarchy;

  /**
   * An `AfterEvent` keeper of CSS properties of this rule.
   *
   * The `[AfterEvent__symbol]` property is an alias of this one.
   */
  abstract readonly read: AfterEvent<[StypProperties]>;

  [AfterEvent__symbol](): AfterEvent<[StypProperties]> {
    return this.read;
  }

  /**
   * Sets CSS properties of this rule.
   *
   * @param properties - CSS properties specifier. Or nothing to clear them.
   *
   * @returns `this` rule instance.
   */
  abstract set(properties?: StypProperties.Spec): this;

  /**
   * Appends CSS properties to this rule.
   *
   * @param properties - CSS properties specifier.
   *
   * @returns `this` rule instance.
   */
  add(properties: StypProperties.Spec): this {
    return this.rules.add([], properties) as this;
  }

  /**
   * Clears CSS properties of this rule.
   *
   * Calling this method is the same as calling `set()` without properties.
   *
   * @returns `this` rule instance.
   */
  clear(): this {
    return this.set();
  }

  /**
   * Removes this rule from hierarchy along with all nested rules.
   *
   * @param reason - Optional removal reason.
   *
   * @returns `this` (just removed) rule instance.
   */
  abstract remove(reason?: any): this;

}

/**
 * Dynamically updated list of CSS rules.
 *
 * This is an iterable of rules, an EventSender` of their updates, and an `EventKeeper` of itself.
 *
 * @category CSS Rule
 */
export abstract class StypRuleList implements StypRules, EventKeeper<[StypRuleList]> {

  /**
   * An `AfterEvent` keeper of rule list.
   *
   * The `[AfterEvent__symbol]` property is an alias of this one.
   */
  abstract readonly read: AfterEvent<[StypRuleList]>;

  /**
   * An `OnEvent` sender of this rule list updates.
   *
   * The list updates receiver accepts two arguments:
   * - An array of added rules
   * - An array of removed rules.
   *
   * The `[OnEvent__symbol]` property is an alias of this one.
   *
   * @returns `OnEvent` sender of rule list updates.
   */
  abstract readonly onUpdate: OnEvent<[StypRule[], StypRule[]]>;

  [AfterEvent__symbol](): AfterEvent<[StypRuleList]> {
    return this.read;
  }

  [OnEvent__symbol](): OnEvent<[StypRule[], StypRule[]]> {
    return this.onUpdate;
  }

  abstract [Symbol.iterator](): IterableIterator<StypRule>;

  /**
   * Grabs rules from this list matching the given `query`.
   *
   * @param query - CSS rule query to match.
   *
   * @returns Dynamic list of rules in this list matching the given query.
   */
  abstract grab(query: StypQuery): StypRuleList;

}

/**
 * Dynamic list of all CSS rules in hierarchy starting from its root.
 *
 * @category CSS Rule
 */
export abstract class StypRuleHierarchy extends StypRuleList {

  /**
   * Dynamic list containing only root CSS rule.
   *
   * This list never changes actually.
   */
  abstract readonly self: StypRuleList;

  /**
   * Dynamic list of all CSS rules directly nested within the root one.
   */
  abstract readonly nested: StypRuleList;

  /**
   * Appends CSS properties to nested rule.
   *
   * Creates target rule if necessary.
   *
   * @param selector - Target rule selector.
   * @param properties - Optional CSS properties specifier.
   *
   * @returns Modified CSS rule.
   */
  abstract add(selector: StypSelector, properties?: StypProperties.Spec): StypRule;

  /**
   * Returns nested CSS rule matching the given `selector`.
   *
   * @param selector - Target rule selector.
   *
   * @returns Either matching CSS rule, or `undefined` if not found.
   */
  abstract get(selector: StypSelector): StypRule | undefined;

  /**
   * Watches for CSS rule properties.
   *
   * The properties are empty when the watched rule does not exist.
   *
   * @param selector - CSS selector of watched rule.
   *
   * @returns An `AfterEvent` registrar of CSS properties receiver.
   */
  abstract watch(selector: StypSelector): AfterEvent<[StypProperties]>;

}
