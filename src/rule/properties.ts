import { AfterEvent, EventKeeper } from 'fun-events';
import { StypRule } from './rule';

/**
 * CSS properties map.
 *
 * Property keys expected to be camel-cased.
 *
 * Custom properties have keys starting with `$`. The properties with keys started with `$$` are reserved.
 *
 * Custom and reserved properties can be referenced, but they never rendered as CSS ones. They could be rendered
 * in a special way though. For example a reserved `$$css` property is rendered as plain CSS text.
 */
export interface StypProperties {

  readonly [key: string]: StypProperties.Value;

  /**
   * Plain CSS text.
   *
   * Never interpreted by the library.
   *
   * Note that is is always rendered before the rest of the properties in the map. So the latter take precedence.
   */
  $$css?: string;

}

export namespace StypProperties {

  /**
   * CSS property value. Always scalar.
   */
  export type Value = string | number | boolean | undefined;

  /**
   * CSS properties specifier.
   *
   * This can be one of:
   * - plain CSS text,
   * - CSS properties map,
   * - an event keeper sending one of the above, or
   * - a function depending on style rule and returning one of the above.
   */
  export type Spec =
      string | StypProperties
      | EventKeeper<[string | StypProperties]>
      | ((rule: StypRule) => string | StypProperties | EventKeeper<[string | StypProperties]>);

  /**
   * CSS properties builder function signature.
   *
   * This is a most generic form of CSS properties specifier.
   *
   * @param rule A style rule the properties generated for.
   *
   * @return An `AfterEvent` registrar of CSS properties receivers.
   */
  export type Builder = (rule: StypRule) => AfterEvent<[StypProperties]>;

  /**
   * Mutable CSS properties map.
   */
  export type Mutable = { [key in keyof StypProperties]: StypProperties[key] };

}
