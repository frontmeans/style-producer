import { EventKeeper } from 'fun-events';
import { StypDeclaration } from './declaration';

/**
 * CSS properties.
 *
 * Can be either a map of properties or raw CSS declaration text. In the latter case the text is treated as is and
 * never interpreted by this library.
 */
export type StypProperties = StypProperties.Map | string;

export namespace StypProperties {

  /**
   * CSS property value. Always scalar.
   */
  export type Value = string | number | boolean | undefined;

  /**
   * CSS properties map.
   *
   * Property keys expected to be be camel-cased.
   *
   * Properties with keys started with `$` are internal. They can be referenced, but never appended to generated CSS.
   */
  export interface Map {

    readonly [key: string]: StypProperties.Value;

  }

  /**
   * CSS properties specifier.
   *
   * This can be one of:
   * - CSS properties (either string or map),
   * - an event keeper sending CSS properties,
   * - a function depending on style declaration and returning CSS properties, or
   * - a full CSS property builder, i.e. a function depending on style declaration and returning an event keeper sending
   * CSS properties.
   */
  export type Spec =
      StypProperties
      | EventKeeper<[StypProperties]>
      | ((decl: StypDeclaration) => StypProperties)
      | Builder;

  /**
   * CSS properties builder function signature.
   *
   * This is a most generic form of CSS properties specifier.
   *
   * @param decl A style declaration the properties generated for.
   *
   * @return An event keeper sending CSS properties.
   */
  export type Builder = (decl: StypDeclaration) => EventKeeper<[StypProperties]>;

}
