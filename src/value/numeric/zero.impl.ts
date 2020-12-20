import { StypPriority } from '../priority';
import { StypValue } from '../value';
import { StypDimension, StypNumeric, StypNumericStruct } from './index';
import { stypDimension } from './numeric.impl';
import { StypZero } from './zero';

class Zero<TUnit extends string> extends StypNumericStruct<Zero<TUnit>, TUnit> implements StypZero<TUnit> {

  constructor(private readonly _byPriority: ZeroByPriority<TUnit>, opts: StypDimension.Opts<TUnit>) {
    super(opts);
  }

  get type(): 0 {
    return 0;
  }

  toDim<TDimUnit extends string>(dim: StypDimension.Kind<TDimUnit>): StypDimension<TDimUnit> | StypZero<TDimUnit> {
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
      return this.priority === StypPriority.Usual;
    }
    if (other === '0 !important') {
      return this.priority === StypPriority.Important;
    }
    return false;
  }

  add(addendum: StypNumeric<TUnit>): StypNumeric<TUnit>;

  add(addendum: number, unit?: TUnit): StypNumeric<TUnit>;

  add(addendum: StypNumeric<TUnit> | number, unit?: TUnit): StypNumeric<TUnit> {
    if (typeof addendum === 'number') {
      addendum = stypDimension(addendum, unit as TUnit, this);
    }
    return addendum.prioritize(this.priority);
  }

  sub(subtrahend: StypNumeric<TUnit>): StypNumeric<TUnit>;

  sub(subtrahend: number, unit: TUnit): StypNumeric<TUnit>;

  sub(subtrahend: StypNumeric<TUnit> | number, unit?: TUnit): StypNumeric<TUnit> {
    if (typeof subtrahend === 'number') {
      subtrahend = stypDimension(subtrahend, unit as TUnit, this);
    }
    return subtrahend.negate().prioritize(this.priority);
  }

  mul(): this {
    return this;
  }

  div(): this {
    return this;
  }

  negate(): this {
    return this;
  }

  prioritize(priority: number): Zero<TUnit> {
    return this._byPriority.get(priority);
  }

  important(): Zero<TUnit> {
    return this._byPriority.important;
  }

  usual(): Zero<TUnit> {
    return this._byPriority.usual;
  }

  toFormula(): string {
    return '0';
  }

}

class ZeroByPriority<TUnit extends string> {

  readonly usual: Zero<TUnit>;
  readonly important: Zero<TUnit>;

  constructor(readonly dim: StypDimension.Kind<TUnit>) {
    this.usual = new Zero(this, { dim });
    this.important = new Zero(this, { dim, priority: StypPriority.Important });
  }

  get(priority: number): Zero<TUnit> {
    switch (priority) {
    case StypPriority.Usual: return this.usual;
    case StypPriority.Important: return this.important;
    }
    return new Zero(this, { dim: this.dim, priority });
  }

}

/**
 * @internal
 */
export function newStypZero<TUnit extends string>(dim: StypDimension.Kind.UnitlessZero<TUnit>): StypZero<TUnit> {
  return new ZeroByPriority<TUnit>(dim).usual;
}
