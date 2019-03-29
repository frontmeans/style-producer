import { AfterEvent, AfterEvent__symbol, EventKeeper } from 'fun-events';
import { StypSelector } from '../selector';
import { StypProperties } from './properties';
import { overNone } from 'a-iterable';

/**
 * CSS rule.
 *
 * Represents CSS selector and corresponding CSS properties.
 */
export abstract class StypRule implements EventKeeper<[StypProperties]> {

  /**
   * @internal
   */
  private _read?: AfterEvent<[StypProperties]>;

  /**
   * A reference to root CSS rule.
   */
  abstract readonly root: StypRule;

  /**
   * CSS selector of this rule.
   */
  abstract readonly selector: StypSelector.Normalized;

  /**
   * CSS properties specifier in most common form. I.e. CSS properties builder function.
   *
   * It is used once per rule instance to construct properties keeper.
   */
  abstract readonly spec: StypProperties.Builder;

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
  get read(): AfterEvent<[StypProperties]> {
    return this._read || (this._read = this.spec(this));
  }

  get [AfterEvent__symbol](): AfterEvent<[StypProperties]> {
    return this.read;
  }

  /**
   * An iterator of all nested CSS rules.
   */
  abstract get rules(): Iterable<StypRule>;

  /**
   * Returns nested CSS rule matching the given `selector`.
   *
   * @param selector Target rule selector.
   *
   * @returns Either matching CSS rule, or `undefined` if not found.
   */
  abstract rule(selector: StypSelector): StypRule | undefined;

  /**
   * Appends CSS properties to this rule.
   *
   * This method modifies this rule.
   *
   * @param properties CSS properties specifier.
   *
   * @returns `this` rule instance.
   */
  abstract add(properties: StypProperties.Spec): this;

  /**
   * Appends CSS properties to the nested rule.
   *
   * Creates target rule if necessary.
   *
   * @param selector Target rule selector.
   * @param properties Optional CSS properties specifier.
   *
   * @returns Modified CSS rule.
   */
  abstract addRule(selector: StypSelector, properties?: StypProperties.Spec): StypRule;

}
