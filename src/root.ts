import { stypSelector, StypSelector } from './selector';
import { EventKeeper } from 'fun-events';
import { StypDeclaration } from './declaration';
import { StypProperties, StypPropertiesSpec } from './properties';
import { noStypProperties, stypPropertiesBySpec } from './properties.impl';

const rootSelector: StypSelector.Normalized = [];
let rootDeclaration: StypDeclaration | undefined;

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
    return noStypProperties;
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
      return stypPropertiesBySpec(this, properties);
    }

  }

  const root = new Root();

  if (!properties && !rootDeclaration) {
    rootDeclaration = root;
  }

  return root;
}
