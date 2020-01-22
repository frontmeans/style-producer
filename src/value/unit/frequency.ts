/**
 * @packageDocumentation
 * @module style-producer
 */
import { StypDimension, StypNumeric } from '../numeric';
import { unitZeroDimensionKind } from '../numeric/dimension-kind.impl';

/**
 * Structured [frequency](https://developer.mozilla.org/en-US/docs/Web/CSS/frequency) CSS property value.
 *
 * Can be constructed using `StypFrequency.of()` function.
 *
 * @category CSS Value
 */
export type StypFrequency = StypNumeric<StypFrequency.Unit, StypDimension<StypFrequency.Unit>>;

export namespace StypFrequency {

  /**
   * Supported frequency units, excluding percent.
   */
  export type Unit = 'Hz' | 'kHz';

}

export const StypFrequency: StypDimension.Kind.UnitZero<StypFrequency.Unit> = (/*#__PURE__*/ unitZeroDimensionKind({
  zeroUnit: 'kHz',
  withPercent() {
    return StypFrequencyPt;// eslint-disable-line @typescript-eslint/no-use-before-define
  },
  noPercent() {
    return StypFrequency;
  },
}));

/**
 * Structured [frequency-percentage](https://developer.mozilla.org/en-US/docs/Web/CSS/frequency-percentage) CSS
 * property value.
 *
 * Can be constructed using `StypFrequencyPt.of()` function.
 *
 * @category CSS Value
 */
export type StypFrequencyPt = StypNumeric<StypFrequencyPt.Unit, StypDimension<StypFrequencyPt.Unit>>;

export namespace StypFrequencyPt {

  /**
   * Supported frequency units, including percent.
   */
  export type Unit = StypFrequency.Unit | '%';

}

export const StypFrequencyPt: StypDimension.Kind.UnitZero<StypFrequencyPt.Unit> = (/*#__PURE__*/ unitZeroDimensionKind({
  zeroUnit: 'kHz',
  withPercent() {
    return StypFrequencyPt;
  },
  noPercent() {
    return StypFrequency;
  },
}));
