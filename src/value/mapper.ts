import { itsEach, overKeys } from 'a-iterable';
import { StypProperties } from '../rule';
import { StypValue } from './value';

/**
 * CSS property mapper.
 *
 * It is used to recognize raw property value and convert it to the one of the given type.
 *
 * It is one of:
 * - Default property value. Replaces the source property value, unless the the have the same type.
 * - A mapping function. Replaces the source property value with the result of this function call.
 * - An object containing mapping method called `by()`. Replaces the source property value with the result of this
 *   method call.
 *
 * @typeparam R A type of mapped properties. This is an object containing mapped properties.
 * @typeparam K Type of mapped properties keys.
 */
export type StypMapper<R extends StypProperties, K extends keyof R> =
    StypMapper.Function<R, K>
    | { by(source: StypValue, mapped: StypMapper.Mapped<R>, key: K): R[K] }
    | R[K];

export namespace StypMapper {

  /**
   * CSS property mapper function.
   *
   * @typeparam R A type of mapped properties. This is a mapping result type.
   * @typeparam K Type of mapped properties keys.
   * @param source A raw property value that should be converted.
   * @param mapped An object granting access to other mapped properties.
   * @param key A key of converted property.
   *
   * @returns Mapped property value.
   */
  export type Function<R extends StypProperties, K extends keyof R> =
      (this: void, source: StypValue, mapped: Mapped<R>, key: K) => R[K];

  /**
   * CSS property mapper object.
   */
  export interface Object {

    /**
     * Maps CSS property value.
     *
     * @typeparam R A type of mapped properties. This is a mapping result type.
     * @typeparam K Type of mapped properties keys.
     * @param source A raw property value that should be converted.
     * @param mapped An object granting access to other mapped properties.
     * @param key A key of converted property.
     *
     * @returns Mapped property value.
     */
    by<R extends StypProperties, K extends keyof R>(source: StypValue, mapped: Mapped<R>, key: K): R[K];

  }

  /**
   * An object granting access for mappers to other mapped values.
   *
   * It is passed as a second argument to mapper function.
   *
   * @typeparam R A type of mapped properties. This is a mapping result type.
   */
  export interface Mapped<R extends StypProperties> {

    /**
     * Original properties to convert.
     */
    from: StypProperties;

    /**
     * Maps the property with the given type accordingly to mapping instruction.
     *
     * The mapping is performed at most once per property.
     *
     * @param key Mapped property key.
     *
     * @returns Mapped property value.
     */
    get<K extends keyof R>(key: K): R[K];

  }

  /**
   * CSS properties mapping instruction.
   *
   * This is an object with the same set of keys as the mapping result. Each property of this object contains
   * corresponding property [mapper][[StypMapper]].
   *
   * @typeparam R A type of mapped properties. This is a mapping result type.
   */
  export type Mapping<R extends StypProperties> = { [key in keyof R]: StypMapper<R, key>; };

}

export const StypMapper = {

  /**
   * Maps CSS properties accordingly to the given `mapping` instruction.
   *
   * @param from Raw CSS properties to map.
   * @param mapping Mapping instruction.
   *
   * @returns Mapped properties.
   */
  map<R extends StypProperties>(from: StypProperties, mapping: StypMapper.Mapping<R>): R {

    const result: { [key in keyof R]: R[key] } = {} as any;
    const mapped = {
      from,
      get<K extends keyof R>(key: K): R[K] {
        if (key in result) {
          return result[key];
        }

        const mapper = mapperBy<R, K>(mapping[key]);
        const mappedValue = mapper(from[key as string], this, key);

        result[key] = mappedValue;

        return mappedValue;
      }
    };

    itsEach(overKeys(mapping), key => mapped.get(key));

    return result;
  }

};

function mapperBy<R extends StypProperties, K extends keyof R>(mapper: StypMapper<R, K>): StypMapper.Function<R, K> {
  switch (typeof mapper) {
    case 'function':
      return mapper;
    case 'object':
      return (mapper as StypMapper.Object).by.bind(mapper);
  }

  const type = typeof mapper;

  return (from: StypValue): R[K] => {
    return typeof from === type ? from as R[K] : mapper;
  };
}
