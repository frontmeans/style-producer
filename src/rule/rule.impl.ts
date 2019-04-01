import { StypRuleKey, stypSelector, StypSelector } from '../selector';
import { StypProperties } from './properties';
import { stypRuleKeyText } from '../selector/selector-text.impl';
import { mergeStypProperties, noStypPropertiesSpec, stypPropertiesBySpec } from './properties.impl';
import { stypRuleKeyAndTail } from '../selector/selector.impl';
import { StypRule as StypRule_, StypRuleList } from './rule';
import { AfterEvent, afterEventFrom, EventEmitter, trackValue, ValueTracker } from 'fun-events';

class AllRules extends StypRuleList {

  private readonly _updates = new EventEmitter<[StypRule[], StypRule[]]>();
  readonly read: AfterEvent<[AllRules]>;

  constructor(private readonly _root: StypRule) {
    super();
    this.read = afterEventFrom<[AllRules]>(this._updates.on.thru(() => this), [this]);
  }

  get onUpdate() {
    return this._updates.on;
  }

  [Symbol.iterator](): IterableIterator<StypRule> {
    return iterateAllRules(this._root);
  }

  _add(rule: StypRule, sendUpdate: boolean) {
    rule.all.onUpdate((added, removed) => this._updates.send(added, removed));
    if (sendUpdate) {
      this._updates.send(allRules(rule), []);
    }
  }

  _remove() {
    this._updates.send([], [...allRules(this._root)]);
    allRules(this._root).forEach(rule => rule.all._updates.done());
  }

}

function allRules(rule: StypRule): StypRule[] {
  return [...iterateAllRules(rule)];
}

function *iterateAllRules(rule: StypRule): IterableIterator<StypRule> {
  yield rule;
  for (const nested of rule.rules) {
    yield *allRules(nested);
  }
}

/**
 * @internal
 */
export class StypRule extends StypRule_ {

  private readonly _root: StypRule;
  private readonly _selector: StypSelector.Normalized;
  private readonly _key: StypRuleKey;
  readonly _spec: ValueTracker<StypProperties.Builder>;
  private readonly _read: AfterEvent<[StypProperties]>;
  private readonly _rules = new Map<string, StypRule>();
  private readonly _all: AllRules;

  get root(): StypRule {
    return this._root;
  }

  get selector(): StypSelector.Normalized {
    return this._selector;
  }

  get key(): StypRuleKey {
    return this._key;
  }

  get empty() {
    return this._spec.it === noStypPropertiesSpec;
  }

  get read(): AfterEvent<[StypProperties]> {
    return this._read;
  }

  get rules(): IterableIterator<StypRule> {
    return this._rules.values();
  }

  get all() {
    return this._all;
  }

  constructor(
      root: StypRule | undefined,
      selector: StypSelector.Normalized,
      key: StypRuleKey,
      spec: StypProperties.Builder = noStypPropertiesSpec) {
    super();
    this._root = root || this;
    this._selector = selector;
    this._key = key;
    this._spec = trackValue(spec);
    this._read = afterEventFrom(this._spec.read.dig(s => s(this)));
    this._all = new AllRules(this);
  }

  rule(selector: StypSelector): StypRule | undefined {

    const sel = stypSelector(selector);
    const [keySelector, tail] = stypRuleKeyAndTail(sel);

    if (!tail) {
      return this;
    }

    const found = this._rule(stypRuleKeyText(keySelector));

    if (!found) {
      return;
    }

    return found.rule(tail);
  }

  set(properties?: StypProperties.Spec): this {
    this._spec.it = properties ? r => stypPropertiesBySpec(r, properties) : noStypPropertiesSpec;
    return this;
  }

  addRule(selector: StypSelector, properties?: StypProperties.Spec): StypRule {
    return extendRule(this, stypSelector(selector), properties, true);
  }

  remove() {
    this.all._remove();
    return this;
  }

  _rule(key: string): StypRule | undefined {
    return this._rules.get(key);
  }

  _addRule(key: string, rule: StypRule, sendUpdate: boolean) {
    this._rules.set(key, rule);
    rule._all.onUpdate((added, removed) => {
      if (removed[0] === rule) {
        this._rules.delete(key);
      }
    });
    this._all._add(rule, sendUpdate);
  }

}

function extendRule(
    rule: StypRule,
    targetSelector: StypSelector.Normalized,
    properties: StypProperties.Spec | undefined,
    sendUpdate: boolean): StypRule {

  const [key, tail] = stypRuleKeyAndTail(targetSelector);

  if (!tail) {
    // Target rule
    rule._spec.it = extendSpec(rule, properties);
    return rule;
  }

  const keyText = stypRuleKeyText(key);
  const found = rule._rule(keyText);

  if (found) {
    return extendRule(found, tail, properties, sendUpdate);
  }

  const newNested = new StypRule(rule.root, [...rule.selector, ...key], key);
  const result = extendRule(newNested, tail, properties, false); // Send only a top-level update

  rule._addRule(keyText, newNested, sendUpdate);

  return result;
}

function extendSpec(rule: StypRule, properties: StypProperties.Spec | undefined): StypProperties.Builder {

  const oldSpec = rule._spec.it;

  if (!properties) {
    return oldSpec;
  }

  if (rule.empty) {
    return r => stypPropertiesBySpec(r, properties);
  }

  return r => mergeStypProperties(oldSpec(r), stypPropertiesBySpec(r, properties));
}
