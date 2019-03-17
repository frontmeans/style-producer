import cssesc from 'cssesc';

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
  return Array.isArray(selector) ? selector.map(normalizeItem) : [normalizeKey(selector)];
}

function normalizeItem(item: string | StypSelector.Part | StypSelector.Combinator):
    StypSelector.NormalizedPart | StypSelector.Combinator {
  if (isCombinator(item)) {
    return item;
  }
  return normalizeKey(item);
}

function isCombinator(item: string | StypSelector.Part | StypSelector.Combinator): item is StypSelector.Combinator {
  return item === '>' || item === '+' || item === '~';
}

function normalizeKey(key: StypSelector.Part | string): StypSelector.NormalizedPart {
  if (typeof key === 'string') {
    return { s: key };
  }
  return normalizePart(key);
}

function normalizePart(part: StypSelector.Part): StypSelector.NormalizedPart {

  const { c, ...rest } = part;

  if (!c) {
    return rest;
  }
  if (!Array.isArray(c)) {
    return { ...rest, c: [c] };
  }

  return { ...rest, c: [...c].sort() };
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

function cssescId(id: string): string {
  return cssesc(id, { isIdentifier: true });
}
