/**
 * @packageDocumentation
 * @module @proc7ts/style-producer
 */
import { NamespaceAliaser } from '@proc7ts/namespace-aliaser';
import { RenderScheduler } from '@proc7ts/render-scheduler';
import { StypSelector } from '../selector';
import { StypRenderer } from './renderer';
import { StyleProducer } from './style-producer';
import { StypWriter } from './writer';

/**
 * CSS styles production options.
 *
 * This options are accepted by [[produceStyle]] function.
 *
 * @category Rendering
 */
export interface StypOptions {

  /**
   * A selector to use for root CSS rule.
   *
   * `body` by default.
   *
   * For custom elements a `:host` selector would be more appropriate.
   */
  rootSelector?: StypSelector;

  /**
   * DOM rendering operations scheduler.
   *
   * Creates a render schedule per rule.
   *
   * Uses `newRenderSchedule` by default.
   */
  scheduler?: RenderScheduler;

  /**
   * Renderer or renderer chain to use.
   */
  renderer?: StypRenderer | readonly StypRenderer[];

  /**
   * Namespace aliaser to use.
   *
   * New instance will be created if not specified.
   */
  nsAlias?: NamespaceAliaser;

  /**
   * Creates CSS style sheet writer.
   *
   * This method is called once per each CSS rule.
   *
   * This option is required. The `style-producer` has the following implementations bundled:
   * - {@link stypCSSOMWriter} - creates a `<style>` element per CSS rule and utilizes CSSOM to build its style sheet.
   *
   * @param producer  Style producer instance.
   *
   * @returns CSS style sheet writer.
   */
  addSheet(producer: StyleProducer): StypWriter.Sheet;

}
