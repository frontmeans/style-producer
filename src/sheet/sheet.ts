import { StypDeclaration, StypProperties, stypRoot } from '../declaration';
import { StypSelector } from '../selector';

export abstract class StypSheet {

  abstract readonly root: StypDeclaration;

  abstract get(selector: StypSelector): StypDeclaration;

  abstract add(selector: StypSelector, properties: StypProperties.Spec): StypDeclaration;

}

export function stypSheet(rootProperties?: StypProperties.Spec): StypSheet {

  let root = stypRoot(rootProperties);

  class Sheet extends StypSheet {

    get root() {
      return root;
    }

    get(selector: StypSelector) {
      return root.nested(selector);
    }

    add(selector: StypSelector, properties: StypProperties.Spec) {

      const decl = root.nested(selector).add(properties);

      root = decl.root;

      return decl;
    }

  }

  return new Sheet();
}
