import { StypValue, StypValueStruct } from './value';
import { StypZero } from './zero';

/**
 * Structured numeric value.
 *
 * This represents either dimension, zero value, or a `calc()` CSS function call.
 *
 * @typeparam Unit Allowed unit type.
 * @typeparam Zero A type of zero value. [[StypZero]] by default.
 */
export type StypNumeric<Unit extends string, Zero extends StypZero<Unit> | StypDimension<Unit> = StypZero<Unit>> =
    StypDimension<Unit> | StypCalc<Unit> | Zero;

/**
 * Base implementation of structured numeric CSS property value.
 *
 * @typeparam Self A type of itself.
 * @typeparam Unit Allowed unit type.
 */
export abstract class StypNumericStruct<Self extends StypNumericStruct<Self, Unit>, Unit extends string>
    extends StypValueStruct<Self> {

  readonly dim: StypDimension.Kind<Unit>;

  constructor(opts: StypDimension.Opts<Unit>) {
    super(opts);
    this.dim = opts.dim;
  }

  abstract add(addendum: StypNumeric<Unit>): StypNumeric<Unit>;

  abstract sub(subtrahend: StypNumeric<Unit>): StypNumeric<Unit>;

  abstract mul(multiplier: number): StypNumeric<Unit>;

  abstract div(divisor: number): StypNumeric<Unit>;

  abstract negate(): StypNumeric<Unit>;

  by(source: StypValue): StypNumeric<Unit> {
    return this.dim.by(source) || this as StypNumeric<Unit>;
  }

  /**
   * Returns a textual representation of this value to be used within CSS `calc()` function.
   *
   * @returns CSS value text without `!important` or `calc()`.
   */
  abstract toFormula(): string;

  toString() {

    const string = this.toFormula();

    return this.priority ? string + ' !important' : string;
  }

}

/**
 * Structured [<dimension>] value with unit.
 *
 * @typeparam Unit Allowed units type.
 *
 * [<dimension>]: https://developer.mozilla.org/en-US/docs/Web/CSS/dimension
 */
export interface StypDimension<Unit extends string>
    extends StypValueStruct<StypDimension<Unit>>, StypNumericStruct<StypDimension<Unit>, Unit> {

  readonly type: 'dimension';

  readonly dim: StypDimension.Kind<Unit>;

  /**
   * Dimension value.
   */
  readonly val: number;

  /**
   * Dimension unit.
   */
  readonly unit: Unit;

  by(source: StypValue): StypNumeric<Unit>;

}

export namespace StypDimension {

  /**
   * A kind of dimensions. E.g. angle, length, percentage, etc.
   *
   * @typeparam Unit Allowed units type.
   */
  export interface Kind<Unit extends string> {

    /**
     * A similar kind of dimensions supporting all units this one supports and, in addition, supporting percents (`%`).
     *
     * `undefined` if there is no such dimension kind. Refers itself if supports percents.
     */
    readonly pt?: Kind<Unit | '%'>;

    /**
     * A similar kind of dimensions supporting all units this one supports, except percents (`%`).
     *
     * `undefined` if there is no such dimension kind. Refers itself if does not support percents.
     */
    readonly noPt: Kind<Exclude<Unit, '%'>>;

    /**
     * Zero value of this kind.
     *
     * Typically, this is unit-less [[stypZero]]. But some dimensions require units.
     */
    readonly zero: StypDimension<Unit> | StypZero<Unit>;

    /**
     * Constructs dimension value.
     *
     * @param val Numeric dimension value.
     * @param unit Dimension unit.
     *
     * @returns Constructed dimension value. Either [[StypDimension]] instance, or [[StypZero]] if `val` is `0` and
     * this dimension kind supports unitless zero.
     */
    of(val: number, unit: Unit): StypDimension<Unit> | StypZero<Unit>;

    by(source: StypValue): StypNumeric<Unit, StypDimension<Unit> | StypZero<Unit>> | undefined;

  }

  export namespace Kind {

    /**
     * A kind of dimension with unit-less zero. E.g. angle or length.
     *
     * @typeparam Unit Allowed units type.
     */
    export interface UnitlessZero<Unit extends string> extends Kind<Unit> {

      readonly pt?: UnitlessZero<Unit | '%'>;

      readonly noPt: UnitlessZero<Exclude<Unit, '%'>>;

      /**
       * Zero value of this kind without unit.
       */
      readonly zero: StypZero<Unit>;

      /**
       * Constructs dimension value.
       *
       * @param val Numeric dimension value.
       * @param unit Dimension unit.
       *
       * @returns Constructed dimension value. Either [[StypDimension]] instance, or [[StypZero]] if `val` is `0`.
       */
      of(val: number, unit: Unit): StypDimension<Unit> | StypZero<Unit>;

      by(source: StypValue): StypNumeric<Unit> | undefined;

    }

    /**
     * A kind of dimension which zero value has unit. E.g. frequency or resolution.
     *
     * @typeparam Unit Allowed units type.
     */
    export interface UnitZero<Unit extends string> extends Kind<Unit> {

      readonly pt?: UnitZero<Unit | '%'>;

      readonly noPt: UnitZero<Exclude<Unit, '%'>>;

      /**
       * Zero value of this kind that has unit.
       */
      readonly zero: StypDimension<Unit>;

      /**
       * Constructs dimension value.
       *
       * @param val Numeric dimension value.
       * @param unit Dimension unit.
       *
       * @returns Constructed dimension value as a [[StypDimension]] instance.
       */
      of(val: number, unit: Unit): StypDimension<Unit>;

      by(source: StypValue): StypNumeric<Unit, StypDimension<Unit>> | undefined;

    }

  }

  /**
   * Construction options of dimensions.
   *
   * @typeparam Unit Allowed units type.
   */
  export interface Opts<Unit extends string> extends StypValue.Opts {

    /**
     * A kind of dimension.
     */
    dim: Kind<Unit>;

  }

}

/**
 * CSS `calc()` function call representation.
 *
 * This is either a [[StypAddSub]][addition/subtraction], or [[StypMulDiv]][multiplication/division].
 *
 * @typeparam Unit Allowed unit type.
 */
export type StypCalc<Unit extends string> = StypAddSub<Unit> | StypMulDiv<Unit>;

/**
 * CSS `calc()` function call representation containing either addition or subtraction.
 *
 * @typeparam Unit Allowed unit type.
 */
export interface StypAddSub<Unit extends string> extends StypNumericStruct<StypAddSub<Unit>, Unit> {

  readonly type: 'calc';

  /**
   * Left operand.
   */
  readonly left: StypNumeric<Unit>;

  /**
   * Operator.
   */
  readonly op: '+' | '-';

  /**
   * Right operand.
   */
  readonly right: StypNumeric<Unit>;

}

/**
 * CSS `calc()` function call representation containing either multiplication or division.
 *
 * @typeparam Unit Allowed unit type.
 */
export interface StypMulDiv<Unit extends string> extends StypNumericStruct<StypMulDiv<Unit>, Unit> {

  readonly type: 'calc';

  /**
   * Left operand.
   */
  readonly left: StypNumeric<Unit>;

  /**
   * Operator.
   */
  readonly op: '*' | '/';

  /**
   * Right operand.
   */
  readonly right: number;

}
