import { StypValueOpts, StypValueStruct } from './struct';
import { StypValue, stypValuesEqual } from './value';
import { stypZero, StypZero } from './zero';

/**
 * Structured numeric value.
 *
 * This represents either dimension, zero value, or a `calc()` CSS function call.
 *
 * @typeparam Unit Allowed unit type.
 */
export type StypNumeric<Unit extends string> = StypDimension<Unit> | StypCalc<Unit> | StypZero<Unit>;

/**
 * Base interface of structured numeric value.
 *
 * @typeparam Self A type of itself.
 * @typeparam Unit Allowed unit type.
 */
export interface StypNumericBase<Self extends StypNumericBase<Self, Unit>, Unit extends string>
    extends StypValueStruct<Self> {

  add(addendum: StypNumeric<Unit>): StypNumeric<Unit>;

  sub(subtrahend: StypNumeric<Unit>): StypNumeric<Unit>;

  mul(multiplier: number): StypNumeric<Unit>;

  div(divisor: number): StypNumeric<Unit>;

  negate(): StypNumeric<Unit>;

  /**
   * Returns a textual representation of this value to be used within CSS `calc()` function.
   *
   * @returns CSS value text without `!important` or `calc()`.
   */
  toFormula(): string;

}

/**
 * Structured [<dimension>] value with unit.
 *
 * @typeparam Unit Allowed unit type.
 *
 * [<dimension>]: https://developer.mozilla.org/en-US/docs/Web/CSS/dimension
 */
export class StypDimension<Unit extends string>
    extends StypValueStruct<StypDimension<Unit>>
    implements StypNumericBase<StypDimension<Unit>, Unit> {

  // noinspection JSMethodCanBeStatic
  get type(): 'number' {
    return 'number';
  }

  /**
   * The number value.
   */
  readonly val: number;

  /**
   * The unit.
   */
  readonly unit: Unit;

  /**
   * Constructs new structured dimension value.
   *
   * @param val The numeric value.
   * @param unit The unit.
   * @param opts CSS value options.
   */
  constructor(val: number, unit: Unit, opts?: StypValueOpts) {
    super(opts);
    this.val = val;
    this.unit = unit;
  }

  is(other: StypValue): boolean {
    if (other === this) {
      return true;
    }
    if (typeof other === 'object' && other.type === this.type) {
      return this.unit === other.unit && this.val === other.val && this.priority === other.priority;
    }
    return false;
  }

  prioritize(priority: 'important' | undefined): StypDimension<Unit> {
    return this.priority === priority ? this : new StypDimension(this.val, this.unit, { priority });
  }

  add(addendum: StypNumeric<Unit>): StypNumeric<Unit> {
    if (addendum.type === 'number' && this.unit === addendum.unit) {
      return stypDimension(this.val + addendum.val, this.unit, this);
    }
    return stypAddSub(this, '+', addendum);
  }

  sub(subtrahend: StypNumeric<Unit>): StypNumeric<Unit> {
    if (subtrahend.type === 'number' && this.unit === subtrahend.unit) {
      return stypDimension(this.val - subtrahend.val, this.unit, this);
    }
    return stypAddSub(this, '-', subtrahend);
  }

  mul(multiplier: number) {
    return multiplier === 1 ? this : stypDimension(this.val * multiplier, this.unit, this);
  }

  div(divisor: number) {
    return divisor === 1 ? this : stypDimension(this.val / divisor, this.unit, this);
  }

  negate() {
    return stypDimension(-this.val, this.unit, this);
  }

  /**
   * Returns a textual representation of this value to be used within CSS `calc()` function.
   *
   * @returns `<value><unit>` or just `0`.
   */
  toFormula(): string {
    return this.val + this.unit;
  }

  toString(): string {
    return this.priority ? this.toFormula() + ' !important' : this.toFormula();
  }

}

/**
 * Constructs structured [<dimension>] CSS property value.
 *
 * @param val Numeric value.
 * @param unit Value unit.
 * @param opts Construction options.
 *
 * @returns Either [[StypDimension]], or [[StypZero]] if `val === 0`.
 *
 * [<dimension>]: https://developer.mozilla.org/en-US/docs/Web/CSS/dimension
 */
export function stypDimension<Unit extends string>(
    val: number,
    unit: Unit,
    opts?: StypValueOpts): StypDimension<Unit> | StypZero<Unit> {
  return val ? new StypDimension(val, unit, opts) : stypZero.prioritize(opts && opts.priority);
}

/**
 * CSS `calc()` function call representation.
 *
 * This is either a [[StypAddSub]] addition or subtraction, or [[StypMulDiv]] for multiplication or division.
 *
 * @typeparam Unit Allowed unit type.
 */
export type StypCalc<Unit extends string> = StypAddSub<Unit> | StypMulDiv<Unit>;

/**
 * Base implementation of CSS `calc()` function call representation.
 *
 * @typeparam Unit Allowed unit type.
 */
export abstract class StypCalcBase<
    Self extends StypCalcBase<Self, Op, Right, Unit>,
    Op extends '+' | '-' | '*' | '/',
    Right extends number | StypNumeric<Unit>,
    Unit extends string>
    extends StypValueStruct<Self>
    implements StypNumericBase<Self, Unit> {

  // noinspection JSMethodCanBeStatic
  get type(): 'calc' {
    return 'calc';
  }

  readonly left: StypNumeric<Unit>;
  readonly op: Op;
  readonly right: Right;

  constructor(
      left: StypNumeric<Unit>,
      op: Op,
      right: Right,
      opts?: StypValueOpts) {
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
      return this.op === other.op
          && this.left.is(other.left)
          && stypValuesEqual(this.right, other.right)
          && this.priority === other.priority;
    }
    return false;
  }

  add(addendum: StypNumeric<Unit>): StypNumeric<Unit> {
    return stypAddSub(this as StypNumeric<Unit>, '+', addendum);
  }

  sub(subtrahend: StypNumeric<Unit>): StypNumeric<Unit> {
    return stypAddSub(this as StypNumeric<Unit>, '-', subtrahend);
  }

  mul(multiplier: number): StypNumeric<Unit> {
    return stypMul(this as StypNumeric<Unit>, multiplier);
  }

  div(divisor: number): StypNumeric<Unit> {
    return stypDiv(this as StypNumeric<Unit>, divisor);
  }

  abstract negate(): StypNumeric<Unit>;

  abstract prioritize(priority: 'important' | undefined): Self;

  abstract toFormula(): string;

  toString() {

    const string = 'calc' + this.toFormula();

    return this.priority ? string + ' !important' : string;
  }

}

/**
 * CSS `calc()` function call representation containing either addition or subtraction.
 *
 * @typeparam Unit Allowed unit type.
 */
export class StypAddSub<Unit extends string>
    extends StypCalcBase<StypAddSub<Unit>, '+' | '-', StypNumeric<Unit>, Unit> {

  constructor(left: StypNumeric<Unit>, op: '+' | '-', right: StypNumeric<Unit>, opts?: StypValueOpts) {
    super(left, op, right.usual(), opts);
  }

  prioritize(priority: 'important' | undefined): StypAddSub<Unit> {
    return this.priority === priority ? this : new StypAddSub(this.left, this.op, this.right, { priority });
  }

  negate(): StypNumeric<Unit> {
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

function stypAddSub<Unit extends string>(
    left: StypNumeric<Unit>,
    op: '+' | '-',
    right: StypNumeric<Unit>): StypNumeric<Unit> {
  return right.type === '0' ? left : new StypAddSub(left, op, right, left);
}

/**
 * CSS `calc()` function call representation containing either multiplication or division.
 *
 * @typeparam Unit Allowed unit type.
 */
export class StypMulDiv<Unit extends string> extends StypCalcBase<StypMulDiv<Unit>, '*' | '/', number, Unit> {

  prioritize(priority: 'important' | undefined): StypMulDiv<Unit> {
    return this.priority === priority ? this : new StypMulDiv(this.left, this.op, this.right, { priority });
  }

  mul(multiplier: number): StypNumeric<Unit> {
    return (this.op === '*'
        ? stypMul(this.left, this.right * multiplier)
        : stypDiv(this.left, this.right / multiplier))
        .prioritize(this.priority);
  }

  div(divisor: number): StypNumeric<Unit> {
    return (this.op === '/'
        ? stypDiv(this.left, this.right * divisor)
        : stypMul(this.left, this.right / divisor))
        .prioritize(this.priority);
  }

  negate(): StypNumeric<Unit> {
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

function stypMul<Unit extends string>(left: StypNumeric<Unit>, right: number): StypNumeric<Unit> {
  return !right
      ? stypZero.prioritize(left.priority)
      : right === 1
          ? left.prioritize(left.priority)
          : new StypMulDiv(left, '*', right, left);
}

function stypDiv<Unit extends string>(left: StypNumeric<Unit>, right: number): StypNumeric<Unit> {
  return right === 1
      ? left.prioritize(left.priority)
      : new StypMulDiv(left, '/', right, left);
}
