import { compareNames, isQualifiedName, QualifiedName } from '@proc7ts/namespace-aliaser';
import { flatMapIt } from '@proc7ts/push-iterator';
import { isNotEmptyArray, isReadonlyArray } from '../internal';
import { StypPureSelector } from './pure-selector';
import { StypRuleKey } from './rule-key';
import { StypSelector } from './selector';
import { StypSubSelector } from './sub-selector';

/**
 * @internal
 */
export function isCombinator(
    item: string | StypSelector.Part | StypSelector.Combinator,
): item is StypSelector.Combinator {
  return item === '>' || item === '+' || item === '~';
}

/**
 * @internal
 */
export function normalizeStypSelector(selector: StypPureSelector.NormalizedPart): [StypPureSelector.NormalizedPart];

/**
 * @internal
 */
export function normalizeStypSelector(selector: StypSelector.NormalizedPart): [StypSelector.NormalizedPart];

/**
 * @internal
 */
export function normalizeStypSelector(selector: StypPureSelector): StypPureSelector.Normalized;

/**
 * @internal
 */
export function normalizeStypSelector(selector: StypSelector): StypSelector.Normalized;

export function normalizeStypSelector(selector: StypSelector): StypSelector.Normalized {
  if (!isReadonlyArray(selector)) {
    return [normalizeKey(selector)];
  }

  const normalized: StypSelector.Mutable = [];
  let combinator: StypSelector.Combinator | undefined;

  for (const item of selector) {

    const prevCombinator = combinator;

    if (combinator) {
      normalized.push(combinator);
      combinator = undefined;
    }

    let part: StypSelector.NormalizedPart;

    if (isCombinator(item)) {
      combinator = item;
      if (!prevCombinator) {
        continue;
      }
      part = {};
    } else {
      part = normalizeKey(item);
    }

    normalized.push(part);
  }
  if (combinator) {
    normalized.push(combinator, {});
  }

  return normalized;
}

function normalizeKey(key: StypSelector.Part | string): StypSelector.NormalizedPart {
  if (typeof key === 'string') {
    if (!key) {
      return {};
    }
    return { s: key };
  }
  return normalizeStypSelectorPart(key);
}

/**
 * @internal
 */
export function normalizeStypSelectorPart(part: StypSelector.Part): StypSelector.NormalizedPart {

  const ns = part.ns || undefined;
  const i = part.i || undefined;
  const c = normalizeClasses(part.c);
  const u = normalizeSubSelectors(part.u);

  return {
    ns,
    e: (part.e !== '*' || !ns && !i && !c && u && isPseudoSubSelector(u[0])) && part.e || undefined,
    i,
    c,
    u,
    s: part.s || undefined,
    $: normalizeQualifiers(part.$),
  };
}

function normalizeClasses(
    classes: QualifiedName | readonly QualifiedName[] | undefined,
): readonly [QualifiedName, ...QualifiedName[]] | undefined {
  if (!classes) {
    return;
  }
  if (isQualifiedName(classes)) {
    return [classes];
  }

  const result = classes.filter(c => !!c);

  return isNotEmptyArray(result) ? result.sort(compareNames) : undefined;
}

function normalizeSubSelectors(
    subs: StypSubSelector | readonly StypSubSelector[] | undefined,
): readonly [StypSubSelector.Normalized, ...StypSubSelector.Normalized[]] | undefined {
  if (!subs) {
    return;
  }
  if (/*#__INLINE__*/ isSubSelectorsArray(subs)) {

    const result = subs.map(normalizeSubSelector);

    return isNotEmptyArray(result) ? result : undefined;
  }

  return [normalizeSubSelector(subs)];
}

function isSubSelectorsArray(
    subs: StypSubSelector | readonly StypSubSelector[],
): subs is readonly StypSubSelector[] {
  return typeof subs[0] !== 'string';
}

function normalizeSubSelector(sub: StypSubSelector): StypSubSelector.Normalized {
  if (!isPseudoSubSelector(sub)) {
    return sub;
  }
  if (sub.length < 3) {
    return sub as StypSubSelector.Normalized;
  }

  const [prefix, name, ...params] = sub;

  if (/*#__INLINE__*/ isSubSelectorParametersArray(params)) {
    return [prefix, name, ...params.map(normalizeStypSelector)];
  }

  return [prefix, name, normalizeStypSelector(params)];
}

/**
 * @internal
 */
export function isPseudoSubSelector(sub: StypSubSelector.Normalized): sub is StypSubSelector.NormalizedPseudo;

/**
 * @internal
 */
export function isPseudoSubSelector(sub: StypSubSelector): sub is StypSubSelector.Pseudo;

export function isPseudoSubSelector(sub: StypSubSelector): sub is StypSubSelector.Pseudo {
  return sub.length > 1 && (sub[0] === ':' || sub[0] === '::');
}

function isSubSelectorParametersArray(
    param: StypSubSelector.Parameter | readonly StypSubSelector.Parameter[],
): param is readonly StypSubSelector.Parameter[] {
  return isReadonlyArray(param[0]);
}

function normalizeQualifiers(
    qualifiers: string | readonly string[] | undefined,
): readonly [string, ...string[]] | undefined {
  if (!qualifiers) {
    return;
  }

  if (!isReadonlyArray(qualifiers)) {
    qualifiers = [...exposeQualifier(qualifiers)];
  } else {
    qualifiers = [...new Set(flatMapIt(qualifiers, exposeQualifier))].sort();
  }

  return isNotEmptyArray(qualifiers) ? qualifiers : undefined;
}

const noQualifiers: ReadonlySet<string> = new Set();

function exposeQualifier(qualifier: string): ReadonlySet<string> {
  if (!qualifier) {
    return noQualifiers;
  }

  const eqIdx = qualifier.indexOf('=');
  const name = eqIdx < 0 ? qualifier : qualifier.substring(0, eqIdx);
  const exposed = new Set<string>();
  let lastExposed: string | undefined;

  for (const part of name.split(':')) {
    if (lastExposed) {
      lastExposed += ':' + part;
    } else {
      lastExposed = part;
    }
    exposed.add(lastExposed);
  }
  if (eqIdx >= 0) {
    exposed.add(qualifier);
  }

  return exposed;
}

const noKeyAndTail: [[]] = [[]];

/**
 * @internal
 */
export function stypRuleKeyAndTail(
    selector: StypSelector.Normalized,
): readonly [[]] | readonly [StypRuleKey.Nested, StypSelector.Normalized?] {
  if (!selector.length) {
    return noKeyAndTail;
  }

  let i = 0;
  let combinator: StypSelector.Combinator | undefined;

  for (;;) {

    const part = selector[i++];

    if (isCombinator(part)) {
      combinator = part;
      continue;
    }

    const key: StypRuleKey = combinator ? [combinator, part] : [part];

    return [key, selector.slice(i)];
  }
}

const rootSelector: StypSelector.Normalized = [];

/**
 * @internal
 */
export function stypOuterSelector(
    selector: StypSelector.Normalized,
): StypSelector.Normalized | undefined {

  let i = selector.length - 1;

  if (i <= 0) {
    return i ? undefined : rootSelector;
  }

  do {
    --i;
    switch (selector[i]) {
    case '>':
      return selector.slice(0, i);
    case '+':
    case '~':
      --i;
      continue;
    default:
      return selector.slice(0, i + 1);
    }
  } while (i > 0);

  return;
}
