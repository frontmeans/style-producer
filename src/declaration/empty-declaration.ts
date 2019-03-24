import { StypDeclaration } from './declaration';
import { stypSelector, StypSelector } from '../selector';
import { noStypProperties } from './properties.impl';

/**
 * @internal
 */
export class EmptyStypDeclaration extends StypDeclaration {

  get spec() {
    return emptySpec;
  }

  get empty() {
    return true;
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

    return new EmptyStypDeclaration(this.root, [...this.selector, ..._selector]);
  }

}

function emptySpec() {
  return noStypProperties;
}
