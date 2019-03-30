import { isCombinator } from './selector.impl';
import { StypSelector } from './selector';
import { cssescId } from '../internal';
import { StypSelectorTextOpts } from './selector-text';

const ruleKeyTextOpts: StypSelectorTextOpts = {
  qualify(s: string) {
    return `@${cssescId(s)}`;
  }
};

/**
 * @internal
 */
export function stypRuleKey(selector: StypSelector.Normalized): string {
  return formatStypSelector(selector, ruleKeyTextOpts);
}

const defaultTextOpts: StypSelectorTextOpts = {};

/**
 * @internal
 */
export function formatStypSelector(
    selector: StypSelector.Normalized,
    opts: StypSelectorTextOpts = defaultTextOpts): string {
  return selector.reduce((result, item) => result + formatItem(item, opts), '');
}

function formatItem(
    item: StypSelector.NormalizedPart | StypSelector.Combinator,
    { qualify }: StypSelectorTextOpts): string {
  if (isCombinator(item)) {
    return item;
  }

  const { ns, e, i, c, s, $ } = item;
  let string: string;

  if (ns != null) {
    string = `${ns}|${e}`;
  } else {
    string = e || '';
  }
  if (i) {
    string += `#${cssescId(i)}`;
  }
  if (c) {
    string = c.reduce((result, className) => `${result}.${cssescId(className)}`, string);
  }
  if (s) {
    string += s;
  }
  if (qualify && $) {
    string = $.reduce((result, qualifier) => result + qualify(qualifier), string);
  }

  return string;
}
