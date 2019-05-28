import { AfterEvent, afterEventFrom, afterEventFromAll, OnEvent } from 'fun-events';
import { StypProperties } from './properties';
import { StypRule } from './rule';
import { RefStypRule, StypRuleRef } from './rule-ref';

/**
 * Named CSS rule references mapper.
 *
 * This is a function that obtains named CSS rule references relatively to the given root.
 *
 * @typeparam R A type of target map of named CSS properties structures.
 * @param root A root CSS rule the references will be relative to.
 *
 * @returns Resolved CSS rule references.
 */
export type MapStypRuleRefs<R extends StypRuleRefMap.Struct<R>> = (this: void, root: StypRule) => StypRuleRefMap<R>;

/**
 * A map of named CSS rule references complying to the given structure.
 *
 * @typeparam R A type of target map of named CSS properties structures.
 */
export type StypRuleRefMap<R extends StypRuleRefMap.Struct<R>> = {
  readonly [K in keyof R]: StypRuleRef<R[K]>;
};

export namespace StypRuleRefMap {

  /**
   * A map of named CSS properties structures.
   *
   * Each property in this map corresponds to CSS rule reference with the same CSS properties structure.
   */
  export type Struct<R = { readonly [name: string]: StypProperties<any> }> = {
    readonly [K in keyof R]: StypProperties<any>;
  };

  /**
   * A map of named CSS rule referrers.
   *
   * These referrers then resolved to the same named CSS rule references.
   *
   * @typeparam R A type of target map of named CSS properties structures.
   */
  export type Referrers<R extends Struct<R>> = {
    readonly [K in keyof R]: RefStypRule<R[K]>;
  };

}

/**
 * Constructs a named CSS rules referrer.
 *
 * @typeparam R A type of target map of named CSS properties structures.
 * @param referrers Named CSS rule referrers to resolve.
 *
 * @returns A function that obtains each of the named CSS rule references relatively to the given root.
 */
export function mapStypRuleRefs<R extends StypRuleRefMap.Struct<R>>(
    referrers: StypRuleRefMap.Referrers<R>):
    MapStypRuleRefs<R> {
  return _mapStypRuleRefs.bind<
      void,
      StypRuleRefMap.Referrers<R>,
      [StypRule],
      StypRuleRefMap<R>>(undefined, referrers);
}

function _mapStypRuleRefs<R extends StypRuleRefMap.Struct<R>>(
    referrers: { readonly [name: string]: RefStypRule<any> },
    root: StypRule): StypRuleRefMap<R> {

  const result: { [K in keyof R]?: StypRuleRef<any> } = {};

  for (const key of Object.keys(referrers)) {
    result[key as keyof R] = referrers[key](root) as StypRuleRef<any>;
  }

  return result as StypRuleRefMap<R>;
}

/**
 * Constructs an `AfterEvent` registrar of the receivers of named CSS properties structures for each of the CSS
 * rule reference from the given map.
 *
 * @param refs Source map of CSS rule references.
 *
 * @returns An `AfterEvent` event receivers registrar.
 */
export function readStypRuleRefMap<R extends StypRuleRefMap.Struct<R>>(
    refs: StypRuleRefMap<R>): AfterEvent<[R]> {

  const fromAll: AfterEvent<[{ [K in keyof R]: [StypProperties<any>] }]> = afterEventFromAll(refs);
  const flattened = fromAll.thru(flattenProperties) as OnEvent<[R]>;

  return afterEventFrom(flattened);
}

function flattenProperties<R extends StypRuleRefMap.Struct<R>>(
    propertiesMap: { readonly [name: string]: [StypProperties<any>] }): R {

  const result: { [name: string]: StypProperties<any> } = {};

  for (const name of Object.keys(propertiesMap)) {
    result[name] = propertiesMap[name][0];
  }

  return result as R;
}
