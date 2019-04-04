import {
  AfterEvent,
  afterEventBy,
  afterEventFrom,
  afterEventOf,
  eventInterest,
  EventKeeper,
  isEventKeeper,
  OnEvent
} from 'fun-events';
import { StypProperties } from './properties';
import { nextSkip, NextSkip, noop } from 'call-thru';
import { itsIterator, itsReduction, overEntries } from 'a-iterable';
import { StypRule } from './rule';
import { IMPORTANT_CSS_SUFFIX } from '../internal';

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
    if (typeof spec === 'function') {

      const keeperOrProperties = spec(rule);

      if (typeof keeperOrProperties !== 'string') {
        if (isEventKeeper(keeperOrProperties)) {
          return preventDuplicates(keeperOrProperties);
        }
      }

      return afterEventOf(propertiesMap(keeperOrProperties));
    }
  }

  return afterEventOf(propertiesMap(spec));
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

  const s = itsIterator(overEntries(second));

  for (const [key, value] of overEntries(first)) {

    const { value: svalue } = s.next();

    if (!svalue || key !== svalue[0] || value !== svalue[1]) {
      return false;
    }
  }

  return !s.next().value;
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
    value: StypProperties.Value): StypProperties.Mutable {
  if (!isImportantValue(properties[key]) || isImportantValue(value)) {
    delete properties[key];
    properties[key] = value;
  }
  return properties;
}

function isImportantValue(value: StypProperties.Value) {
  return typeof value === 'string' && value.endsWith(IMPORTANT_CSS_SUFFIX);
}
