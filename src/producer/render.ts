import { AfterEvent, EventKeeper } from 'fun-events';
import { StypProperties, StypRule } from '../rule';
import { StypSelector } from '../selector';
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
   * CSS rendering options.
   *
   * These are the options passed to `StyleProducer.render()` method.
   */
  export interface Options {

    /**
     * CSS stylesheet or rule to add properties to.
     *
     * When omitted the one from style producer is used.
     */
    target?: CSSStyleSheet | CSSRule;

    /**
     * Normalized CSS selector of the rule to render.
     *
     * When omitted the one from style producer is used.
     */
    selector?: StypSelector.Normalized;

  }

  /**
   * CSS stylesheet render function.
   *
   * It should normally call a `producer.render()` method as the last operation to allow other renders in chain to do
   * their job.
   *
   * @param producer Style producer instance.
   * @param properties CSS properties to render.
   */
  export type Function<This = void> = (this: This, producer: StyleProducer, properties: StypProperties) => void;

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
     * A render or renders this one requires.
     */
    readonly needs?: StypRender | StypRender[];

    /**
     * CSS stylesheet render function.
     */
    readonly render: Function<this>;

  }

  /**
   * CSS stylesheet render factory.
   */
  export interface Factory {

    /**
     * Render order.
     *
     * Equals to zero when not specified, which means it will be invoked right before the basic render that renders CSS
     * properties.
     */
    readonly order?: number;

    /**
     * A render or renders this one requires.
     */
    readonly needs?: StypRender | StypRender[];

    /**
     * Creates CSS stylesheet render function.
     *
     * This is called once per rule. The returned render function is used then to render and update a style for the
     * `rule`.
     *
     * @param rule CSS rule to create render for.
     *
     * @returns A render function or specifier to use.
     */
    create(rule: StypRule): Function | Spec;

  }

  /**
   * CSS stylesheet render specifier.
   */
  export interface Spec {

    /**
     * CSS stylesheet render function.
     */
    render: Function<this>;

    /**
     * Reads or converts CSS properties from the rule.
     *
     * The style producer will receive the CSS properties from the returned event keeper.
     *
     * When omitted the original properties will be used instead.
     *
     * @param properties `AfterEvent` registrar of CSS rule properties receivers. This is either the one from CSS rule,
     * or the one returned from previous render factory in render chain.
     *
     * @returns CSS properties event keeper.
     */
    read?: (this: this, properties: AfterEvent<[StypProperties]>) => EventKeeper<[StypProperties]>;

  }

}
