import { itsIterable } from 'a-iterable';
import { valueProvider, valuesProvider } from 'call-thru';
import {
  AfterEvent,
  afterEventBy,
  afterSupplied,
  EventEmitter,
  nextOnEvent,
  OnEvent,
  OnEvent__symbol,
  trackValue,
  ValueTracker,
} from 'fun-events';
import { StypQuery, StypRuleKey, stypSelector, StypSelector } from '../selector';
import { stypRuleKeyText } from '../selector/selector-text.impl';
import { stypOuterSelector, stypRuleKeyAndTail } from '../selector/selector.impl';
import { StypProperties } from './properties';
import { mergeStypProperties, noStypPropertiesSpec, stypPropertiesBySpec } from './properties.impl';
import { StypRule as StypRule_, StypRuleHierarchy, StypRuleList } from './rule';
import { StypRules } from './rules';
import { grabRules, Rules } from './rules.impl';

class AllRules extends StypRuleHierarchy {

  private readonly _updates = new EventEmitter<[StypRule[], StypRule[]]>();
  readonly self: StypRuleList;
  readonly read: AfterEvent<[AllRules]>;

  get onUpdate(): OnEvent<[StypRule[], StypRule[]]> {
    return this._updates.on;
  }

  constructor(private readonly _root: StypRule, readonly nested: NestedRules) {
    super();
    this.self = selfRuleList(_root, this);
    this.read = afterSupplied<[AllRules]>(this._updates.on.thru(valueProvider(this)), valuesProvider(this));
  }

  [Symbol.iterator](): IterableIterator<StypRule> {
    return iterateAllRules(this._root);
  }

  grab(query: StypQuery): StypRuleList {
    return grabRules(this, query);
  }

  add(selector: StypSelector, properties?: StypProperties.Spec): StypRule {
    return extendRule(this._root, stypSelector(selector), properties, true);
  }

  get(selector: StypSelector): StypRule | undefined {
    return this._get(stypSelector(selector));
  }

  private _get(selector: StypSelector.Normalized): StypRule | undefined {

    const [key, tail] = stypRuleKeyAndTail(selector);

    if (!tail) {
      return this._root;
    }

    const found = this.nested._rule(stypRuleKeyText(key));

    if (!found) {
      return;
    }

    return found.rules.get(tail);
  }

  watch(selector: StypSelector): AfterEvent<[StypProperties]> {

    const request = stypSelector(selector);

    return afterEventBy<[StypProperties]>(receiver => {

      const tracker = trackValue<StypProperties>({});
      const propertiesSupply = this.read.consume(() => {

        const found = this._get(request);

        return found && found
            .read(properties => tracker.it = properties)
            .whenOff(() => tracker.it = {});
      });

      const supply = tracker.read(receiver);

      propertiesSupply.needs(supply);

      return supply;
    }).share();
  }

  _add(rule: StypRule, sendUpdate: boolean): void {
    rule.rules.onUpdate((added, removed) => this._updates.send(added, removed));
    if (sendUpdate) {
      this._updates.send(allRules(rule), []);
    }
  }

  _remove(reason?: any): void {

    const removed = allRules(this._root);

    this._updates.send([], removed);
    removed.forEach(rule => {
      rule.rules._updates.done(reason);
      rule._spec.done(reason);
    });
  }

}

function selfRuleList(rule: StypRule, all: AllRules): StypRuleList {

  const onUpdate = new EventEmitter<[StypRule[], StypRule[]]>();
  const rules = [rule];

  all.onUpdate((_added, removed) => {
    if (removed[0] === rule) {
      rules.length = 0;
      onUpdate.send([], [rule]);
    }
  }).whenOff(reason => onUpdate.done(reason));

  class Self implements StypRules {

    get [OnEvent__symbol](): OnEvent<[StypRule[], StypRule[]]> {
      return onUpdate.on;
    }

    [Symbol.iterator](): IterableIterator<StypRule> {
      return itsIterable(rules);
    }

  }

  return new Rules(new Self());
}

function allRules(rule: StypRule): StypRule[] {
  return Array.from(iterateAllRules(rule));
}

function *iterateAllRules(rule: StypRule): IterableIterator<StypRule> {
  yield rule;
  for (const nested of rule.rules.nested) {
    yield* allRules(nested);
  }
}

class NestedRules extends StypRuleList {

  readonly _all: AllRules;
  readonly read: AfterEvent<[NestedRules]>;
  private readonly _updates = new EventEmitter<[StypRule[], StypRule[]]>();
  private readonly _byKey = new Map<string, StypRule>();

  get onUpdate(): OnEvent<[StypRule[], StypRule[]]> {
    return this._updates.on;
  }

  constructor(root: StypRule) {
    super();
    this._all = new AllRules(root, this);
    this.read = afterSupplied<[NestedRules]>(this._updates.on.thru(valueProvider(this)), valuesProvider(this));
  }

  [Symbol.iterator](): IterableIterator<StypRule> {
    return this._byKey.values();
  }

  grab(query: StypQuery): StypRuleList {
    return grabRules(this, query);
  }

  _rule(key: string): StypRule | undefined {
    return this._byKey.get(key);
  }

  _add(key: string, rule: StypRule, sendUpdate: boolean): void {
    this._byKey.set(key, rule);
    rule.rules.onUpdate((_added, removed) => {
      if (removed[0] === rule) {
        this._byKey.delete(key);
        this._updates.send([], [rule]);
      }
    });
    if (sendUpdate) {
      this._updates.send([rule], []);
    }
    this._all._add(rule, sendUpdate);
  }

}

/**
 * @internal
 */
export class StypRule extends StypRule_ {

  private readonly _root: StypRule;
  private _outer?: StypRule | null;
  private readonly _selector: StypSelector.Normalized;
  private readonly _key: StypRuleKey;
  readonly _spec: ValueTracker<StypProperties.Builder>;
  private readonly _read: AfterEvent<[StypProperties]>;
  private readonly _nested: NestedRules;

  get root(): StypRule {
    return this._root;
  }

  get outer(): StypRule | null {
    if (this._outer !== undefined) {
      return this._outer;
    }

    const outerSelector = stypOuterSelector(this.selector);

    return this._outer = outerSelector && this.root.rules.get(outerSelector) || null;
  }

  get selector(): StypSelector.Normalized {
    return this._selector;
  }

  get key(): StypRuleKey {
    return this._key;
  }

  get empty(): boolean {
    return this._spec.it === noStypPropertiesSpec;
  }

  get read(): AfterEvent<[StypProperties]> {
    return this._read;
  }

  get rules(): AllRules {
    return this._nested._all;
  }

  constructor(
      root: StypRule | undefined,
      selector: StypSelector.Normalized,
      key: StypRuleKey,
      spec: StypProperties.Builder = noStypPropertiesSpec,
  ) {
    super();
    this._root = root || this;
    this._selector = selector;
    this._key = key;
    this._spec = trackValue(spec);
    this._read = this._spec.read.keep.thru(builder => nextOnEvent(builder(this)));
    this._nested = new NestedRules(this);
  }

  set(properties?: StypProperties.Spec): this {
    this._spec.it = properties ? r => stypPropertiesBySpec(r, properties) : noStypPropertiesSpec;
    return this;
  }

  remove(reason?: any): this {
    this.rules._remove(reason);
    return this;
  }

}

function extendRule(
    rule: StypRule,
    targetSelector: StypSelector.Normalized,
    properties: StypProperties.Spec | undefined,
    sendUpdate: boolean,
): StypRule {

  const [key, tail] = stypRuleKeyAndTail(targetSelector);

  if (!tail) {
    // Target rule
    rule._spec.it = extendSpec(rule, properties);
    return rule;
  }

  const keyText = stypRuleKeyText(key);
  const found = rule.rules.nested._rule(keyText);

  if (found) {
    return extendRule(found, tail, properties, sendUpdate);
  }

  const newNested = new StypRule(rule.root, [...rule.selector, ...key], key);
  const result = extendRule(newNested, tail, properties, false); // Send only a top-level update

  rule.rules.nested._add(keyText, newNested, sendUpdate);

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
