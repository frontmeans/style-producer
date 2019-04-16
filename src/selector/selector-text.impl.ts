import { isCombinator } from './selector.impl';
import { StypSelector } from './selector';
import { cssescId } from '../internal';
import { StypSelectorFormat } from './selector-text';
import { StypRuleKey } from './rule-key';
import { qualifyClass, qualifyElement, qualifyId, xmlNs } from '../ns/namespace.impl';
import { NamespaceAliaser, newNamespaceAliaser } from '../ns';

const ruleKeyTextOpts: StypSelectorFormat = {
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

const displayTextOpts: StypSelectorFormat = {
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

const defaultFormat: StypSelectorFormat = {};

/**
 * @internal
 */
export function formatStypSelector(
    selector: StypSelector.Normalized,
    {
      qualify,
      nsAlias = newNamespaceAliaser(),
    }: StypSelectorFormat = defaultFormat): string {

  const format: ItemFormat = { qualify, nsAlias };

  return selector.reduce(
      (result, item) => {
        if (isCombinator(item)) {
          return result + item;
        }
        if (result && !isCombinator(result[result.length - 1])) {
          result += ' ';
        }
        return result + formatItem(item, format);
      },
      '');
}

interface ItemFormat extends StypSelectorFormat {
  nsAlias: NamespaceAliaser;
}

function formatItem(
    item: StypSelector.NormalizedPart,
    {
      qualify,
      nsAlias,
    }: ItemFormat): string {

  const { ns, e, i, c, s, $ } = item;
  let hasProperties = false;
  let string = '';

  if (i) {
    hasProperties = true;
    string += `#${cssescId(qualifyId(i, nsAlias))}`;
  }
  if (c) {
    hasProperties = true;
    string = c.reduce<string>(
        (result, className) => `${result}.${cssescId(qualifyClass(className, nsAlias))}`,
        string);
  }
  if (s) {
    hasProperties = true;
    string += s;
  }
  if (qualify && $) {
    string = $.reduce((result, qualifier) => result + qualify(qualifier), string);
  }
  if (ns) {
    string = `${xmlNs(ns, nsAlias)}|${e || '*'}${string}`;
  } else if (hasProperties) {
    string = `${e ? qualifyElement(e, nsAlias) : ''}${string}`;
  } else {
    string = `${e ? qualifyElement(e, nsAlias) : '*'}${string}`;
  }

  return string;
}
