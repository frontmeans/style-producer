import { DoqryPicker, doqryPicker, DoqrySelector } from '@frontmeans/doqry';
import {
  AfterEvent,
  afterEventBy,
  consumeEvents,
  digAfter,
  EventEmitter,
  mapAfter,
  OnEvent,
  OnEvent__symbol,
  shareAfter,
  trackValue,
  ValueTracker,
} from '@proc7ts/fun-events';
import { lazyValue, valueProvider } from '@proc7ts/primitives';
import {
  flatMapIt,
  itsElements,
  itsIterator,
  overElementsOf,
  overOne,
  PushIterable,
  PushIterator,
  PushIterator__symbol,
} from '@proc7ts/push-iterator';
import { StypQuery, StypRuleKey } from '../query';
import { stypOuterSelector, stypRuleKeyAndTail } from '../query/query.impl';
import { stypRuleKeyText } from '../query/rule-key-text.impl';
import { StypProperties } from './properties';
import { mergeStypProperties, noStypPropertiesSpec, stypPropertiesBySpec } from './properties.impl';
import { StypRule, StypRuleHierarchy, StypRuleList } from './rule';
import { StypRules } from './rules';
import { StypRuleList$, StypRuleList$grab } from './rules.impl';

class StypRule$AllRules extends StypRuleHierarchy implements PushIterable<StypRule$> {

  readonly self: StypRuleList;
  readonly read: AfterEvent<[StypRule$AllRules]>;
  private readonly _updates = new EventEmitter<[StypRule$[], StypRule$[]]>();
  private readonly _it: () => PushIterable<StypRule$>;

  constructor(private readonly _root: StypRule$, readonly nested: StypRule$NestedRules) {
    super();
    this.self = StypRuleList$self(_root, this);
    this._it = lazyValue(() => StypRule$allRules(_root));

    const returnSelf = valueProvider(this);

    this.read = this._updates.on.do(mapAfter(returnSelf, returnSelf));
  }

  get onUpdate(): OnEvent<[StypRule$[], StypRule$[]]> {
    return this._updates.on;
  }

  [Symbol.iterator](): PushIterator<StypRule$> {
    return this[PushIterator__symbol]();
  }

  [PushIterator__symbol](accept?: PushIterator.Acceptor<StypRule$>): PushIterator<StypRule$> {
    return this._it()[PushIterator__symbol](accept);
  }

  grab(query: StypQuery): StypRuleList {
    return StypRuleList$grab(this, query);
  }

  add(selector: DoqrySelector, properties?: StypProperties.Spec): StypRule$ {
    return StypRule$extend(this._root, doqryPicker(selector), properties, true);
  }

  get(selector: DoqrySelector): StypRule$ | undefined {
    return this._get(doqryPicker(selector));
  }

  private _get(selector: DoqryPicker): StypRule$ | undefined {

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

  watch(selector: DoqrySelector): AfterEvent<[StypProperties]> {

    const request = doqryPicker(selector);

    return afterEventBy<[StypProperties]>(receiver => {

      const tracker = trackValue<StypProperties>({});
      const propertiesSupply = this.read.do(consumeEvents(() => {

        const found = this._get(request);

        return found && found
            .read(properties => tracker.it = properties)
            .whenOff(() => tracker.it = {});
      }));

      return tracker.read(receiver).cuts(propertiesSupply);
    }).do(shareAfter);
  }

  _add(rule: StypRule$, sendUpdate: boolean): void {
    rule.rules.onUpdate((added, removed) => this._updates.send(added, removed));
    if (sendUpdate) {
      this._updates.send(itsElements(rule.rules), []);
    }
  }

  _remove(reason?: unknown): void {

    const removed = itsElements(this);

    this._updates.send([], removed);
    removed.forEach(rule => {
      rule.rules._updates.supply.off(reason);
      rule._spec.supply.off(reason);
    });
  }

}

function StypRuleList$self(rule: StypRule$, all: StypRule$AllRules): StypRuleList {

  const onUpdate = new EventEmitter<[StypRule$[], StypRule$[]]>();
  const rules = [rule];

  all.onUpdate((_added, removed) => {
    if (removed[0] === rule) {
      rules.length = 0;
      onUpdate.send([], [rule]);
    }
  }).cuts(onUpdate);

  class Self implements StypRules {

    [OnEvent__symbol](): OnEvent<[StypRule$[], StypRule$[]]> {
      return onUpdate.on;
    }

    [Symbol.iterator](): IterableIterator<StypRule$> {
      return itsIterator(rules);
    }

  }

  return new StypRuleList$(new Self());
}

function StypRule$allRules(rule: StypRule$): PushIterable<StypRule$> {
  return overElementsOf(
      overOne(rule),
      flatMapIt(
          rule.rules.nested,
          nested => StypRule$allRules(nested),
      ),
  );
}

class StypRule$NestedRules extends StypRuleList {

  readonly read: AfterEvent<[StypRule$NestedRules]>;
  readonly _all: StypRule$AllRules;
  private readonly _updates = new EventEmitter<[StypRule$[], StypRule$[]]>();
  private readonly _byKey = new Map<string, StypRule$>();

  constructor(root: StypRule$) {
    super();
    this._all = new StypRule$AllRules(root, this);

    const returnSelf = valueProvider(this);

    this.read = this._updates.on.do(mapAfter(returnSelf, returnSelf));
  }

  get onUpdate(): OnEvent<[StypRule[], StypRule[]]> {
    return this._updates.on;
  }

  [Symbol.iterator](): IterableIterator<StypRule$> {
    return this._byKey.values();
  }

  grab(query: StypQuery): StypRuleList {
    return StypRuleList$grab(this, query);
  }

  _rule(key: string): StypRule$ | undefined {
    return this._byKey.get(key);
  }

  _add(key: string, rule: StypRule$, sendUpdate: boolean): void {
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
export class StypRule$ extends StypRule {

  readonly read: AfterEvent<[StypProperties]>;
  private readonly _root: StypRule$;
  private _outer?: StypRule$ | null | undefined;
  private readonly _selector: DoqryPicker;
  private readonly _key: StypRuleKey;
  readonly _spec: ValueTracker<StypProperties.Builder>;
  private readonly _nested: StypRule$NestedRules;

  get root(): StypRule$ {
    return this._root;
  }

  get outer(): StypRule$ | null {
    if (this._outer !== undefined) {
      return this._outer;
    }

    const outerSelector = stypOuterSelector(this.selector);

    return this._outer = outerSelector && this.root.rules.get(outerSelector) || null;
  }

  get selector(): DoqryPicker {
    return this._selector;
  }

  get key(): StypRuleKey {
    return this._key;
  }

  get empty(): boolean {
    return this._spec.it === noStypPropertiesSpec;
  }

  get rules(): StypRule$AllRules {
    return this._nested._all;
  }

  constructor(
      root: StypRule$ | undefined,
      selector: DoqryPicker,
      key: StypRuleKey,
      spec: StypProperties.Builder = noStypPropertiesSpec,
  ) {
    super();
    this._root = root || this;
    this._selector = selector;
    this._key = key;
    this._spec = trackValue(spec);
    this.read = this._spec.read.do(digAfter(builder => builder(this)));
    this._nested = new StypRule$NestedRules(this);
  }

  set(properties?: StypProperties.Spec): this {
    this._spec.it = properties ? r => stypPropertiesBySpec(r, properties) : noStypPropertiesSpec;

    return this;
  }

  remove(reason?: unknown): this {
    this.rules._remove(reason);

    return this;
  }

}

function StypRule$extend(
    rule: StypRule$,
    targetSelector: DoqryPicker,
    properties: StypProperties.Spec | undefined,
    sendUpdate: boolean,
): StypRule$ {

  const [key, tail] = stypRuleKeyAndTail(targetSelector);

  if (!tail) {
    // Target rule
    rule._spec.it = StypRule$extendSpec(rule, properties);

    return rule;
  }

  const keyText = stypRuleKeyText(key);
  const found = rule.rules.nested._rule(keyText);

  if (found) {
    return StypRule$extend(found, tail, properties, sendUpdate);
  }

  const newNested = new StypRule$(rule.root, [...rule.selector, ...key], key);
  const result = StypRule$extend(newNested, tail, properties, false); // Send only a top-level update

  rule.rules.nested._add(keyText, newNested, sendUpdate);

  return result;
}

function StypRule$extendSpec(rule: StypRule$, properties: StypProperties.Spec | undefined): StypProperties.Builder {

  const oldSpec = rule._spec.it;

  if (!properties) {
    return oldSpec;
  }

  if (rule.empty) {
    return r => stypPropertiesBySpec(r, properties);
  }

  return r => mergeStypProperties(oldSpec(r), stypPropertiesBySpec(r, properties));
}
