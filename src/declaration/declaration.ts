import { AfterEvent, AfterEvent__symbol, EventKeeper } from 'fun-events';
import { StypSelector, stypSelector } from '../selector';
import { StypProperties } from './properties';
import { overNone } from 'a-iterable';
import { isCombinator } from '../selector/selector.impl';
import { formatSelector } from '../selector/selector-text.impl';
import { cssescId } from '../internal';
import { mergeStypProperties, noStypProperties, stypPropertiesBySpec } from './properties.impl';

export abstract class StypDeclaration implements EventKeeper<[StypProperties]> {

  /**
   * @internal
   */
  private _read?: AfterEvent<[StypProperties]>;

  abstract readonly root: StypDeclaration;

  abstract readonly selector: StypSelector.Normalized;

  abstract readonly spec: StypProperties.Builder;

  /**
   * Whether this declaration's properties are empty.
   *
   * This is `true` when declaration properties are guaranteed to be empty, or `false` if they are not empty or may
   * become non-empty.
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

  get allNested(): Iterable<StypDeclaration> {
    return overNone();
  }

  abstract nested(selector: StypSelector): StypDeclaration;

  add(spec: StypProperties.Spec): StypDeclaration {
    return extendDeclaration(this.root, this.selector, spec).nested(this.selector);
  }

}

/**
 * @internal
 */
export class EmptyStypDeclaration extends StypDeclaration {

  get spec() {
    return emptySpec;
  }

  get empty() {
    return true;
  }

  constructor(
      readonly root: StypDeclaration,
      readonly selector: StypSelector.Normalized) {
    super();
  }

  nested(selector: StypSelector): StypDeclaration {

    const _selector = stypSelector(selector);

    if (!_selector.length) {
      return this;
    }

    return new EmptyStypDeclaration(this.root, [...this.selector, ..._selector]);
  }

}

function emptySpec() {
  return noStypProperties;
}

class StypDeclarationExt extends StypDeclaration {

  private readonly _root: StypDeclaration;
  private readonly _selector: StypSelector.Normalized;
  _spec: StypProperties.Builder;
  readonly _nested = new Map<string, StypDeclaration>();

  get root(): StypDeclaration {
    return this._root;
  }

  get selector(): StypSelector.Normalized {
    return this._selector;
  }

  get spec(): StypProperties.Builder {
    return this._spec;
  }

  get allNested() {
    return this._nested.values();
  }

  constructor(root: StypDeclaration | undefined, prototype: StypDeclaration) {
    super();
    this._root = root || this;
    this._selector = prototype.selector;
    this._spec = prototype.spec;
  }

  nested(selector: StypSelector): StypDeclaration {

    const sel = stypSelector(selector);
    const [key, tail] = keySelectorAndTail(sel);

    if (!tail) {
      return this;
    }

    const found = this._nested.get(declarationKey(key));

    if (!found) {
      return new EmptyStypDeclaration(this.root, [...this.selector, ...sel]);
    }

    return found.nested(tail);
  }

}

function extendDeclaration(
    source: StypDeclaration,
    targetSelector: StypSelector.Normalized,
    spec: StypProperties.Spec,
    root?: StypDeclaration): StypDeclarationExt {

  const [dirSelector, tail] = keySelectorAndTail(targetSelector);

  if (!tail) {
    // Target declaration
    return extendSpec(source, spec, root);
  }

  const result = new StypDeclarationExt(root, source);
  const dirKey = declarationKey(dirSelector);
  let targetFound = false;

  for (const nestedProto of source.allNested) {

    const key = declarationKey(nestedProto.selector.slice(source.selector.length));
    let nested: StypDeclarationExt;

    if (key === dirKey) {
      // Nested declaration contains target one.
      nested = extendDeclaration(nestedProto, tail, spec, result.root);
      targetFound = true;
    } else {
      nested = cloneDeclaration(nestedProto, result.root);
    }

    result._nested.set(key, nested);
  }
  if (!targetFound) {
    // No target declaration found in prototype. Create one.

    const nested = extendDeclaration(source.nested(dirSelector), tail, spec, result.root);

    result._nested.set(dirKey, nested);
  }

  return result;
}

function extendSpec(
    source: StypDeclaration,
    spec: StypProperties.Spec,
    root: StypDeclaration | undefined): StypDeclarationExt {

  const result = new StypDeclarationExt(root, source);

  if (source.empty) {
    result._spec = decl => stypPropertiesBySpec(decl, spec);
  } else {
    result._spec = decl => mergeStypProperties(source.spec(decl), stypPropertiesBySpec(decl, spec));
  }

  cloneAllNested(result, source);

  return result;
}

function cloneDeclaration(source: StypDeclaration, root: StypDeclaration): StypDeclarationExt {
  return cloneAllNested(new StypDeclarationExt(root, source), source);
}

function cloneAllNested(clone: StypDeclarationExt, prototype: StypDeclaration): StypDeclarationExt {
  for (const nestedProto of prototype.allNested) {

    const key = declarationKey(nestedProto.selector.slice(prototype.selector.length));
    const nested = cloneDeclaration(nestedProto, clone.root);

    clone._nested.set(key, nested);
  }

  return clone;
}

function keySelectorAndTail(selector: StypSelector.Normalized):
    [StypSelector.Normalized, StypSelector.Normalized?] {

  const length = selector.length;

  if (!length) {
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

function declarationKey(selector: StypSelector.Normalized): string {
  return formatSelector(selector, s => `:${cssescId(s)}`);
}
