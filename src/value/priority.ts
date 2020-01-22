/**
 * @packageDocumentation
 * @module style-producer
 */
import { IMPORTANT_CSS_SUFFIX } from '../internal';
import { StypValue } from './value';

/**
 * Predefined CSS property value priorities.
 *
 * @category CSS Value
 */
export const enum StypPriority {

  /**
   * Usual, non-important priority.
   *
   * This priority is assigned to values by [[StypValueStruct.usual]] method.
   */
  Usual = 0,

  /**
   * Default priority.
   *
   * The same as `Usual`. This priority is assigned to values by default.
   */
  Default = Usual,

  /**
   * Important priority.
   *
   * This priority corresponds to values with `!important` suffix. It is applied to string values with `!important`
   * suffix, and can be assigned to structured values using [[StypValueStruct.important]] method.
   *
   * All numeric priorities with higher values are rendered as `!important` ones.
   */
  Important = 1,

}

/**
 * Splits undefined CSS property value onto non-prioritized value and priority.
 *
 * @category CSS Value
 * @param value  Undefined CSS property value to split.
 *
 * @returns An `[undefined, 0]` tuple.
 */
export function stypSplitPriority<T extends StypValue>(value: undefined): [undefined, 0];

/**
 * Splits string CSS property value onto non-prioritized value and priority.
 *
 * @param value  CSS property value to split.
 *
 * @returns A tuple containing the value without `!priority` suffix, and numeric priority (0 or 1).
 */
export function stypSplitPriority(value: string): [string, 0 | 1];

/**
 * Splits scalar CSS property value onto non-prioritized value and priority.
 *
 * @param value  CSS property value to split.
 *
 * @returns A tuple containing the value and `0` priority.
 */
export function stypSplitPriority<T extends number | boolean>(value: T): [T, 0];

/**
 * Splits arbitrary CSS property value onto value non-prioritized value and priority.
 *
 * @param value  CSS property value to split.
 *
 * @returns A tuple containing the value and numeric priority.
 */
export function stypSplitPriority<T extends StypValue>(value: T): [T, number];

export function stypSplitPriority<T extends StypValue>(value: T): [T, number] {
  if (value == null) {
    return [undefined as T, StypPriority.Default];
  }

  switch (typeof value) {
    case 'object':
      return [value, value.priority];
    case 'string':
      if (value.endsWith(IMPORTANT_CSS_SUFFIX)) {
        return[value.substring(0, value.length - IMPORTANT_CSS_SUFFIX.length).trim() as T, StypPriority.Important];
      }
  }

  return [value, StypPriority.Default];
}
