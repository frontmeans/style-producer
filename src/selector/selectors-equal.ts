/**
 * @packageDocumentation
 * @module @proc7ts/style-producer
 */
import { namesEqual, NamespaceDef, QualifiedName } from '@proc7ts/namespace-aliaser';
import { StypPureSelector } from './pure-selector';
import { StypSelector } from './selector';
import { isPseudoSubSelector } from './selector.impl';
import { StypSubSelector } from './sub-selector';

/**
 * Tests whether two normalized structured CSS selectors equal.
 *
 * @category CSS Rule
 * @param first  First selector.
 * @param second  Second selector.
 *
 * @returns `true` if selectors are equal, `false` otherwise.
 */
export function stypSelectorsEqual(
    first: StypSelector.Normalized | StypPureSelector.Normalized,
    second: StypSelector.Normalized | StypPureSelector.Normalized,
): boolean {
  if (first.length !== second.length) {
    return false;
  }
  return first.every((part, i) => stypSelectorPartsEqual(part, second[i]));
}

/**
 * @internal
 */
function stypSelectorPartsEqual(
    first: StypSelector.NormalizedPart | StypSelector.Combinator,
    second: StypSelector.NormalizedPart | StypSelector.Combinator,
): boolean {
  if (typeof first === 'string') {
    return first === second;
  }
  if (typeof second === 'string') {
    return false;
  }
  return namespacesEqual(first.ns, second.ns)
      && namesEqualOrAbsent(first.e, second.e)
      && namesEqualOrAbsent(first.i, second.i)
      && classesEqual(first.c, second.c)
      && subSelectorListEqual(first.u, second.u)
      && qualifiersEqual(first.$, second.$);
}

/**
 * @internal
 */
function namespacesEqual(first: string | NamespaceDef | undefined, second: string | NamespaceDef | undefined): boolean {
  if (!first || typeof first === 'string') {
    return first === second;
  }
  if (!second || typeof second === 'string') {
    return false;
  }
  return first.url === second.url;
}

/**
 * @internal
 */
function namesEqualOrAbsent(first: QualifiedName | undefined, second: QualifiedName | undefined): boolean {
  return first == null ? second == null : second != null && namesEqual(first, second);
}

/**
 * @internal
 */
function classesEqual(
    first: readonly QualifiedName[] | undefined,
    second: readonly QualifiedName[] | undefined,
): boolean {
  if (!first) {
    return !second;
  }
  if (!second) {
    return false;
  }
  return first.length === second.length && first.every((name, i) => namesEqual(name, second[i]));
}

/**
 * @internal
 */
function subSelectorListEqual(
    first: readonly StypSubSelector.Normalized[] | undefined,
    second: readonly StypSubSelector.Normalized[] | undefined,
): boolean {
  if (!first) {
    return !second;
  }
  if (!second) {
    return false;
  }
  return first.length === second.length && first.every((sub, i) => subSelectorsEqual(sub, second[i]));
}

/**
 * @internal
 */
function subSelectorsEqual(
    first: StypSubSelector.Normalized,
    second: StypSubSelector.Normalized,
): boolean {
  if (first.length !== second.length) {
    return false;
  }
  if (isPseudoSubSelector(first)) {
    return first.every(
        (p, i) => i < 2
            ? p === second[i]
            : stypSelectorsEqual(
                p as StypSubSelector.NormalizedParameter,
                second[i] as StypSubSelector.NormalizedParameter,
            ),
    );
  }
  return first.every((str, i) => str === second[i]);
}

/**
 * @internal
 */
function qualifiersEqual(first: readonly string[] | undefined, second: readonly string[] | undefined): boolean {
  if (!first) {
    return !second;
  }
  if (!second) {
    return false;
  }
  return first.length === second.length && first.every((qualifier, i) => qualifier === second[i]);
}
