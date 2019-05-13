import { StypDimension, StypNumeric, StypNumericStruct } from './numeric';
import { StypValue } from './value';
import { StypZero } from './zero';

class Zero<Unit extends string> extends StypNumericStruct<Zero<Unit>, Unit> implements StypZero<Unit> {

  constructor(private readonly _byPriority: ZeroByPriority<Unit>, opts: StypDimension.Opts<Unit>) {
    super(opts);
  }

  get type(): 0 {
    return 0;
  }

  toDim<U extends string>(dim: StypDimension.Kind<U>): StypDimension<U> | StypZero<U> {
    return dim.zero.prioritize(this.priority);
  }

  is(other: StypValue): boolean {
    if (this === other) {
      return true;
    }
    if (typeof other === 'object') {
      return other.type === this.type && other.priority === this.priority;
    }
    if (other === 0 || other === '0') {
      return !this.priority;
    }
    if (other === '0 !important') {
      return this.priority === 'important';
    }
    return false;
  }

  add(addendum: StypNumeric<Unit>): StypNumeric<Unit> {
    return addendum.prioritize(this.priority);
  }

  sub(subtrahend: StypNumeric<Unit>): StypNumeric<Unit> {
    return subtrahend.negate().prioritize(this.priority);
  }

  mul(multiplier: number): this {
    return this;
  }

  div(divisor: number): this {
    return this;
  }

  negate(): this {
    return this;
  }

  prioritize(priority: 'important' | undefined): Zero<Unit> {
    return this._byPriority.get(priority);
  }

  important(): Zero<Unit> {
    return this._byPriority.important;
  }

  usual(): Zero<Unit> {
    return this._byPriority.usual;
  }

  toFormula(): string {
    return '0';
  }

  toString(): string {
    return this.priority ? '0 !important' : '0';
  }

}

class ZeroByPriority<Unit extends string> {

  readonly usual: Zero<Unit>;
  readonly important: Zero<Unit>;

  constructor(dim: StypDimension.Kind<Unit>) {
    this.usual = new Zero(this, { dim });
    this.important = new Zero(this, { dim, priority: 'important' });
  }

  get(priority: 'important' | undefined): Zero<Unit> {
    return priority ? this.important : this.usual;
  }

}

/**
 * @internal
 */
export function newStypZero<Unit extends string>(dim: StypDimension.Kind.UnitlessZero<Unit>): StypZero<Unit> {
  return new ZeroByPriority<Unit>(dim).usual;
}
