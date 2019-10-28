/**
 * @module style-producer
 */
import { namesEqual, NamespaceDef, QualifiedName } from 'namespace-aliaser';
import { StypSelector } from './selector';

/**
 * Tests whether two normalized structured CSS selectors equal.
 *
 * @category CSS Rule
 * @param first  First selector.
 * @param second  Second selector.
 *
 * @returns `true` if selectors are equal, `false` otherwise.
 */
export function stypSelectorsEqual(first: StypSelector.Normalized, second: StypSelector.Normalized): boolean {
  if (first.length !== second.length) {
    return false;
  }
  return first.every((part, i) => stypSelectorPartsEqual(part, second[i]));
}

function stypSelectorPartsEqual(
    first: StypSelector.NormalizedPart | StypSelector.Combinator,
    second: StypSelector.NormalizedPart | StypSelector.Combinator): boolean {
  if (typeof first === 'string') {
    return first === second;
  }
  if (typeof second === 'string') {
    return false;
  }
  return namespacesEqual(first.ns, second.ns)
      && _namesEqual(first.e, second.e)
      && _namesEqual(first.i, second.i)
      && classesEqual(first.c, second.c)
      && qualifiersEqual(first.$, second.$);
}

function namespacesEqual(first: string | NamespaceDef | undefined, second: string | NamespaceDef | undefined): boolean {
  if (!first || typeof first === 'string') {
    return first === second;
  }
  if (!second || typeof second === 'string') {
    return false;
  }
  return first.url === second.url;
}

function _namesEqual(first: QualifiedName | undefined, second: QualifiedName | undefined): boolean {
  return first == null ? second == null : second != null && namesEqual(first, second);
}

function classesEqual(
    first: readonly QualifiedName[] | undefined,
    second: readonly QualifiedName[] | undefined): boolean {
  if (!first) {
    return !second;
  }
  if (!second) {
    return false;
  }
  return first.length === second.length && first.every((name, i) => namesEqual(name, second[i]));
}

function qualifiersEqual(first: readonly string[] | undefined, second: readonly string[] | undefined): boolean {
  if (!first) {
    return !second;
  }
  if (!second) {
    return false;
  }
  return first.length === second.length && first.every((qualifier, i) => qualifier === second[i]);
}
