import { StypDimension, StypNumeric } from '../numeric';
import { unitlessZeroDimensionKind } from '../numeric/dimension-kind.impl';

/**
 * Structured [angle] property value.
 *
 * Can be constructed using `StypAngle.of()` function.
 *
 * [angle]: https://developer.mozilla.org/en-US/docs/Web/CSS/angle
 */
export type StypAngle = StypNumeric<StypAngle.Unit>;

export namespace StypAngle {

  /**
   * Supported angle units, excluding percent.
   */
  export type Unit = 'deg' | 'grad' | 'rad' | 'turn';

}

/**
 * [angle] dimension kind.
 *
 * [angle]: https://developer.mozilla.org/en-US/docs/Web/CSS/angle
 */
export const StypAngle: StypDimension.Kind.UnitlessZero<StypAngle.Unit> = /*#__PURE__*/ unitlessZeroDimensionKind({
  pt() {
    return StypAnglePt;
  },
  noPt() {
    return StypAngle;
  },
});

/**
 * Structured [angle-percentage] CSS property value.
 *
 * Can be constructed using `StypAnglePt.of()` function.
 *
 * [angle-percentage]: https://developer.mozilla.org/en-US/docs/Web/CSS/angle-percentage
 */
export type StypAnglePt = StypNumeric<StypAnglePt.Unit>;

export namespace StypAnglePt {

  /**
   * Supported angle units, including percent.
   */
  export type Unit = StypAngle.Unit | '%';

}

/**
 * [angle-percentage] dimension kind.
 *
 * [angle-percentage]: https://developer.mozilla.org/en-US/docs/Web/CSS/angle-percentage
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
