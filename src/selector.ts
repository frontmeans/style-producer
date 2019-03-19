import { filterIt, mapIt, overArray } from 'a-iterable';
import { cssescId } from './cssesc.impl';

export type StypSelector = string | StypSelector.Part | (string | StypSelector.Part | StypSelector.Combinator)[];

export namespace StypSelector {

  export type Normalized = (NormalizedPart | Combinator)[];

  export type Combinator = '>' | '+' | '~';

  export type Part = NsPart | NoNsPart;

  export interface PartBase {
    ns?: string;
    e?: string;
    i?: string;
    c?: string | string[];
    s?: string;
  }

  export interface NoNsPart extends PartBase {
    ns?: undefined;
  }

  export interface Raw extends NoNsPart {
    e?: undefined;
    i?: undefined;
    c?: undefined;
    s: string;
  }

  export interface NsPart extends PartBase {
    ns: string;
    e: string;
  }

  export type NormalizedPart = NormalizedNsPart | NormalizedNoNsPart;

  export interface NormalizedNoNsPart extends NoNsPart {
    c?: string[];
  }

  export interface NormalizedNsPart extends NsPart {
    c?: string[];
  }

}

export function stypSelector(selector: string): [StypSelector.Raw];

export function stypSelector(selector: StypSelector.NormalizedPart): [typeof selector];

export function stypSelector(selector: StypSelector.NsPart): [StypSelector.NormalizedNsPart];

export function stypSelector(selector: StypSelector.NoNsPart): [StypSelector.NormalizedNoNsPart];

export function stypSelector(selector: StypSelector): StypSelector.Normalized;

export function stypSelector(selector: StypSelector): StypSelector.Normalized {
  if (Array.isArray(selector)) {
    return [
      ...filterIt(
          mapIt(
              overArray(selector),
              normalizeItem),
          isPresent),
    ] as StypSelector.Normalized;
  } else {

    const key = normalizeKey(selector);

    return key ? [key] : [];
  }
}

function isPresent<T>(value: T | undefined): value is T {
  return value != null;
}

function normalizeItem(item: string | StypSelector.Part | StypSelector.Combinator):
    StypSelector.NormalizedPart | StypSelector.Combinator | undefined {
  if (isCombinator(item)) {
    return item;
  }
  return normalizeKey(item);
}

function isCombinator(item: string | StypSelector.Part | StypSelector.Combinator): item is StypSelector.Combinator {
  return item === '>' || item === '+' || item === '~';
}

function normalizeKey(key: StypSelector.Part | string): StypSelector.NormalizedPart | undefined {
  if (typeof key === 'string') {
    if (!key) {
      return undefined;
    }
    return { s: key };
  }
  return normalizePart(key);
}

function normalizePart(part: StypSelector.Part): StypSelector.NormalizedPart | undefined {

  const ns = part.ns || undefined;
  const e = part.e || undefined;
  const i = part.i || undefined;
  const s = part.s || undefined;
  const c = normalizeClasses(part.c);

  if (!e && !i && !s && !c) {
    return undefined;
  }

  return { ns, e, i, s, c } as StypSelector.NormalizedPart;
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

export function stypSelectorString(selector: StypSelector): string {
  return stypSelector(selector).reduce((result, item) => result + itemString(item), '');
}

function itemString(item: StypSelector.NormalizedPart | StypSelector.Combinator): string {
  if (isCombinator(item)) {
    return item;
  }

  const { ns, e, i, c, s } = item;
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

  return string;
}
