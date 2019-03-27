import { isCombinator } from './selector.impl';
import { StypSelector } from './selector';
import { cssescId } from '../internal';

/**
 * @internal
 */
export function stypRuleKey(selector: StypSelector.Normalized): string {
  return formatStypSelector(selector, s => `@${cssescId(s)}`);
}

/**
 * @internal
 */
export function formatStypSelector(
    selector: StypSelector.Normalized,
    formatQualifier?: (s: string) => string): string {
  return selector.reduce((result, item) => result + formatItem(item, formatQualifier), '');
}

function formatItem(
    item: StypSelector.NormalizedPart | StypSelector.Combinator,
    formatQualifier?: (s: string) => string): string {
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
  if (formatQualifier && $) {
    string = $.reduce((result, qualifier) => result + formatQualifier(qualifier), string);
  }

  return string;
}
