import { StypNumber, stypNumber } from '../numeric';
import { StypZero } from '../zero';

/**
 * Structured [<time>] property value.
 *
 * Can be constructed using [[stypTime]] function.
 *
 * @typeparam ExtraDim Additional allowed dimension. Can be `%`. Not present by default.
 *
 * [<time>]: https://developer.mozilla.org/en-US/docs/Web/CSS/time
 */
export type StypTime<ExtraDim extends StypTimePt.Dim = 'ms'> =
    StypNumber<StypTime.Dim | ExtraDim> | StypZero<StypTime.Dim | ExtraDim>;

export namespace StypTime {

  /**
   * Supported time dimensions, excluding percent.
   */
  export type Dim = 's' | 'ms';

}

/**
 * Constructs [<time>] CSS property value.
 *
 * @typeparam ExtraDim Additional allowed dimension. Can be `%`. Not present by default.
 * @param val The numeric value.
 * @param dim Time dimension.
 *
 * @returns Time value.
 *
 * [<time>]: https://developer.mozilla.org/en-US/docs/Web/CSS/time
 */
export function stypTime<ExtraDim extends StypTimePt.Dim>(
    val: number,
    dim: StypTime.Dim | ExtraDim): StypTime<ExtraDim> {
  return stypNumber(val, dim);
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
   * Supported time dimensions, including percent.
   */
  export type Dim = StypTime.Dim | '%';

}

/**
 * Constructs [<time-percentage>] CSS property value.
 *
 * @param val The numeric value.
 * @param dim Time dimension.
 *
 * @returns Time or percentage value.
 *
 * [<time-percentage>]: https://developer.mozilla.org/en-US/docs/Web/CSS/time-percentage
 */
export function stypTimePt(val: number, dim: StypTimePt.Dim): StypTimePt {
  return stypNumber(val, dim);
}
