import { stypSelector, StypSelector } from '../selector';
import { StypProperties } from './properties';
import { stypRuleKey } from '../selector/selector-text.impl';
import { mergeStypProperties, noStypPropertiesSpec, stypPropertiesBySpec } from './properties.impl';
import { isCombinator } from '../selector/selector.impl';
import { StypRule as StypRule_ } from './rule';

class EmptyStypRule extends StypRule_ {

  get spec() {
    return noStypPropertiesSpec;
  }

  get empty() {
    return true;
  }

  constructor(
      readonly root: StypRule,
      readonly selector: StypSelector.Normalized) {
    super();
  }

  rule(selector: StypSelector): StypRule_ {

    const _selector = stypSelector(selector);

    if (!_selector.length) {
      return this;
    }

    return new EmptyStypRule(this.root, [...this.selector, ..._selector]);
  }

  add(properties: StypProperties.Spec) {
    extendRule(this.root, this.selector, properties);
    return this.root.rule(this.selector);
  }

}

/**
 * @internal
 */
export class StypRule extends StypRule_ {

  private readonly _root: StypRule;
  private readonly _selector: StypSelector.Normalized;
  _spec: StypProperties.Builder;
  readonly _rules = new Map<string, StypRule>();

  get root(): StypRule {
    return this._root;
  }

  get selector(): StypSelector.Normalized {
    return this._selector;
  }

  get empty() {
    return this._spec === noStypPropertiesSpec;
  }

  get spec(): StypProperties.Builder {
    return this._spec;
  }

  get rules(): Iterable<StypRule> {
    return this._rules.values();
  }

  constructor(
      root: StypRule | undefined,
      selector: StypSelector.Normalized,
      spec: StypProperties.Builder = noStypPropertiesSpec) {
    super();
    this._root = root || this;
    this._selector = selector;
    this._spec = spec;
  }

  rule(selector: StypSelector): StypRule_ {

    const sel = stypSelector(selector);
    const [keySelector, tail] = keySelectorAndTail(sel);

    if (!tail) {
      return this;
    }

    const found = this._rules.get(stypRuleKey(keySelector));

    if (!found) {
      return new EmptyStypRule(this.root, [...this.selector, ...sel]);
    }

    return found.rule(tail);
  }

  add(properties: StypProperties.Spec): this {
    extendRule(this, [], properties);
    return this;
  }

}

function extendRule(
    rule: StypRule,
    targetSelector: StypSelector.Normalized,
    properties: StypProperties.Spec): void {

  const [dirSelector, tail] = keySelectorAndTail(targetSelector);

  if (!tail) {
    // Target rule
    rule._spec = extendSpec(rule, properties);
    return;
  }

  const dirKey = stypRuleKey(dirSelector);
  const found = rule._rules.get(dirKey);

  if (found) {
    return extendRule(found, tail, properties);
  }

  const newNested = new StypRule(rule.root, [...rule.selector, ...dirSelector]);

  rule._rules.set(dirKey, newNested);

  extendRule(newNested, tail, properties);
}

function extendSpec(rule: StypRule, properties: StypProperties.Spec): StypProperties.Builder {
  if (rule.empty) {
    return r => stypPropertiesBySpec(r, properties);
  }

  const old = rule._spec;

  return r => mergeStypProperties(old(r), stypPropertiesBySpec(r, properties));
}

function keySelectorAndTail(selector: StypSelector.Normalized):
    [StypSelector.Normalized, StypSelector.Normalized?] {
  if (!selector.length) {
    return [selector];
  }

  let i = 0;

  for (;;) {

    const part = selector[i++];

    if (isCombinator(part)) {
      continue;
    }

    return [selector.slice(0, i), selector.slice(i)];
  }
}
