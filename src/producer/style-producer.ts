/**
 * @packageDocumentation
 * @module style-producer
 */
import { NamespaceAliaser, NamespaceDef } from 'namespace-aliaser';
import { RenderScheduler } from 'render-scheduler';
import { StypProperties, StypRule } from '../rule';
import { StypSelector } from '../selector';
import { StypRender } from './render';

/**
 * CSS styles producer.
 *
 * It is constructed by [[produceStyle]] function for each processed CSS rule.
 *
 * @category Rendering
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
   * CSS stylesheet to add CSS rules to.
   */
  readonly styleSheet: CSSStyleSheet;

  /**
   * CSS stylesheet or rule to add properties to.
   */
  readonly target: CSSStyleSheet | CSSRule;

  /**
   * Rendered CSS rule selector.
   */
  readonly selector: StypSelector.Normalized;

  /**
   * Maps namespace to its unique alias.
   *
   * This is based on [[StypOptions.nsAlias]] option.
   *
   * @param ns  A definition of namespace to find alias for.
   *
   * @returns Namespace alias.
   */
  nsAlias(ns: NamespaceDef): string;

  /**
   * Appends CSS rule to stylesheet.
   *
   * This method relies on renders chain. For each render in chain this method calls the next one.
   *
   * @param properties  CSS properties to render.
   * @param options  Rendering options.
   */
  render(properties: StypProperties, options?: StypRender.Options): void;

  /**
   * Tries to append CSS rule to `target` CSS stylesheet or rule.
   *
   * If `target` is stylesheet or grouping rule, then inserts the last rule.
   * Otherwise just returns `target`.
   *
   * @param selector  Appended CSS rule selector. Equals to the one from this producer when omitted.
   *
   * @returns Either appended empty CSS rule, or `target`.
   */
  addRule(selector?: StypSelector.Normalized): CSSRule;

}

/**
 * CSS styles production options.
 *
 * This options are accepted by [[produceStyle]] function.
 *
 * @category Rendering
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
   * Creates CSS stylesheet for each CSS rule.
   *
   * By default appends `<style>` element to `parent`.
   *
   * @param producer  Style producer instance.
   *
   * @returns CSS stylesheet reference.
   */
  addStyleSheet?: (producer: StyleProducer) => StyleSheetRef;

  /**
   * DOM render operations scheduler.
   *
   * Creates a render schedule per rule.
   *
   * Uses `newRenderSchedule` by default.
   *
   * @param operation  A DOM tree manipulation operation to schedule.
   */
  scheduler?: RenderScheduler;

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

/**
 * CSS stylesheet reference.
 *
 * It is an object created by [[StypOptions.addStyleSheet]] option.
 *
 * @category Rendering
 */
export interface StyleSheetRef {

  /**
   * CSS stylesheet reference.
   */
  readonly styleSheet: CSSStyleSheet;

  /**
   * Remoives stylesheet from the document.
   */
  remove(): void;

}
