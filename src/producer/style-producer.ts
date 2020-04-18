/**
 * @packageDocumentation
 * @module @proc7ts/style-producer
 */
import { NamespaceDef } from '@proc7ts/namespace-aliaser';
import { StypProperties, StypRule } from '../rule';
import { StypSelector } from '../selector';
import { StypRenderer } from './renderer';
import { StypWriter } from './writer';

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
  readonly parent: Node & ParentNode;

  /**
   * CSS rule to produce styles for.
   */
  readonly rule: StypRule;

  /**
   * CSS style sheet writer to add CSS rules to.
   */
  readonly sheet: StypWriter.Sheet;

  /**
   * CSS style sheet or rule writer to add declarations to.
   */
  readonly writer: StypWriter;

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
   * This method relies on renderers chain. For each renderer in chain this method calls the next one.
   *
   * @param properties  CSS properties to render.
   * @param options  Rendering options.
   */
  render(properties: StypProperties, options?: StypRenderer.Options): void;

  /**
   * Tries to append CSS style declarations writer {@link writer target} CSS style sheet or rule.
   *
   * If {@link writer target} target is style sheet or grouping rule, then inserts the last style rule.
   * Otherwise just returns `target`.
   *
   * @param selector  Appended CSS rule selector. Equals to the one from this producer when omitted.
   *
   * @returns Either appended empty CSS rule, or `target`.
   */
  addStyle(selector?: StypSelector.Normalized): StypWriter.Style;

}
