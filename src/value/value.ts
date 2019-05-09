import { IMPORTANT_CSS_SUFFIX } from '../internal';
import { StypNumeric } from './numeric';

/**
 * CSS property value.
 *
 * This is either scalar value, or structured one.
 */
export type StypValue =
    string | number | boolean | undefined
    | StypNumeric<any>;

export function stypSplitPriority<T extends StypValue>(value: T): readonly [T?, 'important'?] {
  if (value == null) {
    return [];
  }

  switch (typeof value) {
    case 'object':

      const priority = value.priority;

      return priority ? [value.usual() as T, priority] : [value];
    case 'string':
      if (value.endsWith(IMPORTANT_CSS_SUFFIX)) {
        return[value.substring(0, value.length - IMPORTANT_CSS_SUFFIX.length).trim() as T, 'important'];
      }
  }

  return [value];
}

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
