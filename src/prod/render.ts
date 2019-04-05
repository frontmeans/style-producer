import { StypSelector, stypSelectorText } from '../selector';
import { StypProperties } from '../rule';
import { StyleProducer } from './style-producer';

/**
 * CSS stylesheet render interface.
 *
 * A render may be supplied to style producer to perform additional rendering tasks. E.g. raw CSS text support, or
 * media queries support.
 *
 * The render is either a function, or a descriptor object.
 */
export type StypRender = StypRender.Function | StypRender.Descriptor;

export namespace StypRender {

  /**
   * CSS stylesheet render function.
   *
   * It should normally call a `producer.render()` method as the last operation to allow other renders in chain to do
   * their jobs.
   *
   * @param producer Style producer instance.
   * @param sheet CSS stylesheet to add properties to.
   * @param selector CSS rule selector.
   * @param properties CSS properties to render.
   */
  export type Function = (
      producer: StyleProducer,
      sheet: CSSStyleSheet,
      selector: StypSelector.Normalized,
      properties: StypProperties) => void;

  /**
   * CSS stylesheet render descriptor.
   */
  export interface Descriptor {

    /**
     * Render order.
     *
     * Equals to zero when not specified, which means it will be invoked right before the basic render that renders CSS
     * properties.
     *
     * Renders are chained in order. when render in chain calls `StyleProducer.render()` it actually calls the next
     * render in chain to render properties. Thus it may alter properties, CSS selector, or target stylesheet.
     */
    readonly order?: number;

    /**
     * CSS stylesheet render function.
     */
    readonly render: Function;

  }

}

/**
 * CSS stylesheet render of raw CSS text. Renders the contents of `StypProperties.$$css` property.
 *
 * It should be rendered before CSS properties normally to add the rendered rule as a first one.
 *
 * It is enabled by default in `produceStyle()` function.
 */
export function stypRenderText(
    producer: StyleProducer,
    sheet: CSSStyleSheet,
    selector: StypSelector.Normalized,
    properties: StypProperties) {

  const css = properties.$$css;

  if (css) {
    sheet.insertRule(`${stypSelectorText(selector)}{${css}}`, sheet.cssRules.length);
  }

  producer.render(sheet, selector, properties);
}
