import { StypValueStruct } from './struct';
import { StypValue, stypValuesEqual } from './value';
import { stypZero, StypZero } from './zero';

/**
 * Structured numeric value.
 *
 * This represents either a number with dimension, zero values, or a `calc()` CSS function call.
 *
 * @typeparam Dim Allowed dimension type.
 */
export type StypNumeric<Dim extends string> = StypNumber<Dim> | StypCalc<Dim> | StypZero<Dim>;

/**
 * Base interface of structured numeric value.
 *
 * @typeparam Self A type of itself.
 * @typeparam Dim Allowed dimension type.
 */
export interface StypNumericBase<Self extends StypNumericBase<Self, Dim>, Dim extends string>
    extends StypValueStruct<Self> {

  add(addendum: StypNumeric<Dim>): StypNumeric<Dim>;

  sub(subtrahend: StypNumeric<Dim>): StypNumeric<Dim>;

  mul(multiplier: number): StypNumeric<Dim>;

  div(divisor: number): StypNumeric<Dim>;

  negate(): StypNumeric<Dim>;

  /**
   * Returns a textual representation of this value to be used within CSS `calc()` function.
   *
   * @returns CSS value text without `!important` or `calc()`.
   */
  toFormula(): string;

}

/**
 * Structured number value with dimension. E.g. [<length>], [<angle>], [<percentage>], etc.
 *
 * @typeparam Dim Allowed dimension type.
 *
 * [<length>]: https://developer.mozilla.org/en-US/docs/Web/CSS/length
 * [<angle>]: https://developer.mozilla.org/en-US/docs/Web/CSS/angle
 * [<percentage>]: https://developer.mozilla.org/en-US/docs/Web/CSS/percentage
 */
export class StypNumber<Dim extends string>
    extends StypValueStruct<StypNumber<Dim>>
    implements StypNumericBase<StypNumber<Dim>, Dim> {

  // noinspection JSMethodCanBeStatic
  get type(): 'number' {
    return 'number';
  }

  /**
   * The number value.
   */
  readonly val: number;

  /**
   * The dimension.
   */
  readonly dim: Dim;

  /**
   * Constructs new structured number value.
   *
   * @param val The numeric value.
   * @param dim The dimension.
   * @param opts CSS value options.
   */
  constructor(val: number, dim: Dim, opts?: { priority?: 'important' }) {
    super(opts);
    this.val = val;
    this.dim = dim;
  }

  is(other: StypValue): boolean {
    if (other === this) {
      return true;
    }
    if (typeof other === 'object' && other.type === this.type) {
      return this.dim === other.dim && this.val === other.val && this.priority === other.priority;
    }
    return false;
  }

  prioritize(priority: 'important' | undefined): StypNumber<Dim> {
    return this.priority === priority ? this : new StypNumber(this.val, this.dim, { priority });
  }

  add(addendum: StypNumeric<Dim>): StypNumeric<Dim> {
    if (addendum.type === 'number' && this.dim === addendum.dim) {
      return stypNumber(this.val + addendum.val, this.dim, this);
    }
    return stypAddSub(this, '+', addendum);
  }

  sub(subtrahend: StypNumeric<Dim>): StypNumeric<Dim> {
    if (subtrahend.type === 'number' && this.dim === subtrahend.dim) {
      return stypNumber(this.val - subtrahend.val, this.dim, this);
    }
    return stypAddSub(this, '-', subtrahend);
  }

  mul(multiplier: number) {
    return multiplier === 1 ? this : stypNumber(this.val * multiplier, this.dim, this);
  }

  div(divisor: number) {
    return divisor === 1 ? this : stypNumber(this.val / divisor, this.dim, this);
  }

  negate() {
    return stypNumber(-this.val, this.dim, this);
  }

  /**
   * Returns a textual representation of this value to be used within CSS `calc()` function.
   *
   * @returns `<value><dimension>` or just `0`.
   */
  toFormula(): string {
    return this.val + this.dim;
  }

  toString(): string {
    return this.priority ? this.toFormula() + ' !important' : this.toFormula();
  }

}

function stypNumber<Dim extends string>(
    val: number,
    dim: Dim,
    opts?: { priority?: 'important' }): StypNumber<Dim> | StypZero<Dim> {
  return val ? new StypNumber(val, dim, opts) : stypZero.prioritize(opts && opts.priority);
}

/**
 * Structured [<length>] property value.
 *
 * Can be constructed using [[stypLength]] function.
 *
 * @typeparam ExtraDim Additional allowed dimension. Can be `%`. Not present by default.
 *
 * [<length>]: https://developer.mozilla.org/en-US/docs/Web/CSS/length
 */
export type StypLength<ExtraDim extends '%' | 'px' = 'px'> =
    StypNumber<StypLength.Dim | ExtraDim> | StypZero<StypLength.Dim | ExtraDim>;

export namespace StypLength {

  /**
   * Supported length dimensions, excluding percent.
   */
  export type Dim = 'cap' | 'ch' | 'em' | 'ex' | 'ic' | 'lh' | 'rem' | 'rlh'
      | 'vh' | 'vw' | 'vi' | 'vb' | 'vmin' | 'vmax'
      | 'px' | 'cm' | 'mm' | 'Q' | 'in' | 'pc' | 'pt';

}

/**
 * Constructs [<length>] CSS property value.
 *
 * @typeparam ExtraDim Additional allowed dimension. Can be `%`. Not present by default.
 * @param val The numeric value.
 * @param dim Length dimension.
 *
 * @returns Length value.
 *
 * [<length>]: https://developer.mozilla.org/en-US/docs/Web/CSS/length
 */
export function stypLength<ExtraDim extends '%' | 'px'>(
    val: number,
    dim: StypLength.Dim | ExtraDim): StypLength<ExtraDim> {
  return stypNumber(val, dim);
}

/**
 * Structured [<length-percentage>] CSS property value.
 *
 * Can be constructed using [[stypLengthPt]] function.
 *
 * [<length-percentage>]: https://developer.mozilla.org/en-US/docs/Web/CSS/length-percentage
 */
export type StypLengthPt = StypLength<'%'>;

export namespace StypLengthPt {

  /**
   * Supported length dimensions, including percent.
   */
  export type Dim = StypLength.Dim | '%';

}

/**
 * Constructs [<length-percentage>] CSS property value.
 *
 * @param val The numeric value.
 * @param dim Length dimension.
 *
 * @returns Length or percentage value.
 *
 * [<length-percentage>]: https://developer.mozilla.org/en-US/docs/Web/CSS/length-percentage
 */
export function stypLengthPt(val: number, dim: StypLengthPt.Dim): StypLengthPt {
  return stypNumber(val, dim);
}

/**
 * Constructs [<percentage>] CSS property value.
 *
 * @param val The number of percents.
 *
 * @returns Percentage value.
 *
 * [<percentage>]: https://developer.mozilla.org/en-US/docs/Web/CSS/percentage
 */
export function stypPercentage(val: number): StypLengthPt {
  return stypNumber(val, '%');
}

/**
 * CSS `calc()` function call representation.
 *
 * This is either a [[StypAddSub]] addition or subtraction, or [[StypMulDiv]] for multiplication or division.
 *
 * @typeparam Dim Allowed dimension type.
 */
export type StypCalc<Dim extends string> = StypAddSub<Dim> | StypMulDiv<Dim>;

/**
 * Base implementation of CSS `calc()` function call representation.
 *
 * @typeparam Dim Allowed dimension type.
 */
export abstract class StypCalcBase<
    Self extends StypCalcBase<Self, Op, Right, Dim>,
    Op extends '+' | '-' | '*' | '/',
    Right extends number | StypNumeric<Dim>,
    Dim extends string>
    extends StypValueStruct<Self>
    implements StypNumericBase<Self, Dim> {

  // noinspection JSMethodCanBeStatic
  get type(): 'calc' {
    return 'calc';
  }

  readonly left: StypNumeric<Dim>;
  readonly op: Op;
  readonly right: Right;

  constructor(
      left: StypNumeric<Dim>,
      op: Op,
      right: Right,
      opts?: { priority?: 'important' }) {
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

  add(addendum: StypNumeric<Dim>): StypNumeric<Dim> {
    return stypAddSub(this as StypNumeric<Dim>, '+', addendum);
  }

  sub(subtrahend: StypNumeric<Dim>): StypNumeric<Dim> {
    return stypAddSub(this as StypNumeric<Dim>, '-', subtrahend);
  }

  mul(multiplier: number): StypNumeric<Dim> {
    return stypMul(this as StypNumeric<Dim>, multiplier);
  }

  div(divisor: number): StypNumeric<Dim> {
    return stypDiv(this as StypNumeric<Dim>, divisor);
  }

  abstract negate(): StypNumeric<Dim>;

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
 * @typeparam Dim Allowed dimension type.
 */
export class StypAddSub<Dim extends string> extends StypCalcBase<StypAddSub<Dim>, '+' | '-', StypNumeric<Dim>, Dim> {

  constructor(left: StypNumeric<Dim>, op: '+' | '-', right: StypNumeric<Dim>, opts?: { priority?: 'important' }) {
    super(left, op, right.usual(), opts);
  }

  prioritize(priority: 'important' | undefined): StypAddSub<Dim> {
    return this.priority === priority ? this : new StypAddSub(this.left, this.op, this.right, { priority });
  }

  negate(): StypNumeric<Dim> {
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

function stypAddSub<Dim extends string>(
    left: StypNumeric<Dim>,
    op: '+' | '-',
    right: StypNumeric<Dim>): StypNumeric<Dim> {
  return right.type === '0' ? left : new StypAddSub(left, op, right, left);
}

/**
 * CSS `calc()` function call representation containing either multiplication or division.
 *
 * @typeparam Dim Allowed dimension type.
 */
export class StypMulDiv<Dim extends string> extends StypCalcBase<StypMulDiv<Dim>, '*' | '/', number, Dim> {

  prioritize(priority: 'important' | undefined): StypMulDiv<Dim> {
    return this.priority === priority ? this : new StypMulDiv(this.left, this.op, this.right, { priority });
  }

  mul(multiplier: number): StypNumeric<Dim> {
    return (this.op === '*'
        ? stypMul(this.left, this.right * multiplier)
        : stypDiv(this.left, this.right / multiplier))
        .prioritize(this.priority);
  }

  div(divisor: number): StypNumeric<Dim> {
    return (this.op === '/'
        ? stypDiv(this.left, this.right * divisor)
        : stypMul(this.left, this.right / divisor))
        .prioritize(this.priority);
  }

  negate(): StypNumeric<Dim> {
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

function stypMul<Dim extends string>(left: StypNumeric<Dim>, right: number): StypNumeric<Dim> {
  return !right
      ? stypZero.prioritize(left.priority)
      : right === 1
          ? left.prioritize(left.priority)
          : new StypMulDiv(left, '*', right, left);
}

function stypDiv<Dim extends string>(left: StypNumeric<Dim>, right: number): StypNumeric<Dim> {
  return right === 1
      ? left.prioritize(left.priority)
      : new StypMulDiv(left, '/', right, left);
}
