import { stypSelector, StypSelector } from '../selector';
import { StypProperties } from './properties';
import { stypRuleKey } from '../selector/selector-text.impl';
import { mergeStypProperties, noStypPropertiesSpec, stypPropertiesBySpec } from './properties.impl';
import { isCombinator } from '../selector/selector.impl';
import { StypRule as StypRule_ } from './rule';
import { AfterEvent, afterEventFrom, trackValue, ValueTracker } from 'fun-events';

/**
 * @internal
 */
export class StypRule extends StypRule_ {

  private readonly _root: StypRule;
  private readonly _selector: StypSelector.Normalized;
  readonly _spec: ValueTracker<StypProperties.Builder>;
  private readonly _read: AfterEvent<[StypProperties]>;
  readonly _rules = new Map<string, StypRule>();

  get root(): StypRule {
    return this._root;
  }

  get selector(): StypSelector.Normalized {
    return this._selector;
  }

  get empty() {
    return this._spec.it === noStypPropertiesSpec;
  }

  get read(): AfterEvent<[StypProperties]> {
    return this._read;
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
    this._spec = trackValue(spec);
    this._read = afterEventFrom(this._spec.read.dig(s => s(this)));
  }

  rule(selector: StypSelector): StypRule | undefined {

    const sel = stypSelector(selector);
    const [keySelector, tail] = keySelectorAndTail(sel);

    if (!tail) {
      return this;
    }

    const found = this._rules.get(stypRuleKey(keySelector));

    if (!found) {
      return;
    }

    return found.rule(tail);
  }

  add(properties: StypProperties.Spec): this {
    return this.addRule([], properties) as this;
  }

  addRule(selector: StypSelector, properties?: StypProperties.Spec): StypRule {
    return extendRule(this, stypSelector(selector), properties);
  }

}

function extendRule(
    rule: StypRule,
    targetSelector: StypSelector.Normalized,
    properties?: StypProperties.Spec): StypRule {

  const [dirSelector, tail] = keySelectorAndTail(targetSelector);

  if (!tail) {
    // Target rule
    rule._spec.it = extendSpec(rule, properties);
    return rule;
  }

  const dirKey = stypRuleKey(dirSelector);
  const found = rule._rules.get(dirKey);

  if (found) {
    return extendRule(found, tail, properties);
  }

  const newNested = new StypRule(rule.root, [...rule.selector, ...dirSelector]);

  rule._rules.set(dirKey, newNested);

  return extendRule(newNested, tail, properties);
}

function extendSpec(rule: StypRule, properties?: StypProperties.Spec): StypProperties.Builder {

  const oldSpec = rule._spec.it;

  if (!properties) {
    return oldSpec;
  }

  if (rule.empty) {
    return r => stypPropertiesBySpec(r, properties);
  }

  return r => mergeStypProperties(oldSpec(r), stypPropertiesBySpec(r, properties));
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
