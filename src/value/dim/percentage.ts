import { StypNumber, stypNumber } from '../numeric';
import { StypZero } from '../zero';

/**
 * Structured [<percentage>] property value.
 *
 * Can be constructed using [[stypPercentage]] function.
 *
 * @typeparam Dim Dimensions allowed in addition to `%`. Nothing but `%` by default.
 *
 * [<length>]: https://developer.mozilla.org/en-US/docs/Web/CSS/length
 */
export type StypPercentage<Dim extends string = '%'> = StypNumber<Dim | '%'> | StypZero<Dim | '%'>;

/**
 * Constructs [<percentage>] CSS property value.
 *
 * @param val The number of percents.
 *
 * @returns Percentage value.
 *
 * [<percentage>]: https://developer.mozilla.org/en-US/docs/Web/CSS/percentage
 */
export function stypPercentage<Dim extends string>(val: number): StypPercentage<Dim> {
  return stypNumber(val, '%');
}
