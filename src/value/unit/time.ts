import { StypDimension, stypDimension } from '../numeric';
import { unitlessZeroDimensionKind } from '../numeric.impl';
import { StypZero } from '../zero';

/**
 * Structured [<time>] property value.
 *
 * Can be constructed using [[stypTime]] function.
 *
 * [<time>]: https://developer.mozilla.org/en-US/docs/Web/CSS/time
 */
export type StypTime = StypDimension<StypTime.Unit> | StypZero<StypTime.Unit>;

export namespace StypTime {

  /**
   * Supported time units, excluding percent.
   */
  export type Unit = 's' | 'ms';

}

/**
 * [<time>] dimension kind.
 *
 * [<time>]: https://developer.mozilla.org/en-US/docs/Web/CSS/time
 */
export const StypTime: StypDimension.Kind.UnitlessZero<StypTime.Unit> =
    /*#__PURE__*/ unitlessZeroDimensionKind();

/**
 * Constructs [<time>] CSS property value.
 *
 * @param val The numeric value.
 * @param unit Time unit.
 *
 * @returns Time value.
 *
 * [<time>]: https://developer.mozilla.org/en-US/docs/Web/CSS/time
 */
export function stypTime(val: number, unit: StypTime.Unit): StypTime {
  return stypDimension(val, unit, { dim: StypTime });
}

/**
 * Structured [<time-percentage>] CSS property value.
 *
 * Can be constructed using [[stypTimePt]] function.
 *
 * [<time-percentage>]: https://developer.mozilla.org/en-US/docs/Web/CSS/time-percentage
 */
export type StypTimePt = StypDimension<StypTimePt.Unit> | StypZero<StypTimePt.Unit>;

export namespace StypTimePt {

  /**
   * Supported time units, including percent.
   */
  export type Unit = StypTime.Unit | '%';

}

/**
 * [<time-percentage>] dimension kind.
 *
 * [<time-percentage>]: https://developer.mozilla.org/en-US/docs/Web/CSS/time-percentage
 */
export const StypTimePt: StypDimension.Kind.UnitlessZero<StypTimePt.Unit> =
    /*#__PURE__*/ unitlessZeroDimensionKind();

/**
 * Constructs [<time-percentage>] CSS property value.
 *
 * @param val The numeric value.
 * @param unit Time unit.
 *
 * @returns Time or percentage value.
 *
 * [<time-percentage>]: https://developer.mozilla.org/en-US/docs/Web/CSS/time-percentage
 */
export function stypTimePt(val: number, unit: StypTimePt.Unit): StypTimePt {
  return stypDimension(val, unit, { dim: StypTimePt });
}
