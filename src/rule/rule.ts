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
   * This is `true` when the rule properties are constant an empty.
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
  get rules(): Iterable<StypRule> {
    return overNone();
  }

  /**
   * Returns nested CSS rule matching the given `selector`.
   *
   * @param selector Target rule selector.
   *
   * @returns Either matching CSS rule, or empty one.
   */
  abstract rule(selector: StypSelector): StypRule;

  /**
   * Appends CSS properties to this rule.
   *
   * This method either modifies this rule, or constructs another one. The latter may happen only for empty CSS rules
   * and never happens for the root one.
   *
   * @param properties CSS properties specifier.
   *
   * @returns Modified CSS rule.
   */
  abstract add(properties: StypProperties.Spec): StypRule;

}
