import { StypDimension } from '../numeric';
import { unitZeroDimensionKind } from '../numeric.impl';

/**
 * Structured [<resolution>] property value.
 *
 * Can be constructed using [[stypResolution]] function.
 *
 * [<resolution>]: https://developer.mozilla.org/en-US/docs/Web/CSS/resolution
 */
export type StypResolution = StypDimension<StypResolution.Unit>;

export namespace StypResolution {

  /**
   * Supported resolution units, excluding percent.
   */
  export type Unit = 'dpi' | 'dpcm' | 'dppx' | 'x';

}

/**
 * [<resolution>] dimension kind.
 *
 * [<resolution>]: https://developer.mozilla.org/en-US/docs/Web/CSS/resolution
 */
export const StypResolution: StypDimension.Kind.UnitZero<StypResolution.Unit> =
    /*#__PURE__*/ unitZeroDimensionKind('dpi');

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
  return new StypDimension(val, unit, { dim: StypResolution });
}
