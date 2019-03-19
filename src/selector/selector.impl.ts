import cssesc from 'cssesc';
import { StypSelector } from './selector';

/**
 * @internal
 */
export function cssescId(id: string): string {
  return cssesc(id, { isIdentifier: true });
}

/**
 * @internal
 */
export function isCombinator(item: string | StypSelector.Part | StypSelector.Combinator):
    item is StypSelector.Combinator {
  return item === '>' || item === '+' || item === '~';
}
