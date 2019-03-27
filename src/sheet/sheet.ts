import { StypProperties, stypRoot, StypRule } from '../rule';
import { StypSelector } from '../selector';

export abstract class StypSheet {

  abstract readonly root: StypRule;

  abstract get(selector: StypSelector): StypRule;

  abstract add(selector: StypSelector, properties: StypProperties.Spec): StypRule;

}

export function stypSheet(rootProperties?: StypProperties.Spec): StypSheet {

  let root = stypRoot(rootProperties);

  class Sheet extends StypSheet {

    get root() {
      return root;
    }

    get(selector: StypSelector) {
      return root.rule(selector);
    }

    add(selector: StypSelector, properties: StypProperties.Spec) {

      const rule = root.rule(selector).add(properties);

      root = rule.root;

      return rule;
    }

  }

  return new Sheet();
}
