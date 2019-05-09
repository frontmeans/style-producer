import { StypDimension, stypDimension } from '../numeric';
import { StypZero } from '../zero';

/**
 * Structured [<length>] property value.
 *
 * Can be constructed using [[stypLength]] function.
 *
 * @typeparam ExtraUnit Additional allowed unit. Can be `%`. Not present by default.
 *
 * [<length>]: https://developer.mozilla.org/en-US/docs/Web/CSS/length
 */
export type StypLength<ExtraUnit extends StypLengthPt.Unit = 'px'> =
    StypDimension<StypLength.Unit | ExtraUnit> | StypZero<StypLength.Unit | ExtraUnit>;

export namespace StypLength {

  /**
   * Supported length units, excluding percent.
   */
  export type Unit = 'cap' | 'ch' | 'em' | 'ex' | 'ic' | 'lh' | 'rem' | 'rlh'
      | 'vh' | 'vw' | 'vi' | 'vb' | 'vmin' | 'vmax'
      | 'px' | 'cm' | 'mm' | 'Q' | 'in' | 'pc' | 'pt';

}

/**
 * Constructs [<length>] CSS property value.
 *
 * @typeparam ExtraUnit Additional allowed unit. Can be `%`. Not present by default.
 * @param val The numeric value.
 * @param unit Length unit.
 *
 * @returns Length value.
 *
 * [<length>]: https://developer.mozilla.org/en-US/docs/Web/CSS/length
 */
export function stypLength<ExtraUnit extends StypLengthPt.Unit>(
    val: number,
    unit: StypLength.Unit | ExtraUnit): StypLength<ExtraUnit> {
  return stypDimension(val, unit);
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
   * Supported length units, including percent.
   */
  export type Unit = StypLength.Unit | '%';

}

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
export function stypLengthPt(val: number, unit: StypLengthPt.Unit): StypLengthPt {
  return stypDimension(val, unit);
}
