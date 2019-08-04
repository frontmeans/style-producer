import {
  css__naming,
  html__naming,
  id__naming,
  NamespaceAliaser,
  NamespaceDef,
  newNamespaceAliaser,
} from 'namespace-aliaser';
import { cssescId } from '../internal';
import { StypRuleKey } from './rule-key';
import { StypSelector } from './selector';
import { StypSelectorFormat } from './selector-text';
import { isCombinator } from './selector.impl';

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
    string += `#${cssescId(id__naming.name(i, nsAlias))}`;
  }
  if (c) {
    hasProperties = true;
    string = c.reduce<string>(
        (result, className) => `${result}.${cssescId(css__naming.name(className, nsAlias))}`,
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

    const alias = xmlNs(ns, nsAlias);

    if (alias) {
      string = `${alias}|${e || '*'}${string}`;
    } else {
      string = qualifyElement();
    }
  } else {
    string = qualifyElement();
  }

  return string;

  function qualifyElement(): string {
    if (hasProperties) {
      return `${e ? html__naming.name(e, nsAlias) : ''}${string}`;
    }
    return `${e ? html__naming.name(e, nsAlias) : '*'}${string}`;
  }
}

function xmlNs(ns: string | NamespaceDef, nsAlias: NamespaceAliaser): string | undefined {
  return typeof ns === 'string' ? ns : ns.url ? nsAlias(ns) : undefined;
}
