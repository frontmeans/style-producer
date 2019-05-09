import { StypNumber } from '../numeric';
import { StypZero } from '../zero';

/**
 * Structured [<resolution>] property value.
 *
 * Can be constructed using [[stypResolution]] function.
 *
 * [<resolution>]: https://developer.mozilla.org/en-US/docs/Web/CSS/resolution
 */
export type StypResolution = StypNumber<StypResolution.Unit> | StypZero<StypResolution.Unit>;

export namespace StypResolution {

  /**
   * Supported resolution units, excluding percent.
   */
  export type Unit = 'dpi' | 'dpcm' | 'dppx' | 'x';

}

/**
 * Constructs [<resolution>] CSS property value.
 *
 * @param val The numeric value.
 * @param unit Resolution unit.
 *
 * @returns Resolution value.
 *
 * [<resolution>]: https://developer.mozilla.org/en-US/docs/Web/CSS/resolution
 */
export function stypResolution(val: number, unit: StypResolution.Unit): StypResolution {
  return new StypNumber(val, unit);
}
