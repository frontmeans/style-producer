import { AfterEvent, afterEventBy, afterEventFrom, eventInterest, EventKeeper, OnEvent } from 'fun-events';
import { isValueKeeper, keepValue } from '../internal';
import { StypProperties } from './properties';
import { nextSkip, NextSkip, noop } from 'call-thru';
import { itsEvery, itsReduction, overEntries } from 'a-iterable';
import { StypDeclaration } from './declaration';

/**
 * @internal
 */
export const noStypProperties: AfterEvent<[StypProperties]> = /*#__PURE__*/ keepValue({});

/**
 * @internal
 */
export function stypPropertiesBySpec(decl: StypDeclaration, spec?: StypProperties.Spec): AfterEvent<[StypProperties]> {
  if (!spec) {
    return noStypProperties;
  }
  if (isValueKeeper(spec)) {
    return preventDuplicates(spec);
  }
  if (typeof spec === 'function') {

    const keeperOrProperties = spec(decl);

    if (isValueKeeper(keeperOrProperties)) {
      return preventDuplicates(keeperOrProperties);
    }

    return keepValue(propertiesMap(keeperOrProperties));
  }

  return keepValue(propertiesMap(spec));
}

function preventDuplicates(properties: EventKeeper<[string | StypProperties]>): AfterEvent<[StypProperties]> {

  const afterEvent: AfterEvent<[string | StypProperties]> = afterEventFrom(properties);
  const onEvent: OnEvent<[StypProperties]> = afterEvent.thru(passNonDuplicate());

  return afterEventFrom(onEvent, () => [propertiesMap(afterEvent.kept[0])] as [StypProperties]);
}

function passNonDuplicate<NextArgs extends any[]>():
    (update: string | StypProperties) => StypProperties | NextSkip<NextArgs, StypProperties> {

  let stored: StypProperties | undefined;

  return update => {

    const updated = propertiesMap(update);

    if (stored != null && propertiesEqual(updated, stored)) {
      return nextSkip();
    }

    return stored = { ...updated };
  };
}

function propertiesMap(properties: string | StypProperties): StypProperties {
  return typeof properties === 'string' ? { $$css: properties } : properties;
}

function propertiesEqual(first: StypProperties, second: StypProperties): boolean {
  return propertiesHaveAllOf(first, second) && propertiesHaveAllOf(second, first);
}

function propertiesHaveAllOf(first: StypProperties, second: StypProperties): boolean {
  return itsEvery(
      overEntries(first),
      ([k, v]) => v === second[k]
  );
}

/**
 * @internal
 */
export function mergeStypProperties(
    base: AfterEvent<[StypProperties]>,
    addendum: AfterEvent<[StypProperties]>):
    AfterEvent<[StypProperties]> {
  return afterEventBy(
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
      },
      () => [addValues(base.kept[0], addendum.kept[0])] as [StypProperties]);
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
  return typeof value === 'string' && value.endsWith('!important');
}
