import { isCombinator } from './selector.impl';
import { StypSelector } from './selector';
import { cssescId } from '../internal';
import { StypSelectorFormat } from './selector-text';
import { StypRuleKey } from './rule-key';
import { qualifyClass, qualifyElement, qualifyId, xmlNs } from '../ns/namespace.impl';
import { NamespaceRegistrar, newNamespaceRegistrar } from '../ns';

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
      nsShortcut = newNamespaceRegistrar(),
    }: StypSelectorFormat = defaultFormat): string {

  const format: ItemFormat = { qualify, nsShortcut };

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
  nsShortcut: NamespaceRegistrar;
}

function formatItem(
    item: StypSelector.NormalizedPart,
    {
      qualify,
      nsShortcut,
    }: ItemFormat): string {

  const { ns, e, i, c, s, $ } = item;
  let hasProperties = false;
  let string = '';

  if (i) {
    hasProperties = true;
    string += `#${cssescId(qualifyId(i, nsShortcut))}`;
  }
  if (c) {
    hasProperties = true;
    string = c.reduce<string>(
        (result, className) => `${result}.${cssescId(qualifyClass(className, nsShortcut))}`,
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
    string = `${xmlNs(ns, nsShortcut)}|${e || '*'}${string}`;
  } else if (hasProperties) {
    string = `${e ? qualifyElement(e, nsShortcut) : ''}${string}`;
  } else {
    string = `${e ? qualifyElement(e, nsShortcut) : '*'}${string}`;
  }

  return string;
}
