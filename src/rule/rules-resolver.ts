import { StypRule } from './rule';
import { RefStypRule, StypRuleRef } from './rule-ref';

/**
 * A resolver of named CSS rule referrers to corresponding rule references.
 *
 * @typeparam R A type of resolved CSS rule references.
 * @param root A root CSS rule the references will be relative to.
 *
 * @returns Resolved CSS rule references.
 */
export type StypRulesResolver<R extends StypRulesResolver.Refs<R>> = (this: void, root: StypRule) => R;

export namespace StypRulesResolver {

  /**
   * CSS rule referrers map.
   *
   * This is a named map of CSS rule referrers. These referrers are resolved to the same named CSS rule references.
   *
   * @typeparam R A type of resolved CSS rule references.
   */
  export type Referrers<R extends Refs> = {
    readonly [K in keyof R]: R[K] extends StypRuleRef<infer T> ? RefStypRule<T> : never;
  };

  /**
   * Resolved CSS rule references.
   *
   * This is a named map of CSS rule references each of which is resolved by corresponding referrer.
   */
  export type Refs<R = { readonly [name: string]: StypRuleRef<any> }> = {
    readonly [K in keyof R]: R[K] & StypRuleRef<any>;
  };

}

/**
 * Resolves the given CSS rule `referrers`.
 *
 * @typeparam R A type of resolved CSS rule references.
 * @param referrers Named CSS rule referrers to resolve.
 * @param root Root CSS rule the resolved rule references will be relative to.
 *
 * @returns Resolved CSS rule references.
 */
export function resolveStypRules<R extends StypRulesResolver.Refs<R>>(
    referrers: StypRulesResolver.Referrers<R>,
    root: StypRule): R;

export function resolveStypRules<R extends StypRulesResolver.Refs<R>>(
    referrers: { readonly [name: string]: RefStypRule<any> },
    root: StypRule): R {

  const result: { [K in keyof R]?: StypRuleRef<any> } = {};

  for (const key of Object.keys(referrers)) {
    result[key as keyof R] = referrers[key](root) as StypRuleRef<any>;
  }

  return result as R;
}

/**
 * Constructs a resolver of names CSS rule referrers.
 *
 * @typeparam R A type of resolved CSS rule references.
 * @param referrers Named CSS rule referrers to resolve.
 *
 * @returns A function that resolves the CSS rule references.
 */
export function stypRulesResolver<R extends StypRulesResolver.Refs<R>>(
    referrers: StypRulesResolver.Referrers<R>): StypRulesResolver<R> {
  return resolveStypRules.bind<void, StypRulesResolver.Referrers<R>, [StypRule], R>(undefined, referrers);
}
