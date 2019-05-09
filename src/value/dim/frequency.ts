import { StypNumber } from '../numeric';
import { StypZero } from '../zero';

/**
 * Structured [<frequency>] property value.
 *
 * Can be constructed using [[stypFrequency]] function.
 *
 * @typeparam ExtraDim Additional allowed dimension. Can be `%`. Not present by default.
 *
 * [<frequency>]: https://developer.mozilla.org/en-US/docs/Web/CSS/frequency
 */
export type StypFrequency<ExtraDim extends StypFrequencyPt.Dim = 'kHz'> =
    StypNumber<StypFrequency.Dim | ExtraDim> | StypZero<StypFrequency.Dim | ExtraDim>;

export namespace StypFrequency {

  /**
   * Supported frequency dimensions, excluding percent.
   */
  export type Dim = 'Hz' | 'kHz';

}

/**
 * Constructs [<frequency>] CSS property value.
 *
 * @typeparam ExtraDim Additional allowed dimension. Can be `%`. Not present by default.
 * @param val The numeric value.
 * @param dim Frequency dimension.
 *
 * @returns Frequency value.
 *
 * [<frequency>]: https://developer.mozilla.org/en-US/docs/Web/CSS/frequency
 */
export function stypFrequency<ExtraDim extends StypFrequencyPt.Dim>(
    val: number,
    dim: StypFrequency.Dim | ExtraDim): StypFrequency<ExtraDim> {
  return new StypNumber(val, dim);
}

/**
 * Structured [<frequency-percentage>] CSS property value.
 *
 * Can be constructed using [[stypFrequencyPt]] function.
 *
 * [<frequency-percentage>]: https://developer.mozilla.org/en-US/docs/Web/CSS/frequency-percentage
 */
export type StypFrequencyPt = StypFrequency<'%'>;

export namespace StypFrequencyPt {

  /**
   * Supported frequency dimensions, including percent.
   */
  export type Dim = StypFrequency.Dim | '%';

}

/**
 * Constructs [<frequency-percentage>] CSS property value.
 *
 * @param val The numeric value.
 * @param dim Frequency dimension.
 *
 * @returns Frequency or percentage value.
 *
 * [<frequency-percentage>]: https://developer.mozilla.org/en-US/docs/Web/CSS/frequency-percentage
 */
export function stypFrequencyPt(val: number, dim: StypFrequencyPt.Dim): StypFrequencyPt {
  return new StypNumber(val, dim);
}
