import {
  afterAll,
  AfterEvent,
  AfterEvent__symbol,
  afterThe,
  EventKeeper,
  isEventKeeper,
  mapAfter,
} from '@proc7ts/fun-events';
import { valueProvider } from '@proc7ts/primitives';
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
   * An `AfterEvent` keeper of CSS properties.
   *
   * The `[AfterEvent__symbol]` property is an alias of this one.
   */
  abstract readonly read: AfterEvent<[T]>;

  [AfterEvent__symbol](): AfterEvent<[T]> {
    return this.read;
  }

  /**
   * Sets CSS properties of the referenced rule.
   *
   * @param properties - CSS properties specifier. Or nothing to clear them.
   *
   * @returns `this` rule instance.
   */
  abstract set(properties?: Partial<StypProperties<T>> | EventKeeper<[Partial<StypProperties<T>>]>): this;

  /**
   * Appends CSS properties to the references CSS rule.
   *
   * @param properties - CSS properties specifier.
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
 */
export type RefStypRule<T extends StypProperties<T>> =
/**
 * @param root - Root CSS rule the constructed reference will be relative to.
 *
 * @returns CSS rule reference.
 */
    (this: void, root: StypRule) => StypRuleRef<T>;


/**
 * @internal
 */
class StypRuleRef$<T extends StypProperties<T>> extends StypRuleRef<T> {

  readonly read: AfterEvent<[T]>;

  constructor(
      private readonly _root: StypRule,
      private readonly _selector: StypSelector,
      private readonly _map: (root: StypRule) => EventKeeper<[StypMapper.Mappings<T>]>,
  ) {
    super();
    this.read = afterAll({
      ms: this._map(this._root),
      ps: this._root.rules.watch(this._selector),
    }).do(mapAfter(
        ({
          ms: [_mappings],
          ps: [_properties],
        }) => StypMapper.map<T>(_mappings, _properties),
    ));
  }

  add(properties: EventKeeper<[Partial<StypProperties<T>>]> | Partial<StypProperties<T>>): this {
    this._root.rules.add(this._selector, properties);
    return this;
  }

  set(properties?: EventKeeper<[Partial<StypProperties<T>>]> | Partial<StypProperties<T>>): this {
    this._root.rules.add(this._selector).set(properties);
    return this;
  }

}

/**
 * @category CSS Rule
 */
export const RefStypRule = {

  /**
   * Constructs a CSS rule referrer that maps original CSS properties accordingly to the given `mappings`.
   *
   * @typeparam T  CSS properties structure of referenced rule.
   * @param selector - CSS selector of target rule.
   * @param mappings - Either a mappings of CSS properties, an event keeper sending such mappings, or a function
   * returning one of them and accepting a root CSS rule as its only argument.
   * The constructed reference will be relative to as its only parameter.
   *
   * @returns New CSS rule key instance.
   */
  by<T extends StypProperties<T>>(
      selector: StypSelector,
      mappings:
          | StypMapper.Mappings<T>
          | EventKeeper<[StypMapper.Mappings<T>]>
          | ((this: void, root: StypRule) => StypMapper.Mappings<T> | EventKeeper<[StypMapper.Mappings<T>]>),
  ): RefStypRule<T> {

    let map: (root: StypRule) => EventKeeper<[StypMapper.Mappings<T>]>;

    if (typeof mappings === 'function') {
      map = root => mappingsKeeper(mappings(root));
    } else {
      map = valueProvider(mappingsKeeper(mappings));
    }

    return root => new StypRuleRef$(root, selector, map);
  },

};

/**
 * @internal
 */
function mappingsKeeper<T extends StypProperties<T>>(
    mappings: StypMapper.Mappings<T> | EventKeeper<[StypMapper.Mappings<T>]>,
): EventKeeper<[StypMapper.Mappings<T>]> {
  return isEventKeeper(mappings) ? mappings : afterThe(mappings);
}
