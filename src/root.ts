import { stypSelector, StypSelector } from './selector';
import { AfterEvent__symbol, EventKeeper, onNever, trackValue, ValueTracker } from 'fun-events';
import { StypDeclaration, StypProperties } from './declaration';

const rootSelector: StypSelector.Normalized = [];
let rootDeclaration: StypDeclaration | undefined;
const emptyProperties: ValueTracker<StypProperties> = /*#__PURE__*/ trackValue({});

class EmptyDeclaration extends StypDeclaration {

  constructor(
      readonly root: StypDeclaration,
      readonly selector: StypSelector.Normalized) {
    super();
  }

  get onUpdate() {
    return onNever;
  }

  get read() {
    return emptyProperties.read;
  }

  select(selector: StypSelector): StypDeclaration {

    const _selector = stypSelector(selector);

    if (!_selector.length) {
      return this;
    }

    return new EmptyDeclaration(this.root, [...this.selector, ..._selector]);
  }

}

export function stypRoot(properties?: StypProperties | EventKeeper<[StypProperties]>): StypDeclaration {

  let tracker: ValueTracker<StypProperties>;

  if (!properties) {
    if (rootDeclaration) {
       return rootDeclaration;
    }
    tracker = emptyProperties;
  } else {
    tracker = isKeeper(properties) ? trackValue({}).by(properties) : trackValue(properties);
  }

  class Root extends StypDeclaration {

    get root() {
      return this;
    }

    get selector() {
      return rootSelector;
    }

    get onUpdate() {
      return tracker.on;
    }

    get read() {
      return tracker.read;
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

function isKeeper<T>(value: StypProperties | EventKeeper<[T]>): value is EventKeeper<[T]> {
  return AfterEvent__symbol in value;
}
