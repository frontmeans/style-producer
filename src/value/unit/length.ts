import { StypDimension, StypNumeric } from '../numeric';
import { unitlessZeroDimensionKind } from '../numeric.impl';

/**
 * Structured [<length>] property value.
 *
 * Can be constructed using `StypLength.of()` function.
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
    /*#__PURE__*/ unitlessZeroDimensionKind({
  pt() {
    return StypLengthPt;
  },
  noPt() {
    return StypLength;
  },
});

/**
 * Structured [<length-percentage>] CSS property value.
 *
 * Can be constructed using `StypLengthPt.of()` function.
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
    /*#__PURE__*/ unitlessZeroDimensionKind({
  pt() {
    return StypLengthPt;
  },
  noPt() {
    return StypLength;
  },
});
