import { StypSelector } from './selector';

/**
 * A key of CSS rule within its parent.
 *
 * This is an empty tuple for root selector, or normalized CSS selector part optionally preceded by combinator.
 */
export type StypRuleKey = [] | [StypSelector.NormalizedPart] | [StypSelector.Combinator, StypSelector.NormalizedPart];
