import { StypProperties, StypRule } from '../rule';
import { StypSelector } from '../selector';
import { StypRender } from './render';
import { NamespaceAliaser } from '../ns';

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
   * CSS stylesheet or rule to add properties to.
   */
  readonly target: CSSStyleSheet | CSSRule;

  /**
   * Rendered CSS rule selector.
   */
  readonly selector: StypSelector.Normalized;

  /**
   * Appends CSS rule to stylesheet.
   *
   * This method relies on renders chain. For each render in chain this method calls the next one.
   *
   * @param properties CSS properties to render.
   * @param options Rendering options.
   */
  render(properties: StypProperties, options?: StypRender.Options): void;

  /**
   * Tries to append CSS rule to `target` CSS stylesheet or rule.
   *
   * If `target` is stylesheet or grouping rule, then inserts the last rule.
   * Otherwise just returns `target`.
   *
   * @param selector Appended CSS rule selector. Equals to the one from this producer when omitted.
   *
   * @returns Either appended empty CSS rule, or `target`.
   */
  addRule(selector?: StypSelector.Normalized): CSSRule;

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
   * @param operation A DOM tree manipulation operation to schedule.
   */
  schedule?: (operation: () => void) => void;

  /**
   * Render or render chain to use.
   */
  render?: StypRender | readonly StypRender[];

  /**
   * Namespace aliaser to use.
   *
   * New instance will be created if not specified.
   */
  nsAlias?: NamespaceAliaser;

}
