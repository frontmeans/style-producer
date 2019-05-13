import { StypDimension, StypNumeric } from '../numeric';
import { unitlessZeroDimensionKind } from '../numeric.impl';

/**
 * Structured [<time>] property value.
 *
 * Can be constructed using `StypTime.of()` function.
 *
 * [<time>]: https://developer.mozilla.org/en-US/docs/Web/CSS/time
 */
export type StypTime = StypNumeric<StypTime.Unit>;

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
    /*#__PURE__*/ unitlessZeroDimensionKind({
  pt() {
    return StypTimePt; // tslint:disable-line:no-use-before-declare
  },
  noPt() {
    return StypTime;
  },
});

/**
 * Structured [<time-percentage>] CSS property value.
 *
 * Can be constructed using `StypTimePt.of()` function.
 *
 * [<time-percentage>]: https://developer.mozilla.org/en-US/docs/Web/CSS/time-percentage
 */
export type StypTimePt = StypNumeric<StypTimePt.Unit>;

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
    /*#__PURE__*/ unitlessZeroDimensionKind({
  pt() {
    return StypTimePt;
  },
  noPt() {
    return StypTime;
  },
});
