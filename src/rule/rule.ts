import { AfterEvent, AfterEvent__symbol, EventKeeper, EventSender, OnEvent, OnEvent__symbol } from 'fun-events';
import { StypQuery, StypRuleKey, StypSelector } from '../selector';
import { StypProperties } from './properties';

/**
 * CSS rule.
 *
 * Represents CSS selector and corresponding CSS properties.
 */
export abstract class StypRule implements EventKeeper<[StypProperties]> {

  /**
   * A reference to root CSS rule.
   */
  abstract readonly root: StypRule;

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
   * `AfterEvent` CSS properties receiver registrar.
   */
  abstract readonly read: AfterEvent<[StypProperties]>;

  get [AfterEvent__symbol](): AfterEvent<[StypProperties]> {
    return this.read;
  }

  /**
   * Dynamic list of all CSS rules in hierarchy starting from this one.
   */
  abstract readonly rules: StypRuleHierarchy;

  /**
   * Sets CSS properties of this rule.
   *
   * @param properties CSS properties specifier. Or nothing to clear them.
   *
   * @returns `this` rule instance.
   */
  abstract set(properties?: StypProperties.Spec): this;

  /**
   * Appends CSS properties to this rule.
   *
   * @param properties CSS properties specifier.
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
   * @param reason Optional removal reason.
   *
   * @returns `this` (just removed) rule instance.
   */
  abstract remove(reason?: any): this;

}

/**
 * Dynamically updated CSS rules interface.
 *
 * This is an iterable of rules, and an `EventSender` of their updates.
 */
export type StypRules = Iterable<StypRule> & EventSender<[StypRule[], StypRule[]]>;

/**
 * Dynamically updated list of CSS rules.
 *
 * This is an iterable of rules, an `EventSender` of their updates, and an `EventKeeper` of itself.
 */
export abstract class StypRuleList implements StypRules, EventKeeper<[StypRuleList]> {

  /**
   * An `AfterEvent` registrar of rule list receiver.
   *
   * An `[AfterEvent__symbol]` property is just an alias of this one.
   */
  abstract readonly read: AfterEvent<[StypRuleList]>;

  get [AfterEvent__symbol](): AfterEvent<[StypRuleList]> {
    return this.read;
  }

  /**
   * An `OnEvent` registrar of list updates receiver.
   *
   * The list updates receiver accepts two arguments:
   * - An array of added rules
   * - An array of removed rules.
   *
   * An `[OnEvent__symbol]` property is just an alias of this one.
   */
  abstract readonly onUpdate: OnEvent<[StypRule[], StypRule[]]>;

  get [OnEvent__symbol](): OnEvent<[StypRule[], StypRule[]]> {
    return this.onUpdate;
  }

  abstract [Symbol.iterator](): IterableIterator<StypRule>;

  /**
   * Grabs rules from this list matching the given `query`.
   *
   * @param query CSS rule query to match.
   *
   * @returns Dynamic list of rules in this list matching the given query.
   */
  abstract grab(query: StypQuery): StypRuleList;

}

/**
 * Dynamic list of all CSS rules in hierarchy starting from its root.
 */
export abstract class StypRuleHierarchy extends StypRuleList {

  /**
   * Dynamic list of all CSS rules directly nested within the root one.
   */
  abstract readonly nested: StypRuleList;

  /**
   * Appends CSS properties to nested rule.
   *
   * Creates target rule if necessary.
   *
   * @param selector Target rule selector.
   * @param properties Optional CSS properties specifier.
   *
   * @returns Modified CSS rule.
   */
  abstract add(selector: StypSelector, properties?: StypProperties.Spec): StypRule;

  /**
   * Returns nested CSS rule matching the given `selector`.
   *
   * @param selector Target rule selector.
   *
   * @returns Either matching CSS rule, or `undefined` if not found.
   */
  abstract get(selector: StypSelector): StypRule | undefined;

}
