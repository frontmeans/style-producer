import { StypDimension } from '../numeric';
import { unitZeroDimensionKind } from '../numeric.impl';

/**
 * Structured [<frequency>] property value.
 *
 * Can be constructed using [[stypFrequency]] function.
 *
 * [<frequency>]: https://developer.mozilla.org/en-US/docs/Web/CSS/frequency
 */
export type StypFrequency = StypDimension<StypFrequency.Unit>;

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
export const StypFrequency: StypDimension.Kind.UnitZero<StypFrequency.Unit> =
    /*#__PURE__*/ unitZeroDimensionKind('kHz');

/**
 * Constructs [<frequency>] CSS property value.
 *
 * @param val The numeric value.
 * @param unit Frequency unit.
 *
 * @returns Frequency value.
 *
 * [<frequency>]: https://developer.mozilla.org/en-US/docs/Web/CSS/frequency
 */
export function stypFrequency(val: number, unit: StypFrequency.Unit): StypFrequency {
  return new StypDimension(val, unit, { dim: StypFrequency });
}

/**
 * Structured [<frequency-percentage>] CSS property value.
 *
 * Can be constructed using [[stypFrequencyPt]] function.
 *
 * [<frequency-percentage>]: https://developer.mozilla.org/en-US/docs/Web/CSS/frequency-percentage
 */
export type StypFrequencyPt = StypDimension<StypFrequencyPt.Unit>;

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
export const StypFrequencyPt: StypDimension.Kind.UnitZero<StypFrequencyPt.Unit> =
    /*#__PURE__*/ unitZeroDimensionKind('kHz');

/**
 * Constructs [<frequency-percentage>] CSS property value.
 *
 * @param val The numeric value.
 * @param unit Frequency unit.
 *
 * @returns Frequency or percentage value.
 *
 * [<frequency-percentage>]: https://developer.mozilla.org/en-US/docs/Web/CSS/frequency-percentage
 */
export function stypFrequencyPt(val: number, unit: StypFrequencyPt.Unit): StypFrequencyPt {
  return new StypDimension(val, unit, { dim: StypFrequencyPt });
}
