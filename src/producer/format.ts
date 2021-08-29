import { DoqrySelector } from '@frontmeans/doqry';
import { NamespaceAliaser } from '@frontmeans/namespace-aliaser';
import { RenderScheduler } from '@frontmeans/render-scheduler';
import { StypRenderer } from './renderer';
import { StyleProducer } from './style-producer';
import { StypWriter } from './writer';

/**
 * Configuration for {@link StypFormat CSS style production format}.
 *
 * @category Rendering
 */
export interface StypFormatConfig {

  /**
   * A selector to use for root CSS rule.
   *
   * `body` by default.
   *
   * For custom elements a `:host` selector would be more appropriate.
   */
  readonly rootSelector?: DoqrySelector | undefined;

  /**
   * DOM rendering operations scheduler.
   *
   * Creates a render schedule per rule.
   *
   * `newRenderSchedule` is used when omitted.
   */
  readonly scheduler?: RenderScheduler | undefined;

  /**
   * Renderer or renderer chain to use.
   */
  readonly renderer?: StypRenderer | readonly StypRenderer[] | undefined;

  /**
   * Namespace aliaser to use.
   *
   * New instance will be created if not specified.
   */
  readonly nsAlias?: NamespaceAliaser | undefined;

}

/**
 * CSS styles production format.
 *
 * Accepted by {@link produceStyle} function.
 *
 * The following formats supported by `style-producer`:
 * - {@link stypObjectFormat} - creates a `<style>` element per CSS rule and utilizes CSS object model to build its
 *   style sheet.
 * - {@link stypDomFormat} - the same as above, but fills created `<style>` element with CSS text content generated
 *   by {@link stypTextFormat}. This is slower, but allows to generate styles _before_ adding them to document.
 * - {@link stypTextFormat} - reports style sheets as formatted CSS text.
 *
 * @category Rendering
 */
export interface StypFormat extends StypFormatConfig {

  /**
   * Creates CSS style sheet writer.
   *
   * This method is called once per each CSS rule.
   *
   * @param producer - Style producer instance.
   *
   * @returns CSS style sheet writer.
   */
  addSheet(producer: StyleProducer): StypWriter.Sheet;

}
