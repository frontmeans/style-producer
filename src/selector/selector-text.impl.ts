import { isCombinator } from './selector.impl';
import { StypSelector } from './selector';
import { cssescId } from '../internal';
import { StypSelectorTextOpts } from './selector-text';
import { StypRuleKey } from './rule-key';

const ruleKeyTextOpts: StypSelectorTextOpts = {
  qualify(qualifier: string) {
    return `@${cssescId(qualifier)}`;
  }
};

/**
 * @internal
 */
export function stypRuleKeyText(key: StypRuleKey): string {
  return formatStypSelector(key, ruleKeyTextOpts);
}

const displayTextOpts: StypSelectorTextOpts = {
  qualify(qualifier: string) {
    return `@${qualifier}`;
  }
};

/**
 * @internal
 */
export function stypSelectorDisplayText(selector: StypSelector.Normalized): string {
  return formatStypSelector(selector, displayTextOpts);
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
  let hasProperties = false;
  let string = '';

  if (i) {
    hasProperties = true;
    string += `#${cssescId(i)}`;
  }
  if (c) {
    hasProperties = true;
    string = c.reduce((result, className) => `${result}.${cssescId(className)}`, string);
  }
  if (s) {
    hasProperties = true;
    string += s;
  }
  if (qualify && $) {
    string = $.reduce((result, qualifier) => result + qualify(qualifier), string);
  }
  if (ns) {
    string = `${ns}|${e || '*'}${string}`;
  } else if (hasProperties) {
    string = `${e || ''}${string}`;
  } else {
    string = `${e || '*'}${string}`;
  }

  return string;
}
