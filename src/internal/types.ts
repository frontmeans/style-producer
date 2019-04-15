/**
 * @internal
 */
export function isReadonlyArray<T>(value: any): value is readonly T[] {
  return Array.isArray(value);
}
