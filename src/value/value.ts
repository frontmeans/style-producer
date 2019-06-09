import { IMPORTANT_CSS_SUFFIX } from '../internal';
import { StypColor } from './color';
import { StypNumeric } from './numeric';
import { StypURL } from './url';

/**
 * CSS property value.
 *
 * This is either scalar value, or structured one.
 */
export type StypValue =
    string | number | boolean | undefined
    | StypNumeric<any>
    | StypURL
    | StypColor;

/**
 * Structured property CSS value. E.g. [<length>], [<percentage>], [<color>], etc.
 *
 * @typeparam Self A type of itself.
 *
 * [<length>]: https://developer.mozilla.org/en-US/docs/Web/CSS/length
 * [<percentage>]: https://developer.mozilla.org/en-US/docs/Web/CSS/percentage
 * [<color>]: https://developer.mozilla.org/en-US/docs/Web/CSS/color_value
 */
export abstract class StypValueStruct<Self extends StypValueStruct<Self>> {

  /**
   * CSS property value priority.
   *
   * The value `StypPriority.Important` and above means the property is `!important`. Everything else means normal
   * priority.
   */
  readonly priority: number;

  /**
   * Constructs structured CSS property value.
   *
   * @param opts Construction options.
   */
  protected constructor(opts?: StypValue.Opts) {
    this.priority = opts && opts.priority || 0;
  }

  /**
   * Checks whether this value equals to CSS property value.
   *
   * @param other CSS property value to compare with.
   */
  abstract is(other: StypValue): boolean;

  /**
   * Creates structured CSS value with the given `priority`.
   *
   * @param priority New priority.
   *
   * @returns Either a new value equal to this one but having the given `priority`, or this one if `priority` did
   * not change.
   */
  abstract prioritize(priority: number): Self;

  /**
   * Creates `!important` variant of this value.
   *
   * @returns Either a new value equal to this one but having `priority` equal to `1`, or this one if already the case.
   */
  important(): Self {
    return this.prioritize(1);
  }

  /**
   * Creates usual (not `!important`) variant of this value.
   *
   * @returns Either a new value equal to this one but having `priority` equal to `0`, or this one if already the case.
   */
  usual(): Self {
    return this.prioritize(0);
  }

  /**
   * Maps the given CSS property value to the value of this one's type. Defaults to this value if mapping is not
   * possible.
   *
   * This method allows to use an structured value instance as [CSS property mapping][[StypMapper.Mapping]].
   *
   * @param source A raw property value that should be converted.
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
     * The value `1` and above means the property is `!important`. Everything else means normal priority.
     */
    readonly priority?: number;

  }

}

/**
 * Splits undefined CSS property value onto non-prioritized value and priority.
 *
 * @param value Undefined CSS property value to split.
 *
 * @returns An `[undefined, 0]` tuple.
 */
export function stypSplitPriority<T extends StypValue>(value: undefined): [undefined, 0];

/**
 * Splits string CSS property value onto non-prioritized value and priority.
 *
 * @param value CSS property value to split.
 *
 * @returns A tuple containing the value without `!priority` suffix, and numeric priority (0 or 1).
 */
export function stypSplitPriority(value: string): [string, 0 | 1];

/**
 * Splits scalar CSS property value onto non-prioritized value and priority.
 *
 * @param value CSS property value to split.
 *
 * @returns A tuple containing the value and `0` priority.
 */
export function stypSplitPriority<T extends number | boolean>(value: T): [T, 0];

/**
 * Splits arbitrary CSS property value onto value non-prioritized value and priority.
 *
 * @param value CSS property value to split.
 *
 * @returns A tuple containing the value and numeric priority.
 */
export function stypSplitPriority<T extends StypValue>(value: T): [T, number];

export function stypSplitPriority<T extends StypValue>(value: T): [T, number] {
  if (value == null) {
    return [undefined as T, 0];
  }

  switch (typeof value) {
    case 'object':
      return [value, value.priority];
    case 'string':
      if (value.endsWith(IMPORTANT_CSS_SUFFIX)) {
        return[value.substring(0, value.length - IMPORTANT_CSS_SUFFIX.length).trim() as T, 1];
      }
  }

  return [value, 0];
}

/**
 * Checks whether two CSS property values are equal.
 *
 * Compares scalar values verbatim. Compares structured values using their `StypValueStruct.is()` method. The latter
 * method is applied when at least one of the values is structured.
 *
 * @param first The first CSS property value to compare.
 * @param second The second CSS property value to compare.
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
