import { StypDimension, stypDimension } from '../numeric';
import { StypZero } from '../zero';

/**
 * Structured [<time>] property value.
 *
 * Can be constructed using [[stypTime]] function.
 *
 * @typeparam ExtraUnit Additional allowed unit. Can be `%`. Not present by default.
 *
 * [<time>]: https://developer.mozilla.org/en-US/docs/Web/CSS/time
 */
export type StypTime<ExtraUnit extends StypTimePt.Unit = 'ms'> =
    StypDimension<StypTime.Unit | ExtraUnit> | StypZero<StypTime.Unit | ExtraUnit>;

export namespace StypTime {

  /**
   * Supported time units, excluding percent.
   */
  export type Unit = 's' | 'ms';

}

/**
 * Constructs [<time>] CSS property value.
 *
 * @typeparam ExtraUnit Additional allowed unit. Can be `%`. Not present by default.
 * @param val The numeric value.
 * @param unit Time unit.
 *
 * @returns Time value.
 *
 * [<time>]: https://developer.mozilla.org/en-US/docs/Web/CSS/time
 */
export function stypTime<ExtraUnit extends StypTimePt.Unit>(
    val: number,
    unit: StypTime.Unit | ExtraUnit): StypTime<ExtraUnit> {
  return stypDimension(val, unit);
}

/**
 * Structured [<time-percentage>] CSS property value.
 *
 * Can be constructed using [[stypTimePt]] function.
 *
 * [<time-percentage>]: https://developer.mozilla.org/en-US/docs/Web/CSS/time-percentage
 */
export type StypTimePt = StypTime<'%'>;

export namespace StypTimePt {

  /**
   * Supported time units, including percent.
   */
  export type Unit = StypTime.Unit | '%';

}

/**
 * Constructs [<time-percentage>] CSS property value.
 *
 * @param val The numeric value.
 * @param unit Time unit.
 *
 * @returns Time or percentage value.
 *
 * [<time-percentage>]: https://developer.mozilla.org/en-US/docs/Web/CSS/time-percentage
 */
export function stypTimePt(val: number, unit: StypTimePt.Unit): StypTimePt {
  return stypDimension(val, unit);
}
