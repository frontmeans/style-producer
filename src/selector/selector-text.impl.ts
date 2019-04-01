import { isCombinator } from './selector.impl';
import { StypSelector } from './selector';
import { cssescId } from '../internal';
import { StypSelectorTextOpts } from './selector-text';
import { StypRuleKey } from './rule-key';

const ruleKeyTextOpts: StypSelectorTextOpts = {
  qualify(s: string) {
    return `@${cssescId(s)}`;
  }
};

/**
 * @internal
 */
export function stypRuleKeyText(selector: StypRuleKey): string {
  return formatStypSelector(selector, ruleKeyTextOpts);
}

const defaultTextOpts: StypSelectorTextOpts = {};

/**
 * @internal
 */
export function formatStypSelector(
    selector: StypSelector.Normalized,
    opts: StypSelectorTextOpts = defaultTextOpts): string {
  return selector.reduce(
      (result, item) => {
        if (isCombinator(item)) {
          return result + item;
        }
        if (result && !isCombinator(result[result.length - 1])) {
          result += ' ';
        }
        return result + formatItem(item, opts);
      },
      '');
}

function formatItem(
    item: StypSelector.NormalizedPart,
    { qualify }: StypSelectorTextOpts): string {

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
