import { StypDimension, stypDimension, StypNumeric } from '../numeric';
import { unitlessZeroDimensionKind } from '../numeric.impl';
import { StypZero } from '../zero';

/**
 * Structured [<angle>] property value.
 *
 * Can be constructed using [[stypAngle]] function.
 *
 * [<angle>]: https://developer.mozilla.org/en-US/docs/Web/CSS/angle
 */
export type StypAngle = StypNumeric<StypAngle.Unit>;

export namespace StypAngle {

  /**
   * Supported angle units, excluding percent.
   */
  export type Unit = 'deg' | 'grad' | 'rad' | 'turn';

}

/**
 * [<angle>] dimension kind.
 *
 * [<angle>]: https://developer.mozilla.org/en-US/docs/Web/CSS/angle
 */
export const StypAngle: StypDimension.Kind.UnitlessZero<StypAngle.Unit> =
    /*#__PURE__*/ unitlessZeroDimensionKind();

/**
 * Constructs [<angle>] CSS property value.
 *
 * @param val The numeric value.
 * @param unit Angle unit.
 *
 * @returns Angle value.
 *
 * [<angle>]: https://developer.mozilla.org/en-US/docs/Web/CSS/angle
 */
export function stypAngle(val: number, unit: StypAngle.Unit):
    StypDimension<StypAngle.Unit> | StypZero<StypAngle.Unit> {
  return stypDimension(val, unit, { dim: StypAngle });
}

/**
 * Structured [<angle-percentage>] CSS property value.
 *
 * Can be constructed using [[stypAnglePt]] function.
 *
 * [<angle-percentage>]: https://developer.mozilla.org/en-US/docs/Web/CSS/angle-percentage
 */
export type StypAnglePt = StypNumeric<StypAnglePt.Unit>;

export namespace StypAnglePt {

  /**
   * Supported angle units, including percent.
   */
  export type Unit = StypAngle.Unit | '%';

}

/**
 * [<angle-percentage>] dimension kind.
 *
 * [<angle-percentage>]: https://developer.mozilla.org/en-US/docs/Web/CSS/angle-percentage
 */
export const StypAnglePt: StypDimension.Kind.UnitlessZero<StypAnglePt.Unit> =
    /*#__PURE__*/ unitlessZeroDimensionKind();

/**
 * Constructs [<angle-percentage>] CSS property value.
 *
 * @param val The numeric value.
 * @param unit Angle unit.
 *
 * @returns Angle or percentage value.
 *
 * [<angle-percentage>]: https://developer.mozilla.org/en-US/docs/Web/CSS/angle-percentage
 */
export function stypAnglePt(val: number, unit: StypAnglePt.Unit):
    StypDimension<StypAnglePt.Unit> | StypZero<StypAnglePt.Unit> {
  return stypDimension(val, unit, { dim: StypAnglePt });
}
