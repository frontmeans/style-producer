import { StypDimension, stypDimension, StypNumeric } from '../numeric';
import { unitlessZeroDimensionKind } from '../numeric.impl';
import { StypZero } from '../zero';

/**
 * Structured [<length>] property value.
 *
 * Can be constructed using [[stypLength]] function.
 *
 * [<length>]: https://developer.mozilla.org/en-US/docs/Web/CSS/length
 */
export type StypLength = StypNumeric<StypLength.Unit>;

export namespace StypLength {

  /**
   * Supported length units, excluding percent.
   */
  export type Unit = 'cap' | 'ch' | 'em' | 'ex' | 'ic' | 'lh' | 'rem' | 'rlh'
      | 'vh' | 'vw' | 'vi' | 'vb' | 'vmin' | 'vmax'
      | 'px' | 'cm' | 'mm' | 'Q' | 'in' | 'pc' | 'pt';

}

/**
 * [<length>] dimension kind.
 *
 * [<length>]: https://developer.mozilla.org/en-US/docs/Web/CSS/length
 */
export const StypLength: StypDimension.Kind.UnitlessZero<StypLength.Unit> =
    /*#__PURE__*/ unitlessZeroDimensionKind();

/**
 * Constructs [<length>] CSS property value.
 *
 * @param val The numeric value.
 * @param unit Length unit.
 *
 * @returns Length value.
 *
 * [<length>]: https://developer.mozilla.org/en-US/docs/Web/CSS/length
 */
export function stypLength(val: number, unit: StypLength.Unit):
    StypDimension<StypLength.Unit> | StypZero<StypLength.Unit> {
  return stypDimension(val, unit, { dim: StypLength });
}

/**
 * Structured [<length-percentage>] CSS property value.
 *
 * Can be constructed using [[stypLengthPt]] function.
 *
 * [<length-percentage>]: https://developer.mozilla.org/en-US/docs/Web/CSS/length-percentage
 */
export type StypLengthPt = StypNumeric<StypLengthPt.Unit>;

export namespace StypLengthPt {

  /**
   * Supported length units, including percent.
   */
  export type Unit = StypLength.Unit | '%';

}

/**
 * [<length-percentage>] dimension kind.
 *
 * [<length-percentage>]: https://developer.mozilla.org/en-US/docs/Web/CSS/length-percentage
 */
export const StypLengthPt: StypDimension.Kind.UnitlessZero<StypLengthPt.Unit> =
    /*#__PURE__*/ unitlessZeroDimensionKind();

/**
 * Constructs [<length-percentage>] CSS property value.
 *
 * @param val The numeric value.
 * @param unit Length unit.
 *
 * @returns Length or percentage value.
 *
 * [<length-percentage>]: https://developer.mozilla.org/en-US/docs/Web/CSS/length-percentage
 */
export function stypLengthPt(val: number, unit: StypLengthPt.Unit):
    StypDimension<StypLengthPt.Unit> | StypZero<StypLengthPt.Unit> {
  return stypDimension(val, unit, { dim: StypLengthPt });
}
