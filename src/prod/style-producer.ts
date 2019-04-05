import { StypProperties, StypRule } from '../rule';
import { StypSelector } from '../selector';
import { StypRender } from './render';

/**
 * CSS styles producer.
 *
 * It is constructed by `produceStyle()` function for each processed CSS rule.
 */
export interface StyleProducer {

  /**
   * A document to produce styles for.
   *
   * The value of corresponding style production option.
   */
  readonly document: Document;

  /**
   * Parent DOM node to add stylesheets to.
   *
   * The value of corresponding style production option.
   */
  readonly parent: ParentNode;

  /**
   * CSS rule to produce styles for.
   */
  readonly rule: StypRule;

  /**
   * Appends CSS rule to stylesheet.
   *
   * This method relies on renders chain. For each render in chain this method calls the next one.
   *
   * @param sheet CSS stylesheet to add properties to.
   * @param selector CSS rule selector.
   * @param properties CSS properties to render.
   */
  render(sheet: CSSStyleSheet, selector: StypSelector.Normalized, properties: StypProperties): void;

}

/**
 * CSS styles production options.
 *
 * This options are accepted by `produceStyle()` function.
 */
export interface StypOptions {

  /**
   * A document to produce styles for.
   *
   * `window.document` by default.
   */
  document?: Document;

  /**
   * Parent DOM node to add stylesheets to.
   *
   * `document.head` by default.
   */
  parent?: ParentNode;

  /**
   * A selector to use for root CSS rule.
   *
   * `body` by default.
   *
   * For custom elements a `:host` selector would be more appropriate.
   */
  rootSelector?: StypSelector;

  /**
   * Schedules DOM operation.
   *
   * This is a function that is called each time DOM tree needs to be modified.
   *
   * By default modifies DOM tree in batches scheduled by `window.requestAnimationFrame()` function.
   *
   * @param producer Style producer that initiated DOM manipulation.
   * @param operation A DOM tree manipulation operation to schedule.
   */
  schedule?: (producer: StyleProducer, operation: () => void) => void;

  /**
   * Render or render chain to use.
   */
  render?: StypRender | StypRender[];

}
