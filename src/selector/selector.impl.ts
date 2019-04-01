import { StypSelector } from './selector';
import { StypRuleKey } from './rule-key';

/**
 * @internal
 */
export function isCombinator(item: string | StypSelector.Part | StypSelector.Combinator):
    item is StypSelector.Combinator {
  return item === '>' || item === '+' || item === '~';
}

const noKeyAndTail: [StypRuleKey] = [[]];

/**
 * @internal
 */
export function stypRuleKeyAndTail(selector: StypSelector.Normalized): [StypRuleKey, StypSelector.Normalized?] {
  if (!selector.length) {
    return noKeyAndTail;
  }

  let i = 0;
  let combinator: StypSelector.Combinator | undefined;

  for (;;) {

    const part = selector[i++];

    if (isCombinator(part)) {
      combinator = part;
      continue;
    }

    const key: StypRuleKey = combinator ? [combinator, part] : [part];

    return [key, selector.slice(i)];
  }
}
