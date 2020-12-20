/**
 * @packageDocumentation
 * @module @frontmeans/style-producer
 */
import { StypValue, StypValueStruct } from '../value';
import { StypZero } from './zero';

/**
 * Structured numeric CSS property value.
 *
 * This represents either dimension, zero value, or a `calc()` CSS function call.
 *
 * @category CSS Value
 * @typeParam TUnit - Allowed unit type.
 * @typeParam TZero - A type of zero value. {@link StypZero} by default.
 */
export type StypNumeric<TUnit extends string, TZero extends StypZero<TUnit> | StypDimension<TUnit> = StypZero<TUnit>> =
    | StypDimension<TUnit>
    | StypCalc<TUnit>
    | TZero;

/**
 * Base implementation of structured numeric CSS property value.
 *
 * @category CSS Value
 * @typeParam TSelf - A type of itself.
 * @typeParam TUnit - Allowed unit type.
 */
export abstract class StypNumericStruct<TSelf extends StypNumericStruct<TSelf, TUnit>, TUnit extends string>
    extends StypValueStruct<TSelf> {

  /**
   * A type of structured numeric CSS property value.
   */
  abstract type: 'dimension' | 'calc' | 0;

  readonly dim: StypDimension.Kind<TUnit>;

  constructor(opts: StypDimension.Opts<TUnit>) {
    super(opts);
    this.dim = opts.dim;
  }

  /**
   * Tries to converts this numeric value to another dimension.
   *
   * Does not actually construct a value in another dimension, as long as dimension unit supported by both dimensions.
   *
   * @typeParam TDimUnit - A unit type allowed in target dimension.
   * @param dim - Target dimension.
   *
   * @returns Either a value in dimension compatible with `dim`, or `undefined` if this value's unit is not supported
   * by `dim`.
   */
  abstract toDim<TDimUnit extends string>(dim: StypDimension.Kind<TDimUnit>): StypNumeric<TDimUnit> | undefined;

  abstract add(addendum: StypNumeric<TUnit>): StypNumeric<TUnit>;

  abstract add(addendum: number, unit: TUnit): StypNumeric<TUnit>;

  abstract sub(subtrahend: StypNumeric<TUnit>): StypNumeric<TUnit>;

  abstract sub(subtrahend: number, unit: TUnit): StypNumeric<TUnit>;

  abstract mul(multiplier: number): StypNumeric<TUnit>;

  abstract div(divisor: number): StypNumeric<TUnit>;

  abstract negate(): StypNumeric<TUnit>;

  by(source: StypValue): StypNumeric<TUnit> {
    return this.dim.by(source) || this as StypNumeric<TUnit>;
  }

  /**
   * Returns a textual representation of this value to be used within CSS `calc()` function.
   *
   * @returns CSS value text without `!important` or `calc()`.
   */
  abstract toFormula(): string;

  toString(): string {
    return this.toFormula();
  }

}

/**
 * Structured [dimension](https://developer.mozilla.org/en-US/docs/Web/CSS/dimension) value with unit.
 *
 * @category CSS Value
 * @typeParam TUnit - Allowed units type.
 */
export interface StypDimension<TUnit extends string>
    extends StypValueStruct<StypDimension<TUnit>>, StypNumericStruct<StypDimension<TUnit>, TUnit> {

  readonly type: 'dimension';

  readonly dim: StypDimension.Kind<TUnit>;

  /**
   * Dimension value.
   */
  readonly val: number;

  /**
   * Dimension unit.
   */
  readonly unit: TUnit;

  add(addendum: StypNumeric<TUnit>): StypNumeric<TUnit>;

  add(addendum: number, unit?: TUnit): StypNumeric<TUnit>;

  sub(subtrahend: StypNumeric<TUnit>): StypNumeric<TUnit>;

  sub(subtrahend: number, unit?: TUnit): StypNumeric<TUnit>;

  by(source: StypValue): StypNumeric<TUnit>;

}

export namespace StypDimension {

  /**
   * A kind of dimensions. E.g. angle, length, percentage, etc.
   *
   * It is perfectly fine to use dimensions interchangeably as long as dimension units are compatible.
   *
   * @typeParam TUnit - Allowed units type.
   */
  export interface Kind<TUnit extends string> {

    /**
     * A similar kind of dimensions supporting all units this one supports and, in addition, supporting percents (`%`).
     *
     * `undefined` if there is no such dimension kind. Refers itself if supports percents.
     */
    readonly pt?: Kind<TUnit | '%'>;

    /**
     * A similar kind of dimensions supporting all units this one supports, except percents (`%`).
     *
     * `undefined` if there is no such dimension kind. Refers itself if does not support percents.
     */
    readonly noPt: Kind<Exclude<TUnit, '%'>>;

    /**
     * Zero value of this kind.
     *
     * Typically, this is unit-less {@link StypZero}. But some dimensions require units.
     */
    readonly zero: StypDimension<TUnit> | StypZero<TUnit>;

    /**
     * Constructs dimension value.
     *
     * @param val - Numeric dimension value.
     * @param unit - Dimension unit.
     *
     * @returns Constructed dimension value. Either {@link StypDimension} instance, or {@link StypZero} if `val` is `0`
     * and this dimension kind supports unitless zero.
     */
    of(val: number, unit: TUnit): StypDimension<TUnit> | StypZero<TUnit>;

    /**
     * Maps the given CSS property value to the one compatible with this dimension kind. Defaults to `undefined`
     * if mapping is not possible.
     *
     * This method allows to use a dimension kind as {@link StypMapper.Mapping CSS property mapping}.
     *
     * Any scalar or non-numeric value is mapped to `undefined`. A numeric value is converted to this dimension by
     * {@link StypNumericStruct.toDim} method.
     *
     * @param source - A raw property value that should be converted.
     *
     * @returns Mapped property value or `undefined`.
     */
    by(source: StypValue): StypNumeric<TUnit, StypDimension<TUnit> | StypZero<TUnit>> | undefined;

  }

  export namespace Kind {

    /**
     * A kind of dimension with unit-less zero. E.g. angle or length.
     *
     * @typeParam TUnit - Allowed units type.
     */
    export interface UnitlessZero<TUnit extends string> extends Kind<TUnit> {

      readonly pt?: UnitlessZero<TUnit | '%'>;

      readonly noPt: UnitlessZero<Exclude<TUnit, '%'>>;

      /**
       * Zero value of this kind without unit.
       */
      readonly zero: StypZero<TUnit>;

      /**
       * Constructs dimension value.
       *
       * @param val - Numeric dimension value.
       * @param unit - Dimension unit.
       *
       * @returns Constructed dimension value. Either {@link StypDimension} instance, or {@link StypZero} if `val` is
       * `0`.
       */
      of(val: number, unit: TUnit): StypDimension<TUnit> | StypZero<TUnit>;

      by(source: StypValue): StypNumeric<TUnit> | undefined;

    }

    /**
     * A kind of dimension which zero value has unit. E.g. frequency or resolution.
     *
     * @typeParam TUnit - Allowed units type.
     */
    export interface UnitZero<TUnit extends string> extends Kind<TUnit> {

      readonly pt?: UnitZero<TUnit | '%'>;

      readonly noPt: UnitZero<Exclude<TUnit, '%'>>;

      /**
       * Zero value of this kind that has unit.
       */
      readonly zero: StypDimension<TUnit>;

      /**
       * Constructs dimension value.
       *
       * @param val - Numeric dimension value.
       * @param unit - Dimension unit.
       *
       * @returns Constructed dimension value as a {@link StypDimension} instance.
       */
      of(val: number, unit: TUnit): StypDimension<TUnit>;

      by(source: StypValue): StypNumeric<TUnit, StypDimension<TUnit>> | undefined;

    }

  }

  /**
   * Construction options of dimensions.
   *
   * @typeParam TUnit - Allowed units type.
   */
  export interface Opts<TUnit extends string> extends StypValue.Opts {

    /**
     * A kind of dimension.
     */
    dim: Kind<TUnit>;

  }

}

/**
 * CSS `calc()` function call representation.
 *
 * This is either a {@link StypAddSub addition/subtraction}, or {@link StypMulDiv multiplication/division}.
 *
 * @category CSS Value
 * @typeParam TUnit - Allowed unit type.
 */
export type StypCalc<TUnit extends string> = StypAddSub<TUnit> | StypMulDiv<TUnit>;

/**
 * CSS `calc()` function call representation containing either addition or subtraction.
 *
 * @category CSS Value
 * @typeParam TUnit - Allowed unit type.
 */
export interface StypAddSub<TUnit extends string> extends StypNumericStruct<StypAddSub<TUnit>, TUnit> {

  readonly type: 'calc';

  /**
   * Left operand.
   */
  readonly left: StypNumeric<TUnit>;

  /**
   * Operator.
   */
  readonly op: '+' | '-';

  /**
   * Right operand.
   */
  readonly right: StypNumeric<TUnit>;

}

/**
 * CSS `calc()` function call representation containing either multiplication or division.
 *
 * @category CSS Value
 * @typeParam TUnit - Allowed unit type.
 */
export interface StypMulDiv<TUnit extends string> extends StypNumericStruct<StypMulDiv<TUnit>, TUnit> {

  readonly type: 'calc';

  /**
   * Left operand.
   */
  readonly left: StypNumeric<TUnit>;

  /**
   * Operator.
   */
  readonly op: '*' | '/';

  /**
   * Right operand.
   */
  readonly right: number;

}
