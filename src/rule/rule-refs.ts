/**
 * @packageDocumentation
 * @module @frontmeans/style-producer
 */
import { afterAll, AfterEvent, AfterEvent__symbol, EventKeeper, mapAfter } from '@proc7ts/fun-events';
import { StypProperties } from './properties';
import { StypRule } from './rule';
import { RefStypRule, StypRuleRef } from './rule-ref';

/**
 * Named CSS rule references complying to the CSS properties structure.
 *
 * Implements an event keeper interface by sending named CSS properties structures for each CSS rule reference.
 *
 * @category CSS Rule
 * @typeParam TRefMap - A type of target map of named CSS properties structures.
 */
export class StypRuleRefs<TRefMap extends StypRuleRefs.Struct<TRefMap>> implements EventKeeper<[TRefMap]> {

  /**
   * Constructs named CSS rules by resolving CSS rule referrers.
   *
   * @typeParam TRefMap - A type of target map of named CSS properties structures.
   * @param referrers - Named CSS rule referrers to resolve.
   * @param root - A root CSS rule the references will be relative to.
   *
   * @returns New names CSS rules instance.
   */
  static by<TRefMap extends StypRuleRefs.Struct<TRefMap>>(
      referrers: { readonly [K in keyof TRefMap]: RefStypRule<TRefMap[K]> },
      root: StypRule,
  ): StypRuleRefs<TRefMap>;

  static by<TRefMap extends StypRuleRefs.Struct<TRefMap>>(
      referrers: { readonly [name: string]: RefStypRule<any> },
      root: StypRule,
  ): StypRuleRefs<TRefMap> {

    const refs: { [K in keyof TRefMap]?: StypRuleRef<any> } = {};

    for (const key of Object.keys(referrers)) {
      refs[key as keyof TRefMap] = referrers[key](root);
    }

    return new StypRuleRefs<TRefMap>(refs as { [K in keyof TRefMap]: StypRuleRef<TRefMap[K]> });
  }

  /**
   * CSS rule references by name.
   *
   * Each property in this map is a CSS rule reference corresponding to the same named property in properties structure.
   * I.e. it has the same name and the same properties structure of referenced rule.
   */
  readonly refs: { readonly [K in keyof TRefMap]: StypRuleRef<TRefMap[K]> };

  /**
   * An `AfterEvent` keeper of named CSS properties structures for each CSS rule reference.
   *
   * The `[AfterEvent__symbol]` property is an alias of this one.
   */
  readonly read: AfterEvent<[TRefMap]>;

  /**
   * Constructs named CSS rules.
   *
   * @param refs - A map of named CSS rule references.
   */
  constructor(refs: { readonly [K in keyof TRefMap]: StypRuleRef<TRefMap[K]> }) {
    this.refs = refs;

    const fromAll: AfterEvent<[{ [K in keyof TRefMap]: [StypProperties<any>] }]> = afterAll(this.refs);

    this.read = fromAll.do(mapAfter(flattenProperties)) as AfterEvent<[TRefMap]>;
  }

  [AfterEvent__symbol](): AfterEvent<[TRefMap]> {
    return this.read;
  }

}

/**
 * @internal
 */
function flattenProperties<TRefMap extends StypRuleRefs.Struct<TRefMap>>(
    propertiesMap: { readonly [name: string]: [StypProperties<any>] },
): TRefMap {

  const result: { [name: string]: StypProperties<any> } = {};

  for (const name of Object.keys(propertiesMap)) {
    result[name] = propertiesMap[name][0];
  }

  return result as TRefMap;
}

/**
 * @category CSS Rule
 */
export namespace StypRuleRefs {

  /**
   * A map of named CSS properties structures.
   *
   * Each property in this map corresponds to CSS rule reference with the same CSS properties structure.
   *
   * @typeParam TRefMap - A type of target map of named CSS properties structures.
   */
  export type Struct<TRefMap = { readonly [name: string]: StypProperties<any> }> = {
    readonly [K in keyof TRefMap]: StypProperties<any>;
  };

  /**
   * A map of named CSS rule referrers.
   *
   * These referrers then resolved to the same named CSS rule references.
   *
   * @typeParam TRefMap - A type of target map of named CSS properties structures.
   */
  export type Referrers<TRefMap extends Struct<TRefMap>> = {
    readonly [K in keyof TRefMap]: RefStypRule<TRefMap[K]>;
  };

}
