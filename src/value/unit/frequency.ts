import { StypDimension } from '../numeric';
import { StypZero } from '../zero';

/**
 * Structured [<frequency>] property value.
 *
 * Can be constructed using [[stypFrequency]] function.
 *
 * @typeparam ExtraUnit Additional allowed unit. Can be `%`. Not present by default.
 *
 * [<frequency>]: https://developer.mozilla.org/en-US/docs/Web/CSS/frequency
 */
export type StypFrequency<ExtraUnit extends StypFrequencyPt.Unit = 'kHz'> =
    StypDimension<StypFrequency.Unit | ExtraUnit> | StypZero<StypFrequency.Unit | ExtraUnit>;

export namespace StypFrequency {

  /**
   * Supported frequency units, excluding percent.
   */
  export type Unit = 'Hz' | 'kHz';

}

/**
 * Constructs [<frequency>] CSS property value.
 *
 * @typeparam ExtraUnit Additional allowed unit. Can be `%`. Not present by default.
 * @param val The numeric value.
 * @param unit Frequency unit.
 *
 * @returns Frequency value.
 *
 * [<frequency>]: https://developer.mozilla.org/en-US/docs/Web/CSS/frequency
 */
export function stypFrequency<ExtraUnit extends StypFrequencyPt.Unit>(
    val: number,
    unit: StypFrequency.Unit | ExtraUnit): StypFrequency<ExtraUnit> {
  return new StypDimension(val, unit);
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
   * Supported frequency units, including percent.
   */
  export type Unit = StypFrequency.Unit | '%';

}

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
  return new StypDimension(val, unit);
}
