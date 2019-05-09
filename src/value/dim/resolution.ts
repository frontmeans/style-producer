import { StypNumber } from '../numeric';
import { StypZero } from '../zero';

/**
 * Structured [<resolution>] property value.
 *
 * Can be constructed using [[stypResolution]] function.
 *
 * [<resolution>]: https://developer.mozilla.org/en-US/docs/Web/CSS/resolution
 */
export type StypResolution = StypNumber<StypResolution.Dim> | StypZero<StypResolution.Dim>;

export namespace StypResolution {

  /**
   * Supported resolution dimensions, excluding percent.
   */
  export type Dim = 'dpi' | 'dpcm' | 'dppx' | 'x';

}

/**
 * Constructs [<resolution>] CSS property value.
 *
 * @param val The numeric value.
 * @param dim Resolution dimension.
 *
 * @returns Resolution value.
 *
 * [<resolution>]: https://developer.mozilla.org/en-US/docs/Web/CSS/resolution
 */
export function stypResolution(val: number, dim: StypResolution.Dim): StypResolution {
  return new StypNumber(val, dim);
}
