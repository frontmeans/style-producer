import { StypDimension, StypNumeric } from '../numeric';
import { unitZeroDimensionKind } from '../numeric.impl';

/**
 * Structured [<frequency>] property value.
 *
 * Can be constructed using `StypFrequency.of()` function.
 *
 * [<frequency>]: https://developer.mozilla.org/en-US/docs/Web/CSS/frequency
 */
export type StypFrequency = StypNumeric<StypFrequency.Unit, StypDimension<StypFrequency.Unit>>;

export namespace StypFrequency {

  /**
   * Supported frequency units, excluding percent.
   */
  export type Unit = 'Hz' | 'kHz';

}

/**
 * [<frequency>] dimension kind.
 *
 * [<frequency>]: https://developer.mozilla.org/en-US/docs/Web/CSS/frequency
 */
export const StypFrequency: StypDimension.Kind.UnitZero<StypFrequency.Unit> = /*#__PURE__*/ unitZeroDimensionKind({
  zeroUnit: 'kHz',
  withPercent() {
    return StypFrequencyPt; // tslint:disable-line:no-use-before-declare
  },
  noPercent() {
    return StypFrequency;
  },
});

/**
 * Structured [<frequency-percentage>] CSS property value.
 *
 * Can be constructed using `StypFrequencyPt.of()` function.
 *
 * [<frequency-percentage>]: https://developer.mozilla.org/en-US/docs/Web/CSS/frequency-percentage
 */
export type StypFrequencyPt = StypNumeric<StypFrequencyPt.Unit, StypDimension<StypFrequencyPt.Unit>>;

export namespace StypFrequencyPt {

  /**
   * Supported frequency units, including percent.
   */
  export type Unit = StypFrequency.Unit | '%';

}

/**
 * [<frequency-percentage>] dimension kind.
 *
 * [<frequency-percentage>]: https://developer.mozilla.org/en-US/docs/Web/CSS/frequency-percentage
 */
export const StypFrequencyPt: StypDimension.Kind.UnitZero<StypFrequencyPt.Unit> = /*#__PURE__*/ unitZeroDimensionKind({
  zeroUnit: 'kHz',
  withPercent() {
    return StypFrequencyPt;
  },
  noPercent() {
    return StypFrequency;
  },
});
