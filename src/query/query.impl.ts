import { DoqryCombinator, DoqryPicker, isDoqryCombinator } from '@frontmeans/doqry';
import { StypRuleKey } from './rule-key';

const noKeyAndTail: [[]] = [[]];

/**
 * @internal
 */
export function stypRuleKeyAndTail(
  selector: DoqryPicker,
): readonly [[]] | readonly [StypRuleKey.Nested, DoqryPicker?] {
  if (!selector.length) {
    return noKeyAndTail;
  }

  let i = 0;
  let combinator: DoqryCombinator | undefined;

  for (;;) {
    const part = selector[i++];

    if (isDoqryCombinator(part)) {
      combinator = part;

      continue;
    }

    const key: StypRuleKey = combinator ? [combinator, part] : [part];

    return [key, selector.slice(i)];
  }
}

const rootSelector: DoqryPicker = [];

/**
 * @internal
 */
export function stypOuterSelector(selector: DoqryPicker): DoqryPicker | undefined {
  let i = selector.length - 1;

  if (i <= 0) {
    return i ? undefined : rootSelector;
  }

  do {
    --i;
    switch (selector[i]) {
      case '>':
        return selector.slice(0, i);
      case '+':
      case '~':
        --i;

        continue;
      default:
        return selector.slice(0, i + 1);
    }
  } while (i > 0);

  return;
}
