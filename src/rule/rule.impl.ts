import { StypQuery, stypQuery, StypRuleKey, stypSelector, StypSelector, stypSelectorMatches } from '../selector';
import { StypProperties } from './properties';
import { stypRuleKeyText } from '../selector/selector-text.impl';
import { mergeStypProperties, noStypPropertiesSpec, stypPropertiesBySpec } from './properties.impl';
import { stypOuterSelector, stypRuleKeyAndTail } from '../selector/selector.impl';
import { StypRule as StypRule_, StypRuleHierarchy, StypRuleList } from './rule';
import {
  AfterEvent,
  afterEventFrom,
  EventEmitter,
  eventInterest,
  noEventInterest,
  OnEvent,
  onEventBy,
  trackValue,
  ValueTracker
} from 'fun-events';
import { filterIt, itsIterable } from 'a-iterable';

class GrabbedRules extends StypRuleList {

  readonly onUpdate: OnEvent<[StypRule_[], StypRule_[]]>;
  readonly read: AfterEvent<[GrabbedRules]>;
  readonly [Symbol.iterator]: () => IterableIterator<StypRule_>;

  constructor(list: StypRuleList, query: StypQuery.Normalized) {
    super();

    const _emitter = new EventEmitter<[StypRule_[], StypRule_[]]>();
    let _listInterest = noEventInterest();
    let _rules: Set<StypRule_> | undefined;

    this.onUpdate = onEventBy(receiver => {
      if (!_rules) {
        // This is a first receiver.
        // Start tracking the list changes.

        const rules = _rules = new Set(_buildList());

        _listInterest = list.onUpdate((added, removed) => {
          added = added.filter(_matchingRule);
          removed = removed.filter(_matchingRule);
          if (removed.length || added.length) {
            removed.forEach(rule => rules.delete(rule));
            added.forEach(rule => rules.add(rule));
            _emitter.send(added, removed);
          }
        });
      }

      const interest = _emitter.on(receiver);

      return eventInterest(reason => {
        interest.off(reason);
        if (!_emitter.size) {
          // No more receivers left.
          // Stop tracking the list changes.
          _rules = undefined;
          _listInterest.off(reason);
        }
      }).needs(interest).needs(_listInterest);
    });
    this.read = afterEventFrom<[GrabbedRules]>(this.onUpdate.thru(() => this), [this]);
    this[Symbol.iterator] = () => {
      if (_rules) {
        // List changes are tracked.
        return _rules.values();
      }
      // List changes are not currently tracked.
      // Request the rules explicitly.
      return itsIterable(_buildList());
    };

    function _buildList(): Iterable<StypRule_> {
      return filterIt(list, _matchingRule);
    }

    function _matchingRule(rule: StypRule_): boolean {
      return stypSelectorMatches(rule.selector, query);
    }
  }

  grab(query: StypQuery.Element | StypQuery.NonElement): StypRuleList {
    return grabRules(this, query);
  }

}

function grabRules(list: StypRuleList, query: StypQuery): StypRuleList {

  const q = stypQuery(query);

  return q ? new GrabbedRules(list, q) : list;
}

class AllRules extends StypRuleHierarchy {

  private readonly _updates = new EventEmitter<[StypRule[], StypRule[]]>();
  readonly read: AfterEvent<[AllRules]>;

  get onUpdate() {
    return this._updates.on;
  }

  constructor(private readonly _root: StypRule, readonly nested: NestedRules) {
    super();
    this.read = afterEventFrom<[AllRules]>(this._updates.on.thru(() => this), [this]);
  }

  [Symbol.iterator](): IterableIterator<StypRule> {
    return iterateAllRules(this._root);
  }

  grab(query: StypQuery.Element | StypQuery.NonElement): StypRuleList {
    return grabRules(this, query);
  }

  add(selector: StypSelector, properties?: StypProperties.Spec): StypRule {
    return extendRule(this._root, stypSelector(selector), properties, true);
  }

  get(selector: StypSelector): StypRule | undefined {

    const sel = stypSelector(selector);
    const [key, tail] = stypRuleKeyAndTail(sel);

    if (!tail) {
      return this._root;
    }

    const found = this.nested._rule(stypRuleKeyText(key));

    if (!found) {
      return;
    }

    return found.rules.get(tail);
  }

  _add(rule: StypRule, sendUpdate: boolean) {
    rule.rules.onUpdate((added, removed) => this._updates.send(added, removed));
    if (sendUpdate) {
      this._updates.send(allRules(rule), []);
    }
  }

  _remove(reason?: any) {

    const removed = allRules(this._root);

    this._updates.send([], removed);
    removed.forEach(rule => {
      rule.rules._updates.done(reason);
      rule._spec.done(reason);
    });
  }

}

function allRules(rule: StypRule): StypRule[] {
  return [...iterateAllRules(rule)];
}

function *iterateAllRules(rule: StypRule): IterableIterator<StypRule> {
  yield rule;
  for (const nested of rule.rules.nested) {
    yield *allRules(nested);
  }
}

class NestedRules extends StypRuleList {

  readonly _all: AllRules;
  readonly read: AfterEvent<[NestedRules]>;
  private readonly _updates = new EventEmitter<[StypRule[], StypRule[]]>();
  private readonly _byKey = new Map<string, StypRule>();

  get onUpdate() {
    return this._updates.on;
  }

  constructor(root: StypRule) {
    super();
    this._all = new AllRules(root, this);
    this.read = afterEventFrom<[NestedRules]>(this._updates.on.thru(() => this), [this]);
  }

  [Symbol.iterator](): IterableIterator<StypRule> {
    return this._byKey.values();
  }

  grab(query: StypQuery.Element | StypQuery.NonElement): StypRuleList {
    return grabRules(this, query);
  }

  _rule(key: string): StypRule | undefined {
    return this._byKey.get(key);
  }

  _add(key: string, rule: StypRule, sendUpdate: boolean) {
    this._byKey.set(key, rule);
    rule.rules.onUpdate((added, removed) => {
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

  get empty() {
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
      spec: StypProperties.Builder = noStypPropertiesSpec) {
    super();
    this._root = root || this;
    this._selector = selector;
    this._key = key;
    this._spec = trackValue(spec);
    this._read = afterEventFrom(this._spec.read.dig(s => s(this)));
    this._nested = new NestedRules(this);
  }

  set(properties?: StypProperties.Spec): this {
    this._spec.it = properties ? r => stypPropertiesBySpec(r, properties) : noStypPropertiesSpec;
    return this;
  }

  remove(reason?: any) {
    this.rules._remove(reason);
    return this;
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
