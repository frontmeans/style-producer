import { StypDeclaration } from './declaration';
import { AfterEvent, EventKeeper } from 'fun-events';
import { isValueKeeper, keepValue } from './events';
import { StypProperties, StypPropertiesSpec } from './properties';

/**
 * @internal
 */
export const noStypProperties: AfterEvent<[StypProperties]> = /*#__PURE__*/ keepValue({});

/**
 * @internal
 */
export function stypPropertiesBySpec(
    decl: StypDeclaration,
    properties: StypPropertiesSpec | undefined):
    EventKeeper<[StypProperties]> {
  if (!properties) {
    return noStypProperties;
  }
  if (isValueKeeper(properties)) {
    return properties;
  }
  if (typeof properties === 'function') {

    const keeperOrProperties = properties(decl);

    if (isValueKeeper(keeperOrProperties)) {
      return keeperOrProperties;
    }

    return keepValue(keeperOrProperties);
  }

  return keepValue(properties);
}
