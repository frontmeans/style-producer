import { AfterEvent, EventKeeper } from 'fun-events';
import { StypDeclaration } from './declaration';

/**
 * CSS properties map.
 *
 * Property keys expected to be camel-cased.
 *
 * Properties with keys started with `$` are internal. They can be referenced, but never rendered as CSS, except for
 * special `$$css` one, which is rendered as plain CSS text.
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
   * - a function depending on style declaration and returning one of the above.
   */
  export type Spec =
      string | StypProperties
      | EventKeeper<[string | StypProperties]>
      | ((decl: StypDeclaration) => string | StypProperties | EventKeeper<[string | StypProperties]>);

  /**
   * CSS properties builder function signature.
   *
   * This is a most generic form of CSS properties specifier.
   *
   * @param decl A style declaration the properties generated for.
   *
   * @return An `AfterEvent` registrar of CSS properties receivers.
   */
  export type Builder = (decl: StypDeclaration) => AfterEvent<[StypProperties]>;

  /**
   * Mutable CSS properties map.
   */
  export type Mutable = { [key in keyof StypProperties]: StypProperties[key] };

}
