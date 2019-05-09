import { StypNumber, stypNumber } from '../numeric';
import { StypZero } from '../zero';

/**
 * Structured [<percentage>] property value.
 *
 * Can be constructed using [[stypPercentage]] function.
 *
 * @typeparam Unit Units allowed in addition to `%`. Nothing but `%` by default.
 *
 * [<length>]: https://developer.mozilla.org/en-US/docs/Web/CSS/length
 */
export type StypPercentage<Unit extends string = '%'> = StypNumber<Unit | '%'> | StypZero<Unit | '%'>;

/**
 * Constructs [<percentage>] CSS property value.
 *
 * @param val The number of percents.
 *
 * @returns Percentage value.
 *
 * [<percentage>]: https://developer.mozilla.org/en-US/docs/Web/CSS/percentage
 */
export function stypPercentage<Unit extends string>(val: number): StypPercentage<Unit> {
  return stypNumber(val, '%');
}
