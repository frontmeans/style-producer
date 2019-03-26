import { isCombinator } from './selector.impl';
import { StypSelector } from './selector';
import { cssescId } from '../internal';
import { asis } from 'call-thru';

/**
 * @internal
 */
export function stypDeclarationKey(selector: StypSelector.Normalized): string {
  return formatStypSelector(selector, asis, s => `@${cssescId(s)}`);
}

/**
 * @internal
 */
export function formatStypSelector(
    selector: StypSelector.Normalized,
    formatRaw: (s: string) => string,
    formatQualifier?: (s: string) => string): string {
  return selector.reduce((result, item) => result + formatItem(item, formatRaw, formatQualifier), '');
}

function formatItem(
    item: StypSelector.NormalizedPart | StypSelector.Combinator,
    formatRaw: (s: string) => string,
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
    string += formatRaw(s);
  }
  if (formatQualifier && $) {
    string = $.reduce((p, q) => p + formatQualifier(q), string);
  }

  return string;
}
