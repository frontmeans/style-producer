/**
 * @module style-producer
 */
import { valueProvider } from 'call-thru';
import {
  AfterEvent,
  AfterEvent__symbol,
  afterEventFromAll,
  afterEventOf,
  EventKeeper,
  isEventKeeper
} from 'fun-events';
import { StypSelector } from '../selector';
import { StypMapper } from '../value';
import { StypProperties } from './properties';
import { StypRule } from './rule';

/**
 * A type safe reference to CSS rule.
 *
 * Allows to access an modify CSS properties of the rule in a type safe manner.
 *
 * @category CSS Rule
 * @typeparam T  CSS properties structure of referenced rule.
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
   * @param properties  CSS properties specifier. Or nothing to clear them.
   *
   * @returns `this` rule instance.
   */
  abstract set(properties?: Partial<StypProperties<T>> | EventKeeper<[Partial<StypProperties<T>>]>): this;

  /**
   * Appends CSS properties to the references CSS rule.
   *
   * @param properties  CSS properties specifier.
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
 * @category CSS Rule
 * @typeparam T  CSS properties interface of referenced rule.
 * @param root  Root CSS rule the constructed reference will be relative to.
 *
 * @returns CSS rule reference.
 */
export type RefStypRule<T extends StypProperties<T>> = (this: void, root: StypRule) => StypRuleRef<T>;

/**
 * @category CSS Rule
 */
export const RefStypRule = {

  /**
   * Constructs a CSS rule referrer that maps original CSS properties accordingly to the given `mappings`.
   *
   * @typeparam T  CSS properties structure of referenced rule.
   * @param selector  CSS selector of target rule.
   * @param mappings  Either a mappings of CSS properties, an event keeper sending such mappings, or a function
   * returning one of them and accepting a root CSS rule as its only argument.
   * the constructed reference will be relative to as its only parameter.
   *
   * @returns New CSS rule key instance.
   */
  by<T extends StypProperties<T>>(
      selector: StypSelector,
      mappings:
          | StypMapper.Mappings<T>
          | EventKeeper<[StypMapper.Mappings<T>]>
          | ((this: void, root: StypRule) => StypMapper.Mappings<T> | EventKeeper<[StypMapper.Mappings<T>]>)
  ): RefStypRule<T> {

    let createMappings: (root: StypRule) => EventKeeper<[StypMapper.Mappings<T>]>;

    if (typeof mappings === 'function') {
      createMappings = root => mappingsKeeper(mappings(root));
    } else {
      createMappings = valueProvider(mappingsKeeper(mappings));
    }

    return ref;

    function ref(root: StypRule): StypRuleRef<T> {

      const read = afterEventFromAll({
        ms: createMappings(root),
        ps: root.rules.watch(selector),
      }).keep.thru(
          ({
             ms: [_mappings],
             ps: [_properties],
           }) => StypMapper.map(_mappings, _properties)
      );

      class Ref extends StypRuleRef<T> {

        // noinspection JSMethodCanBeStatic
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
  },

};

function mappingsKeeper<T extends StypProperties<T>>(
    mappings: StypMapper.Mappings<T> | EventKeeper<[StypMapper.Mappings<T>]>):
    EventKeeper<[StypMapper.Mappings<T>]> {
  return isEventKeeper(mappings) ? mappings : afterEventOf(mappings);
}
