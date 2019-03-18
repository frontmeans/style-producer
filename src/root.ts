import { stypSelector, StypSelector } from './selector';
import { AfterEvent, EventKeeper } from 'fun-events';
import { StypDeclaration } from './declaration';
import { StypProperties, StypPropertiesSpec } from './properties';
import { isValueKeeper, keepValue } from './events';

const rootSelector: StypSelector.Normalized = [];
let rootDeclaration: StypDeclaration | undefined;
const emptyProperties: AfterEvent<[StypProperties]> = /*#__PURE__*/ keepValue({});

class EmptyDeclaration extends StypDeclaration {

  constructor(
      readonly root: StypDeclaration,
      readonly selector: StypSelector.Normalized) {
    super();
  }

  select(selector: StypSelector): StypDeclaration {

    const _selector = stypSelector(selector);

    if (!_selector.length) {
      return this;
    }

    return new EmptyDeclaration(this.root, [...this.selector, ..._selector]);
  }

  build() {
    return emptyProperties;
  }

}

export function stypRoot(properties?: StypPropertiesSpec): StypDeclaration {

  if (!properties && rootDeclaration) {
    return rootDeclaration;
  }

  class Root extends StypDeclaration {

    get root() {
      return this;
    }

    get selector() {
      return rootSelector;
    }

    select(selector: StypSelector): StypDeclaration {

      const _selector = stypSelector(selector);

      if (!_selector.length) {
        return this;
      }

      return new EmptyDeclaration(this, _selector);
    }

    build(): EventKeeper<[StypProperties]> {
      if (!properties) {
        return emptyProperties;
      }
      if (isValueKeeper(properties)) {
        return properties;
      }
      if (typeof properties === 'function') {

        const keeperOrProperties = properties.call(this);

        if (isValueKeeper(keeperOrProperties)) {
          return keeperOrProperties;
        }

        return keepValue(keeperOrProperties);
      }

      return keepValue(properties);
    }

  }

  const root = new Root();

  if (!properties && !rootDeclaration) {
    rootDeclaration = root;
  }

  return root;
}
