import { AfterEvent, AfterEvent__symbol, EventKeeper } from 'fun-events';
import { StypSelector, stypSelector } from '../selector';
import { StypProperties } from './properties';
import { overNone } from 'a-iterable';
import { isCombinator } from '../selector/selector.impl';
import { stypRuleKey } from '../selector/selector-text.impl';
import { mergeStypProperties, noStypProperties, stypPropertiesBySpec } from './properties.impl';

export abstract class StypRule implements EventKeeper<[StypProperties]> {

  /**
   * @internal
   */
  private _read?: AfterEvent<[StypProperties]>;

  abstract readonly root: StypRule;

  abstract readonly selector: StypSelector.Normalized;

  abstract readonly spec: StypProperties.Builder;

  /**
   * Whether this rule's properties are empty.
   *
   * This is `true` when rule properties are always empty, or `false` if they are not empty or may become non-empty.
   */
  get empty(): boolean {
    return false;
  }

  get read(): AfterEvent<[StypProperties]> {
    return this._read || (this._read = this.spec(this));
  }

  get [AfterEvent__symbol](): AfterEvent<[StypProperties]> {
    return this.read;
  }

  get rules(): Iterable<StypRule> {
    return overNone();
  }

  abstract rule(selector: StypSelector): StypRule;

  add(spec: StypProperties.Spec): StypRule {
    return extendRule(this.root, this.selector, spec).rule(this.selector);
  }

}

/**
 * @internal
 */
export class EmptyStypRule extends StypRule {

  get spec() {
    return emptySpec;
  }

  get empty() {
    return true;
  }

  constructor(
      readonly root: StypRule,
      readonly selector: StypSelector.Normalized) {
    super();
  }

  rule(selector: StypSelector): StypRule {

    const _selector = stypSelector(selector);

    if (!_selector.length) {
      return this;
    }

    return new EmptyStypRule(this.root, [...this.selector, ..._selector]);
  }

}

function emptySpec() {
  return noStypProperties;
}

class StypRuleExt extends StypRule {

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

  get spec(): StypProperties.Builder {
    return this._spec;
  }

  get rules() {
    return this._rules.values();
  }

  constructor(root: StypRule | undefined, prototype: StypRule) {
    super();
    this._root = root || this;
    this._selector = prototype.selector;
    this._spec = prototype.spec;
  }

  rule(selector: StypSelector): StypRule {

    const sel = stypSelector(selector);
    const [key, tail] = keySelectorAndTail(sel);

    if (!tail) {
      return this;
    }

    const found = this._rules.get(stypRuleKey(key));

    if (!found) {
      return new EmptyStypRule(this.root, [...this.selector, ...sel]);
    }

    return found.rule(tail);
  }

}

function extendRule(
    source: StypRule,
    targetSelector: StypSelector.Normalized,
    properties: StypProperties.Spec,
    root?: StypRule): StypRuleExt {

  const [dirSelector, tail] = keySelectorAndTail(targetSelector);

  if (!tail) {
    // Target rule
    return extendSpec(source, properties, root);
  }

  const result = new StypRuleExt(root, source);
  const dirKey = stypRuleKey(dirSelector);
  let targetFound = false;

  for (const nestedProto of source.rules) {

    const key = stypRuleKey(nestedProto.selector.slice(source.selector.length));
    let nested: StypRuleExt;

    if (key === dirKey) {
      // Nested rule contains target one.
      nested = extendRule(nestedProto, tail, properties, result.root);
      targetFound = true;
    } else {
      nested = cloneRule(nestedProto, result.root);
    }

    result._rules.set(key, nested);
  }
  if (!targetFound) {
    // No target rule found in prototype. Create one.

    const nested = extendRule(source.rule(dirSelector), tail, properties, result.root);

    result._rules.set(dirKey, nested);
  }

  return result;
}

function extendSpec(
    source: StypRule,
    properties: StypProperties.Spec,
    root: StypRule | undefined): StypRuleExt {

  const result = new StypRuleExt(root, source);

  if (source.empty) {
    result._spec = rule => stypPropertiesBySpec(rule, properties);
  } else {
    result._spec = rule => mergeStypProperties(source.spec(rule), stypPropertiesBySpec(rule, properties));
  }

  cloneAllNested(result, source);

  return result;
}

function cloneRule(source: StypRule, root: StypRule): StypRuleExt {
  return cloneAllNested(new StypRuleExt(root, source), source);
}

function cloneAllNested(clone: StypRuleExt, prototype: StypRule): StypRuleExt {
  for (const nestedProto of prototype.rules) {

    const key = stypRuleKey(nestedProto.selector.slice(prototype.selector.length));
    const nested = cloneRule(nestedProto, clone.root);

    clone._rules.set(key, nested);
  }

  return clone;
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
