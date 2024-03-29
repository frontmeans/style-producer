import { StypPriority } from '../priority';
import { StypValue, stypValuesEqual } from '../value';
import {
  StypAddSub as StypAddSub_,
  StypDimension as StypDimension_,
  StypMulDiv as StypMulDiv_,
  StypNumeric,
  StypNumericStruct,
} from './numeric';
import { StypZero } from './zero';

/**
 * @internal
 */
export class StypDimension<TUnit extends string>
  extends StypNumericStruct<StypDimension<TUnit>, TUnit>
  implements StypDimension_<TUnit> {

  get type(): 'dimension' {
    return 'dimension';
  }

  /**
   * The number value.
   */
  readonly val: number;

  /**
   * The unit.
   */
  readonly unit: TUnit;

  /**
   * Constructs new structured dimension value.
   *
   * @param val - The numeric value.
   * @param unit - The unit.
   * @param opts - CSS value options.
   */
  constructor(val: number, unit: TUnit, opts: StypDimension_.Opts<TUnit>) {
    super(opts);
    this.val = val;
    this.unit = unit;
  }

  toDim<TDimUnit extends string>(
    dim: StypDimension_.Kind<TDimUnit>,
  ): StypDimension_<TDimUnit> | undefined {
    const thisDim: StypDimension_.Kind<any> = this.dim;

    if (
      dim === thisDim
      /* same dimension */ || dim === thisDim.pt
      /* !% to compatible +% */ || dim
        === (this.unit === '%' ? dim.pt /* % to any +% */ : thisDim.noPt) /* !% to compatible -% */
    ) {
      return this as StypDimension_<any>;
    }

    return;
  }

  is(other: StypValue): boolean {
    if (other === this) {
      return true;
    }

    return (
      typeof other === 'object'
      && other.type === this.type
      && this.unit === other.unit
      && this.val === other.val
      && this.priority === other.priority
    );
  }

  prioritize(priority: number): StypDimension<TUnit> {
    return this.priority === priority
      ? this
      : new StypDimension(this.val, this.unit, { dim: this.dim, priority });
  }

  add(addendum: StypNumeric<TUnit>): StypNumeric<TUnit>;

  add(addendum: number, unit?: TUnit): StypNumeric<TUnit>;

  add(addendum: StypNumeric<TUnit> | number, unit?: TUnit): StypNumeric<TUnit> {
    if (typeof addendum === 'number') {
      addendum = stypDimension(addendum, unit || this.unit, this);
    }
    if (addendum.type === 'dimension' && this.unit === addendum.unit) {
      return stypDimension(this.val + addendum.val, this.unit, this);
    }

    return stypAddSub(this, '+', addendum);
  }

  sub(subtrahend: StypNumeric<TUnit>): StypNumeric<TUnit>;

  sub(subtrahend: number, unit?: TUnit): StypNumeric<TUnit>;

  sub(subtrahend: StypNumeric<TUnit> | number, unit?: TUnit): StypNumeric<TUnit> {
    if (typeof subtrahend === 'number') {
      subtrahend = stypDimension(subtrahend, unit || this.unit, this);
    }
    if (subtrahend.type === 'dimension' && this.unit === subtrahend.unit) {
      return stypDimension(this.val - subtrahend.val, this.unit, this);
    }

    return stypAddSub(this, '-', subtrahend);
  }

  mul(multiplier: number): StypNumeric<TUnit> {
    return multiplier === 1 ? this : stypDimension(this.val * multiplier, this.unit, this);
  }

  div(divisor: number): StypNumeric<TUnit> {
    return divisor === 1 ? this : stypDimension(this.val / divisor, this.unit, this);
  }

  negate(): StypNumeric<TUnit> {
    return stypDimension(-this.val, this.unit, this);
  }

  /**
   * Returns a textual representation of this value to be used within CSS `calc()` function.
   *
   * @returns `<value><unit>` or just `0`.
   */
  toFormula(): string {
    return `${this.val}${this.unit}`;
  }

}

/**
 * Constructs structured [dimension] CSS property value.
 *
 * @param val - Numeric value.
 * @param unit - Value unit.
 * @param opts - Construction options.
 *
 * @returns Either {@link StypDimension}, or {@link StypZero} if `val === 0`.
 *
 * [dimension]: https://developer.mozilla.org/en-US/docs/Web/CSS/dimension
 *
 * @internal
 */
export function stypDimension<TUnit extends string>(
  val: number,
  unit: TUnit,
  opts: StypDimension_.Opts<TUnit>,
): StypDimension_<TUnit> | StypZero<TUnit> {
  return val
    ? new StypDimension<TUnit>(val, unit, opts)
    : opts.dim.zero.prioritize(opts.priority || StypPriority.Default);
}

/**
 * @internal
 */
export abstract class StypCalcBase<
  TSelf extends StypCalcBase<TSelf, TOp, TRight, TUnit>,
  TOp extends '+' | '-' | '*' | '/',
  TRight extends number | StypNumeric<TUnit>,
  TUnit extends string,
> extends StypNumericStruct<TSelf, TUnit> {

  // noinspection JSMethodCanBeStatic
  get type(): 'calc' {
    return 'calc';
  }

  readonly left: StypNumeric<TUnit>;
  readonly op: TOp;
  readonly right: TRight;

  // noinspection TypeScriptAbstractClassConstructorCanBeMadeProtected
  constructor(left: StypNumeric<TUnit>, op: TOp, right: TRight, opts: StypDimension_.Opts<TUnit>) {
    super(opts);
    this.left = left.usual();
    this.op = op;
    this.right = right;
  }

  is(other: StypValue): boolean {
    if (this === other) {
      return true;
    }
    if (typeof other === 'object' && other.type === this.type) {
      return (
        this.op === other.op
        && this.left.is(other.left)
        && stypValuesEqual(this.right, other.right)
        && this.priority === other.priority
      );
    }

    return false;
  }

  add(addendum: StypNumeric<TUnit>): StypNumeric<TUnit>;

  add(addendum: number, unit: TUnit): StypNumeric<TUnit>;

  add(addendum: StypNumeric<TUnit> | number, unit?: TUnit): StypNumeric<TUnit> {
    if (typeof addendum === 'number') {
      addendum = stypDimension(addendum, unit as TUnit, this);
    }

    return stypAddSub(this as StypNumeric<TUnit>, '+', addendum);
  }

  sub(subtrahend: StypNumeric<TUnit>): StypNumeric<TUnit>;

  sub(subtrahend: number, unit: TUnit): StypNumeric<TUnit>;

  sub(subtrahend: StypNumeric<TUnit> | number, unit?: TUnit): StypNumeric<TUnit> {
    if (typeof subtrahend === 'number') {
      subtrahend = stypDimension(subtrahend, unit as TUnit, this);
    }

    return stypAddSub(this as StypNumeric<TUnit>, '-', subtrahend);
  }

  mul(multiplier: number): StypNumeric<TUnit> {
    return stypMul(this as StypNumeric<TUnit>, multiplier);
  }

  div(divisor: number): StypNumeric<TUnit> {
    return stypDiv(this as StypNumeric<TUnit>, divisor);
  }

  abstract negate(): StypNumeric<TUnit>;

  abstract prioritize(priority: number): TSelf;

  abstract toFormula(): string;

  toString(): string {
    return 'calc' + super.toString();
  }

}

/**
 * CSS `calc()` function call representation containing either addition or subtraction.
 *
 * @typeParam TUnit - Allowed unit type.
 *
 * @internal
 */
export class StypAddSub<TUnit extends string>
  extends StypCalcBase<StypAddSub<TUnit>, '+' | '-', StypNumeric<TUnit>, TUnit>
  implements StypAddSub_<TUnit> {

  constructor(
    left: StypNumeric<TUnit>,
    op: '+' | '-',
    right: StypNumeric<TUnit>,
    opts: StypDimension_.Opts<TUnit>,
  ) {
    super(left, op, right.usual(), opts);
  }

  prioritize(priority: number): StypAddSub<TUnit> {
    return this.priority === priority
      ? this
      : new StypAddSub(this.left, this.op, this.right, { dim: this.dim, priority });
  }

  toDim<TDimUnit extends string>(
    dim: StypDimension_.Kind<TDimUnit>,
  ): StypAddSub<TDimUnit> | undefined {
    const left = this.left.toDim(dim);

    if (!left) {
      return;
    }

    const right = this.right.toDim(dim);

    if (!right) {
      return;
    }

    if (left === (this.left as StypNumeric<any>) && right === (this.right as StypNumeric<any>)) {
      return this as StypAddSub<any>;
    }

    return new StypAddSub<TDimUnit>(left, this.op, right, { dim, priority: this.priority });
  }

  negate(): StypNumeric<TUnit> {
    return this.op === '-'
      ? new StypAddSub(this.right, this.op, this.left, this)
      : new StypAddSub(this.left.negate(), '-', this.right, this);
  }

  /**
   * Returns a textual representation of this value to be used within CSS `calc()` function.
   *
   * @returns `(<left> <op> <right>)`.
   */
  toFormula(): string {
    return `(${this.left.toFormula()} ${this.op} ${this.right.toFormula()})`;
  }

}

function stypAddSub<TUnit extends string>(
  left: StypNumeric<TUnit>,
  op: '+' | '-',
  right: StypNumeric<TUnit>,
): StypNumeric<TUnit> {
  return !right.type ? left : new StypAddSub(left, op, right, left);
}

/**
 * CSS `calc()` function call representation containing either multiplication or division.
 *
 * @typeParam TUnit - Allowed unit type.
 *
 * @internal
 */
export class StypMulDiv<TUnit extends string>
  extends StypCalcBase<StypMulDiv<TUnit>, '*' | '/', number, TUnit>
  implements StypMulDiv_<TUnit> {

  prioritize(priority: number): StypMulDiv<TUnit> {
    return this.priority === priority
      ? this
      : new StypMulDiv(this.left, this.op, this.right, { dim: this.dim, priority });
  }

  toDim<TDimUnit extends string>(
    dim: StypDimension_.Kind<TDimUnit>,
  ): StypMulDiv<TDimUnit> | undefined {
    const left = this.left.toDim(dim);

    if (!left) {
      return;
    }

    if (left === (this.left as StypNumeric<any>)) {
      return this as StypMulDiv<any>;
    }

    return new StypMulDiv<TDimUnit>(left, this.op, this.right, { dim, priority: this.priority });
  }

  mul(multiplier: number): StypNumeric<TUnit> {
    return (
      this.op === '*'
        ? stypMul(this.left, this.right * multiplier)
        : stypDiv(this.left, this.right / multiplier)
    ).prioritize(this.priority);
  }

  div(divisor: number): StypNumeric<TUnit> {
    return (
      this.op === '/'
        ? stypDiv(this.left, this.right * divisor)
        : stypMul(this.left, this.right / divisor)
    ).prioritize(this.priority);
  }

  negate(): StypNumeric<TUnit> {
    return new StypMulDiv(this.left, this.op, -this.right, this);
  }

  /**
   * Returns a textual representation of this value to be used within CSS `calc()` function.
   *
   * @returns `(<left> <op> <right>)`.
   */
  toFormula(): string {
    return `(${this.left.toFormula()} ${this.op} ${this.right})`;
  }

}

function stypMul<TUnit extends string>(
  left: StypNumeric<TUnit>,
  right: number,
): StypNumeric<TUnit> {
  return !right
    ? left.dim.zero.prioritize(left.priority)
    : right === 1
    ? left.prioritize(left.priority)
    : new StypMulDiv(left, '*', right, left);
}

function stypDiv<TUnit extends string>(
  left: StypNumeric<TUnit>,
  right: number,
): StypNumeric<TUnit> {
  return right === 1 ? left.prioritize(left.priority) : new StypMulDiv(left, '/', right, left);
}

/**
 * @internal
 */
export function isStypNumeric(source: StypValue): source is StypNumeric<any, any> {
  return (
    typeof source === 'object'
    && (source.type === 'dimension' || source.type === 'calc' || source.type === 0)
  );
}
