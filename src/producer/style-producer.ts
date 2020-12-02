/**
 * @packageDocumentation
 * @module @frontmeans/style-producer
 */
import { NamespaceDef } from '@frontmeans/namespace-aliaser';
import { EventSupplyPeer } from '@proc7ts/fun-events';
import { StypProperties, StypRule } from '../rule';
import { StypSelector } from '../selector';
import { StypRenderer } from './renderer';
import { StypWriter } from './writer';

/**
 * CSS styles producer.
 *
 * It is constructed by [[produceStyle]] function for each processed CSS rule.
 *
 * Implements `EventSupplyPeer` by cutting off the styles supply returned by {@link produceStyle}.
 *
 * @category Rendering
 */
export interface StyleProducer extends EventSupplyPeer {

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
   * This is based on {@link StypFormatConfig.nsAlias production configuration option}.
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
   * Tries to append CSS style declarations to {@link writer target} CSS style sheet or rule.
   *
   * If {@link writer target} is style sheet or grouping rule, then inserts the last style rule.
   * Otherwise just returns `writer`.
   *
   * @param selector  Appended CSS rule selector. Equals to the one from this producer when omitted.
   *
   * @returns Either style writer to appended empty CSS rule, or `writer`.
   */
  addStyle(selector?: StypSelector.Normalized): StypWriter.Style;

}
