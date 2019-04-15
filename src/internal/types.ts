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

export function isNotEmptyArray<T>(array: readonly T[]): boolean {
  return !!array.length;
}
