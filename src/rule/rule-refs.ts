import { AfterEvent, AfterEvent__symbol, afterEventFrom, afterEventFromAll, EventKeeper, OnEvent } from 'fun-events';
import { StypProperties } from './properties';
import { StypRule } from './rule';
import { RefStypRule, StypRuleRef } from './rule-ref';

/**
 * Named CSS rule references complying to the CSS properties structure.
 *
 * Implements an event keeper interface by sending named CSS properties structures for each CSS rule reference.
 *
 * @typeparam R A type of target map of named CSS properties structures.
 */
export abstract class StypRuleRefs<R extends StypRuleRefs.Struct<R>> implements EventKeeper<[R]> {

  private _read?: AfterEvent<[R]>;

  /**
   * CSS rule references by name.
   *
   * Each property in this map is a CSS rule reference corresponding to the same named property in properties structure.
   * I.e. it has the same name and the same properties structure of referenced rule.
   */
  abstract readonly refs: { [K in keyof R]: StypRuleRef<R[K]> };

  /**
   * An `AfterEvent` registrar of the receivers of named CSS properties structures for each CSS rule reference.
   */
  get read(): AfterEvent<[R]> {
    if (this._read) {
      return this._read;
    }

    const fromAll: AfterEvent<[{ [K in keyof R]: [StypProperties<any>] }]> = afterEventFromAll(this.refs);
    const flattened = fromAll.thru(flattenProperties) as OnEvent<[R]>;

    return this._read = afterEventFrom<[R]>(flattened);
  }

  get [AfterEvent__symbol](): AfterEvent<[R]> {
    return this.read;
  }

  /**
   * Constructs named CSS rules.
   *
   * @typeparam R A type of target map of named CSS properties structures.
   * @param referrers Named CSS rule referrers to resolve.
   * @param root A root CSS rule the references will be relative to.
   *
   * @returns A function that obtains each of the named CSS rule references relatively to the given root.
   */
  static by<R extends StypRuleRefs.Struct<R>>(
      referrers: { readonly [name: string]: RefStypRule<any> },
      root: StypRule): StypRuleRefs<R> {

    const refs: { [K in keyof R]?: StypRuleRef<any> } = {};

    for (const key of Object.keys(referrers)) {
      refs[key as keyof R] = referrers[key](root) as StypRuleRef<any>;
    }

    class Refs extends StypRuleRefs<R> {

      // noinspection JSMethodCanBeStatic
      get refs()  {
        return refs as { [K in keyof R]: StypRuleRef<R[K]> };
      }

    }

    return new Refs();
  }

}

function flattenProperties<R extends StypRuleRefs.Struct<R>>(
    propertiesMap: { readonly [name: string]: [StypProperties<any>] }): R {

  const result: { [name: string]: StypProperties<any> } = {};

  for (const name of Object.keys(propertiesMap)) {
    result[name] = propertiesMap[name][0];
  }

  return result as R;
}

export namespace StypRuleRefs {

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
