import { StypNumber, stypNumber } from '../numeric';
import { StypZero } from '../zero';

/**
 * Structured [<angle>] property value.
 *
 * Can be constructed using [[stypAngle]] function.
 *
 * @typeparam ExtraDim Additional allowed dimension. Can be `%`. Not present by default.
 *
 * [<angle>]: https://developer.mozilla.org/en-US/docs/Web/CSS/angle
 */
export type StypAngle<ExtraDim extends StypAnglePt.Dim = 'deg'> =
    StypNumber<StypAngle.Dim | ExtraDim> | StypZero<StypAngle.Dim | ExtraDim>;

export namespace StypAngle {

  /**
   * Supported angle dimensions, excluding percent.
   */
  export type Dim = 'deg' | 'grad' | 'rad' | 'turn';

}

/**
 * Constructs [<angle>] CSS property value.
 *
 * @typeparam ExtraDim Additional allowed dimension. Can be `%`. Not present by default.
 * @param val The numeric value.
 * @param dim Angle dimension.
 *
 * @returns Angle value.
 *
 * [<angle>]: https://developer.mozilla.org/en-US/docs/Web/CSS/angle
 */
export function stypAngle<ExtraDim extends StypAnglePt.Dim>(
    val: number,
    dim: StypAngle.Dim | ExtraDim): StypAngle<ExtraDim> {
  return stypNumber(val, dim);
}

/**
 * Structured [<angle-percentage>] CSS property value.
 *
 * Can be constructed using [[stypAnglePt]] function.
 *
 * [<angle-percentage>]: https://developer.mozilla.org/en-US/docs/Web/CSS/angle-percentage
 */
export type StypAnglePt = StypAngle<'%'>;

export namespace StypAnglePt {

  /**
   * Supported angle dimensions, including percent.
   */
  export type Dim = StypAngle.Dim | '%';

}

/**
 * Constructs [<angle-percentage>] CSS property value.
 *
 * @param val The numeric value.
 * @param dim Angle dimension.
 *
 * @returns Angle or percentage value.
 *
 * [<angle-percentage>]: https://developer.mozilla.org/en-US/docs/Web/CSS/angle-percentage
 */
export function stypAnglePt(val: number, dim: StypAnglePt.Dim): StypAnglePt {
  return stypNumber(val, dim);
}
