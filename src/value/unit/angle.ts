import { StypDimension, stypDimension } from '../numeric';
import { StypZero } from '../zero';

/**
 * Structured [<angle>] property value.
 *
 * Can be constructed using [[stypAngle]] function.
 *
 * @typeparam ExtraUnit Additional allowed unit. Can be `%`. Not present by default.
 *
 * [<angle>]: https://developer.mozilla.org/en-US/docs/Web/CSS/angle
 */
export type StypAngle<ExtraUnit extends StypAnglePt.Unit = 'deg'> =
    StypDimension<StypAngle.Unit | ExtraUnit> | StypZero<StypAngle.Unit | ExtraUnit>;

export namespace StypAngle {

  /**
   * Supported angle units, excluding percent.
   */
  export type Unit = 'deg' | 'grad' | 'rad' | 'turn';

}

/**
 * Constructs [<angle>] CSS property value.
 *
 * @typeparam ExtraUnit Additional allowed unit. Can be `%`. Not present by default.
 * @param val The numeric value.
 * @param unit Angle unit.
 *
 * @returns Angle value.
 *
 * [<angle>]: https://developer.mozilla.org/en-US/docs/Web/CSS/angle
 */
export function stypAngle<ExtraUnit extends StypAnglePt.Unit>(
    val: number,
    unit: StypAngle.Unit | ExtraUnit): StypAngle<ExtraUnit> {
  return stypDimension(val, unit);
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
   * Supported angle units, including percent.
   */
  export type Unit = StypAngle.Unit | '%';

}

/**
 * Constructs [<angle-percentage>] CSS property value.
 *
 * @param val The numeric value.
 * @param unit Angle unit.
 *
 * @returns Angle or percentage value.
 *
 * [<angle-percentage>]: https://developer.mozilla.org/en-US/docs/Web/CSS/angle-percentage
 */
export function stypAnglePt(val: number, unit: StypAnglePt.Unit): StypAnglePt {
  return stypDimension(val, unit);
}
