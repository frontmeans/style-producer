import { StypDimension, StypNumeric } from '../numeric';
import { unitZeroDimensionKind } from '../numeric/numeric.impl';

/**
 * Structured [resolution] property value.
 *
 * Can be constructed using `StypResolution.of()` function.
 *
 * [resolution]: https://developer.mozilla.org/en-US/docs/Web/CSS/resolution
 */
export type StypResolution = StypNumeric<StypResolution.Unit, StypDimension<StypResolution.Unit>>;

export namespace StypResolution {

  /**
   * Supported resolution units, excluding percent.
   */
  export type Unit = 'dpi' | 'dpcm' | 'dppx' | 'x';

}

/**
 * [resolution] dimension kind.
 *
 * [resolution]: https://developer.mozilla.org/en-US/docs/Web/CSS/resolution
 */
export const StypResolution: StypDimension.Kind.UnitZero<StypResolution.Unit> =
    /*#__PURE__*/ unitZeroDimensionKind({ zeroUnit: 'dpi' });
