import { afterEventFrom, EventKeeper } from 'fun-events';
import { StypSelector } from '../selector';
import { StypMapper } from '../value';
import { StypProperties } from './properties';
import { StypRule } from './rule';
import { StypRuleRef } from './rule-ref';

/**
 * CSS rule getter.
 *
 * This is a function that obtains CSS rule reference relative to the given root.
 *
 * @typeparam T CSS properties interface of referenced rule.
 * @param root Root CSS rule the constructed reference wil be relative to.
 *
 * @returns CSS rule reference.
 */
export type StypRuleGetter<T> = (root: StypRule) => StypRuleRef<T>;

/**
 * Constructs a CSS rule key that maps original CSS properties accordingly the given `mappings`.
 *
 * @param selector CSS selector of target rule.
 * @param mappings Mappings of CSS properties.
 *
 * @returns New CSS rule key instance.
 */
export function stypRuleGetter<T, P extends StypProperties.Map<T> = StypProperties.Map<T>>(
    selector: StypSelector,
    mappings: StypMapper.Mappings<P>): StypRuleGetter<T> {

  const mapper = StypMapper.by<P>(mappings);

  return key;

  function key(root: StypRule): StypRuleRef<T, P> {

    const watched = root.rules.watch(selector);
    const read = afterEventFrom<[P]>(watched.thru(mapper));

    class Ref extends StypRuleRef<T, P> {

      get read() {
        return read;
      }

      add(properties: EventKeeper<[Partial<P>]> | Partial<P>): this {
        root.rules.add(selector, properties);
        return this;
      }

      set(properties?: EventKeeper<[Partial<P>]> | Partial<P>): this {
        root.rules.add(selector).set(properties);
        return this;
      }

    }

    return new Ref();
  }
}
