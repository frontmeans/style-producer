import {
  afterAll,
  AfterEvent,
  afterSupplied,
  afterThe,
  EventKeeper,
  EventSender,
  isEventKeeper,
  isEventSender,
  mapAfter,
  mapAfter_,
  translateAfter,
} from '@proc7ts/fun-events';
import { isPresent, valuesProvider } from '@proc7ts/primitives';
import { filterIt, itsIterator, itsReduction, overEntries } from '@proc7ts/push-iterator';
import { IMPORTANT_CSS_SUFFIX } from '../internal';
import { StypValue, stypValuesEqual } from '../value';
import { StypProperties } from './properties';
import { StypRule } from './rule';

/**
 * @internal
 */
export const noStypProperties: AfterEvent<[StypProperties]> = (/*#__PURE__*/ afterThe({}));

/**
 * @internal
 */
export function noStypPropertiesSpec(): AfterEvent<[StypProperties]> {
  return noStypProperties;
}

/**
 * @internal
 */
export function stypPropertiesBySpec(rule: StypRule, spec?: StypProperties.Spec): AfterEvent<[StypProperties]> {
  if (!spec) {
    return noStypProperties;
  }
  if (typeof spec !== 'string') {
    if (isEventKeeper(spec)) {
      return preventDuplicates(spec);
    }
    if (isEventSender(spec)) {
      return preventDuplicates(propertiesKeeper(spec));
    }
    if (typeof spec === 'function') {

      const senderOrProperties = spec(rule);

      if (typeof senderOrProperties !== 'string') {
        if (isEventKeeper(senderOrProperties)) {
          return preventDuplicates(senderOrProperties);
        }
        if (isEventSender(senderOrProperties)) {
          return preventDuplicates(propertiesKeeper(senderOrProperties));
        }
      }

      return afterThe(propertiesMap(senderOrProperties));
    }
  }

  return afterThe(propertiesMap(spec));
}

function propertiesKeeper(sender: EventSender<[string | StypProperties]>): AfterEvent<[string | StypProperties]> {
  return afterSupplied(sender, valuesProvider({}));
}

function preventDuplicates(properties: EventKeeper<[string | StypProperties]>): AfterEvent<[StypProperties]> {
  return afterSupplied(properties).do(
      mapAfter_(propertiesMap),
      translateAfter(passNonDuplicate()),
  );
}

function passNonDuplicate(): (send: (properties: StypProperties) => void, update: StypProperties) => void {

  let stored: StypProperties | undefined;

  return (send, update) => {
    if (!stored || !propertiesEqual(update, stored)) {
      send(stored = { ...update });
    }
  };
}

function propertiesMap(properties: string | StypProperties): StypProperties {
  return typeof properties === 'string' ? { $$css: properties } : properties;
}

function propertiesEqual(first: StypProperties, second: StypProperties): boolean {

  const s = itsIterator(propertyEntries(second));

  for (const [key, value] of propertyEntries(first)) {

    const { value: sentry } = s.next() as IteratorResult<[keyof StypProperties, StypValue], undefined>;

    if (!sentry || key !== sentry[0] || !stypValuesEqual(value, sentry[1])) {
      return false;
    }
  }

  return !s.next().value;
}

function propertyEntries(properties: StypProperties): Iterable<readonly [keyof StypProperties, StypValue]> {
  return filterIt(
      overEntries(properties),
      ([, value]) => isPresent(value),
  );
}

/**
 * @internal
 */
export function mergeStypProperties(
    base: AfterEvent<[StypProperties]>,
    addendum: AfterEvent<[StypProperties]>,
): AfterEvent<[StypProperties]> {
  return preventDuplicates(
      afterAll({ base, addendum }).do(
          mapAfter(
              ({
                base: [baseProperties],
                addendum: [addendumProperties],
              }) => addValues(baseProperties, addendumProperties),
          ),
      ),
  );
}

function addValues(base: StypProperties, addendum: StypProperties): StypProperties {
  return itsReduction(
      overEntries(addendum),
      (result, [k, v]) => addValue(result, k, v),
      { ...base },
  );
}

function addValue(
    properties: StypProperties.Mutable,
    key: keyof StypProperties,
    value: StypValue,
): StypProperties.Mutable {
  if (priorityOf(properties[key]) <= priorityOf(value)) {
    delete properties[key];
    properties[key] = value;
  }
  return properties;
}

function priorityOf(value: StypValue): number {
  switch (typeof value) {
  case 'string':
    return value.endsWith(IMPORTANT_CSS_SUFFIX) ? 1 : 0;
  case 'object':
    return value.priority;
  default:
    return 0;
  }
}
