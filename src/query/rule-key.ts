import { DoqryCombinator, DoqryPicker } from '@frontmeans/doqry';

/**
 * A key of CSS rule.
 *
 * This is an empty tuple for root selector, or normalized CSS selector part optionally preceded by combinator
 * for nested one.
 *
 * @category CSS Rule
 */
export type StypRuleKey = [] | StypRuleKey.Nested;

/**
 * @category CSS Rule
 */
export namespace StypRuleKey {
  /**
   * A key of nested CSS rule within its parent.
   */
  export type Nested = [DoqryPicker.Part] | [DoqryCombinator, DoqryPicker.Part];
}
