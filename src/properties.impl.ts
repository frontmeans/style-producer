import { StypDeclaration } from './declaration';
import { AfterEvent, afterEventFrom, EventKeeper, OnEvent } from 'fun-events';
import { isValueKeeper, keepValue } from './events.impl';
import { StypProperties } from './properties';
import { nextSkip } from 'call-thru';
import { itsEvery, overEntries } from 'a-iterable';

/**
 * @internal
 */
export const noStypProperties: AfterEvent<[StypProperties]> = /*#__PURE__*/ keepValue({});

/**
 * @internal
 */
export function stypPropertiesBySpec(
    decl: StypDeclaration,
    spec?: StypProperties.Spec):
    AfterEvent<[StypProperties]> {
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

    return keepValue(keeperOrProperties);
  }

  return keepValue(spec);
}

function preventDuplicates(properties: EventKeeper<[StypProperties]>): AfterEvent<[StypProperties]> {

  const afterEvent = afterEventFrom(properties);
  const onEvent: OnEvent<[StypProperties]> = afterEvent.thru(passNonDuplicate());

  return afterEventFrom(onEvent, () => afterEvent.kept);
}

function passNonDuplicate() {

  let stored: StypProperties | undefined;

  return (updated: StypProperties) => {
    return stored && propertiesEqual(updated, stored) ? nextSkip() : (stored = { ...updated });
  };
}

function propertiesEqual(first: StypProperties, second: StypProperties): boolean {
  return hasAllOf(first, second) && hasAllOf(second, first);
}

function hasAllOf(first: StypProperties, second: StypProperties): boolean {
  return itsEvery(
      overEntries(first),
      ([k, v]) => v === second[k]
  );
}
