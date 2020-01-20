import cssesc from 'cssesc';
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
import { isCombinator, isPseudoSubSelector } from './selector.impl';
import { StypSubSelector } from './sub-selector';

const ruleKeyTextOpts: StypSelectorFormat = {
  qualify(qualifier: string) {
    return `@${cssescId(qualifier)}`;
  },
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
  },
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
    }: StypSelectorFormat = defaultFormat,
): string {

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
      '',
  );
}

interface ItemFormat extends StypSelectorFormat {
  nsAlias: NamespaceAliaser;
}

function formatItem(
    item: StypSelector.NormalizedPart,
    {
      qualify,
      nsAlias,
    }: ItemFormat,
): string {

  const { ns, e, i, c, s, u, $ } = item;
  let hasProperties = false;
  let out = '';

  if (i) {
    hasProperties = true;
    out += `#${cssescId(id__naming.name(i, nsAlias))}`;
  }
  if (c) {
    hasProperties = true;
    out = c.reduce<string>(
        (result, className) => `${result}.${cssescId(css__naming.name(className, nsAlias))}`,
        out,
    );
  }
  if (u) {
    hasProperties = true;

    const subFormat: ItemFormat = { nsAlias };

    out = u.reduce(
        (result, sub) => formatSubSelector(result, sub, subFormat),
        out,
    );
  }
  if (s) {
    hasProperties = true;
    out += s;
  }
  if (qualify && $) {
    out = $.reduce((result, qualifier) => result + qualify(qualifier), out);
  }
  if (ns) {

    const alias = xmlNs(ns, nsAlias);

    if (alias) {
      out = `${alias}|${e || '*'}${out}`;
    } else {
      out = qualifyElement();
    }
  } else {
    out = qualifyElement();
  }

  return out;

  function qualifyElement(): string {
    if (hasProperties) {
      return `${e ? html__naming.name(e, nsAlias) : ''}${out}`;
    }
    return `${e ? html__naming.name(e, nsAlias) : '*'}${out}`;
  }
}

function formatSubSelector(
    out: string,
    sub: StypSubSelector.Normalized,
    format: ItemFormat,
): string {
  if (isPseudoSubSelector(sub)) {
    out += sub[0] + sub[1];

    const len = sub.length;

    if (len > 2) {
      out += '(' + formatStypSelector(sub[2], format);
      for (let i = 3; i < sub.length; ++i) {
        out += ',' + formatStypSelector(sub[i] as StypSubSelector.NormalizedParameter, format);
      }
      out += ')';
    }

    return out;
  }

  const [attrName, attrOp, attrVal, attrFlag] = sub;

  out += '[' + cssescId(attrName);
  if (attrOp) {
    out += attrOp + cssesc(attrVal!, { quotes: 'double', wrap: true });
  }
  if (attrFlag) {
    out += ' ' + attrFlag;
  }

  return out + ']';
}

function xmlNs(ns: string | NamespaceDef, nsAlias: NamespaceAliaser): string | undefined {
  return typeof ns === 'string' ? ns : ns.url ? nsAlias(ns) : undefined;
}
