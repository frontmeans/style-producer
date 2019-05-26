import { AfterEvent, AfterEvent__symbol, EventKeeper } from 'fun-events';
import { StypProperties } from './properties';

/**
 * A type safe reference to CSS rule.
 *
 * Allows to access an modify CSS properties of the rule in a type safe manner.
 *
 * @typeparam T CSS properties interface of referenced rule.
 */
export abstract class StypRuleRef<T>
    implements EventKeeper<[StypProperties<T>]> {

  /**
   * `AfterEvent` CSS properties receiver registrar.
   */
  abstract readonly read: AfterEvent<[StypProperties<T>]>;

  get [AfterEvent__symbol](): AfterEvent<[StypProperties<T>]> {
    return this.read;
  }

  /**
   * Sets CSS properties of the referenced rule.
   *
   * @param properties CSS properties specifier. Or nothing to clear them.
   *
   * @returns `this` rule instance.
   */
  abstract set(properties?: Partial<StypProperties<T>> | EventKeeper<[Partial<StypProperties<T>>]>): this;

  /**
   * Appends CSS properties to the references CSS rule.
   *
   * @param properties CSS properties specifier.
   *
   * @returns `this` rule instance.
   */
  abstract add(properties: Partial<StypProperties<T>> | EventKeeper<[Partial<StypProperties<T>>]>): this;

  /**
   * Clears CSS properties of the referenced rule.
   *
   * Calling this method is the same as calling `set()` without properties.
   *
   * @returns `this` rule instance.
   */
  clear(): this {
    return this.set();
  }

}
