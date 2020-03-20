/**
 * @packageDocumentation
 * @module @proc7ts/style-producer
 */
import { StypColor } from './color';
import { StypNumeric } from './numeric';
import { StypPriority } from './priority';
import { StypURL } from './url';

/**
 * CSS property value.
 *
 * This is either a scalar value, or {@link StypValueStruct structured} one.
 *
 * @category CSS Value
 */
export type StypValue =
    | string
    | number
    | boolean
    | undefined
    | StypNumeric<any>
    | StypURL
    | StypColor;

/**
 * Structured property CSS value. E.g. [length](https://developer.mozilla.org/en-US/docs/Web/CSS/length),
 * [percentage](https://developer.mozilla.org/en-US/docs/Web/CSS/percentage),
 * [color](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value), etc.
 *
 * @category CSS Value
 * @typeparam Self  A type of itself.
 */
export abstract class StypValueStruct<Self extends StypValueStruct<Self>> {

  /**
   * CSS property value priority.
   *
   * The value [[StypPriority.Important]] and above means the property is `!important`. Everything else means normal
   * priority.
   *
   * The property value with higher priority number takes precedence over the one with lower one.
   */
  readonly priority: number;

  /**
   * Constructs structured CSS property value.
   *
   * @param opts  Construction options.
   */
  protected constructor(opts?: StypValue.Opts) {
    this.priority = opts && opts.priority || StypPriority.Default;
  }

  /**
   * Checks whether this value equals to CSS property value.
   *
   * @param other  CSS property value to compare with.
   */
  abstract is(other: StypValue): boolean;

  /**
   * Creates structured CSS value with the given `priority`.
   *
   * @param priority  New priority.
   *
   * @returns Either a new value equal to this one but having the given `priority`, or this one if `priority` did
   * not change.
   */
  abstract prioritize(priority: number): Self;

  /**
   * Creates `!important` variant of this value.
   *
   * @returns Either a new value equal to this one but having `priority` equal to [[StypPriority.Important]],
   * or this one if already the case.
   */
  important(): Self {
    return this.prioritize(StypPriority.Important);
  }

  /**
   * Creates usual (not `!important`) variant of this value.
   *
   * @returns Either a new value equal to this one but having `priority` equal to [[StypPriority.Usual]],
   * or this one if already the case.
   */
  usual(): Self {
    return this.prioritize(StypPriority.Usual);
  }

  /**
   * Maps the given CSS property value to the value of this one's type. Defaults to this value if mapping is not
   * possible.
   *
   * This method allows to use an structured value instance as {@link StypMapper.Mapping CSS property mapping}.
   *
   * @param source  A raw property value that should be converted.
   *
   * @returns Mapped property value.
   */
  abstract by(source: StypValue): StypValue;

  /**
   * Returns textual representation of this value.
   *
   * Textual representation never contains an `!important` suffix.
   *
   * @returns A textual representation of this value to use as CSS property value.
   */
  abstract toString(): string;

}

export namespace StypValue {

  /**
   * Construction options of structured property CSS value.
   */
  export interface Opts {

    /**
     * Constructed value priority.
     *
     * The value [[StypPriority.Important]] and above means the property is `!important`. Everything else means normal
     * priority.
     */
    readonly priority?: number;

  }

}

/**
 * Checks whether two CSS property values are equal.
 *
 * Compares scalar values verbatim. Compares structured values using their [[StypValueStruct.is]] method. The latter
 * method is applied when at least one of the values is structured.
 *
 * @category CSS Value
 * @param first  The first CSS property value to compare.
 * @param second  The second CSS property value to compare.
 *
 * @returns `true` if `first` equals to `second`, or `false otherwise.
 */
export function stypValuesEqual(first: StypValue, second: StypValue): boolean {
  if (first === second) {
    return true;
  }
  if (typeof first === 'object') {
    return first.is(second);
  }
  if (typeof second === 'object') {
    return second.is(first);
  }
  return false;
}
