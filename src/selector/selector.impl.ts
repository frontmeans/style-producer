import { StypSelector } from './selector';
import { StypRuleKey } from './rule-key';
import { flatMapIt, itsReduction } from 'a-iterable';

/**
 * @internal
 */
export function isCombinator(item: string | StypSelector.Part | StypSelector.Combinator):
    item is StypSelector.Combinator {
  return item === '>' || item === '+' || item === '~';
}

/**
 * @internal
 */
export function normalizeStypSelectorPart(part: StypSelector.Part): StypSelector.NormalizedPart {
  return {
    ns: part.ns || undefined,
    e: normalizeElement(part.e),
    i: part.i || undefined,
    s: part.s || undefined,
    c: normalizeClasses(part.c),
    $: normalizeQualifiers(part.$)
  };
}

function normalizeElement(e: string | undefined): string | undefined {
  return e !== '*' && e || undefined;
}

function normalizeClasses(classes: string | string[] | undefined): [string, ...string[]] | undefined {
  if (!classes) {
    return;
  }
  if (!Array.isArray(classes)) {
    return [classes];
  }

  classes = classes.filter(c => !!c);

  return classes.length ? classes.sort() as [string, ...string[]] : undefined;
}

function normalizeQualifiers(qualifiers: string | string[] | undefined): [string, ...string[]] | undefined {
  if (!qualifiers) {
    return;
  }

  if (!Array.isArray(qualifiers)) {
    qualifiers = [...exposeQualifier(qualifiers)];
  } else {
    qualifiers = [
      ...itsReduction(
          flatMapIt(qualifiers, exposeQualifier),
          (set, qualifier) => set.add(qualifier),
          new Set<string>())
    ].sort();
  }

  return qualifiers.length ? qualifiers as [string, ...string[]] : undefined;
}

const noQualifiers: Set<string> = new Set();

function exposeQualifier(qualifier: string): Set<string> {
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
    selector: StypSelector.Normalized):
    [[]] | [StypRuleKey.Nested, StypSelector.Normalized?] {
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
export function stypOuterSelector(selector: StypSelector.Normalized): StypSelector.Normalized | undefined {

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
