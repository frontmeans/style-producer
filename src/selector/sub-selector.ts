import { StypPureSelector } from './pure-selector';
import { StypSelector } from './selector';

/**
 * A sub-selector of structured CSS selector.
 *
 * This can be one of:
 * - [attribute selector],
 * - [pseudo-class], or
 * - [pseudo-element].
 *
 * [attribute selector]: https://developer.mozilla.org/en-US/docs/Web/CSS/Attribute_selectors
 * [pseudo-class]: https://developer.mozilla.org/en-US/docs/Web/CSS/Pseudo-classes
 * [pseudo-element]: https://developer.mozilla.org/en-US/docs/Web/CSS/Pseudo-elements
 *
 * @category CSS Rule
 */
export type StypSubSelector =
    | StypSubSelector.Attribute
    | StypSubSelector.Pseudo;

/**
 * @category CSS Rule
 */
export namespace StypSubSelector {

  /**
   * Normalized structured CSS sub-selector.
   */
  export type Normalized =
      | Attribute
      | NormalizedPseudo;

  /**
   * Structured attribute selector.
   *
   * This is either an attribute name representing selector like `[attribute]`, or a tuple consisting of attribute name,
   * operator, value, and optional flag to representing selector like `[attribute^="value" i]`;
   */
  export type Attribute =
      | readonly [string]
      | readonly [string, AttributeOperator, string, AttributeFlag?];

  /**
   * Attribute selector operator.
   */
  export type AttributeOperator = '=' | '~=' | '|=' | '^=' | '$=' | '*=';

  /**
   * Attribute selector flag.
   */
  export type AttributeFlag = 'i';

  /**
   * Structured pseudo-class or pseudo-element.
   *
   * This is a tuple containing:
   * - a pseudo-prefix (i.e. `:` for pseudo-classes, or `::` for pseudo-elements),
   * - pseudo-class or pseudo-element name (e.g. `host`, or `visited`),
   * - and optional parameters (i.e. the parentheses content following the name).
   *
   * Multiple colon-separated parameters may be represented as tuples.
   */
  export type Pseudo =
      | readonly [PseudoPrefix, string, ...Parameter]
      | readonly [PseudoPrefix, string, ...Parameter[]];

  /**
   * Normalized structured pseudo-class or pseudo-element.
   *
   * It contains normalized parameters represented as tuples, if any.
   */
  export type NormalizedPseudo = readonly [PseudoPrefix, string, ...NormalizedParameter[]];

  /**
   * Pseudo-class (`:`) or pseudo-element (`::`) prefix.
   */
  export type PseudoPrefix = ':' | '::';

  /**
   * Structured CSS sub-selector's parameter.
   *
   * This is a {@link StypPureSelector pure CSS selector} containing no qualifiers.
   *
   * Raw string parameter may be represented either by string, or by sub-selector part containing only `s` property.
   */
  export type Parameter = readonly (string | StypPureSelector.Part | StypSelector.Combinator)[];

  /**
   * Normalized structured CSS sub-selector's parameter.
   *
   * This is a {@link StypPureSelector.Normalized normalized pure CSS selector} containing no qualifiers.
   *
   * Raw string parameter is represented by sub-selector part containing only `s` property.
   */
  export type NormalizedParameter = readonly (StypPureSelector.NormalizedPart | StypSelector.Combinator)[];

}
