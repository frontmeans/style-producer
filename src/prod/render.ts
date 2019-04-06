import { StypSelector, stypSelectorText } from '../selector';
import { StypProperties, StypRuleList, StypRules } from '../rule';
import { StyleProducer } from './style-producer';

/**
 * CSS stylesheet render interface.
 *
 * A render may be supplied to style producer to perform additional rendering tasks. E.g. to render raw CSS text,
 * or add media queries support.
 *
 * Renders are chained in order. When render calls `StyleProducer.render()` method it actually calls the next
 * render in chain to render properties. Thus it may alter properties, CSS selector, or target stylesheet.
 *
 * Render is either a function, a descriptor object, or render factory.
 */
export type StypRender = StypRender.Function | StypRender.Descriptor | StypRender.Factory;

export namespace StypRender {

  /**
   * CSS stylesheet render function.
   *
   * It should normally call a `producer.render()` method as the last operation to allow other renders in chain to do
   * their job.
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
     */
    readonly order?: number;

    /**
     * CSS stylesheet render function.
     */
    readonly render: Function;

  }

  /**
   * CSS stylesheet render factory.
   */
  export interface Factory {

    /**
     * Creates CSS stylesheet render function.
     *
     * This is called once per `stypRule()` call. The returned render is then.
     *
     * @param rules CSS rules to produce stylesheets for. This is an instance passed to `produceStyle()` function.
     *
     * @returns A render to use.
     */
    create(rules: StypRules): StypRender;

  }

}
