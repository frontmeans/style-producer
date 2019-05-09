import { filterIt, itsIterator, itsReduction, overEntries } from 'a-iterable';
import { nextSkip, NextSkip, noop } from 'call-thru';
import {
  AfterEvent,
  afterEventBy,
  afterEventFrom,
  afterEventOf,
  eventInterest,
  EventKeeper,
  EventSender,
  isEventKeeper,
  isEventSender,
  OnEvent
} from 'fun-events';
import { IMPORTANT_CSS_SUFFIX } from '../internal';
import { StypValue, stypValuesEqual } from '../value';
import { StypProperties } from './properties';
import { StypRule } from './rule';

/**
 * @internal
 */
export const noStypProperties: AfterEvent<[StypProperties]> = /*#__PURE__*/ afterEventOf({});

/**
 * @internal
 */
export function noStypPropertiesSpec() {
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

      return afterEventOf(propertiesMap(senderOrProperties));
    }
  }

  return afterEventOf(propertiesMap(spec));
}

function propertiesKeeper(sender: EventSender<[string | StypProperties]>): AfterEvent<[string | StypProperties]> {
  return afterEventFrom(sender, [{}]);
}

function preventDuplicates(properties: EventKeeper<[string | StypProperties]>): AfterEvent<[StypProperties]> {

  const afterEvent = afterEventFrom(properties);
  const onEvent: OnEvent<[StypProperties]> = afterEvent.thru(
      propertiesMap,
      passNonDuplicate(),
  );

  return afterEventFrom<[StypProperties]>(onEvent);
}

function passNonDuplicate<NextArgs extends any[]>():
    (update: StypProperties) => StypProperties | NextSkip<NextArgs, StypProperties> {

  let stored: StypProperties | undefined;

  return update => {
    if (stored && propertiesEqual(update, stored)) {
      return nextSkip();
    }
    return stored = { ...update };
  };
}

function propertiesMap(properties: string | StypProperties): StypProperties {
  return typeof properties === 'string' ? { $$css: properties } : properties;
}

function propertiesEqual(first: StypProperties, second: StypProperties): boolean {

  const s = itsIterator(propertyEntries(second));

  for (const [key, value] of propertyEntries(first)) {

    const { value: sentry } = s.next();

    if (!sentry || key !== sentry[0] || !stypValuesEqual(value, sentry[1])) {
      return false;
    }
  }

  return !s.next().value;
}

function propertyEntries(properties: StypProperties): Iterable<[keyof StypProperties, StypValue]> {
  return filterIt(overEntries(properties), valuePresent);
}

function valuePresent([_key, value]: [keyof StypProperties, StypValue]): boolean {
  return value != null;
}

/**
 * @internal
 */
export function mergeStypProperties(
    base: AfterEvent<[StypProperties]>,
    addendum: AfterEvent<[StypProperties]>):
    AfterEvent<[StypProperties]> {
  return preventDuplicates(
      afterEventBy(
          receiver => {

            let send: () => void = noop;
            let baseProperties: StypProperties = {};
            let addendumProperties: StypProperties = {};

            const baseInterest = base(properties => {
              baseProperties = properties;
              send();
            });
            const extensionInterest = addendum(properties => {
              addendumProperties = properties;
              send();
            });

            send = () => receiver(addValues(baseProperties, addendumProperties));
            send();

            return eventInterest(
                reason => {
                  baseInterest.off(reason);
                  extensionInterest.off(reason);
                })
                .needs(baseInterest)
                .needs(extensionInterest);
          }));
}

function addValues(base: StypProperties, addendum: StypProperties): StypProperties {
  return itsReduction(
      overEntries(addendum),
      (result, [k, v]) => addValue(result, k, v),
      { ...base });
}

function addValue(
    properties: StypProperties.Mutable,
    key: keyof StypProperties,
    value: StypValue): StypProperties.Mutable {
  if (!isImportantValue(properties[key]) || isImportantValue(value)) {
    delete properties[key];
    properties[key] = value;
  }
  return properties;
}

function isImportantValue(value: StypValue) {
  switch (typeof value) {
    case 'string':
      return value.endsWith(IMPORTANT_CSS_SUFFIX);
    case 'object':
      return value.priority === 'important';
  }
  return false;
}
