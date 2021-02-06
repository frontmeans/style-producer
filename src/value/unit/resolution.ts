import { StypDimension, StypNumeric } from '../numeric';
import { unitZeroDimensionKind } from '../numeric/dimension-kind.impl';

/**
 * Structured [resolution](https://developer.mozilla.org/en-US/docs/Web/CSS/resolution) property value.
 *
 * Can be constructed using `StypResolution.of()` function.
 *
 * @category CSS Value
 */
export type StypResolution = StypNumeric<StypResolution.Unit, StypDimension<StypResolution.Unit>>;

/**
 * @category CSS Value
 */
export namespace StypResolution {

  /**
   * Supported resolution units, excluding percent.
   */
  export type Unit = 'dpi' | 'dpcm' | 'dppx' | 'x';

}

/**
 * @category CSS Value
 */
export const StypResolution: StypDimension.Kind.UnitZero<StypResolution.Unit> = (
    /*#__PURE__*/ unitZeroDimensionKind({ zeroUnit: 'dpi' })
);
