import { stypSelector, StypSelector } from '../selector';
import { StypProperties } from './properties';
import { stypPropertiesBySpec } from './properties.impl';
import { EmptyStypRule, StypRule } from './rule';

const rootSelector: StypSelector.Normalized = [];
let emptyRoot: StypRule | undefined;

export function stypRoot(properties?: StypProperties.Spec): StypRule {
  if (!properties && emptyRoot) {
    return emptyRoot;
  }

  class StypRoot extends StypRule {

    readonly spec = (rule: StypRule) => stypPropertiesBySpec(rule, properties);

    get root() {
      return this;
    }

    get selector() {
      return rootSelector;
    }

    get empty() {
      return !properties;
    }

    rule(selector: StypSelector): StypRule {

      const _selector = stypSelector(selector);

      if (!_selector.length) {
        return this;
      }

      return new EmptyStypRule(this, _selector);
    }

  }

  const root = new StypRoot();

  if (!properties && !emptyRoot) {
    emptyRoot = root;
  }

  return root;
}
