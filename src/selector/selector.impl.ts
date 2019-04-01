import { StypSelector } from './selector';
import { StypRuleKey } from './rule-key';

/**
 * @internal
 */
export function isCombinator(item: string | StypSelector.Part | StypSelector.Combinator):
    item is StypSelector.Combinator {
  return item === '>' || item === '+' || item === '~';
}

/**
 * @internal
 */
export function normalizeStypSelectorPart(part: StypSelector.Part): StypSelector.NormalizedPart | undefined {

  const ns = part.ns || undefined;
  const e = part.e || undefined;
  const i = part.i || undefined;
  const s = part.s || undefined;
  const c = normalizeClasses(part.c);
  const $ = normalizeClasses(part.$);

  if (!e && !i && !s && !c && !$) {
    return;
  }

  return { ns, e, i, s, c, $ } as StypSelector.NormalizedPart;
}

function normalizeClasses(classes: string | string[] | undefined): string[] | undefined {
  if (!classes) {
    return;
  }
  if (!Array.isArray(classes)) {
    return [classes];
  }

  classes = classes.filter(c => !!c);

  return classes.length ? classes.sort() : undefined;
}

const noKeyAndTail: [[]] = [[]];

/**
 * @internal
 */
export function stypRuleKeyAndTail(
    selector: StypSelector.Normalized):
    [[]] | [StypRuleKey.Nested, StypSelector.Normalized?] {
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
