import { NameInNamespace, NamespaceDef } from '../ns';
import { StypSelector } from './selector';

/**
 * Tests whether two normalized structured CSS selectors equal.
 *
 * @param first First selector.
 * @param second Second selector.
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
      && namesEqual(first.e, second.e)
      && namesEqual(first.i, second.i)
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

function namesEqual(first: NameInNamespace | undefined, second: NameInNamespace | undefined): boolean {
  if (!first || typeof first === 'string') {
    return first === second;
  }
  if (!second || typeof second === 'string') {
    return false;
  }
  return first[0] === second[0] && first[1].url === second[1].url;
}

function classesEqual(
    first: readonly (string | NameInNamespace)[] | undefined,
    second: readonly (string | NameInNamespace)[] | undefined): boolean {
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
