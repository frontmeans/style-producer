/**
 * @module style-producer
 */
import { itsEach, overKeys } from 'a-iterable';
import { StypProperties } from '../rule';
import { StypValue } from './value';

/**
 * A type of function that maps CSS properties to something else.
 *
 * @category CSS Value
 * @typeparam R  A type of mapped properties. This is a mapping result type.
 */
export type StypMapper<R> =
/**
 * @param from  CSS properties to map.
 *
 * @returns Mapping result.
 */
    (this: void, from: StypProperties) => R;

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
   * @typeparam R  A type of mapped properties. This is an object containing mapped properties.
   * @typeparam K  Type of mapped properties keys.
   */
  export type Mapping<R, K extends keyof R> =
      | MappingFunction<R, K>
      | MappingObject<R, K>
      | R[K];

  /**
   * CSS property mapping function.
   *
   * @typeparam R  A type of mapped properties. This is a mapping result type.
   * @typeparam K  Type of mapped properties keys.
   */
  export type MappingFunction<R, K extends keyof R> =
  /**
   * @param source  A raw property value that should be converted.
   * @param mapped  An object granting access to other mapped properties.
   * @param key  A key of converted property.
   *
   * @returns Mapped property value.
   */
      (this: void, source: StypValue, mapped: Mapped<R>, key: K) => R[K];

  /**
   * CSS property mapping object.
   *
   * @typeparam R  A type of mapped properties. This is a mapping result type.
   * @typeparam K  Type of mapped properties keys.
   */
  export interface MappingObject<R, K extends keyof R> {

    /**
     * Maps CSS property value.
     *
     * @param source  A raw property value that should be converted.
     * @param mapped  An object granting access to other mapped properties.
     * @param key  A key of converted property.
     *
     * @returns Mapped property value.
     */
    by(source: StypValue, mapped: Mapped<R>, key: K): R[K];

  }

  /**
   * Grants access to mapped values.
   *
   * Passed as a second argument to mapping function.
   *
   * @typeparam R  A type of mapped properties. This is a mapping result type.
   */
  export interface Mapped<R> {

    /**
     * Original properties to convert.
     */
    from: StypProperties;

    /**
     * Maps the property with the given type accordingly to mapping instruction.
     *
     * The mapping is performed at most once per property.
     *
     * @param key  Mapped property key.
     *
     * @returns Mapped property value.
     */
    get<K extends keyof R>(key: K): R[K];

  }

  /**
   * Mappings of CSS properties.
   *
   * Contains mappings for each mapped CSS property with that property name as a key.
   *
   * @typeparam R  A type of mapped properties. This is a mapping result type.
   */
  export type Mappings<R> = { readonly [key in keyof R]: Mapping<R, key>; };

}

export const StypMapper = {

  /**
   * Maps CSS properties accordingly to the given `mappings`.
   *
   * @typeparam R  A type of mapped properties. This is a mapping result type.
   *
   * @param mappings  Mappings of CSS properties.
   * @param from  Raw CSS properties to map.
   *
   * @returns Mapped properties.
   */
  map<R>(mappings: StypMapper.Mappings<R>, from: StypProperties): R {

    const result: { [key in keyof R]: R[key] } = {} as any;
    const mapped = {
      from,
      get<K extends keyof R>(key: K): R[K] {
        if (key in result) {
          return result[key];
        }

        const mapper = mappingBy<R, K>(mappings[key]);
        const mappedValue = mapper(from[key as string], this, key);

        result[key] = mappedValue;

        return mappedValue;
      }
    };

    itsEach(overKeys(mappings), key => mapped.get(key));

    return result;
  },

  /**
   * Creates CSS properties mapper function.
   *
   * @typeparam R  A type of mapped properties. This is a mapping result type.
   * @param mappings  Mappings of CSS properties.
   *
   * @returns A function that maps CSS properties accordingly to the given `mappings`.
   */
  by<R>(mappings: StypMapper.Mappings<R>): StypMapper<R> {
    return StypMapper.map.bind<void, StypMapper.Mappings<R>, [StypProperties], R>(undefined, mappings);
  },

};

function mappingBy<R, K extends keyof R>(
    mapping: StypMapper.Mapping<R, K> | undefined):
    StypMapper.MappingFunction<R, K> {
  switch (typeof mapping) {
  case 'function':
    return mapping as StypMapper.MappingFunction<R, K>;
  case 'object':
    return (mapping as StypMapper.MappingObject<R, K>).by.bind(mapping);
  }

  const type = typeof mapping;

  return (from: StypValue): R[K] => {
    return typeof from === type ? from as any : mapping;
  };
}
