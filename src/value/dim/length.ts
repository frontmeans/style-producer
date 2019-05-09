import { StypNumber, stypNumber } from '../numeric';
import { StypZero } from '../zero';

/**
 * Structured [<length>] property value.
 *
 * Can be constructed using [[stypLength]] function.
 *
 * @typeparam ExtraDim Additional allowed dimension. Can be `%`. Not present by default.
 *
 * [<length>]: https://developer.mozilla.org/en-US/docs/Web/CSS/length
 */
export type StypLength<ExtraDim extends StypLengthPt.Dim = 'px'> =
    StypNumber<StypLength.Dim | ExtraDim> | StypZero<StypLength.Dim | ExtraDim>;

export namespace StypLength {

  /**
   * Supported length dimensions, excluding percent.
   */
  export type Dim = 'cap' | 'ch' | 'em' | 'ex' | 'ic' | 'lh' | 'rem' | 'rlh'
      | 'vh' | 'vw' | 'vi' | 'vb' | 'vmin' | 'vmax'
      | 'px' | 'cm' | 'mm' | 'Q' | 'in' | 'pc' | 'pt';

}

/**
 * Constructs [<length>] CSS property value.
 *
 * @typeparam ExtraDim Additional allowed dimension. Can be `%`. Not present by default.
 * @param val The numeric value.
 * @param dim Length dimension.
 *
 * @returns Length value.
 *
 * [<length>]: https://developer.mozilla.org/en-US/docs/Web/CSS/length
 */
export function stypLength<ExtraDim extends StypLengthPt.Dim>(
    val: number,
    dim: StypLength.Dim | ExtraDim): StypLength<ExtraDim> {
  return stypNumber(val, dim);
}

/**
 * Structured [<length-percentage>] CSS property value.
 *
 * Can be constructed using [[stypLengthPt]] function.
 *
 * [<length-percentage>]: https://developer.mozilla.org/en-US/docs/Web/CSS/length-percentage
 */
export type StypLengthPt = StypLength<'%'>;

export namespace StypLengthPt {

  /**
   * Supported length dimensions, including percent.
   */
  export type Dim = StypLength.Dim | '%';

}

/**
 * Constructs [<length-percentage>] CSS property value.
 *
 * @param val The numeric value.
 * @param dim Length dimension.
 *
 * @returns Length or percentage value.
 *
 * [<length-percentage>]: https://developer.mozilla.org/en-US/docs/Web/CSS/length-percentage
 */
export function stypLengthPt(val: number, dim: StypLengthPt.Dim): StypLengthPt {
  return stypNumber(val, dim);
}
