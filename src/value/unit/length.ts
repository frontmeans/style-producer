/**
 * @module style-producer
 */
import { StypDimension, StypNumeric } from '../numeric';
import { unitlessZeroDimensionKind } from '../numeric/dimension-kind.impl';

/**
 * Structured [length](https://developer.mozilla.org/en-US/docs/Web/CSS/length) property value.
 *
 * Can be constructed using `StypLength.of()` function.
 *
 * @category CSS Value
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

export const StypLength: StypDimension.Kind.UnitlessZero<StypLength.Unit> = (/*#__PURE__*/ unitlessZeroDimensionKind({
  pt() {
    return StypLengthPt;// eslint-disable-line @typescript-eslint/no-use-before-define
  },
  noPt() {
    return StypLength;
  },
}));

/**
 * Structured [length-percentage](https://developer.mozilla.org/en-US/docs/Web/CSS/length-percentage) CSS property
 * value.
 *
 * Can be constructed using `StypLengthPt.of()` function.
 *
 * @category CSS Value
 */
export type StypLengthPt = StypNumeric<StypLengthPt.Unit>;

export namespace StypLengthPt {

  /**
   * Supported length units, including percent.
   */
  export type Unit = StypLength.Unit | '%';

}

export const StypLengthPt: StypDimension.Kind.UnitlessZero<StypLengthPt.Unit> = (
    /*#__PURE__*/ unitlessZeroDimensionKind({
      pt() {
        return StypLengthPt;
      },
      noPt() {
        return StypLength;
      },
    })
);
