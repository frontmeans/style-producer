import { AfterEvent, EventKeeper, EventSender } from '@proc7ts/fun-events';
import { StypValue } from '../value';
import { StypRule } from './rule';

/**
 * CSS properties map.
 *
 * Contains named CSS properties.
 *
 * Property keys expected to be camelCased. When applied to CSS they hyphenated by [hyphenateCSSName] function.
 *
 * Custom properties have keys starting with anything but ASCII letter. The properties with keys starting with `$$`
 * and `@` are reserved.
 *
 * Custom and reserved properties can be referenced, but they are not rendered as CSS ones. They could be rendered
 * in a special way though. For example a reserved `$$css` property is rendered as raw CSS text.
 *
 * May be parameterized with properties structure. In that case the properties map contains only properties from
 * the given structure.
 *
 * [hyphenateCSSName]: https://frontmeans.github.io/httongue/globals.html#hyphenateCSSName
 *
 * @category CSS Rule
 * @typeparam T  CSS properties structure. Each property in this structure is expected to be compatible with
 * {@link StypValue}.
 */
export type StypProperties<T extends StypProperties<T> = StypProperties.Generic> = {
  readonly [K in keyof T]: T[K] & StypValue;
};

/**
 * @category CSS Rule
 */
export namespace StypProperties {
  /**
   * Generic CSS properties map.
   *
   * Allows any CSS properties. Requires `$$css` one, if present, to be a string.
   */
  export interface Generic {
    readonly [key: string]: StypValue;

    /**
     * Raw CSS text.
     *
     * Never interpreted by the library.
     *
     * Note that it is rendered before the rest of the properties in the map. So the latter take precedence.
     *
     * A {@link stypRenderText} renderer is responsible for raw CSS text rendering.
     */
    readonly $$css?: string | undefined;
  }

  /**
   * CSS properties specifier.
   *
   * This can be one of:
   * - raw CSS text,
   * - CSS properties map,
   * - an event keeper sending CSS text or properties map,
   * - an event sender sending CSS text or properties map, or
   * - a function depending on style rule and returning one of the above.
   */
  export type Spec =
    | string
    | StypProperties
    | EventKeeper<[string | StypProperties]>
    | EventSender<[string | StypProperties]>
    | ((
        this: void,
        rule: StypRule,
      ) =>
        | string
        | StypProperties
        | EventKeeper<[string | StypProperties]>
        | EventSender<[string | StypProperties]>);

  /**
   * CSS properties builder function signature.
   *
   * This is a most generic form of CSS properties specifier.
   */
  export type Builder =
    /**
     * @param rule - A style rule the properties generated for.
     *
     * @return An `AfterEvent` registrar of CSS properties receivers.
     */
    (this: void, rule: StypRule) => AfterEvent<[StypProperties]>;

  /**
   * Mutable CSS properties map.
   */
  export type Mutable = { [key in keyof StypProperties]: StypProperties[key] };
}
