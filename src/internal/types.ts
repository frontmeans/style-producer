/**
 * @internal
 */
export function isReadonlyArray<T>(value: any): value is readonly T[] {
  return Array.isArray(value);
}

/**
 * @internal
 */
export function isNotEmptyArray<T>(array: readonly T[]): array is readonly [T, ...T[]];

/**
 * @internal
 */
export function isNotEmptyArray<T>(array: T[]): array is [T, ...T[]];

/**
 * @internal
 */
export function isNotEmptyArray<T>(array: readonly T[]): boolean {
  return !!array.length;
}

/**
 * @internal
 */
export function compareScalars(first: number | string, second: number | string): number {
  return first < second ? -1 : first > second ? 1 : 0;
}
