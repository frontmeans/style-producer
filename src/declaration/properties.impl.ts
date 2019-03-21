import { AfterEvent, afterEventFrom, EventKeeper, OnEvent } from 'fun-events';
import { isValueKeeper, keepValue } from '../internal';
import { StypProperties } from './properties';
import { nextSkip, NextSkip } from 'call-thru';
import { itsEvery, overEntries } from 'a-iterable';
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
