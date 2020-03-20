/**
 * @packageDocumentation
 * @module style-producer
 */
import { afterAll, AfterEvent, AfterEvent__symbol, EventKeeper, EventReceiver, EventSupply } from '@proc7ts/fun-events';
import { StypProperties } from './properties';
import { StypRule } from './rule';
import { RefStypRule, StypRuleRef } from './rule-ref';

/**
 * Named CSS rule references complying to the CSS properties structure.
 *
 * Implements an event keeper interface by sending named CSS properties structures for each CSS rule reference.
 *
 * @category CSS Rule
 * @typeparam R  A type of target map of named CSS properties structures.
 */
export class StypRuleRefs<R extends StypRuleRefs.Struct<R>> implements EventKeeper<[R]> {

  /**
   * CSS rule references by name.
   *
   * Each property in this map is a CSS rule reference corresponding to the same named property in properties structure.
   * I.e. it has the same name and the same properties structure of referenced rule.
   */
  readonly refs: { readonly [K in keyof R]: StypRuleRef<R[K]> };

  /**
   * Constructs named CSS rules by resolving CSS rule referrers.
   *
   * @typeparam R  A type of target map of named CSS properties structures.
   * @param referrers  Named CSS rule referrers to resolve.
   * @param root  A root CSS rule the references will be relative to.
   *
   * @returns New names CSS rules instance.
   */
  static by<R extends StypRuleRefs.Struct<R>>(
      referrers: { readonly [K in keyof R]: RefStypRule<R[K]> },
      root: StypRule,
  ): StypRuleRefs<R>;

  static by<R extends StypRuleRefs.Struct<R>>(
      referrers: { readonly [name: string]: RefStypRule<any> },
      root: StypRule,
  ): StypRuleRefs<R> {

    const refs: { [K in keyof R]?: StypRuleRef<any> } = {};

    for (const key of Object.keys(referrers)) {
      refs[key as keyof R] = referrers[key](root);
    }

    return new StypRuleRefs<R>(refs as { [K in keyof R]: StypRuleRef<R[K]> });
  }

  /**
   * Constructs named CSS rules.
   *
   * @param refs  A map of named CSS rule references.
   */
  constructor(refs: { readonly [K in keyof R]: StypRuleRef<R[K]> }) {
    this.refs = refs;
  }

  /**
   * Builds an `AfterEvent` keeper of named CSS properties structures for each CSS rule reference.
   *
   * The `[AfterEvent__symbol]` property is an alias of this one.
   *
   * @returns `AfterEvent` keeper of map of named CSS properties structures.
   */
  read(): AfterEvent<[R]>;

  /**
   * Starts sending named CSS properties structures for each CSS rule reference and updates to the given `receiver`.
   *
   * @param receiver Target receiver of map of named CSS properties structures.
   *
   * @returns Supply of maps of named CSS properties structures.
   */
  read(receiver: EventReceiver<[R]>): EventSupply;
  read(receiver?: EventReceiver<[R]>): AfterEvent<[R]> | EventSupply {

    const fromAll: AfterEvent<[{ [K in keyof R]: [StypProperties<any>] }]> = afterAll(this.refs);

    return (this.read = (fromAll.keepThru(flattenProperties) as AfterEvent<[R]>).F)(receiver);
  }

  [AfterEvent__symbol](): AfterEvent<[R]> {
    return this.read();
  }

}

function flattenProperties<R extends StypRuleRefs.Struct<R>>(
    propertiesMap: { readonly [name: string]: [StypProperties<any>] },
): R {

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
   * @typeparam R  A type of target map of named CSS properties structures.
   */
  export type Referrers<R extends Struct<R>> = {
    readonly [K in keyof R]: RefStypRule<R[K]>;
  };

}
