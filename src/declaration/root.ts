import { stypSelector, StypSelector } from '../selector';
import { StypProperties } from './properties';
import { noStypProperties, stypPropertiesBySpec } from './properties.impl';
import { StypDeclaration } from './declaration';

const rootSelector: StypSelector.Normalized = [];
let rootDeclaration: StypDeclaration | undefined;

class EmptyDeclaration extends StypDeclaration {

  get spec() {
    return emptySpec;
  }

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

}

export function stypRoot(properties?: StypProperties.Spec): StypDeclaration {

  if (!properties && rootDeclaration) {
    return rootDeclaration;
  }

  class Root extends StypDeclaration {

    readonly spec = (decl: StypDeclaration) => stypPropertiesBySpec(decl, properties);

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

  }

  const root = new Root();

  if (!properties && !rootDeclaration) {
    rootDeclaration = root;
  }

  return root;
}

function emptySpec() {
  return noStypProperties;
}
