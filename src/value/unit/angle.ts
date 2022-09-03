import { StypDimension, StypNumeric } from '../numeric';
import { unitlessZeroDimensionKind } from '../numeric/dimension-kind.impl';

/**
 * Structured [angle](https://developer.mozilla.org/en-US/docs/Web/CSS/angle) property value.
 *
 * Can be constructed using `StypAngle.of()` function.
 *
 * @category CSS Value
 */
export type StypAngle = StypNumeric<StypAngle.Unit>;

/**
 * @category CSS Value
 */
export namespace StypAngle {
  /**
   * Supported angle units, excluding percent.
   */
  export type Unit = 'deg' | 'grad' | 'rad' | 'turn';
}

/**
 * @category CSS Value
 */
export const StypAngle: StypDimension.Kind.UnitlessZero<StypAngle.Unit> =
  /*#__PURE__*/ unitlessZeroDimensionKind({
    pt() {
      return StypAnglePt;
    },
    noPt() {
      return StypAngle;
    },
  });

/**
 * Structured [angle-percentage](https://developer.mozilla.org/en-US/docs/Web/CSS/angle-percentage) CSS property value.
 *
 * Can be constructed using `StypAnglePt.of()` function.
 *
 * @category CSS Value
 */
export type StypAnglePt = StypNumeric<StypAnglePt.Unit>;

/**
 * @category CSS Value
 */
export namespace StypAnglePt {
  /**
   * Supported angle units, including percent.
   */
  export type Unit = StypAngle.Unit | '%';
}

/**
 * @category CSS Value
 */
export const StypAnglePt: StypDimension.Kind.UnitlessZero<StypAnglePt.Unit> =
  /*#__PURE__*/ unitlessZeroDimensionKind({
    pt() {
      return StypAnglePt;
    },
    noPt() {
      return StypAngle;
    },
  });
