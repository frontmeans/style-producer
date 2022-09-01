import { StypDimension, StypNumeric } from '../numeric';
import { unitlessZeroDimensionKind } from '../numeric/dimension-kind.impl';

/**
 * Structured [time](https://developer.mozilla.org/en-US/docs/Web/CSS/time) property value.
 *
 * Can be constructed using `StypTime.of()` function.
 *
 * @category CSS Value
 */
export type StypTime = StypNumeric<StypTime.Unit>;

/**
 * @category CSS Value
 */
export namespace StypTime {
  /**
   * Supported time units, excluding percent.
   */
  export type Unit = 's' | 'ms';
}

/**
 * @category CSS Value
 */
export const StypTime: StypDimension.Kind.UnitlessZero<StypTime.Unit>
  /*#__PURE__*/ = unitlessZeroDimensionKind({
    pt() {
      return StypTimePt;
    },
    noPt() {
      return StypTime;
    },
  });

/**
 * Structured [time-percentage](https://developer.mozilla.org/en-US/docs/Web/CSS/time-percentage) CSS property value.
 *
 * Can be constructed using `StypTimePt.of()` function.
 *
 * @category CSS Value
 */
export type StypTimePt = StypNumeric<StypTimePt.Unit>;

/**
 * @category CSS Value
 */
export namespace StypTimePt {
  /**
   * Supported time units, including percent.
   */
  export type Unit = StypTime.Unit | '%';
}

/**
 * @category CSS Value
 */
export const StypTimePt: StypDimension.Kind.UnitlessZero<StypTimePt.Unit>
  /*#__PURE__*/ = unitlessZeroDimensionKind({
    pt() {
      return StypTimePt;
    },
    noPt() {
      return StypTime;
    },
  });
