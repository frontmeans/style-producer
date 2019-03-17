import cssesc from 'cssesc';

export type StypSelector = StypSelector.Key | (StypSelector.Key | StypSelector.Combinator)[];

export namespace StypSelector {

  export type Normalized = (NormalizedKey | Combinator)[];

  export type Key = string | Raw | Part;

  export type Combinator = '>' | '+' | '~';

  export type Part = NsPart | NoNsPart;

  export interface PartBase {
    s?: string;
    ns?: string;
    e?: string;
    i?: string;
    c?: string | string[];
    x?: string;
  }

  export interface Raw extends PartBase {
    s: string;
    ns?: undefined;
    e?: undefined;
    i?: undefined;
    c?: undefined;
    x?: undefined;
  }

  export interface NoNsPart extends PartBase {
    s?: undefined;
    ns?: undefined;
  }

  export interface NsPart extends PartBase {
    s?: undefined;
    ns: string;
    e: string;
  }

  export type NormalizedKey = Raw | NormalizedPart;

  export type NormalizedPart = NormalizedNsPart | NormalizedNoNsPart;

  export interface NormalizedNoNsPart extends NoNsPart {
    c?: string[];
  }

  export interface NormalizedNsPart extends NsPart {
    c?: string[];
  }

}

export function stypSelector(selector: string): [StypSelector.Raw];

export function stypSelector(selector: StypSelector.NormalizedKey): [typeof selector];

export function stypSelector(selector: StypSelector.Part): [StypSelector.NormalizedPart];

export function stypSelector(selector: StypSelector.NsPart): [StypSelector.NormalizedNsPart];

export function stypSelector(selector: StypSelector): StypSelector.Normalized;

export function stypSelector(selector: StypSelector): StypSelector.Normalized {
  return Array.isArray(selector) ? selector.map(normalizeItem) : [normalizeKey(selector)];
}

function normalizeItem(item: StypSelector.Key | StypSelector.Combinator):
    StypSelector.NormalizedKey | StypSelector.Combinator {
  if (isCombinator(item)) {
    return item;
  }
  return normalizeKey(item);
}

function isCombinator(item: StypSelector.Key | StypSelector.Combinator): item is StypSelector.Combinator {
  return item === '>' || item === '+' || item === '~';
}

function normalizeKey(key: StypSelector.Key): StypSelector.NormalizedKey {
  if (typeof key === 'string') {
    return { s: key };
  }
  if (key.s != null) {
    return key;
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

function itemString(item: StypSelector.NormalizedKey | StypSelector.Combinator): string {
  if (isCombinator(item)) {
    return item;
  }

  const { s, ns, e, i, c, x } = item;

  if (s != null) {
    return s;
  }

  let string: string;

  if (ns != null) {
    string = `${ns}|${e}`;
  } else {
    string = e || '';
  }
  if (i) {
    string += `#${escapeId(i)}`;
  }
  if (c) {
    string = c.reduce((result, className) => `${result}.${escapeId(className)}`, string);
  }
  if (x) {
    string += x;
  }

  return string;
}

function escapeId(id: string): string {
  return cssesc(id, { isIdentifier: true });
}
