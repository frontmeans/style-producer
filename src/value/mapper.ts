import { itsEach, overKeys } from '@proc7ts/push-iterator';
import { StypProperties } from '../rule';
import { StypValue } from './value';

/**
 * A type of function that maps CSS properties to something else.
 *
 * @category CSS Value
 * @typeParam TResult - A type of mapped properties. This is a mapping result type.
 */
export type StypMapper<TResult> =
  /**
   * @param from - CSS properties to map.
   *
   * @returns Mapping result.
   */
  (this: void, from: StypProperties) => TResult;

/**
 * @category CSS Value
 */
export namespace StypMapper {
  /**
   * CSS property mapping.
   *
   * It is used to recognize raw property value and convert it to the one of the given type.
   *
   * It is one of:
   * - Default property value. Replaces the source property value, unless the the have the same type.
   * - A mapping function. Replaces the source property value with the result of this function call.
   * - An object containing mapping method called `by()`. Replaces the source property value with the result of this
   *   method call.
   *
   * @typeParam TResult - A type of mapped properties. This is an object containing mapped properties.
   * @typeParam TResultKey - Type of mapped properties keys.
   */
  export type Mapping<TResult, TResultKey extends keyof TResult> =
    | MappingFunction<TResult, TResultKey>
    | MappingObject<TResult, TResultKey>
    | TResult[TResultKey];

  /**
   * CSS property mapping function.
   *
   * @typeParam TResult - A type of mapped properties. This is a mapping result type.
   * @typeParam TResultKey - Type of mapped properties keys.
   */
  export type MappingFunction<TResult, TResultKey extends keyof TResult> =
    /**
     * @param source - A raw property value that should be converted.
     * @param mapped - An object granting access to other mapped properties.
     * @param key - A key of converted property.
     *
     * @returns Mapped property value.
     */
    (
      this: void,
      source: StypValue,
      mapped: Mapped<TResult>,
      key: TResultKey,
    ) => TResult[TResultKey];

  /**
   * CSS property mapping object.
   *
   * @typeParam TResult - A type of mapped properties. This is a mapping result type.
   * @typeParam TResultKey - Type of mapped properties keys.
   */
  export interface MappingObject<TResult, TResutKey extends keyof TResult> {
    /**
     * Maps CSS property value.
     *
     * @param source - A raw property value that should be converted.
     * @param mapped - An object granting access to other mapped properties.
     * @param key - A key of converted property.
     *
     * @returns Mapped property value.
     */
    by(source: StypValue, mapped: Mapped<TResult>, key: TResutKey): TResult[TResutKey];
  }

  /**
   * Grants access to mapped values.
   *
   * Passed as a second argument to mapping function.
   *
   * @typeParam TResult - A type of mapped properties. This is a mapping result type.
   */
  export interface Mapped<TResultKey> {
    /**
     * Original properties to convert.
     */
    from: StypProperties;

    /**
     * Maps the property with the given type accordingly to mapping instruction.
     *
     * The mapping is performed at most once per property.
     *
     * @param key - Mapped property key.
     *
     * @returns Mapped property value.
     */
    get<TKey extends keyof TResultKey>(key: TKey): TResultKey[TKey];
  }

  /**
   * Mappings of CSS properties.
   *
   * Contains mappings for each mapped CSS property with that property name as a key.
   *
   * @typeParam TResult - A type of mapped properties. This is a mapping result type.
   */
  export type Mappings<TResult> = { readonly [key in keyof TResult]: Mapping<TResult, key> };
}

/**
 * @category CSS Value
 */
export const StypMapper = {
  /**
   * Maps CSS properties accordingly to the given `mappings`.
   *
   * @typeParam TResult - A type of mapped properties. This is a mapping result type.
   * @param mappings - Mappings of CSS properties.
   * @param from - Raw CSS properties to map.
   *
   * @returns Mapped properties.
   */
  map<TResult>(mappings: StypMapper.Mappings<TResult>, from: StypProperties): TResult {
    const result = {} as { [key in keyof TResult]: TResult[key] };
    const mapped = {
      from,
      get<TKey extends keyof TResult>(key: TKey): TResult[TKey] {
        if (key in result) {
          return result[key];
        }

        const mapper = mappingBy<TResult, TKey>(mappings[key]);
        const mappedValue = mapper(from[key as string], this, key);

        result[key] = mappedValue;

        return mappedValue;
      },
    };

    itsEach(overKeys(mappings), key => mapped.get(key));

    return result;
  },

  /**
   * Creates CSS properties mapper function.
   *
   * @typeParam TResult - A type of mapped properties. This is a mapping result type.
   * @param mappings - Mappings of CSS properties.
   *
   * @returns A function that maps CSS properties accordingly to the given `mappings`.
   */
  by<TResult>(mappings: StypMapper.Mappings<TResult>): StypMapper<TResult> {
    return StypMapper.map.bind<void, StypMapper.Mappings<TResult>, [StypProperties], TResult>(
      undefined,
      mappings,
    );
  },
};

/**
 * @internal
 */
function mappingBy<TResult, TResultKey extends keyof TResult>(
  mapping: StypMapper.Mapping<TResult, TResultKey> | undefined,
): StypMapper.MappingFunction<TResult, TResultKey> {
  switch (typeof mapping) {
    case 'function':
      return mapping as StypMapper.MappingFunction<TResult, TResultKey>;
    case 'object':
      return (mapping as StypMapper.MappingObject<TResult, TResultKey>).by.bind(mapping);
    default:
  }

  const type = typeof mapping;

  return (from: StypValue): TResult[TResultKey] => typeof from === type
      ? (from as unknown as TResult[TResultKey])
      : (mapping as TResult[TResultKey]);
}
