import { stypSelector, StypSelector } from '../selector';
import { StypProperties } from './properties';
import { stypPropertiesBySpec } from './properties.impl';
import { StypDeclaration } from './declaration';
import { EmptyStypDeclaration } from './empty-declaration';

const rootSelector: StypSelector.Normalized = [];
let rootDeclaration: StypDeclaration | undefined;

export function stypRoot(properties?: StypProperties.Spec): StypDeclaration {
  if (!properties && rootDeclaration) {
    return rootDeclaration;
  }

  class StypRoot extends StypDeclaration {

    readonly spec = (decl: StypDeclaration) => stypPropertiesBySpec(decl, properties);

    get root() {
      return this;
    }

    get selector() {
      return rootSelector;
    }

    get empty() {
      return !properties;
    }

    select(selector: StypSelector): StypDeclaration {

      const _selector = stypSelector(selector);

      if (!_selector.length) {
        return this;
      }

      return new EmptyStypDeclaration(this, _selector);
    }

  }

  const root = new StypRoot();

  if (!properties && !rootDeclaration) {
    rootDeclaration = root;
  }

  return root;
}
