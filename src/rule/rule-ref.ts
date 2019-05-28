import { valueProvider } from 'call-thru';
import { AfterEvent, AfterEvent__symbol, afterEventFrom, EventKeeper } from 'fun-events';
import { StypSelector } from '../selector';
import { StypMapper } from '../value';
import { StypProperties } from './properties';
import { StypRule } from './rule';

/**
 * A type safe reference to CSS rule.
 *
 * Allows to access an modify CSS properties of the rule in a type safe manner.
 *
 * @typeparam T CSS properties structure of referenced rule.
 */
export abstract class StypRuleRef<T extends StypProperties<T>> implements EventKeeper<[T]> {

  /**
   * `AfterEvent` CSS properties receiver registrar.
   */
  abstract readonly read: AfterEvent<[T]>;

  get [AfterEvent__symbol](): AfterEvent<[T]> {
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

/**
 * CSS rule referrer.
 *
 * This is a function that obtains CSS rule reference relative to the given root.
 *
 * @typeparam T CSS properties interface of referenced rule.
 * @param root Root CSS rule the constructed reference will be relative to.
 *
 * @returns CSS rule reference.
 */
export type RefStypRule<T extends StypProperties<T>> = (root: StypRule) => StypRuleRef<T>;

/**
 * Constructs a CSS rule referrer that maps original CSS properties accordingly to the given `mappings`.
 *
 * @typeparam T CSS properties structure of referenced rule.
 * @param selector CSS selector of target rule.
 * @param mappings Mappings of CSS properties, or a function returning such mapping and accepting a root CSS rule
 * the constructed reference will be relative to as its only parameter.
 *
 * @returns New CSS rule key instance.
 */
export function refStypRule<T extends StypProperties<T>>(
    selector: StypSelector,
    mappings: StypMapper.Mappings<T> | ((this: void, root: StypRule) => StypMapper.Mappings<T>)): RefStypRule<T> {

  let createMapper: (root: StypRule) => StypMapper<T>;

  if (typeof mappings === 'function') {
    createMapper = root => StypMapper.by(mappings(root));
  } else {
    createMapper = valueProvider(StypMapper.by(mappings));
  }

  return ref;

  function ref(root: StypRule): StypRuleRef<T> {

    const mapper = createMapper(root);
    const watched = root.rules.watch(selector);
    const read = afterEventFrom<[T]>(watched.thru(mapper));

    class Ref extends StypRuleRef<T> {

      get read() {
        return read;
      }

      add(properties: EventKeeper<[Partial<StypProperties<T>>]> | Partial<StypProperties<T>>): this {
        root.rules.add(selector, properties);
        return this;
      }

      set(properties?: EventKeeper<[Partial<StypProperties<T>>]> | Partial<StypProperties<T>>): this {
        root.rules.add(selector).set(properties);
        return this;
      }

    }

    return new Ref();
  }
}
